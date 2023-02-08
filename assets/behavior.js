function shouldChangeColor () {
  if ('matchMedia' in window) {
    return window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  } else {
    return true
  }
}
function sorter () { return 0.5 - Math.random() }
const styles = ['blaze', 'blood', 'puce']

function colorize () {
  if (shouldChangeColor()) {
    const newStyle = styles.sort(sorter)[0]

    document.body.classList.remove('default')

    for (const style of styles) {
      document.body.classList.remove(style)
    }

    document.body.classList.add(newStyle)
  }
}

colorize()

self.addEventListener('load', _e => {
  setTimeout(() => {
    document.body.classList.add('animated')
    setInterval(colorize, 25000)
  }, 200)
})
