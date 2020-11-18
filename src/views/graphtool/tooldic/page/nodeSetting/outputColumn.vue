<template>
  <div style="width: 98%;margin: 4px 1%">
    <div style="color: red;">
      <p>注：（1）如果修改了【输出字段名称】且存在已配置过或执行过的后续节点，则后续节点关于该字段的配置信息会失效</p>
      <p style="text-indent: 2em">（2）如果继续使用后续节点，则需重新配置和执行相关节点</p>
      <p style="text-indent: 2em">（3）如果修改了【输出字段名称】后并执行了当前节点，则后续节点的执行结果会发生变化</p>
      <p style="text-indent: 2em">（4）支持通过拖拽更改输出字段的顺序，同时在结果集中同步展示</p>
    </div>
    <table id="column_config" class="table table-bordered">
      <thead>
        <tr>
          <th width="30%" style="text-align: center">上一节点名称</th>
          <th width="25%" style="text-align: center">字段名称</th>
          <th width="30%" style="text-align: center">输出字段名称</th>
          <th id="sel_all_th" width="15%" style="text-align: center">是否为输出字段
            <input id="sel_all" type="checkbox" class="form-control" @click="selAll">
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item,index) in items" class="colTr" :nodeId="item.nodeId" :nullNodeId="item.nullNodeId" :newColumnName="item.curColumnName" :columnInfo="item.columnInfo">
          <td>{{ item.rtn }}</td>
          <td>{{ item.curColumnName }}</td>
          <td v-if="item.isSet && item.flag">
            <input v-model="item.newColumnName" type="text" class="newColumn form-control sea_text">
          </td>
          <td v-if="item.isSet && item.flag" class="text-center">
            <input v-if="item.checked === true && !item.isHide" type="checkbox" :name="item.columnName" checked="checked" class="form-control outputColumn" @change="allchk">
            <input v-if="item.checked !== true || item.isHide" type="checkbox" :name="item.columnName" class="form-control outputColumn" @change="allchk">
          </td>
          <td v-if="!item.isSet || !item.flag">
            <input v-model="item.curColumnName" type="text" onblur="vilidata_simple(this)" class="newColumn form-control sea_text">
          </td>
          <td v-if="!item.isSet || !item.flag" class="text-center">
            <input type="checkbox" :name="item.curColumnName" class="form-control outputColumn" @click="allchk">
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import Vue from 'vue'
var nodeData, nodeInfo, columnsInfoPre
export default {
  name: 'OutputColumnSetting',
  data() {
    return {
      re_columnsInfo: '',
      items: []
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const graph = this.$parent.graph
      nodeData = graph.nodeData[graph.curCell.id]
      nodeInfo = nodeData.nodeInfo
      columnsInfoPre = this.$parent.columnsInfoPre
      this.initConfig()
    },
    check_old_column() { // 重构字段组，优化查询
      var object = {}
      $(nodeData.columnsInfo).each(function(index) {
        object[this.columnName] = this
      })
      return object
    },
    initConfig() { // 初始化字段列表
      this.re_columnsInfo = this.check_old_column()
      this.createTrFacture()
      var num = 0
      $('.colTr').each(function() {
        if (!$(this).find('input[type=checkbox]').prop('checked')) {
          $('#sel_all').removeAttr('checked')
          num++
          return false
        }
      })
      if (num === 0) {
        $('#sel_all').attr('checked', 'checked')
      }
      if (nodeInfo.optType === 'groupCount' || nodeInfo.optType === 'delRepeat' || nodeInfo.optType === 'union') {				// 分组汇总和数据去重节点的输出字段单独处理，置为不可编辑
        $('#sel_all').attr('disabled', 'disabled')
        $('.outputColumn').attr('disabled', 'disabled')
      }
    },
    re_checkbox(data, hasMoreTable) {
      var data_r = []; var num = 0; var colTr = $('.colTr')
      colTr.find('input[type=checkbox]').parent().removeClass('checked')
      colTr.find('input[type=checkbox]').removeAttr('checked')
      colTr.each(function() {
        var nodeId = $(this).attr('nodeId')
        var nullNodeId = $(this).attr('nullNodeId')
        if (data && data.length > 0) {
          for (var i = 0; i < data.length; i++) {
            if (data[i].value === $(this).attr('newColumnName')) {
              if (data[i].nodeId === nodeId && hasMoreTable && data[i].nullNodeId === nullNodeId) {
                $(this).find('input[type=checkbox]').parent().addClass('checked')
                $(this).find('input[type=checkbox]').icheck('checked')
                num++
                break
              }
              if (!hasMoreTable) {
                $(this).find('input[type=checkbox]').parent().addClass('checked')
                $(this).find('input[type=checkbox]').icheck('checked')
                num++
                break
              }
            }
          }
        }
      })
      if (num === colTr.length) {
        $('#sel_all').parent().addClass('checked')
        $('#sel_all').icheck('checked')
      } else {
        if ($('#sel_all').prop('checked')) {
          $('#sel_all').parent().removeClass('checked')
        }
      }
    },
    createTrFacture() {
      const isSet = nodeData.isSet// 判断当前节点是否已经设置
      const columnsInfoArray = isSet ? nodeData.columnsInfo : columnsInfoPre
      for (let column = 0; column < columnsInfoArray.length; column++) {
        let isHide = false
        if (isSet) {
          let num = 0
          for (let j = 0; j < columnsInfoPre.length; j++) {
            if (columnsInfoArray[column].columnName === columnsInfoPre[j].newColumnName) {
              isHide = false
              break
            } else {
              num++
            }
          }
          if (num === columnsInfoArray.length) {
            isHide = true
          }
        }
        const oldSetColumn = this.find_self_column(curColumnName, columnsInfoPre[column].nodeId)
        const curColumnName = isSet ? columnsInfoArray[column].columnName : columnsInfoArray[column].newColumnName
        const nodeId = columnsInfoPre[column].nodeId
        const nullNodeId = columnsInfoPre[column].nullNodeId
        const columnInfo = JSON.stringify(columnsInfoPre[column])
        const rtn = columnsInfoPre[column].rtn
        const flag = oldSetColumn.flag
        const newColumnName = oldSetColumn.newColumnName
        const columnName = oldSetColumn.columnName
        const checked = oldSetColumn.checked
        this.items.push({ curColumnName, nodeId, nullNodeId, columnInfo, rtn, flag, newColumnName, columnName, checked })
      }
      $('#column_config tbody').sortable().disableSelection()
    },
    get_column() { // 这里保存的是上级节点所有的字段，包括输出字段，（意义：不输出的字段不代表不是该节点的字段，在获取上级节点字段应该进一步筛选师傅是输出字段）
      var this_columnInfos = []
      $('.colTr').each(function(index) {
        var flag = $(this).find('input[type=checkbox]').prop('checked')
        var this_rtn = $(this).find('td:eq(0)').html()
        var nodeId = $(this).attr('nodeId')
        var this_column = JSON.parse($(this).attr('columnInfo'))
        var old_colum_name = $(this).attr('newColumnName')// 之前的newColumnName
        var re_is_filter_comumn = []
        $(is_filter_column).each(function() {
          re_is_filter_comumn.push(this.value)
        })
        if (re_is_filter_comumn.length === 0 || $.inArray($(this).attr('newColumnName'), re_is_filter_comumn) > -1) { // 没有做配置、没有类似去重此功能需求或者配置并且在对勾显示字段的
          if (flag) {
            this_column.isOutputColumn = 1// is output column
          } else {
            this_column.isOutputColumn = 0
          }
        } else {
          this_column.isOutputColumn = 0
        }
        this_column.newColumnName = $(this).find('.newColumn').val()
        this_column.columnName = old_colum_name
        this_column.rtn = this_rtn
        this_column.nodeId = nodeId
        this_columnInfos.push(this_column)
      })
      nodeData.columnsInfo = this_columnInfos
    },
    find_self_column(columnName, nodeId) { // 是否设置并且含有当前字段
      var obj = {
        flag: false,
        columnName: columnName,
        newColumnName: columnName,
        checked: false
      }
      var oldset = this.re_columnsInfo
      // 通过当前节点下的字段名称进行匹配，防止不同节点含有相同字段名称所导致的共用一个输出字段值con's
      if (typeof oldset[columnName] !== 'undefined') {
        obj.flag = true
        obj.columnName = columnName
        obj.newColumnName = oldset[columnName].newColumnName
        obj.checked = oldset[columnName].isOutputColumn !== 0
      }
      return obj
    },
    selAll() {
      if ($('#sel_all').prop('checked')) {
        $('.outputColumn').attr('checked', 'checked')
      } else {
        $('.outputColumn').removeAttr('checked')
      }
    },
    allchk() {
      var obj = $('#column_config>tbody :checkbox')
      var chk = 0
      obj.each(function() {
        if ($(this).prop('checked')) {
          chk++
        }
      })
      if (obj.length === chk) { // 全选
        $('#sel_all').attr('checked', 'checked')
      } else { // 不全选
        $('#sel_all').removeAttr('checked')
      }
    }
  }
}

/**
     * 总体保存
     */
function save() {
  configColumn.get_column()
  basicObj.save_base()
  saveSetting()
  nodeData.isSet = true
}

// 验证输出字段
function outputVerify() {
  var verify = vilidata_simple()
  if (verify) {
    var num = 0
    $('.colTr').each(function() {
      if ($(this).find('input[type=checkbox]').prop('checked')) {
        num++
      }
    })
    if (num !== 0) {
      verify = true
    } else {
      verify = false
      alertMsg('提示', '请选择输出字段', 'info')
    }
  }
  return verify
}

/**
     * 校验是否存在重复别名
     */
function vilidata_simple() {
  var vili_column = []; var vili_log = []; var verify = true
  $('.newColumn').parent().removeClass('has-error')
  $('.colTr').each(function() {
    var newColumn = $(this).find('.newColumn')
    var val = newColumn.val() // 输出字段名称值
    if ($.inArray(val, vili_column) > -1 && $(this).find('input[type=checkbox]').prop('checked')) { // 说明有重复值
      newColumn.parent().addClass('has-error')
      vili_log.push(val)
      return false
    } else {
      vili_column.push(val)
    }
  })
  if (vili_log.length > 0) {
    alertMsg('提示', '输出字段重复！请返回修改！', 'info')
    verify = false
  }
  return verify
}

</script>

<style type="text/css">
    td>.form-group{
        margin-bottom: 0;
    }
    .table > tbody > tr > td{
        font-size: 13px;
        color: #4B4B4B;
    }
</style>
