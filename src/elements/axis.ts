import * as constants from '../consts'
import * as model from '../chart.app.d'
import { SvgNamespace } from '../consts'
import { getCountInterval } from '../helpers/count.intervals'
import { getDateInterval } from '../helpers/date.intervals'

interface DataPoint {
  value: number
  text: string
}

interface AxisElement {
  point: DataPoint
  label: SVGTextElement
  line?: SVGLineElement
}

interface AxisElements {
  [id: string]: AxisElement
}
export class Axis {
  private xElements: AxisElements = {}
  private yElements: AxisElements = {}
  private elemetsToRemove: AxisElement[] = []
  private container: SVGElement
  constructor() {}

  public renderTo(container, dataModel: model.IChartDataModel) {
    this.container = container
    this.drawAxis(this.container, dataModel)
  }

  private drawAxis(container, dataModel) {
    this.drawXLine(container, dataModel)
    this.drawYLines(container, dataModel)
  }

  public rescaleTo(dataModel: model.IChartDataModel) {
    if (dataModel.data.every(d => !d.visible)) {
      return
    }
    this.updateElementsToRemove(dataModel)
    this.drawAxis(this.container, dataModel)
  }

  private updateElementsToRemove(dataModel){
    const removeNow = this.elemetsToRemove.filter(r => window.getComputedStyle(r.label).getPropertyValue("opacity") == '0')
    const left = this.elemetsToRemove.filter(r => window.getComputedStyle(r.label).getPropertyValue("opacity") != '0')
    removeNow.forEach(r => {
      this.container.removeChild(r.label)
      if(r.line){
        this.container.removeChild(r.line)
      }
    })
    left.forEach(r => {
      if(r.line)
      {
        this.moveYElement(r, dataModel)
      }else{
        this.moveXAxisElement(r, dataModel)
      }
    })
    this.elemetsToRemove = left
  }

  private getYDataPoints(dataModel: model.IChartDataModel): DataPoint[] {
    const dataRange = dataModel.context.dataRange.y
    const range = dataRange.to - dataRange.from
    const interval = getCountInterval(range)

    let currentVal = Math.trunc(dataRange.from / interval) * interval
    const intervals = []
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

    let currentVal = dataModel.inputData.columns[0][1] //dataRange.from
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

  private moveXAxisElement(ae: AxisElement, dataModel){
    const newX = dataModel.context.scale.x(ae.point.value)
    this.moveXElement(ae.label, newX)
  }

  private getStateDif(
    newDataPoints: DataPoint[],
    currentState: AxisElements
  ): {
    create: DataPoint[]
    move: AxisElement[]
    remove: AxisElement[]
  } {
    const create = []
    const move = []
    newDataPoints.forEach(d => {
      const statePoint = currentState[d.text]
      if (statePoint) {
        statePoint.point = d
        move.push(statePoint)
      } else {
        create.push(d)
      }
    })

    const currentValues = Object.keys(currentState)
    const removeKeys = currentValues.filter(v =>
      newDataPoints.every(p => p.text != v)
    )

    return {
      create,
      move,
      remove: removeKeys.map(r => currentState[r])
    }
  }

  private drawXLine(container, dataModel: model.IChartDataModel) {
    const newDatapoints = this.getXDataPoints(dataModel)
    const diff = this.getStateDif(newDatapoints, this.xElements)

    diff.create.forEach(p => {
      const label = this.drawXLabel(container, p, dataModel)
      this.xElements[p.text] = {
        point: p,
        label
      }
    })
    diff.move.forEach(ae => this.moveXAxisElement(ae, dataModel))
    diff.remove.forEach(r => {
      r.label.setAttribute('class', 'fadeout')
      this.elemetsToRemove.push(r)
      delete this.xElements[r.point.text]
    })
  }

  private drawYLines(container, dataModel: model.IChartDataModel) {
    const xStart = dataModel.context.chartOffset.x.from
    const xEnd = dataModel.context.chartOffset.x.to
    const newDatapoints = this.getYDataPoints(dataModel)
    const diff = this.getStateDif(newDatapoints, this.yElements)

    diff.create.forEach((c) => {
      const yVal = dataModel.context.scale.y(c.value)
      const line = this.drawLine(
        { x: xStart, y: yVal },
        { x: xEnd, y: yVal },
        'chart-axis'
      )

      const label = this.drawLabel(
        container,
        xStart,
        yVal - constants.YAxisLabelOffcet,
        c.text
      )

      this.yElements[c.text] = {
        point: c,
        label,
        line
      }
    })

    diff.move.forEach(e => {
      this.moveYElement(e, dataModel)
      e.line.setAttribute('opacity', '1')
    })

    diff.remove.forEach(r => {
      r.label.setAttribute('class', 'fadeout')
      r.line.classList.add('fadeout')
      this.elemetsToRemove.push(r)
      delete this.yElements[r.point.text]
    })
    
  }

  private moveXElement(label: SVGElement, newX){
    label.setAttribute('x', newX)
  }

  private moveYElement(element: AxisElement, dataModel: model.IChartDataModel){
    const newY: any = dataModel.context.scale.y(element.point.value)
    element.label.setAttribute('y', (newY - constants.YAxisLabelOffcet).toString())
    element.line.setAttribute('y1', newY)
    element.line.setAttribute('y2', newY)
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
      dataModel.context.containerSize.height - 5,
      dataPoint.text
    )
  }

  private drawLine(start, end, className): SVGLineElement {
    const line = document.createElementNS(constants.SvgNamespace, 'line')
    this.container.appendChild(line)
    line.setAttribute('x1', start.x)
    line.setAttribute('y1', start.y)
    line.setAttribute('x2', end.x)
    line.setAttribute('y2', end.y)
    line.setAttribute('class', className)
    this.container.appendChild(line)

    return line as SVGLineElement
  }
}
