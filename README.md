# 🌊 Flotect –Floating Trash Detection & Classification using YOLOv8

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Framework](https://img.shields.io/badge/Framework-Flask-red.svg)](https://flask.palletsprojects.com/)
[![Model](https://img.shields.io/badge/Model-YOLOv8-green.svg)](https://github.com/ultralytics/ultralytics)

Flotect is an AI-powered web application for detecting and classifying floating waste in waterway images. It uses the selected **YOLOv8n** model with a Flask backend and a responsive dark violet interface. Users can upload one or multiple images, preview them before submission, monitor upload progress, and review annotated detection results with class counts and confidence scores.

***

## ✨ Key Features

* **Four trained classes:** carton, bottle, paper, and plastic.
* **Multi-image upload:** Select or drag in multiple JPG, PNG, or WebP images.
* **Image previews:** Review selected images before running detection.
* **Upload feedback:** Shows upload readiness, progress percentage, and success/failure states.
* **Detection reports:** Displays original images beside YOLOv8n annotated outputs.
* **Confidence analysis:** Reports object totals, per-class counts, and confidence values.
* **Cloud-ready deployment:** Includes Gunicorn, Procfile, and Render configuration.

***

## 🛠️ Tech Stack

* **Programming Language:** Python 3
* **Deep Learning Framework:** Ultralytics YOLOv8
* **Backend Framework:** Flask
* **Computer Vision:** OpenCV
* **Frontend:** HTML, CSS, JavaScript
* **Image Processing:** NumPy
* **Production Server:** Gunicorn

***

## 🚀 Project Workflow

1. The browser accepts one or more field images and creates local previews.
2. Flask receives each image through the multipart `/detect` endpoint.
3. Each upload is assigned a UUID filename and saved to the runtime upload directory.
4. YOLOv8n predicts bounding boxes for the four trained waste classes.
5. OpenCV saves an annotated result for each input image.
6. Flask renders the original/result gallery with counts and confidence scores.

### Architecture

```text
Browser upload and previews
          |
          v
Flask multipart endpoint (/detect)
          |
          v
UUID storage + YOLOv8n inference
          |
          v
OpenCV annotation and result gallery
```

### Dataset scope

The selected model was trained on 4,515 labeled floating-trash images:

| Class | Images |
| --- | ---: |
| Bottle | 2,550 |
| Carton | 1,056 |
| Plastic | 482 |
| Paper | 427 |

YOLOv8n was selected after training and comparing YOLOv8n, YOLOv8s, YOLOv9c, and YOLOv9s for this application.

***

## 📂 Project Structure

```text
Floating-Trash-Detection-and-Classification/
│
├── static/
│   ├── uploads/
│   └── styles.css
│
├── templates/
│   ├── index.html
│   └── result.html
│
├── app.py
├── requirements.txt
├── yolov8n.pt
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
- ☁️ Cloud deployment with analytics dashboard.
- 📱 Mobile application integration.
- 🎥 Live CCTV camera support.
- 📊 Detection statistics and reporting dashboard.

***

## 💻 Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/Floating-Trash-Detection-and-Classification.git
cd Floating-Trash-Detection-and-Classification
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run the Application

```bash
python app.py
```

Open your browser and visit:

```
http://127.0.0.1:5000
```

### Production deployment

The repository includes `Procfile` and `render.yaml` for Render deployment. The production start command is:

```bash
gunicorn app:app --workers 1 --threads 2 --timeout 120
```

### Production security baseline

The public upload endpoint includes:

- `16 MB` maximum request size.
- Maximum of 8 images per request.
- JPG, JPEG, PNG, and WebP extension checks plus OpenCV content validation.
- UUID-generated server filenames instead of user-provided paths.
- Detection throttling at 10 requests per minute per client.
- `nosniff`, clickjacking, referrer, and permissions security headers.
- Debug mode disabled in the production entry point.

The limiter currently uses in-process memory for the single-worker Render service. If the service is scaled to multiple instances, configure a shared Redis storage backend for consistent rate limits.

***

## 📸 Output

- Upload one or multiple images containing a water body.
- Preview the selected files and monitor upload progress.
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
