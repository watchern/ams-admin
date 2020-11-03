import $ from 'jquery'
/**
 * download file
 */
const downloadFile = ($url, $obj) => {
  const param = {
    url: $url,
    obj: $obj
  }

  if (!param.url) {
    this.$message.warning(`无下载url无法下载`)
    return
  }

  const generatorInput = function(obj) {
    let result = ''
    const keyArr = Object.keys(obj)
    keyArr.forEach(function(key) {
      result += "<input type='hidden' name = '" + key + "' value='" + obj[key] + "'>"
    })
    return result
  }
  $(`<form action="${param.url}" method="get">${generatorInput(param.obj)}</form>`).appendTo('body').submit().remove()
}

export {
  downloadFile
}
