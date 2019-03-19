import { Axis } from './elements/axis'
import { ChartLines } from './elements/chart.lines'
import { IChartInputData } from './chart.app.d'
import { buildAppDataModel } from './helpers/app.model.builder'
import * as model from './chart.app.d'
import { ScrollBar } from './elements/scrol.bar'

export class ChartApp {
  private dataModel: model.IChartDataModel
  private elements: any
  private chartSvg: SVGSVGElement
  private chartAppRoot: HTMLDivElement
  private chartAreaRoot: HTMLDivElement
  private scrollAreaRoot: HTMLDivElement
  private scrollDataFrame: model.ISelectedDataFrame
  private chartLines: ChartLines

  constructor(private inputData: IChartInputData, private container: HTMLElement) {
    this.elements = []
    this.container = container
  }

  appendElements() {
    this.chartAppRoot = document.createElement('div')
    this.chartAppRoot.setAttribute('class', 'chart-app')
    this.container.appendChild(this.chartAppRoot)

    this.chartAreaRoot = document.createElement('div')
    this.chartAreaRoot.setAttribute('class', 'chart')
    this.chartAppRoot.appendChild(this.chartAreaRoot)

    this.scrollAreaRoot = document.createElement('div')
    this.scrollAreaRoot.setAttribute('class', 'scroll')
    this.chartAppRoot.appendChild(this.scrollAreaRoot)

    this.chartSvg = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    )
    this.chartSvg.setAttribute('width', this.chartAreaRoot.clientWidth.toString())
    this.chartSvg.setAttribute('height', this.chartAreaRoot.clientHeight.toString())
    this.chartAreaRoot.appendChild(this.chartSvg)
    return this.chartSvg
  }

  onScrollDataFrameChange(dataFrame){
    this.scrollDataFrame = dataFrame
    this.dataModel = buildAppDataModel(this.inputData, {
      width: this.chartAreaRoot.clientWidth,
      height: this.chartAreaRoot.clientHeight
    },this.scrollDataFrame)
    this.chartLines.rescaleTo(this.dataModel)
  }

  draw() {
    this.appendElements()
    this.dataModel = buildAppDataModel(this.inputData, {
      width: this.chartAreaRoot.clientWidth,
      height: this.chartAreaRoot.clientHeight
    })
    const scrollBar = new ScrollBar((f) => this.onScrollDataFrameChange(f))
    scrollBar.renderTo(this.scrollAreaRoot, this.inputData)
    const axis = new Axis()
    axis.renderTo(this.chartSvg, this.dataModel)
    this.elements.push(axis)
    this.chartLines = new ChartLines()
    this.chartLines.renderTo(this.chartSvg, this.dataModel)
  }
}
