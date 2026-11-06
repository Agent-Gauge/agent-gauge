'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ==========================================================================
   1. LENIS SMOOTH SCROLL + GSAP TICKER SYNC + TOP NEON PROGRESS LASER
   ========================================================================== */
export function LenisSmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const cursorAuraRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });

    lenis.on('scroll', (e: { progress: number }) => {
      ScrollTrigger.update();
      setScrollProgress(Math.min(100, Math.max(0, e.progress * 100)));
    });

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    const handleMouseMove = (ev: MouseEvent) => {
      if (cursorAuraRef.current) {
        gsap.to(cursorAuraRef.current, {
          x: ev.clientX - 220,
          y: ev.clientY - 220,
          duration: 0.65,
          ease: 'power3.out',
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Top Neon Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[100] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#10F5A0] via-[#00F0FF] to-[#10F5A0] shadow-[0_0_16px_#00F0FF]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Ambient 3D Cursor Glow */}
      <div
        ref={cursorAuraRef}
        className="pointer-events-none fixed top-0 left-0 w-[440px] h-[440px] rounded-full opacity-20 blur-[90px] z-0"
        style={{
          background:
            'radial-gradient(circle, rgba(16,245,160,0.40) 0%, rgba(0,240,255,0.22) 45%, transparent 70%)',
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ==========================================================================
   2. REACT BITS: TILT 3D + SPOTLIGHT BORDER CARD (<Tilt3DSpotlightCard>)
   ========================================================================== */
export interface Tilt3DSpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  maxTiltDeg?: number;
  onClick?: () => void;
}

export function Tilt3DSpotlightCard({
  children,
  className = '',
  accentColor = 'rgba(16, 245, 160, 0.28)',
  maxTiltDeg = 6,
  onClick,
}: Tilt3DSpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [spotPos, setSpotPos] = useState({ x: 0, y: 0, opacity: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const normX = relX / rect.width - 0.5;
    const normY = relY / rect.height - 0.5;

    setSpotPos({ x: relX, y: relY, opacity: 1 });

    gsap.to(el, {
      rotateY: normX * maxTiltDeg * 2,
      rotateX: -normY * maxTiltDeg * 2,
      transformPerspective: 1200,
      duration: 0.35,
      ease: 'power2.out',
    });
  };

  const handlePointerLeave = () => {
    setSpotPos((prev) => ({ ...prev, opacity: 0 }));
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.75,
        ease: 'elastic.out(1, 0.5)',
      });
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative rounded-2xl layers-glass preserve-3d overflow-hidden transition-shadow duration-300 ${className}`}
    >
      {/* Dynamic Cursor-Tracked Spotlight Overlay */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
        style={{
          opacity: spotPos.opacity,
          background: `radial-gradient(480px circle at ${spotPos.x}px ${spotPos.y}px, ${accentColor}, transparent 65%)`,
        }}
      />
      {/* Top Specular Prism Rim */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

/* ==========================================================================
   3. REACT BITS: DECRYPTED / SCRAMBLE TEXT (<DecryptedText>)
   ========================================================================== */
const CIPHER_GLYPHS = '⚡01/#%<>ΔΣΩΞΨΦ89X';

export function DecryptedText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef<number | null>(null);

  const triggerScramble = () => {
    let iteration = 0;
    if (frameRef.current) clearInterval(frameRef.current);
    frameRef.current = window.setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((char, idx) => {
            if (char === ' ') return ' ';
            if (idx < iteration) return text[idx];
            return CIPHER_GLYPHS[Math.floor(Math.random() * CIPHER_GLYPHS.length)];
          })
          .join('')
      );
      iteration += Math.max(1, text.length / 14);
      if (iteration >= text.length && frameRef.current) {
        clearInterval(frameRef.current);
        setDisplay(text);
      }
    }, 26);
  };

  useEffect(() => {
    triggerScramble();
    return () => {
      if (frameRef.current) clearInterval(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <span onMouseEnter={triggerScramble} className={`inline-block cursor-default ${className}`}>
      {display}
    </span>
  );
}

/* ==========================================================================
   4. REACT BITS: GSAP COUNT-UP METRIC (<CountUpMetric>)
   ========================================================================== */
export function CountUpMetric({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [rendered, setRendered] = useState(value);
  const objRef = useRef({ val: value });

  useEffect(() => {
    gsap.to(objRef.current, {
      val: value,
      duration: 0.65,
      ease: 'power3.out',
      onUpdate: () => {
        setRendered(Number(objRef.current.val.toFixed(decimals)));
      },
    });
  }, [value, decimals]);

  return (
    <span className={className}>
      {prefix}
      {rendered.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ==========================================================================
   5. REACT BITS: MAGNETIC SPRING BUTTON (<MagnetButton>)
   ========================================================================== */
export function MagnetButton({
  children,
  className = '',
  onClick,
  strength = 0.28,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
}) {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
    gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power3.out' });
  };

  const handleLeave = () => {
    if (!btnRef.current) return;
    gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
    >
      {children}
    </button>
  );
}

/* ==========================================================================
   6. INTERACTIVE 3D NEURAL ROUTING POLYHEDRON CANVAS (<Neural3DPrismCanvas>)
   ========================================================================== */
export function Neural3DPrismCanvas({
  score = 48,
  tier = 'balanced',
  height = 240,
}: {
  score?: number;
  tier?: 'fast' | 'balanced' | 'deep';
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angleX = 0.4;
    let angleY = 0.6;

    const palette =
      tier === 'fast'
        ? { primary: '#10F5A0', secondary: '#00F0FF', glow: 'rgba(16, 245, 160, 0.45)' }
        : tier === 'deep'
          ? { primary: '#00F0FF', secondary: '#10F5A0', glow: 'rgba(0, 240, 255, 0.45)' }
          : { primary: '#10F5A0', secondary: '#00F0FF', glow: 'rgba(16, 245, 160, 0.45)' };

    // Golden ratio icosahedron vertices in 3D space
    const phi = (1 + Math.sqrt(5)) / 2;
    const rawVertices: Array<[number, number, number]> = [
      [-1, phi, 0],
      [1, phi, 0],
      [-1, -phi, 0],
      [1, -phi, 0],
      [0, -1, phi],
      [0, 1, phi],
      [0, -1, -phi],
      [0, 1, -phi],
      [phi, 0, -1],
      [phi, 0, 1],
      [-phi, 0, -1],
      [-phi, 0, 1],
    ];

    // Connect vertices within threshold distance to form 30 icosahedron edges
    const edges: Array<[number, number]> = [];
    for (let i = 0; i < rawVertices.length; i++) {
      for (let j = i + 1; j < rawVertices.length; j++) {
        const dx = rawVertices[i][0] - rawVertices[j][0];
        const dy = rawVertices[i][1] - rawVertices[j][1];
        const dz = rawVertices[i][2] - rawVertices[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 2.15) {
          edges.push([i, j]);
        }
      }
    }

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const speedBoost = 0.006 + (score / 100) * 0.012;
      angleY += speedBoost + mouseRef.current.x * 0.015;
      angleX += speedBoost * 0.65 + mouseRef.current.y * 0.015;

      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) * 0.25;

      // Ambient center core glow
      const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, scale * 1.45);
      grad.addColorStop(0, palette.glow);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Project 3D vertices to 2D perspective plane
      const projected = rawVertices.map(([vx, vy, vz]) => {
        // Rotate around X
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const y1 = vy * cosX - vz * sinX;
        const z1 = vy * sinX + vz * cosX;

        // Rotate around Y
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const x2 = vx * cosY + z1 * sinY;
        const z2 = -vx * sinY + z1 * cosY;

        const perspective = 4.2 / (4.2 - z2 * 0.45);
        return {
          x: cx + x2 * scale * perspective,
          y: cy + y1 * scale * perspective,
          z: z2,
          p: perspective,
        };
      });

      // Draw 3D wireframe edges
      for (const [a, b] of edges) {
        const pa = projected[a];
        const pb = projected[b];
        const depthAlpha = Math.max(0.16, Math.min(0.88, (pa.z + pb.z + 4) / 6));
        ctx.strokeStyle = palette.primary;
        ctx.globalAlpha = depthAlpha;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }

      // Draw glowing 3D vertices
      for (const pt of projected) {
        ctx.globalAlpha = Math.max(0.35, Math.min(1, (pt.z + 2.5) / 4));
        ctx.fillStyle = palette.secondary;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.8 * pt.p, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [score, tier]);

  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseRef.current = {
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        };
      }}
      onMouseLeave={() => {
        mouseRef.current = { x: 0, y: 0 };
      }}
      style={{ height }}
      className="relative w-full rounded-xl overflow-hidden bg-[#050711]/90 border border-white/10 cursor-grab active:cursor-grabbing"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="pointer-events-none absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>3D AST/Graph Topology Core</span>
        <span className="text-[#00F0FF]">Interactive 3D Tilt · Score {score}/100</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   7. INTERACTIVE 4-AXIS COMPLEXITY RADAR CHART (<InteractiveRadarVectorChart>)
   ========================================================================== */
export function InteractiveRadarVectorChart({
  intentScore,
  blastScore,
  structuralScore,
  repoRiskScore,
}: {
  intentScore: number; // 0-35
  blastScore: number; // 0-30
  structuralScore: number; // 0-20
  repoRiskScore: number; // 0-15
}) {
  // Normalize each dimension to [0.12 .. 1.0]
  const nIntent = Math.max(0.12, Math.min(1, intentScore / 35));
  const nBlast = Math.max(0.12, Math.min(1, blastScore / 30));
  const nStruct = Math.max(0.12, Math.min(1, structuralScore / 20));
  const nRepo = Math.max(0.12, Math.min(1, repoRiskScore / 15));

  const cx = 110;
  const cy = 110;
  const maxR = 76;

  // Top: Intent, Right: Blast, Bottom: Structural, Left: RepoRisk
  const pTop = `${cx},${cy - nIntent * maxR}`;
  const pRight = `${cx + nBlast * maxR},${cy}`;
  const pBottom = `${cx},${cy + nStruct * maxR}`;
  const pLeft = `${cx - nRepo * maxR},${cy}`;
  const polygonPoints = `${pTop} ${pRight} ${pBottom} ${pLeft}`;

  return (
    <div className="relative flex flex-col items-center justify-center p-3 rounded-xl bg-[#050711]/90 border border-white/10">
      <svg viewBox="0 0 220 220" className="w-44 h-44 overflow-visible">
        {/* Concentric reference diamonds */}
        {[0.33, 0.66, 1.0].map((r) => (
          <polygon
            key={r}
            points={`${cx},${cy - maxR * r} ${cx + maxR * r},${cy} ${cx},${cy + maxR * r} ${cx - maxR * r},${cy}`}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        ))}
        {/* Crosshair axes */}
        <line x1={cx} y1={cy - maxR} x2={cx} y2={cy + maxR} stroke="rgba(255,255,255,0.1)" />
        <line x1={cx - maxR} y1={cy} x2={cx + maxR} y2={cy} stroke="rgba(255,255,255,0.1)" />

        {/* Active 4-Dimension Vector Polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(124, 92, 255, 0.28)"
          stroke="#00F0FF"
          strokeWidth="2"
          className="transition-all duration-300 ease-out"
        />

        {/* Vertex Dots */}
        <circle cx={cx} cy={cy - nIntent * maxR} r="4" fill="#7C5CFF" />
        <circle cx={cx + nBlast * maxR} cy={cy} r="4" fill="#00F0FF" />
        <circle cx={cx} cy={cy + nStruct * maxR} r="4" fill="#10F5A0" />
        <circle cx={cx - nRepo * maxR} cy={cy} r="4" fill="#FF9E2C" />

        {/* Axis Labels */}
        <text x={cx} y={18} textAnchor="middle" className="fill-indigo-300 text-[9px] font-mono">
          INTENT ({intentScore}/35)
        </text>
        <text x={212} y={cy + 3} textAnchor="end" className="fill-cyan-300 text-[9px] font-mono">
          BLAST ({blastScore}/30)
        </text>
        <text x={cx} y={208} textAnchor="middle" className="fill-emerald-300 text-[9px] font-mono">
          AST ({structuralScore}/20)
        </text>
        <text x={8} y={cy + 3} textAnchor="start" className="fill-amber-300 text-[9px] font-mono">
          RISK ({repoRiskScore}/15)
        </text>
      </svg>
    </div>
  );
}

