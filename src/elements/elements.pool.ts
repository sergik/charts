import { SvgNamespace } from '../consts'
const elementPoolSize = 20
export class SvgElementsPool {
  private pool: { [id: string]: SVGElement[] } = {}
  public constructor(private container: SVGElement) {}

  public init() {
    const lines = []
    for (let i = 0; i < elementPoolSize; i++) {
      var element = document.createElementNS(SvgNamespace, 'line')
      element.setAttribute('opacity', '0')
      lines.push(element)
      this.container.appendChild(element)
    }
    this.pool['line'] = lines
  }

  private elementAvailable(element: SVGElement) {
    return window.getComputedStyle(element).getPropertyValue('opacity') == '0'
  }

  public getElement(tagName: string) {
    let element = this.pool[tagName].find(e => this.elementAvailable(e))
    if (!element) {
      const orderedElements = this.pool[tagName].sort(e =>
        parseFloat(window.getComputedStyle(e).getPropertyValue('opacity'))
      )
      element = orderedElements[0]
    }

    return element
  }
}
