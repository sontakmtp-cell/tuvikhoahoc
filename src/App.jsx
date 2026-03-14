import React, { useState } from 'react';
import { tuViData } from './data';
import TuViScene from './TuViScene';
import { ThemeProvider } from './ThemeContext';
import ThemeSelector from './ThemeSelector';
import { ComparisonProvider, useComparison } from './ComparisonContext';
import ComparisonUploader from './ComparisonUploader';
import ComparisonScene from './ComparisonScene';
import './comparison.css';

function AppContent({ appData, handleFileUpload, errorMsg }) {
  const { mode } = useComparison();

  return (
    <div className="app-root" style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {mode === 'single' && (
        <>
          <div className="upload-container" style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
            <label htmlFor="file-upload" className="upload-btn">
              Tải dữ liệu lên (.json)
            </label>
            <input 
              id="file-upload" 
              type="file" 
              accept=".json" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }}
            />
            {errorMsg && <div className="error-msg">{errorMsg}</div>}
          </div>
          <ThemeSelector />
          <TuViScene data={appData} />
          <ComparisonUploader />
        </>
      )}
      {mode === 'comparison' && (
        <ComparisonScene />
      )}
    </div>
  );
}

function App() {
  const [appData, setAppData] = useState(tuViData);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (Array.isArray(json) && json.length === 12) {
          setAppData(json);
          setErrorMsg("");
        } else {
          setErrorMsg("Định dạng JSON không hợp lệ. Hệ thống cần mảng chứa đủ 12 cung Tử Vi.");
        }
      } catch (err) {
        setErrorMsg("Lỗi đọc file JSON: " + err.message);
      }
    };
    reader.readAsText(file);
    
    // Reset file input so user can re-upload the same file if needed
    event.target.value = null;
  };

  return (
    <ThemeProvider>
      <ComparisonProvider>
        <AppContent appData={appData} handleFileUpload={handleFileUpload} errorMsg={errorMsg} />
      </ComparisonProvider>
    </ThemeProvider>
  );
}

export default App;
