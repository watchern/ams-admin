const stateType = [
  {
    value: 0,
    code: '',
    label: '无'
  },
  {
    value: 40,
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
    value: 1,
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

export {
  stateType
}
