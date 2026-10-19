import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Molecule3DStructure, AtomData } from '../types/chemistry';
import { 
  RotateCw, 
  Maximize2, 
  Camera, 
  Download, 
  Eye, 
  Layers, 
  Palette, 
  Ruler, 
  ChevronUp, 
  ChevronDown,
  Info
} from 'lucide-react';

interface MoleculeViewer3DProps {
  structure: Molecule3DStructure;
  moleculeName: string;
  activeColorMode: 'cpk' | 'saliency' | 'activation';
  onColorModeChange?: (mode: 'cpk' | 'saliency' | 'activation') => void;
}

// CPK Color Map for standard chemical elements
const CPK_COLORS: Record<string, number> = {
  H: 0xf1f5f9, // White
  C: 0x334155, // Dark slate
  N: 0x2563eb, // Cobalt blue
  O: 0xdc2626, // Red
  F: 0x10b981, // Emerald green
  P: 0xf97316, // Orange
  S: 0xeab308, // Yellow
  Cl: 0x16a34a, // Green
  Br: 0x7c3aed, // Purple
  I: 0x4c1d95, // Deep violet
  Na: 0x0284c7, // Light blue
  K: 0x9333ea, // Purple
  B: 0xf59e0b  // Amber
};

// Van der Waals Radii (in Angstroms) for standard elements
const VDW_RADII: Record<string, number> = {
  H: 0.35,
  C: 0.70,
  N: 0.65,
  O: 0.60,
  F: 0.55,
  P: 0.85,
  S: 0.80,
  Cl: 0.75,
  Br: 0.85,
  I: 0.95
};

// Reusable math vectors to prevent GC churn in render loop
const _vec3 = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

export const MoleculeViewer3D: React.FC<MoleculeViewer3DProps> = ({
  structure,
  moleculeName,
  activeColorMode,
  onColorModeChange
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);
  const atomMeshesRef = useRef<Array<{ mesh: THREE.Mesh; atom: AtomData }>>([]);
  const animFrameRef = useRef<number | null>(null);

  // Interaction & UI State
  const [styleMode, setStyleMode] = useState<'ball-stick' | 'space-filling' | 'wireframe'>('ball-stick');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [hoveredAtom, setHoveredAtom] = useState<AtomData | null>(null);
  const [selectedAtoms, setSelectedAtoms] = useState<AtomData[]>([]);
  const [measurementResult, setMeasurementResult] = useState<string | null>(null);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mouse orbit state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  // Helper function to get color for an atom based on current activeColorMode
  const getAtomColor = useCallback((atom: AtomData): THREE.Color => {
    if (activeColorMode === 'cpk') {
      const hex = CPK_COLORS[atom.symbol] || 0x64748b;
      return new THREE.Color(hex);
    } else if (activeColorMode === 'saliency') {
      // RdYlGn inverted heat map: 0 = blue-green, 0.5 = yellow, 1.0 = deep red
      const s = Math.min(1, Math.max(0, atom.saliency));
      if (s < 0.5) {
        return new THREE.Color().setRGB(s * 2, 0.8, 0.2);
      } else {
        return new THREE.Color().setRGB(1.0, (1 - (s - 0.5) * 2) * 0.8, 0.1);
      }
    } else {
      // Activation attribution (Plasma color scale: deep violet -> magenta -> gold)
      const a = Math.min(1, Math.max(0, atom.activation));
      return new THREE.Color().setHSL(0.8 - a * 0.7, 0.9, 0.35 + a * 0.4);
    }
  }, [activeColorMode]);

  // Re-build 3D Molecular Meshes whenever structure, styleMode, or activeColorMode changes
  const buildMoleculeMeshes = useCallback(() => {
    const group = moleculeGroupRef.current;
    if (!group) return;

    // Clear previous objects
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }
    atomMeshesRef.current = [];

    const atoms = structure.atoms;
    const bonds = structure.bonds;

    // Build Atoms
    atoms.forEach((atom) => {
      let radius = 0.45;
      if (styleMode === 'space-filling') {
        radius = (VDW_RADII[atom.symbol] || 0.7) * 1.5;
      } else if (styleMode === 'wireframe') {
        radius = 0.15;
      } else {
        radius = (VDW_RADII[atom.symbol] || 0.7) * 0.65;
      }

      const sphereGeo = new THREE.SphereGeometry(radius, 24, 24);
      const color = getAtomColor(atom);
      const isSelected = selectedAtoms.some(a => a.id === atom.id);

      const mat = new THREE.MeshStandardMaterial({
        color: isSelected ? new THREE.Color(0x38bdf8) : color,
        roughness: isSelected ? 0.1 : 0.25,
        metalness: isSelected ? 0.3 : 0.15,
        emissive: isSelected ? new THREE.Color(0x0284c7) : new THREE.Color(0x000000),
        emissiveIntensity: isSelected ? 0.5 : 0
      });

      const atomMesh = new THREE.Mesh(sphereGeo, mat);
      atomMesh.position.set(atom.x, atom.y, atom.z);
      atomMesh.castShadow = true;
      atomMesh.receiveShadow = true;
      atomMesh.userData = { atomId: atom.id, atomData: atom };

      group.add(atomMesh);
      atomMeshesRef.current.push({ mesh: atomMesh, atom });
    });

    // Build Bonds
    if (styleMode !== 'space-filling') {
      bonds.forEach((bond) => {
        const a1 = atoms.find(a => a.id === bond.atom1);
        const a2 = atoms.find(a => a.id === bond.atom2);
        if (!a1 || !a2) return;

        const p1 = new THREE.Vector3(a1.x, a1.y, a1.z);
        const p2 = new THREE.Vector3(a2.x, a2.y, a2.z);
        const distance = p1.distanceTo(p2);
        const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        const cylinderRadius = styleMode === 'wireframe' ? 0.04 : (bond.order === 2 ? 0.12 : (bond.order === 3 ? 0.15 : 0.10));
        const cylinderGeo = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, distance, 12);

        // Cylinder default orientation is along Y-axis; rotate towards p2 - p1
        const bondDir = new THREE.Vector3().subVectors(p2, p1).normalize();
        const orientation = new THREE.Quaternion().setFromUnitVectors(_up, bondDir);

        const bondColor = bond.isAromatic ? 0x94a3b8 : (bond.order === 2 ? 0x64748b : 0x475569);
        const bondMat = new THREE.MeshStandardMaterial({
          color: bondColor,
          roughness: 0.4,
          metalness: 0.1
        });

        const bondMesh = new THREE.Mesh(cylinderGeo, bondMat);
        bondMesh.position.copy(midPoint);
        bondMesh.quaternion.copy(orientation);
        bondMesh.castShadow = true;
        group.add(bondMesh);

        // For double bonds in Ball-and-Stick mode, render twin cylinders
        if (bond.order === 2 && styleMode === 'ball-stick') {
          const perp = new THREE.Vector3().crossVectors(bondDir, _vec3.set(0, 0, 1)).normalize().multiplyScalar(0.12);
          bondMesh.position.add(perp);

          const twinMat = bondMat.clone();
          const twinMesh = new THREE.Mesh(cylinderGeo, twinMat);
          twinMesh.position.copy(midPoint).sub(perp);
          twinMesh.quaternion.copy(orientation);
          twinMesh.castShadow = true;
          group.add(twinMesh);
        }
      });
    }
  }, [structure, styleMode, activeColorMode, selectedAtoms, getAtomColor]);

  // Handle measurement calculations when selectedAtoms change
  useEffect(() => {
    if (selectedAtoms.length === 2) {
      const a1 = selectedAtoms[0];
      const a2 = selectedAtoms[1];
      const p1 = new THREE.Vector3(a1.x, a1.y, a1.z);
      const p2 = new THREE.Vector3(a2.x, a2.y, a2.z);
      const dist = p1.distanceTo(p2).toFixed(2);
      setMeasurementResult(`Distance (${a1.symbol}${a1.id} - ${a2.symbol}${a2.id}): ${dist} Å`);
    } else if (selectedAtoms.length === 3) {
      const a1 = selectedAtoms[0];
      const a2 = selectedAtoms[1];
      const a3 = selectedAtoms[2];
      const v1 = new THREE.Vector3(a1.x - a2.x, a1.y - a2.y, a1.z - a2.z).normalize();
      const v2 = new THREE.Vector3(a3.x - a2.x, a3.y - a2.y, a3.z - a2.z).normalize();
      const dot = Math.min(1, Math.max(-1, v1.dot(v2)));
      const angleDeg = ((Math.acos(dot) * 180) / Math.PI).toFixed(1);
      setMeasurementResult(`Angle (${a1.symbol}${a1.id} - ${a2.symbol}${a2.id} - ${a3.symbol}${a3.id}): ${angleDeg}°`);
    } else if (selectedAtoms.length === 0) {
      setMeasurementResult(null);
    }
  }, [selectedAtoms]);

  // Main Three.js Scene Setup (Mount once)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0f1d); // Clean laboratory obsidian

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. Lighting Rig
    // Warm key light
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.8);
    keyLight.position.set(12, 16, 14);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Cool fill light
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.9);
    fillLight.position.set(-14, 8, -10);
    scene.add(fillLight);

    // Soft laboratory hemisphere light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.7);
    scene.add(hemiLight);

    // Contact shadow plane beneath molecule
    const shadowGeo = new THREE.PlaneGeometry(24, 24);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -4.5;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Subtle laboratory grid plane
    const gridHelper = new THREE.GridHelper(24, 24, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -4.51;
    scene.add(gridHelper);

    // 5. Molecule Group
    const molGroup = new THREE.Group();
    moleculeGroupRef.current = molGroup;
    scene.add(molGroup);

    // 6. Animation Loop
    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isAutoRotating && !isDraggingRef.current && moleculeGroupRef.current) {
        moleculeGroupRef.current.rotation.y += 0.35 * delta;
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update meshes whenever structure or settings change
  useEffect(() => {
    buildMoleculeMeshes();
  }, [buildMoleculeMeshes]);

  // Pointer drag to orbit
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const container = mountRef.current;
    if (!container) return;

    // Track mouse position for tooltip
    const rect = container.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    if (isDraggingRef.current && moleculeGroupRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      moleculeGroupRef.current.rotation.y += deltaX * 0.008;
      moleculeGroupRef.current.rotation.x += deltaY * 0.008;

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    }

    // Raycast for atom hover
    if (cameraRef.current && sceneRef.current) {
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const atomMeshes = atomMeshesRef.current.map(item => item.mesh);
      const intersects = raycaster.intersectObjects(atomMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const atomData = hit.userData?.atomData as AtomData;
        setHoveredAtom(atomData || null);
      } else {
        setHoveredAtom(null);
      }
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Click on atom to select for measurement
  const handleClick = (e: React.MouseEvent) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current) return;

    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const atomMeshes = atomMeshesRef.current.map(item => item.mesh);
    const intersects = raycaster.intersectObjects(atomMeshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const atom = hit.userData?.atomData as AtomData;
      if (atom) {
        setSelectedAtoms(prev => {
          const exists = prev.some(a => a.id === atom.id);
          if (exists) {
            return prev.filter(a => a.id !== atom.id);
          } else {
            if (prev.length >= 3) {
              return [atom];
            }
            return [...prev, atom];
          }
        });
      }
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    const delta = e.deltaY * 0.01;
    cameraRef.current.position.z = Math.min(25, Math.max(5, cameraRef.current.position.z + delta));
  };

  // Camera Actions
  const handleResetCamera = () => {
    if (cameraRef.current && moleculeGroupRef.current) {
      cameraRef.current.position.set(0, 0, 14);
      moleculeGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  const handleCaptureScreenshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${moleculeName.toLowerCase().replace(/\s+/g, '_')}_3d_structure.png`;
    a.click();
  };

  const handleExportCoordinates = () => {
    // Generate XYZ coordinate format
    const lines = [
      `${structure.atoms.length}`,
      `${moleculeName} 3D conformer coordinates generated by ChemReg engine`
    ];
    structure.atoms.forEach(a => {
      lines.push(`${a.symbol.padEnd(3)} ${a.x.toFixed(4).padStart(10)} ${a.y.toFixed(4).padStart(10)} ${a.z.toFixed(4).padStart(10)}`);
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${moleculeName.toLowerCase().replace(/\s+/g, '_')}_conformer.xyz`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full h-[520px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Top Spec HUD (Top-Left Minimal Header) */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 backdrop-blur-md">
        <span className="text-xs font-semibold text-white tracking-wide">{moleculeName}</span>
        <span className="text-slate-600">·</span>
        <span className="text-xs font-mono text-slate-400 tabular-nums">
          {structure.atoms.length} Atoms / {structure.bonds.length} Bonds
        </span>
        <span className="text-slate-600">·</span>
        <span className="text-xs font-mono text-cyan-400 capitalize">
          {activeColorMode} View
        </span>
      </div>

      {/* Measurement Pill (Top-Right) */}
      {measurementResult && (
        <div className="absolute top-4 right-4 z-10 bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2">
          <Ruler className="w-3.5 h-3.5 text-cyan-400" />
          <span>{measurementResult}</span>
          <button
            onClick={() => setSelectedAtoms([])}
            className="text-slate-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Hover Atom Tooltip */}
      {hoveredAtom && (
        <div
          className="absolute pointer-events-none z-20 bg-slate-900/95 border border-slate-700/80 rounded-lg p-2.5 shadow-xl text-xs font-mono text-slate-200"
          style={{
            left: Math.min(mousePos.x + 15, (mountRef.current?.clientWidth || 600) - 180),
            top: Math.max(10, mousePos.y - 70)
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="font-bold text-white text-sm">
              {hoveredAtom.symbol} #{hoveredAtom.id}
            </span>
            <span className="text-slate-400 text-[10px]">
              Pos: ({hoveredAtom.x.toFixed(1)}, {hoveredAtom.y.toFixed(1)}, {hoveredAtom.z.toFixed(1)})
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
            <span className="text-slate-400">Saliency (Sv):</span>
            <span className="text-emerald-400 font-bold tabular-nums">{hoveredAtom.saliency.toFixed(2)}</span>
            <span className="text-slate-400">Activation (Av):</span>
            <span className="text-purple-400 font-bold tabular-nums">{hoveredAtom.activation.toFixed(2)}</span>
            {hoveredAtom.formalCharge !== 0 && (
              <>
                <span className="text-slate-400">Charge:</span>
                <span className="text-amber-400 font-bold">{hoveredAtom.formalCharge > 0 ? `+${hoveredAtom.formalCharge}` : hoveredAtom.formalCharge}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Color Mode Scale Legend (Top Right below measurements) */}
      <div className="absolute top-14 right-4 z-10 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-slate-400 flex flex-col gap-1">
        {activeColorMode === 'saliency' && (
          <>
            <span className="text-slate-300 font-sans font-medium">Task Saliency (Sv)</span>
            <div className="flex items-center gap-1.5">
              <span>0.0</span>
              <div className="w-16 h-2 rounded bg-gradient-to-r from-emerald-500 via-amber-400 to-red-600" />
              <span>1.0</span>
            </div>
          </>
        )}
        {activeColorMode === 'activation' && (
          <>
            <span className="text-slate-300 font-sans font-medium">Descriptor Activation (Av)</span>
            <div className="flex items-center gap-1.5">
              <span>Low</span>
              <div className="w-16 h-2 rounded bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-amber-300" />
              <span>High</span>
            </div>
          </>
        )}
        {activeColorMode === 'cpk' && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600 inline-block" /> C</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600 inline-block" /> O</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> N</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> S</span>
          </div>
        )}
      </div>

      {/* Unified Bottom Control Dock (Follows 3D Skill Ergonomic Zero Occlusion Specification) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 max-w-[94%] w-auto flex flex-col items-center">
        {/* Collapse / Expand Toggle Tab */}
        <button
          onClick={() => setIsControlsCollapsed(prev => !prev)}
          className="bg-slate-900/90 border border-slate-700/80 rounded-t-md px-3 py-0.5 text-[11px] text-slate-300 hover:text-white flex items-center gap-1 shadow-md transition-colors"
        >
          {isControlsCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          <span>{isControlsCollapsed ? 'Show Controls' : 'Hide Controls'}</span>
        </button>

        {/* Control Strip */}
        {!isControlsCollapsed && (
          <div className="bg-slate-900/95 border border-slate-800 rounded-xl px-4 py-2 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-center gap-4 text-xs">
            {/* 1. Style Mode Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setStyleMode('ball-stick')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  styleMode === 'ball-stick' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ball & Stick
              </button>
              <button
                onClick={() => setStyleMode('space-filling')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  styleMode === 'space-filling' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Space-Filling
              </button>
              <button
                onClick={() => setStyleMode('wireframe')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  styleMode === 'wireframe' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Wireframe
              </button>
            </div>

            {/* 2. Color Mode Selector */}
            {onColorModeChange && (
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => onColorModeChange('cpk')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeColorMode === 'cpk' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  CPK Colors
                </button>
                <button
                  onClick={() => onColorModeChange('saliency')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeColorMode === 'saliency' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                  title="ChemRegNet Task Saliency (Sv) Output Pathway"
                >
                  Saliency (Sv)
                </button>
                <button
                  onClick={() => onColorModeChange('activation')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeColorMode === 'activation' ? 'bg-slate-800 text-purple-400 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                  title="ChemRegNet Cross-Modal Activation (Av) Pathway"
                >
                  Activation (Av)
                </button>
              </div>
            )}

            {/* 3. Action Buttons */}
            <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
              <button
                onClick={() => setIsAutoRotating(prev => !prev)}
                className={`p-1.5 rounded-lg border border-slate-800 transition-colors ${
                  isAutoRotating ? 'bg-cyan-950/60 text-cyan-400 border-cyan-800' : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
                title={isAutoRotating ? 'Pause rotation' : 'Start auto-rotation'}
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleResetCamera}
                className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                title="Reset Camera Orientation"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleCaptureScreenshot}
                className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                title="Export High-Resolution 3D PNG"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleExportCoordinates}
                className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                title="Download 3D XYZ Conformer"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
