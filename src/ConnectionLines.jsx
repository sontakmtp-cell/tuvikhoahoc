import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { getTamHopForPalace, getXungChieuForPalace } from './relationships';
import { getOrbitTime } from './orbitTime';
import { calculateExtendedPalaceScore } from './starScores';

/**
 * Cung Mệnh id – sits at center (0,0,0).
 */
const MENH_ID = 1;

/**
 * Compute a planet's current position using the shared orbit time.
 * Cung Mệnh (id=1) always returns center. Others orbit around it.
 */
function getPlanetPosition(palaceId, orbitIndex, totalOrbiting, palacesData, orbitSpeed = 0.05) {
  if (palaceId === MENH_ID) {
    return new THREE.Vector3(0, 0, 0);
  }

  // Calculate speed multiplier identical to Planet component
  let speedMultiplier = 1;
  if (palacesData) {
    const scoreInfo = calculateExtendedPalaceScore(palaceId, palacesData);
    if (scoreInfo && typeof scoreInfo.final.total === 'number') {
      const palaceScore = scoreInfo.final.total;
      let absScore = Math.abs(palaceScore);
      speedMultiplier = 1 + (absScore / 15);
      speedMultiplier = Math.max(0.05, Math.min(speedMultiplier, 6.0));
      
      if (palaceScore < 0) {
        speedMultiplier *= -1;
      }
    }
  }

  const time = getOrbitTime();
  const orbitRadius = 8 + orbitIndex * 2.8;
  const speed = (orbitSpeed * speedMultiplier) / (0.6 + orbitIndex * 0.12);
  const initialAngle = (orbitIndex / totalOrbiting) * Math.PI * 2;
  const angle = initialAngle + time * speed;
  return new THREE.Vector3(
    Math.cos(angle) * orbitRadius,
    Math.sin(time * 1.5 + orbitIndex) * 0.35,
    Math.sin(angle) * orbitRadius
  );
}

/* ── Animated curved line between two moving points ── */
const AnimatedCurve = ({ getPointA, getPointB, color, dashScale = 1, lineWidth = 1, opacity = 0.6 }) => {
  const lineRef = useRef();
  const materialRef = useRef();

  useFrame(() => {
    if (!lineRef.current || !materialRef.current) return;
    const a = getPointA();
    const b = getPointB();

    const mid = new THREE.Vector3().lerpVectors(a, b, 0.5);
    mid.y += a.distanceTo(b) * 0.2;

    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const points = curve.getPoints(48);
    lineRef.current.geometry.setFromPoints(points);

    materialRef.current.dashOffset -= 0.02;
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry />
      <lineDashedMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={opacity}
        dashSize={0.5 * dashScale}
        gapSize={0.3 * dashScale}
        linewidth={lineWidth}
      />
    </line>
  );
};

/* ── Straight dashed line for Xung Chiếu ── */
const AnimatedStraightLine = ({ getPointA, getPointB, color, opacity = 0.5 }) => {
  const lineRef = useRef();
  const materialRef = useRef();

  useFrame(() => {
    if (!lineRef.current || !materialRef.current) return;
    const a = getPointA();
    const b = getPointB();
    const points = [a, b];
    lineRef.current.geometry.setFromPoints(points);
    materialRef.current.dashOffset -= 0.03;
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry />
      <lineDashedMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={opacity}
        dashSize={0.8}
        gapSize={0.5}
      />
    </line>
  );
};

/* ── Glowing node marker on connected planets ── */
const ConnectionMarker = ({ getPosition, color }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const pos = getPosition();
    meshRef.current.position.copy(pos);
    meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.15);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.25, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
};

/* ── Label floating at midpoint of connection ── */
const ConnectionLabel = ({ getPointA, getPointB, text, color }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    const a = getPointA();
    const b = getPointB();
    const mid = new THREE.Vector3().lerpVectors(a, b, 0.5);
    mid.y += a.distanceTo(b) * 0.25 + 1;
    groupRef.current.position.copy(mid);
  });

  return (
    <group ref={groupRef}>
      <Billboard>
        <Text
          fontSize={0.4}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {text}
        </Text>
      </Billboard>
    </group>
  );
};

/* ── MAIN: ConnectionLines component ── */
export default function ConnectionLines({ focusedId, palaces, showTamHop = true, showXungChieu = true }) {
  if (!focusedId) return null;

  const orbitingPalaces = palaces.filter(p => p.id !== MENH_ID);
  const totalOrbiting = orbitingPalaces.length;

  // Position functions: Cung Mệnh returns center, others use orbit index
  const getPosFn = (palaceId) => {
    if (palaceId === MENH_ID) {
      return () => new THREE.Vector3(0, 0, 0);
    }
    const orbitIdx = orbitingPalaces.findIndex(p => p.id === palaceId);
    return () => getPlanetPosition(palaceId, orbitIdx, totalOrbiting, palaces);
  };

  const tamHopGroups = showTamHop ? getTamHopForPalace(focusedId) : [];
  const xungChieuPairs = showXungChieu ? getXungChieuForPalace(focusedId) : [];

  return (
    <group>
      {tamHopGroups.map((group, gi) => {
        const ids = group.palaceIds;
        const posFns = ids.map(id => getPosFn(id));
        const edges = [[0, 1], [1, 2], [2, 0]];
        return (
          <group key={`tamhop-${gi}`}>
            {edges.map(([a, b], ei) => (
              <AnimatedCurve
                key={`th-edge-${gi}-${ei}`}
                getPointA={posFns[a]}
                getPointB={posFns[b]}
                color={group.color}
                opacity={0.55}
                dashScale={0.8}
              />
            ))}
            {posFns.map((fn, pi) => (
              <ConnectionMarker
                key={`th-marker-${gi}-${pi}`}
                getPosition={fn}
                color={group.color}
              />
            ))}
            <ConnectionLabel
              getPointA={posFns[0]}
              getPointB={posFns[1]}
              text={`▲ ${group.name}`}
              color={group.color}
            />
          </group>
        );
      })}

      {xungChieuPairs.map((pair, pi) => {
        const [idA, idB] = pair.palaceIds;
        const posFnA = getPosFn(idA);
        const posFnB = getPosFn(idB);
        return (
          <group key={`xungchieu-${pi}`}>
            <AnimatedStraightLine
              getPointA={posFnA}
              getPointB={posFnB}
              color="#FF4444"
              opacity={0.45}
            />
            <ConnectionMarker getPosition={posFnA} color="#FF4444" />
            <ConnectionMarker getPosition={posFnB} color="#FF4444" />
            <ConnectionLabel
              getPointA={posFnA}
              getPointB={posFnB}
              text={`⟷ ${pair.name}`}
              color="#FF6666"
            />
          </group>
        );
      })}
    </group>
  );
}
