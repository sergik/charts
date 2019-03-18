import './index.css'
import data from './data/chart_data.json'
import { ChartApp } from './chart.app'
const elements = document.getElementsByClassName('container')
const container = elements[0]

const myData = {columns: [['x',0, 50, 80, 150, 300, 400, 520, 700, 1000], ['y0',0, 100, 300, 200, 500, 340, 800, 700, 100]], colors: {y0: '#ff0000'}, names: {y0: '#1'}};

const chart = new ChartApp(data[3], container)
chart.draw()