import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Stars, Billboard, Text, Sphere } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { tuViData } from './data';
import PalaceNav from './PalaceNav';
import ConnectionLines from './ConnectionLines';
import { getTamHopForPalace, getXungChieuForPalace } from './relationships';
import SatelliteStars from './SatelliteStars';
import { getOrbitTime, updateOrbitTime } from './orbitTime';

/* ── colour palette per element ── */
const elementColors = {
  "Kim": "#F5C842",
  "Mộc": "#2ECC71",
  "Thủy": "#3498DB",
  "Hỏa": "#E74C3C",
  "Thổ": "#D4A574"
};

const elementEmissive = {
  "Kim": "#FFD700",
  "Mộc": "#00FF7F",
  "Thủy": "#00BFFF",
  "Hỏa": "#FF4444",
  "Thổ": "#CD853F"
};

/* ── Planet Material helpers ── */
const getPlanetProps = (element, isFocused) => {
  const base = {
    color: elementColors[element] || "#ffffff",
    emissive: elementEmissive[element] || "#ffffff",
    roughness: 0.5,
    metalness: 0.3,
    emissiveIntensity: isFocused ? 1.2 : 0.35,
  };
  switch (element) {
    case "Kim":
      return { ...base, metalness: 0.9, roughness: 0.15 };
    case "Mộc":
      return { ...base, metalness: 0.1, roughness: 0.8 };
    case "Thủy":
      return { ...base, metalness: 0.4, roughness: 0.2, transparent: true, opacity: 0.88 };
    case "Hỏa":
      return { ...base, metalness: 0.2, roughness: 0.6, emissiveIntensity: isFocused ? 2.0 : 0.7 };
    case "Thổ":
      return { ...base, metalness: 0.15, roughness: 0.85 };
    default:
      return base;
  }
};

/* ── Orbit Ring (individual, elliptical) ── */
const OrbitRing = ({ radiusX, radiusZ, color }) => {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radiusX, 0, Math.sin(a) * radiusZ));
    }
    return pts;
  }, [radiusX, radiusZ]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.12} />
    </line>
  );
};

/* ── Planetary Ring (Saturn-style) ── */
const PlanetaryRing = ({ color, radius = 2.2 }) => {
  return (
    <mesh rotation={[-Math.PI / 2 + 0.2, 0, 0]}>
      <ringGeometry args={[radius, radius + 0.6, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.15}
        side={THREE.DoubleSide}
        transparent
        opacity={0.25}
      />
    </mesh>
  );
};

/* ── Atmosphere Glow Shell ── */
const AtmosphereGlow = ({ color, radius = 1.7 }) => {
  return (
    <mesh>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        transparent
        opacity={0.08}
        side={THREE.BackSide}
      />
    </mesh>
  );
};
/* ── Orbit Time Manager (single source of truth) ── */
const OrbitTimeManager = ({ paused }) => {
  useFrame((state) => {
    updateOrbitTime(state.clock.elapsedTime, paused);
  });
  return null;
};

/* ── Planet component ── */
const Planet = ({ data, index, total, isFocused, paused, onClick, orbitSpeed = 0.05 }) => {
  const meshRef = useRef();
  const groupRef = useRef();

  // each planet gets its own orbit radius & speed (well-spaced, perfect circles)
  const orbitRadius = 8 + index * 2.8;
  const speed = orbitSpeed / (0.6 + index * 0.12);

  const initialAngle = (index / total) * Math.PI * 2;
  const color = elementColors[data.element] || "#ffffff";
  const matProps = getPlanetProps(data.element, isFocused);

  // show ring for every 3rd planet or Kim/Thổ elements
  const hasRing = data.element === "Kim" || data.element === "Thổ" || index % 4 === 0;

  useFrame(() => {
    if (!groupRef.current) return;
    const t = getOrbitTime();
    const angle = initialAngle + t * speed;
    groupRef.current.position.x = Math.cos(angle) * orbitRadius;
    groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    groupRef.current.position.y = Math.sin(t * 1.5 + index) * 0.35;

    if (meshRef.current) {
      meshRef.current.rotation.y += paused ? 0 : 0.008;
      if (isFocused) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.6, 1.6, 1.6), 0.08);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08);
      }
    }
  });

  return (
    <>
      {/* orbit ring */}
      <OrbitRing
        radiusX={orbitRadius}
        radiusZ={orbitRadius}
        color={color}
      />

      <group ref={groupRef}>
        {/* planet sphere */}
        <mesh
          ref={meshRef}
          onClick={(e) => { e.stopPropagation(); onClick(data.id); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}
        >
          <sphereGeometry args={[1.5, 48, 48]} />
          <meshStandardMaterial {...matProps} />
        </mesh>

        {/* atmosphere */}
        <AtmosphereGlow color={color} radius={1.85} />

        {/* optional Saturn ring */}
        {hasRing && <PlanetaryRing color={color} radius={2.0} />}

        {/* point light on focused planet */}
        {isFocused && <pointLight color={color} intensity={3} distance={12} />}

        {/* satellite stars (chính tinh & phụ tinh) */}
        <SatelliteStars
          stars={data.stars}
          isFocused={isFocused}
          elementColor={color}
        />

        {/* label */}
        <Billboard>
          <Text
            position={[0, -2.5, 0]}
            fontSize={isFocused ? 0.75 : 0.5}
            color={isFocused ? "#ffffff" : color}
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
            outlineWidth={0.03}
            outlineColor="#000000"
          >
            {data.name}
          </Text>
        </Billboard>
      </group>
    </>
  );
};

/* ── Cung Mệnh (Central body – replaces Sun) ── */
const MENH_ID = 1;
const CungMenh = ({ data, isFocused, onClick }) => {
  const meshRef = useRef();
  const coronaRef = useRef();
  const color = elementColors[data.element] || "#3498DB";
  const emissive = elementEmissive[data.element] || "#00BFFF";

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.05;
      if (isFocused) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.08);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08);
      }
    }
    if (coronaRef.current) {
      coronaRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.06);
      coronaRef.current.rotation.z = t * 0.02;
    }
  });

  return (
    <group>
      {/* core */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(data.id); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={isFocused ? 3.0 : 2.2}
          roughness={0.25}
          metalness={0.4}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* corona glow */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[3.8, 32, 32]} />
        <meshStandardMaterial
          color={emissive}
          emissive={color}
          emissiveIntensity={1.0}
          transparent
          opacity={0.14}
          side={THREE.BackSide}
        />
      </mesh>

      {/* outer glow */}
      <mesh>
        <sphereGeometry args={[5.2, 32, 32]} />
        <meshStandardMaterial
          color={emissive}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* main light */}
      <pointLight position={[0, 0, 0]} intensity={4} distance={80} color={emissive} />
      <pointLight position={[0, 0, 0]} intensity={1.5} distance={120} color={color} />

      {/* focused point light */}
      {isFocused && <pointLight color={color} intensity={5} distance={15} />}

      {/* satellite stars */}
      <SatelliteStars
        stars={data.stars}
        isFocused={isFocused}
        elementColor={color}
      />

      {/* title */}
      <Billboard>
        <Text
          position={[0, -4.2, 0]}
          fontSize={isFocused ? 1.0 : 0.8}
          color={isFocused ? "#ffffff" : emissive}
          letterSpacing={0.15}
          font="https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6xpmIyXjU1pg.ttf"
          outlineWidth={0.04}
          outlineColor="#000000"
        >
          CUNG MỆNH
        </Text>
      </Billboard>
    </group>
  );
};

/* ── Camera Controller (no auto-zoom, user controls freely) ── */
const CameraController = () => {
  return null;
};

/* ── Info Panel (HTML overlay, right side) ── */
const InfoPanel = ({ data, onClose }) => {
  if (!data) return null;
  const color = elementColors[data.element] || "#ffffff";
  const tamHopGroups = getTamHopForPalace(data.id);
  const xungChieuPairs = getXungChieuForPalace(data.id);

  return (
    <div id="info-panel" className="info-panel" style={{ '--accent': color }}>
      <button className="info-close" onClick={onClose}>✕</button>

      <h2 className="info-title">
        <span className="info-element-dot" style={{ background: color }} />
        Cung {data.name}
      </h2>

      <div className="info-row">
        <span className="info-label">Hành:</span>
        <span className="info-value" style={{ color }}>{data.element}</span>
      </div>

      {/* Relationship section */}
      <div className="info-relationships">
        <div className="info-rel-group">
          <span className="info-rel-icon" style={{ color: '#FFD700' }}>▲</span>
          <span className="info-rel-label">Tam Hợp:</span>
          {tamHopGroups.map(g => (
            <span key={g.name} className="info-rel-badge" style={{
              borderColor: g.color, color: g.color
            }}>{g.name}</span>
          ))}
        </div>
        <div className="info-rel-group">
          <span className="info-rel-icon" style={{ color: '#FF4444' }}>⟷</span>
          <span className="info-rel-label">Xung Chiếu:</span>
          {xungChieuPairs.map(p => (
            <span key={p.name} className="info-rel-badge" style={{
              borderColor: '#FF4444', color: '#FF6666'
            }}>{p.name}</span>
          ))}
        </div>
      </div>

      <div className="info-row">
        <span className="info-label">Các sao:</span>
      </div>
      <div className="info-stars">
        {data.stars.map(star => (
          <span key={star} className="info-star-badge" style={{
            background: `${color}18`,
            border: `1px solid ${color}55`
          }}>
            {star}
          </span>
        ))}
      </div>

      <div className="info-description">
        {data.description}
      </div>

      {data.detailedDescription && (
        <div className="info-detailed">
          {data.detailedDescription}
        </div>
      )}
    </div>
  );
};

/* ── Connection Toggle Controls ── */
const ConnectionToggle = ({ showTamHop, showXungChieu, onToggleTamHop, onToggleXungChieu, hasFocused }) => {
  return (
    <div className={`connection-toggle ${hasFocused ? 'toggle-visible' : ''}`}>
      <button
        className={`toggle-btn ${showTamHop ? 'toggle-active' : ''}`}
        onClick={onToggleTamHop}
        style={{ '--toggle-color': '#FFD700' }}
      >
        <span className="toggle-icon">▲</span>
        Tam Hợp
      </button>
      <button
        className={`toggle-btn ${showXungChieu ? 'toggle-active' : ''}`}
        onClick={onToggleXungChieu}
        style={{ '--toggle-color': '#FF4444' }}
      >
        <span className="toggle-icon">⟷</span>
        Xung Chiếu
      </button>
    </div>
  );
};

/* ── Main Scene ── */
export default function TuViScene() {
  const [focusedId, setFocusedId] = useState(null);
  const [showTamHop, setShowTamHop] = useState(true);
  const [showXungChieu, setShowXungChieu] = useState(true);

  const handlePalaceClick = useCallback((id) => {
    setFocusedId(prev => prev === id ? null : id);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setFocusedId(null);
  }, []);

  const menhData = tuViData.find(p => p.id === MENH_ID);
  const orbitingPalaces = tuViData.filter(p => p.id !== MENH_ID);

  const focusedData = focusedId ? tuViData.find(p => p.id === focusedId) : null;
  const focusedIndex = focusedId ? tuViData.findIndex(p => p.id === focusedId) : null;

  return (
    <div className="scene-root">
      {/* 3D canvas */}
      <Canvas camera={{ position: [0, 35, 55], fov: 45 }} onPointerMissed={handleBackgroundClick}>
        <ambientLight intensity={0.08} />

        <OrbitTimeManager paused={!!focusedId} />

        <Stars radius={150} depth={60} count={8000} factor={5} saturation={0.6} fade speed={1} />

        {/* Cung Mệnh at center */}
        <CungMenh
          data={menhData}
          isFocused={focusedId === MENH_ID}
          onClick={handlePalaceClick}
        />

        {/* 11 remaining palaces orbiting around Cung Mệnh */}
        {orbitingPalaces.map((palace, index) => (
          <Planet
            key={palace.id}
            data={palace}
            index={index}
            total={orbitingPalaces.length}
            isFocused={focusedId === palace.id}
            paused={!!focusedId}
            onClick={handlePalaceClick}
          />
        ))}

        {/* Connection lines for Tam Hợp & Xung Chiếu */}
        <ConnectionLines
          focusedId={focusedId}
          palaces={tuViData}
          showTamHop={showTamHop}
          showXungChieu={showXungChieu}
        />

        <CameraController focusedIndex={focusedIndex} />

        <OrbitControls
          enablePan={true}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={12}
          maxDistance={120}
          autoRotate={!focusedId}
          autoRotateSpeed={0.2}
        />

        {/* Post-processing */}
        <EffectComposer>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={[0.0005, 0.0005]}
          />
        </EffectComposer>
      </Canvas>

      {/* Navigation sidebar */}
      <PalaceNav
        palaces={tuViData}
        focusedId={focusedId}
        onSelect={handlePalaceClick}
      />

      {/* Connection toggle controls */}
      <ConnectionToggle
        showTamHop={showTamHop}
        showXungChieu={showXungChieu}
        onToggleTamHop={() => setShowTamHop(prev => !prev)}
        onToggleXungChieu={() => setShowXungChieu(prev => !prev)}
        hasFocused={!!focusedId}
      />

      {/* Info panel overlay */}
      <InfoPanel data={focusedData} onClose={() => setFocusedId(null)} />
    </div>
  );
}
