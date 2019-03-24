import * as model from '../chart.app.d'
interface LineDataModel {
  data: model.IChartData
  context: model.IChartContext
}

interface DrawDataPoint {
  x: number
  y: number
  initial: {
    x: number
    y: number
  }
}

export class Line {
  public state: DrawDataPoint[]
  private path: SVGPathElement
  private vector: SVGGElement
  private chartData: model.IChartData
  private container: HTMLElement
  constructor(public name: string) {}

  public renderTo(container, dataModel: model.IChartDataModel) {
    this.container = container
    this.chartData = dataModel.data.find(d => d.name == this.name)
    this.createLine()
    this.state = this.generateDataPoints(this.chartData, dataModel.context)
    this.draw(this.path, this.state)
  }

  private createLine(){
    this.vector = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    this.container.appendChild(this.vector)
    this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    this.vector.appendChild(this.path)
    this.path.setAttribute('stroke', this.chartData.color)
    this.path.setAttribute('fill', 'transparent')
  }

  private removeLine(){
    this.container.removeChild(this.vector)
  }

  public draw(path: SVGPathElement, points: DrawDataPoint[]) {
      path.setAttribute('d', this.getLineDefinition(points))
  }

  public generateDataPoints(chartData: model.IChartData, context: model.IChartContext): DrawDataPoint[] {
    return chartData.x.values.map((x, index) => {
      const y = chartData.y.values[index]
      return {
        x: context.scale.x(x),
        y: context.scale.y(y),
        initial: {
          x,
          y
        }
      }
    })
  }

  public rescaleTo(dataModel: model.IChartDataModel, redraw?){
    if(redraw){
      this.removeLine()
      this.createLine()
    }
    this.chartData = dataModel.data.find(d => d.name == this.name)
    this.state = this.generateDataPoints(this.chartData, dataModel.context)
    this.draw(this.path, this.state)
    this.path.style.display = this.getDisplayStyle(this.chartData)
  }

  getDisplayStyle(chartData: model.IChartData){
    return chartData.visible ? 'block': 'none'
  }

  getLineDefinition(points: DrawDataPoint[]) {
    let result = `M${points[0].x},${points[0].y} `
    for (let i = 1; i < points.length; i++) {
      result += `L${points[i].x},${points[i].y} `
    }
    return result
  }
}
