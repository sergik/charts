import * as constants from '../consts'
import * as model from '../chart.app.d'
import { SvgNamespace } from '../consts'
import { getCountInterval } from '../helpers/count.intervals'
import { getDateInterval } from '../helpers/date.intervals'
import { SvgElementsPool } from '../elements/elements.pool'

interface DataPoint {
  value: number
  text: string
}
export class Axis {
  private axisElements: SVGElement[] = []
  private container: SVGElement
  private elementsPool: SvgElementsPool
  private lines: SVGElement[] = []
  constructor() {}

  public renderTo(container, dataModel: model.IChartDataModel) {
    this.elementsPool = new SvgElementsPool(container)
    this.elementsPool.init()
    this.container = container
    this.drawAxis(this.container, dataModel)
  }

  private drawAxis(container, dataModel){
    this.drawXLine(container, dataModel)
    this.drawYLines(container, dataModel)
  }

  public rescaleTo(dataModel: model.IChartDataModel){
    if(dataModel.data.every(d => !d.visible)){
      return
    }
    this.axisElements.forEach(e => {
       this.container.removeChild(e)
       this.lines.forEach(l => l.setAttribute('opacity', '0'))
    })
    this.axisElements = []
    this.lines = []
    this.drawAxis(this.container, dataModel)
  }

  private getYDataPoints(dataModel: model.IChartDataModel): DataPoint[] {
    const dataRange = dataModel.context.frameRange.y
    const maxY = dataModel.context.frameRange.y.to
    const interval = getCountInterval(maxY)

    let currentVal = 0
    const intervals = []
    while (currentVal + interval < dataRange.from){
      currentVal += interval
    }
    while (currentVal < dataModel.context.frameRange.y.to) {
      intervals.push(currentVal)
      currentVal += interval
    }

    return intervals.map(i => ({
      text: i.toString(),
      value: i
    }))
  }

  private getXDataPoints(dataModel: model.IChartDataModel) {
    const dataRange = dataModel.context.frameRange.x
    const interval = getDateInterval(dataRange.from, dataRange.to)

    let currentVal = dataModel.inputData.columns[0][1]//dataRange.from
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
      const line = this.drawLine({ x: xStart, y: yVal }, { x: xEnd, y: yVal }, 'chart-axis')
      this.lines.push(line)
      const label = this.drawLabel(container, xStart, yVal - constants.YAxisLabelOffcet, p.text)
      this.axisElements.push(label)
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

  private drawLine(start, end, className) {
    const line = this.elementsPool.getElement('line')
    line.setAttribute('opacity', '1')
    line.setAttribute('x1', start.x)
    line.setAttribute('y1', start.y)
    line.setAttribute('x2', end.x)
    line.setAttribute('y2', end.y)
    line.setAttribute('class', className)

    return line
  }
}
