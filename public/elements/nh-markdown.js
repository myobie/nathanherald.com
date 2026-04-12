import { HTMLElement } from 'dom';
import MarkdownIt from 'npm:markdown-it';
const md = new MarkdownIt({
  html: true,
  typographer: true
});
export class NhMarkdownElement extends HTMLElement {
  static defaultName = 'nh-markdown';
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
    // Already expanded
    if (this.hasAttribute('data-rendered')) {
      this.#removeScript();
      this.#ready.resolve();
      return;
    }
    try {
      let source = '';
      // Determine the markdown source
      const paramAttr = this.getAttribute('param');
      const srcAttr = this.getAttribute('src');
      if (paramAttr) {
        // Read the URL from a query parameter
        const url = new URL(this.ownerDocument.baseURI);
        const mdPath = url.searchParams.get(paramAttr);
        if (mdPath) {
          const resolvedUrl = new URL(mdPath, this.ownerDocument.baseURI).href;
          const resp = await fetch(resolvedUrl);
          source = await resp.text();
        }
      } else if (srcAttr) {
        const resolvedUrl = new URL(srcAttr, this.ownerDocument.baseURI).href;
        const resp = await fetch(resolvedUrl);
        source = await resp.text();
      } else {
        // Use inline text content
        source = this.textContent || '';
      }
      if (!source) {
        this.#ready.resolve();
        return;
      }
      // Parse and strip frontmatter
      const frontmatter = this.#parseFrontmatter(source);
      const body = this.#stripFrontmatter(source);
      // Apply frontmatter to parent elements if page attribute is set
      if (this.hasAttribute('page') && frontmatter) {
        this.#applyFrontmatter(frontmatter);
      }
      // Render markdown to HTML
      const html = md.render(body);
      const template = this.ownerDocument.createElement('template');
      template.innerHTML = html;
      this.textContent = '';
      this.append(template.content.cloneNode(true));
      this.setAttribute('data-rendered', '');
    } finally{
      this.#removeScript();
      this.#ready.resolve();
    }
  }
  #applyFrontmatter(fm) {
    const doc = this.ownerDocument;
    const head = doc.head;
    const title = fm.title || '';
    const description = fm.description || '';
    const fullTitle = title === 'I\u2019m Nathan Herald' ? title : `I\u2019m Nathan Herald \u2192 ${title}`;
    // Update <head> elements directly
    if (head) {
      const titleEl = head.querySelector('title');
      if (titleEl) titleEl.textContent = fullTitle;
      const metaTitle = head.querySelector('meta[name="title"]');
      if (metaTitle) metaTitle.setAttribute('content', fullTitle);
      const metaDesc = head.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', description);
      const ogTitle = head.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
      const ogDesc = head.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', description);
      if (fm.image) {
        const ogImage = head.querySelector('meta[property="og:image"]');
        const imageUrl = fm.image.startsWith('/') ? 'https://nathanherald.com' + fm.image : fm.image;
        if (ogImage) ogImage.setAttribute('content', imageUrl);
      }
    }
    // Set attributes on nh-page — it reacts to its own attributes
    const nhPage = doc.querySelector('nh-page');
    if (nhPage) {
      if (title) nhPage.setAttribute('title', title);
      if (fm.date) {
        nhPage.setAttribute('date', fm.date);
        nhPage.setAttribute('date-display', this.#formatDate(fm.date));
      }
      if (fm.externalUrl) nhPage.setAttribute('external-url', fm.externalUrl);
    }
  }
  #formatDate(dateStr) {
    const months = [
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
    const parts = dateStr.split('T')[0].split('-');
    const day = parts[2].replace(/^0/, '');
    const month = months[parseInt(parts[1], 10) - 1];
    const year = parts[0];
    return `${day} ${month}, ${year}`;
  }
  #parseFrontmatter(text) {
    const lines = text.split('\n');
    const delim = lines[0];
    if (delim !== '---' && delim !== '+++') return null;
    const end = lines.indexOf(delim, 1);
    if (end < 0) return null;
    const fmLines = lines.slice(1, end);
    const result = {};
    for (const line of fmLines){
      if (delim === '---') {
        // YAML: key: value (strip surrounding quotes if present)
        const match = line.match(/^(\w+):\s*(.+)/);
        if (match) result[match[1]] = match[2].replace(/^["'](.*)["']$/, '$1');
      } else {
        // TOML: key = "value"
        const match = line.match(/^(\w+)\s*=\s*"(.+?)"/);
        if (match) result[match[1]] = match[2];
      }
    }
    return result;
  }
  #stripFrontmatter(text) {
    const lines = text.split('\n');
    if (lines[0] === '---' || lines[0] === '+++') {
      const delim = lines[0];
      const end = lines.indexOf(delim, 1);
      if (end > 0) return lines.slice(end + 1).join('\n');
    }
    return text;
  }
  #removeScript() {
    for (const s of this.ownerDocument.querySelectorAll('script[type="module"]')){
      if (s.textContent?.includes('NhMarkdownElement')) {
        s.remove();
        break;
      }
    }
  }
}

// denoCacheMetadata=17179794971280817634,11351451326606757764