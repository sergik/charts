export class Line {
  constructor(dataModel) {
    this.dataModel = dataModel;
  }
  renderTo(container) {
    const vector = document.createElementNS("http://www.w3.org/2000/svg", "g");
    container.appendChild(vector);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", this.dataModel.color);
    path.setAttribute("fill", "transparent");
    path.setAttribute("d", this.getLineDefinition(this.dataModel));
    this.useDisplayOptions(path, this.dataModel.displayOptions)
    vector.appendChild(path);
  }

  useDisplayOptions(path, options){
    for(var propt in options){
      path.setAttribute(propt, options[propt])
    }
  }

  getLineDefinition(dataModel) {
    let result = `M${dataModel.x.data[0]},${dataModel.y.data[0]} `;
    for (let i = 1; i < dataModel.x.data.length; i++) {
      result += `L${dataModel.x.data[i]},${dataModel.y.data[i]} `;
    }
    return result;
  }
}
