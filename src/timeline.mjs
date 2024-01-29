export default class Timeline extends HTMLElement {
  mode = null
  created = false

  constructor() {
    super()
  }

  connectedCallback() {
    if (this.created) return
    console.log('Timeline connected')
    // create base events
    this.addEvent("start", elem => elem.markify())
    this.demo = this.addEvent("", elem => elem.classList.add('demo'))
    this.addEvent("end", elem => elem.markify())
    this.showDemo(false)
    this.setMode('add')

    // hover -> demo event
    this.addEventListener('mousemove', (e) => { 
      let idx
      switch(this.mode) {
        // show demo
        case 'add':
          this.demo.show()
          idx = this.getCursorIndex(e.clientX)
          if (idx == null) { this.demo.hide(); return }
          this.moveEvent(idx, this.demo)
          break;
        // show selected
        case 'edit':
          if (this.selected) this.selected.deactivate()
          idx = this.getCursorIndex(e.clientX)
          if (idx == null) return
          this.selected = this.eventElems[idx]
          this.selected.activate()
          break;
      }
    })

    // left click -> spawn event
    this.addEventListener('click', (e) => { 
      const idx = this.getCursorIndex(e.clientX)
      const elem = this.cloneBefore(idx, this.demo)
      setTimeout(() => {
        // remove demo class
        elem.classList.remove('demo')
        elem.title = `#${Math.random().toString(36).substring(7)}`
        elem.description = "click to edit"
      })
      this.dispatchEvent(new MouseEvent('mousemove', e))
    })

    // right click -> switch modes
    this.addEventListener('contextmenu', (e) => {
      this.setMode((this.mode == 'edit') ? 'add' : 'edit')
      e.preventDefault()
      this.dispatchEvent(new MouseEvent('mousemove', e))
    })

    this.created = true
  }

  setMode(mode) {
    if (this.mode == mode) return
    const fromMode = this.mode
    // destroy old state 
    switch(fromMode) {
      case 'add':
        this.demo.hide()
        break;
      case 'edit':
        this.selected.deactivate()
        break;
    }
    // update state properties
    this.mode = mode 
    this.setAttribute('mode', mode)
    // setup new state
    switch(mode) {
      case 'add':
        this.showDemo(true)
        break;
    }
  }

  // enable/disable 
  showDemo(visible) {
    if (visible) { 
      this.demo.show() 
    } else {
      this.demo.hide()
    }
  }

  addEvent(name="", callback=null) {
    const elem = this.spawnChild('tl-event', elem => {
      elem.firstTimeSetup(name)
      if (callback) callback(elem)
    })
    return elem
  }

  cloneBefore(index, elem) {
    const clone = elem.clone()
    this.moveEvent(index, clone)
    return clone
  }

  moveEvent(idx, elem) {
    const next = this.eventElems[idx]
    if (next == elem) return
    this.insertBefore(elem, next)
  }

  getCursorIndex(x) {
    const isBetween = (x, a, b) => {
      // account for scroll position
      x += window.scrollX
      const leftBounds = a.offsetLeft - a.offsetWidth/2 
      const rightBounds = b.offsetLeft 
      return x >= leftBounds && x <= rightBounds
    }
    // include demo in 'add' mode
    const elems = this.mode == 'add' ? this.allEventElems : this.eventElems
    for (let i = 0; i < elems.length - 1; i++) {
      if (isBetween(x, elems[i], elems[i+1])) {
        // move after start
        if (i == 0) return 1
        // move after demo
        if (elems[i-1] == this.demo) return i + 1
        return i
      }
    }
    // include if on end
    const end = elems[elems.length - 1] 
    if (x >= end.offsetLeft && x <= end.offsetLeft + end.offsetWidth) return elems.length - 2
    return null
  }

  get allEventElems() { return Array.from(this.children) }
  get eventElems() { return this.allEventElems.filter(elem => !elem.classList.contains('hidden')) }
}