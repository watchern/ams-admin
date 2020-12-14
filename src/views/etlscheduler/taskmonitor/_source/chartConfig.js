import { turn } from 'core-js/fn/array'
import { data } from 'jquery'
import _ from 'lodash'
import {
  tasksState
} from './config'

const pie = {
  legend: {
    orient: 'vertical',
    left: 0,
    data: ['等待中', '等待文件', '等待依赖', '执行中', '暂停', '已取消', '执行完成', '执行失败']
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b} : {c} ({d}%)'
  },
  series: [{
    type: 'pie',
    clickable: true, // 是否打开点击
    minAngle: 5, // 最小扇区角度（0〜360），用于防止值太小而导致扇区太小而影响交互
    avoidLabelOverlap: false, // 是否防止标签重叠政策
    hoverAnimation: false, // 是否启用悬停以放大该扇区上的动画.
    legendHoverLink: false, // 执行颜色卡片时，相应的选项高亮
    // silent: true,
    radius: ['45%', '75%'],
    center: ['66.8%', '37.5%'],
    label: {
      show: false,
      position: 'center',
      fontSize: '20',
      formatter: '   {d}% \r\n {b}'
    },
    emphasis: {
      label: {
        show: true,
        fontSize: '20',
        // fontWeight: 'bold',
        formatter: '   {d}% \r\n {b}'
      }
    },
    labelLine: {
      show: false
    }
  }
  ]
}

//     label: {
//       normal: {
//         show: true,
//         position: 'center',
//         fontSize: '30',
//         formatter:function(){
//           return'   100% \r\n执行完成'
//       }
//       },
//       textStyle:{
//         fontSize: '30'
//       },
//       align: 'left',
//       position: 'center',
//       show:true,
//     },

//     emphasis: {
//       label: {
//         show: true,
//         fontSize: '30',
//         fontWeight: 'bold'
//       }
//     },

//     labelLine: {
//       show: false
//     },
//   }],
// }

const bar = {
  title: {
    text: ''
  },
  grid: {
    right: '2%'
  },
  xAxis: {
    splitLine: {
      show: false
    },
    axisLabel: {
      formatter(v) {
        return `${v.split(',')[0]} (${v.split(',')[2]})`
      }
    }
  },
  tooltip: {
    formatter(v) {
      const val = v[0].name.split(',')
      return `${val[0]} (${v[0].value})`
    }
  },
  series: [{
    type: 'bar',
    barWidth: 30
  }]
}

const simple = {
  xAxis: {
    splitLine: {
      show: false
    },
    axisLabel: {
      interval: 0,
      showMaxLabel: true,
      formatter(v) {
        return tasksState[v].desc
      }
    }
  },
  tooltip: {
    formatter(data) {
      let str = ''
      _.map(data, (v, i) => {
        if (i === 0) {
          str += `${tasksState[v.name].desc}<br>`
        }
        str += `<div style="font-size: 12px;">${v.seriesName} : ${v.data}<br></div>`
      })
      return str
    }
  },
  color: ['#D5050B', '#0398E1']

}

export {
  pie,
  bar,
  simple
}
