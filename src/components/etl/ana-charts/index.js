// import echarts from 'echarts/lib/echarts'
import * as echarts from 'echarts'

import Line from './packages/line'
import Bar from './packages/bar'
import Pie from './packages/pie'
import Radar from './packages/radar'
import Funnel from './packages/funnel'
import Scatter from './packages/scatter'
import { checkKeyInModel, init } from './common'

const components = {
  Line,
  Bar,
  Pie,
  Radar,
  Funnel,
  Scatter
}

const Chart = {
  // Default configuration
  settings: {},
  /**
   * Configure global properties
   * @param {Object} options Global configuration item
   */
  config(options) {
    const { theme } = options
    // Registration theme
    if (theme) {
      checkKeyInModel(theme, 'name', 'data')
      echarts.registerTheme(theme.name, theme.data)
      if (theme.default) {
        Chart.settings.defaultTheme = theme.name
      }
    }
  }
}

// Corresponding methods for injection of different components
for (const key in components) {
  if (Object.prototype.hasOwnProperty.call(components, key)) {
    Chart[key.toLowerCase()] = (el, data, options) => {
      return init(components[key], el, data, options)
    }
  }
}

export {
  Line,
  Bar,
  Pie,
  Radar,
  Funnel,
  Scatter
}

export default Chart

if (typeof window !== 'undefined') {
  window.Chart = Chart
}
