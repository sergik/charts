import * as model from '../chart.app.d'
import * as consts from '../consts'
import { LinearScale } from '../scales/linear'
import { getCountInterval } from './count.intervals';

export function rebuildToFrame(
   currentModel: model.IChartDataModel,
   newFrame: model.IDataRange
 ): model.IChartDataModel {
  
  const dataPoints = getDataPoints(newFrame.x, currentModel.inputData)
  currentModel.data.forEach(d => {
    d.x = dataPoints.x
    d.y = dataPoints.yData.find(y => y.name == d.y.name)
  })
  currentModel.context.frameRange = newFrame
  const xTransformation = new LinearScale(newFrame.x, currentModel.context.chartOffset.x)
  const xTransformationBack = new LinearScale(currentModel.context.chartOffset.x, newFrame.x)
  const yTransformation = new LinearScale(newFrame.y, currentModel.context.chartOffset.y)
  currentModel.context.scale.x = x => xTransformation.scale(x)
  currentModel.context.scale.y = y => yTransformation.scale(y)
  currentModel.context.scaleBack.x = x => xTransformationBack.scale(x)
  currentModel.context.dataRange = {
    x: getDataRangeX(dataPoints.x.values, newFrame.x),
    y: getDataRangeY(dataPoints.yData, currentModel.context.selection)
  }


  return currentModel
}

function getDataPoints(newFrame: model.IRangeUnit, inputData: model.IChartInputData){
  let fromIndex = 1
  let toIndex = inputData.columns[0].length - 1
  if (newFrame) {
    fromIndex =
      inputData.columns[0].findIndex(val => val >= newFrame.from) - 1
    if (fromIndex < 1) {
      fromIndex = 1
    }
    toIndex =
      inputData.columns[0].findIndex(val => val >= newFrame.to) + 1
    if (toIndex < 1 || toIndex > inputData.columns[0].length - 1) {
      toIndex = inputData.columns[0].length - 1
    }
  }
  const xName = inputData.columns[0][0]
  const xData = inputData.columns[0].slice(fromIndex, toIndex)
  const yColumns = inputData.columns.slice(1, inputData.columns.length)
  const yData = yColumns.map(y => {
    const yName = y[0]
    const yData = y.slice(fromIndex, toIndex)
    return {
      values: yData,
      name: yName
    }
  })

  return {
    x: {
      values: xData,
      name: xName
    },
    yData
  }
}

export function buildAppDataModel(
  inputData: model.IChartInputData,
  containerSize: {
    width: number
    height: number
  },
  scrollDataFrame: model.ISelectedDataFrame,
  selectionState: { [id: string]: boolean }
): model.IChartDataModel {
  const chartOffset: model.IDataRange = {
    x: { from: 0, to: containerSize.width - 5 },
    y: { from: containerSize.height - consts.AxisWidth, to: 15 }
  }

  const dataPoints = getDataPoints(scrollDataFrame, inputData)
  
  const data = dataPoints.yData.map(y => ({
    x: dataPoints.x,
    y,
    displayOptions: {
      'stroke-width': '3px'
    },
    color: inputData.colors[y.name],
    name: inputData.names[y.name],
    visible: !selectionState || selectionState[y.name]
  }))

  const dataRange = {
    x: getDataRangeX(dataPoints.x.values, scrollDataFrame),
    y: getDataRangeY(dataPoints.yData, selectionState)
  }

  const frameRange = getFrameRange(dataRange)

  const xTransformation = new LinearScale(frameRange.x, chartOffset.x)
  const xTransformationBack = new LinearScale(chartOffset.x, frameRange.x)
  const yTransformation = new LinearScale(frameRange.y, chartOffset.y)
  return {
    inputData,
    data,
    context: {
      dataRange,
      selection: selectionState,
      frameRange,
      containerSize,
      chartOffset,
      scale: {
        x: x => xTransformation.scale(x),
        y: y => yTransformation.scale(y)
      },
      scaleBack: {
        x: x => xTransformationBack.scale(x)
      }
    }
  }
}

function getDataRangeX(
  xData,
  scrollDataFrame: model.ISelectedDataFrame
): model.IRangeUnit {
  if (scrollDataFrame) {
    return scrollDataFrame
  }
  const min = Math.min(...xData)
  const max = Math.max(...xData)
  return { from: min, to: max }
}

function getDataRangeY(
  yData,
  selectionState: { [id: string]: boolean }
): model.IRangeUnit {
  const min = []
  const max = []
  for (var i = 0; i < yData.length; i++) {
    if (!selectionState || selectionState[yData[i].name]) {
      min.push(Math.min(...yData[i].values))
      max.push(Math.max(...yData[i].values))
    }
  }

  let to = max.length < 1 ?  1 : Math.max(...max)
  let from = min.length < 1 ?  0 : Math.min(...min)

  return { from, to }
}

function getFrameRange(dataRange){
  let interval = getCountInterval(dataRange.y.to - dataRange.y.from)
  if(!interval){
    interval = 1
  }

  const yFrom =  Math.trunc(dataRange.y.from/interval) * interval
  const frameRange = {
    x: dataRange.x,
    y: {
      from: yFrom,
      to: dataRange.y.to
    }
  }

  return frameRange
}
