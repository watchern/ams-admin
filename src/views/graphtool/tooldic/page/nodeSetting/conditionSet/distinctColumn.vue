<template>
  <div id="transfer_div_column">
    <div id="del_repeat" class="demo-transfer" />
  </div>
</template>

<script>
var transfer1, nodeData
export default {
  name: 'DistinctColumnSet',
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const graph = this.$parent.graph
      nodeData = graph.nodeData[graph.curCell.id]
      const columnsInfoPre = this.$parent.columnsInfoPre
      layui.use(['transfer'], function() {
        var transfer = layui.transfer
        var dg_data = []
        $(columnsInfoPre).each(function(index) {
          dg_data.push({
            'value': this.newColumnName,
            'title': this.newColumnName
          })
        })

        // 显示搜索框
        var height = 360
        var width = 300
        var move_left = ($(document).width() - 680) / 2

        transfer1 = transfer.render({
          elem: '#del_repeat',
          data: dg_data,
          title: ['可选字段', '去重字段'],
          showSearch: true,
          height: height,
          width: width,
          id: 'delRepeat',
          onchange: function(data, index) {
            this.$parent.is_filter_column = transfer1.getData('delRepeat')
            this.$parent.$refs.outputColumn.re_checkbox(this.$parent.is_filter_column)
          }
        })
        // 是否反显
        if (nodeData.isSet) {
          var re_value = []
          $(nodeData.setting.delRepeatData).each(function() {
            re_value.push(this.value)
          })
          transfer.reload('delRepeat', {
            title: ['可选字段', '去重字段'],
            value: re_value,
            showSearch: true
          })
          configColumn.re_checkbox(nodeData.setting.delRepeatData)// 反显
        }
        $('ul.layui-transfer-data').css('height', height - 93)
        $('#del_repeat').css({ 'margin-left': move_left + 'px', 'margin-top': '30px' })
      })
    }
  }
}

/**
     * 保存方法
     */
function saveSetting() {
  nodeData.setting.delRepeatData = transfer1.getData('delRepeat')
}

// 页面输入项的校验(或空配置校验)
function inputVerify() {
  var verify = true
  if (transfer1.getData().length == 0) {
    alertMsg('提示', '已选择去重字段列表不能为空', 'info')
    verify = false
  }
  return verify
}
</script>
