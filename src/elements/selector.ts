import * as model from '../chart.app.d'
import { getUniqueId } from '../helpers/id.generator'
export class Selector {
  private state:{[id: string]: boolean} = {}
  constructor(private stateChnage: (state:{[id: string]: boolean}) => void) {}

  private createDiv(container: HTMLElement, className): HTMLElement {
    const div = document.createElement('div')
    div.className = className
    container.appendChild(div)
    return div
  }

  public renderTo(container: HTMLElement, dataModel: model.IChartDataModel) {
    const selectorArea = this.createDiv(container, 'selector')

    dataModel.data.forEach(d => {
      this.state[d.y.name] = true
      this.createCheckboxFor(selectorArea, d)
    })
  }

  private createCheckboxFor(
    container: HTMLElement,
    data: model.IChartData
  ) {
    const checkbox = this.createDiv(container, 'checkbox')
    const checkboxConainer = this.createDiv(checkbox, 'checkbox-container')
    const round = this.createDiv(checkboxConainer, 'round')

    const checkboxId = `checkbox_${getUniqueId()}`
    const input = document.createElement('input')
    input.checked = true
    input.setAttribute('id', checkboxId)
    input.setAttribute('type', 'checkbox')
    round.appendChild(input)

    const checkBoxLabel = document.createElement('label')
    checkBoxLabel.setAttribute('for', checkboxId)
    this.setCheckboxColor(true, checkBoxLabel, data.color)
    round.appendChild(checkBoxLabel)

    const textLable = document.createElement('label')
    textLable.setAttribute('for', checkboxId)
    textLable.setAttribute('class', 'text')
    textLable.innerHTML = data.name
    checkbox.appendChild(textLable)

    input.addEventListener('click', e => {
      const element = e.target as any
      const checked = element.checked
      this.setCheckboxColor(checked, checkBoxLabel, data.color)
      this.state[data.y.name] = checked
      this.stateChnage(this.state)
    })
  }

  private setCheckboxColor(checked, label: HTMLElement, color) {
    if (checked) {
      label.style.backgroundColor = color
      label.style.borderColor = color
    } else {
      label.style.backgroundColor = '#fff'
      label.style.borderColor = '#bbb'
    }
  }
}
