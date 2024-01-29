export default class TimeEvent extends HTMLElement {
  constructor() { super() }

  connectedCallback() {
    console.log('TimeEvent connected')
    this.nameElem = this.querySelector('span')
    this.lineElem = this.querySelector('.line')
  }

  firstTimeSetup(name) {
    this.nameElem = this.spawnChild('div', elem => {
      elem.spawnChild('span', elem => {
        elem.textContent = name
        elem.classList.add('name')
      })
      elem.classList.add('name-container')
    })
    this.lineElem = this.spawnChild('div', elem => elem.classList.add('line'))
    this.descriptionElem = this.spawnChild('div', elem => elem.classList.add('description'))
  }

  clone() { return this.cloneNode(true) }
  set title(text) { this.nameElem.textContent = text }
  markify() { 
    this.classList.add('marker')
    this.removeChild(this.lineElem)
    this.removeChild(this.descriptionElem)
  }
}