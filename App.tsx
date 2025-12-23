
import React, { useState, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Info, Calculator, RefreshCw, HelpCircle, BookOpen } from 'lucide-react';
import { EllipsoidScene } from './components/EllipsoidScene';
import { ControlPanel } from './components/ControlPanel';
import { MathPanel } from './components/MathPanel';
import { ChatAssistant } from './components/ChatAssistant';

export interface EllipsoidParams {
  a: number;
  b: number;
  c: number;
  theta: number; // Plane angle in degrees around X-axis
}

const App: React.FC = () => {
  const [params, setParams] = useState<EllipsoidParams>({
    a: 4,
    b: 6,
    c: 3,
    theta: 0,
  });

  const [isAutoFinding, setIsAutoFinding] = useState(false);
  const [showMath, setShowMath] = useState(true);
  const [showChat, setShowChat] = useState(false);

  // Check if circular section is possible through X-axis
  // Condition: a must be between b and c
  const canBeCircular = useMemo(() => {
    const { a, b, c } = params;
    return (a >= b && a <= c) || (a <= b && a >= c);
  }, [params.a, params.b, params.c]);

  // Calculate the target theta for circular section
  const targetTheta = useMemo(() => {
    if (!canBeCircular) return null;
    const { a, b, c } = params;
    if (b === c) return null; // Already a surface of revolution if a matches
    
    // 1/a^2 = (cos^2 θ)/b^2 + (sin^2 θ)/c^2
    // Let S = sin^2 θ
    // 1/a^2 = (1-S)/b^2 + S/c^2
    // 1/a^2 - 1/b^2 = S (1/c^2 - 1/b^2)
    const sinSq = (1/(a*a) - 1/(b*b)) / (1/(c*c) - 1/(b*b));
    if (sinSq < 0 || sinSq > 1) return null;
    
    const angleRad = Math.asin(Math.sqrt(sinSq));
    return (angleRad * 180) / Math.PI;
  }, [params.a, params.b, params.c, canBeCircular]);

  const findCircularSection = () => {
    if (targetTheta !== null) {
      setParams(prev => ({ ...prev, theta: targetTheta }));
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 flex flex-col md:flex-row overflow-hidden">
      {/* Header for Branding */}
      <header className="absolute top-0 left-0 w-full z-10 p-4 pointer-events-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between pointer-events-auto bg-slate-900/40 backdrop-blur-md rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Calculator className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">解析几何：椭球面圆截面动态演示</h1>
              <p className="text-xs text-slate-400">南京师范大学数学科学学院 · 陈慧斌副教授</p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
             <button 
              onClick={() => setShowMath(!showMath)}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium ${showMath ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <BookOpen size={18} />
              {showMath ? '隐藏原理' : '显示原理'}
            </button>
            <button 
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium ${showChat ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <HelpCircle size={18} />
              AI 助教
            </button>
          </div>
        </div>
      </header>

      {/* 3D Scene */}
      <div className="flex-grow relative h-[50vh] md:h-full">
        <Canvas shadows gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault position={[12, 8, 12]} fov={45} />
          <OrbitControls makeDefault />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />

          <EllipsoidScene params={params} />
          
          <Grid 
            infiniteGrid 
            fadeDistance={50} 
            fadeStrength={5} 
            cellSize={1} 
            sectionSize={5} 
            sectionThickness={1.5}
            sectionColor="#334155"
            cellColor="#1e293b"
          />

          <group>
            <Text position={[10, 0, 0]} color="#ef4444" fontSize={0.6}>X</Text>
            <Text position={[0, 10, 0]} color="#22c55e" fontSize={0.6}>Y</Text>
            <Text position={[0, 0, 10]} color="#3b82f6" fontSize={0.6}>Z</Text>
          </group>
        </Canvas>

        {/* Status Overlay */}
        <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2">
          {canBeCircular ? (
            <div className="bg-emerald-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2 animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              当前参数支持存在圆截面
            </div>
          ) : (
            <div className="bg-amber-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              当前参数无圆截面 (x轴截面)
            </div>
          )}
        </div>
      </div>

      {/* Panels container */}
      <div className="w-full md:w-[400px] h-full flex flex-col bg-slate-800/80 backdrop-blur-xl border-l border-slate-700/50 overflow-y-auto z-20">
        <ControlPanel 
          params={params} 
          setParams={setParams} 
          canBeCircular={canBeCircular}
          targetTheta={targetTheta}
          onFind={findCircularSection}
        />
        
        {showMath && <MathPanel params={params} targetTheta={targetTheta} />}
      </div>

      {/* Chat Overlay */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 pointer-events-none">
          <div className="w-full max-w-2xl pointer-events-auto h-[80vh]">
            <ChatAssistant onClose={() => setShowChat(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
