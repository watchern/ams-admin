const warningTypeList = [{
  id: 'NONE',
  code: `都不发`
},
{
  id: 'SUCCESS',
  code: `成功发`
},
{
  id: 'FAILURE',
  code: `失败发`
},
{
  id: 'ALL',
  code: `成功或失败都发`
}
]

const isEmial = (val) => {
  let regEmail = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/ // eslint-disable-line
  return regEmail.test(val)
}

const fuzzyQuery = (list, keyWord) => {
  const len = list.length
  const arr = []
  const reg = new RegExp(keyWord)
  for (let i = 0; i < len; i++) {
    if (list[i].match(reg)) {
      arr.push(list[i])
    }
  }
  return arr
}

export {
  warningTypeList,
  isEmial,
  fuzzyQuery
}
