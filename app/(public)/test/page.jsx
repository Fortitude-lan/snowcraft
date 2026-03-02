"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import * as THREE from "three";

/* =======================
   音频分析 Hook
======================= */
function useAudioAnalyzer() {
  const analyzerRef = useRef(null);
  const dataArrayRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyzer = audioCtx.createAnalyser();
      analyzer.fftSize = 256;
      analyzer.smoothingTimeConstant = 0.8;
      source.connect(analyzer);
      analyzerRef.current = analyzer;
      dataArrayRef.current = new Uint8Array(analyzer.frequencyBinCount);
      setIsListening(true);
      setError(null);
    } catch (e) {
      setError("无法访问麦克风，请允许权限后重试");
    }
  }, []);

  // 返回当前音量 0~1
  const getVolume = useCallback(() => {
    if (!analyzerRef.current || !dataArrayRef.current) return 0;
    analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
    const arr = dataArrayRef.current;
    let sum = 0;
    for (let i = 0; i < arr.length; i++) sum += arr[i];
    return sum / arr.length / 255;
  }, []);

  // 返回频率分布数组 (低/中/高)
  const getBands = useCallback(() => {
    if (!analyzerRef.current || !dataArrayRef.current) return [0, 0, 0];
    analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
    const arr = dataArrayRef.current;
    const third = Math.floor(arr.length / 3);
    let low = 0, mid = 0, high = 0;
    for (let i = 0; i < third; i++) low += arr[i];
    for (let i = third; i < third * 2; i++) mid += arr[i];
    for (let i = third * 2; i < arr.length; i++) high += arr[i];
    const norm = third * 255;
    return [low / norm, mid / norm, high / norm];
  }, []);

  return { start, getVolume, getBands, isListening, error };
}

/* =======================
   粒子球组件
======================= */
function AudioSphere({ getVolume, getBands, isListening }) {
  const ref = useRef();
  const count = 5000;
  const smoothVol = useRef(0);
  const smoothBands = useRef([0, 0, 0]);

  // 原始球面坐标（单位球）
  const basePositions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = Math.cos(phi);
    }
    return pos;
  }, []);

  // 每个粒子的随机相位偏移，增加有机感
  const phases = useMemo(() => {
    return new Float32Array(count).map(() => Math.random() * Math.PI * 2);
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (!ref.current) return;

    // 平滑音量
    const rawVol = getVolume();
    smoothVol.current += (rawVol - smoothVol.current) * 0.15;
    const vol = smoothVol.current;

    const rawBands = getBands();
    for (let b = 0; b < 3; b++) {
      smoothBands.current[b] += (rawBands[b] - smoothBands.current[b]) * 0.12;
    }
    const [low, mid, high] = smoothBands.current;

    const positions = ref.current.geometry.attributes.position.array;
    const radius = 1.5;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const bx = basePositions[i3];
      const by = basePositions[i3 + 1];
      const bz = basePositions[i3 + 2];
      const phase = phases[i];

      // 极坐标角度 (用于分频)
      const elevation = Math.asin(Math.max(-1, Math.min(1, by)));
      const normalizedElev = (elevation + Math.PI / 2) / Math.PI; // 0~1

      // 冥想涟漪波：多层叠加
      // 1. 低频：大幅慢波，整体膨胀
      const lowWave = low * 0.6 * Math.sin(time * 1.2 + phase * 0.5);
      // 2. 中频：中频涟漪，极坐标传播
      const latitudeWave = mid * 0.4 * Math.sin(normalizedElev * Math.PI * 6 - time * 2.5 + phase * 0.3);
      // 3. 高频：细小高频颤动
      const highWave = high * 0.25 * Math.sin(phase * 8 + time * 5);
      // 4. 基础呼吸（静止时也有微弱动感）
      const breathe = 0.04 * Math.sin(time * 0.8 + phase);

      const displacement = 1 + lowWave + latitudeWave + highWave + breathe;
      const r = radius * Math.max(0.5, displacement);

      positions[i3] = bx * r;
      positions[i3 + 1] = by * r;
      positions[i3 + 2] = bz * r;
    }

    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y += 0.001 + vol * 0.008;
    ref.current.rotation.x = Math.sin(time * 0.3) * 0.05;
  });

  // 粒子颜色随音量变化（通过 PointMaterial color 不能动态改，用 vertexColors 代替）
  const colorArray = useMemo(() => {
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;
    }
    return colors;
  }, []);

  // 每帧更新颜色
  useFrame(() => {
    if (!ref.current) return;
    const vol = smoothVol.current;
    const [low, , high] = smoothBands.current;
    const colors = ref.current.geometry.attributes.color?.array;
    if (!colors) return;

    // 冥想色：蓝白 → 青白 → 暖白（随音量）
    const r = 0.6 + vol * 0.4 + high * 0.3;
    const g = 0.8 + vol * 0.2;
    const b = 1.0;
    for (let i = 0; i < count; i++) {
      colors[i * 3] = Math.min(1, r);
      colors[i * 3 + 1] = Math.min(1, g);
      colors[i * 3 + 2] = b;
    }
    ref.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={basePositions.slice()}>
      <bufferAttribute
        attach="geometry-attributes-color"
        args={[colorArray, 3]}
      />
      <PointMaterial
        transparent
        vertexColors
        size={0.018}
        sizeAttenuation
        depthWrite={false}
        opacity={0.85}
      />
    </Points>
  );
}

/* =======================
   外圈涟漪环（纯 CSS，增强冥想感）
======================= */
function RippleRings({ isListening }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: `${320 + i * 80}px`,
            height: `${320 + i * 80}px`,
            borderRadius: "50%",
            border: `1px solid rgba(180,220,255,${0.15 - i * 0.03})`,
            animation: isListening
              ? `ripplePulse ${2 + i * 0.6}s ease-in-out infinite`
              : `gentlePulse ${4 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

/* =======================
   首页
======================= */
export default function Home() {
  const { start, getVolume, getBands, isListening, error } = useAudioAnalyzer();

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        backgroundImage: "url('/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#04080f",
      }}
    >
      <style>{`
        @keyframes ripplePulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 0.3; }
        }
        @keyframes gentlePulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.03); opacity: 0.2; }
        }
      `}</style>

      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* 涟漪环 */}
      <RippleRings isListening={isListening} />

      {/* R3F Canvas */}
      <Canvas camera={{ position: [0, 0, 4] }} style={{ position: "absolute", inset: 0 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 3]} intensity={1} color="#88ccff" />
        <AudioSphere getVolume={getVolume} getBands={getBands} isListening={isListening} />
      </Canvas>

      {/* 文字 */}
      <div className="absolute inset-0 flex flex-col items-center justify-between pointer-events-none py-16">
        <div />
        <h1
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: "clamp(18px, 3vw, 28px)",
            fontWeight: 200,
            letterSpacing: "0.5em",
            textShadow: "0 0 30px rgba(120,200,255,0.6)",
            fontFamily: "'Gill Sans', 'Optima', serif",
          }}
        >
          MAGIC MIRROR
        </h1>

        {/* 底部按钮 */}
        <button
          onClick={start}
          disabled={isListening}
          style={{
            pointerEvents: "auto",
            padding: "10px 32px",
            borderRadius: "999px",
            border: "1px solid rgba(160,210,255,0.5)",
            background: isListening
              ? "rgba(80,180,255,0.15)"
              : "rgba(255,255,255,0.08)",
            color: isListening ? "rgba(120,220,255,0.9)" : "rgba(255,255,255,0.7)",
            fontSize: "13px",
            letterSpacing: "0.25em",
            cursor: isListening ? "default" : "pointer",
            backdropFilter: "blur(8px)",
            transition: "all 0.4s ease",
            textTransform: "uppercase",
          }}
        >
          {isListening ? "● 正在聆听" : "开启语音感知"}
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{
            color: "rgba(255,120,120,0.9)",
            fontSize: "13px",
            letterSpacing: "0.1em",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}