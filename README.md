# 🌊 Flotect –Floating Trash Detection & Classification using YOLOv8

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Framework](https://img.shields.io/badge/Framework-Flask-red.svg)](https://flask.palletsprojects.com/)
[![Model](https://img.shields.io/badge/Model-YOLOv8-green.svg)](https://github.com/ultralytics/ultralytics)

This project presents an AI-powered web application for **Floating Trash Detection and Classification** using the **YOLOv8 object detection model**. The system automatically identifies and classifies floating waste from images of rivers, lakes, oceans, and other water bodies, helping environmental organizations monitor pollution efficiently. Built with **Flask** and **OpenCV**, the application provides a simple web interface where users can upload images and instantly receive annotated detection results.

***

## ✨ Key Features

* **YOLOv8 Object Detection:** Utilizes the Ultralytics YOLOv8 model for fast and accurate floating trash detection.
* **Web-Based Interface:** Interactive Flask application for uploading and processing images through a browser.
* **Automatic Trash Classification:** Detects and classifies different categories of floating waste present in water bodies.
* **Real-Time Image Processing:** Generates annotated images with bounding boxes and class labels within seconds.
* **Secure Image Handling:** Uses UUID-based unique filenames to prevent file conflicts during uploads.
* **High Detection Accuracy:** Leverages deep learning-based object detection for reliable environmental monitoring.
* **Easy Deployment:** Lightweight architecture suitable for local execution or cloud deployment.

***

## 🛠️ Tech Stack

* **Programming Language:** Python 3
* **Deep Learning Framework:** Ultralytics YOLOv8
* **Backend Framework:** Flask
* **Computer Vision:** OpenCV
* **Frontend:** HTML, CSS
* **Image Processing:** NumPy
* **Development Environment:** Jupyter Notebook, VS Code

***

## 🚀 Project Workflow

1. User uploads an image through the Flask web interface.
2. The uploaded image is securely stored in the server.
3. YOLOv8 performs object detection on the image.
4. Floating trash objects are identified and classified.
5. Bounding boxes and class labels are drawn on detected objects.
6. The annotated image is saved and displayed alongside the original image.

***

## 📂 Project Structure

```text
Floating-Trash-Detection-and-Classification/
│
├── static/
│   ├── uploads/
│   └── css/
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

### Download YOLOv8 Model

```bash
yolo detect predict model=yolov8n.pt
```

Or download the pretrained model from the Ultralytics repository.

### Run the Application

```bash
python app.py
```

Open your browser and visit:

```
http://127.0.0.1:5000
```

***

## 📸 Output

- Upload an image containing a water body.
- The YOLOv8 model detects floating trash.
- The application displays:
  - Original Image
  - Detected Image with Bounding Boxes and Labels

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

AI | Machine Learning | Deep Learning | Computer Vision | Full Stack Developer

If you found this project useful, don't forget to ⭐ the repository!
