from flask import Flask, render_template, request, redirect, url_for
from ultralytics import YOLO
import os
import uuid
import cv2

app = Flask(__name__)
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Load the selected YOLOv8n model once when the worker starts.
model = YOLO(os.environ.get('MODEL_PATH', 'yolov8n.pt'))

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/detect', methods=['POST'])
def detect():
    files = request.files.getlist('images') or request.files.getlist('image')
    files = [file for file in files if file and file.filename]
    if not files:
        return redirect(url_for('index'))

    if any(not allowed_file(file.filename) for file in files):
        return redirect(url_for('index'))

    detections = []
    uploaded_images = []
    for file in files:
        filename = f"{uuid.uuid4().hex}.jpg"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        results = model.predict(source=filepath, save=False, conf=0.25, verbose=False)
        detection_result = results[0]
        result_img = detection_result.plot()

        if detection_result.boxes is not None:
            for class_id, confidence in zip(
                detection_result.boxes.cls.tolist(), detection_result.boxes.conf.tolist()
            ):
                label = model.names[int(class_id)]
                detections.append({
                    'label': label,
                    'confidence': round(float(confidence) * 100, 1),
                })

        result_filename = 'result_' + filename
        result_path = os.path.join(UPLOAD_FOLDER, result_filename)
        cv2.imwrite(result_path, result_img)
        uploaded_images.append({
            'input_image': filename,
            'result_image': result_filename,
        })

    detections.sort(key=lambda item: item['confidence'], reverse=True)
    class_counts = {}
    for detection in detections:
        class_counts[detection['label']] = class_counts.get(detection['label'], 0) + 1

    first_image = uploaded_images[0]
    return render_template('result.html',
                           input_image=first_image['input_image'],
                           result_image=first_image['result_image'],
                           uploaded_images=uploaded_images,
                           detections=detections,
                           class_counts=class_counts,
                           detection_count=len(detections))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)
