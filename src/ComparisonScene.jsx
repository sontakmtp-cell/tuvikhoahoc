import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import { useComparison } from './ComparisonContext';
import SatelliteStars from './SatelliteStars';
import ComparisonPanel from './ComparisonPanel';
import * as THREE from 'three';

// ---- Khối Cung (dùng lại logic từ TuViScene nhưng tham số hóa) ----
const PalaceSphere = memo(function PalaceSphere({ name, position, color, size = 1.5 }) {
  const meshRef = useRef();
  
  // Không dùng useFrame cho mesh tĩnh → tránh re-render
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
      <Text
        position={[0, size + 0.8, 0]}
        fontSize={0.6}
        color="white"
        anchorX="center"
        anchorY="bottom"
      >
        {name}
      </Text>
    </group>
  );
});

// ---- Dựng 1 "vũ trụ" lá số (tái sử dụng cho A và B) ----
const ChartUniverse = memo(function ChartUniverse({ chartData, offset, color, label }) {
  // offset: [x, y, z] dịch chuyển toàn bộ vũ trụ này sang trái/phải
  
  const palacePositions = useMemo(() => {
    if (!chartData) return [];
    return Object.entries(chartData).map(([name, data]) => ({
      name,
      position: [
        data.position.x + offset[0],
        data.position.y + offset[1],
        data.position.z + offset[2],
      ],
      chinhTinh: data.chinhTinh,
      phuTinh: data.phuTinh,
    }));
  }, [chartData, offset]);

  return (
    <group>
      {/* Label tên lá số */}
      <Text
        position={[offset[0], 30, offset[2]]}
        fontSize={2}
        color={color}
        anchorX="center"
      >
        {label}
      </Text>

      {/* Các cung */}
      {palacePositions.map((palace) => (
        <group key={palace.name}>
          <PalaceSphere
            name={palace.name}
            position={palace.position}
            color={color}
            size={palace.name === "Mệnh" ? 2.5 : 1.5}
          />
          {/* Sao vệ tinh */}
          <SatelliteStars
            stars={[...(palace.chinhTinh || []), ...(palace.phuTinh || [])]}
            center={palace.position}
            baseOrbitRadius={4}
          />
        </group>
      ))}
    </group>
  );
});

// ---- Đường kết nối tương hợp/xung khắc giữa 2 vũ trụ ----
const CrossLinks = memo(function CrossLinks({ chartA, chartB, result, offsetA, offsetB }) {
  const links = useMemo(() => {
    if (!chartA || !chartB || !result) return [];

    const lines = [];
    // Kết nối Mệnh A ↔ Mệnh B
    const posMA = chartA["Mệnh"]?.position;
    const posMB = chartB["Mệnh"]?.position;
    if (posMA && posMB) {
      lines.push({
        start: [posMA.x + offsetA[0], posMA.y + offsetA[1], posMA.z + offsetA[2]],
        end:   [posMB.x + offsetB[0], posMB.y + offsetB[1], posMB.z + offsetB[2]],
        color: result.finalScore >= 60 ? '#00ff88' : '#ff4444',
        label: 'Mệnh ↔ Mệnh',
      });
    }

    // Kết nối Phu Thê A ↔ Mệnh B
    const posPTA = chartA["Phu Thê"]?.position;
    if (posPTA && posMB) {
      lines.push({
        start: [posPTA.x + offsetA[0], posPTA.y + offsetA[1], posPTA.z + offsetA[2]],
        end:   [posMB.x + offsetB[0], posMB.y + offsetB[1], posMB.z + offsetB[2]],
        color: result.breakdown.phuTheCheo.score >= 60 ? '#88ccff' : '#ff8844',
        label: 'Phu Thê A → Mệnh B',
      });
    }

    // Kết nối Phu Thê B ↔ Mệnh A
    const posPTB = chartB["Phu Thê"]?.position;
    if (posPTB && posMA) {
      lines.push({
        start: [posPTB.x + offsetB[0], posPTB.y + offsetB[1], posPTB.z + offsetB[2]],
        end:   [posMA.x + offsetA[0], posMA.y + offsetA[1], posMA.z + offsetA[2]],
        color: result.breakdown.phuTheCheo.score >= 60 ? '#88ccff' : '#ff8844',
        label: 'Phu Thê B → Mệnh A',
      });
    }

    return lines;
  }, [chartA, chartB, result, offsetA, offsetB]);

  return (
    <>
      {links.map((link, i) => (
        <Line
          key={i}
          points={[link.start, link.end]}
          color={link.color}
          lineWidth={2}
          dashed
          dashScale={5}
          dashSize={1}
          dashOffset={0}
        />
      ))}
    </>
  );
});

// ---- Main Comparison Scene ----
export default function ComparisonScene() {
  const { chartA, chartB, metaA, metaB, result, exitComparison } = useComparison();

  // Offset 2 vũ trụ sang 2 bên
  const OFFSET_A = useMemo(() => [-45, 0, 0], []);
  const OFFSET_B = useMemo(() => [45, 0, 0], []);

  if (!chartA || !chartB) return null;

  return (
    <>
      {/* Nút thoát */}
      <button 
        onClick={exitComparison}
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 1000,
          padding: '10px 20px',
          background: 'rgba(255, 0, 0, 0.7)',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        🔙 Trở Về Trạng Thái Ban Đầu
      </button>

      <Canvas
        camera={{ position: [0, 60, 120], fov: 55 }}
        style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}
        gl={{ antialias: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[-45, 50, 50]} intensity={1.2} color="#66aaff" />
        <pointLight position={[45, 50, 50]} intensity={1.2} color="#ff66aa" />

        {/* Camera Control — enableDamping để mượt */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={20}
          maxDistance={200}
        />

        {/* Vũ trụ Lá số A */}
        <ChartUniverse
          chartData={chartA}
          offset={OFFSET_A}
          color="#66aaff"
          label={`🔵 ${metaA?.name || 'Lá Số A'}`}
        />

        {/* Vũ trụ Lá số B */}
        <ChartUniverse
          chartData={chartB}
          offset={OFFSET_B}
          color="#ff66aa"
          label={`🔴 ${metaB?.name || 'Lá Số B'}`}
        />

        {/* Đường kết nối chéo */}
        <CrossLinks
          chartA={chartA}
          chartB={chartB}
          result={result}
          offsetA={OFFSET_A}
          offsetB={OFFSET_B}
        />

        {/* Starfield background */}
        <StarField />
      </Canvas>

      {/* HTML Overlay — Panel kết quả */}
      {result && <ComparisonPanel result={result} metaA={metaA} metaB={metaB} />}
    </>
  );
}

// ---- Background sao trang trí (performance-safe) ----
const StarField = memo(function StarField() {
  const points = useMemo(() => {
    const positions = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 400;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
    }
    return positions;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={3000}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.3} color="#ffffff" sizeAttenuation transparent opacity={0.6} />
    </points>
  );
});
