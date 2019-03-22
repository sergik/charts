export interface IChartInputData {
  columns: Array<Array<any>>
  types: { [index: string]: string }
  names: { [index: string]: string }
  colors: { [index: string]: string }
}

export interface IPreprocessedInputData {
  columns: {[id: string]: Array<number>}
  types: { [index: string]: string }
  names: { [index: string]: string }
  colors: { [index: string]: string }
}

interface IDataUnit {
  name: string
  values: any[]
}

export interface IRangeUnit {
  from: any; 
  to: any
}

export interface IDataRange {
  x: IRangeUnit
  y: IRangeUnit
}

export interface IChartData {
  x: IDataUnit
  y: IDataUnit
  displayOptions:Object
  color: string
  name: string
  visible: boolean
}

export interface IChartContext {
  frameRange: IDataRange
  chartOffset: IDataRange
  containerSize: {
    width: number
    height: number
  },
  scale: {
    x: (x: number) => number,
    y: (y: number) => number
  },
  scaleBack: {
    x: (x: number) => number
  }
}

export interface IChartDataModel {
   data: IChartData[]
   context: IChartContext
   inputData: IChartInputData
}

export interface ISelectedDataFrame{
  from: number
  to: number
}
