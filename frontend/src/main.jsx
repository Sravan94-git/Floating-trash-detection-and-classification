import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const MAX_FILES = 8;
const MAX_SIZE = 16 * 1024 * 1024;
const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

function App() {
  const [files, setFiles] = useState([]);
  const [report, setReport] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState('Your image stays in this analysis session');
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  function selectFiles(nextFiles) {
    const selected = Array.from(nextFiles);
    if (selected.length > MAX_FILES) {
      setError(`Please select no more than ${MAX_FILES} images.`);
      return;
    }
    const invalid = selected.find((file) => !validTypes.includes(file.type) || file.size > MAX_SIZE);
    if (invalid) {
      setError('Use JPG, PNG, or WebP files under 16 MB each.');
      setFiles([]);
      return;
    }
    setError('');
    setReport(null);
    setFiles(selected);
    setStatus(`${selected.length} image${selected.length === 1 ? '' : 's'} ready to upload`);
  }

  function detect() {
    if (!files.length) return;
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const request = new XMLHttpRequest();
    request.open('POST', `${API_URL}/api/detect`);
    request.timeout = 180000;
    setProgress({ percent: 0, message: 'Uploading image' });
    setError('');
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) setProgress({ percent: Math.round((event.loaded / event.total) * 100), message: 'Uploading image' });
    };
    request.onload = () => {
      let payload;
      try { payload = JSON.parse(request.responseText); } catch { payload = {}; }
      if (request.status >= 200 && request.status < 300) {
        setProgress({ percent: 100, message: 'Analysis complete' });
        setReport(payload);
        setStatus('Analysis ready to review');
      } else {
        setError(payload.detail || 'Detection failed. Please try again.');
        setProgress(null);
      }
    };
    request.onerror = () => { setError('Could not reach the detection API. Check VITE_API_URL.'); setProgress(null); };
    request.ontimeout = () => { setError('The analysis timed out. Please try a smaller image.'); setProgress(null); };
    request.send(formData);
  }

  if (report) return <Report report={report} onReset={() => { setReport(null); setFiles([]); setProgress(null); setStatus('Your image stays in this analysis session'); }} />;

  return <>
    <header className="topbar shell"><div className="brand"><span className="brand-mark">F</span><span>FLOTECT<small>FIELD LAB</small></span></div><span className="status"><i /> API READY</span></header>
    <main>
      <section className="hero shell">
        <div className="hero-copy"><p className="eyebrow">01 / Visual field intelligence</p><h1>Turn a waterway<br /><em>into data.</em></h1><p className="intro">Flotect turns one image into a readable waste map. Upload a field frame and inspect what the YOLOv8n model can see.</p><div className="hero-note"><span className="note-line" />Fast, focused, four-class detection</div></div>
        <section className="upload-panel">
          <div className="upload-heading"><span className="step">01</span><div><p className="eyebrow">Start an analysis</p><h2>Bring in a field image</h2><p className="panel-copy">JPG or PNG · up to 16 MB · 8 images max</p></div></div>
          <label className={`dropzone ${dragging ? 'is-dragging' : ''} ${files.length ? 'has-file' : ''}`} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); selectFiles(event.dataTransfer.files); }}>
            <span className="upload-icon">↑</span><strong>Browse files or drop here</strong><span className={error ? 'invalid' : ''}>{error || status}</span><input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => selectFiles(event.target.files)} />
          </label>
          {files.length > 0 && <div className="preview-grid">{files.map((file) => <div className="preview-item" key={`${file.name}-${file.lastModified}`}><img src={URL.createObjectURL(file)} alt={`Preview of ${file.name}`} /><span>{file.name}</span></div>)}</div>}
          {progress && <div className="upload-progress"><div className="progress-heading"><span>{progress.message}</span><strong>{progress.percent}%</strong></div><div className="progress-track"><span style={{ width: `${progress.percent}%` }} /></div></div>}
          <button className="primary-button" disabled={!files.length || progress} onClick={detect}><span>{progress ? 'Analyzing...' : 'Analyze image'}</span><span aria-hidden="true">→</span></button>
        </section>
      </section>
      <section className="methodology shell"><div className="section-heading"><p className="eyebrow">02 / System map</p><h2>How the signal moves</h2><p>Three connected stages carry an image from the browser to an interpretable detection report.</p></div><div className="architecture-flow"><Step number="01" title="Capture" text="React accepts a JPG or PNG from the field and sends a temporary working copy." /><div className="flow-connector">pass</div><Step number="02" title="Interpret" text="Selected YOLOv8n runs object detection against four trained waste classes" active /><div className="flow-connector">pass</div><Step number="03" title="Report" text="Bounding boxes, class totals, and confidence scores return as one visual report." /></div></section>
      <section className="supported shell"><div><p className="eyebrow">03 / Model scope</p><h2>Four signals.<br /><em>One clear read.</em></h2></div><div className="supported-list">{['Carton', 'Bottle', 'Paper', 'Plastic'].map((label, index) => <div key={label}><b>0{index + 1}</b><span>{label}</span><small>Supported detection class</small></div>)}</div></section>
    </main><footer className="shell footer"><span>FLOTECT / floating trash intelligence</span><span>FastAPI + YOLOv8n</span></footer>
  </>;
}

function Step({ number, title, text, active }) { return <article className={`flow-step ${active ? 'active' : ''}`}><div className="flow-top"><span className="card-number">{number}</span><span className="flow-icon">✦</span></div><h3>{title}</h3><p>{text}</p><div className="flow-meta">{active ? 'ENGINE / YOLOV8N' : 'INPUT / IMAGE'}</div></article>; }

function Report({ report, onReset }) {
  return <><header className="topbar shell"><div className="brand"><span className="brand-mark">F</span><span>FLOTECT<small>FIELD LAB</small></span></div><span className="status"><i /> ANALYSIS COMPLETE</span></header><main className="results-page shell"><div className="result-title"><div><p className="eyebrow">Detection report</p><h1>What Flotect found</h1></div><button className="secondary-button" onClick={onReset}>← New analysis</button></div><section className="result-layout"><div className="visuals">{report.images.map((image, index) => <div className="image-pair" key={`${image.filename}-${index}`}><figure className="image-card"><figcaption><span>Input {index + 1}</span><small>Original upload</small></figcaption><img src={image.input_image} alt={`Uploaded waterway image ${index + 1}`} /></figure><figure className="image-card featured"><figcaption><span>Result {index + 1}</span><small>YOLOv8n output</small></figcaption><img src={image.result_image} alt={`Annotated detection image ${index + 1}`} /></figure></div>)}</div><aside className="report-panel"><div className="metric"><span>Objects detected</span><strong>{report.detection_count}</strong></div><div className="report-divider" /><p className="eyebrow">Category breakdown</p>{report.detection_count ? <><div className="breakdown">{Object.entries(report.class_counts).map(([label, count]) => <div key={label}><span className="dot" /><span>{label}</span><strong>{count}</strong></div>)}</div><div className="report-divider" /><p className="eyebrow">Confidence log</p><div className="confidence-list">{report.detections.map((detection, index) => <div key={`${detection.label}-${index}`}><span>{detection.label}</span><span>{detection.confidence}%</span></div>)}</div></> : <div className="empty-state"><strong>No supported waste detected</strong><p>Try a clearer image with more visible floating material.</p></div>}<p className="scope-note">This model recognizes carton, bottle, paper, and plastic only.</p></aside></section></main></>;
}

createRoot(document.getElementById('root')).render(<App />);
