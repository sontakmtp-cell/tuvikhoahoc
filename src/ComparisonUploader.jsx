import { useCallback, useRef } from 'react';
import { useComparison } from './ComparisonContext';

function FileSlot({ label, which, onLoaded }) {
  const inputRef = useRef(null);

  const handleFile = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        // Expect: { meta: { nguHanh, diaChi, name }, planets: { ...planetsData } }
        if (!json.meta || !json.planets) {
          alert('File JSON phải chứa trường "meta" và "planets"');
          return;
        }
        onLoaded(which, json.planets, json.meta);
      } catch {
        alert('File JSON không hợp lệ!');
      }
    };
    reader.readAsText(file);
  }, [which, onLoaded]);

  return (
    <div className="file-slot">
      <h3>{label}</h3>
      <button onClick={() => inputRef.current?.click()}>
        📂 Chọn File JSON
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  );
}

export default function ComparisonUploader() {
  const { loadChart, chartA, chartB, metaA, metaB, enterComparison } = useComparison();

  return (
    <div className="comparison-uploader">
      <h2>🔮 So Sánh Lá Số Tử Vi</h2>
      <p>Tải lên 2 file JSON lá số để xem độ tương hợp. (Format mới có "meta" và "planets")</p>
      
      <div className="slots-container">
        <FileSlot
          label={metaA ? `✅ ${metaA.name}` : "Lá Số A (Bản thân)"}
          which="A"
          onLoaded={loadChart}
        />
        <div className="vs-divider">VS</div>
        <FileSlot
          label={metaB ? `✅ ${metaB.name}` : "Lá Số B (Đối phương)"}
          which="B"
          onLoaded={loadChart}
        />
      </div>

      {chartA && chartB && (
        <button className="btn-compare" onClick={enterComparison}>
          ⚡ So Sánh Ngay
        </button>
      )}
    </div>
  );
}
