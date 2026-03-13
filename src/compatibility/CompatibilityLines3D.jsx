import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

const TEMP_A = new THREE.Vector3();
const TEMP_B = new THREE.Vector3();
const TEMP_MID = new THREE.Vector3();

function lineTone(score) {
  if (score >= 1.5) return { color: '#3ee290', glow: '#a5f4cd' };
  if (score <= -1.5) return { color: '#ff5f67', glow: '#ffb3b7' };
  return { color: '#f4c55f', glow: '#ffe5b1' };
}

function buildCurve(a, b, lift = 1.2) {
  TEMP_MID.lerpVectors(a, b, 0.5);
  TEMP_MID.y += lift;
  return new THREE.QuadraticBezierCurve3(a.clone(), TEMP_MID.clone(), b.clone());
}

function CompatibilityLine({
  comparison,
  nodeRefs,
  isActive,
  onSelectComparison,
}) {
  const baseRef = useRef();
  const glowRef = useRef();
  const labelRef = useRef();
  const tone = useMemo(() => lineTone(comparison.pairScore), [comparison.pairScore]);

  useFrame(() => {
    const nodeA = nodeRefs.current.get(`A|${comparison.palaceA.name}`);
    const nodeB = nodeRefs.current.get(`B|${comparison.palaceB.name}`);
    if (!nodeA || !nodeB) {
      if (baseRef.current) baseRef.current.visible = false;
      if (glowRef.current) glowRef.current.visible = false;
      if (labelRef.current) labelRef.current.visible = false;
      return;
    }

    nodeA.getWorldPosition(TEMP_A);
    nodeB.getWorldPosition(TEMP_B);
    const curve = buildCurve(TEMP_A, TEMP_B, isActive ? 1.5 : 1.1);
    const points = curve.getPoints(28);

    if (baseRef.current) {
      baseRef.current.visible = true;
      baseRef.current.geometry.setFromPoints(points);
    }
    if (glowRef.current) {
      glowRef.current.visible = true;
      glowRef.current.geometry.setFromPoints(points);
    }

    if (labelRef.current) {
      labelRef.current.visible = isActive;
      if (isActive) {
        const p = curve.getPointAt(0.5);
        p.y += 0.55;
        labelRef.current.position.copy(p);
      }
    }
  });

  const onClick = (event) => {
    event.stopPropagation();
    onSelectComparison(comparison.comparisonId);
  };

  const onHover = (event) => {
    event.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const onLeave = (event) => {
    event.stopPropagation();
    document.body.style.cursor = 'auto';
  };

  return (
    <group>
      <line ref={glowRef} onClick={onClick} onPointerOver={onHover} onPointerOut={onLeave}>
        <bufferGeometry />
        <lineBasicMaterial
          color={tone.glow}
          transparent
          opacity={isActive ? 0.62 : 0.2}
        />
      </line>
      <line ref={baseRef} onClick={onClick} onPointerOver={onHover} onPointerOut={onLeave}>
        <bufferGeometry />
        <lineBasicMaterial
          color={tone.color}
          transparent
          opacity={isActive ? 0.96 : 0.35}
        />
      </line>

      <group ref={labelRef} visible={false}>
        <Billboard>
          <Text
            fontSize={0.36}
            color={tone.glow}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#000000"
          >
            {`${comparison.palaceA.name} ↔ ${comparison.palaceB.name} (${comparison.pairScore.toFixed(1)})`}
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

export default function CompatibilityLines3D({
  comparisons = [],
  nodeRefs,
  activeId,
  visibleIds,
  onSelectComparison,
}) {
  if (!comparisons.length) return null;

  return (
    <group>
      {comparisons
        .filter((comparison) => visibleIds?.has(comparison.comparisonId))
        .map((comparison) => (
          <CompatibilityLine
            key={comparison.comparisonId}
            comparison={comparison}
            nodeRefs={nodeRefs}
            isActive={activeId === comparison.comparisonId}
            onSelectComparison={onSelectComparison}
          />
        ))}
    </group>
  );
}

