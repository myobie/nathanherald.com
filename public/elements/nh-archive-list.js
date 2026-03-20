import { HTMLElement } from 'dom';
export class NhArchiveListElement extends HTMLElement {
  static defaultName = 'nh-archive-list';
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
      const resolvedUrl = new URL(src, this.ownerDocument.baseURI).href;
      const resp = await fetch(resolvedUrl);
      const posts = await resp.json();
      // Group by month/year
      const months = new Map();
      const monthNames = [
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
      for (const post of posts){
        const parts = post.date.split('T')[0].split('-');
        const month = monthNames[parseInt(parts[1], 10) - 1];
        const year = parts[0];
        const key = `${month} ${year}`;
        if (!months.has(key)) months.set(key, []);
        months.get(key).push(post);
      }
      const doc = this.ownerDocument;
      const ol = doc.createElement('ol');
      ol.className = 'month-list';
      for (const [monthYear, groupPosts] of months){
        const li = doc.createElement('li');
        const h3 = doc.createElement('h3');
        h3.textContent = monthYear;
        li.append(h3);
        const articleList = doc.createElement('ol');
        articleList.className = 'article-list';
        for (const post of groupPosts){
          const itemLi = doc.createElement('li');
          const p = doc.createElement('p');
          p.className = 'permalink';
          const emoji = post.type === 'link' ? '\uD83D\uDD17' : '\u2B50\uFE0F';
          const emojiTitle = post.type === 'link' ? 'link post' : 'blog post';
          const abbr = doc.createElement('abbr');
          abbr.setAttribute('title', emojiTitle);
          abbr.textContent = emoji;
          const a = doc.createElement('a');
          a.setAttribute('href', post.url);
          a.textContent = post.title;
          const day = post.date.split('T')[0].split('-')[2].replace(/^0/, '');
          const parts = post.date.split('T')[0].split('-');
          const month = monthNames[parseInt(parts[1], 10) - 1];
          const formattedDate = `${day} ${month}, ${parts[0]}`;
          const span = doc.createElement('span');
          span.className = 'meta';
          const time = doc.createElement('time');
          time.setAttribute('datetime', post.date);
          time.textContent = formattedDate;
          span.append(doc.createTextNode('\u2013 '), time);
          p.append(abbr, doc.createTextNode(' '), a, doc.createTextNode(' '), span);
          itemLi.append(p);
          articleList.append(itemLi);
        }
        li.append(articleList);
        ol.append(li);
      }
      this.textContent = '';
      this.append(ol);
      this.setAttribute('data-rendered', '');
    } finally{
      this.#removeScript();
      this.#ready.resolve();
    }
  }
  #removeScript() {
    for (const s of this.ownerDocument.querySelectorAll('script[type="module"]')){
      if (s.textContent?.includes('NhArchiveListElement')) {
        s.remove();
        break;
      }
    }
  }
}

// denoCacheMetadata=14928217448063414521,7250938917783442986