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
  private chartData: model.IChartData
  constructor(public name: string) {}

  public renderTo(container, dataModel: model.IChartDataModel) {
    this.chartData = dataModel.data.find(d => d.name == this.name)
    const vector = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    container.appendChild(vector)
    if (!this.path) {
      this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      container.appendChild(this.path)
    }
    this.path.setAttribute('stroke', this.chartData.color)
    this.path.setAttribute('fill', 'transparent')
    this.useDisplayOptions(this.path, this.chartData.displayOptions)
    this.state = this.generateDataPoints(this.chartData, dataModel.context)
    this.draw(this.path, this.state)
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

  useDisplayOptions(path, options) {
    for (var propt in options) {
      path.setAttribute(propt, options[propt])
    }
  }

  public rescaleTo(dataModel: model.IChartDataModel){
    this.chartData = dataModel.data.find(d => d.name == this.name)
    this.state = this.generateDataPoints(this.chartData, dataModel.context)
    this.draw(this.path, this.state)
  }

  getLineDefinition(points: DrawDataPoint[]) {
    let result = `M${points[0].x},${points[0].y} `
    for (let i = 1; i < points.length; i++) {
      result += `L${points[i].x},${points[i].y} `
    }
    return result
  }
}
