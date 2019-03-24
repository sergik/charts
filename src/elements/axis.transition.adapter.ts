import { Axis } from './axis'
import * as model from '../chart.app.d'

export class AxisTransitionAdapter {
  constructor(private axis: Axis) {}

  public renderTo(container, dataModel) {
    this.axis.renderTo(container, dataModel)
  }

  public rescaleTo(dataModel: model.IChartDataModel) {
    const transitionToModel = dataModel.context.transition.to
    if (transitionToModel) {
      dataModel.context.axis.y = transitionToModel.context.axis.y
    }
    this.axis.rescaleTo(dataModel)
  }
}
