import React, { useEffect, useMemo, useRef, useState } from 'react';
import CompatibilityRadar from './CompatibilityRadar';
import DualChartScene from './DualChartScene';
import PalaceComparisonCard from './PalaceComparisonCard';

const TABS = [
  { id: 'overview', label: 'Tổng Quan' },
  { id: 'details', label: 'Chi Tiết Cung' },
  { id: 'radar', label: 'Radar' },
  { id: 'scene3d', label: '3D View' },
];

function useAnimatedValue(target) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frameId;
    let start;
    const durationMs = 700;

    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / durationMs, 1);
      const eased = 1 - ((1 - progress) ** 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frameId = requestAnimationFrame(step);
    }

    frameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameId);
  }, [target]);

  return value;
}

function getHighlights(comparisons) {
  const ordered = [...comparisons].sort((a, b) => b.pairScore - a.pairScore);
  return {
    strengths: ordered.slice(0, 3),
    risks: ordered.slice(-3).reverse(),
  };
}

export default function CompatibilityReport({ result }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const animatedPercent = useAnimatedValue(result.overall.percentage);
  const reportRef = useRef(null);
  const { strengths, risks } = useMemo(
    () => getHighlights(result.comparisons),
    [result.comparisons],
  );
  const warningItems = result.warnings || [];

  const triggerDownload = (dataUrl, fileName) => {
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const captureReportCanvas = async () => {
    if (!reportRef.current) throw new Error('Không tìm thấy vùng báo cáo để export.');
    const html2canvasModule = await import('html2canvas');
    const html2canvas = html2canvasModule.default;
    return html2canvas(reportRef.current, {
      backgroundColor: '#06142f',
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: reportRef.current.scrollWidth,
      windowHeight: reportRef.current.scrollHeight,
    });
  };

  const handleExportPng = async () => {
    if (isExporting) return;
    try {
      setExportError('');
      setIsExporting(true);
      const canvas = await captureReportCanvas();
      triggerDownload(canvas.toDataURL('image/png'), `compatibility-${result.mode}-${Date.now()}.png`);
    } catch (error) {
      setExportError(error?.message || 'Không thể export ảnh. Hãy thử tab khác rồi xuất lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (isExporting) return;
    try {
      setExportError('');
      setIsExporting(true);
      const canvas = await captureReportCanvas();
      const { jsPDF } = await import('jspdf');
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 6;
      const usableWidth = pageWidth - (margin * 2);
      const usableHeight = pageHeight - (margin * 2);
      const imgHeight = (canvas.height * usableWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight, undefined, 'FAST');
      heightLeft -= usableHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight, undefined, 'FAST');
        heightLeft -= usableHeight;
      }

      pdf.save(`compatibility-${result.mode}-${Date.now()}.pdf`);
    } catch (error) {
      setExportError(error?.message || 'Không thể export PDF. Hãy thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="compat-report" ref={reportRef}>
      <header className="report-header">
        <div className="report-score-block">
          <p className="report-mode">{result.modeLabel}</p>
          <h3>
            {animatedPercent}% <span>{result.overall.level}</span>
          </h3>
          <p className="compat-muted">
            Điểm gốc {result.overall.rawScore.toFixed(2)} • {result.overall.emoji}
          </p>
        </div>
        <div className="report-meter">
          <div className="report-meter-fill" style={{ width: `${animatedPercent}%` }} />
        </div>
      </header>

      <div className="report-actions">
        <button type="button" className="report-action-btn" disabled={isExporting} onClick={handleExportPng}>
          {isExporting ? 'Đang xử lý...' : 'Tải ảnh PNG'}
        </button>
        <button type="button" className="report-action-btn" disabled={isExporting} onClick={handleExportPdf}>
          {isExporting ? 'Đang xử lý...' : 'Tải PDF'}
        </button>
      </div>
      {exportError && <p className="report-export-error">{exportError}</p>}

      <nav className="report-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`report-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="report-content">
        {activeTab === 'overview' && (
          <section className="report-overview fade-in">
            <p className="compat-summary-text">{result.summary}</p>
            {warningItems.length > 0 && (
              <article className="report-warning-box">
                <h4>Cảnh báo dữ liệu ({warningItems.length})</h4>
                {warningItems.slice(0, 6).map((warning, idx) => (
                  <p key={`${warning}-${idx}`}>{warning}</p>
                ))}
                {warningItems.length > 6 && <p>...và {warningItems.length - 6} cảnh báo khác.</p>}
              </article>
            )}

            <div className="overview-grid">
              <article className="overview-box strengths">
                <h4>Điểm mạnh</h4>
                {strengths.map((item) => (
                  <p key={`good-${item.comparisonId}`}>
                    {item.palaceA.name} ↔ {item.palaceB.name}: {item.pairScore.toFixed(1)}
                  </p>
                ))}
              </article>
              <article className="overview-box risks">
                <h4>Điểm cần lưu ý</h4>
                {risks.map((item) => (
                  <p key={`risk-${item.comparisonId}`}>
                    {item.palaceA.name} ↔ {item.palaceB.name}: {item.pairScore.toFixed(1)}
                  </p>
                ))}
              </article>
            </div>
            {result.diagnostics && (
              <p className="compat-muted">
                Chuẩn đoán: {result.diagnostics.comparisonsWithIssues} cặp có vấn đề dữ liệu •
                {' '}Hành không nhận dạng: {result.diagnostics.unknownElementComparisons} •
                {' '}Cung thiếu sao: {result.diagnostics.emptyStarComparisons}
              </p>
            )}
          </section>
        )}

        {activeTab === 'details' && (
          <section className="compat-pair-list fade-in">
            {result.comparisons.map((item) => (
              <PalaceComparisonCard key={item.comparisonId} item={item} />
            ))}
          </section>
        )}

        {activeTab === 'radar' && (
          <section className="fade-in">
            <CompatibilityRadar comparisons={result.comparisons} />
          </section>
        )}

        {activeTab === 'scene3d' && (
          <section className="fade-in">
            <DualChartScene result={result} />
          </section>
        )}
      </div>
    </section>
  );
}
