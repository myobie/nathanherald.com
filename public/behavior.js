function shouldChangeColor () {
  if ('matchMedia' in window) {
    return window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  } else {
    return true
  }
}
const styles = ['blaze', 'blood', 'puce']

function colorize () {
  if (shouldChangeColor()) {
    const newStyle = styles[Math.floor(Math.random() * styles.length)]

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
