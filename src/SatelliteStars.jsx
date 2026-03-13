import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

function normalizedSeed(seed) {
  let hash = 2166136261;
  const text = String(seed);
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 10000) / 10000;
}

/**
 * A single satellite (moon) orbiting around a planet.
 * Chính tinh = larger, brighter. Phụ tinh = smaller, dimmer.
 */
const Satellite = ({ name, isMain, index, total, color, visible }) => {
  const groupRef = useRef();
  const meshRef = useRef();
  const scaleRef = useRef(0); // for spawn animation

  // orbit parameters - each satellite gets unique orbit
  const config = useMemo(() => {
    const randA = normalizedSeed(`${name}-${index}-a`);
    const randB = normalizedSeed(`${name}-${index}-b`);
    const randC = normalizedSeed(`${name}-${index}-c`);

    const baseRadius = isMain ? 2.8 : 3.2 + index * 0.35;
    const speed = isMain ? 1.2 : 0.5 + (index * 0.15);
    const tiltX = (randA - 0.5) * 0.8;
    const tiltZ = (randB - 0.5) * 0.6;
    const phase = (index / total) * Math.PI * 2; // spread satellites evenly
    const size = isMain ? 0.35 : 0.12 + randC * 0.08;
    return { baseRadius, speed, tiltX, tiltZ, phase, size };
  }, [isMain, index, name, total]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // spawn / despawn animation
    const targetScale = visible ? 1 : 0;
    scaleRef.current += (targetScale - scaleRef.current) * 0.06;

    if (scaleRef.current < 0.01) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;

    // orbital motion
    const angle = config.phase + t * config.speed;
    const r = config.baseRadius * scaleRef.current;
    groupRef.current.position.x = Math.cos(angle) * r;
    groupRef.current.position.y = Math.sin(angle) * r * Math.sin(config.tiltX);
    groupRef.current.position.z = Math.sin(angle) * r * Math.cos(config.tiltZ);

    // self rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const s = config.size * scaleRef.current;
      meshRef.current.scale.set(s / config.size, s / config.size, s / config.size);
    }
  });

  const emissiveIntensity = isMain ? 2.5 : 0.8;
  const satColor = isMain ? '#FFFFFF' : color;
  const emissive = isMain ? '#FFD700' : color;

  return (
    <group ref={groupRef} visible={false}>
      {/* satellite sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[config.size, isMain ? 24 : 12, isMain ? 24 : 12]} />
        <meshStandardMaterial
          color={satColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={isMain ? 0.2 : 0.5}
          metalness={isMain ? 0.6 : 0.2}
        />
      </mesh>

      {/* glow for main star */}
      {isMain && (
        <mesh>
          <sphereGeometry args={[config.size * 1.6, 16, 16]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.5}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* point light for main star */}
      {isMain && <pointLight color="#FFD700" intensity={1.5} distance={5} />}

      {/* name label */}
      <Billboard>
        <Text
          position={[0, isMain ? -0.6 : -0.35, 0]}
          fontSize={isMain ? 0.28 : 0.18}
          color={isMain ? '#FFD700' : color}
          anchorX="center"
          anchorY="top"
          outlineWidth={0.015}
          outlineColor="#000000"
          fillOpacity={1}
        >
          {isMain ? `★ ${name}` : name}
        </Text>
      </Billboard>
    </group>
  );
};

/**
 * Orbital ring showing satellite path (only for main star)
 */
const SatelliteOrbitRing = ({ radius, visible }) => {
  const meshRef = useRef();
  const scaleRef = useRef(0);

  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return pts;
  }, [radius]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  useFrame(() => {
    if (!meshRef.current) return;
    const target = visible ? 1 : 0;
    scaleRef.current += (target - scaleRef.current) * 0.06;
    meshRef.current.visible = scaleRef.current > 0.01;
    meshRef.current.scale.setScalar(scaleRef.current);
  });

  return (
    <line ref={meshRef} geometry={geometry} visible={false}>
      <lineBasicMaterial color="#FFD700" transparent opacity={0.08} />
    </line>
  );
};

/**
 * SatelliteStars - renders all satellites for a planet
 * @param {string[]} stars - array of star names, [0] = chính tinh
 * @param {boolean} isFocused - whether this planet is selected
 * @param {string} elementColor - color from the planet's element
 */
export default function SatelliteStars({ stars, isFocused, elementColor }) {
  if (!stars || stars.length === 0) return null;

  return (
    <group>
      {/* main star orbit ring */}
      <SatelliteOrbitRing radius={2.8} visible={isFocused} />

      {/* satellites */}
      {stars.map((starName, i) => (
        <Satellite
          key={starName}
          name={starName}
          isMain={i === 0}
          index={i}
          total={stars.length}
          color={elementColor}
          visible={isFocused}
        />
      ))}
    </group>
  );
}
