// 状态显示图标颜色
const statusListComm = [{
  value: 1,
  name: '提交成功',
  unicode: 'el-icon-loading',
  color: '#333'
},
{
  value: 2,
  name: '等待文件中',
  unicode: 'el-icon-document',
  color: '#f9be0a'
},
{
  value: 3,
  name: '等待依赖任务',
  unicode: 'el-icon-share',
  color: '#f9be0a'
},
{
  value: 32,
  name: '依赖任务已完成',
  unicode: 'el-icon-share',
  color: '#f9be0a'
},
{
  value: 4,
  name: '执行中',
  unicode: 'el-icon-loading',
  color: '#333'
},
{
  value: 5,
  name: '暂停中',
  unicode: 'el-icon-video-pause',
  color: '#409eff'
},
{
  value: 6,
  name: '已取消',
  unicode: 'el-icon-circle-close',
  color: '#ff0000'
},
{
  value: 7,
  name: '执行完成',
  unicode: 'el-icon-success',
  color: '#00bb00'
},
{
  value: 8,
  name: '执行失败',
  unicode: 'el-icon-error',
  color: 'red'
},
{
  value: 9,
  name: '停止',
  unicode: 'el-icon-video-pause',
  color: '#409eff'
},
{
  value: 31,
  name: '等待线程',
  unicode: 'el-icon-share',
  color: '#f9be0a'
},
{
  value: 40,
  name: '等待中',
  unicode: 'el-icon-s-help',
  color: '#f9be0a'
},
{
  value: 41,
  name: '准备执行',
  unicode: 'el-icon-s-help',
  color: '#fff'
},
{
  value: 50,
  name: '准备暂停',
  unicode: 'el-icon-loading',
  color: '#333'
},
{
  value: 80,
  name: '需要容错',
  unicode: 'el-icon-loading',
  color: '#333'
},
{
  value: 90,
  name: '准备停止',
  unicode: 'el-icon-loading',
  color: '#333'
},
{
  value: null,
  name: '--',
  unicode: 'el-icon-remove-outline',
  color: '#888888'
}
]
// 查询状态的下拉框
const statuSelect = [{
  name: '等待中',
  value: '40'
},
{
  name: '准备执行',
  value: '41'
},
{
  name: '等待文件中',
  value: '2'
},
{
  name: '等待依赖任务',
  value: '3'
},
{
  name: '等待线程',
  value: '31'
},
{
  name: '依赖任务已完成',
  value: '32'
},
{
  name: '执行中',
  value: '4'
},
{
  name: '暂停中',
  value: '5'
},
{
  name: '已取消',
  value: '6'
},
{
  name: '执行完成',
  value: '7'
},
{
  name: '执行失败',
  value: '8'
},
{
  name: '停止',
  value: '9'
},
{
  name: '提交成功',
  value: '1'
},
{
  name: '准备暂停',
  value: '50'
},
{
  name: '需要容错',
  value: '80'
},
{
  name: '准备停止',
  value: '90'
}
]
// 命令的类型
const commandTypeObj = {
  0: '开启新流程',
  1: '从当前节点开启新流程',
  2: '重启容错流程',
  3: '重启补数流程',
  4: '从失败任务节点启动流程',
  5: '补数',
  6: '启动调度任务',
  7: '重复运行流程',
  8: '暂停流程',
  9: '停止流程',
  10: '重新运行等待线程流程',
  11: '超时',
  12: '启动',
  13: '重新运行',
  14: '取消',
  null: '其它'
}
// 日志颜色
const colorList = [{
  label: '成功',
  value: 1,
  color: '#008000'
},
{
  label: '失败',
  value: 2,
  color: 'red'
},
{
  label: '警告',
  value: 3,
  color: '#f9be0a'
},
{
  label: '其它',
  value: 4,
  color: '#888888'
}
]

/**
 * Formatting time
 */
const statusFilter = (value) => {
  if (value == null || value.trim() === '') {
    return statusListComm.length
  }
  return (statusListComm || []).find((item) => item.value === value)[0]
}

export {
  statusListComm,
  statuSelect,
  commandTypeObj,
  statusFilter,
  colorList
}
