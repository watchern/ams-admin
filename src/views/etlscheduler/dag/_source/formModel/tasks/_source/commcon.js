/**
 * cycle
 */
const cycleList = [{
  value: 'month',
  label: `月`
},
{
  value: 'week',
  label: `周`
},
{
  value: 'day',
  label: `日`
},
{
  value: 'hour',
  label: `时`
}
]

/**
 * cycle value
 */
const dateValueList = {
  hour: [{
    value: 'currentHour',
    label: `当前小时`
  },
  {
    value: 'last1Hour',
    label: `前1小时`
  },
  {
    value: 'last2Hours',
    label: `前2小时`
  },
  {
    value: 'last3Hours',
    label: `前3小时`
  },
  {
    value: 'last24Hours',
    label: `前24小时`
  }
  ],
  day: [{
    value: 'today',
    label: `今天`
  },
  {
    value: 'last1Days',
    label: `昨天`
  },
  {
    value: 'last2Days',
    label: `前两天`
  },
  {
    value: 'last3Days',
    label: `前三天`
  },
  {
    value: 'last7Days',
    label: `前七天`
  }
  ],
  week: [{
    value: 'thisWeek',
    label: `本周`
  },
  {
    value: 'lastWeek',
    label: `上周`
  },
  {
    value: 'lastMonday',
    label: `上周一`
  },
  {
    value: 'lastTuesday',
    label: `上周二`
  },
  {
    value: 'lastWednesday',
    label: `上周三`
  },
  {
    value: 'lastThursday',
    label: `上周四`
  },
  {
    value: 'lastFriday',
    label: `上周五`
  },
  {
    value: 'lastSaturday',
    label: `上周六`
  },
  {
    value: 'lastSunday',
    label: `上周日`
  }
  ],
  month: [{
    value: 'thisMonth',
    label: `本月`
  },
  {
    value: 'lastMonth',
    label: `上月`
  },
  {
    value: 'lastMonthBegin',
    label: `上月初`
  },
  {
    value: 'lastMonthEnd',
    label: `上月末`
  }
  ]
}

/**
 * direct
 */
const directList = [{
  id: 1,
  code: 'IN',
  disabled: false
},
{
  id: 2,
  code: 'OUT',
  disabled: false
}
]

/**
 * type
 */
const typeList = [{
  id: 1,
  code: 'VARCHAR',
  disabled: false
},
{
  id: 2,
  code: 'INTEGER',
  disabled: false
},
{
  id: 3,
  code: 'LONG',
  disabled: false
},
{
  id: 4,
  code: 'FLOAT',
  disabled: false
},
{
  id: 5,
  code: 'DOUBLE',
  disabled: false
},
{
  id: 6,
  code: 'DATE',
  disabled: false
},
{
  id: 7,
  code: 'TIME',
  disabled: false
},
{
  id: 8,
  code: 'TIMESTAMP',
  disabled: false
},
{
  id: 9,
  code: 'BOOLEAN',
  disabled: false
}
]

/**
 * sqlType
 */
const sqlTypeList = [{
  id: '0',
  code: `查询`
},
{
  id: '1',
  code: `非查询`
}
]

const positionList = [{
  id: 'PARAMETER',
  code: 'Parameter'
},
{
  id: 'BODY',
  code: 'Body'
},
{
  id: 'HEADERS',
  code: 'Headers'
}
]
const nodeStatusList = [{
  value: 'SUCCESS',
  label: `成功`
},
{
  value: 'FAILURE',
  label: `失败`
}
]

export {
  cycleList,
  dateValueList,
  typeList,
  directList,
  sqlTypeList,
  positionList,
  nodeStatusList
}
