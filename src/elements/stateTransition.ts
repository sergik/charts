import * as model from '../chart.app.d'
import { rebuildToFrame } from '../helpers/app.model.builder'
export class StateTransition {
  private transitionIn = 30
  private currentCancellation: {
    cancel: () => void
  }
  constructor(
    private applyTranstion: (newDataModel: model.IChartDataModel) => void
  ) {}

  public rescaleTo(from: model.IChartDataModel, to: model.IChartDataModel) {
    if (this.currentCancellation) {
      this.currentCancellation.cancel()
    }
    const fromFrame = from.context.frameRange
    const toFrame = to.context.frameRange

    const yIterationTo = (toFrame.y.to - fromFrame.y.to) / this.transitionIn
    const yIterationFrom =
      (toFrame.y.from - fromFrame.y.from) / this.transitionIn

    const xIterationTo = (toFrame.x.to - fromFrame.x.to) / this.transitionIn
    const xIterationFrom =
      (toFrame.x.from - fromFrame.x.from) / this.transitionIn

    this.currentCancellation = this.doRescaleTo(
      xIterationFrom,
      yIterationFrom,
      xIterationTo,
      yIterationTo,
      from
    )
  }

  private doRescaleTo(
    xIterationFrom,
    yIterationFrom,
    xIterationTo,
    yIterationTo,
    currentModel
  ) {
    let framesCount = 0
    let cancelled = false
    const cancellation = {
      cancel: () => {
        cancelled = true
      }
    }
    const doRescaleIteration = model => {
      window.requestAnimationFrame(() => {
        if (cancelled) {
          return
        }
        const newFrame = model.context.frameRange
        newFrame.x.from += xIterationFrom
        newFrame.y.from += yIterationFrom
        newFrame.x.to += xIterationTo
        newFrame.y.to += yIterationTo

        const newModel = rebuildToFrame(model, newFrame)
        this.applyTranstion(newModel)
        if (
            framesCount < this.transitionIn - 1
        ) {
          doRescaleIteration(newModel)
          framesCount++
        }
      })
    }
    doRescaleIteration(currentModel)
    return cancellation
  }
}
