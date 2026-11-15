// Hand drawn grease pencil marks for contact sheets.
//
// The build draws every mark from a seed derived from the photo, so the
// committed HTML is stable. In the browser, redrawMarks() draws them again
// with fresh randomness, so no two visits look quite the same.
//
// Marks are drawn in a viewBox the same shape as the frame (width = 100 *
// aspect, height = 100), so nothing gets stretched.
// mulberry32
export function seeded(seed) {
  let s = seed >>> 0;
  return ()=>{
    s = s + 0x6D2B79F5 >>> 0;
    let t = s;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
// FNV-1a, 32 bit
export function hashSeed(value) {
  let h = 0x811c9dc5;
  for(let i = 0; i < value.length; i++){
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
const fmt = (n)=>(Math.round(n * 10) / 10).toString();
const between = (r, lo, hi)=>lo + (hi - lo) * r();
function polyline(points) {
  return points.map(([x, y], i)=>`${i ? 'L' : 'M'}${fmt(x)} ${fmt(y)}`).join(' ');
}
// One lopsided loop, drawn in a single go: uneven radius, a slight tilt, and
// an end that usually overshoots where it started (sometimes falls short).
// Now and then the pencil goes round a second time for part of the way.
export function circleStrokes(r, aspect) {
  const w = 100 * aspect;
  const h = 100;
  const cx = w / 2 + between(r, -0.05, 0.05) * w;
  const cy = h / 2 + between(r, -0.05, 0.05) * h;
  const rx = w / 2 * between(r, 0.9, 1.06);
  const ry = h / 2 * between(r, 0.88, 1.06);
  const tilt = between(r, -0.14, 0.14);
  // low frequency wobble, a few harmonics
  const harmonics = [
    1,
    2,
    3
  ].map((k)=>({
      k,
      amp: between(r, 0.012, 0.05) / k,
      phase: between(r, 0, Math.PI * 2)
    }));
  const wobble = (a)=>harmonics.reduce((sum, { k, amp, phase })=>sum + amp * Math.sin(k * a + phase), 0);
  const loop = (start, sweep, scale, drift, dx, dy)=>{
    const steps = Math.max(12, Math.round(Math.abs(sweep) / (Math.PI * 2) * 64));
    const pts = [];
    for(let i = 0; i <= steps; i++){
      const t = i / steps;
      const a = start + sweep * t;
      // the hand drifts outward as it comes round, so the ends don't meet
      const m = scale * (1 + wobble(a) + drift * t);
      const x = Math.cos(a) * rx * m;
      const y = Math.sin(a) * ry * m;
      pts.push([
        cx + dx + x * Math.cos(tilt) - y * Math.sin(tilt),
        cy + dy + x * Math.sin(tilt) + y * Math.cos(tilt)
      ]);
    }
    return polyline(pts);
  };
  const start = between(r, 0, Math.PI * 2);
  const deg = Math.PI / 180;
  const extra = r() < 0.15 ? -between(r, 5, 18) * deg : between(r, 10, 40) * deg;
  const strokes = [
    {
      d: loop(start, Math.PI * 2 + extra, 1, between(r, 0.02, 0.07), 0, 0),
      weight: between(r, 0.9, 1.15)
    }
  ];
  if (r() < 0.3) {
    strokes.push({
      d: loop(start + between(r, 0.5, 2.5), between(r, 60, 160) * deg, between(r, 1.02, 1.06), 0.01, between(r, -2, 2), between(r, -2, 2)),
      weight: between(r, 0.6, 0.85)
    });
  }
  return strokes;
}
// Two quick, slightly bowed strokes of unequal length that cross off center.
// Sometimes a stroke runs past the edge of the frame, or starts with a tiny
// hook where the pencil landed.
export function crossStrokes(r, aspect) {
  const w = 100 * aspect;
  const h = 100;
  const stroke = (x1, y1, x2, y2)=>{
    const len = Math.hypot(x2 - x1, y2 - y1);
    const bow = between(r, -0.08, 0.08) * len;
    const mx = (x1 + x2) / 2 + (y2 - y1) / len * bow;
    const my = (y1 + y2) / 2 - (x2 - x1) / len * bow;
    const curve = `Q${fmt(mx)} ${fmt(my)} ${fmt(x2)} ${fmt(y2)}`;
    let d = `M${fmt(x1)} ${fmt(y1)} ${curve}`;
    if (r() < 0.35) {
      // a little hook where the pencil landed
      const hx = x1 + between(r, -1, 1) * 0.04 * w;
      const hy = y1 + between(r, 0.02, 0.05) * h;
      d = `M${fmt(hx)} ${fmt(hy)} L${fmt(x1)} ${fmt(y1)} ${curve}`;
    }
    return {
      d,
      weight: between(r, 0.85, 1.2)
    };
  };
  const past = ()=>r() < 0.3 ? between(r, 1.0, 1.08) : between(r, 0.8, 0.95);
  return [
    stroke(between(r, 0.06, 0.22) * w, between(r, 0.04, 0.2) * h, past() * w, between(r, 0.82, 1.02) * h),
    stroke(between(r, 0.78, 0.96) * w, between(r, 0.04, 0.22) * h, (1 - past()) * w, between(r, 0.8, 1.0) * h)
  ];
}
export function strokesFor(kind, r, aspect) {
  return kind === 'circle' ? circleStrokes(r, aspect) : crossStrokes(r, aspect);
}
const SVG_NS = 'http://www.w3.org/2000/svg';
/** Replace the paths in a mark <svg> with freshly drawn strokes. */ export function drawInto(svg, kind, r, aspect) {
  const doc = svg.ownerDocument;
  svg.setAttribute('viewBox', `0 0 ${fmt(100 * aspect)} 100`);
  while(svg.firstChild)svg.firstChild.remove();
  for (const { d, weight } of strokesFor(kind, r, aspect)){
    const p = doc.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('vector-effect', 'non-scaling-stroke');
    p.setAttribute('style', `--weight: ${weight.toFixed(2)}`);
    svg.append(p);
  }
}
/** In the browser: redraw every mark on the page with Math.random. */ export function redrawMarks(root = document) {
  for (const svg of root.querySelectorAll('svg.mark[data-kind]')){
    const kind = svg.getAttribute('data-kind');
    const aspect = Number(svg.getAttribute('data-aspect')) || 1;
    drawInto(svg, kind, Math.random, aspect);
  }
}
const SVG = 'http://www.w3.org/2000/svg';
/** A mark <svg> for one frame, drawn from a seed. */ export function markElement(doc, kind, seed, aspect, cls = 'mark') {
  const svg = doc.createElementNS(SVG, 'svg');
  svg.setAttribute('class', `${cls} ${cls}-${kind}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('data-kind', kind);
  svg.setAttribute('data-aspect', aspect.toFixed(4));
  drawInto(svg, kind, seeded(seed), aspect);
  return svg;
}
/** Hidden <svg> holding the filter that gives strokes a rough, waxy edge. */ export function pencilFilterElement(doc) {
  const make = (tag, attrs)=>{
    const e = doc.createElementNS(SVG, tag);
    for (const [k, v] of Object.entries(attrs))e.setAttribute(k, v);
    return e;
  };
  const svg = make('svg', {
    class: 'grease-pencil-defs',
    'aria-hidden': 'true',
    width: '0',
    height: '0'
  });
  const filter = make('filter', {
    id: 'grease-pencil',
    x: '-10%',
    y: '-10%',
    width: '120%',
    height: '120%'
  });
  filter.append(make('feTurbulence', {
    type: 'fractalNoise',
    baseFrequency: '0.9',
    numOctaves: '2',
    seed: '3',
    result: 'noise'
  }), make('feDisplacementMap', {
    in: 'SourceGraphic',
    in2: 'noise',
    scale: '1.6',
    xChannelSelector: 'R',
    yChannelSelector: 'G'
  }));
  const defs = make('defs', {});
  defs.append(filter);
  svg.append(defs);
  return svg;
}
/** The inline module that redraws marks in the browser. */ export const REDRAW_SCRIPT = "import { redrawMarks } from 'grease-pencil'; redrawMarks()";
export function markFor(frame) {
  if (frame.rating >= 5) return 'circle';
  if (frame.rating >= 1 && frame.rating <= 2) return 'cross';
  return null;
}

// denoCacheMetadata=7393148004325005321,5097895791842949696