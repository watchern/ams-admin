<template>
  <ul id="myTab" class="nav nav-tabs" />
  <div id="columnName" style="height:50px;line-height: 50px;padding-left:20px;"><span>分析字段：</span><em style="color:red" /></div>
  <div id="myTabContent" style="padding-left: 20px;" class="tab-content" />
</template>

<script>
export default {
  name: 'AnalysisDetailData'
}
var dataTableName = getParams().dataTableName
var openType = getParams().openType
var cVal = getParams().cVal
var paramData = {
  'dataTableName': dataTableName,
  'cVal': cVal,
  'openType': openType
}
var height = $(document).height() - 100
$('#myTabContent').height(height)
var load = $('body').mLoading({ 'text': '正在加载数据，请稍后……', 'hasCancel': false })
$.post(contextPath + '/graphEditor/getAnalysisDataDetail', paramData, function(res) {
  load.hide()
  // 判断总体结果是否出错
  if (res.isError) {
    alertMsg('错误', '获取数据表详细数据出错：' + res.message, 'error')
  } else {
    var list = res.resList
    var li_html = ''; var div_html = ''
    for (var i = 0; i < list.length; i++) {
      var tableName = list[i].tableName
      var nodeName = list[i].nodeName
      var columnName = list[i].columnName
      var layPageId = list[i].layPageId
      // 判断每个涉及的表的查询明细数据结果是否出错
      var isError = list[i].isError
      var type = '1'
      if (openType === 2) {
        type = 0
      }
      var setting = {
        'url': contextPath + '/graphEditor/viewData',
        'param': { 'tableName': tableName, 'openType': openType, 'type': type },
        'res': list[i],
        'dropDownMenu': true,
        'readOnly': true,
        'isPage': true,
        'pageUp': false,
        'contextMenu': true,
        'isError': isError,
        'message': isError ? list[i].message : ''
      }
      if (i == 0) { // 设置选中active
        li_html += '<li class="active"><a href="#' + layPageId + '" data-toggle="tab">' + nodeName + '</a></li>'
        div_html += '<div class="tab-pane fade in active" id="' + layPageId + '"><div style="display:none;">' + JSON.stringify(setting) + '</div><iframe id="iframe_' + layPageId + '" src="dataTable.jsp?layPageId=' + layPageId + '" style="width: 98%; height:' + height + 'px;" frameborder="0"></iframe></div>'
      } else {
        li_html += '<li><a href="#' + layPageId + '" data-toggle="tab">' + nodeName + '</a></li>'
        div_html += '<div class="tab-pane fade" id="' + layPageId + '"><div style="display:none;">' + JSON.stringify(setting) + '</div><iframe id="iframe_' + layPageId + '" src="dataTable.jsp?layPageId=' + layPageId + '" style="width: 98%; height:' + height + 'px;" frameborder="0"></iframe></div>'
      }
    }
    $('#myTab').append(li_html)
    $('#myTabContent').append(div_html)
    $('em').html(columnName)
    $('#myTab li:eq(' + i + ')').click()
  }
}, 'json')
</script>
