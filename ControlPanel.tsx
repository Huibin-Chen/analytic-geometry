
import React from 'react';
import { EllipsoidParams } from '../App';
import { Sliders, RotateCcw, Target, Info } from 'lucide-react';

interface Props {
  params: EllipsoidParams;
  setParams: React.Dispatch<React.SetStateAction<EllipsoidParams>>;
  canBeCircular: boolean;
  targetTheta: number | null;
  onFind: () => void;
}

export const ControlPanel: React.FC<Props> = ({ params, setParams, canBeCircular, targetTheta, onFind }) => {
  const handleChange = (key: keyof EllipsoidParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-4 text-slate-200">
          <Sliders size={20} className="text-indigo-400" />
          <h2 className="font-semibold">参数调节</h2>
        </div>
        
        <div className="space-y-6">
          <SliderItem 
            label="半轴 a (X轴)" 
            value={params.a} 
            min={1} max={10} step={0.1} 
            onChange={(v) => handleChange('a', v)}
            color="text-red-400"
          />
          <SliderItem 
            label="半轴 b (Y轴)" 
            value={params.b} 
            min={1} max={10} step={0.1} 
            onChange={(v) => handleChange('b', v)}
            color="text-green-400"
          />
          <SliderItem 
            label="半轴 c (Z轴)" 
            value={params.c} 
            min={1} max={10} step={0.1} 
            onChange={(v) => handleChange('c', v)}
            color="text-blue-400"
          />
          <SliderItem 
            label="平面倾角 θ (度)" 
            value={params.theta} 
            min={-180} max={180} step={1} 
            onChange={(v) => handleChange('theta', v)}
            color="text-pink-400"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-700">
        <button 
          onClick={onFind}
          disabled={!canBeCircular}
          className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all font-medium shadow-lg
            ${canBeCircular 
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20' 
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
        >
          <Target size={18} />
          一键定位圆截面
        </button>
        
        <button 
          onClick={() => setParams({ a: 4, b: 6, c: 3, theta: 0 })}
          className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl flex items-center justify-center gap-2 transition-all font-medium"
        >
          <RotateCcw size={18} />
          重置参数
        </button>
      </div>

      {!canBeCircular && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex gap-3">
          <Info size={20} className="text-amber-500 shrink-0" />
          <p className="text-xs text-amber-200/80 leading-relaxed">
            注意：圆截面存在条件是该截面所包含的坐标轴的长度介于另外两个半轴之间。即 $a \in [b, c]$ 或 $a \in [c, b]$。请尝试调整半轴长度。
          </p>
        </div>
      )}
    </div>
  );
};

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  color: string;
}

const SliderItem: React.FC<SliderProps> = ({ label, value, min, max, step, onChange, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-400 font-medium">{label}</span>
      <span className={`font-bold font-mono ${color}`}>{value.toFixed(1)}</span>
    </div>
    <input 
      type="range" 
      min={min} max={max} step={step} 
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
    />
  </div>
);
