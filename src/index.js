import data from './data/chart_data.json'
import { ChartApp } from './chart.app'
import { ThemeSelector } from './elements/theme.selector';

const appElement = document.getElementById('app')

for(var i =0; i< data.length; i++)
{
const chart = new ChartApp(data[i], appElement)
chart.draw()
}

const themeSelector = new ThemeSelector()
themeSelector.renderTo(document.getElementById('theme-switcher'))