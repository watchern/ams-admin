
/**
 * Operation type
 * @desc tooltip
 * @code identifier
 */
const runningType = [
  {
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
  WAITING: {
    id: 0,
    desc: '等待中',
    color: '#A9A9A9',
    icoUnicode: 'ans-icon-sand-circle',
    isSpin: false
  },
  WAITING_FOR_FILE: {
    id: 1,
    desc: '等待文件中',
    color: '#5101be',
    icoUnicode: 'ans-icon-pen',
    isSpin: false
  },
  WAITTING_DEPEND: {
    id: 2,
    desc: '等待依赖中',
    color: '#FF8C00',
    icoUnicode: 'ans-icon-dependence',
    isSpin: false
  },
  PAUSE: {
    id: 3,
    desc: '暂停',
    color: '#057c72',
    icoUnicode: 'ans-icon-pause',
    isSpin: false
  },
  RUNNING_EXEUTION: {
    id: 4,
    desc: '执行中',
    color: '#0097e0',
    icoUnicode: 'ans-icon-gear',
    isSpin: false
  },
  KILL: {
    id: 5,
    desc: '已取消',
    color: '#07b1a3',
    icoUnicode: 'ans-icon-pause-solid',
    isSpin: false
  },
  FAILURE: {
    id: 6,
    desc: '执行失败',
    color: '#000000',
    icoUnicode: 'ans-icon-fail-empty',
    isSpin: false
  },
  SUCCESS: {
    id: 7,
    desc: '执行成功',
    color: '#A9A9A9',
    icoUnicode: 'ans-icon-success-empty',
    isSpin: false
  },
  READY_PAUSE: {
    id: 8,
    desc: '准备暂停',
    color: '#0097e0',
    icoUnicode: 'ans-icon-gear',
    isSpin: false
  },
  READY_STOP: {
    id: 9,
    desc: '准备停止',
    color: '#0097e0',
    icoUnicode: 'ans-icon-gear',
    isSpin: false
  },
  SUBMITTED_SUCCESS: {
    id: 10,
    desc: '提交成功',
    color: '#0097e0',
    icoUnicode: 'ans-icon-gear',
    isSpin: false
  },
  STOP: {
    id: 11,
    desc: '停止',
    color: '#0097e0',
    icoUnicode: 'ans-icon-gear',
    isSpin: false
  },
  NEED_FAULT_TOLERANCE: {
    id: 12,
    desc: '需要容错',
    color: '#0097e0',
    icoUnicode: 'ans-icon-gear',
    isSpin: false
  },
  WAITTING_THREAD: {
    id: 13,
    desc: '等待线程',
    color: '#0097e0',
    icoUnicode: 'ans-icon-gear',
    isSpin: false
  }
}

export {
  runningType,
  tasksState
}
