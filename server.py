# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import numpy as np
import cv2
import tensorflow as tf
import subprocess as sp
import os

def get_gpu_memory():
    command = "nvidia-smi --query-gpu=memory.free --format=csv"
    memory_free_info = sp.check_output(command.split()).decode('ascii').split('\n')[:-1][1:]
    memory_free_values = [int(x.split()[0]) for i, x in enumerate(memory_free_info)]
    return memory_free_values

# print(get_gpu_memory())

# Load your trained model
model = tf.keras.models.load_model('efficientnet_model.keras')
# print(get_gpu_memory())


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
print('app initialized')

@app.route('/predict', methods=['POST'])
def predict():
    # Get the image from the request
    file = request.files['image'].read()
    # Convert bytes to numpy array
    nparr = np.frombuffer(file, np.uint8)
    # Decode the image
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img = cv2.resize(img, (224, 224))  # Resize to 224x224
    # img = img / 255.0  # Normalize to [0, 1]
    img = np.expand_dims(img, axis=0)  # Add batch dimension

    # Make prediction
    predictions = model.predict(img)
    return jsonify(predictions.tolist())  # Return predictions as JSON

if __name__ == '__main__':
    app.run(debug=True)
