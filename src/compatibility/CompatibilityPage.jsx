import React, { useMemo, useState } from 'react';
import DualUploader from './DualUploader';
import ModeSelector from './ModeSelector';
import CompatibilityReport from './CompatibilityReport';
import { findPalaceByName } from '../shared/palaceUtils';
import { calculateCompatibilityMemoized } from './engine/compatibilityEngine';

const MODE_LABELS = {
  romance: 'Tình Duyên',
  business: 'Làm Ăn',
};

function summarizeChart(chart) {
  if (!Array.isArray(chart) || chart.length === 0) return '';
  const menh = findPalaceByName(chart, 'Mệnh');
  if (!menh) return `${chart.length} cung`;
  return `Mệnh ${menh.element || 'N/A'} • ${menh.stars?.length || 0} sao`;
}

export default function CompatibilityPage() {
  const [mode, setMode] = useState('romance');
  const [uploadState, setUploadState] = useState({
    A: { status: 'idle', chart: null },
    B: { status: 'idle', chart: null },
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  const canAnalyze = useMemo(
    () => uploadState.A.status === 'success' && uploadState.B.status === 'success',
    [uploadState],
  );

  const runAnalysis = () => {
    if (!canAnalyze) return;

    try {
      const result = calculateCompatibilityMemoized(uploadState.A.chart, uploadState.B.chart, mode);
      setAnalysisResult(result);
      setAnalysisError('');
      console.log('[compatibility-engine][stage-6]', result);
    } catch (error) {
      setAnalysisResult(null);
      setAnalysisError(error.message || 'Không thể chạy phân tích.');
    }
  };

  return (
    <main className="compat-page">
      <section className="compat-shell">
        <header className="compat-header">
          <h2>So Sánh Tương Hợp</h2>
          <p className="compat-muted">
            Giai đoạn 3: sinh luận giải văn bản cho từng cặp cung và tổng thể theo chế độ đã chọn.
          </p>
        </header>

        <DualUploader onStateChange={setUploadState} />
        <ModeSelector mode={mode} onChange={setMode} />

        <section className={`compat-ready-box ${canAnalyze ? 'is-ready' : 'is-pending'}`}>
          <h3>{canAnalyze ? 'Dữ liệu hợp lệ, sẵn sàng phân tích.' : 'Chưa đủ dữ liệu để phân tích.'}</h3>
          <p>
            Chế độ hiện tại: <strong>{MODE_LABELS[mode]}</strong>
          </p>
          <p className="compat-muted">
            Lá số A: {summarizeChart(uploadState.A.chart) || 'Chưa sẵn sàng'}
          </p>
          <p className="compat-muted">
            Lá số B: {summarizeChart(uploadState.B.chart) || 'Chưa sẵn sàng'}
          </p>
          <button
            type="button"
            className="compat-analyze-btn"
            disabled={!canAnalyze}
            onClick={runAnalysis}
          >
            🔍 Phân Tích
          </button>
          {analysisError && <p className="error-msg">{analysisError}</p>}
        </section>

        {analysisResult && (
          <CompatibilityReport result={analysisResult} />
        )}
      </section>
    </main>
  );
}
