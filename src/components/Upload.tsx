// src/components/Upload.tsx
import React, { useState, useRef } from 'react';

const BACKEND_URL = 'http://127.0.0.1:5000';  // Flask backend URL

type Prediction = {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  confidence: number;
  class_id: number;
  class_name: string;
};

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [annotatedImage, setAnnotatedImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const naturalSizeRef = useRef({ w: 0, h: 0 });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);

    if (!f) return;

    const img = new Image();
    img.onload = () => {
      naturalSizeRef.current = { w: img.naturalWidth, h: img.naturalHeight };

      // Draw initial image to canvas for preview
      const canvas = canvasRef.current!;
      const maxW = 800;
      const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1;
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = URL.createObjectURL(f);
  };

  const handlePredict = async () => {
    if (!file) return alert('Select an image first');
    setLoading(true);
    const form = new FormData();
    form.append('image', file);

    try {
      const res = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        body: form
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Server error');
      }

      const data = await res.json();
      setPredictions(data.predictions || []);
      setAnnotatedImage(data.annotated_image || '');
      drawBoxesOnCanvas(data.predictions || []);
    } catch (err) {
      console.error(err);
      alert('Prediction failed: ' + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  const drawBoxesOnCanvas = (preds: Prediction[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const scaleX = canvas.width / naturalSizeRef.current.w;
      const scaleY = canvas.height / naturalSizeRef.current.h;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      ctx.lineWidth = Math.max(2, Math.round(canvas.width / 300));
      ctx.strokeStyle = 'lime';
      ctx.fillStyle = 'lime';
      ctx.font = `${Math.max(12, Math.round(canvas.width / 40))}px sans-serif`;

      preds.forEach(p => {
        const x = p.xmin * scaleX;
        const y = p.ymin * scaleY;
        const w = (p.xmax - p.xmin) * scaleX;
        const h = (p.ymax - p.ymin) * scaleY;
        ctx.strokeRect(x, y, w, h);
        const text = `${p.class_name} ${(p.confidence * 100).toFixed(1)}%`;
        ctx.fillText(text, x + 4, y + 16);
      });
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Plant Leaf Disease Detection</h2>

      <input type="file" accept="image/*" onChange={onFileChange} />
      <button onClick={handlePredict} disabled={loading} className="ml-3 px-4 py-2 bg-green-600 text-white rounded">
        {loading ? 'Predicting...' : 'Predict'}
      </button>

      <div className="mt-4">
        <canvas ref={canvasRef} className="border" />
      </div>

      {annotatedImage && (
        <div className="mt-4">
          <h4 className="font-semibold">Annotated image (from server)</h4>
          <img src={annotatedImage} alt="annotated" />
        </div>
      )}

      {predictions.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold">Predictions</h4>
          <pre className="bg-gray-100 p-2 rounded text-sm">{JSON.stringify(predictions, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
