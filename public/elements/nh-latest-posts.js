import { HTMLElement } from 'dom';
export class NhLatestPostsElement extends HTMLElement {
  static defaultName = 'nh-latest-posts';
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
      const count = parseInt(this.getAttribute('count') || '5', 10);
      const resolvedUrl = new URL(src, this.ownerDocument.baseURI).href;
      const resp = await fetch(resolvedUrl);
      const posts = await resp.json();
      const latest = posts.slice(0, count);
      const doc = this.ownerDocument;
      const nav = doc.createElement('nav');
      nav.className = 'latest-posts listing';
      const ol = doc.createElement('ol');
      for (const post of latest){
        const li = doc.createElement('li');
        const emoji = post.type === 'link' ? '\uD83D\uDD17' : '\u2B50\uFE0F';
        const emojiTitle = post.type === 'link' ? 'link post' : 'blog post';
        const abbr = doc.createElement('abbr');
        abbr.setAttribute('title', emojiTitle);
        abbr.textContent = emoji;
        const a = doc.createElement('a');
        a.className = 'title';
        a.setAttribute('href', post.url);
        a.textContent = post.title;
        li.append(abbr, doc.createTextNode(' '), a);
        ol.append(li);
      }
      nav.append(ol);
      this.textContent = '';
      this.append(nav);
      this.setAttribute('data-rendered', '');
    } finally{
      this.#removeScript();
      this.#ready.resolve();
    }
  }
  #removeScript() {
    for (const s of this.ownerDocument.querySelectorAll('script[type="module"]')){
      if (s.textContent?.includes('NhLatestPostsElement')) {
        s.remove();
        break;
      }
    }
  }
}

// denoCacheMetadata=3677759694298663150,11129568413013836591