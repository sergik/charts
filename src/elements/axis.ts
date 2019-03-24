import * as constants from '../consts'
import * as model from '../chart.app.d'
import { SvgNamespace } from '../consts'

interface AxisElements {
  [id: string]: model.AxisElement
}
export class Axis {
  private xElements: AxisElements = {}
  private yElements: AxisElements = {}
  private elemetsToRemove: model.AxisElement[] = []
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

  private updateElementsToRemove(dataModel) {
    const removeNow = this.elemetsToRemove.filter(
      r => window.getComputedStyle(r.label).getPropertyValue('opacity') == '0'
    )
    const left = this.elemetsToRemove.filter(
      r => window.getComputedStyle(r.label).getPropertyValue('opacity') != '0'
    )
    removeNow.forEach(r => {
      this.container.removeChild(r.label)
      if (r.line) {
        this.container.removeChild(r.line)
      }
    })
    left.forEach(r => {
      if (r.line) {
        this.moveYElement(r, dataModel)
      } else {
        this.moveXAxisElement(r, dataModel)
      }
    })
    this.elemetsToRemove = left
  }

  private moveXAxisElement(ae: model.AxisElement, dataModel) {
    const newX = dataModel.context.scale.x(ae.point.value)
    this.moveXElement(ae.label, newX)
  }

  private getStateDif(
    newDataPoints: model.DataPoint[],
    currentState: AxisElements
  ): {
    create: model.DataPoint[]
    move: model.AxisElement[]
    remove: model.AxisElement[]
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
    const newDatapoints = dataModel.context.axis.x
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
    const newDatapoints = dataModel.context.axis.y
    const diff = this.getStateDif(newDatapoints, this.yElements)

    diff.create.forEach(c => {
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

  private moveXElement(label: SVGElement, newX) {
    label.setAttribute('x', newX)
  }

  private moveYElement(
    element: model.AxisElement,
    dataModel: model.IChartDataModel
  ) {
    const newY: any = dataModel.context.scale.y(element.point.value)
    element.label.setAttribute(
      'y',
      (newY - constants.YAxisLabelOffcet).toString()
    )
    element.line.setAttribute('y1', newY)
    element.line.setAttribute('y2', newY)
  }

  private drawLabel(container, x, y, text) {
    const textEl = document.createElementNS(SvgNamespace, 'text')
    textEl.setAttribute('x', x)
    textEl.setAttribute('y', y)
    textEl.classList.add('fadeIn')
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
    line.classList.add(className)
    line.classList.add('fadeIn')
    this.container.appendChild(line)

    return line as SVGLineElement
  }
}
