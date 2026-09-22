import base64
import io
import os
from collections import Counter
from pathlib import Path
from typing import Annotated

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
from ultralytics import YOLO


MAX_FILES_PER_REQUEST = 8
MAX_IMAGE_DIMENSION = 2048
MAX_FILE_SIZE = 16 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}

app = FastAPI(title="Flotect API", version="1.0.0")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
allowed_origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", frontend_url).split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

default_model_path = Path(__file__).resolve().parent / "yolov8n.pt"
model = YOLO(os.getenv("MODEL_PATH", str(default_model_path)))


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    return response


def image_data_url(image: np.ndarray) -> str:
    success, encoded = cv2.imencode(".jpg", image, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    if not success:
        raise HTTPException(status_code=500, detail="Could not encode the detection image.")
    value = base64.b64encode(encoded.tobytes()).decode("ascii")
    return f"data:image/jpeg;base64,{value}"


def prepare_image(raw: bytes) -> np.ndarray:
    try:
        image = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="One or more files are not valid images.") from exc

    image_array = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    height, width = image_array.shape[:2]
    largest_dimension = max(height, width)
    if largest_dimension > MAX_IMAGE_DIMENSION:
        scale = MAX_IMAGE_DIMENSION / largest_dimension
        image_array = cv2.resize(image_array, (round(width * scale), round(height * scale)))
    return image_array


@app.get("/")
def root():
    return {"name": "Flotect API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/detect")
async def detect(images: Annotated[list[UploadFile], File(...)]) -> JSONResponse:
    if not images:
        raise HTTPException(status_code=400, detail="Upload at least one image.")
    if len(images) > MAX_FILES_PER_REQUEST:
        raise HTTPException(status_code=400, detail="Please upload no more than 8 images at a time.")

    reports = []
    all_detections = []
    for upload in images:
        if upload.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(status_code=400, detail="Use JPG, PNG, or WebP images only.")
        raw = await upload.read()
        if len(raw) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="Each image must be smaller than 16 MB.")

        image = prepare_image(raw)
        try:
            result = model.predict(source=image, save=False, conf=0.25, verbose=False)[0]
        except Exception as exc:
            raise HTTPException(status_code=500, detail="Detection failed while processing the image.") from exc

        detections = []
        if result.boxes is not None:
            for class_id, confidence in zip(result.boxes.cls.tolist(), result.boxes.conf.tolist()):
                detection = {
                    "label": model.names[int(class_id)],
                    "confidence": round(float(confidence) * 100, 1),
                }
                detections.append(detection)
                all_detections.append(detection)

        reports.append({
            "filename": upload.filename or "image",
            "input_image": image_data_url(image),
            "result_image": image_data_url(result.plot()),
            "detections": sorted(detections, key=lambda item: item["confidence"], reverse=True),
        })

    counts = Counter(detection["label"] for detection in all_detections)
    return JSONResponse({
        "images": reports,
        "detections": sorted(all_detections, key=lambda item: item["confidence"], reverse=True),
        "class_counts": dict(counts),
        "detection_count": len(all_detections),
    })