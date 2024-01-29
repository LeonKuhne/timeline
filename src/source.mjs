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