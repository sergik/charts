import * as constants from '../consts'
import * as model from '../chart.app.d'

interface DataPoint {
  value: number
  text: string
}
export class Axis {
  constructor() {
  }
  
  renderTo(container, dataModel: model.IChartDataModel) {
    this.drawXLine(container, dataModel)
    this.drawYLines(container, dataModel)
  }

  getCountInterval(maxY) {
    const supportedIntervals = []
    for (var i = 0; i < 7; i++) {
      const multiplier = Math.pow(10, i)
      supportedIntervals.push(1 * multiplier)
      supportedIntervals.push(2 * multiplier)
      supportedIntervals.push(3 * multiplier)
      supportedIntervals.push(5 * multiplier)
    }

    return supportedIntervals.filter(i => maxY / i < 7)[0]
  }

  getYDataPoints(dataModel: model.IChartDataModel): DataPoint[] {
    const maxY = dataModel.context.dataRange.y.to
    const interval = this.getCountInterval(maxY)

    const intervals: number[] = []
    let currentVal = 0
    let i = 0
    while (currentVal < dataModel.context.dataRange.y.to) {
      currentVal = i * interval
      intervals.push(currentVal)
      i++
    }

    return intervals.map(i => ({
      text: i.toString(),
      value: i
    }))
  }

  getXDataPoints(dataModel: model.IChartDataModel) {
    const xPoints = 6
    const xRange = dataModel.context.dataRange.x
    const dayDiff = (xRange.to - xRange.from) / constants.DayInMiliseconds
    const dayInterval = dayDiff / xPoints

    const templateArray = []
    for (let i = 0; i < xPoints; i++){
      templateArray.push(i)
    }
    return templateArray.map(index => {
      const value = xRange.from + index * dayInterval * constants.DayInMiliseconds
      return {
        index,
        value,
        text: this.getDateText(value)
      }
    })
  }

  getDateText(date) {
    const jsDate = new Date(date)
    return `${jsDate.getDate()} ${constants.ShortMonthes[jsDate.getMonth()]}`
  }

  drawXLine(container, dataModel: model.IChartDataModel) {
    const vector = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    container.appendChild(vector)
    this.getXDataPoints(dataModel).forEach(p => {
      this.drawXLabel(vector, p, dataModel)
    })
  }

  drawYLines(container, dataModel: model.IChartDataModel) {
    const vector = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    container.appendChild(vector)
    const xStart = dataModel.context.chartOffset.x.from
    const xEnd = dataModel.context.chartOffset.x.to
    this.getYDataPoints(dataModel).forEach(p => {
      const yVal = dataModel.context.scale.y(p.value)
      this.drawLine(vector, { x: xStart, y: yVal }, { x: xEnd, y: yVal })
      this.drawLabel(vector, xStart, yVal - constants.YAxisLabelOffcet, p.text)
    })
  }

  drawLabel(container, x, y, text) {
    const textEl = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    )
    textEl.setAttribute('x', x)
    textEl.setAttribute('y', y)
    textEl.innerHTML = text
    container.appendChild(textEl)
  }

  drawXLabel(container, dataPoint, dataModel: model.IChartDataModel) {
    const textEl = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    )
    textEl.setAttribute('x', dataModel.context.scale.x(dataPoint.value).toString())
    textEl.setAttribute('y', dataModel.context.containerSize.height.toString())
    textEl.innerHTML = dataPoint.text
    container.appendChild(textEl)
  }

  drawLine(container, start, end) {
    const vector = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    container.appendChild(vector)
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', start.x)
    line.setAttribute('y1', start.y)
    line.setAttribute('x2', end.x)
    line.setAttribute('y2', end.y)
    line.setAttribute('stroke-width', '1px')
    line.setAttribute('stroke', '#000')
    vector.appendChild(line)
  }
}
