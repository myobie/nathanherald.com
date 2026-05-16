import { HTMLElement } from 'dom';
const TYPE_EMOJI = {
  blog: '⭐️',
  link: '🔗',
  checkin: '📍'
};
const TYPE_TITLE = {
  blog: 'blog post',
  link: 'link post',
  checkin: 'check-in'
};
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
        const emoji = TYPE_EMOJI[post.type] || TYPE_EMOJI.blog;
        const emojiTitle = TYPE_TITLE[post.type] || TYPE_TITLE.blog;
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

// denoCacheMetadata=16481154930723434487,7871897186175289062