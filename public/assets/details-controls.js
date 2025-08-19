class DetailsControls extends HTMLElement {
  constructor() {
    super()
    this.expanded = false
  }

  connectedCallback() {
    this.render()
    this.attachEventListeners()
  }

  render() {
    this.innerHTML = `
      <div style="display: flex; gap: 1em; margin: 1em 0;">
        <button class="expand-all">Expand all</button>
        <button class="collapse-all">Collapse all</button>
      </div>
    `
  }

  attachEventListeners() {
    const expandBtn = this.querySelector('.expand-all')
    const collapseBtn = this.querySelector('.collapse-all')

    expandBtn?.addEventListener('click', () => this.expandAll())
    collapseBtn?.addEventListener('click', () => this.collapseAll())
  }

  expandAll() {
    const details = document.querySelectorAll('details')
    details.forEach(detail => {
      detail.open = true
    })
    this.expanded = true
  }

  collapseAll() {
    const details = document.querySelectorAll('details')
    details.forEach(detail => {
      detail.open = false
    })
    this.expanded = false
  }
}

// Register the custom element
customElements.define('details-controls', DetailsControls)