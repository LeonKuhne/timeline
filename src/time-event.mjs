export default class TimeEvent extends HTMLElement {
  minWidth = 15
  constructor() { super() }

  connectedCallback() {
    this.nameElem = this.querySelector('input')
    this.lineElem = this.querySelector('.line')
    this.descriptionElem = this.querySelector('.description')
  }

  firstTimeSetup(name) {
    this.setupMarker(name)
    this.lineElem = this.spawnChild('div', elem => {
      elem.classList.add('line')
    })
    this.descriptionElem = this.spawnChild('textarea', elem => {
      elem.classList.add('description')
      elem.addEventListener('wheel', e => {
        if(elem.scrollHeight == elem.clientHeight) return
        e.stopPropagation()
      })
    })
  }

  setupMarker(name) {
    const topElem = this.spawnChild('div', elem => elem.classList.add('name-container'))
    this.nameElem = topElem.spawnChild('input', elem => {
      elem.classList.add('name')
      elem.value = name
      elem.addEventListener('mouseleave', () => elem.blur())
    })
  }

  decorate(tempName=null, tempDesc=null) {
    this.nameElem.placeholder = tempName ?? `#${Math.random().toString(36).substring(7)}`
    this.descriptionElem.placeholder = tempDesc ?? "click to edit"
    this.nameElem.addEventListener('input', () => {
      const width = `${Math.max(this.nameElem.value.length * 1.1, this.minWidth)}ch`
      this.style.minWidth = width
      this.nameElem.style.width = width
    })
    this.nameElem.dispatchEvent(new Event('input'))
  }

  clone() { return this.cloneNode(true) }
  set title(text) { this.nameElem.value = text }
  set description(text) { this.descriptionElem.value = text }
  markify() { 
    this.classList.add('marker')
    this.descriptionElem.remove()
    this.lineElem.remove()
  }
  unfocus() {
    this.nameElem.blur()
    this.descriptionElem.blur()
  }
  get json() {
    return {
      title: this.nameElem.value,
      description: this.descriptionElem.value
    }
  }
}