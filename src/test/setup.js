import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

afterEach(cleanup)

// jsdom has no <dialog> methods, scrollIntoView or visualViewport.
const dialogProto = Object.getPrototypeOf(document.createElement('dialog'))
if (typeof dialogProto.showModal !== 'function') {
  dialogProto.showModal = function () {
    this.setAttribute('open', '')
  }
  dialogProto.show = dialogProto.showModal
  dialogProto.close = function () {
    if (!this.hasAttribute('open')) return
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}
if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = () => {}
}
