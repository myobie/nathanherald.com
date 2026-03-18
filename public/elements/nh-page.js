import { HTMLElement } from 'dom';
export class NhPageElement extends HTMLElement {
  static defaultName = 'nh-page';
  static observedAttributes = [
    'title',
    'date',
    'date-display',
    'external-url'
  ];
  static define(registry, name = this.defaultName) {
    if (!registry.get(name)) {
      registry.define(name, this);
    }
  }
  connectedCallback() {
    // Already expanded — remove our script tag and bail
    if (this.querySelector('main.single')) {
      this.#removeScript();
      return;
    }
    const doc = this.ownerDocument;
    // Capture the existing children (post content)
    const contentNodes = Array.from(this.childNodes);
    // Build the page structure
    const header = doc.createElement('nh-header');
    const main = doc.createElement('main');
    main.className = 'single';
    const article = doc.createElement('article');
    // Article header with title
    const articleHeader = doc.createElement('header');
    const h1 = doc.createElement('h1');
    this.#updateH1(h1);
    articleHeader.append(h1);
    article.append(articleHeader);
    // Content div with the original children
    const contentDiv = doc.createElement('div');
    contentDiv.className = 'content';
    for (const node of contentNodes){
      contentDiv.append(node);
    }
    article.append(contentDiv);
    // Date footer (may be empty, updated by attributeChangedCallback)
    const dateFooter = doc.createElement('footer');
    this.#updateDateFooter(dateFooter);
    article.append(dateFooter);
    // "Read more" link container
    const readMoreP = doc.createElement('p');
    readMoreP.className = 'read-more';
    this.#updateReadMore(readMoreP, contentDiv);
    main.append(article);
    // Scripts
    const detailsScript = doc.createElement('script');
    detailsScript.setAttribute('async', '');
    detailsScript.setAttribute('src', '/assets/details-controls.js');
    const statsScript = doc.createElement('script');
    statsScript.setAttribute('data-domain', 'nathanherald.com');
    statsScript.setAttribute('defer', '');
    statsScript.setAttribute('src', 'https://stats.myobie.wtf/script.js');
    const footer = doc.createElement('nh-footer');
    // Assemble everything
    this.append(header, main, detailsScript, statsScript, footer);
    this.#removeScript();
  }
  attributeChangedCallback(_name, _oldValue, _newValue) {
    // Only react if already expanded
    if (!this.querySelector('main.single')) return;
    const h1 = this.querySelector('article > header > h1');
    if (h1) this.#updateH1(h1);
    const dateFooter = this.querySelector('article > footer');
    if (dateFooter) this.#updateDateFooter(dateFooter);
    const contentDiv = this.querySelector('article div.content');
    const readMore = this.querySelector('article div.content > p.read-more');
    if (contentDiv) this.#updateReadMore(readMore, contentDiv);
  }
  #updateH1(h1) {
    const title = this.getAttribute('title') || '';
    const externalUrl = this.getAttribute('external-url') || '';
    h1.textContent = '';
    if (externalUrl && title) {
      const a = this.ownerDocument.createElement('a');
      a.setAttribute('href', externalUrl);
      a.textContent = title;
      h1.append(a);
    } else {
      h1.textContent = title;
    }
  }
  #updateDateFooter(footer) {
    const date = this.getAttribute('date') || '';
    const dateDisplay = this.getAttribute('date-display') || '';
    footer.textContent = '';
    if (date) {
      const p = this.ownerDocument.createElement('p');
      const text = this.ownerDocument.createTextNode('Posted on ');
      const time = this.ownerDocument.createElement('time');
      time.setAttribute('datetime', date);
      time.textContent = dateDisplay || date;
      p.append(text, time);
      footer.append(p);
    }
  }
  #updateReadMore(existing, contentDiv) {
    const externalUrl = this.getAttribute('external-url') || '';
    if (existing) existing.remove();
    if (externalUrl) {
      const p = this.ownerDocument.createElement('p');
      p.className = 'read-more';
      const arrow = this.ownerDocument.createTextNode('\u2192 ');
      const a = this.ownerDocument.createElement('a');
      a.setAttribute('href', externalUrl);
      a.textContent = 'Read more at the source';
      p.append(arrow, a);
      contentDiv.append(p);
    }
  }
  #removeScript() {
    for (const s of this.ownerDocument.querySelectorAll('script[type="module"]')){
      if (s.textContent?.includes('NhPageElement')) {
        s.remove();
        break;
      }
    }
  }
}

// denoCacheMetadata=15214106695296397753,1130181155755754595