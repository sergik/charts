
import { Chart } from './chart'
const elements = document.getElementsByClassName('container')
const container = elements[0]

const chart = new Chart([], container)
chart.draw()