import { IChartDataModel } from '../chart.app.d'
import { getMousePositionX } from '../helpers/svg.helpers'
import * as consts from '../consts'
export class Tooltip {
  private container: SVGSVGElement
  private dataModel: IChartDataModel
  private currentIndex
  private line: SVGLineElement
  private dataPoints: SVGElement[] = []
  private tooltip: Element
  constructor() {}

  public renderTo(container: SVGSVGElement, dataModel: IChartDataModel) {
    this.container = container
    this.dataModel = dataModel
    this.container.addEventListener('mouseleave', e => {
      this.removeElements(container)
    })
    const showTooltipHandler = e => {
      const xCord = getMousePositionX(e, this.container)
      const xVal = this.dataModel.context.scaleBack.x(xCord)
      const closestPointIndex = this.getClosestPointIndex(xVal, this.dataModel)
      if (this.currentIndex != closestPointIndex) {
        this.currentIndex = closestPointIndex
        this.removeElements(container)
        this.createElements(container, this.dataModel, closestPointIndex)
      }
    }
    //this.container.addEventListener('mousemove', e => showTooltipHandler(e))
    this.container.addEventListener('click', e => showTooltipHandler(e))
  }

  public rescaleTo(dataModel: IChartDataModel) {
    this.removeElements(this.container)
    this.dataModel = dataModel
  }

  private removeElements(container: SVGElement) {
    if (this.tooltip) {
      container.removeChild(this.tooltip)
      this.tooltip = null
    }
    if (this.line) {
      container.removeChild(this.line)
      this.line = null
    }

    this.dataPoints.forEach(d => {
      container.removeChild(d)
    })

    this.dataPoints = []
  }
  private createElements(
    container: SVGElement,
    dataModel: IChartDataModel,
    pointIndex
  ) {
    if (this.dataModel.data.every(d => !d.visible)) {
      return
    }
    const xVal = dataModel.data[0].x.values[pointIndex]
    const xCord = dataModel.context.scale.x(xVal)
    const xCordStr = xCord.toString()
    this.line = document.createElementNS(consts.SvgNamespace, 'line')
    this.line.setAttribute('x1', xCordStr)
    this.line.setAttribute('y1', dataModel.context.chartOffset.y.to)
    this.line.setAttribute('x2', xCordStr)
    this.line.setAttribute('y2', dataModel.context.chartOffset.y.from)
    this.line.setAttribute('class', 'tooltip-line')
    container.appendChild(this.line)

    this.drawDataPoints(container, dataModel, pointIndex)

    const fo = document.createElementNS(consts.SvgNamespace, 'foreignObject')
    this.tooltip = fo
    fo.setAttribute('x', xCordStr)
    fo.setAttribute('y', '0')
    fo.setAttribute('width', '400')
    fo.setAttribute('height', '400')
    container.appendChild(fo)

    const tooltipDiv = document.createElement('div')
    tooltipDiv.setAttribute('class', 'tooltip')
    fo.appendChild(tooltipDiv)

    const headerDiv = document.createElement('div')
    tooltipDiv.appendChild(headerDiv)

    const header = document.createElement('h3')
    header.innerHTML = this.getDateText(xVal)
    tooltipDiv.appendChild(header)

    const valsDiv = document.createElement('valsDiv')
    tooltipDiv.appendChild(valsDiv)

    this.addValueElements(valsDiv, dataModel, pointIndex)

    const resultWidth = tooltipDiv.offsetWidth
    let tooltipX = xCord - resultWidth / 2
    if (tooltipX < 0) {
      tooltipX = 0
    }

    if (xCord + resultWidth > dataModel.context.chartOffset.x.to) {
      tooltipX = dataModel.context.chartOffset.x.to - resultWidth
    }
    fo.setAttribute('x', tooltipX.toString())
  }

  private addValueElements(
    container: HTMLElement,
    dataModel: IChartDataModel,
    index
  ) {
    dataModel.data
      .filter(d => d.visible)
      .forEach((d, i) => {
        const dataContainer = document.createElement('div')
        let containerClass = 'data-container'
        if (i > 0) {
          containerClass += ' padding-left'
        }
        dataContainer.setAttribute('class', containerClass)
        dataContainer.style.color = d.color
        container.appendChild(dataContainer)

        const valTextEl = document.createElement('div')
        valTextEl.innerHTML = d.y.values[index]
        valTextEl.setAttribute('class', 'value-text')
        dataContainer.appendChild(valTextEl)

        const nameTextEl = document.createElement('div')
        nameTextEl.innerHTML = d.name
        nameTextEl.setAttribute('class', 'name-text')
        dataContainer.appendChild(nameTextEl)
      })
  }

  private drawDataPoints(
    container: SVGElement,
    dataModel: IChartDataModel,
    index
  ) {
    dataModel.data
      .filter(d => d.visible)
      .forEach(d => {
        const xCord = dataModel.context.scale.x(d.x.values[index])
        const yCord = dataModel.context.scale.y(d.y.values[index])
        const circle = document.createElementNS(consts.SvgNamespace, 'circle')
        circle.setAttributeNS(null, 'r', '4')
        circle.setAttributeNS(null, 'class', 'data-point')
        circle.setAttributeNS(null, 'cx', xCord.toString())
        circle.setAttributeNS(null, 'cy', yCord.toString())
        circle.setAttributeNS(null, 'stroke', d.color)
        circle.setAttributeNS(null, 'stroke-width', '3')
        this.dataPoints.push(circle)
        this.container.appendChild(circle)
      })
  }

  getDateText(val) {
    const jsDate = new Date(val)
    const dayOfWeek = consts.DayNames[jsDate.getDay()]
    return `${dayOfWeek}, ${jsDate.getDate()} ${
      consts.ShortMonthes[jsDate.getMonth()]
    }`
  }

  getDisplayStyle(visible) {
    return visible ? 'block' : 'none'
  }

  private getClosestPointIndex(xVal, dataModel: IChartDataModel) {
    const xValues = dataModel.data[0].x.values
    let toIndex = xValues.findIndex(x => x > xVal)
    if (toIndex < 0) {
      toIndex = xValues.length - 1
    }
    let fromIndex = toIndex - 1
    if (fromIndex < 0) {
      fromIndex = 0
    }

    const fromDif = Math.abs(xVal - xValues[fromIndex])
    const toDif = Math.abs(xValues[toIndex] - xVal)

    if (fromDif < toDif) {
      return fromIndex
    }
    return toIndex
  }
}
