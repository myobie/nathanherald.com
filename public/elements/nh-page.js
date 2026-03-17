import { HTMLElement } from 'dom';
export class NhPageElement extends HTMLElement {
  static defaultName = 'nh-page';
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
    const title = this.getAttribute('title') || 'Untitled';
    const date = this.getAttribute('date') || '';
    const dateDisplay = this.getAttribute('date-display') || '';
    const externalUrl = this.getAttribute('external-url') || '';
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
    if (externalUrl) {
      const a = doc.createElement('a');
      a.setAttribute('href', externalUrl);
      a.textContent = title;
      h1.append(a);
    } else {
      h1.textContent = title;
    }
    articleHeader.append(h1);
    article.append(articleHeader);
    // Content div with the original children
    const contentDiv = doc.createElement('div');
    contentDiv.className = 'content';
    for (const node of contentNodes){
      contentDiv.append(node);
    }
    // "Read more" link for link posts
    if (externalUrl) {
      const readMore = doc.createElement('p');
      const arrow = doc.createTextNode('\u2192 ');
      const readMoreLink = doc.createElement('a');
      readMoreLink.setAttribute('href', externalUrl);
      readMoreLink.textContent = 'Read more at the source';
      readMore.append(arrow, readMoreLink);
      contentDiv.append(readMore);
    }
    article.append(contentDiv);
    // Date footer
    if (date) {
      const footer = doc.createElement('footer');
      const p = doc.createElement('p');
      const text = doc.createTextNode('Posted on ');
      const time = doc.createElement('time');
      time.setAttribute('datetime', date);
      time.textContent = dateDisplay || date;
      p.append(text, time);
      footer.append(p);
      article.append(footer);
    }
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
  #removeScript() {
    for (const s of this.ownerDocument.querySelectorAll('script[type="module"]')){
      if (s.textContent?.includes('NhPageElement')) {
        s.remove();
        break;
      }
    }
  }
}

// denoCacheMetadata=13760255476200937886,17344868300999781311