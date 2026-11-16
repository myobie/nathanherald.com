import { HTMLElement } from 'dom';
import { hashSeed, markElement, markFor, pencilFilterElement, REDRAW_SCRIPT } from 'grease-pencil';
import { elFactory, factsLine, formatSpec, frameElement, sheetElement } from 'film';
// The photos index: every roll of film as a title, a facts line, and one
// short strip of its best frames, linking to the roll's contact sheet.
// Data comes from rolls.json, which the build generates from every roll.json.
export class NhRollListElement extends HTMLElement {
  static defaultName = 'nh-roll-list';
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
      const src = this.getAttribute('src');
      if (!src) return;
      const resp = await fetch(new URL(src, this.ownerDocument.baseURI).href);
      const rolls = await resp.json();
      this.textContent = '';
      this.append(this.#render(rolls));
      if (this.hasAttribute('page')) this.#addStylesheet();
      this.setAttribute('data-rendered', '');
    } finally{
      this.#removeScript();
      this.#ready.resolve();
    }
  }
  #render(rolls) {
    const doc = this.ownerDocument;
    const el = elFactory(doc);
    const list = el('ol', {
      class: 'roll-list'
    });
    if (!rolls.length) {
      list.append(el('li', {}, 'No rolls yet.'));
      return list;
    }
    for (const roll of rolls){
      const spec = formatSpec(roll.format);
      const edge = (roll.film ?? '').toUpperCase();
      const li = el('li', {
        class: 'roll-summary',
        id: roll.slug
      });
      const count = `${roll.frameCount} frames` + (roll.keepers ? `, ${roll.keepers} circled` : '');
      li.append(el('h2', {}, el('a', {
        href: roll.url
      }, roll.title)), el('p', {
        class: 'roll-facts'
      }, factsLine(roll)));
      const sheet = sheetElement(el, roll.format, 'roll-preview');
      const strip = el('div', {
        class: 'strip'
      });
      for (const frame of roll.preview){
        const mark = frame.redacted ? null : markFor(frame);
        const { fig, exposure } = frameElement(el, frame, {
          edge,
          cellAspect: spec.aspect,
          href: `${roll.url}#frame-${frame.n}`,
          rollLens: roll.lens
        });
        if (mark) {
          const seed = hashSeed(frame.assetId ?? frame.filename ?? `${roll.slug}-${frame.n}`);
          exposure.append(markElement(doc, mark, seed, spec.aspect));
        }
        strip.append(fig);
      }
      sheet.append(strip);
      li.append(sheet, el('p', {
        class: 'roll-meta'
      }, el('a', {
        href: roll.url
      }, `See the whole roll`), `, ${count}`));
      list.append(li);
    }
    const wrap = doc.createDocumentFragment();
    wrap.append(list, pencilFilterElement(doc));
    const redraw = el('script', {
      type: 'module'
    });
    redraw.textContent = REDRAW_SCRIPT;
    wrap.append(redraw);
    return wrap;
  }
  #addStylesheet() {
    const doc = this.ownerDocument;
    const head = doc.head;
    if (!head || head.querySelector('link[href="/contact-sheet.css"]')) return;
    const link = doc.createElement('link');
    link.setAttribute('href', '/contact-sheet.css');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    head.append(link);
  }
  #removeScript() {
    for (const s of this.ownerDocument.querySelectorAll('script[type="module"]')){
      if (s.textContent?.includes('NhRollListElement')) {
        s.remove();
        break;
      }
    }
  }
}

// denoCacheMetadata=17316090271079832567,17986613539879431859