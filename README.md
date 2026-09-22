# 🌊 Flotect - Floating Trash Detection & Classification Using YOLOv8

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Framework](https://img.shields.io/badge/Framework-FastAPI-teal.svg)](https://fastapi.tiangolo.com/)
[![Model](https://img.shields.io/badge/Model-YOLOv8-green.svg)](https://github.com/ultralytics/ultralytics)

Flotect is an AI-powered **FastAPI and React application** for detecting and classifying floating waste in waterway images. It uses the **YOLOv8n** model with a FastAPI inference backend and a responsive React frontend. Users can upload one or multiple images, preview them before submission, and review annotated detection results with class counts and confidence scores.

***

## ✨ Key Features

* **Four trained classes:** carton, bottle, paper, and plastic.
* **Multi-image upload:** Select or drag in multiple JPG, PNG, or WebP images.
* **Image previews:** Review selected images before running detection.
* **Detection reports:** Displays original images beside YOLOv8n annotated outputs.
* **Confidence analysis:** Reports object totals, per-class counts, and confidence values.
* **Interactive API documentation:** FastAPI provides automatic documentation at `/docs`.

***

## 🛠️ Technologies Used

* **Programming Language:** Python 3
* **Deep Learning Framework:** Ultralytics YOLOv8
* **Backend Framework:** FastAPI
* **Frontend:** React and Vite
* **Computer Vision:** OpenCV
* **Image Processing:** Pillow and NumPy
* **API Server:** Uvicorn

***

## 🚀 Project Workflow

1. The browser accepts one or more images and creates local previews.
2. The React frontend sends the images to the FastAPI `/api/detect` endpoint.
3. FastAPI validates and prepares each uploaded image.
4. YOLOv8n predicts bounding boxes for the four trained waste classes.
5. OpenCV generates annotated images and the API returns detection data.
6. The frontend displays the original and annotated images with counts and confidence scores.

### Architecture

```text
React frontend: upload and previews
		  |
		  v
FastAPI endpoint: POST /api/detect
		  |
		  v
Image validation + YOLOv8n inference
		  |
		  v
Annotated results and detection reports
```

### Dataset scope

The selected model recognizes four floating-trash classes:

| Class | Description |
| --- | --- |
| Bottle | Floating bottles |
| Carton | Cartons and cardboard waste |
| Plastic | Floating plastic waste |
| Paper | Floating paper waste |

***

## 📂 Project Structure

```text
Flotect/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── yolov8n.pt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── LICENSE
└── README.md
```

***

## 📊 Applications

- 🌊 River Pollution Monitoring
- 🌍 Marine Debris Detection
- 🛥️ Ocean Cleanup Projects
- ♻️ Smart Waste Management
- 🛰️ Environmental Surveillance
- 📈 Water Pollution Analysis
- 🧪 Research in Computer Vision

***

## 🎯 Future Enhancements

- 📹 Real-time video stream detection.
- 🚁 Drone-based floating trash monitoring.
- 📍 GPS-based pollution mapping.
- 📱 Mobile application integration.
- 🎥 Live CCTV camera support.
- 📊 Detection statistics and reporting dashboard.

***

## 💻 Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/Flotect.git
cd Flotect
```

### Install Backend Dependencies

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Start the Backend

From the repository root:

```powershell
backend\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000
```

The API is available at `http://localhost:8000` and its interactive documentation is available at `http://localhost:8000/docs`.

### Start the Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the frontend URL shown by Vite, usually `http://localhost:5173`.

The API accepts up to 8 JPG, PNG, or WebP images per request, with a maximum size of 16 MB per image.

***

## 📸 Output

- Upload one or multiple images containing a water body.
- Preview the selected files before detection.
- The YOLOv8n model detects floating trash.
- The application displays each original image beside its annotated result.

***

## 📈 Results

- Accurate detection of floating waste using YOLOv8.
- Fast inference suitable for near real-time applications.
- Simple and intuitive web interface.
- Scalable solution for environmental monitoring and smart city initiatives.

***

## 🤝 Contributing

Contributions are welcome!

Feel free to fork the repository, create a feature branch, and submit a pull request.

***

## 📜 License

This project is licensed under the **MIT License**.

***

## 👨‍💻 Author

**Sravan**

If you found this project useful, don't forget to ⭐ the repository!
