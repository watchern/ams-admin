<template>
  <div>
    <table class="main_table">
      <tr>
        <td colspan="2" style="overflow-x: hidden ">
          <div class="table_list">
            <table id="tableInfoList" class="table table-striped" />
          </div>
        </td>
      </tr>
      <tr>
        <td style="width: 25%;text-align: right;">分析内容 : &nbsp;</td>
        <td>
          <span>
            <select id="columnSelType" style="width: 90px">
              <option value="contain">包含</option>
              <option value="equal">等于</option>
            </select>
          </span>
          <span>
            <input id="columnContent" type="text">
          </span>
          <span>
            <input id="autoContrast" type="checkbox" @click="autoContrast">&nbsp;自动分析
          </span>
        </td>
      </tr>
      <tr>
        <td style="width: 25%;text-align: right;">出现次数 :  &nbsp;</td>
        <td>
          <span>
            <select id="frequencySelType" style="width: 90px">
              <option value="equal">等于</option>
              <option value="gt_eq">大于等于</option>
              <option value="lt_eq">小于等于</option>
            </select>
          </span>
          <span>
            <input id="frequencyCount" type="number" min="0">
          </span>
          <span>
            <input id="ignoreNullVal" type="checkbox">&nbsp;忽略空值
          </span>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
var nodeData
export default {
  name: 'FrequencyAnalysisSet',
  data() {
    return {
      nodeData: null
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const graph = this.$parent.graph
      nodeData = graph.nodeData[graph.curCell.id]
      var isSet = nodeData.isSet
      var gridData = []
      $('.table_list').css({ 'padding-left': function() {
        return ($(document).width() * 0.7 - 800) / 2 + 'px'
      } })
      if (isSet) {
        var analysisCol = nodeData.setting.analysisCol
        var appearNum = nodeData.setting.appearNum
        // 反显节点信息及列信息
        gridData = nodeData.setting.contrastCol
        // 反显分析关联字段行信息
        if (analysisCol.autoContrast) {
          $('#columnSelType').val('contain').attr('disabled', 'disabled')
          $('#columnContent').val('').attr('disabled', 'disabled')
          $('#autoContrast').attr('checked', 'checked')
        } else {
          $('#columnSelType').val(analysisCol.type)
          $('#columnContent').val(analysisCol.value)
        }
        // 反显出现频次行信息
        $('#frequencySelType').val(appearNum.type)
        $('#frequencyCount').val(appearNum.value)
        if (appearNum.ignoreNullVal) {
          $('#ignoreNullVal').attr('checked', 'checked')
        }
      } else {
        var parentIds = nodeData.parentIds
        for (let i = 0; i < parentIds.length; i++) {
          var preNodeData = {}
          // 判断前置节点（结果表）是否有自己的配置
          if (graph.nodeData[parentIds[i]].isSet) {			// 如果有，则前置节点信息取结果表本身的
            preNodeData = graph.nodeData[parentIds[i]]
          } else {			// 如果没有，则前置节点信息取结果表的前置节点的
            var pre_parentIds = graph.nodeData[parentIds[i]].parentIds
            preNodeData = graph.nodeData[pre_parentIds[0]]
          }
          var columnsInfo = preNodeData.columnsInfo
          var columns = []
          for (var j = 0; j < columnsInfo.length; j++) {
            if (columnsInfo[j].isOutputColumn === 1) {
              columns.push({ 'columnName': columnsInfo[j].newColumnName, 'selected': false })
            }
          }
          var obj = {
            'nodeId': parentIds[i],
            'nodeName': graph.nodeData[parentIds[i]].nodeInfo.nodeName,
            'columns': columns
          }
          gridData.push(obj)
        }
      }

      var width = 800
      jQuery('#tableInfoList').jqGrid({
        datatype: 'local',
        colNames: ['节点ID', '上一节点名称', '分析字段'],
        colModel: [
          { name: 'nodeId', hidden: true },
          { name: 'nodeName', align: 'center', sortable: false },
          { name: 'columnName', align: 'center', sortable: false, formatter: function(cellValue, options, rowObject, action) {
            var html = "<select class='chooseCol'>"
            for (var i = 0; i < rowObject.columns.length; i++) {
              if (rowObject.columns[i].selected) {
                html += "<option value='" + rowObject.columns[i].columnName + "' selected='selected'>" + rowObject.columns[i].columnName + '</option>'
              } else {
                html += "<option value='" + rowObject.columns[i].columnName + "'>" + rowObject.columns[i].columnName + '</option>'
              }
            }
            html += '</select>'
            return html
          } }
        ],
        width: width,
        height: 'auto'
      })
      for (var i = 0; i < gridData.length; i++) {
        jQuery('#tableInfoList').jqGrid('addRowData', i + 1, gridData[i])
      }
      $('.ui-common-table').css({ 'width': width + 'px' })
    },
    autoContrast() {
      if ($('#autoContrast').is(':checked')) {
        $('#columnSelType').val('contain').attr('disabled', 'disabled')
        $('#columnContent').val('').attr('disabled', 'disabled')
      } else {
        $('#columnSelType').removeAttr('disabled')
        $('#columnContent').removeAttr('disabled')
      }
    }
  }
}

$('.chooseCol').change(function() {
  var val = $(this).val()
  $(this).find('option').removeAttr('selected')
  $(this).find("option[value='" + val + "']").attr('selected', 'selected')
  $(this).val(val)
})

function saveSetting() {
  var analysisCol = {}; var appearNum = {}; var contrastCol = []
  analysisCol.autoContrast = $('#autoContrast').is(':checked')
  if (!$('#autoContrast').is(':checked')) {
    analysisCol.type = $('#columnSelType').val()
    analysisCol.value = $('#columnContent').val()
  }
  appearNum.type = $('#frequencySelType').val()
  appearNum.value = $('#frequencyCount').val()
  appearNum.ignoreNullVal = $('#ignoreNullVal').is(':checked')
  var ids = $('#tableInfoList').jqGrid('getDataIDs')
  for (var i = 0; i < ids.length; i++) {
    var rowData = $('#tableInfoList').jqGrid('getRowData', ids[i])
    var columnNameHtml = rowData.columnName
    var columns = []; var ckCol = $(columnNameHtml).val()
    $(columnNameHtml).find('option').each(function() {
      columns.push({ 'columnName': $(this).val(), 'selected': ($(this).val() === ckCol) })
    })
    var obj = {
      'nodeId': rowData.nodeId,
      'nodeName': rowData.nodeName,
      'columns': columns,
      'columnSelected': ckCol
    }
    contrastCol.push(obj)
  }
  nodeData.setting.analysisCol = analysisCol
  nodeData.setting.appearNum = appearNum
  nodeData.setting.contrastCol = contrastCol
}

// 页面输入项的校验(或空配置校验)
function inputVerify() {
  var appearNum = $('#frequencyCount').val()
  if ($('#autoContrast').is(':checked')) {
    if (appearNum === '') {
      alertMsg('提示', '出现频次的数值不能为空', 'info')
      return false
    }
  } else {
    if ($('#columnContent').val() === '') {
      alertMsg('提示', '分析内容不能为空', 'info')
      return false
    }
    if (appearNum === '') {
      alertMsg('提示', '出现频次的数值不能为空', 'info')
      return false
    }
  }
  return true
}
</script>

<style type="text/css">
    .main_table {
        width: 70%;
        border: 1px solid #ADAEB0;
        margin-left: 15%;
        margin-top:calc(6vh);
    }
    .main_table tr td {
        border: 1px solid #ADAEB0;
        height: 35px;
    }
    .main_table td span {
        margin-left: 10px;
    }
    .table_list {
        width: 70%;
        height: 100%;
        text-align: center;
        padding: 15px 0;
    }
    .chooseCol{
        width:60%;
        height:30px;
        line-height: 25px;
    }
    .chooseCol option{
        font-size: 18px;
    }
</style>
