import "./chart.css";
import { Line } from './elements/line'
import { Axis } from './elements/axis'
import {LinearScale} from './scales/linear'
import * as consts from './consts'
import {IChartInputData } from './chart.app.d'

//let uuid = 0;
//const next_uuid = () => ++uuid;
export class ChartApp {
  private dataModel: any
  private elements: any
  private rootElement: SVGSVGElement

  constructor(private data: IChartInputData, private container: HTMLElement) {
    this.dataModel = this.buildDataModel(data, {
        width: container.clientWidth,
        height: container.clientHeight
    });
    this.container = container;
    this.elements = this.createElements(this.dataModel)
    //this.uuid = next_uuid();
  }

  _appendRootElement() {
    const rootElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    rootElement.setAttribute("width", this.container.clientWidth.toString());
    rootElement.setAttribute("height", this.container.clientHeight.toString());
    // rootElement.setAttribute(
    //   "viewBox",
    //   `0 0 ${this.container.clientWidth} ${this.container.clientHeight}`
    // );
    //rootElement.setAttribute("id", `svg__${this.uuid}`);
    this.container.appendChild(rootElement);
    return rootElement;
  }

  getDataRangeX(xData) {
    const min = Math.min(...xData);
    const max = Math.max(...xData);
    return [min, max];
  }

  getDataRangeY(yData) {
    const min = [];
    const max = [];
    for (var i = 0; i < yData.length; i++) {
      min.push(Math.min(...yData[i].initialData));
      max.push(Math.max(...yData[i].initialData));
    }

    return [0, Math.max(...max)];
  }

  buildDataModel(data, containerSize) {
    const chartOffset = {
      x: [consts.AxisWidth, containerSize.width],
      y: [containerSize.height - consts.AxisWidth, 0]
    }
    const xName = data.columns[0][0];
    const xData = data.columns[0].slice(1, data.columns[0].length);
    const yColumns = data.columns.slice(1, data.columns.length);
    const yData = yColumns.map(y => {
      const yName = y[0];
      const yData = y.slice(1, y.length);
      return {
        values: yData,
        name: yName
      };
    });
    const xRange = this.getDataRangeX(xData);
    const yRange = this.getDataRangeY(yData);
    const xTransformation = new LinearScale(xRange, chartOffset.x)
    const yTransformation = new LinearScale(yRange, chartOffset.y)

    const lines = yData.map(y => {
      return {
        x: {
          name: xName,
          initialData: xData,
          data: xData.map(x => xTransformation.scale(x))
        },
        y: {
          ...y,
          data: y.initialData.map(y => yTransformation.scale(y))
        },
        displayOptions: {
            'stroke-width': '2px'
        },
        color: data.colors[y.name],
        name: data.names[y.name]
      }
    })
    const dataModel = {
      lines,
      range: {
        x: xRange,
        y: yRange
      },
      chartOffset,
      axis: {
        x: {
          y: containerSize.height
        },
        y: {
          x: 0
        }
      },
      scale: {
        x: (x) => xTransformation.scale(x),
        y: (y) => yTransformation.scale(y)
      }
    }

    return dataModel
  }

  createElements(dataModel){
    const result = []
    result.push(new Axis(dataModel))
    result.push(...this.dataModel.lines.map(m => (new Line(m))))
    return result
  }

  draw() {
    this.rootElement = this._appendRootElement();
    this.elements.forEach(e => e.renderTo(this.rootElement))
  }
}
