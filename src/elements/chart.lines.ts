import {IChartDataModel} from '../chart.app.d'
import { Line } from './line'

export class ChartLines {
    private lines: Line[] = []
    constructor(){
    }

    public renderTo(container, dataModel: IChartDataModel) {
        dataModel.data.forEach((d) => {
            var line = new Line(d.name)
            line.renderTo(container, dataModel)
            this.lines.push(line)
          })
    }

    public rescaleTo(dataModel: IChartDataModel){
      this.lines.forEach(l => l.rescaleTo(dataModel))
    }
}