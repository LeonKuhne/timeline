import Timeline from './timeline.mjs';
import TimeEvent from './time-event.mjs';

// element builder
HTMLElement.prototype.spawnChild = function(tagName='div', callback=null) {
  const elem = document.createElement(tagName)
  this.appendChild(elem)
  if (callback != null) setTimeout(() => callback(elem))
  return elem
}

HTMLElement.prototype.hide = function() { this.classList.add('hidden') }
HTMLElement.prototype.show = function() { this.classList.remove('hidden') }
HTMLElement.prototype.activate = function() { this.classList.add('active') }
HTMLElement.prototype.deactivate = function() { this.classList.remove('active') }

// custom elements
customElements.define('tl-timeline', Timeline);
customElements.define('tl-event', TimeEvent);

// download element
class Home {
  constructor() {
    this.timeline = document.querySelector('tl-timeline')
    this.setupDownload()
    this.setupUpload()
  }

  setupDownload() {
    const button = document.querySelector('#download')
    const link = document.createElement('a')
    // get the first tl-event that isnt of class marker
    link.textContent = button.textContent
    link.href = ''
    link.onclick = () => {
      const filename = document.querySelector('tl-event:not(.marker) input')?.value?.trim() || 'timeline'
      const data = this.timeline.json
      const blob = new Blob([JSON.stringify(data)], {type: 'application/json'})
      const url = URL.createObjectURL(blob)
      link.download = `${filename}.json`
      link.href = url 
    }
    // button
    button.innerHTML = ''
    button.appendChild(link)
  }

  setupUpload() {
    const upload = document.querySelector('#upload')
    const input = document.createElement('input')
    const label = document.createElement('label')
    // link
    input.type = 'file'
    input.accept = '.json'
    input.id = 'importLink'
    input.hide()
    input.onchange = () => {
      const file = input.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        const data = JSON.parse(reader.result)
        this.timeline.json = data
        this.timeline.setMode('edit')
      }
      reader.readAsText(file)
    }
    // label
    label.htmlFor = 'importLink'
    label.textContent = upload.textContent
    // button
    upload.innerHTML = ''
    upload.appendChild(input)
    upload.appendChild(label)
  }
}

window.addEventListener('load', () => new Home())