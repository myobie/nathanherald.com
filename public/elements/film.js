// Shared pieces for drawing rolls of film: the roll.json types, film formats,
// date formatting, and the markup for a single frame on a strip. Used by
// <nh-contact-sheet> (one roll) and <nh-roll-list> (the photos index).
export const FORMATS = {
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
/**
 * Frames without a star rating. Nathan rates every frame when he's done
 * going through a roll, so a roll with any of these isn't finished and must
 * not be published.
 */ export function unratedFrames(roll) {
  return roll.frames.filter((f)=>!(f.rating >= 1));
}
export function slugify(value) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
/** The best date we have for a roll, for sorting: shot, then loaded, then scanned. */ export function rollDate(r) {
  return r.shot ?? r.loaded ?? r.scanned ?? '';
}
/**
 * Rolls grouped by trip, newest group first. Rolls in a trip keep their
 * album order (their slugs carry the album number); rolls without a trip
 * stand alone.
 */ export function groupRolls(rolls) {
  const groups = new Map();
  for (const roll of rolls){
    const trip = roll.trip?.trim() || null;
    const key = trip ? `trip:${trip}` : `roll:${roll.slug}`;
    if (!groups.has(key)) groups.set(key, {
      trip,
      id: trip ? `trip-${slugify(trip)}` : roll.slug,
      rolls: []
    });
    groups.get(key).rolls.push(roll);
  }
  const newest = (g)=>g.rolls.map(rollDate).sort().at(-1) ?? '';
  for (const g of groups.values())g.rolls.sort((a, b)=>a.slug.localeCompare(b.slug));
  return [
    ...groups.values()
  ].sort((a, b)=>newest(b).localeCompare(newest(a)) || (a.trip ?? a.id).localeCompare(b.trip ?? b.id));
}
export function formatSpec(format) {
  return FORMATS[format] ?? FORMATS['35mm'];
}
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
export function formatMonth(value) {
  const [y, m] = value.split('-');
  return m ? `${MONTHS[parseInt(m, 10) - 1]} ${y}` : y;
}
export function formatDay(value) {
  const [y, m, d] = value.split('T')[0].split('-');
  if (!d) return formatMonth(value);
  return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]}, ${y}`;
}
/** "Ilford Delta 400 · Pentax P30t · 35mm · December 2025" */ export function factsLine(roll) {
  const facts = [];
  if (roll.film) facts.push(roll.film);
  if (roll.camera) facts.push(roll.lens ? `${roll.camera} + ${roll.lens}` : roll.camera);
  else if (roll.lens) facts.push(roll.lens);
  facts.push(formatSpec(roll.format).label);
  if (roll.shot) facts.push(formatMonth(roll.shot));
  return facts.join(' \u00b7 ');
}
/** "developed at home" or "developed by Film Speed Lab" */ export function developedBy(lab) {
  const v = lab?.trim();
  if (!v) return null;
  return v.toLowerCase() === 'home' ? 'developed at home' : `developed by ${v}`;
}
export function elFactory(doc) {
  return (tag, attrs = {}, ...kids)=>{
    const e = doc.createElement(tag);
    for (const [k, v] of Object.entries(attrs))e.setAttribute(k, v);
    for (const k of kids)e.append(typeof k === 'string' ? doc.createTextNode(k) : k);
    return e;
  };
}
/** The <div class="contact-sheet"> wrapper, which carries the format as CSS variables. */ export function sheetElement(el, format, extraClass = '') {
  const spec = formatSpec(format);
  const aspect = (spec.aspect * 1000).toFixed(1);
  return el('div', {
    class: `contact-sheet format-${format.replace(/[^a-z0-9-]/gi, '')}${spec.perfs ? '' : ' no-perfs'}${extraClass ? ' ' + extraClass : ''}`,
    style: `--per-strip: ${spec.perStrip}; --per-strip-narrow: ${spec.perStripNarrow}; --frame-aspect: ${aspect} / 1000; --perfs: ${spec.perfs};`
  });
}
/**
 * One frame on a strip: rebate with edge text, the exposure, and rebate with
 * frame numbers. Returns the figure and its exposure, so callers can add a mark.
 */ export function frameElement(el, frame, opts) {
  const portrait = frame.height > frame.width;
  // A vertical shot on a horizontal roll (or the reverse on half frame) sits
  // sideways on the film, so it's drawn rotated to fill the frame, like a
  // real contact sheet.
  const rotated = opts.cellAspect !== 1 && portrait === opts.cellAspect > 1;
  const label = `Frame ${frame.n}` + (frame.rating ? `, ${frame.rating} star${frame.rating === 1 ? '' : 's'}` : '') + (frame.lens && frame.lens !== opts.rollLens ? `, ${frame.lens}` : '');
  const redacted = frame.redacted === true;
  const attrs = {
    class: 'frame' + (redacted ? ' redacted' : '') + (portrait && !redacted ? ' portrait' : '') + (rotated && !redacted ? ' rotated' : '') + (opts.className ? ` ${opts.className}` : ''),
    'data-rating': String(frame.rating)
  };
  if (opts.id) attrs.id = opts.id;
  const fig = el('figure', attrs);
  const top = el('div', {
    class: 'rebate rebate-top',
    'aria-hidden': 'true'
  });
  if (opts.edge && frame.n % 2 === 1) top.append(el('span', {
    class: 'edge-text'
  }, opts.edge));
  const exposure = el('div', {
    class: 'exposure'
  });
  const thumb = frame.thumb ?? frame.image;
  const href = opts.href === undefined ? frame.image : opts.href;
  if (redacted) {
    // Never render the image of a redacted frame, even if roll.json still has one
    exposure.append(el('span', {
      class: 'redacted-tape',
      role: 'img',
      'aria-label': `Frame ${frame.n}, redacted`
    }, 'redacted'));
  } else if (thumb) {
    const img = el('img', {
      src: thumb,
      alt: label,
      loading: 'lazy',
      decoding: 'async',
      width: String(portrait ? Math.round(640 * frame.width / frame.height) : 640),
      height: String(portrait ? 640 : Math.round(640 * frame.height / frame.width))
    });
    if (frame.lens) img.setAttribute('title', frame.lens);
    exposure.append(href ? el('a', {
      href,
      class: 'never-underline'
    }, img) : img);
  } else {
    exposure.append(el('span', {
      class: 'no-scan'
    }, 'no scan'));
  }
  const bottom = el('div', {
    class: 'rebate rebate-bottom',
    'aria-hidden': 'true'
  }, el('span', {
    class: 'frame-number'
  }, String(frame.n)), el('span', {
    class: 'frame-number frame-number-a'
  }, `${frame.n}A`));
  fig.append(top, exposure, bottom);
  return {
    fig,
    exposure
  };
}

// denoCacheMetadata=14988029782947990950,6300154970134293837