export default function(value) {
  return {
    series: [
      {
        type: 'gauge',
        center: ['50%', '45%'], // Instrument position
        radius: '80%', // Instrument size
        startAngle: 200, // Starting angle
        endAngle: -20, // End angle
        axisLine: {
          show: false,
          lineStyle: { // Property linestyle controls line style
            color: [
            ],
            width: 10
          }
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false
        },
        pointer: { // Pointer style
          length: '45%'
        },
        detail: {
          show: false
        }
      },
      {
        type: 'gauge',
        center: ['50%', '45%'], // Default global center
        radius: '70%',
        startAngle: 200,
        endAngle: -20,
        axisLine: {
          show: true,
          lineStyle: { // Property linestyle controls line style
            color: [ // Dial Color
              [0.5, '#20AE51'], // 0-50%Color in place
              [0.7, '#FFED44'], // 51%-70%Color in place
              [0.9, '#FF9618'], // 70%-90%Color in place
              [1, '#DA462C']// 90%-100%Color in place
            ],
            width: 30// Dial width
          }
        },
        splitLine: { // Split line style (and 10, 20 equal length line style)
          length: 30,
          lineStyle: { // Property linestyle controls line style
            width: 2
          }
        },
        axisTick: { // Tick mark style (and short line style)
          length: 20
        },
        axisLabel: { // Text style (and text styles such as "10", "20")
          color: 'black',
          distance: 5 // Distance between text and dial
        },
        detail: {
          formatter: '{score|{value}%}',
          offsetCenter: [0, '50%'],
          backgroundColor: '#2D8BF0',
          height: 30,
          rich: {
            score: {
              color: 'white',
              fontFamily: 'Microsoft YaHei',
              fontSize: 32
            }
          }
        },
        data: [{
          value: value || 0,
          label: {
            textStyle: {
              fontSize: 12
            }
          }
        }]
      }
    ]
  }
}
