const stateType = [{
  value: 0,
  code: '',
  label: '无'
},
{
  value: 1,
  code: 'SUBMITTED_SUCCESS',
  label: '提交成功'
},
// {
//   code: 'RUNNING_EXEUTION',
//   label: '正在运行'
// },
{
  value: 50,
  code: 'READY_PAUSE',
  label: '准备暂停'
},
// {
//   code: 'PAUSE',
//   label: '暂停'
// },
{
  value: 90,
  code: 'READY_STOP',
  label: '准备停止'
},
{
  value: 9,
  code: 'STOP',
  label: '停止'
},
// {
//   code: 'FAILURE',
//   label: '失败'
// }, {
//   code: 'SUCCESS',
//   label: '成功'
// },
{
  value: 80,
  code: 'NEED_FAULT_TOLERANCE',
  label: '需要容错'
},
// {
//   code: 'KILL',
//   label: 'kill'
// },
{
  value: 31,
  code: 'WAITTING_THREAD',
  label: '等待线程'
},
// {
//   code: 'WAITTING_DEPEND',
//   label: '等待依赖完成'
// }
{
  value: 40,
  code: 'WAITING',
  label: '等待中'
}, {
  value: 2,
  code: 'WAITING_FOR_FILE',
  label: '等待文件中'
}, {
  value: 3,
  code: 'WAITTING_DEPEND',
  label: '等待依赖中'
}, {
  value: 4,
  code: 'RUNNING_EXEUTION',
  label: '执行中'
}, {
  value: 5,
  code: 'PAUSE',
  label: '暂停'
}, {
  value: 6,
  code: 'KILL',
  label: '已取消'
}, {
  value: 7,
  code: 'FAILURE',
  label: '执行失败'
}, {
  value: 8,
  code: 'SUCCESS',
  label: '执行成功'
}
]

const statusType = [{
  value: '',
  code: '',
  label: '无'
},
{
  // seriesIndex :'6',
  // dataIndex :'6',
  value: 'G_WAITTING',
  code: 'G_WAITTING',
  label: '等待中',
  color: 'rgb(255,186,0)'
},
{
  // seriesIndex :'7',
  // dataIndex :'7',
  value: 'G_WAITTING_FILE',
  code: 'G_WAITTING_FILE',
  label: '等待文件',
  color: 'rgb(212,130,101)'
},
{
  // seriesIndex :'5',
  // dataIndex :'5',
  value: 'G_WAITTING_DEPEND',
  code: 'G_WAITTING_DEPEND',
  label: '等待依赖',
  color: 'rgb(189,162,154)'
},
{
  // seriesIndex :'3',
  // dataIndex :'3',
  value: 'G_RUNNING_EXEUTION',
  code: 'G_RUNNING_EXEUTION',
  label: '执行中',
  color: 'rgb(97,160,168)'
},
{
  // seriesIndex :'2',
  // dataIndex :'2',
  value: 'G_PAUSE',
  code: 'G_PAUSE',
  label: '暂停',
  color: 'rgb(234,126,83)'
},
{
  // seriesIndex :'0',
  // dataIndex :'0',
  value: 'G_CANCEL',
  code: 'G_CANCEL',
  label: '已取消',
  color: 'rgb(110,112,116)'
},
{
  // seriesIndex :'4',
  // dataIndex :'4',
  value: 'G_SUCCESS',
  code: 'G_SUCCESS',
  label: '执行完成',
  color: 'rgb(145,202,140)'
},
{
  // seriesIndex :'1',
  // dataIndex :'1',
  value: 'G_FAILURE',
  code: 'G_FAILURE',
  label: '执行失败',
  color: 'rgb(194,53,49)'
}
]

const statusList = [{
  value: 0,
  name: '执行中',
  unicode: 'el-icon-loading',
  color: '#333'
},
{
  value: 1,
  name: '执行完成',
  unicode: 'el-icon-success',
  color: '#67C23A'
},
{
  value: 2,
  name: '执行失败',
  unicode: 'el-icon-warning',
  color: 'red'
},
{
  value: 3,
  name: '暂无',
  unicode: 'el-icon-warning-outline',
  color: '#546570'

},
{
  value: null,
  name: '--',
  unicode: 'el-icon-remove-outline',
  color: '#888888'
}
]

export {
  stateType,
  statusList,
  statusType
}
