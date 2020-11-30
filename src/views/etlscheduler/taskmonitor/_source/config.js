/**
 * Operation type
 * @desc tooltip
 * @code identifier
 */
const runningType = [{
  desc: '启动工作流',
  code: 'START_PROCESS'
},
{
  desc: '从当前节点开始执行',
  code: 'START_CURRENT_TASK_PROCESS'
},
{
  desc: '恢复被容错的工作流',
  code: 'RECOVER_TOLERANCE_FAULT_PROCESS'
},
{
  desc: '恢复运行流程',
  code: 'RECOVER_SUSPENDED_PROCESS'
},
{
  desc: '从失败节点开始执行',
  code: 'START_FAILURE_TASK_PROCESS'
},
{
  desc: '补数',
  code: 'COMPLEMENT_DATA'
},
{
  desc: '调度执行',
  code: 'SCHEDULER'
},
{
  desc: '重跑',
  code: 'REPEAT_RUNNING'
},
{
  desc: '暂停',
  code: 'PAUSE'
},
{
  desc: '停止',
  code: 'STOP'
},
{
  desc: '恢复等待线程',
  code: 'RECOVER_WAITTING_THREAD'
}
]

/**
 * Task status
 * @key key
 * @id id
 * @desc tooltip
 * @color color
 * @icoUnicode iconfont
 * @isSpin is loading (Need to execute the code block to write if judgment)
 */
const tasksState = {
  G_WAITTING: {
    id: 0,
    desc: '等待中',
    color: '#E6A23C',
    icoUnicode: 'ans-icon-sand-circle',
    isSpin: false
  },
  G_WAITTING_FILE: {
    id: 1,
    desc: '等待文件中',
    color: '#E6A23C',
    icoUnicode: 'ans-icon-pen',
    isSpin: false
  },
  G_WAITTING_DEPEND: {
    id: 2,
    desc: '等待依赖中',
    color: '#E6A23C',
    icoUnicode: 'ans-icon-dependence',
    isSpin: false
  },
  G_PAUSE: {
    id: 3,
    desc: '暂停',
    color: '#057c72',
    icoUnicode: 'ans-icon-pause',
    isSpin: false
  },
  G_RUNNING_EXEUTION: {
    id: 4,
    desc: '执行中',
    color: '#0097e0',
    icoUnicode: 'ans-icon-gear',
    isSpin: false
  },
  G_CANCEL: {
    id: 5,
    desc: '已取消',
    color: '#07b1a3',
    icoUnicode: 'ans-icon-pause-solid',
    isSpin: false
  },
  G_FAILURE: {
    id: 6,
    desc: '执行失败',
    color: '#ff0000',
    icoUnicode: 'ans-icon-fail-empty',
    isSpin: false
  },
  G_SUCCESS: {
    id: 7,
    desc: '执行成功',
    color: '#67C23A',
    icoUnicode: 'ans-icon-success-empty',
    isSpin: false
  },
  // READY_PAUSE: {
  //   id: 8,
  //   desc: '准备暂停',
  //   color: '#0097e0',
  //   icoUnicode: 'ans-icon-gear',
  //   isSpin: false
  // },
  // READY_STOP: {
  //   id: 9,
  //   desc: '准备停止',
  //   color: '#0097e0',
  //   icoUnicode: 'ans-icon-gear',
  //   isSpin: false
  // },
  // SUBMITTED_SUCCESS: {
  //   id: 10,
  //   desc: '提交成功',
  //   color: '#0097e0',
  //   icoUnicode: 'ans-icon-gear',
  //   isSpin: false
  // },
  G_STOP: {
    id: 11,
    desc: '停止',
    color: '#0097e0',
    icoUnicode: 'ans-icon-gear',
    isSpin: false
  }
  // ,
  // NEED_FAULT_TOLERANCE: {
  //   id: 12,
  //   desc: '需要容错',
  //   color: '#0097e0',
  //   icoUnicode: 'ans-icon-gear',
  //   isSpin: false
  // },
  // WAITTING_THREAD: {
  //   id: 13,
  //   desc: '等待线程',
  //   color: '#0097e0',
  //   icoUnicode: 'ans-icon-gear',
  //   isSpin: false
  // }
}

export {
  runningType,
  tasksState
}
