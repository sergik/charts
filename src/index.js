import './index.css'
import data from './data/chart_data.json'
import { Chart } from './chart'
const elements = document.getElementsByClassName('container')
const container = elements[0]

const chart = new Chart({x: [0, 50, 80, 150, 300, 400, 520, 700, 1000], y: [0, 100, 300, 200, 500, 340, 800, 700, 100], color: '#ff0000'}, container)
chart.draw()