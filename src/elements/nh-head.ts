import { HTMLElement } from 'dom'

export class NhHeadElement extends HTMLElement {
  static defaultName = 'nh-head'

  static define(registry: CustomElementRegistry, name = this.defaultName) {
    if (!registry.get(name)) {
      registry.define(name, this)
    }
  }

  connectedCallback() {
    const head = this.ownerDocument.head
    if (!head) return

    // Already expanded — remove our script tag and ourselves, bail
    if (head.querySelector('title')) {
      this.#removeScript()
      this.remove()
      return
    }

    const doc = this.ownerDocument
    const title = this.getAttribute('title') || 'I\u2019m Nathan Herald'
    const description = this.getAttribute('description') || ''
    const canonical = this.getAttribute('canonical') || ''
    const hasSyntax = this.hasAttribute('syntax')

    const fullTitle = title === 'I\u2019m Nathan Herald' ? title : `I\u2019m Nathan Herald \u2192 ${title}`

    const els: Element[] = []

    const meta = (attrs: Record<string, string>) => {
      const el = doc.createElement('meta')
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
      return el
    }

    const link = (attrs: Record<string, string>) => {
      const el = doc.createElement('link')
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
      return el
    }

    els.push(meta({ charset: 'UTF-8' }))

    const titleEl = doc.createElement('title')
    titleEl.textContent = fullTitle
    els.push(titleEl)

    const script = doc.createElement('script')
    script.textContent = "if ((new URL(window.location.href)).host === 'myobie.com') { window.location.assign('https://nathanherald.com') }"
    els.push(script)

    if (canonical) {
      els.push(link({ href: canonical, rel: 'canonical' }))
    }

    els.push(link({ href: 'https://cloud.typography.com/6836312/761366/css/fonts.css', rel: 'stylesheet', type: 'text/css' }))
    els.push(link({ href: '/styles.css', rel: 'stylesheet', type: 'text/css' }))

    if (hasSyntax) {
      els.push(link({ href: '/syntax-light.css', rel: 'stylesheet', type: 'text/css' }))
      els.push(link({ href: '/syntax-dark.css', rel: 'stylesheet', type: 'text/css' }))
    }

    els.push(meta({ content: 'width=device-width, initial-scale=1.0', name: 'viewport' }))
    els.push(meta({ content: 'IE=edge', 'http-equiv': 'X-UA-Compatible' }))
    els.push(meta({ content: fullTitle, name: 'title' }))
    els.push(meta({ content: description, name: 'description' }))
    els.push(meta({ content: title, property: 'og:title' }))
    els.push(meta({ content: 'website', property: 'og:type' }))
    els.push(meta({ content: description, property: 'og:description' }))
    els.push(meta({ content: '/og.png', property: 'og:image' }))
    els.push(meta({ content: 'I\u2019m Nathan Herald', property: 'og:site_name' }))
    els.push(link({ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }))
    els.push(link({ rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' }))
    els.push(link({ href: '/rss.xml', rel: 'alternate', title: 'Feed of all the posts on nathanherald.com', type: 'application/rss+xml' }))

    // Append to <head>, not to this element
    for (const el of els) {
      head.append(el)
    }

    // Self-remove — our job is done
    this.#removeScript()
    this.remove()
  }

  #removeScript() {
    for (const s of this.ownerDocument.querySelectorAll('script[type="module"]')) {
      if (s.textContent?.includes('NhHeadElement')) { s.remove(); break }
    }
  }
}
