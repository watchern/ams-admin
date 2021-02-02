<template>
  <div id='app'>
    <el-button @click='save'>save</el-button>
    <el-input v-model='test' />
    <div style="height: 500px">
      <mtEditor ref='chart' :data='result' :chart-config="opNode" :preview='false' :chartBoxStyle="chartBoxStyle"></mtEditor>
    </div>
  </div>
</template>

<script>
import mtEditor from 'ams-datamax'
// import 'iview/dist/styles/iview.css'
export default {
  name: 'test',
  components: {
    mtEditor
  },
  data () {
    return {
      chartBoxStyle: {
        height: '500px',
        width: '100%'
      },
      result: {
        id: 'test1',
        name: '测试名称123',
        column: ['编号ID', '省份', '省份代码', '城市', '城市代码', '区县', '区县代码', '日期', '商品分类', '商品编号', '商品条码', '商品名称', '规格', '单位', '产地', '库存状况', '含税价', '零售价', '订购数量', '销售金额', '配送数', '销售数量', '经度', '纬度', '大区'],
        columnType: ['number', 'varchar', 'number', 'varchar', 'number', 'varchar', 'number', 'time', 'varchar', 'number', 'number', 'varchar', 'varchar', 'varchar', 'varchar', 'varchar', 'float', 'float', 'time', 'float', 'float', 'float', 'float', 'float', 'varchar'],
        data: [
          {'编号ID': '138', '省份': '河北省1', '省份代码': '130000', '城市': '保定市', '城市代码': '130600', '区县': '博野县', '区县代码': '130637', '日期': '2017/9/7', '商品分类': '食品类', '商品编号': '20211', '商品条码': '38199121', '商品名称': '食品-192g牛奶燕麦脆棒饼', '规格': '1*12', '单位': '包', '产地': '香港', '库存状况': '②暂无', '含税价': '30', '零售价': '40', '订购数量': '266', '销售金额': '7040', '配送数': '798', '销售数量': '176', '经度': '114.469', '纬度': '38.037', '大区': '其它'},
          {'编号ID': '2372', '省份': '四川省', '省份代码': '510000', '城市': '达州市', '城市代码': '511700', '区县': '开江县', '区县代码': '511723', '日期': '2018/7/20', '商品分类': '食品类', '商品编号': '21362', '商品条码': '38583147', '商品名称': '600g mixx特级苏打饼-芝麻', '规格': '1*12', '单位': '包', '产地': '香港', '库存状况': '②暂无', '含税价': '9.375', '零售价': '12.5', '订购数量': '12', '销售金额': '3412.5', '配送数': '36', '销售数量': '273', '经度': '104.076', '纬度': '30.652', '大区': '西南'},
          {'编号ID': '3015', '省份': '宁夏回族自治区', '省份代码': '640000', '城市': '石嘴山市', '城市代码': '640200', '区县': '市辖区', '区县代码': '640201', '日期': '2018/3/21', '商品分类': '厨房配料', '商品编号': '70039', '商品条码': '37278801', '商品名称': '李锦记幼滑虾酱', '规格': '1*12', '单位': '坪', '产地': '日本', '库存状况': '①正常库存', '含税价': '10.875', '零售价': '14.5', '订购数量': '33', '销售金额': '1493.5', '配送数': '99', '销售数量': '103', '经度': '106.259', '纬度': '38.471', '大区': '其他'},
          {'编号ID': '1816', '省份': '湖南省', '省份代码': '430000', '城市': '衡阳市', '城市代码': '430400', '区县': '常宁市', '区县代码': '430482', '日期': '2018/5/19', '商品分类': '化妆类', '商品编号': '31145', '商品条码': '19120673', '商品名称': '天参宝完美欢颜黄金眼霜', '规格': '20g', '单位': '支', '产地': '韩国', '库存状况': '①正常库存', '含税价': '9.375', '零售价': '12.5', '订购数量': '22', '销售金额': '2050', '配送数': '66', '销售数量': '164', '经度': '112.984', '纬度': '28.112', '大区': '华中'}],
        // 维度
        wd: ['省份'],
        // 度量
        dl: ['含税价']
      },
      test: '',
      opNode: {
        'id': 1611827345251,
        'loading': false,
        'dataId': 'test1',
        'dataName': '测试名称123',
        'name': '简单柱状图',
        'typeName': '简单柱状图',
        'type': 'eCharts',
        'chart': 'bar',
        'img': 'imgs/chart-type-icons.png',
        'background': '#409EFF',
        'active': true,
        'rename': false,
        'initOptions': {
          'box': {
            'width': 400,
            'height': 300,
            'x': 0,
            'y': 0,
            'zIndex': 0
          },
          'theme': 'light',
          'transform': {
            'filter': [{
              'type': 'filter',
              'config': {
                'isEnabled': true,
                'target': '省份',
                'operator': {
                  'mode': 'IncludeValues',
                  'op': 'eq'
                },
                'value': '省',
                'lowerBound': '',
                'upperBound': ''
              }
            }],
            'sort': [{
              'type': 'sort',
              'config': {
                'isEnabled': true,
                'target': '省份',
                'sortBy': '降序'
              }
            }],
            'group': [],
            'aggregate': []
          },
          'options': {
            'dataset': [],
            'title': {
              'text': '简单柱状图',
              'subtext': '',
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
              'nameLocation': 'end',
              'nameGap': 15,
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
              'nameLocation': 'end',
              'nameGap': 15,
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
              'name': '',
              'xAxisIndex': 0,
              'yAxisIndex': 0,
              'stack': '',
              'z': 0,
              'encode': {
                'y': ['含税价'],
                'x': ['省份']
              },
              'label': {
                'show': true,
                'position': 'top',
                'color': '#fff',
                'fontStyle': 'normal',
                'fontWeight': 'normal',
                'fontSize': 12
              },
              'itemStyle': {
                'color': null,
                'borderColor': null,
                'borderWidth': 0,
                'borderType': 'solid',
                'barBorderRadius': 0
              },
              'datasetIndex': 1
            }]
          }
        },
        'configOptions': {
          'config': [{
            'title': '图表',
            'con': [{
              'type': 'form',
              'items': [{
                'key': '',
                'sub': [{
                  'key': 'theme',
                  'name': '主题',
                  'type': 'select',
                  'dataName': 'commonData',
                  'dataKey': 'theme'
                }]
              }, {
                'key': 'options',
                'sub': [{
                  'key': 'backgroundColor',
                  'name': '背景颜色',
                  'type': 'color'
                }]
              }]
            }, {
              'type': 'collapse',
              'collapseItems': [{
                'title': '标题',
                'items': [{
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
                'title': '鼠标移入提示',
                'items': [{
                  'key': 'options/tooltip',
                  'sub': [{
                    'key': 'show',
                    'name': '是否显示',
                    'type': 'boolean'
                  }]
                }]
              }, {
                'title': '图例',
                'items': [{
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
              }]
            }]
          }, {
            'title': '坐标轴',
            'con': [{
              'type': 'card',
              'title': 'x轴',
              'isExtend': false,
              'cardItems': [{
                'type': 'form',
                'items': [{
                  'key': 'options/xAxis/0',
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
                  }]
                }]
              }, {
                'type': 'collapse',
                'collapseItems': [{
                  'title': '位置及显示',
                  'items': [{
                    'key': 'options/xAxis/0',
                    'sub': [{
                      'key': 'show',
                      'name': '是否显示',
                      'type': 'boolean'
                    }, {
                      'key': 'position',
                      'name': '轴线位置',
                      'type': 'select',
                      'dataName': 'commonData',
                      'dataKey': 'x_position'
                    }, {
                      'key': 'nameLocation',
                      'name': '轴名称位置',
                      'type': 'select',
                      'dataName': 'commonData',
                      'dataKey': 'name_location'
                    }, {
                      'key': 'nameGap',
                      'name': '轴名称与轴线距离',
                      'type': 'number',
                      'unit': 'px'
                    }]
                  }]
                }, {
                  'title': '值范围',
                  'items': [{
                    'key': 'options/xAxis/0',
                    'sub': [{
                      'key': 'min',
                      'name': '最小值',
                      'type': 'text'
                    }, {
                      'key': 'max',
                      'name': '最大值',
                      'type': 'text'
                    }]
                  }]
                }, {
                  'title': '轴标签',
                  'items': [{
                    'key': 'options/xAxis/0/axisLabel',
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
                  }]
                }, {
                  'title': '轴线',
                  'items': [{
                    'key': 'options/xAxis/{index}/axisLine/lineStyle',
                    'sub': [{
                      'key': 'color',
                      'name': '轴线颜色',
                      'type': 'color'
                    }]
                  }]
                }]
              }]
            }, {
              'type': 'card',
              'title': 'y轴',
              'isExtend': false,
              'cardItems': [{
                'type': 'form',
                'items': [{
                  'key': 'options/yAxis/0',
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
                  }]
                }]
              }, {
                'type': 'collapse',
                'collapseItems': [{
                  'title': '位置及显示',
                  'items': [{
                    'key': 'options/yAxis/0',
                    'sub': [{
                      'key': 'show',
                      'name': '是否显示',
                      'type': 'boolean'
                    }, {
                      'key': 'position',
                      'name': '轴线位置',
                      'type': 'select',
                      'dataName': 'commonData',
                      'dataKey': 'y_position'
                    }, {
                      'key': 'nameLocation',
                      'name': '轴名称位置',
                      'type': 'select',
                      'dataName': 'commonData',
                      'dataKey': 'name_location'
                    }, {
                      'key': 'nameGap',
                      'name': '轴名称与轴线距离',
                      'type': 'number',
                      'unit': 'px'
                    }]
                  }]
                }, {
                  'title': '值范围',
                  'items': [{
                    'key': 'options/yAxis/0',
                    'sub': [{
                      'key': 'min',
                      'name': '最小值',
                      'type': 'text'
                    }, {
                      'key': 'max',
                      'name': '最大值',
                      'type': 'text'
                    }]
                  }]
                }, {
                  'title': '轴标签',
                  'items': [{
                    'key': 'options/yAxis/0/axisLabel',
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
                  }]
                }, {
                  'title': '轴线',
                  'items': [{
                    'key': 'options/yAxis/0/axisLine/lineStyle',
                    'sub': [{
                      'key': 'color',
                      'name': '轴线颜色',
                      'type': 'color'
                    }]
                  }, {
                    'key': 'options/yAxis/0/splitLine/lineStyle',
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
                  }]
                }]
              }]
            }]
          }, {
            'title': '系列',
            'con': [{
              'type': 'cardGroup',
              'title': '系列组',
              'isExtend': true,
              'isAddable': true,
              'addBtnTitle': '添加系列',
              'removeBtnTitle': '删除系列',
              'initOptionsPath': 'options/series',
              'addInitOptions': {
                'type': 'bar',
                'name': '',
                'xAxisIndex': 0,
                'yAxisIndex': 0,
                'stack': '',
                'z': 0,
                'encode': {
                  'y': [],
                  'x': []
                },
                'label': {
                  'show': true,
                  'position': 'top',
                  'color': '#fff',
                  'fontStyle': 'normal',
                  'fontWeight': 'normal',
                  'fontSize': '12'
                },
                'itemStyle': {
                  'color': null,
                  'borderColor': null,
                  'borderWidth': 0,
                  'borderType': 'solid',
                  'barBorderRadius': 0
                }
              },
              'addConfigOptions': {
                'type': 'card',
                'title': '系列',
                'isExtend': false,
                'cardItems': [{
                  'type': 'form',
                  'items': [{
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
                    }]
                  }]
                }, {
                  'type': 'collapse',
                  'collapseItems': [{
                    'title': '坐标轴设置',
                    'items': [{
                      'key': 'options/series/{index}/encode',
                      'sub': [{
                        'key': 'x',
                        'name': 'x对应',
                        'type': 'select',
                        'isMultiple': true,
                        'dataName': 'dynamicData',
                        'dataKey': 'dimensions{id}'
                      }, {
                        'key': 'y',
                        'name': 'y对应',
                        'type': 'select',
                        'isMultiple': true,
                        'dataName': 'dynamicData',
                        'dataKey': 'dimensions{id}'
                      }]
                    }]
                  }, {
                    'title': '标签设置',
                    'items': [{
                      'key': 'options/series/{index}/label',
                      'sub': [{
                        'key': 'show',
                        'name': '显示标签',
                        'type': 'boolean'
                      }, {
                        'key': 'position',
                        'name': '标签位置',
                        'type': 'select',
                        'isMultiple': false,
                        'dataName': 'commonData',
                        'dataKey': 'label_position'
                      }, {
                        'key': 'color',
                        'name': '字体颜色',
                        'type': 'color'
                      }, {
                        'key': 'fontStyle',
                        'name': '字体样式',
                        'type': 'select',
                        'isMultiple': false,
                        'dataName': 'commonData',
                        'dataKey': 'fontStyle'
                      }, {
                        'key': 'fontWeight',
                        'name': '字体粗细',
                        'type': 'select',
                        'isMultiple': false,
                        'dataName': 'commonData',
                        'dataKey': 'fontWeight'
                      }, {
                        'key': 'fontSize',
                        'name': '字体大小',
                        'type': 'number'
                      }]
                    }]
                  }, {
                    'title': '图形设置',
                    'items': [{
                      'key': 'options/series/{index}/itemStyle',
                      'sub': [{
                        'key': 'color',
                        'name': '图形颜色',
                        'type': 'color'
                      }, {
                        'key': 'borderWidth',
                        'name': '描边宽度',
                        'type': 'number'
                      }, {
                        'key': 'borderColor',
                        'name': '描边颜色',
                        'type': 'color'
                      }, {
                        'key': 'borderType',
                        'name': '描边类型',
                        'type': 'select',
                        'isMultiple': false,
                        'dataName': 'commonData',
                        'dataKey': 'splitLine_type'
                      }, {
                        'key': 'barBorderRadius',
                        'name': '描边圆角半径',
                        'type': 'number'
                      }]
                    }]
                  }, {
                    'title': '其他设置',
                    'items': [{
                      'key': 'options/series/{index}',
                      'sub': [{
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
                    }]
                  }]
                }]
              },
              'groupItems': [{
                'type': 'card',
                'title': '系列',
                'isExtend': true,
                'cardItems': [{
                  'type': 'form',
                  'items': [{
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
                    }]
                  }]
                }, {
                  'type': 'collapse',
                  'collapseItems': [{
                    'title': '坐标轴设置',
                    'items': [{
                      'key': 'options/series/{index}/encode',
                      'sub': [{
                        'key': 'x',
                        'name': 'x对应',
                        'type': 'select',
                        'isMultiple': true,
                        'dataName': 'dynamicData',
                        'dataKey': 'dimensions{id}'
                      }, {
                        'key': 'y',
                        'name': 'y对应',
                        'type': 'select',
                        'isMultiple': true,
                        'dataName': 'dynamicData',
                        'dataKey': 'dimensions{id}'
                      }]
                    }]
                  }, {
                    'title': '标签设置',
                    'items': [{
                      'key': 'options/series/{index}/label',
                      'sub': [{
                        'key': 'show',
                        'name': '显示标签',
                        'type': 'boolean'
                      }, {
                        'key': 'position',
                        'name': '标签位置',
                        'type': 'select',
                        'isMultiple': false,
                        'dataName': 'commonData',
                        'dataKey': 'label_position'
                      }, {
                        'key': 'color',
                        'name': '字体颜色',
                        'type': 'color'
                      }, {
                        'key': 'fontStyle',
                        'name': '字体样式',
                        'type': 'select',
                        'isMultiple': false,
                        'dataName': 'commonData',
                        'dataKey': 'fontStyle'
                      }, {
                        'key': 'fontWeight',
                        'name': '字体粗细',
                        'type': 'select',
                        'isMultiple': false,
                        'dataName': 'commonData',
                        'dataKey': 'fontWeight'
                      }, {
                        'key': 'fontSize',
                        'name': '字体大小',
                        'type': 'number'
                      }]
                    }]
                  }, {
                    'title': '图形设置',
                    'items': [{
                      'key': 'options/series/{index}/itemStyle',
                      'sub': [{
                        'key': 'color',
                        'name': '图形颜色',
                        'type': 'color'
                      }, {
                        'key': 'borderWidth',
                        'name': '描边宽度',
                        'type': 'number'
                      }, {
                        'key': 'borderColor',
                        'name': '描边颜色',
                        'type': 'color'
                      }, {
                        'key': 'borderType',
                        'name': '描边类型',
                        'type': 'select',
                        'isMultiple': false,
                        'dataName': 'commonData',
                        'dataKey': 'splitLine_type'
                      }, {
                        'key': 'barBorderRadius',
                        'name': '描边圆角半径',
                        'type': 'number'
                      }]
                    }]
                  }, {
                    'title': '其他设置',
                    'items': [{
                      'key': 'options/series/{index}',
                      'sub': [{
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
                    }]
                  }]
                }]
              }]
            }]
          }]
        }
      }
    }
  },
  methods: {
    save () {
      this.test = JSON.stringify(this.$refs.chart.getChartConfig())
    }
  }
}
</script>
