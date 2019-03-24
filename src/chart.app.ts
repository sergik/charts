import { Axis } from './elements/axis'
import { ChartLines } from './elements/chart.lines'
import { IChartInputData } from './chart.app.d'
import { buildAppDataModel } from './helpers/app.model.builder'
import * as model from './chart.app.d'
import { ScrollBar } from './elements/scrol.bar'
import { Selector } from './elements/selector'
import { Tooltip } from './elements/tooltip'
import { StateTransition } from './elements/stateTransition'
import { AxisTransitionAdapter } from './elements/axis.transition.adapter'

export class ChartApp {
  private dataModel: model.IChartDataModel
  private chartSvg: SVGSVGElement
  private chartAppRoot: HTMLDivElement
  private chartAreaRoot: HTMLDivElement
  private scrollAreaRoot: HTMLDivElement
  private scrollDataFrame: model.ISelectedDataFrame
  private selectionState: { [id: string]: boolean }
  private chartLines: ChartLines
  private scrollBar: ScrollBar
  private axisTransition: AxisTransitionAdapter
  private selector: Selector
  private tooltip: Tooltip
  private transiton: StateTransition

  constructor(
    private inputData: IChartInputData,
    private container: HTMLElement
  ) {
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
    this.chartSvg.setAttribute(
      'width',
      this.chartAreaRoot.clientWidth.toString()
    )
    this.chartSvg.setAttribute(
      'height',
      this.chartAreaRoot.clientHeight.toString()
    )
    this.chartAreaRoot.appendChild(this.chartSvg)
    return this.chartSvg
  }

  onScrollDataFrameChange(dataFrame) {
    this.scrollDataFrame = dataFrame
    this.updateState()
  }

  updateState() {
    const newDataModel = buildAppDataModel(
      this.inputData,
      {
        width: this.chartAreaRoot.clientWidth,
        height: this.chartAreaRoot.clientHeight
      },
      this.scrollDataFrame,
      this.selectionState
    )

    this.transiton.rescaleTo(this.dataModel, newDataModel)
  }

  onSelectionStateChange(state) {
    this.selectionState = state
    this.dataModel.context.selection = state
    this.dataModel.data.forEach(d => {
      d.visible = state[d.y.name]
    })
    if (!this.dataModel.data.every(d => !d.visible)) {
      this.updateState()
    } else {
      this.tooltip.rescaleTo(this.dataModel)
      this.chartLines.rescaleTo(this.dataModel)
    }
    this.scrollBar.rescaleTo(state)
  }

  draw() {
    this.appendElements()
    this.dataModel = buildAppDataModel(
      this.inputData,
      {
        width: this.chartAreaRoot.clientWidth,
        height: this.chartAreaRoot.clientHeight
      },
      this.scrollDataFrame,
      this.selectionState
    )
    this.scrollBar = new ScrollBar(f => this.onScrollDataFrameChange(f))
    this.scrollBar.renderTo(this.scrollAreaRoot, this.inputData)
    const axis = new Axis()
    this.axisTransition = new AxisTransitionAdapter(axis)
    this.axisTransition.renderTo(this.chartSvg, this.dataModel)
    this.chartLines = new ChartLines(true)
    this.chartLines.renderTo(this.chartSvg, this.dataModel)
    this.selector = new Selector(s => this.onSelectionStateChange(s))
    this.selector.renderTo(this.chartAppRoot, this.dataModel)
    this.tooltip = new Tooltip()
    this.tooltip.renderTo(this.chartSvg, this.dataModel)
    this.transiton = new StateTransition(newDataModel => {
      this.dataModel = newDataModel
      this.chartLines.rescaleTo(this.dataModel)
      this.tooltip.rescaleTo(this.dataModel)
      this.axisTransition.rescaleTo(this.dataModel)
    })
  }
}
