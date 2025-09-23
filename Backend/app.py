# app.py
"""
Flask server that:
- loads a YOLO model once (best.pt)
- accepts image uploads on /predict
- returns JSON predictions and a base64 annotated image
"""

from flask import Flask, request, jsonify
from flask_cors import CORS

import io
import base64
import numpy as np
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)  # allow cross-origin requests (for dev). In production, restrict origins.

# Optional: limit max upload size (bytes)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB

MODEL_PATH = "C:/Users/shivam/Desktop/Backend/assets/best.pt"
print("Loading model from:", MODEL_PATH)
model = YOLO(MODEL_PATH)          # loads model into memory once at startup
print("Model loaded.")

@app.route("/health", methods=["GET"])
def health():
    """Simple healthcheck endpoint."""
    return jsonify({"status": "ok"})

@app.route("/predict", methods=["POST"])
def predict():
    """
    Expects multipart/form-data with key 'image' (file).
    Returns JSON:
    {
      predictions: [ { xmin, ymin, xmax, ymax, confidence, class_id, class_name }, ... ],
      annotated_image: "data:image/png;base64,...."  # optional
    }
    """
    # 1) Validate request
    if 'image' not in request.files:
        return jsonify({"error": "no image file in request"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "empty filename"}), 400

    # 2) Read bytes and decode to OpenCV image (BGR format)
    file_bytes = file.read()
    npimg = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    if img is None:
        return jsonify({"error": "failed to decode image"}), 400

    # 3) Run model inference
    # You can pass conf=0.25 or imgsz=640 if desired: model(img, conf=0.25, imgsz=640)
    results = model(img)   # results is a list-like; we take results[0]
    r = results[0]

    # 4) Extract bounding boxes, confidences and class IDs
    preds = []
    # r.boxes contains boxes; check length
    try:
        if hasattr(r, "boxes") and len(r.boxes) > 0:
            # xyxy tensor shape (N,4)
            xyxy = r.boxes.xyxy.cpu().numpy()
            confs = r.boxes.conf.cpu().numpy()
            cls_ids = r.boxes.cls.cpu().numpy().astype(int)
            for (x1, y1, x2, y2), conf, cid in zip(xyxy, confs, cls_ids):
                preds.append({
                    "xmin": float(x1),
                    "ymin": float(y1),
                    "xmax": float(x2),
                    "ymax": float(y2),
                    "confidence": float(conf),
                    "class_id": int(cid),
                    "class_name": model.names[int(cid)]
                })
    except Exception as e:
        # in case something unexpected happened
        print("Error parsing boxes:", e)

    # 5) Create annotated image (optional) using ultralytics plotting
    annotated_data = None
    try:
        annotated = r.plot()  # returns an image as numpy array (RGB)
        # convert from RGB to BGR for cv2.imencode
        annotated_bgr = cv2.cvtColor(annotated, cv2.COLOR_RGB2BGR)
        _, im_png = cv2.imencode(".png", annotated_bgr)
        im_b64 = base64.b64encode(im_png.tobytes()).decode("utf-8")
        annotated_data = "data:image/png;base64," + im_b64
    except Exception as e:
        print("Could not create annotated image:", e)
        annotated_data = None

    # 6) Return JSON
    return jsonify({
        "predictions": preds,
        "annotated_image": annotated_data
    })


if __name__ == "__main__":
    # Development server. In production, use gunicorn or a WSGI server.
    app.run(host="0.0.0.0", port=5000, debug=True)
