import React, { Suspense, lazy, useState } from 'react';
import { tuViData } from './data';
import TuViScene from './TuViScene';
import { ThemeProvider } from './ThemeContext';
import ThemeSelector from './ThemeSelector';
import { validateChartJson } from './shared/jsonValidator';

const CompatibilityPage = lazy(() => import('./compatibility/CompatibilityPage'));

function App() {
  const [appData, setAppData] = useState(tuViData);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadInfo, setUploadInfo] = useState('');
  const [viewMode, setViewMode] = useState('single');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = validateChartJson(e.target.result);
      if (result.valid) {
        setAppData(result.data);
        setErrorMsg('');
        setUploadInfo(`Đã tải thành công: ${file.name}`);
      } else {
        setUploadInfo('');
        setErrorMsg(result.errors.join(' '));
      }
    };
    reader.onerror = () => {
      setUploadInfo('');
      setErrorMsg('Không thể đọc file JSON.');
    };
    reader.readAsText(file);

    // Reset file input so user can re-upload the same file if needed
    event.target.value = null;
  };

  return (
    <ThemeProvider>
      <div className="app-shell">
        <div className="view-switch">
          <button
            type="button"
            className={`view-tab ${viewMode === 'single' ? 'active' : ''}`}
            onClick={() => setViewMode('single')}
          >
            Xem Lá Số
          </button>
          <button
            type="button"
            className={`view-tab ${viewMode === 'compare' ? 'active' : ''}`}
            onClick={() => setViewMode('compare')}
          >
            So Sánh ★
          </button>
        </div>

        {viewMode === 'single' ? (
          <>
            <div className="upload-container single-upload-container">
              <label htmlFor="file-upload" className="upload-btn">
                Tải dữ liệu lên (.json)
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
              />
              {uploadInfo && <div className="success-msg">{uploadInfo}</div>}
              {errorMsg && <div className="error-msg">{errorMsg}</div>}
            </div>
            <TuViScene data={appData} />
          </>
        ) : (
          <Suspense fallback={<div className="compat-loading">Đang tải chế độ so sánh...</div>}>
            <CompatibilityPage />
          </Suspense>
        )}

        <ThemeSelector />
      </div>
    </ThemeProvider>
  );
}

export default App;
