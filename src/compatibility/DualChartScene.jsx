import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Billboard, Grid, MapControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import SatelliteStars from '../SatelliteStars';
import CompatibilityLines3D from './CompatibilityLines3D';
import {
  getVisibleComparisonIdsFor3D,
  pickBestPairByNode,
  rankComparisonsFor3D,
} from './scene3dUtils.js';

const ELEMENT_COLORS = {
  Kim: '#f2c45f',
  Mộc: '#42d588',
  Thủy: '#56b9ff',
  Hỏa: '#ff6c67',
  Thổ: '#c9a56e',
};

const LEFT_X = -10;
const RIGHT_X = 10;
const TOP_Y = 7;
const ROW_GAP = 2.35;

function shortSentence(text = '') {
  const first = text.split('.').find((part) => part.trim().length > 0);
  if (!first) return '';
  return `${first.trim()}.`;
}

function buildNodeList(comparisons, side) {
  const map = new Map();
  comparisons.forEach((item) => {
    const source = side === 'A' ? item.palaceA : item.palaceB;
    if (!map.has(source.name)) {
      map.set(source.name, {
        name: source.name,
        element: source.element,
        stars: source.stars || [],
      });
    }
  });
  return [...map.values()];
}

function lineTypeLabel(score) {
  if (score >= 1.5) return 'Tương hợp';
  if (score <= -1.5) return 'Xung khắc';
  return 'Trung tính';
}

function PalaceNode({
  node,
  side,
  index,
  nodeRefs,
  isActive,
  onSelectNode,
}) {
  const groupRef = useRef();
  const meshRef = useRef();
  const color = ELEMENT_COLORS[node.element] || '#bcd4ff';
  const x = side === 'A' ? LEFT_X : RIGHT_X;
  const y = TOP_Y - (index * ROW_GAP);

  useEffect(() => {
    if (!groupRef.current) return;
    const key = `${side}|${node.name}`;
    const map = nodeRefs.current;
    map.set(key, groupRef.current);
    return () => {
      map.delete(key);
    };
  }, [node.name, nodeRefs, side]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const base = isActive ? 1.14 : 1;
    const pulse = isActive ? (1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.018) : 1;
    const target = base * pulse;
    const current = meshRef.current.scale.x;
    const next = current + ((target - current) * 0.1);
    meshRef.current.scale.set(next, next, next);
  });

  const handleClick = (event) => {
    event.stopPropagation();
    onSelectNode(side, node.name);
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
    <group ref={groupRef} position={[x, y, 0]}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={onHover}
        onPointerOut={onLeave}
      >
        <sphereGeometry args={[0.95, 30, 30]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 1.3 : 0.6}
          roughness={0.58}
          metalness={0.25}
        />
      </mesh>

      <SatelliteStars
        stars={node.stars}
        isFocused={isActive}
        elementColor={color}
      />

      <Billboard position={[0, -1.4, 0]}>
        <Text
          fontSize={0.32}
          color={isActive ? '#ffffff' : color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {node.name}
        </Text>
      </Billboard>
    </group>
  );
}

function AxisLabel({ text, x }) {
  return (
    <Billboard position={[x, TOP_Y + 2.2, 0]}>
      <Text
        fontSize={0.7}
        color="#f2f8ff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {text}
      </Text>
    </Billboard>
  );
}

function SceneContent({
  nodesA,
  nodesB,
  nodeRefs,
  activeComparison,
  comparisons,
  visibleIds,
  onSelectComparison,
  onSelectNode,
}) {
  const activeA = activeComparison?.palaceA?.name;
  const activeB = activeComparison?.palaceB?.name;

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 12, 20]} intensity={1.35} color="#d5e8ff" />
      <pointLight position={[-16, 8, 5]} intensity={0.9} color="#4f83ff" />
      <pointLight position={[16, 8, 5]} intensity={0.9} color="#45d3b2" />

      <Stars radius={70} depth={35} count={900} factor={4} saturation={0.15} fade speed={0.25} />
      <Grid
        position={[0, -8.5, 0]}
        infiniteGrid
        fadeDistance={48}
        sectionColor="#2a4a74"
        cellColor="#1d3558"
      />

      <AxisLabel text="Hệ A" x={LEFT_X} />
      <AxisLabel text="Hệ B" x={RIGHT_X} />

      {nodesA.map((node, index) => (
        <PalaceNode
          key={`A-${node.name}`}
          node={node}
          side="A"
          index={index}
          nodeRefs={nodeRefs}
          isActive={activeA === node.name}
          onSelectNode={onSelectNode}
        />
      ))}
      {nodesB.map((node, index) => (
        <PalaceNode
          key={`B-${node.name}`}
          node={node}
          side="B"
          index={index}
          nodeRefs={nodeRefs}
          isActive={activeB === node.name}
          onSelectNode={onSelectNode}
        />
      ))}

      <CompatibilityLines3D
        comparisons={comparisons}
        nodeRefs={nodeRefs}
        activeId={activeComparison?.comparisonId || null}
        visibleIds={visibleIds}
        onSelectComparison={onSelectComparison}
      />

      <MapControls
        enablePan
        enableRotate
        minDistance={14}
        maxDistance={42}
        maxPolarAngle={Math.PI / 2 - 0.06}
        minPolarAngle={0.35}
        target={[0, -1.4, 0]}
      />
    </>
  );
}

function PairChip({ item, active, onClick }) {
  return (
    <button
      type="button"
      className={`scene-chip ${active ? 'active' : ''}`}
      onClick={() => onClick(item.comparisonId)}
      title={`${item.palaceA.name} ↔ ${item.palaceB.name}`}
    >
      <span>{item.palaceA.name}↔{item.palaceB.name}</span>
      <strong>{item.pairScore.toFixed(1)}</strong>
    </button>
  );
}

export default function DualChartScene({ result }) {
  const comparisons = useMemo(() => result?.comparisons ?? [], [result]);
  const ranked = useMemo(() => rankComparisonsFor3D(comparisons), [comparisons]);
  const [selectedId, setSelectedId] = useState(ranked.activeDefault);
  const [filterMode, setFilterMode] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sceneRootRef = useRef(null);
  const nodeRefs = useRef(new Map());

  const activeId = useMemo(() => {
    const exists = comparisons.some((item) => item.comparisonId === selectedId);
    if (exists) return selectedId;
    return ranked.activeDefault;
  }, [comparisons, ranked.activeDefault, selectedId]);

  const activeComparison = useMemo(
    () => comparisons.find((item) => item.comparisonId === activeId) || null,
    [activeId, comparisons],
  );

  const nodesA = useMemo(() => buildNodeList(comparisons, 'A'), [comparisons]);
  const nodesB = useMemo(() => buildNodeList(comparisons, 'B'), [comparisons]);

  const visibleIds = useMemo(() => getVisibleComparisonIdsFor3D({
    comparisons,
    activeId,
    filter: filterMode,
    strongTop: ranked.strongTop,
    conflictTop: ranked.conflictTop,
  }), [activeId, comparisons, filterMode, ranked.conflictTop, ranked.strongTop]);

  const handleSelectNode = useCallback((side, palaceName) => {
    const picked = pickBestPairByNode(side, palaceName, comparisons);
    if (!picked) return;
    setSelectedId(picked.comparisonId);
  }, [comparisons]);

  const handleFilter = useCallback((nextFilter) => {
    setFilterMode(nextFilter);
  }, []);

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === sceneRootRef.current);
    };
    document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const root = sceneRootRef.current;
    if (!root) return;

    if (document.fullscreenElement === root) {
      await document.exitFullscreen?.();
      return;
    }

    if (!document.fullscreenElement) {
      await root.requestFullscreen?.();
      return;
    }

    await root.requestFullscreen?.();
  }, []);

  if (!comparisons.length) return null;

  return (
    <div
      className={`dual-scene-wrap ${isFullscreen ? 'is-fullscreen' : ''}`}
      ref={sceneRootRef}
    >
      <div className="dual-scene-controls">
        <div className="scene-filter-row">
          <span className="scene-caption">Bộ lọc line:</span>
          <button
            type="button"
            className={`scene-filter-btn ${filterMode === 'strong' ? 'active' : ''}`}
            onClick={() => handleFilter('strong')}
          >
            Mạnh
          </button>
          <button
            type="button"
            className={`scene-filter-btn ${filterMode === 'conflict' ? 'active' : ''}`}
            onClick={() => handleFilter('conflict')}
          >
            Xung
          </button>
          <button
            type="button"
            className={`scene-filter-btn ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => handleFilter('all')}
          >
            Tất cả
          </button>
          <div className="scene-filter-spacer" />
          <button
            type="button"
            className="scene-fullscreen-btn"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Xem toàn màn hình'}
            title={isFullscreen ? 'Thoát toàn màn hình (Esc)' : 'Xem toàn màn hình'}
          >
            {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          </button>
        </div>

        <div className="scene-chip-grid">
          <div className="scene-chip-group">
            <span className="scene-caption">Top tương hợp:</span>
            <div className="scene-chip-list">
              {ranked.strongTop.map((item) => (
                <PairChip
                  key={`strong-${item.comparisonId}`}
                  item={item}
                  active={item.comparisonId === activeId}
                  onClick={setSelectedId}
                />
              ))}
            </div>
          </div>
          <div className="scene-chip-group">
            <span className="scene-caption">Top xung khắc:</span>
            <div className="scene-chip-list">
              {ranked.conflictTop.map((item) => (
                <PairChip
                  key={`conflict-${item.comparisonId}`}
                  item={item}
                  active={item.comparisonId === activeId}
                  onClick={setSelectedId}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dual-scene-canvas">
        <Canvas camera={{ position: [0, 3, 26], fov: 40 }}>
          <SceneContent
            nodesA={nodesA}
            nodesB={nodesB}
            nodeRefs={nodeRefs}
            activeComparison={activeComparison}
            comparisons={comparisons}
            visibleIds={visibleIds}
            onSelectComparison={setSelectedId}
            onSelectNode={handleSelectNode}
          />
        </Canvas>
      </div>

      <div className="dual-scene-legend">
        <span><i className="dot good" /> Đường xanh: tương hợp</span>
        <span><i className="dot mid" /> Đường vàng: trung tính</span>
        <span><i className="dot bad" /> Đường đỏ: xung khắc</span>
      </div>

      {activeComparison && (
        <div className="dual-scene-tooltip">
          <p className="dual-scene-tooltip-title">
            {activeComparison.palaceA.name} ↔ {activeComparison.palaceB.name}
          </p>
          <p>
            Điểm cặp: <strong>{activeComparison.pairScore.toFixed(2)}</strong> • {lineTypeLabel(activeComparison.pairScore)}
          </p>
          <p>{activeComparison.elementResult.label}</p>
          <p className="compat-muted">{shortSentence(activeComparison.interpretation)}</p>
        </div>
      )}
    </div>
  );
}
