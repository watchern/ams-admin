import echarts from 'echarts'
import Chart from '../index'

export default class Base {
  constructor(element, settings) {
    this.settings = settings
    const options = this.transform()
    if (options) {
      this.options = options
      if (settings.theme) {
        // Use a registered custom theme
        this.echart = echarts.init(element, settings.theme)
      } else if (Chart.settings.defaultTheme) {
        // Topics using global configuration
        this.echart = echarts.init(element, Chart.settings.defaultTheme)
      } else {
        this.echart = echarts.init(element)
      }
      // Response window resize event
      window.addEventListener('resize', () => this.echart.resize())
      this.apply()
    }
  }

  /**
   * refresh data
   * @param {*} data Icon data
   */
  setData(data) {
    if (data && data.length !== 0) {
      this.settings.data = data
      this.options = this.transform()
      this.apply()
    }
  }

  injectDataIntoSeries(data, series) {
    data.forEach(o => {
      if (o.index === 'all') {
        delete o.index
        series = series.map(item => {
          return Object.assign({}, item, o)
        })
      } else if (o.index === 'start') {
        delete o.index
        series[0] = Object.assign({}, series[0], o)
      } else if (o.index === 'end') {
        delete o.index
        series[series.length - 1] = Object.assign({}, series[series.length - 1], o)
      } else if (Array.isArray(o.index)) {
        for (const i of o.index) {
          if (series[i]) {
            series[i] = Object.assign({}, series[i], o)
          }
        }
      }
    })
    return series
  }
}
