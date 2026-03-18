import { HTMLElement } from 'dom';
export class NhIncludeElement extends HTMLElement {
  static defaultName = 'nh-include';
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
    if (this.hasAttribute('data-included')) {
      this.#removeScript();
      this.#ready.resolve();
      return;
    }
    try {
      const src = this.getAttribute('src');
      if (!src) return;
      // Resolve relative to the nearest nh-markdown's source if inside one,
      // otherwise relative to the document
      const baseUrl = this.#findBaseUrl();
      const resolvedUrl = new URL(src, baseUrl).href;
      const resp = await fetch(resolvedUrl);
      const html = await resp.text();
      const template = this.ownerDocument.createElement('template');
      template.innerHTML = html;
      this.textContent = '';
      this.append(template.content.cloneNode(true));
      this.setAttribute('data-included', '');
    } finally{
      this.#removeScript();
      this.#ready.resolve();
    }
  }
  #findBaseUrl() {
    // Walk up to find an nh-markdown with a resolved source URL
    let el = this.parentElement;
    while(el){
      if (el.tagName?.toLowerCase() === 'nh-markdown') {
        const src = el.getAttribute('src');
        const param = el.getAttribute('param');
        if (param) {
          const url = new URL(this.ownerDocument.baseURI);
          const mdPath = url.searchParams.get(param);
          if (mdPath) return new URL(mdPath, this.ownerDocument.baseURI).href;
        }
        if (src) {
          return new URL(src, this.ownerDocument.baseURI).href;
        }
      }
      el = el.parentElement;
    }
    return this.ownerDocument.baseURI;
  }
  #removeScript() {
    for (const s of this.ownerDocument.querySelectorAll('script[type="module"]')){
      if (s.textContent?.includes('NhIncludeElement')) {
        s.remove();
        break;
      }
    }
  }
}

// denoCacheMetadata=17765397591361493337,16540405699511596257