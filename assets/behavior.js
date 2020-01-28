function shouldChangeColor () {
  if ('matchMedia' in window) {
    return window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  } else {
    return true
  }
}
function sorter () { return 0.5 - Math.random() }
var styles = ['blaze', 'blood', 'puce']

function colorize () {
  if (shouldChangeColor()) {
    var newStyle = styles.sort(sorter)[0]

    document.body.classList.remove('default')

    for (var style of styles) {
      document.body.classList.remove(style)
    }

    document.body.classList.add(newStyle)
  }
}

colorize()

window.addEventListener('load', e => {
  setTimeout(() => {
    document.body.classList.add('animated')
    setInterval(colorize, 25000)
  }, 200)
})

// Add clickable links to headings with IDs

function linkHeadings () {
  document.querySelectorAll('h2[id], h3[id], h4[id], h5[id], h6[id]').forEach(heading => {
    const anchor = document.createElement('a')

    anchor.innerText = '#'
    anchor.classList.add('permalink')
    anchor.setAttribute('href', `#${heading.id}`)
    anchor.setAttribute('title', 'Permalink')

    heading.append(anchor)
  })
}

linkHeadings()
