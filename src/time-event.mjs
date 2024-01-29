export default class TimeEvent extends HTMLElement {
  constructor() { super() }

  connectedCallback() {
    console.log('TimeEvent connected')
    this.nameElem = this.querySelector('input')
    this.lineElem = this.querySelector('.line')
    this.descriptionElem = this.querySelector('.description')
  }

  firstTimeSetup(name) {
    this.setupMarker(name)
    this.lineElem = this.spawnChild('div', elem => elem.classList.add('line'))
    this.descriptionElem = this.spawnChild('textarea', elem => elem.classList.add('description'))
  }

  setupMarker(name) {
    const topElem = this.spawnChild('div', elem => elem.classList.add('name-container'))
    this.nameElem = topElem.spawnChild('input', elem => {
      elem.classList.add('name')
      elem.value = name
      elem.addEventListener('mouseleave', () => elem.blur())
    })
  }

  clone() { return this.cloneNode(true) }
  set title(text) { this.nameElem.value = text }
  set tempTitle(text) { this.nameElem.placeholder = text }
  set tempDescription(text) { this.descriptionElem.placeholder = text }
  markify() { 
    this.classList.add('marker')
    this.descriptionElem.remove()
    this.lineElem.remove()
  }
  unfocus() {
    this.nameElem.blur()
    this.descriptionElem.blur()
  }
}