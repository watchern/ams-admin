<template>
  <div class="recommendPage">
    <el-menu default-active="0" class="el-menu-demo" mode="horizontal">
      <el-menu-item index="0" @click="jump(0)">处理中心</el-menu-item>
      <el-menu-item index="1" @click="jump(1)">消息中心</el-menu-item>
    </el-menu>
    <swiper :options="swiperOption" ref="mySwiper">
      <swiper-slide>
        <mtEditor ref='chart' :data='result' :chart-config='opNode'></mtEditor>
      </swiper-slide>
      <swiper-slide>
        <mtEditor ref='chart' :data='result' :chart-config='opNode'></mtEditor>
      </swiper-slide>
<!--      <div class="swiper-pagination" slot="pagination"></div>
      <div class="swiper-button-prev" slot="button-prev"></div>
      <div class="swiper-button-next" slot="button-next"></div>-->
    </swiper>
  </div>
</template>

<script>
// 引入插件
import { swiper, swiperSlide } from "vue-awesome-swiper";
import "swiper/dist/css/swiper.css";
import mtEditor from 'ams-datamax'
import 'iview/dist/styles/iview.css'
export default {
  name: 'Home',
  components: {
    swiper,
    swiperSlide, mtEditor
  },
  data() {
    return {
      result: {
        column: ['编号ID', '省份', '省份代码', '城市', '城市代码', '区县', '区县代码', '日期', '商品分类', '商品编号', '商品条码', '商品名称', '规格', '单位', '产地', '库存状况', '含税价', '零售价', '订购数量', '销售金额', '配送数', '销售数量', '经度', '纬度', '大区'],
        columnType: ['number', 'varchar', 'number', 'varchar', 'number', 'varchar', 'number', 'time', 'varchar', 'number', 'number', 'varchar', 'varchar', 'varchar', 'varchar', 'varchar', 'float', 'float', 'time', 'float', 'float', 'float', 'float', 'float', 'varchar'],
        data: [
          ['138', '河北省', '130000', '保定市', '130600', '博野县', '130637', '2017/9/7', '食品类', '20211', '38199121', '食品-192g牛奶燕麦脆棒饼', '1*12', '包', '香港', '②暂无', '30', '40', '266', '7040', '798', '176', '114.469', '38.037', '其它'],
          ['2372', '四川省', '510000', '达州市', '511700', '开江县', '511723', '2018/7/20', '食品类', '21362', '38583147', '600g mixx特级苏打饼-芝麻', '1*12', '包', '香港', '②暂无', '9.375', '12.5', '12', '3412.5', '36', '273', '104.076', '30.652', '西南'],
          ['3015', '宁夏回族自治区', '640000', '石嘴山市', '640200', '市辖区', '640201', '2018/3/21', '厨房配料', '70039', '37278801', '李锦记幼滑虾酱', '1*12', '坪', '日本', '①正常库存', '10.875', '14.5', '33', '1493.5', '99', '103', '106.259', '38.471', '其他1'],
          ['1816', '湖南省', '430000', '衡阳市', '430400', '常宁市', '430482', '2018/5/19', '化妆类', '31145', '19120673', '天参宝完美欢颜黄金眼霜', '20g', '支', '韩国', '①正常库存', '9.375', '12.5', '22', '2050', '66', '164', '112.984', '28.112', '华中']
        ],
        // 维度
        wd: ['省份'],
        // 度量
        dl: ['含税价']
      },
      opNode: {
        'id': 1607409535321,
        'type': 'eCharts',
        'chart': 'bar',
        'config': {
          'box': {
            'width': 400,
            'height': 300,
            'x': 0,
            'y': 0,
            'zIndex': 100
          },
          'theme': 'light',
          'options': {
            'dataset': {},
            'title': {
              'text': '简单柱状图33',
              'subtext': '44',
              'textStyle': {
                'fontStyle': 'normal',
                'fontWeight': 'bold',
                'fontSize': 18,
                'lineHeight': 18,
                'width': '50%'
              },
              'subtextStyle': {
                'fontStyle': 'normal',
                'fontWeight': 'normal',
                'fontSize': 12,
                'lineHeight': 12
              },
              'x': 'center',
              'show': true
            },
            'tooltip': {
              'trigger': 'item',
              'axisPointer': {
                'type': 'shadow'
              },
              'show': true
            },
            'legend': {
              'show': true,
              'type': 'plain',
              'orient': 'horizontal',
              'x': 'center',
              'y': 'bottom',
              'textStyle': {}
            },
            'grid': {
              'containLabel': true
            },
            'dataZoom': [],
            'xAxis': [{
              'type': 'category',
              'position': 'bottom',
              'axisLabel': {
                'fontSize': 12,
                'interval': 0
              },
              'axisLine': {
                'lineStyle': {}
              },
              'show': true,
              'min': null,
              'max': 'dataMax'
            }],
            'yAxis': [{
              'type': 'value',
              'show': true,
              'position': 'left',
              'axisLabel': {
                'fontSize': 12,
                'interval': 0
              },
              'axisLine': {
                'lineStyle': {}
              },
              'splitLine': {
                'lineStyle': {}
              },
              'interval': null,
              'min': null,
              'max': 'dataMax'
            }],
            'toolbox': {
              'show': true,
              'feature': {
                'mark': {
                  'show': true
                },
                'dataView': {
                  'show': true,
                  'readOnly': true
                },
                'restore': {
                  'show': true
                },
                'saveAsImage': {
                  'show': true
                }
              }
            },
            'series': [{
              'type': 'bar',
              'name': 'er',
              'xAxisIndex': 0,
              'yAxisIndex': 0,
              'stack': '',
              'z': 0,
              'encode': {
                'y': ['含税价'],
                'x': ['省份']
              }
            }]
          }
        },
        'formConfig': {
          'config': [{
            'type': '基础',
            'icon': 'md-build',
            'con': [{
              'name': '标题',
              'item': [{
                'key': 'options/title',
                'sub': [{
                  'key': 'show',
                  'name': '是否显示',
                  'type': 'boolean'
                }, {
                  'key': 'text',
                  'name': '标题',
                  'type': 'text'
                }, {
                  'key': 'subtext',
                  'name': '子标题',
                  'type': 'text'
                }, {
                  'key': 'x',
                  'name': '对齐方式',
                  'type': 'select',
                  'dataName': 'commonData',
                  'dataKey': 'align_x'
                }]
              }, {
                'key': 'options/title/textStyle',
                'sub': [{
                  'key': 'fontStyle',
                  'name': '标题风格',
                  'type': 'select',
                  'dataName': 'commonData',
                  'dataKey': 'fontStyle'
                }, {
                  'key': 'fontWeight',
                  'name': '标题粗细',
                  'type': 'select',
                  'dataName': 'commonData',
                  'dataKey': 'fontWeight'
                }, {
                  'key': 'fontSize',
                  'name': '标题大小',
                  'type': 'number',
                  'unit': 'px'
                }, {
                  'key': 'lineHeight',
                  'name': '标题行高',
                  'type': 'number',
                  'unit': 'px'
                }, {
                  'key': 'color',
                  'name': '标题颜色',
                  'type': 'color'
                }]
              }, {
                'key': 'options/title/subtextStyle',
                'sub': [{
                  'key': 'fontStyle',
                  'name': '子标题风格',
                  'type': 'select',
                  'dataName': 'commonData',
                  'dataKey': 'fontStyle'
                }, {
                  'key': 'fontWeight',
                  'name': '子标题粗细',
                  'type': 'select',
                  'dataName': 'commonData',
                  'dataKey': 'fontWeight'
                }, {
                  'key': 'fontSize',
                  'name': '子标题大小',
                  'type': 'number',
                  'unit': 'px'
                }, {
                  'key': 'lineHeight',
                  'name': '子标题行高',
                  'type': 'number',
                  'unit': 'px'
                }, {
                  'key': 'color',
                  'name': '颜色',
                  'type': 'color'
                }]
              }]
            }, {
              'name': '提示',
              'item': [{
                'key': 'options/tooltip',
                'sub': [{
                  'key': 'show',
                  'name': '是否显示',
                  'type': 'boolean'
                }]
              }]
            }, {
              'name': '图例',
              'item': [{
                'key': 'options/legend',
                'sub': [{
                  'key': 'show',
                  'name': '是否显示',
                  'type': 'boolean'
                }, {
                  'key': 'type',
                  'name': '图例类型',
                  'type': 'select',
                  'dataName': 'commonData',
                  'dataKey': 'legend_type'
                }, {
                  'key': 'orient',
                  'name': '布局朝向',
                  'type': 'select',
                  'dataName': 'commonData',
                  'dataKey': 'legend_orient'
                }, {
                  'key': 'x',
                  'name': '水平对齐',
                  'type': 'select',
                  'dataName': 'commonData',
                  'dataKey': 'align_x'
                }, {
                  'key': 'y',
                  'name': '垂直对齐',
                  'type': 'select',
                  'dataName': 'commonData',
                  'dataKey': 'align_y'
                }]
              }, {
                'key': 'options/legend/textStyle',
                'sub': [{
                  'key': 'color',
                  'name': '图例字体颜色',
                  'type': 'color'
                }]
              }]
            }, {
              'name': 'x轴',
              'isArray': true,
              'addEnable': true,
              'addTitle': '添加X轴',
              'config': [{
                'name': 'x轴',
                'item': [{
                  'key': 'options/xAxis/{index}',
                  'sub': [{
                    'key': 'name',
                    'name': '名称',
                    'type': 'text'
                  }, {
                    'key': 'type',
                    'name': '类型',
                    'type': 'select',
                    'dataName': 'commonData',
                    'dataKey': 'xy_type'
                  }, {
                    'key': 'show',
                    'name': '是否显示',
                    'type': 'boolean'
                  }, {
                    'key': 'position',
                    'name': '位置',
                    'type': 'select',
                    'dataName': 'commonData',
                    'dataKey': 'x_position'
                  }, {
                    'key': 'min',
                    'name': '最小值',
                    'type': 'text'
                  }, {
                    'key': 'max',
                    'name': '最大值',
                    'type': 'text'
                  }]
                }, {
                  'key': 'options/xAxis/{index}/axisLabel',
                  'sub': [{
                    'key': 'fontSize',
                    'name': '字体大小',
                    'type': 'number',
                    'unit': 'px'
                  }, {
                    'key': 'interval',
                    'name': '刻度间隔',
                    'type': 'number',
                    'unit': 'px'
                  }, {
                    'key': 'color',
                    'name': '字体颜色',
                    'type': 'color'
                  }]
                }, {
                  'key': 'options/xAxis/{index}/axisLine/lineStyle',
                  'sub': [{
                    'key': 'color',
                    'name': '轴线颜色',
                    'type': 'color'
                  }]
                }]
              }],
              'addProperty': 'options/xAxis',
              'addChartTemplate': {
                'type': 'category',
                'position': 'top',
                'axisLabel': {
                  'fontSize': 12,
                  'interval': 0
                },
                'axisLine': {
                  'lineStyle': {}
                },
                'show': true,
                'min': null,
                'max': 'dataMax'
              },
              'addFormTemplate': {
                'name': 'x轴',
                'item': [{
                  'key': 'options/xAxis/{index}',
                  'sub': [{
                    'key': 'name',
                    'name': '名称',
                    'type': 'text'
                  }, {
                    'key': 'type',
                    'name': '类型',
                    'type': 'select',
                    'dataName': 'commonData',
                    'dataKey': 'xy_type'
                  }, {
                    'key': 'show',
                    'name': '是否显示',
                    'type': 'boolean'
                  }, {
                    'key': 'position',
                    'name': '位置',
                    'type': 'select',
                    'dataName': 'commonData',
                    'dataKey': 'y_position'
                  }, {
                    'key': 'min',
                    'name': '最小值',
                    'type': 'text'
                  }, {
                    'key': 'max',
                    'name': '最大值',
                    'type': 'text'
                  }]
                }, {
                  'key': 'options/xAxis/{index}/axisLabel',
                  'sub': [{
                    'key': 'fontSize',
                    'name': '字体大小',
                    'type': 'number',
                    'unit': 'px'
                  }, {
                    'key': 'interval',
                    'name': '刻度间隔',
                    'type': 'number',
                    'unit': ''
                  }, {
                    'key': 'color',
                    'name': '字体颜色',
                    'type': 'color'
                  }]
                }, {
                  'key': 'options/xAxis/{index}/axisLine/lineStyle',
                  'sub': [{
                    'key': 'color',
                    'name': '轴线颜色',
                    'type': 'color'
                  }]
                }]
              }
            }, {
              'name': 'y轴',
              'isArray': true,
              'addEnable': true,
              'addTitle': '添加y轴',
              'config': [{
                'name': 'y轴',
                'item': [{
                  'key': 'options/yAxis/{index}',
                  'sub': [{
                    'key': 'name',
                    'name': '名称',
                    'type': 'text'
                  }, {
                    'key': 'type',
                    'name': '类型',
                    'type': 'select',
                    'dataName': 'commonData',
                    'dataKey': 'xy_type'
                  }, {
                    'key': 'show',
                    'name': '是否显示',
                    'type': 'boolean'
                  }, {
                    'key': 'position',
                    'name': '位置',
                    'type': 'select',
                    'dataName': 'commonData',
                    'dataKey': 'x_position'
                  }, {
                    'key': 'min',
                    'name': '最小值',
                    'type': 'text'
                  }, {
                    'key': 'max',
                    'name': '最大值',
                    'type': 'text'
                  }, {
                    'key': 'interval',
                    'name': '分割数',
                    'type': 'number',
                    'unit': ''
                  }]
                }, {
                  'key': 'options/yAxis/{index}/axisLabel',
                  'sub': [{
                    'key': 'fontSize',
                    'name': '字体大小',
                    'type': 'number',
                    'unit': 'px'
                  }, {
                    'key': 'interval',
                    'name': '刻度间隔',
                    'type': 'text'
                  }, {
                    'key': 'color',
                    'name': '字体颜色',
                    'type': 'color'
                  }]
                }, {
                  'key': 'options/yAxis/{index}/splitLine/lineStyle',
                  'sub': [{
                    'key': 'type',
                    'name': '分割线类型',
                    'type': 'select',
                    'dataName': 'commonData',
                    'dataKey': 'splitLine_type'
                  }, {
                    'key': 'color',
                    'name': '分割线颜色',
                    'type': 'color'
                  }]
                }, {
                  'key': 'options/yAxis/{index}/axisLine/lineStyle',
                  'sub': [{
                    'key': 'color',
                    'name': '轴线颜色',
                    'type': 'color'
                  }]
                }]
              }],
              'addProperty': 'options/yAxis',
              'addChartTemplate': {
                'type': 'value',
                'show': true,
                'position': 'right',
                'axisLabel': {
                  'fontSize': 12,
                  'interval': 0
                },
                'axisLine': {
                  'lineStyle': {}
                },
                'splitLine': {
                  'lineStyle': {}
                },
                'interval': null,
                'min': null,
                'max': 'dataMax'
              },
              'addFormTemplate': {
                'name': 'y轴',
                'item': [{
                  'key': 'options/yAxis/{index}',
                  'sub': [{
                    'key': 'name',
                    'name': '名称',
                    'type': 'text'
                  }, {
                    'key': 'type',
                    'name': '类型',
                    'type': 'select',
                    'dataName': 'commonData',
                    'dataKey': 'xy_type'
                  }, {
                    'key': 'show',
                    'name': '是否显示',
                    'type': 'boolean'
                  }, {
                    'key': 'position',
                    'name': '位置',
                    'type': 'select',
                    'dataName': 'commonData',
                    'dataKey': 'y_position'
                  }, {
                    'key': 'min',
                    'name': '最小值',
                    'type': 'text'
                  }, {
                    'key': 'max',
                    'name': '最大值',
                    'type': 'text'
                  }, {
                    'key': 'interval',
                    'name': '分割数',
                    'type': 'number',
                    'unit': ''
                  }]
                }, {
                  'key': 'options/yAxis/{index}/axisLabel',
                  'sub': [{
                    'key': 'fontSize',
                    'name': '字体大小',
                    'type': 'number',
                    'unit': 'px'
                  }, {
                    'key': 'interval',
                    'name': '刻度间隔',
                    'type': 'text'
                  }, {
                    'key': 'color',
                    'name': '字体颜色',
                    'type': 'color'
                  }]
                }, {
                  'key': 'options/yAxis/{index}/splitLine/lineStyle',
                  'sub': [{
                    'key': 'type',
                    'name': '分割线类型',
                    'type': 'select',
                    'dataName': 'commonData',
                    'dataKey': 'splitLine_type'
                  }, {
                    'key': 'color',
                    'name': '分割线颜色',
                    'type': 'color'
                  }]
                }, {
                  'key': 'options/yAxis/{index}/axisLine/lineStyle',
                  'sub': [{
                    'key': 'color',
                    'name': '轴线颜色',
                    'type': 'color'
                  }]
                }]
              }
            }, {
              'name': '缩放器',
              'isArray': true,
              'addEnable': true,
              'addTitle': '添加缩放器',
              'config': [],
              'addProperty': 'options/dataZoom',
              'addChartTemplate': {
                'type': 'slider',
                'xAxisIndex': [0],
                'yAxisIndex': [0],
                'start': 100,
                'end': 100
              },
              'addFormTemplate': {
                'name': '缩放器',
                'item': [{
                  'key': 'options/dataZoom/{index}',
                  'sub': [{
                    'key': 'type',
                    'name': '类型',
                    'type': 'select',
                    'dataName': 'commonData',
                    'dataKey': 'datazoom_type'
                  }, {
                    'key': 'xAxisIndex',
                    'name': 'x轴',
                    'type': 'select',
                    'dataName': 'dynamicData',
                    'dataKey': 'xSelData'
                  }, {
                    'key': 'yAxisIndex',
                    'name': 'y轴',
                    'type': 'select',
                    'dataName': 'dynamicData',
                    'dataKey': 'ySelData'
                  }, {
                    'key': 'start',
                    'name': '数据窗口范围起始',
                    'type': 'number',
                    'unit': '百分比'
                  }, {
                    'key': 'end',
                    'name': '数据窗口范围结束',
                    'type': 'number',
                    'unit': '百分比'
                  }]
                }]
              }
            }]
          }, {
            'type': '样式',
            'icon': 'md-brush',
            'con': [{
              'name': '全局',
              'item': [{
                'key': '',
                'sub': [{
                  'key': 'theme',
                  'name': '主题',
                  'type': 'select',
                  'dataName': 'commonData',
                  'dataKey': 'theme'
                }]
              }]
            }, {
              'name': '背景',
              'item': [{
                'key': 'options',
                'sub': [{
                  'key': 'backgroundColor',
                  'name': '颜色',
                  'type': 'color'
                }]
              }]
            }]
          }, {
            'type': '系列',
            'icon': 'md-pulse',
            'isSeries': true,
            'con': [{
              'name': '系列',
              'item': [{
                'key': 'options/series/{index}',
                'sub': [{
                  'key': 'type',
                  'name': '类型',
                  'type': 'select',
                  'dataName': 'commonData',
                  'dataKey': 'series_type',
                  'isSeriesType': true
                }, {
                  'key': 'name',
                  'name': '名称',
                  'type': 'text',
                  'unit': ''
                }, {
                  'key': 'xAxisIndex',
                  'name': 'x轴',
                  'type': 'select',
                  'isMultiple': false,
                  'dataName': 'dynamicData',
                  'dataKey': 'xSelData'
                }, {
                  'key': 'yAxisIndex',
                  'name': 'y轴',
                  'type': 'select',
                  'isMultiple': false,
                  'dataName': 'dynamicData',
                  'dataKey': 'ySelData'
                }, {
                  'key': 'stack',
                  'name': '堆叠标识',
                  'type': 'text'
                }, {
                  'key': 'z',
                  'name': '覆盖值',
                  'type': 'number'
                }, {
                  'key': 'color',
                  'name': '图例颜色',
                  'type': 'color'
                }]
              }, {
                'key': 'options/series/{index}/encode',
                'sub': [{
                  'key': 'x',
                  'name': 'x对应',
                  'type': 'select',
                  'isMultiple': true,
                  'dataName': 'dynamicData',
                  'dataKey': 'dimensions'
                }, {
                  'key': 'y',
                  'name': 'y对应',
                  'type': 'select',
                  'isMultiple': true,
                  'dataName': 'dynamicData',
                  'dataKey': 'dimensions'
                }]
              }]
            }]
          }]
        }
      },
      swiperOption: {
        loop: false,
        // 显示分页
/*        pagination: {
          el: ".swiper-pagination",
          clickable: true, //允许分页点击跳转
        },*/
        // 设置点击箭头
/*        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev"
        }*/
      }
    };
  },
  computed: {
    swiper() {
      return this.$refs.mySwiper.swiper;
    }
  },
  mounted() {
    // current swiper instance
    // 然后你就可以使用当前上下文内的swiper对象去做你想做的事了
    console.log("this is current swiper instance object", this.swiper);
    // this.swiper.slideTo(3, 1000, false);
  },
  methods:{
    jump(index){
      this.$refs.mySwiper.swiper.slideTo(index, 500, false);//切换到第一个slide，速度为0.5秒
    }
  }
}
</script>

<style scoped>
.recommendPage .swiper-container{
  position: relative;
  width: 92vw;
  height: 85vh;
}
.recommendPage .swiper-container .swiper-slide{
  width: 100%;
  font-size: 16px;
  text-align: center;
}
</style>
