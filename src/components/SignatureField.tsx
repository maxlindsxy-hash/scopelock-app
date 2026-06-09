import { useEffect, useRef, useState } from 'react';
import { PenLine, Eraser } from 'lucide-react';

interface Props {
  onSignatureChange: (dataUrl: string) => void;
  disabled?: boolean;
}

export function SignatureField({ onSignatureChange, disabled = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  const relativePos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startStroke = (x: number, y: number) => {
    if (disabled) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    isDrawing.current = true;
    lastPos.current = { x, y };
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const continueStroke = (x: number, y: number) => {
    if (!isDrawing.current || !lastPos.current || disabled) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Smooth bezier curve through midpoint
    const mx = (lastPos.current.x + x) / 2;
    const my = (lastPos.current.y + y) / 2;
    ctx.quadraticCurveTo(lastPos.current.x, lastPos.current.y, mx, my);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mx, my);

    lastPos.current = { x, y };
  };

  const endStroke = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPos.current = null;
    setIsEmpty(false);
    const canvas = canvasRef.current;
    if (canvas) onSignatureChange(canvas.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSignatureChange('');
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const pos = relativePos(e.clientX, e.clientY);
    startStroke(pos.x, pos.y);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    const pos = relativePos(e.clientX, e.clientY);
    continueStroke(pos.x, pos.y);
  };
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const pos = relativePos(e.touches[0].clientX, e.touches[0].clientY);
    startStroke(pos.x, pos.y);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const pos = relativePos(e.touches[0].clientX, e.touches[0].clientY);
    continueStroke(pos.x, pos.y);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">
          <PenLine size={13} className="text-indigo-400" />
          Client Signature
        </label>
        {!isEmpty && (
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1.5 text-xs text-slate-500 px-2.5 py-1.5
                       rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Eraser size={12} />
            Clear
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className={`relative w-full h-32 rounded-xl border-2 overflow-hidden
          ${disabled
            ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
            : isEmpty
              ? 'border-dashed border-slate-300 bg-white cursor-crosshair'
              : 'border-indigo-300 bg-white cursor-crosshair'
          }`}
      >
        {isEmpty && !disabled && (
          <p className="absolute inset-0 flex items-center justify-center
                        text-xs text-slate-400 pointer-events-none select-none">
            Sign here with finger or mouse
          </p>
        )}
        <canvas
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endStroke}
          onMouseLeave={endStroke}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={endStroke}
          className="absolute inset-0 w-full h-full"
          style={{ touchAction: 'none' }}
        />
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        By signing, the client confirms this brief accurately reflects their project
        requirements as discussed.
      </p>
    </div>
  );
}
