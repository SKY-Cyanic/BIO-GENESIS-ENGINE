import React from 'react';
import { AlertTriangle, Ban, ScanLine } from 'lucide-react';

interface World3DProps {
  imageUrl: string;
  name: string;
}

const World3D: React.FC<World3DProps> = ({ imageUrl, name }) => {
  return (
    <div className="w-full h-[500px] bg-black rounded-lg overflow-hidden border border-red-900/30 relative shadow-2xl shadow-red-900/10 flex flex-col items-center justify-center p-6">
       
       {/* Background Grid Effect (Static) */}
       <div className="absolute inset-0 opacity-20" 
            style={{ 
                backgroundImage: 'linear-gradient(#331111 1px, transparent 1px), linear-gradient(90deg, #331111 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
            }}>
       </div>

       {/* Error UI */}
       <div className="z-10 flex flex-col items-center text-center space-y-6 max-w-md animate-pulse">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 rounded-full"></div>
            <Ban size={64} className="text-red-500 relative z-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-red-500 tracking-widest uppercase font-mono">
              Simulation Failed
            </h2>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-red-900 to-transparent"></div>
            <p className="text-red-400 font-mono text-sm">
              지금은 3D 모델을 시뮬레이션 할 수 없습니다.
            </p>
            <p className="text-red-900/60 text-xs font-mono pt-2">
              ERROR_CODE: RENDER_ENGINE_OFFLINE
            </p>
          </div>
       </div>

       {/* Decorative Corners */}
       <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-red-800"></div>
       <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-red-800"></div>
       <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-red-800"></div>
       <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-red-800"></div>

       <div className="absolute bottom-4 flex items-center gap-2 text-red-900/50 font-mono text-[10px]">
          <ScanLine size={12} />
          <span>HOLOGRAPHIC PROJECTION SYSTEM :: TERMINATED</span>
       </div>
    </div>
  );
};

export default World3D;