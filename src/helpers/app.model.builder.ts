import * as model from '../chart.app.d'
import * as consts from '../consts'

export function buildAppDataModel(
  data: model.IChartInputData,
  containerSize: {
    width: number
    height: number
  }
): model.IChartDataModel {
  const chartOffset: model.IDataRange = {
    x: { from: 0, to: containerSize.width },
    y: { from: containerSize.height - consts.AxisWidth, to: 0 }
  }

  const xName = data.columns[0][0]
  const xData = data.columns[0].slice(1, data.columns[0].length)
  const yColumns = data.columns.slice(1, data.columns.length)
  const yData = yColumns.map(y => {
    const yName = y[0]
    const yData = y.slice(1, y.length)
    return {
      initialData: yData,
      name: yName
    }
  })
}

function getDataRangeX(xData): model.IRangeUnit {
  const min = Math.min(...xData)
  const max = Math.max(...xData)
  return {from: min, to: max}
}

function getDataRangeY(yData): model.IRangeUnit {
  const min = []
  const max = []
  for (var i = 0; i < yData.length; i++) {
    min.push(Math.min(...yData[i].initialData))
    max.push(Math.max(...yData[i].initialData))
  }

  return {from: 0, to: Math.max(...max)}
}
