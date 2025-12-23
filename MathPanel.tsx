
import React, { useEffect, useRef } from 'react';
import { EllipsoidParams } from '../App';
import renderMathInElement from 'katex/dist/contrib/auto-render';

interface Props {
  params: EllipsoidParams;
  targetTheta: number | null;
}

export const MathPanel: React.FC<Props> = ({ params, targetTheta }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      renderMathInElement(containerRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
        ],
        throwOnError: false,
      });
    }
  }, [params, targetTheta]);

  const { a, b, c } = params;

  return (
    <div ref={containerRef} className="p-6 bg-slate-900/40 text-slate-300 text-sm leading-relaxed border-t border-slate-700">
      <h3 className="text-slate-100 font-bold mb-4 flex items-center gap-2">
        <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
        数学原理推导
      </h3>
      
      <div className="space-y-4">
        <p>标准椭球面方程为：</p>
        <div className="my-3 text-center">
          {/* Use string literals for LaTeX to prevent TS from parsing variables and to handle backslashes correctly */}
          {"$$\\frac{x^2}{a^2} + \\frac{y^2}{b^2} + \\frac{z^2}{c^2} = 1$$"}
        </div>

        <p>过 $x$ 轴的平面方程可表示为：</p>
        <div className="my-3 text-center">
          {"$$y \\sin \\theta - z \\cos \\theta = 0$$"}
        </div>

        <p>在该平面上建立局部坐标系 $(u, v)$，其中 $u = x$，$v$ 为垂直于 $x$ 轴的平面向量，则有：</p>
        <div className="my-3 text-center text-xs">
          {"$x = u, \\quad y = v \\cos \\theta, \\quad z = v \\sin \\theta$"}
        </div>

        <p>代入椭球面方程得交线方程：</p>
        <div className="my-3 text-center">
          {"$$\\frac{u^2}{a^2} + v^2 \\left( \\frac{\\cos^2 \\theta}{b^2} + \\frac{\\sin^2 \\theta}{c^2} \\right) = 1$$"}
        </div>

        <p>若交线为圆，则系数相等：</p>
        <div className="my-3 text-center">
          {"$$\\frac{1}{a^2} = \\frac{\\cos^2 \\theta}{b^2} + \\frac{\\sin^2 \\theta}{c^2}$$"}
        </div>

        <p className="mt-4 pt-4 border-t border-slate-800">
          当 $a=4.0, b=6.0, c=3.0$ 时：
          {targetTheta !== null ? (
            <span className="block mt-2 font-semibold text-emerald-400">
              {/* String literal for LaTeX to ensure backslashes are handled correctly when mixed with variables */}
              {"解得 $\\theta \\approx \\pm$ "}{targetTheta.toFixed(2)}{"$^\\circ$"}
            </span>
          ) : (
            <span className="block mt-2 font-semibold text-rose-400">
              当前参数无实数解
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
