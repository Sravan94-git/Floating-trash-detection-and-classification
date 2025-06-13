from flask import Flask, render_template, request, redirect, url_for
from ultralytics import YOLO
import os
import uuid
import cv2

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load YOLOv8n model
model = YOLO('yolov8n.pt')

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return redirect(url_for('index'))

    file = request.files['image']
    if file.filename == '':
        return redirect(url_for('index'))

    # Save uploaded image
    filename = f"{uuid.uuid4().hex}.jpg"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Run YOLO detection
    results = model.predict(source=filepath, save=False)
    result_img = results[0].plot()

    # Save the detection result
    result_filename = 'result_' + filename
    result_path = os.path.join(UPLOAD_FOLDER, result_filename)
    cv2.imwrite(result_path, result_img)

    # Pass both input and result image to the result page
    return render_template('result.html',
                           input_image=filename,
                           result_image=result_filename)

if __name__ == '__main__':
    app.run(debug=True)
