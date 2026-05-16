import { HTMLElement } from 'dom'

export class NhPageElement extends HTMLElement {
  static defaultName = 'nh-page'
  static observedAttributes = [
    'title', 'date', 'date-display', 'external-url',
    'checkin-url', 'checkin-locality', 'checkin-region', 'checkin-country',
  ]

  static define(registry: CustomElementRegistry, name = this.defaultName) {
    if (!registry.get(name)) {
      registry.define(name, this)
    }
  }

  connectedCallback() {
    // Already expanded — remove our script tag and bail
    if (this.querySelector('main.single')) {
      this.#removeScript()
      return
    }

    const doc = this.ownerDocument

    // Capture the existing children (post content)
    const contentNodes = Array.from(this.childNodes)

    // Build the page structure
    const header = doc.createElement('nh-header')
    const main = doc.createElement('main')
    main.className = 'single'

    const article = doc.createElement('article')
    article.classList.add('h-entry')

    // Article header with title
    const articleHeader = doc.createElement('header')
    const h1 = doc.createElement('h1')
    this.#updateH1(h1)

    articleHeader.append(h1)
    article.append(articleHeader)

    // Content div with the original children
    const contentDiv = doc.createElement('div')
    contentDiv.className = 'content'

    for (const node of contentNodes) {
      contentDiv.append(node)
    }

    article.append(contentDiv)

    // Date footer (may be empty, updated by attributeChangedCallback)
    const dateFooter = doc.createElement('footer')
    this.#updateDateFooter(dateFooter)
    article.append(dateFooter)

    // "Read more" link container
    const readMoreP = doc.createElement('p')
    readMoreP.className = 'read-more'
    this.#updateReadMore(readMoreP, contentDiv)

    main.append(article)

    // Scripts
    const detailsScript = doc.createElement('script')
    detailsScript.setAttribute('async', '')
    detailsScript.setAttribute('src', '/assets/details-controls.js')

    const statsScript = doc.createElement('script')
    statsScript.setAttribute('data-domain', 'nathanherald.com')
    statsScript.setAttribute('defer', '')
    statsScript.setAttribute('src', 'https://stats.myobie.wtf/script.js')

    const footer = doc.createElement('nh-footer')

    // Assemble everything
    this.append(header, main, detailsScript, statsScript, footer)
    this.#removeScript()
  }

  attributeChangedCallback(_name: string, _oldValue: string | null, _newValue: string | null) {
    // Only react if already expanded
    if (!this.querySelector('main.single')) return

    const h1 = this.querySelector('article > header > h1')
    if (h1) this.#updateH1(h1 as HTMLElement)

    const dateFooter = this.querySelector('article > footer')
    if (dateFooter) this.#updateDateFooter(dateFooter as HTMLElement)

    const contentDiv = this.querySelector('article div.content')
    const readMore = this.querySelector('article div.content > p.read-more')
    if (contentDiv) this.#updateReadMore(readMore as HTMLElement | null, contentDiv as HTMLElement)
  }

  #updateH1(h1: HTMLElement) {
    const title = this.getAttribute('title') || ''
    const externalUrl = this.getAttribute('external-url') || ''
    const checkinUrl = this.getAttribute('checkin-url') || ''
    const checkinLocality = this.getAttribute('checkin-locality') || ''
    const checkinRegion = this.getAttribute('checkin-region') || ''
    const checkinCountry = this.getAttribute('checkin-country') || ''
    const doc = this.ownerDocument

    h1.textContent = ''

    if (checkinUrl && title) {
      const hasExtras = !!(checkinLocality || checkinRegion || checkinCountry)

      if (hasExtras) {
        const wrap = doc.createElement('span')
        wrap.setAttribute('class', 'p-checkin h-card')

        const a = doc.createElement('a')
        a.setAttribute('class', 'p-name u-url')
        a.setAttribute('href', checkinUrl)
        a.textContent = title
        wrap.append(a)

        const small = doc.createElement('small')
        small.className = 'checkin-locality'
        small.append(doc.createTextNode(' · '))

        const parts: { cls: string; value: string }[] = []
        if (checkinLocality) parts.push({ cls: 'p-locality', value: checkinLocality })
        if (checkinRegion) parts.push({ cls: 'p-region', value: checkinRegion })
        if (checkinCountry) parts.push({ cls: 'p-country-name', value: checkinCountry })

        parts.forEach((p, i) => {
          if (i > 0) small.append(doc.createTextNode(', '))
          const span = doc.createElement('span')
          span.setAttribute('class', p.cls)
          span.textContent = p.value
          small.append(span)
        })

        wrap.append(small)
        h1.append(wrap)
      } else {
        const a = doc.createElement('a')
        a.setAttribute('class', 'p-checkin h-card')
        a.setAttribute('href', checkinUrl)
        a.textContent = title
        h1.append(a)
      }
    } else if (externalUrl && title) {
      const a = doc.createElement('a')
      a.setAttribute('href', externalUrl)
      a.textContent = title
      h1.append(a)
    } else {
      h1.textContent = title
    }
  }

  #updateDateFooter(footer: HTMLElement) {
    const date = this.getAttribute('date') || ''
    const dateDisplay = this.getAttribute('date-display') || ''

    footer.textContent = ''
    if (date) {
      const p = this.ownerDocument.createElement('p')
      const text = this.ownerDocument.createTextNode('Posted on ')
      const time = this.ownerDocument.createElement('time')
      time.setAttribute('datetime', date)
      time.textContent = dateDisplay || date
      p.append(text, time)
      footer.append(p)
    }
  }

  #updateReadMore(existing: HTMLElement | null, contentDiv: HTMLElement) {
    const externalUrl = this.getAttribute('external-url') || ''
    const checkinUrl = this.getAttribute('checkin-url') || ''

    if (existing) existing.remove()

    if (externalUrl && !checkinUrl) {
      const p = this.ownerDocument.createElement('p')
      p.className = 'read-more'
      const arrow = this.ownerDocument.createTextNode('\u2192 ')
      const a = this.ownerDocument.createElement('a')
      a.setAttribute('href', externalUrl)
      a.textContent = 'Read more at the source'
      p.append(arrow, a)
      contentDiv.append(p)
    }
  }

  #removeScript() {
    for (const s of this.ownerDocument.querySelectorAll('script[type="module"]')) {
      if (s.textContent?.includes('NhPageElement')) { s.remove(); break }
    }
  }
}
