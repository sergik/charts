export interface IChartInputData {
  columns: Array<Array<any>>
  types: { [index: string]: string }
  names: { [index: string]: string }
  colors: { [index: string]: string }
}

interface IDataUnit {
  name: string
  values: []
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
}

export interface IChartDataModel {
   data: IChartData
   dataRange: IDataRange
   chartOffset: IDataRange
   containerSize: IDataRange
}
