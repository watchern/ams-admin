const crontabExpression = [
  {
    code: '0 0 0 * * ?',
    msg: '每日'
  },
  {
    code: '0 0 0 1 * ?',
    msg: '每月'
  },
  {
    code: '0 0 0 1 1,4,7,10 ?',
    msg: '每季度'
  },
  {
    code: '0 0 0 1 1,7 ?',
    msg: '每半年'
  },
  {
    code: '0 0 0 1 1 ?',
    msg: '每年'
  }
]

export {
  crontabExpression
}
