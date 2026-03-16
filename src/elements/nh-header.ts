import { HTMLElement } from 'dom'

export class NhHeaderElement extends HTMLElement {
  static defaultName = 'nh-header'

  static define(registry: CustomElementRegistry, name = this.defaultName) {
    if (!registry.get(name)) {
      registry.define(name, this)
    }
  }

  connectedCallback() {
    // Already expanded — remove our script tag and bail
    if (this.children.length > 0) {
      this.#removeScript()
      return
    }

    const doc = this.ownerDocument
    const template = doc.createElement('template')

    template.innerHTML = `<header class="section-header">
      <div class="section-nav">
        <h1 class="home-link">
          <a class="never-underline" data-nospan="" href="/"><abbr title="Hello">\u{1F44B}</abbr></a>
          <a href="/">I\u2019m Nathan</a>
        </h1>
        <nav>
          <p>
            Find more in the <a href="/posts/">archive of all the posts on this site</a> or
            <a href="/rss.xml">subscribe with RSS</a>.
          </p>
        </nav>
      </div>
    </header>`

    this.append(template.content.cloneNode(true))
    this.#removeScript()
  }

  #removeScript() {
    for (const s of this.ownerDocument.querySelectorAll('script[type="module"]')) {
      if (s.textContent?.includes('NhHeaderElement')) { s.remove(); break }
    }
  }
}
