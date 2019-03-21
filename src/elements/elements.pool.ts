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
    return element.getAttribute('opacity') == '0'
  }

  public getElement(tagName: string) {
    return this.pool[tagName].find(e => this.elementAvailable(e))
  }
}
