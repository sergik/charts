import * as constants from '../consts'
import * as model from '../chart.app.d'
import { SvgNamespace } from '../consts'
import { getCountInterval } from '../helpers/count.intervals'
import { getDateInterval } from '../helpers/date.intervals'

interface DataPoint {
  value: number
  text: string
}
export class Axis {
  private axisElements: SVGElement[] = []
  private container: SVGElement
  constructor() {}

  public renderTo(container, dataModel: model.IChartDataModel) {
    this.container = container
    this.drawAxis(this.container, dataModel)
  }

  private drawAxis(container, dataModel){
    this.drawXLine(container, dataModel)
    this.drawYLines(container, dataModel)
  }

  public rescaleTo(dataModel: model.IChartDataModel){
    this.axisElements.forEach(e => {
       this.container.removeChild(e)
    })
    this.axisElements = []
    this.drawAxis(this.container, dataModel)
  }

  private getYDataPoints(dataModel: model.IChartDataModel): DataPoint[] {
    const dataRange = dataModel.context.dataRange.y
    const maxY = dataModel.context.dataRange.y.to
    const interval = getCountInterval(maxY)

    let currentVal = 0
    const intervals = []
    while (currentVal + interval < dataRange.from){
      currentVal += interval
    }
    while (currentVal < dataModel.context.dataRange.y.to) {
      intervals.push(currentVal)
      currentVal += interval
    }

    return intervals.map(i => ({
      text: i.toString(),
      value: i
    }))
  }

  private getXDataPoints(dataModel: model.IChartDataModel) {
    const dataRange = dataModel.context.dataRange.x
    const interval = getDateInterval(dataRange.from, dataRange.to)

    let currentVal = dataRange.from
    const intervals = []

    while (currentVal < dataRange.to) {
      intervals.push(currentVal)
      currentVal += interval
    }

    return intervals.map(i => ({
      text: this.getDateText(i),
      value: i
    }))
  }

  private getDateText(date) {
    const jsDate = new Date(date)
    return `${jsDate.getDate()} ${constants.ShortMonthes[jsDate.getMonth()]}`
  }

  private drawXLine(container, dataModel: model.IChartDataModel) {
    this.getXDataPoints(dataModel).forEach(p => {
      const vector = document.createElementNS(SvgNamespace, 'g')
      container.appendChild(vector)
      this.drawXLabel(vector, p, dataModel)
      this.axisElements.push(vector)
    })
  }

  private drawYLines(container, dataModel: model.IChartDataModel) {
    const xStart = dataModel.context.chartOffset.x.from
    const xEnd = dataModel.context.chartOffset.x.to
    this.getYDataPoints(dataModel).forEach(p => {
      const yVal = dataModel.context.scale.y(p.value)
      const vector = document.createElementNS(SvgNamespace, 'g')
      container.appendChild(vector)
      this.drawLine(vector, { x: xStart, y: yVal }, { x: xEnd, y: yVal }, 'chart-axis')
      this.drawLabel(vector, xStart, yVal - constants.YAxisLabelOffcet, p.text)
      this.axisElements.push(vector)
    })
  }

  private drawLabel(container, x, y, text) {
    const textEl = document.createElementNS(SvgNamespace, 'text')
    textEl.setAttribute('x', x)
    textEl.setAttribute('y', y)
    textEl.innerHTML = text
    container.appendChild(textEl)
    return textEl
  }

  private drawXLabel(container, dataPoint, dataModel: model.IChartDataModel) {
    return this.drawLabel(
      container,
      dataModel.context.scale.x(dataPoint.value),
      dataModel.context.containerSize.height,
      dataPoint.text
    )
  }

  private drawLine(container, start, end, className) {
    const vector = document.createElementNS(SvgNamespace, 'g')
    container.appendChild(vector)
    const line = document.createElementNS(SvgNamespace, 'line')
    line.setAttribute('x1', start.x)
    line.setAttribute('y1', start.y)
    line.setAttribute('x2', end.x)
    line.setAttribute('y2', end.y)
    line.setAttribute('class', className)
    vector.appendChild(line)

    return vector
  }
}
