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
      elem.dispatchEvent(new Event('input'))
    })
    this.descriptionElem.addEventListener('input', () => {
      this._parseSoundCloud(this.descriptionElem.value)
    })
  }

  setupMarker(name) {
    this.topElem = this.spawnChild('div', elem => elem.classList.add('name-container'))
    this.nameElem = this.topElem.spawnChild('input', elem => {
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

  // soundcloud/trackId (trackid found in the widget url)
  _parseSoundCloud(text) {
    const match = text.match(/soundcloud\/([^/ \n,\]]+)(?:\/([^/ \n,\)\]]+))?/)
    if (!match) { this.topElem.querySelector('.soundcloud')?.remove(); return }
    const trackId = match[1]
    let widgetParams = `&color=%2368442d&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`
    const src = `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}${widgetParams}`
    const iframe = `<iframe scrolling="no" frameborder="no" allow="autoplay" src="${src}"></iframe>`
    // prepend iframe
    const elem = document.createElement('div')
    elem.classList.add('soundcloud')
    elem.innerHTML = iframe
    this.topElem.appendChild(elem)
  }
}