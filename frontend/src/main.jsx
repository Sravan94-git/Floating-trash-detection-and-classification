import { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './styles.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const MAX_FILES = 8;
const MAX_SIZE = 16 * 1024 * 1024;
const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

function App() {
  const [apiReady, setApiReady] = useState(false);
  const [files, setFiles] = useState([]);
  const [report, setReport] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState('');
  const [confidence, setConfidence] = useState(0.25);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let active = true;
    let retryTimer;

    async function checkApi() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const response = await fetch(`${API_URL}/health`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (response.ok && active) {
          setApiReady(true);
        } else {
          throw new Error('Not ready');
        }
      } catch (e) {
        if (active) {
          setApiReady(false);
          retryTimer = setTimeout(checkApi, 2500);
        }
      }
    }
    
    checkApi();
    return () => {
      active = false;
      clearTimeout(retryTimer);
    };
  }, []);

  const handleFiles = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    
    if (fileArray.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} images allowed.`);
      return;
    }
    
    const invalid = fileArray.find(f => !validTypes.includes(f.type) || f.size > MAX_SIZE);
    if (invalid) {
      setError('Please use JPG, PNG, or WebP under 16MB.');
      return;
    }
    
    setError('');
    // Convert to objects with preview URLs and original files
    const newFiles = fileArray.map(f => ({
      file: f,
      preview: URL.createObjectURL(f)
    }));
    setFiles(newFiles);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => {
    setDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const detect = () => {
    if (!files.length) return;
    
    setLoading(true);
    setProgressPercent(15);
    setError('');
    
    const formData = new FormData();
    files.forEach(f => formData.append('images', f.file));
    formData.append('confidence', confidence);
    
    const request = new XMLHttpRequest();
    request.open('POST', `${API_URL}/api/detect`);
    
    // Smooth progress progression while YOLO model runs inference
    const ticker = setInterval(() => {
      setProgressPercent(prev => {
        if (prev < 88) {
          return prev + Math.floor(Math.random() * 6) + 3;
        }
        if (prev < 96) {
          return prev + 1;
        }
        return prev;
      });
    }, 200);
    
    request.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const uploadPct = Math.round((e.loaded / e.total) * 50);
        setProgressPercent(p => Math.max(p, uploadPct));
      }
    };
    
    request.onload = () => {
      clearInterval(ticker);
      setProgressPercent(100);
      
      setTimeout(() => {
        setLoading(false);
        setProgressPercent(0);
        let payload;
        try {
          payload = JSON.parse(request.responseText);
        } catch {
          payload = {};
        }
        
        if (request.status >= 200 && request.status < 300) {
          setReport(payload);
        } else {
          setError(payload.detail || 'Analysis failed. Please try again.');
        }
      }, 300);
    };
    
    request.onerror = () => {
      clearInterval(ticker);
      setLoading(false);
      setProgressPercent(0);
      setError('Network error. Could not connect to the analysis server.');
      setApiReady(false);
    };
    
    request.send(formData);
  };

  const reset = () => {
    setReport(null);
    setFiles([]);
    setLoading(false);
    setProgressPercent(0);
    setError('');
  };

  const exportPDF = async () => {
    const el = document.getElementById('report-content');
    if (!el) return;
    
    // Set exporting state to temporarily hide things or add loading if needed
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Flotect_Detection_Report.pdf');
    } catch (err) {
      console.error('Error generating PDF', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const exportCSV = () => {
    if (!report) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Filename,Detected Object,Confidence (%)\n";
    
    report.images.forEach(img => {
      if (img.detections.length === 0) {
        csvContent += `${img.filename},None,0\n`;
      } else {
        img.detections.forEach(det => {
          csvContent += `${img.filename},${det.label},${det.confidence}\n`;
        });
      }
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Flotect_Data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <div className="logo-icon">F</div>
          Flotect
        </div>
      </header>

      {/* Minimal Loading Screen Overlay */}
      {!apiReady && (
        <div className="minimal-loading-overlay">
          <div className="minimal-loading-content">
            <div className="minimal-spinner"></div>
            <div className="loading-title">Loading</div>
            <div className="loading-subtitle">Connecting to backend</div>
          </div>
        </div>
      )}

          {!report ? (
        <main>
          <div className="hero-section">
            <h1>Waterway waste <span>intelligence</span></h1>
            <p>Upload field images to automatically detect, classify, and count floating debris using our optimized YOLOv8 model.</p>
          </div>
          
          <div className="upload-card">
            {/* 1. Upload Images at Top */}
            <div 
              className={`dropzone ${dragging ? 'active' : ''}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <svg className="dropzone-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <h3>Click or drag images here</h3>
              <p>Supports JPG, PNG, WebP up to 16MB</p>
              <input 
                type="file" 
                className="file-input" 
                ref={fileInputRef} 
                onChange={(e) => handleFiles(e.target.files)} 
                multiple 
                accept="image/jpeg,image/png,image/webp" 
              />
            </div>

            {/* 2. Confidence Threshold Below Upload */}
            <div className="controls-panel">
              <div className="slider-group">
                <label>Confidence Threshold:</label>
                <input 
                  type="range" 
                  min="0.05" 
                  max="0.95" 
                  step="0.05" 
                  value={confidence} 
                  onChange={(e) => setConfidence(parseFloat(e.target.value))} 
                />
                <span className="slider-value">{Math.round(confidence * 100)}%</span>
              </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            {/* 3. Image Previews & Analyze */}
            {files.length > 0 && (
              <div className="preview-container">
                <div className="preview-grid">
                  {files.map((fileObj, i) => (
                    <div key={i} className="preview-item">
                      <img src={fileObj.preview} alt="preview" />
                      <button 
                        className="remove-img-btn" 
                        title="Remove image"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFiles(files.filter((_, idx) => idx !== i));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="btn-primary" 
                  onClick={detect} 
                  disabled={!apiReady || loading}
                >
                  {loading ? 'Analyzing Images...' : `Analyze ${files.length} Image${files.length !== 1 ? 's' : ''}`}
                </button>

                {/* Loading percentage displayed below when analyzing */}
                {loading && (
                  <div className="analysis-progress-wrapper">
                    <div className="analysis-progress-bar">
                      <div className="analysis-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <div className="analysis-progress-info">
                      <span className="analysis-progress-label">
                        {progressPercent < 100 ? 'Analyzing debris with YOLOv8...' : 'Complete! Preparing results...'}
                      </span>
                      <span className="analysis-progress-percentage">{progressPercent}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <section className="architecture-section">
            <div className="section-header">
              <h2>System Architecture</h2>
              <p>From Kaggle datasets to real-time waterway intelligence</p>
            </div>
            <div className="architecture-grid">
              
              <div className="arch-card">
                <div className="arch-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h4>Data & Training</h4>
                <p>Dataset sourced from Kaggle and used to fine-tune a YOLO model for floating debris detection.</p>
              </div>

              <div className="arch-connector">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>

              <div className="arch-card">
                <div className="arch-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <h4>API Backend</h4>
                <p>A secure FastAPI server wraps the trained model, handling validation and inference requests.</p>
              </div>
              
              <div className="arch-connector">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              
              <div className="arch-card">
                <div className="arch-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4>Client Interface</h4>
                <p>A fast React application provides image cropping, dynamic confidence filtering, and reports.</p>
              </div>

            </div>
          </section>
        </main>
      ) : (
        <main className="results-view">
          <div className="results-header">
            <h2>Analysis Report</h2>
            <div className="header-actions">
              <button className="btn-secondary" onClick={exportCSV}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              <button className="btn-secondary" onClick={exportPDF}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export PDF
              </button>
              <button className="btn-secondary" onClick={reset}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                New Analysis
              </button>
            </div>
          </div>
          
          <div className="results-grid" id="report-content" style={{ padding: '20px', background: 'var(--bg-color)', borderRadius: 'var(--radius-lg)' }}>
            <div className="image-results">
              {report.images.map((img, idx) => (
                <div key={idx} className="result-card">
                  <div className="result-images">
                    <div className="result-image-wrapper">
                      <div className="result-label">Original</div>
                      <img src={img.input_image} alt="Original" />
                    </div>
                    <div className="result-image-wrapper">
                      <div className="result-label">Detected</div>
                      <img src={img.result_image} alt="Detected" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <aside className="summary-panel">
              <h3>Detection Summary</h3>
              <div className="stat-box">
                <div className="stat-value">{report.detection_count}</div>
                <div className="stat-label">Total Objects</div>
              </div>
              
              {report.detection_count > 0 ? (
                <div className="breakdown-list">
                  {Object.entries(report.class_counts).map(([label, count]) => (
                    <div key={label} className="breakdown-item">
                      <span className="item-name">{label}</span>
                      <span className="item-count">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ margin: '0 auto', color: '#cbd5e1' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No supported debris detected in these images.</p>
                </div>
              )}
            </aside>
          </div>
        </main>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
