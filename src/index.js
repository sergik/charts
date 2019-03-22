import data from './data/chart_data.json'
import { ChartApp } from './chart.app'
import { ThemeSelector } from './elements/theme.selector'
const dataUrl = 'https://sergeyvolkovich.neocities.org/chart_data.json'
const appElement = document.getElementById('app')
document.onselectstart = function()
{
    window.getSelection().removeAllRanges();
};

// fetch(dataUrl).then(response => {
//   response.json().then(data => {
//     for (var i = 0; i < data.length; i++) {
//       const chart = new ChartApp(data[i], appElement)
//       chart.draw()
//     }

//     const themeSelector = new ThemeSelector()
//     themeSelector.renderTo(document.getElementById('theme-switcher'))
//   })
// })


for (var i = 0; i < data.length; i++) {
  const chart = new ChartApp(data[i], appElement)
  chart.draw()
}
const themeSelector = new ThemeSelector()
themeSelector.renderTo(document.getElementById('theme-switcher'))
