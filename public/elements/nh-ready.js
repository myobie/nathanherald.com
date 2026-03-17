import { HTMLElement } from 'dom';
export class NhReadyElement extends HTMLElement {
  static defaultName = 'nh-ready';
  static define(registry, name = this.defaultName) {
    if (!registry.get(name)) {
      registry.define(name, this);
    }
  }
  connectedCallback() {
    if (this.hasAttribute('data-ready')) {
      console.log('nh-ready: already expanded on server, skipping');
      this.#removeScript();
      return;
    }
    this.setAttribute('data-ready', 'true');
    console.log('nh-ready: expanded');
  }
  #removeScript() {
    for (const s of this.ownerDocument.querySelectorAll('script[type="module"]')){
      if (s.textContent?.includes('NhReadyElement')) {
        s.remove();
        break;
      }
    }
  }
}

// denoCacheMetadata=1364944099522252741,6139812017919040224