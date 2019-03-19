import {buildAppDataModel} from '../helpers/app.model.builder'
import {IChartInputData} from '../chart.app.d'
import { ChartLines } from './chart.lines';
import * as model from '../chart.app.d'

const scrollerWidht = 20
export class ScrollBar {
  public constructor(private selectedDataFrameChange: (dataFrame: model.ISelectedDataFrame) => void){
  }
  private frameMinSize = 50
  private svg: SVGSVGElement
  private selectedElement: SVGRectElement
  private offsetX
  private selectedType: string
  private center: SVGRectElement
  private right: SVGRectElement
  private left: SVGRectElement
  private offsetLeft: SVGRectElement
  private offsetRight: SVGRectElement
  private scrollWidth
  private scrollHeight
  private centerStrokeWidth = 4
  private halfCenterStrokeWidth
  private dataModel: model.IChartDataModel

  private onSelectedDataframeChange(dataFrame: model.ISelectedDataFrame){
    if(this.selectedDataFrameChange){
      this.selectedDataFrameChange(dataFrame)
    }
  }

  private getSelectedDataframe(): model.ISelectedDataFrame {
    const leftBorder = parseFloat(this.left.getAttributeNS(null, 'x'))
    const rightBorder = parseFloat(this.right.getAttributeNS(null, 'x')) + scrollerWidht
    const dataScale = this.dataModel.context.scaleBack.x
    return {
      from: dataScale(leftBorder),
      to: dataScale(rightBorder)
    }
  }

  public renderTo(container: HTMLElement, inputModel: IChartInputData) {
    this.scrollWidth = container.clientWidth
    this.scrollHeight = container.clientHeight
    this.halfCenterStrokeWidth = this.centerStrokeWidth/2
    this.createSvg(container)
    this.dataModel = buildAppDataModel(inputModel, {
      width: this.scrollWidth,
      height: this.scrollHeight
    })
    const chartLines = new ChartLines()
    chartLines.renderTo(this.svg, this.dataModel) 
    this.createElements()    
    this.addEventListeners()
  }

  private createSvg(container: HTMLElement){
    this.svg = document.createElementNS("http://www.w3.org/2000/svg",
    "svg")
    this.svg.setAttributeNS(null, "width", this.scrollWidth.toString())
    this.svg.setAttributeNS(null, "height", this.scrollHeight.toString())
    container.appendChild(this.svg)
  }

  private createRect(x, y, width, height, fill): SVGRectElement{
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    rect.setAttributeNS(null, 'x', x)
    rect.setAttributeNS(null, 'y', y)
    rect.setAttributeNS(null, 'width', width)
    rect.setAttributeNS(null, 'height', height)
    rect.setAttributeNS(null, 'fill', fill)
    this.svg.appendChild(rect)
    return rect
  }

  private createElements(){
    const scrollerColor = 'rgba(221, 234, 242, 0.6)'
    const offsetColor = 'rgba(245, 249, 251, 0.6)'
    this.offsetLeft = this.createRect(0, 0, 0, this.scrollHeight, offsetColor)
    this.left = this.createRect(0, 0, scrollerWidht, this.scrollHeight, scrollerColor)
    this.left.setAttributeNS(null, 'class', 'left')
    this.right = this.createRect(this.scrollWidth - scrollerWidht, 0, scrollerWidht, this.scrollHeight, scrollerColor)
    this.right.setAttributeNS(null, 'class', 'right')
    this.offsetRight = this.createRect(this.scrollWidth, 0, 0, this.scrollHeight, offsetColor)
    this.center = this.createRect(scrollerWidht + this.halfCenterStrokeWidth, this.halfCenterStrokeWidth, this.scrollWidth - this.centerStrokeWidth - 2*scrollerWidht, this.scrollHeight - this.centerStrokeWidth, 'rgba(255, 255, 255, 0)')
    this.center.setAttributeNS(null, 'stroke-width', this.centerStrokeWidth.toString())
    this.center.setAttributeNS(null, 'stroke', 'rgba(221, 234, 242, 0.6)')
    this.center.setAttributeNS(null, 'class', 'center')
  }

  private addEventListeners(){
    this.left.addEventListener('mousedown', e => this.startDragLeft(e))
    this.left.addEventListener('mouseup', e => this.endDrag(e))
    this.center.addEventListener('mousedown', e => this.startDragCenter(e))
    this.center.addEventListener('mouseup', e => this.endDrag(e))
    this.right.addEventListener('mousedown', e => this.startDragRight(e))
    this.right.addEventListener('mouseup', e => this.endDrag(e))
    this.svg.addEventListener('mousemove', e => this.drag(e))
    this.svg.addEventListener('mouseleave', e => this.endDrag(e))
  }

  private startDrag(evt, slection) {
    if (this.selectedElement) {
      return
    }
    this.selectedType = slection
    this.selectedElement = evt.target
    this.offsetX = this.getMousePosition(evt)
    this.offsetX -= parseFloat(this.selectedElement.getAttributeNS(null, 'x'))
  }

  private startDragLeft(evt) {
    
    this.startDrag(evt, 'left')
  }

  private startDragRight(evt) {
    this.startDrag(evt, 'right')
  }

  private startDragCenter(evt) {
    this.startDrag(evt, 'center')
  }

  private getMousePosition(evt) {
    var CTM = this.svg.getScreenCTM()
    if (evt.touches) {
      evt = evt.touches[0]
    }
    return (evt.clientX - CTM.e) / CTM.a
  }

  private drag(evt) {
    if (this.selectedElement) {
      evt.preventDefault()
      const coordX = this.getMousePosition(evt)
      const newX = coordX - this.offsetX
      const oldX = parseFloat(this.selectedElement.getAttributeNS(null, 'x'))
      if (this.selectedType == 'left') {
        this.dragLeft(newX, oldX)
      }
      if (this.selectedType == 'right') {
        this.dragRight(newX, oldX)
      }
      if (this.selectedType == 'center') {
        this.dragCenter(newX, oldX)
      }
      const dataFrame = this.getSelectedDataframe()
      this.onSelectedDataframeChange(dataFrame)
    }
  }

  private dragCenter(selectionNewX, selecctioOldX) {
    const offsetRightX = parseFloat(
      this.offsetRight.getAttributeNS(null, 'x')
    )
    const offsetRightWidth = parseFloat(
      this.offsetRight.getAttributeNS(null, 'width')
    )
    const rightWidth = parseFloat(this.right.getAttributeNS(null, 'width'))
    const leftWidth = parseFloat(this.left.getAttributeNS(null, 'width'))
    const offsetLeftWidth = parseFloat(this.offsetLeft.getAttributeNS(null, 'width'))
    const rightX = parseFloat(this.right.getAttributeNS(null, 'x'))
    const leftX = parseFloat(this.left.getAttributeNS(null, 'x'))
    const centerWidth = parseFloat(this.center.getAttributeNS(null, 'width'))
    if (selectionNewX - leftWidth - this.centerStrokeWidth/2 < 0) {
      selectionNewX = leftWidth + this.centerStrokeWidth/2
    }
    if (selectionNewX + rightWidth + centerWidth + this.centerStrokeWidth/2 > this.scrollWidth) {
      selectionNewX = this.scrollWidth - centerWidth - rightWidth - this.centerStrokeWidth/2
    }
    let dragDelta = selectionNewX - selecctioOldX
    this.selectedElement.setAttributeNS(null, 'x', selectionNewX.toString())
    this.left.setAttributeNS(null, 'x', (leftX + dragDelta).toString())
    this.offsetLeft.setAttributeNS(
      null,
      'width',
      (offsetLeftWidth + dragDelta).toString()
    )
    this.offsetRight.setAttributeNS(
      null,
      'width',
      (offsetRightWidth - dragDelta).toString()
    )
    this.offsetRight.setAttributeNS(
      null,
      'x',
      (offsetRightX + dragDelta).toString()
    )
    this.right.setAttributeNS(null, 'x', (rightX + dragDelta).toString())
  }

  private dragLeft(selectionNewX, selecctioOldX) {
    const offsetLeftWidth = parseFloat(
      this.offsetLeft.getAttributeNS(null, 'width')
    )
    const centerX = parseFloat(this.center.getAttributeNS(null, 'x'))
    const centerWidth = parseFloat(this.center.getAttributeNS(null, 'width'))
    const rightX = parseFloat(this.right.getAttributeNS(null, 'x'))
    if (selectionNewX < 0) {
      selectionNewX = 0
    }
    if (rightX - selectionNewX < 50) {
      selectionNewX = rightX - 50
    }

    let dragDelta = selectionNewX - selecctioOldX

    this.selectedElement.setAttributeNS(null, 'x', selectionNewX.toString())
    this.center.setAttributeNS(null, 'x', (centerX + dragDelta).toString())
    this.center.setAttributeNS(
      null,
      'width',
      (centerWidth - dragDelta).toString())
    this.offsetLeft.setAttributeNS(
      null,
      'width',
      (offsetLeftWidth + dragDelta).toString()
    )
  }

  private dragRight(selectionNewX, selecctioOldX) {
    const offsetRightWidth = parseFloat(
      this.offsetRight.getAttributeNS(null, 'width')
    )
    const offsetRightX = parseFloat(this.offsetRight.getAttributeNS(null, 'x'))
    const centerWidth = parseFloat(this.center.getAttributeNS(null, 'width'))
    const leftX = parseFloat(this.left.getAttributeNS(null, 'x'))
    const leftWidth = parseFloat(this.left.getAttributeNS(null, 'width'))
    const rightWidth = parseFloat(this.right.getAttributeNS(null, 'width'))
    if (selectionNewX + rightWidth > this.scrollWidth) {
      selectionNewX = this.scrollWidth - rightWidth
    }
    if (selectionNewX - leftX - leftWidth < this.frameMinSize) {
      selectionNewX = leftX + leftWidth + 50
    }

    let dragDelta = selectionNewX - selecctioOldX

    this.selectedElement.setAttributeNS(null, 'x', selectionNewX.toString())
    this.center.setAttributeNS(
      null,
      'width',
      (centerWidth + dragDelta).toString()
    )
    this.offsetRight.setAttributeNS(
      null,
      'width',
      (offsetRightWidth - dragDelta).toString()
    )
    this.offsetRight.setAttributeNS(
      null,
      'x',
      (offsetRightX + dragDelta).toString()
    )
  }

  private endDrag(evt) {
    this.selectedElement = null
    this.selectedType = ''
  }
}
