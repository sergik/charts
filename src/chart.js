import './chart.css'
let uuid = 0;
const next_uuid = () => ++uuid
export class Chart {
  constructor(data, container) {
    this.data = data;
    this.container = container;
    this.uuid = next_uuid()
  }

  _appendRootElement() {
      const rootElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      rootElement.setAttribute('width', this.container.clientWidth)
      rootElement.setAttribute('height', this.container.clientHeight)
      rootElement.setAttribute('viewBox', `0 0 ${this.container.clientWidth} ${this.container.clientHeight}`)
      rootElement.setAttribute('id', `svg__${this.uuid}`)
      this.container.appendChild(rootElement)
      return rootElement;
  }

  draw() {
    this.rootElement = this._appendRootElement()
    var newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
    newLine.setAttribute('id','line2')
    newLine.setAttribute('x1','0')
    newLine.setAttribute('y1','0')
    newLine.setAttribute('x2','500')
    newLine.setAttribute('y2','500')
    newLine.setAttribute("stroke", "black")
    this.rootElement.appendChild(newLine)
  }
}
