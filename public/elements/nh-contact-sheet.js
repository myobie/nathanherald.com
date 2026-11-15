import { HTMLElement } from 'dom';
const FORMATS = {
  '35mm': {
    perStrip: 6,
    perStripNarrow: 3,
    aspect: 3 / 2,
    perfs: 8,
    label: '35mm'
  },
  'half-frame': {
    perStrip: 12,
    perStripNarrow: 6,
    aspect: 2 / 3,
    perfs: 4,
    label: 'Half frame'
  },
  '120-6x6': {
    perStrip: 3,
    perStripNarrow: 3,
    aspect: 1,
    perfs: 0,
    label: '120, 6×6'
  },
  '120-6x4.5': {
    perStrip: 4,
    perStripNarrow: 2,
    aspect: 3 / 4,
    perfs: 0,
    label: '120, 6×4.5'
  },
  '120-6x7': {
    perStrip: 3,
    perStripNarrow: 2,
    aspect: 7 / 6,
    perfs: 0,
    label: '120, 6×7'
  },
  '110': {
    perStrip: 6,
    perStripNarrow: 3,
    aspect: 17 / 13,
    perfs: 1,
    label: '110'
  }
};
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];
const SVG_NS = 'http://www.w3.org/2000/svg';
// Small deterministic PRNG so marks wobble the same way on every build.
function rng(seed) {
  let s = seed * 2654435761 >>> 0;
  return ()=>{
    s = s + 0x6D2B79F5 >>> 0;
    let t = s;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const f = (n)=>n.toFixed(1);
// A loose, hand drawn loop that overshoots where it started.
function circlePath(seed) {
  const r = rng(seed);
  const cx = 50 + (r() - 0.5) * 4;
  const cy = 50 + (r() - 0.5) * 4;
  const rx = 44 + r() * 4;
  const ry = 40 + r() * 6;
  const start = r() * Math.PI * 2;
  const sweep = Math.PI * 2 * (1.08 + r() * 0.1);
  const steps = 48;
  let d = '';
  for(let i = 0; i <= steps; i++){
    const t = i / steps;
    const a = start + sweep * t;
    // drift outward a little as the pencil comes around
    const grow = 1 + t * 0.06 + Math.sin(t * 9 + seed) * 0.012;
    const x = cx + Math.cos(a) * rx * grow;
    const y = cy + Math.sin(a) * ry * grow;
    d += `${i === 0 ? 'M' : 'L'}${f(x)} ${f(y)} `;
  }
  return d.trim();
}
// Two quick strokes, slightly bowed.
function crossPaths(seed) {
  const r = rng(seed);
  const j = ()=>(r() - 0.5) * 8;
  const stroke = (x1, y1, x2, y2)=>{
    const mx = (x1 + x2) / 2 + j();
    const my = (y1 + y2) / 2 + j();
    return `M${f(x1)} ${f(y1)} Q${f(mx)} ${f(my)} ${f(x2)} ${f(y2)}`;
  };
  return [
    stroke(12 + j(), 10 + j(), 88 + j(), 90 + j()),
    stroke(88 + j(), 12 + j(), 14 + j(), 88 + j())
  ];
}
export function markFor(frame) {
  if (frame.rating >= 5) return 'circle';
  if (frame.rating >= 1 && frame.rating <= 2) return 'cross';
  return null;
}
export class NhContactSheetElement extends HTMLElement {
  static defaultName = 'nh-contact-sheet';
  static define(registry, name = this.defaultName) {
    if (!registry.get(name)) {
      registry.define(name, this);
    }
  }
  get isReady() {
    return this.#ready.promise;
  }
  #ready = Promise.withResolvers();
  async connectedCallback() {
    if (this.hasAttribute('data-rendered')) {
      this.#removeScript();
      this.#ready.resolve();
      return;
    }
    try {
      const src = this.#source();
      if (!src) return;
      const resp = await fetch(src);
      const roll = await resp.json();
      // Image paths in roll.json are relative to the roll.json itself
      const base = src;
      this.textContent = '';
      this.append(this.#render(roll, base));
      if (this.hasAttribute('page')) this.#applyToPage(roll, base);
      this.setAttribute('data-rendered', '');
    } finally{
      this.#removeScript();
      this.#ready.resolve();
    }
  }
  #source() {
    const baseURI = this.ownerDocument.baseURI;
    const param = this.getAttribute('param');
    if (param) {
      const fromParam = new URL(baseURI).searchParams.get(param);
      return fromParam ? new URL(fromParam, baseURI).href : null;
    }
    const src = this.getAttribute('src');
    return src ? new URL(src, baseURI).href : null;
  }
  // thumb/image in roll.json are either absolute URLs (e.g. a CDN like
  // https://photos.nathanherald.com/rolls/<slug>/01.jpg) or paths relative to
  // roll.json. The built page lives in the same folder as roll.json, so
  // relative paths can stay relative in the output.
  #href(path) {
    return path;
  }
  #render(roll, _base) {
    const doc = this.ownerDocument;
    const spec = FORMATS[roll.format] ?? FORMATS['35mm'];
    const el = (tag, attrs = {}, ...kids)=>{
      const e = doc.createElement(tag);
      for (const [k, v] of Object.entries(attrs))e.setAttribute(k, v);
      for (const k of kids)e.append(typeof k === 'string' ? doc.createTextNode(k) : k);
      return e;
    };
    const article = el('article', {
      class: 'roll'
    });
    // Header: title + a short line of facts
    const facts = [];
    if (roll.film) facts.push(roll.film);
    if (roll.camera) facts.push(roll.camera);
    facts.push(spec.label);
    if (roll.shot) facts.push(this.#formatMonth(roll.shot));
    const header = el('header', {}, el('h1', {}, roll.title), el('p', {
      class: 'roll-facts'
    }, facts.join(' · ')));
    article.append(header);
    if (roll.notes) {
      for (const para of roll.notes.split(/\n{2,}/)){
        article.append(el('p', {
          class: 'roll-notes'
        }, para.trim()));
      }
    }
    const sheet = el('div', {
      class: `contact-sheet format-${roll.format.replace(/[^a-z0-9-]/gi, '')}${spec.perfs ? '' : ' no-perfs'}`,
      style: `--per-strip: ${spec.perStrip}; --per-strip-narrow: ${spec.perStripNarrow}; --frame-aspect: ${f(spec.aspect * 1000)} / 1000; --perfs: ${spec.perfs};`
    });
    const edge = (roll.film ?? '').toUpperCase();
    for(let i = 0; i < roll.frames.length; i += spec.perStrip){
      const strip = el('div', {
        class: 'strip'
      });
      for (const frame of roll.frames.slice(i, i + spec.perStrip)){
        strip.append(this.#frame(frame, edge, el));
      }
      sheet.append(strip);
    }
    article.append(sheet);
    const legend = el('dl', {
      class: 'contact-sheet-legend'
    }, el('dt', {}, this.#markSvg('circle', 7, 'legend-mark')), el('dd', {}, 'five stars, a keeper'), el('dt', {}, this.#markSvg('cross', 7, 'legend-mark')), el('dd', {}, 'one or two stars, a miss'));
    article.append(legend);
    const meta = [];
    meta.push(`${roll.frames.length} frames`);
    if (roll.scanned) meta.push(`scanned ${this.#formatDay(roll.scanned)}`);
    article.append(el('p', {
      class: 'roll-meta'
    }, meta.join(', ')));
    return article;
  }
  #frame(frame, edge, el) {
    const mark = markFor(frame);
    const portrait = frame.height > frame.width;
    const label = `Frame ${frame.n}` + (frame.rating ? `, ${frame.rating} star${frame.rating === 1 ? '' : 's'}` : '');
    const fig = el('figure', {
      class: 'frame' + (portrait ? ' portrait' : '') + (mark ? ` marked-${mark}` : ''),
      'data-rating': String(frame.rating),
      id: `frame-${frame.n}`
    });
    const top = el('div', {
      class: 'rebate rebate-top',
      'aria-hidden': 'true'
    });
    if (edge && frame.n % 2 === 1) top.append(el('span', {
      class: 'edge-text'
    }, edge));
    const exposure = el('div', {
      class: 'exposure'
    });
    const thumb = frame.thumb ?? frame.image;
    if (thumb) {
      const img = el('img', {
        src: this.#href(thumb),
        alt: label,
        loading: 'lazy',
        decoding: 'async',
        width: String(portrait ? Math.round(640 * frame.width / frame.height) : 640),
        height: String(portrait ? 640 : Math.round(640 * frame.height / frame.width))
      });
      if (frame.image) {
        exposure.append(el('a', {
          href: this.#href(frame.image),
          class: 'never-underline'
        }, img));
      } else {
        exposure.append(img);
      }
    } else {
      exposure.append(el('span', {
        class: 'no-scan'
      }, 'no scan'));
    }
    if (mark) exposure.append(this.#markSvg(mark, frame.n * 31 + frame.rating, 'mark'));
    const bottom = el('div', {
      class: 'rebate rebate-bottom',
      'aria-hidden': 'true'
    }, el('span', {
      class: 'frame-number'
    }, String(frame.n)), el('span', {
      class: 'frame-number frame-number-a'
    }, `${frame.n}A`));
    fig.append(top, exposure, bottom);
    return fig;
  }
  #markSvg(kind, seed, cls) {
    const doc = this.ownerDocument;
    const svg = doc.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', `${cls} ${cls}-${kind}`);
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const paths = kind === 'circle' ? [
      circlePath(seed)
    ] : crossPaths(seed);
    for (const d of paths){
      const p = doc.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', d);
      p.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.append(p);
    }
    return svg;
  }
  #applyToPage(roll, _base) {
    const doc = this.ownerDocument;
    const head = doc.head;
    if (!head) return;
    const facts = [
      roll.film,
      roll.camera
    ].filter(Boolean).join(', ');
    const title = roll.title;
    const description = `Contact sheet for a roll of film${facts ? `, ${facts}` : ''}.`;
    const fullTitle = `I’m Nathan Herald → ${title}`;
    head.querySelector('title')?.replaceChildren(doc.createTextNode(fullTitle));
    head.querySelector('meta[name="title"]')?.setAttribute('content', fullTitle);
    head.querySelector('meta[name="description"]')?.setAttribute('content', description);
    head.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    head.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    if (!head.querySelector('link[href="/contact-sheet.css"]')) {
      const link = doc.createElement('link');
      link.setAttribute('href', '/contact-sheet.css');
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('type', 'text/css');
      head.append(link);
    }
  }
  #formatMonth(value) {
    const [y, m] = value.split('-');
    return m ? `${MONTHS[parseInt(m, 10) - 1]} ${y}` : y;
  }
  #formatDay(value) {
    const [y, m, d] = value.split('T')[0].split('-');
    if (!d) return this.#formatMonth(value);
    return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]}, ${y}`;
  }
  #removeScript() {
    for (const s of this.ownerDocument.querySelectorAll('script[type="module"]')){
      if (s.textContent?.includes('NhContactSheetElement')) {
        s.remove();
        break;
      }
    }
  }
}

// denoCacheMetadata=9734510895418432019,10650662198650084828