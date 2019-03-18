import * as constants from '../consts'

interface DataPoint{
  value: number
  text: string
}
export class Axis {
  constructor(private dataModel) {
    this.dataModel = dataModel;
  }
  renderTo(container) {
    this.drawXLine(
      container,
      this.dataModel
    )
    this.drawYLines(container, this.dataModel)
  }

  getCountInterval(maxY){
    const supportedIntervals = []
    for(var i = 0; i < 7; i++){
      const multiplier = Math.pow(10, i)
      supportedIntervals.push(1 * multiplier)
      supportedIntervals.push(2 * multiplier)
      supportedIntervals.push(3 * multiplier)
      supportedIntervals.push(5 * multiplier)
    }

    return supportedIntervals.find(i => maxY / i < 7)
  }

  getYDataPoints(dataModel): DataPoint[]{
      const maxY = dataModel.range.y[1]
      const interval = this.getCountInterval(maxY)

      const intervals: number[] = []
      let currentVal = 0
      let i = 0
      while(currentVal < dataModel.range.y[1]){
        currentVal = i * interval
        intervals.push(currentVal)
        i++
      }

      return intervals.map(i => ({
        text: i.toString(),
        value: i
      }))
  }

  getXDataPoints(dataModel){
      const xPoints = 6
      const dayLenthMiliseconds = 1000 * 60 * 60 * 24
      const xRange = dataModel.range.x
      const dayDiff = (xRange[1] - xRange[0]) / (1000 * 60 * 60 * 24)
      const dayInterval = dayDiff/xPoints
      return Array.from(Array(xPoints).keys()).map(index => {
          const value = xRange[0] + index * dayInterval * dayLenthMiliseconds
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

  drawXLine(container, dataModel) {
    const vector = document.createElementNS("http://www.w3.org/2000/svg", "g");
    container.appendChild(vector);
    this.getXDataPoints(dataModel).forEach(p => {
        this.drawXLabel(vector, p, dataModel)
    })
  }

  drawYLines(container, dataModel) {
    const vector = document.createElementNS("http://www.w3.org/2000/svg", "g");
    container.appendChild(vector);
    const xStart = dataModel.chartOffset.x[0]
    const xEnd = dataModel.chartOffset.x[1]
    this.getYDataPoints(dataModel).forEach((p) => {
      const yVal = dataModel.scale.y(p.value)
      this.drawLine(vector, {x: xStart, y: yVal}, {x: xEnd, y: yVal})
      this.drawLabel(vector,xStart, yVal - constants.YAxisLabelOffcet, p.text)
    })
  }

  drawLabel(container, x, y, text){
    const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textEl.setAttribute('x', x)
    textEl.setAttribute('y', y)
    textEl.innerHTML = text
    container.appendChild(textEl)
  }

  drawXLabel(container, dataPoint, dataModel){
    const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textEl.setAttribute('x', dataModel.scale.x(dataPoint.value))
    textEl.setAttribute('y', dataModel.axis.x.y)
    textEl.innerHTML = dataPoint.text
    container.appendChild(textEl)
  }

  drawLine(container, start, end) {
    const vector = document.createElementNS("http://www.w3.org/2000/svg", "g");
    container.appendChild(vector);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", start.x);
    line.setAttribute("y1", start.y);
    line.setAttribute("x2", end.x);
    line.setAttribute("y2", end.y);
    line.setAttribute("stroke-width", "1px");
    line.setAttribute("stroke", "#000");
    vector.appendChild(line);
  }
}
