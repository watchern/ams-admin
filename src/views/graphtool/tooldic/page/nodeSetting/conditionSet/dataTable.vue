<template>
  <div id="content" />
</template>

<script>
export default {
  name: 'DataTable'
}

var layPageId = getParams().layPageId
var setting = window.parent.$('#' + layPageId + '>div').html()
setting = JSON.parse(setting)
var isError = setting.isError
if (isError && isError === true) {
  $('#content').append("<div id='message' style='text-align:center;color:red;'>" + setting.message + '</div>')
} else {
  $('#content').append("<div id='handSonTable'></div>")
  delete setting.isError
  delete setting.message
  handSonTableFun(setting)
}
</script>
