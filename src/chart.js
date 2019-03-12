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
    this.drawLineTo(this.rootElement, this.data)
  }

  drawLineTo(container, data) {
    const vector = document.createElementNS('http://www.w3.org/2000/svg','g')
    container.appendChild(vector)
    const path = document.createElementNS('http://www.w3.org/2000/svg','path')
    path.setAttribute('stroke', data.color)
    path.setAttribute('fill', 'transparent')
    path.setAttribute('d', this.getLineDefinition(this.data))
    vector.appendChild(path)
  }

  getLineDefinition(data){
      let result = `M${data.x[0]},${data.y[0]} `
      for(let i = 1; i < data.x.length; i++){
        result += `L${data.x[i]},${data.y[i]} `
      }
      return result
  }
}
