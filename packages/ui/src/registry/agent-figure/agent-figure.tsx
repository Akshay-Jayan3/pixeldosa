"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * What the agent is doing, as a pose. Every pose maps to something a run really does —
 * there are no moods. `confident`, `probable` and `unsure` are for handing over a result
 * and must be driven by the system's real confidence, never picked to reassure.
 */
export type AgentPose =
  | "idle"
  | "listening"
  | "thinking"
  | "planning"
  | "searching"
  | "reading"
  | "comparing"
  | "working"
  | "asking"
  | "blocked"
  | "done"
  | "confident"
  | "probable"
  | "unsure";

type Turn = "agent" | "person";

const POSES: Record<AgentPose, { label: string; turn: Turn }> = {
  idle: { label: "Ready", turn: "person" },
  listening: { label: "Listening", turn: "agent" },
  thinking: { label: "Thinking", turn: "agent" },
  planning: { label: "Planning", turn: "agent" },
  searching: { label: "Searching", turn: "agent" },
  reading: { label: "Reading", turn: "agent" },
  comparing: { label: "Comparing options", turn: "agent" },
  working: { label: "Working", turn: "agent" },
  asking: { label: "Needs your input", turn: "person" },
  blocked: { label: "Blocked", turn: "person" },
  done: { label: "Done", turn: "person" },
  confident: { label: "Confident in this result", turn: "person" },
  probable: { label: "Probably right, worth a check", turn: "person" },
  unsure: { label: "Not sure about this result", turn: "person" },
};

const SIZES = {
  figure: { sm: 48, md: 96, lg: 160 },
  mark: { sm: 16, md: 24, lg: 32 },
} as const;

export interface AgentFigureProps extends Omit<React.ComponentPropsWithoutRef<"span">, "children"> {
  pose: AgentPose;
  /** `figure` is the whole character; `mark` is the head alone, for inline status and avatars. */
  variant?: "figure" | "mark";
  size?: "sm" | "md" | "lg";
  /**
   * What the pose means, in words. Defaults to the pose's own label. Read by assistive
   * technology, and shown beside the figure unless `hideLabel` is set.
   */
  label?: string;
  hideLabel?: boolean;
  /** Where the visible label sits. */
  labelPosition?: "end" | "below";
  /**
   * Announce label changes through a polite live region. Off by default: most products
   * already announce status elsewhere (Live Status Line, Agent Presence), and two
   * channels saying the same thing is worse than one.
   */
  announce?: boolean;
  /** Hold the pen lines still even while the agent is busy. */
  still?: boolean;
}

/* ─── Hand-drawn lines ──────────────────────────────────────────────────────────────
   Each stroke is a polyline nudged off its true path by a seeded wobble, then smoothed
   with Catmull-Rom curves. The seed is fixed per stroke, so the drawing is identical on
   the server and the client. While the agent is busy the seed changes every frame —
   the "line boil" of hand-drawn animation — and it stops the moment it's your turn. */

type Point = readonly [number, number];

function random(seed: number) {
  let s = seed >>> 0 || 1;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

const fmt = (n: number) => n.toFixed(2);

function wobble(points: readonly Point[], seed: number, closed: boolean, amp: number): string {
  const next = random(seed);
  const list = closed ? [...points, points[0]!] : points;
  const pts: Point[] = [];
  for (let i = 0; i < list.length - 1; i++) {
    const [x1, y1] = list[i]!;
    const [x2, y2] = list[i + 1]!;
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = -(y2 - y1) / len;
    const ny = (x2 - x1) / len;
    const steps = Math.max(1, Math.round(len / 7));
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      const o = (next() - 0.5) * 2 * amp;
      pts.push([x1 + (x2 - x1) * t + nx * o, y1 + (y2 - y1) * t + ny * o]);
    }
  }
  const [lx, ly] = list[list.length - 1]!;
  pts.push(closed ? pts[0]! : [lx + (next() - 0.5) * amp, ly + (next() - 0.5) * amp]);

  let d = `M${fmt(pts[0]![0])} ${fmt(pts[0]![1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    d += ` C${fmt(p1[0] + (p2[0] - p0[0]) / 6)} ${fmt(p1[1] + (p2[1] - p0[1]) / 6)} ${fmt(
      p2[0] - (p3[0] - p1[0]) / 6
    )} ${fmt(p2[1] - (p3[1] - p1[1]) / 6)} ${fmt(p2[0])} ${fmt(p2[1])}`;
  }
  return closed ? `${d}Z` : d;
}

function roundedRect(x: number, y: number, w: number, h: number, r: number): Point[] {
  const out: Point[] = [];
  const corner = (cx: number, cy: number, from: number) => {
    for (let i = 0; i <= 2; i++) {
      const a = from + (i * Math.PI) / 4;
      out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  };
  corner(x + w - r, y + r, -Math.PI / 2);
  corner(x + w - r, y + h - r, 0);
  corner(x + r, y + h - r, Math.PI / 2);
  corner(x + r, y + r, Math.PI);
  return out;
}

function circle(cx: number, cy: number, r: number, n = 10): Point[] {
  return Array.from({ length: n }, (_, i) => [
    cx + r * Math.cos((i / n) * Math.PI * 2),
    cy + r * Math.sin((i / n) * Math.PI * 2),
  ]);
}

const INK = "var(--foreground)";
const PAPER = "var(--card)";
const PENCIL = "var(--muted-foreground)";

type Part =
  | { kind: "path"; d: string; stroke: string; width: number; fill?: string; opacity?: number }
  | { kind: "dot"; x: number; y: number; r: number; fill: string }
  | { kind: "glyph"; x: number; y: number; size: number; fill: string; text: string };

interface Stroke {
  color?: string;
  width?: number;
  amp?: number;
}

function createPen(seed: string) {
  const parts: Part[] = [];
  return {
    parts,
    line(name: string, pts: readonly Point[], o: Stroke = {}) {
      parts.push({
        kind: "path",
        d: wobble(pts, hash(seed + name), false, o.amp ?? 0.45),
        stroke: o.color ?? INK,
        width: o.width ?? 1.8,
      });
    },
    shape(name: string, pts: readonly Point[], o: Stroke & { fill?: string } = {}) {
      parts.push({
        kind: "path",
        d: wobble(pts, hash(seed + name), true, o.amp ?? 0.45),
        stroke: o.color ?? INK,
        width: o.width ?? 1.8,
        fill: o.fill ?? PAPER,
      });
    },
    dot(x: number, y: number, r = 1.7, fill = INK) {
      parts.push({ kind: "dot", x, y, r, fill });
    },
    glyph(x: number, y: number, text: string, size: number, fill: string) {
      parts.push({ kind: "glyph", x, y, text, size, fill });
    },
  };
}

type Pen = ReturnType<typeof createPen>;

/**
 * The character on a 64×64 sheet: a boxy head with dot eyes, a small body, stick limbs,
 * and one prop per pose. `frame` drives both the line boil and the few stepped
 * movements (eyes scanning, a key press); it is always 0 when the figure is still.
 */
function drawFigure(pose: AgentPose, frame: number, boil: boolean) {
  const pen = createPen(`${pose}:${boil ? Math.floor(frame / 2) : 0}:`);
  let gaze: Point = [0, 0];
  let eyes: "open" | "closed" | "happy" = "open";
  let tilt = 0;
  let armL: Point[] = [[24, 36], [19, 42], [18, 46]];
  let armR: Point[] = [[40, 36], [45, 42], [46, 46]];

  switch (pose) {
    case "idle":
      armR = [[40, 36], [46, 32], [49, 26]];
      gaze = [0.3, 0];
      break;
    case "listening":
      gaze = [0, 0.2];
      break;
    case "thinking":
      gaze = [0.8, -1];
      tilt = -6;
      armR = [[40, 36], [42, 32], [37, 30]];
      break;
    case "planning":
      gaze = [0, 1];
      armL = [[24, 36], [21, 42], [23, 45]];
      armR = [[40, 36], [43, 42], [41, 45]];
      break;
    case "searching":
      gaze = [[-0.2, 0.6, 1][frame % 3]!, 0.2];
      armR = [[40, 36], [46, 33], [48, 30]];
      break;
    case "reading":
      gaze = [[-1, 0, 1][frame % 3]!, 0.8];
      armL = [[24, 36], [23, 42], [26, 44]];
      armR = [[40, 36], [42, 42], [40, 44]];
      break;
    case "comparing":
      gaze = [Math.floor(frame / 3) % 2 ? 1 : -1, -0.6];
      break;
    case "working":
      gaze = [1, 0.8];
      armR = [[40, 36], [44, 42], frame % 2 ? [47, 44] : [48, 43]];
      armL = [[24, 36], [28, 42], frame % 2 ? [33, 44] : [32, 43]];
      break;
    case "asking":
      gaze = [0.2, -0.2];
      armR = [[40, 36], [46, 31], [48, 25]];
      break;
    case "blocked":
      gaze = [0.8, 0.4];
      tilt = 8;
      armL = [[24, 36], [20, 30], [22, 26]];
      break;
    case "done":
      eyes = "happy";
      armL = [[24, 36], [18, 30], [15, 24]];
      armR = [[40, 36], [46, 30], [49, 24]];
      break;
    case "confident":
      armR = [[40, 36], [46, 38], [50, 36]];
      break;
    case "probable":
      gaze = [0.8, -0.8];
      tilt = -7;
      armR = [[40, 36], [42, 32], [36, 30]];
      break;
    case "unsure":
      gaze = [-0.7, 0.3];
      tilt = 7;
      armL = [[24, 36], [17, 36], [16, 31]];
      armR = [[40, 36], [47, 36], [48, 31]];
      break;
  }

  drawBackProps(pen, pose, frame);

  pen.line("legL", [[29, 46], [28, 55], [25, 56]], { width: 2 });
  pen.line("legR", [[35, 46], [36, 55], [39, 56]], { width: 2 });
  pen.shape("torso", roundedRect(24, 31, 16, 16, 4));
  const bodyEnd = pen.parts.length;
  drawHead(pen, gaze, eyes);
  const head = pen.parts.splice(bodyEnd);

  const front = createPen(`${pose}:${boil ? Math.floor(frame / 2) : 0}:front:`);
  drawFrontProps(front, pose, frame);
  front.line("armL", armL, { width: 1.9 });
  front.line("armR", armR, { width: 1.9 });
  front.dot(armL[2]![0], armL[2]![1], 1.5);
  front.dot(armR[2]![0], armR[2]![1], 1.5);

  return { back: pen.parts, head, tilt, front: front.parts };
}

function drawHead(pen: Pen, gaze: Point, eyes: "open" | "closed" | "happy") {
  pen.shape("head", roundedRect(20, 8, 24, 21, 6));
  const ex = gaze[0] * 2.2;
  const ey = gaze[1] * 1.8;
  for (const [i, cx] of [[0, 28], [1, 36]] as const) {
    const x = cx + ex;
    const y = 18.5 + ey;
    if (eyes === "happy") pen.line(`eye${i}`, [[x - 2, y + 1], [x, y - 1.2], [x + 2, y + 1]], { width: 1.6, amp: 0.15 });
    else if (eyes === "closed") pen.line(`eye${i}`, [[x - 2, y + 0.5], [x + 2, y + 0.5]], { width: 1.6, amp: 0.2 });
    else pen.dot(x, y, 1.8);
  }
}

function drawBackProps(pen: Pen, pose: AgentPose, frame: number) {
  switch (pose) {
    case "listening": {
      pen.line("band", [[19, 20], [20, 8], [32, 3], [44, 8], [45, 20]], { width: 2 });
      pen.shape("cupL", roundedRect(16, 15, 5, 9, 2), { fill: INK });
      pen.shape("cupR", roundedRect(43, 15, 5, 9, 2), { fill: INK });
      for (let i = 0; i < (frame % 3) + 1; i++) {
        pen.line(`wave${i}`, [[12 - i * 3, 14], [10 - i * 3, 19], [12 - i * 3, 24]], { color: PENCIL, width: 1.4 });
      }
      break;
    }
    case "thinking": {
      const bubbles: [number, number, number][] = [[48, 10, 1.6], [53, 6, 2.4], [58, 2.5, 3.2]];
      bubbles.slice(0, (frame % 3) + 1).forEach(([x, y, r], i) =>
        pen.shape(`bubble${i}`, circle(x, y, r, 7), { amp: 0.2, width: 1.4 })
      );
      break;
    }
    case "probable": {
      const bubbles: [number, number, number][] = [[48, 10, 1.3], [52, 6, 1.9], [57, 2.5, 2.5]];
      bubbles.forEach(([x, y, r], i) =>
        pen.shape(`bubble${i}`, circle(x, y, r, 7), { amp: 0.15, width: 1.2, color: PENCIL })
      );
      break;
    }
    case "comparing": {
      const right = Math.floor(frame / 3) % 2 === 1;
      pen.shape("optionA", roundedRect(4, 2, 12, 9, 1.5), {
        fill: right ? PAPER : "var(--agent-working-soft)",
        color: right ? PENCIL : INK,
      });
      pen.shape("optionB", roundedRect(48, 2, 12, 9, 1.5), {
        fill: right ? "var(--agent-working-soft)" : PAPER,
        color: right ? INK : PENCIL,
      });
      pen.line("optionAText", [[6.5, 6.5], [13, 6.5]], { color: PENCIL, width: 1.2, amp: 0.2 });
      pen.line("optionBText", [[50.5, 6.5], [57, 6.5]], { color: PENCIL, width: 1.2, amp: 0.2 });
      break;
    }
    case "asking":
      pen.shape("note", roundedRect(47, 1, 15, 14, 2), {
        fill: "var(--agent-waiting-soft)",
        color: "var(--agent-waiting)",
        width: 2,
      });
      pen.glyph(54.5, 12, "?", 12, INK);
      break;
    case "blocked":
      pen.shape("alert", circle(54, 8, 6, 10), { fill: "var(--agent-blocked)", color: "var(--agent-blocked)", amp: 0.25 });
      pen.glyph(54, 11.6, "!", 10, "var(--card)");
      pen.line("wall", [[50, 38], [50, 58]], { width: 2 });
      pen.line("brickA", [[50, 44], [58, 44]], { color: PENCIL, width: 1.3 });
      pen.line("brickB", [[50, 51], [58, 51]], { color: PENCIL, width: 1.3 });
      break;
    case "done":
      pen.line("sparkA", [[55, 2], [55, 12]], { color: "var(--agent-done)", width: 2.2, amp: 0.2 });
      pen.line("sparkB", [[50, 7], [60, 7]], { color: "var(--agent-done)", width: 2.2, amp: 0.2 });
      pen.line("sparkC", [[9, 6], [9, 11]], { color: "var(--agent-done)", width: 1.8, amp: 0.2 });
      pen.line("sparkD", [[6.5, 8.5], [11.5, 8.5]], { color: "var(--agent-done)", width: 1.8, amp: 0.2 });
      break;
    case "unsure":
      pen.line("hesitateA", [[48, 6], [51, 4], [54, 6], [57, 4]], { color: PENCIL, width: 1.4, amp: 0.2 });
      pen.line("hesitateB", [[50, 11], [53, 9], [56, 11], [59, 9]], { color: PENCIL, width: 1.4, amp: 0.2 });
      break;
  }
}

function drawFrontProps(pen: Pen, pose: AgentPose, frame: number) {
  switch (pose) {
    case "planning":
      pen.shape(
        "map",
        [[18, 40], [26, 38], [32, 40], [38, 38], [46, 40], [46, 50], [38, 48], [32, 50], [26, 48], [18, 50]],
        { fill: "var(--agent-done-soft)" }
      );
      pen.line("foldA", [[26, 38], [26, 48]], { color: PENCIL, width: 1.2 });
      pen.line("foldB", [[32, 40], [32, 50]], { color: PENCIL, width: 1.2 });
      pen.line("foldC", [[38, 38], [38, 48]], { color: PENCIL, width: 1.2 });
      pen.line("route", [[21, 46], [28, 43], [35, 46], [43, 42]], { color: "var(--agent-working)", width: 1.4 });
      break;
    case "searching":
      pen.shape("lens", circle(52, 24, 5.5, 10), { fill: "var(--agent-working-soft)", amp: 0.25 });
      pen.line("handle", [[48, 28], [46.5, 31]], { width: 2.6, amp: 0.1 });
      break;
    case "working":
      pen.shape("screen", [[40, 30], [58, 30], [56, 44], [42, 44]]);
      pen.line("base", [[36, 45], [60, 45]], { width: 2.2 });
      pen.line("codeA", [[45, 34], [49, 34]], {
        color: frame % 2 ? "var(--agent-working)" : PENCIL,
        width: 1.3,
        amp: 0.15,
      });
      pen.line("codeB", [[44.5, 37.5], [52, 37.5]], { color: PENCIL, width: 1.3, amp: 0.15 });
      pen.line("codeC", [[44, 41], [50 + (frame % 3) * 1.5, 41]], { color: PENCIL, width: 1.3, amp: 0.15 });
      break;
    case "reading": {
      pen.shape("page", [[23, 38], [41, 38], [41, 52], [23, 52]]);
      const row = frame % 3;
      [0, 1, 2].forEach((i) =>
        pen.line(`text${i}`, [[26, 42 + i * 3.2], [i === 2 ? 34 : 38, 42 + i * 3.2]], {
          color: i === row ? INK : PENCIL,
          width: i === row ? 1.6 : 1.1,
          amp: 0.15,
        })
      );
      break;
    }
    case "confident":
      pen.shape("result", [[46, 28], [60, 28], [60, 46], [46, 46]]);
      pen.line("check", [[49, 37], [52, 40], [57, 33]], { color: "var(--agent-working)", width: 2.2, amp: 0.15 });
      break;
  }
}

function renderParts(parts: Part[]) {
  return parts.map((part, i) => {
    if (part.kind === "dot") return <circle key={i} cx={fmt(part.x)} cy={fmt(part.y)} r={part.r} fill={part.fill} />;
    if (part.kind === "glyph") {
      return (
        <text
          key={i}
          x={part.x}
          y={part.y}
          textAnchor="middle"
          fontSize={part.size}
          fontWeight={700}
          fill={part.fill}
          style={{ fontFamily: "ui-rounded, 'Segoe Print', 'Comic Sans MS', system-ui, sans-serif" }}
        >
          {part.text}
        </text>
      );
    }
    return (
      <path
        key={i}
        d={part.d}
        fill={part.fill ?? "none"}
        stroke={part.stroke}
        strokeWidth={part.width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  });
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** Frames advance only while the figure is busy, on screen, and the tab is visible. */
function useFrame(active: boolean, target: React.RefObject<HTMLElement | null>) {
  const [frame, setFrame] = React.useState(0);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = target.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)));
    observer.observe(node);
    return () => observer.disconnect();
  }, [target]);

  React.useEffect(() => {
    if (!active) {
      setFrame(0);
      return;
    }
    if (!visible) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setFrame((f) => (f + 1) % 600);
    }, 280);
    return () => window.clearInterval(id);
  }, [active, visible]);

  return active ? frame : 0;
}

/**
 * The agent, drawn. A hand-sketched character whose pose says what a run is doing, how
 * sure it is, and when it needs the person — the emotional layer next to the functional
 * one. Motion follows the system's turn-taking grammar: while the agent works its pen
 * lines boil and small parts move in steps; on the person's turn every line holds still.
 *
 * The words always come first. The figure pairs with a visible label by default, and
 * the drawing itself is supplementary.
 */
function AgentFigure({
  pose,
  variant = "figure",
  size = "md",
  label,
  hideLabel = false,
  labelPosition = "end",
  announce = false,
  still = false,
  className,
  ...props
}: AgentFigureProps) {
  const config = POSES[pose];
  const text = label ?? config.label;
  const reduced = usePrefersReducedMotion();
  const busy = config.turn === "agent";
  const animate = busy && !still && !reduced;
  const root = React.useRef<HTMLSpanElement>(null);
  const frame = useFrame(animate, root);

  const px = SIZES[variant][size];
  const drawing = drawFigure(pose, frame, animate);
  const head = (
    <g transform={drawing.tilt ? `rotate(${drawing.tilt} 32 30)` : undefined}>{renderParts(drawing.head)}</g>
  );

  return (
    <span
      ref={root}
      data-pose={pose}
      data-turn={config.turn}
      className={cn(
        "inline-flex items-center gap-2 text-sm text-foreground",
        labelPosition === "below" && "flex-col gap-1 text-center",
        className
      )}
      {...props}
    >
      <svg
        viewBox={variant === "mark" ? "17 5 30 27" : "0 0 64 64"}
        width={px}
        height={variant === "mark" ? Math.round((px * 27) / 30) : px}
        role={hideLabel ? "img" : undefined}
        aria-label={hideLabel ? text : undefined}
        aria-hidden={hideLabel ? undefined : true}
        className="shrink-0 overflow-visible"
      >
        {variant === "mark" ? (
          head
        ) : (
          <>
            {renderParts(drawing.back)}
            {head}
            {renderParts(drawing.front)}
          </>
        )}
      </svg>
      {!hideLabel && <span>{text}</span>}
      {announce && (
        <span className="sr-only" aria-live="polite">
          {text}
        </span>
      )}
    </span>
  );
}

export { AgentFigure, POSES as AGENT_POSES };
