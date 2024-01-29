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
          // delete mode
          if (e.ctrlKey) {
            this.demo.hide()
          }
          break;
        // show selected
        case 'edit':
          idx = this.getCursorIndex(e.clientX)
          const newlySelected = this.eventElems[idx]
          if (this.selected == newlySelected) return;
          // deselect
          if (this.selected) {
            this.selected.deactivate()
            this.selected.unfocus()
          }
          // select
          if (idx == null) return
          this.selected = newlySelected
          this.selected.activate()
          break;
      }
    })

    this.addEventListener('click', (e) => { 
      // ctrl + click -> delete
      if (e.ctrlKey) {
        const idx = this.getCursorIndex(e.clientX, false)
        const elem = this.eventElems[idx]
        if (elem) elem.remove()
        return;
      }
      // click -> spawn event
      switch (this.mode) {
        case 'add':
          const idx = this.getCursorIndex(e.clientX)
          const elem = this.cloneBefore(idx, this.demo)
          setTimeout(() => {
            // remove demo class
            elem.classList.remove('demo')
            elem.tempTitle = `#${Math.random().toString(36).substring(7)}`
            elem.tempDescription = "click to edit"
          })
          this.dispatchEvent(new MouseEvent('mousemove', e))
          break;
      }
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
        this.selected?.deactivate()
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

  addMarker(name="", callback=null) { return this.addElem(callback, elem => elem.setupMarker(name)) }
  addEvent(name="", callback=null) { return this.addElem(callback, elem => elem.firstTimeSetup(name)) }
  addElem(callback, method) {
    const elem = this.spawnChild('tl-event', elem => {
      method(elem)
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

  getCursorIndex(x, includeDemo=null) {
    if (includeDemo == null) includeDemo = (this.mode == 'add')
    const isBetween = (x, a, b) => {
      // account for scroll position
      x += window.scrollX
      const leftBounds = a.offsetLeft - a.offsetWidth/2 
      const rightBounds = b.offsetLeft 
      return x >= leftBounds && x <= rightBounds
    }
    // include demo in 'add' mode
    const elems = includeDemo ? this.allEventElems : this.eventElems
    if (elems.length <= 2) return null
    for (let i = 0; i < elems.length - 1; i++) {
      if (isBetween(x, elems[i], elems[i+1])) {
        // move after start
        if (i == 0) return 1
        // move after demo
        if (elems[i-1] == this.demo) return i + 1
        console.log(elems.length)
        return i
      }
    }
    // include if on end
    const end = elems[elems.length - 1] 
    if (x >= end.offsetLeft && x <= end.offsetLeft + end.offsetWidth) {
      let idx = elems.length - 2
      if (elems[idx-1] == this.demo) idx - 1
      return idx 
    }
    return null
  }

  get allEventElems() { return Array.from(this.children) }
  get eventElems() { return this.allEventElems.filter(elem => !elem.classList.contains('hidden')) }
}