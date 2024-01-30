export default class Timeline extends HTMLElement {
  mode = null
  created = false

  constructor() {
    super()
  }

  connectedCallback() {
    if (this.created) return
    // create base events
    this.addEvent("start", elem => elem.markify())
    this.demo = this.addEvent("", elem => elem.classList.add('demo'))
    this.addEvent("end", elem => elem.markify())
    this.showDemo(false)
    this.setMode('add')

    // hover -> demo event
    this.addEventListener('mouseenter', (e) => { 
      this.dispatchEvent(new MouseEvent('mousemove', e))
    })
    this.addEventListener('mousemove', (e) => { 
      // highlight delete
      let nonDemoIdx = this.getCursorIndex(e.clientX, false)
      if (e.ctrlKey && nonDemoIdx != null) this.highlightDelete(nonDemoIdx)
      else this.unhighlightDelete()

      switch(this.mode) {
        // show demo
        case 'add':
          this.demo.show()
          let withDemoIdx = this.getCursorIndex(e.clientX)
          if (withDemoIdx == null) { 
            this.demo.hide(); 
            return }
          this.moveEvent(withDemoIdx, this.demo)
          // delete mode
          if (e.ctrlKey) this.demo.hide()
          break;
        // show selected
        case 'edit':
          const newlySelected = this.eventElems[nonDemoIdx]
          if (this.selected == newlySelected) return;
          // deselect
          if (this.selected) {
            this.selected.deactivate()
            this.selected.unfocus()
          }
          // select
          if (nonDemoIdx == null) return
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
        this.dispatchEvent(new MouseEvent('mousemove', e))
        return
      }
      // click -> spawn event
      switch (this.mode) {
        case 'add':
          const idx = this.getCursorIndex(e.clientX)
          const elem = this.cloneBefore(idx, this.demo)
          setTimeout(() => {
            // remove demo class
            elem.classList.remove('demo')
            elem.decorate()
          })
          break
      }
      this.dispatchEvent(new MouseEvent('mousemove', e))
    })

    // right click -> switch modes
    this.addEventListener('contextmenu', (e) => {
      this.setMode((this.mode == 'edit') ? 'add' : 'edit')
      e.preventDefault()
      this.dispatchEvent(new MouseEvent('mousemove', e))
    })

    // scroll y -> change font size
    this.addEventListener('wheel', (e) => {
      const x = e.clientX / window.innerWidth * 2 - 1
      const delta = Math.sign(-e.deltaY) * .2
      this.scale(x, delta)
    })

    // pinch -> change font size

    this.created = true
  }

  scale(x, delta) {
    console.log(x)
    const fontSize = parseFloat(getComputedStyle(this).fontSize)
    const widthBefore = this.scrollWidth
    this.style.fontSize = `${fontSize + delta}px`
    const widthDelta = this.scrollWidth - widthBefore
    this.scrollLeft += widthDelta / 2 * (x + 1)
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

  highlightDelete(idx) {
    const elem = this.eventElems[idx]
    if (elem.classList.contains('deleting')) return
    this.unhighlightDelete()
    elem.classList.add('deleting')
  }
  unhighlightDelete() {
    this.allEventElems.forEach(elem => elem.classList.remove('deleting'))
  }

  getCursorIndex(x, includeDemo=null) {
    if (includeDemo == null) includeDemo = (this.mode == 'add')
    const isBetween = (x, a, b) => {
      // account for scroll position
      x += window.scrollX + this.scrollLeft
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

  clear() { this.eventElems.splice(1, this.eventElems.length-2).forEach(elem => elem.remove()) }
  get allEventElems() { return Array.from(this.children) }
  get eventElems() { return this.allEventElems.filter(elem => !elem.classList.contains('hidden')) }
  get json() {
    return this.eventElems
      .filter(elem => !elem.classList.contains('marker') && !elem.classList.contains('hidden'))
      .map(elem => elem.json)
  }
  set json(data) {
    this.clear()
    data.forEach(event => {
      const preElem = this.addEvent(event.title, elem => {
        elem.title = event.title
        elem.description = event.description 
        elem.decorate()
      })
      this.moveEvent(this.eventElems.length - 2, preElem)
    })
  }
}