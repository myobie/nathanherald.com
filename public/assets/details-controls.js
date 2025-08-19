class DetailsControls extends HTMLElement {
  constructor() {
    super()
    this.expandButton = null
    this.collapseButton = null
  }

  connectedCallback() {
    this.expandButton = this.ownerDocument.createElement('button')
    this.expandButton.innerHTML = 'Expand all sections'

    this.collapseButton = this.ownerDocument.createElement('button')
    this.collapseButton.innerHTML = 'Collapse all sections'

    this.expandButton.addEventListener('click', this)
    this.collapseButton.addEventListener('click', this)

    this.append(this.expandButton, this.collapseButton)
  }

  disconnectedCallback() {
    this.expandButton.removeEventListener('click', this)
    this.collapseButton.removeEventListener('click', this)
  }

  handleEvent(e) {
    const target = e.target.closest('button')

    if (target && e.type === 'click') {
      if (e.target.hasAttribute('data-expand')) {
        this.expandAll()
      } else {
        this.collapseAll()
      }
    }
  }

  expandAll() {
    this.ownerDocument.querySelectorAll('details').forEach(detail => {
      detail.open = true
    })
  }

  collapseAll() {
    this.ownerDocument.querySelectorAll('details').forEach(detail => {
      detail.open = false
    })
  }
}

customElements.define('details-controls', DetailsControls)
