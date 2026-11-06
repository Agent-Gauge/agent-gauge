---
name: ui-ux-pro-max
description: Premium 3D UI/UX design intelligence skill powered by the GetLayers.ai Obsidian Prism theme, React Bits interactive components, Lenis smooth inertial scrolling, and GSAP 3D ScrollTrigger motion physics. Activate when designing, building, or upgrading web interfaces, dashboards, or interactive data visualizations.
---

# 💎 UI/UX Pro Max (`ui-ux-pro-max`) — GetLayers.ai × React Bits × GSAP 3D

## Core Aesthetic Philosophy: GetLayers.ai "Obsidian Prism 3D"
Every interface must feel tactile, dimensional, and alive—combining **spatial 3D depth (`perspective: 1200px`, `transform-style: preserve-3d`)** with **deterministic 60fps motion physics (`Lenis` + `GSAP`)** and **React Bits** micro-interactions.

### 1. Unified Color & Lighting Tokens (Single Cohesive Theme)
| Token Role | Hex / Value | Usage |
| :--- | :--- | :--- |
| **Canvas Void (`bg-void`)** | `#040509` | Primary deep-space background canvas |
| **Elevated Glass (`bg-glass`)** | `rgba(13, 16, 28, 0.72)` | `backdrop-blur-xl` 3D cards with specular rim |
| **Specular Rim Border** | `rgba(255, 255, 255, 0.08)` | Top-edge highlight + radial cursor spotlight |
| **Primary Accent (`violet-prism`)** | `#7C5CFF` | Balanced tier, primary CTAs, 3D core energy |
| **Secondary Accent (`cyan-flux`)** | `#00F0FF` | Blast-radius graphs, active telemetry vectors |
| **Success Accent (`emerald-neon`)** | `#10F5A0` | Fast tier, git diff survival, cost savings |
| **Critical Accent (`amber-flare`)** | `#FF9E2C` | Deep tier (Opus/Pro High), high-risk lock alerts |

---

### 2. Required Motion & 3D Stack

1. **Lenis Inertial Smooth Scrolling (`lenis`):**
   - Sync `Lenis` directly with `gsap.ticker` (`lagSmoothing(0)`) so scroll-linked 3D parallax and `ScrollTrigger` scrubbing operate with zero jitter.
2. **GSAP 3D Choreography (`gsap` + `ScrollTrigger`):**
   - Section entrances use 3D perspective reveals (`fromTo({ opacity: 0, y: 48, rotateX: 10 }, { opacity: 1, y: 0, rotateX: 0, ease: 'power3.out' })`).
   - Numeric changes (scores, USD saved, latency, survival %) tween smoothly via `gsap.to`.
3. **React Bits Interactive Primitives:**
   - **`<Tilt3DSpotlightCard>`:** Combines 3D mouse-tilt rotation (`rotateX`, `rotateY`) with a radial cursor-tracking spotlight border.
   - **`<DecryptedText>`:** Matrix/cipher character-scramble effect on headings and status badges.
   - **`<MagnetButton>`:** Cursor-attracted magnetic pull on primary interactive triggers.
   - **`<CountUpMetric>`:** Spring-interpolated numeric counters for live telemetry KPIs.
   - **`<Neural3DPrismCanvas>`:** Interactive 3D wireframe + particle routing topology that reacts to pointer coordinates and live task complexity scores.
4. **Component-Driven Data Storytelling:**
   - Never dump raw numbers in plain text tables when an interactive component can express proportion, motion, and hierarchy: use **3D Radial Gauges**, **Segmented Tier Rings**, **Animated Multi-Axis Radar/Vector Bars**, and **Interactive Node-Flow Pipelines**.

