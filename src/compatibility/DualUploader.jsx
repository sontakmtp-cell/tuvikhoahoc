import React, { useEffect, useMemo, useState } from 'react';
import { getChartPreviewName, validateChartJson } from '../shared/jsonValidator';

const INITIAL_SIDE = {
  status: 'idle',
  fileName: '',
  chart: null,
  error: '',
};

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(String(event.target?.result || ''));
    reader.onerror = () => reject(new Error('Không thể đọc file.'));
    reader.readAsText(file);
  });
}

function getStatusLabel(status) {
  switch (status) {
    case 'loading':
      return 'Đang tải...';
    case 'success':
      return 'Tải thành công';
    case 'error':
      return 'Lỗi dữ liệu';
    default:
      return 'Chưa tải';
  }
}

export default function DualUploader({ onStateChange }) {
  const [state, setState] = useState({
    A: { ...INITIAL_SIDE },
    B: { ...INITIAL_SIDE },
  });

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const sideCards = useMemo(() => ([
    { side: 'A', title: 'Lá Số A', inputId: 'compare-file-a' },
    { side: 'B', title: 'Lá Số B', inputId: 'compare-file-b' },
  ]), []);

  const updateSide = (side, patch) => {
    setState((prev) => ({
      ...prev,
      [side]: {
        ...prev[side],
        ...patch,
      },
    }));
  };

  const handleUpload = async (side, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    updateSide(side, {
      status: 'loading',
      fileName: file.name,
      chart: null,
      error: '',
    });

    try {
      const text = await readFileAsText(file);
      const result = validateChartJson(text);
      if (!result.valid) {
        updateSide(side, {
          status: 'error',
          chart: null,
          error: result.errors.join(' '),
        });
      } else {
        updateSide(side, {
          status: 'success',
          chart: result.data,
          error: '',
        });
      }
    } catch (error) {
      updateSide(side, {
        status: 'error',
        chart: null,
        error: error.message || 'Không thể xử lý file.',
      });
    } finally {
      event.target.value = '';
    }
  };

  return (
    <section className="compat-section">
      <h3 className="compat-section-title">1) Upload 2 lá số JSON</h3>
      <div className="dual-uploader-grid">
        {sideCards.map(({ side, title, inputId }) => {
          const sideState = state[side];
          const previewName = sideState.chart
            ? getChartPreviewName(sideState.chart, sideState.fileName)
            : '';

          return (
            <article key={side} className={`dual-upload-card status-${sideState.status}`}>
              <header className="dual-upload-head">
                <h4>{title}</h4>
                <span className={`upload-status status-${sideState.status}`}>
                  {getStatusLabel(sideState.status)}
                </span>
              </header>

              <label className="upload-btn compare-upload-btn" htmlFor={inputId}>
                {sideState.status === 'loading' ? 'Đang đọc file...' : 'Chọn file .json'}
              </label>
              <input
                id={inputId}
                type="file"
                accept=".json,application/json"
                onChange={(event) => handleUpload(side, event)}
              />

              {sideState.fileName && (
                <p className="compat-muted">
                  File: <strong>{sideState.fileName}</strong>
                </p>
              )}
              {previewName && <p className="compat-preview">{previewName}</p>}
              {sideState.error && <p className="error-msg">{sideState.error}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
