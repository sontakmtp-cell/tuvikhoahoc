import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { computeCompatibility } from './compatibility';

const ComparisonContext = createContext(null);

export function ComparisonProvider({ children }) {
  const [chartA, setChartA] = useState(null);  // planetsData format
  const [chartB, setChartB] = useState(null);
  const [metaA, setMetaA] = useState(null);    // { nguHanh, diaChi, name }
  const [metaB, setMetaB] = useState(null);
  const [mode, setMode] = useState('single');   // 'single' | 'comparison'

  const loadChart = useCallback((which, data, meta) => {
    if (which === 'A') { setChartA(data); setMetaA(meta); }
    else { setChartB(data); setMetaB(meta); }
  }, []);

  // Memoize kết quả tính toán — chỉ re-calculate khi data thay đổi
  const result = useMemo(() => {
    if (!chartA || !chartB || !metaA || !metaB) return null;
    return computeCompatibility(chartA, chartB, metaA, metaB);
  }, [chartA, chartB, metaA, metaB]);

  const enterComparison = useCallback(() => setMode('comparison'), []);
  const exitComparison = useCallback(() => {
    setMode('single');
    setChartB(null);
    setMetaB(null);
  }, []);

  const value = useMemo(() => ({
    chartA, chartB, metaA, metaB,
    result, mode,
    loadChart, enterComparison, exitComparison
  }), [chartA, chartB, metaA, metaB, result, mode, loadChart, enterComparison, exitComparison]);

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
}

export const useComparison = () => useContext(ComparisonContext);
