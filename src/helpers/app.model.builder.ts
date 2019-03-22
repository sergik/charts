import * as model from '../chart.app.d'
import * as consts from '../consts'
import { LinearScale } from '../scales/linear'

// export function preprocessData(inputData: model.IChartInputData): model.IPreprocessedInputData {
//   const columns = {}
//   inputData.columns.forEach(c => {
//     const name = c[0]
//     const data = c.slice(1, c.length - 1)
//     columns[name] = data
//   })

//   return {
//     columns,
//     colors: inputData.colors,
//     names: inputData.names,
//     types: inputData.types
//   }
// }

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
    y: { from: containerSize.height - consts.AxisWidth, to: 10 }
  }

  let fromIndex = 1
  let toIndex = inputData.columns[0].length - 1
  if (scrollDataFrame) {
    fromIndex =
      inputData.columns[0].findIndex(val => val >= scrollDataFrame.from) - 1
    if (fromIndex < 1) {
      fromIndex = 1
    }
    toIndex =
      inputData.columns[0].findIndex(val => val >= scrollDataFrame.to) + 1
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

  const data = yData.map(y => ({
    x: {
      name: xName,
      values: xData
    },
    y,
    displayOptions: {
      'stroke-width': '3px'
    },
    color: inputData.colors[y.name],
    name: inputData.names[y.name],
    visible: !selectionState || selectionState[y.name]
  }))

  const frameRange = {
    x: getDataRangeX(xData, scrollDataFrame),
    y: getDataRangeY(yData, selectionState)
  }

  const xTransformation = new LinearScale(frameRange.x, chartOffset.x)
  const xTransformationBack = new LinearScale(chartOffset.x, frameRange.x)
  const yTransformation = new LinearScale(frameRange.y, chartOffset.y)
  return {
    inputData,
    data,
    context: {
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

  return { from: 0, to: Math.max(...max) }
}
