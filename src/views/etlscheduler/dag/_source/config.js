/**
 * Operation bar config
 * @code code
 * @icon icon
 * @disable disable
 * @desc tooltip
 */
const toolOper = (dagThis) => {
  const disabled = !!dagThis.$store.state.dag.isDetails // Permissions.getAuth() === false ? false : !dagThis.$store.state.dag.isDetails
  return [{
    code: 'pointer',
    icon: 'ans-icon-pointer',
    disable: disabled,
    desc: '拖动节点和选中项'
  },
  {
    code: 'line',
    icon: 'ans-icon-slash',
    disable: disabled,
    desc: '选择线条连接'
  },
  {
    code: 'remove',
    icon: 'ans-icon-trash',
    disable: disabled,
    desc: '删除选中的线或节点'
  }
    //   ,
    // {
    //   code: 'download',
    //   icon: 'ans-icon-download',
    //   disable: !dagThis.type,
    //   desc: '下载'
    // },
    // {
    //   code: 'screen',
    //   icon: 'ans-icon-max',
    //   disable: false,
    //   desc: '全屏'
    // }
  ]
}

/**
 * Post status
 * @id Front end definition id
 * @desc tooltip
 * @code Backend definition identifier
 */
const publishStatus = [{
  id: 0,
  desc: '未发布',
  code: 'NOT_RELEASE'
},
{
  id: 1,
  desc: '上线',
  code: 'ONLINE'
},
{
  id: 2,
  desc: '下线',
  code: 'OFFLINE'
}
]

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
  SUBMITTED_SUCCESS: {
    id: 0,
    desc: '提交成功',
    color: '#A9A9A9',
    icoUnicode: 'ans-icon-dot-circle',
    isSpin: false
  },
  RUNNING_EXEUTION: {
    id: 1,
    desc: 'Executing',
    color: '#0097e0',
    icoUnicode: 'ans-icon-gear',
    isSpin: true
  },
  READY_PAUSE: {
    id: 2,
    desc: '准备暂停',
    color: '#07b1a3',
    icoUnicode: 'ans-icon-pause-solid',
    isSpin: false
  },
  PAUSE: {
    id: 3,
    desc: '暂停',
    color: '#057c72',
    icoUnicode: 'ans-icon-pause',
    isSpin: false
  },
  READY_STOP: {
    id: 4,
    desc: '准备停止',
    color: '#FE0402',
    icoUnicode: 'ans-icon-coin',
    isSpin: false
  },
  STOP: {
    id: 5,
    desc: '停止',
    color: '#e90101',
    icoUnicode: 'ans-icon-stop',
    isSpin: false
  },
  FAILURE: {
    id: 6,
    desc: '失败',
    color: '#000000',
    icoUnicode: 'ans-icon-fail-empty',
    isSpin: false
  },
  SUCCESS: {
    id: 7,
    desc: '成功',
    color: '#33cc00',
    icoUnicode: 'ans-icon-success-empty',
    isSpin: false
  },
  NEED_FAULT_TOLERANCE: {
    id: 8,
    desc: '需要容错',
    color: '#FF8C00',
    icoUnicode: 'ans-icon-pen',
    isSpin: false
  },
  KILL: {
    id: 9,
    desc: 'kill',
    color: '#a70202',
    icoUnicode: 'ans-icon-minus-circle-empty',
    isSpin: false
  },
  WAITTING_THREAD: {
    id: 10,
    desc: '等待线程',
    color: '#912eed',
    icoUnicode: 'ans-icon-sand-clock',
    isSpin: false
  },
  WAITTING_DEPEND: {
    id: 11,
    desc: '等待依赖',
    color: '#5101be',
    icoUnicode: 'ans-icon-dependence',
    isSpin: false
  }
}

/**
 * Node type
 * @key key
 * @desc tooltip
 * @color color (tree and gantt)
 */
const tasksType = {
  SQL: {
    desc: 'SQL',
    color: '#7A98A1'
  },
  JAVA: {
    desc: 'JAVA',
    color: '#646464'
  },
  SHELL: {
    desc: 'SHELL',
    color: '#646464'
  }
}

export {
  toolOper,
  publishStatus,
  runningType,
  tasksState,
  tasksType
}
