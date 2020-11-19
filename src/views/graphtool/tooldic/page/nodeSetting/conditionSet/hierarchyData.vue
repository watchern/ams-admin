<template>
  <div>
    <form>
      <table class="table table-bordered">
        <caption>
          <div class="row">
            <p style="color:red">注：每次分层区间数不能超过五个</p>
          </div>
          <div class="row">
            <div class="col-sm-4">
              <div class="form-group">
                <label class="col-sm-4 control-label" style="text-align: right;margin-top:5px;">分层字段：</label>
                <div class="col-sm-8">
                  <select id="hierarchy_column" name="status" class="selectpicker" data-live-search="true" @change="empty_set" />
                </div>
              </div>
            </div>
            <div class="col-sm-7">
              <div class="form-group">
                <div class="col-sm-11" style="padding-top:8px;float: right;">
                  <span id="range" />
                </div>
              </div>
            </div>
            <div class="col-sm-1">
              <div class="form-group">
                <div class="caption-btn-group" style="padding-top:8px;">
                  <button type="button" class="btn" @click="addRows">增加区间</button>
                </div>
              </div>
            </div>
          </div>
        </caption>
        <thead>
          <tr>
            <th colspan="5" style="text-align: center;">分层区间列表</th>
          </tr>
        </thead>
        <tbody id="row_add">
          <tr v-for="(item,index) in items" :key="item.id">
            <td><label class="col-sm-10 control-label">区间</label></td>
            <td><input v-model="item.c_col_1" type="number" min="1" class="col-1 form-control"></td>
            <td><label class="col-sm-3 control-label">至</label></td>
            <td><input v-model="item.c_col_2" type="number" min="1" class="col-2 form-control"></td>
            <td><img style="width:25px;cursor:pointer;" src="../../../images/delred.png" @click="clickDel(index)"></td>
          </tr>
        </tbody>
      </table>
    </form>
  </div>
</template>

<script>
var nodeData
export default {
  name: 'HierarchyDataSet',
  data() {
    return {
      pre_str_column: [],
      dict_map: [],
      keyId: 0,
      items: [
        {
          id: this.keyId,
          c_col_1: '',
          c_col_2: ''
        }
      ]
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const graph = this.$parent.graph
      nodeData = graph.nodeData[graph.curCell.id]
      const columnsInfoPre = this.$parent.columnsInfoPre
      var typeArr = ['INTEGER', 'DECIMAL', 'NUMBER', 'FLOAT', 'REAL', 'DATE', 'TIMESTAMP']
      if (columnsInfoPre.length !== 0) { // 初始化数据源
        var html = "<option value=''>请选择</option>"
        $(columnsInfoPre).each(function(index) {
          if ($.inArray(this.columnType, typeArr) > -1) {
            html += "<option value='" + this.newColumnName + "'>" + this.newColumnName + '</option>'
            this.pre_str_column.push(this.newColumnName)
          }
        })
        $('#hierarchy_column').html(html)
      }
      if (this.pre_str_column.length === 0) {
        alertMsg('提示', '上一节点的表或视图暂无可分层的字段', 'info')
      } else {
        if (parent_node.nodeInfo.resultTableName === '') {
          alertMsg('提示', '请先执行上一节点', 'info')
        } else {
          /**
                         * 获得上一节点执行结果的选择字段的最大值和最小值
                         */
          var load = $('body').mLoading({ 'text': '正在加载字段的区间值，请稍后……', 'hasCancel': false })
          var dataParam = {
            'result_table_name': parent_node.nodeInfo.resultTableName,
            'openType': graph.openType
          }
          $.post(contextPath + '/graphEditor/verifyLargeData', dataParam, function(res) {
            if (res.isError) {
              load.hide()
              alertMsg('提示', res.message, 'info')
            } else {
              dataParam.exe_column = this.pre_str_column.join(',')
              if (!res.verify) {
                load.hide()
                confirmMsg('提示', '上一节点表/视图的数据量较大，加载字段的区间值较慢,是否继续？', 'info', function() {
                  load.show()
                  getMaxMinColumn(dataParam, load)
                }, function() {})
              } else {
                getMaxMinColumn(dataParam, load)
              }
            }
          }, 'json')
        }
      }
      if (nodeData.isSet) {
        $('#hierarchy_column').selectpicker('val', nodeData.setting.hierarchy_column)// 选择的分层字段
        $('#row_add').empty()
        $(nodeData.setting.hierarchy_map).each(function(index) {
          var html = '<tr>'
          html += "<td><label for='noticeTitle' class='col-sm-10 control-label'>区间</label></td>"
          html += "<td><input type='number' min='1' value='" + this.c_col_1 + "' class='col-1 form-control'  /></td>"
          html += "<td><label for='noticeTitle' class='col-sm-3 control-label'>至</label></td>"
          html += "<td><input type='number' min='1' value='" + this.c_col_2 + "' class='col-2 form-control' /></td>"
          html += "<td><img style='width:25px;cursor:pointer' @click='clickDel' src='../../../images/delred.png' /></td>"
          html += '</tr>'
          $('#row_add').append(html)
        })
      }
    },
    getMaxMinColumn(dataParam, load) {
      $.post(contextPath + '/graphEditor/getMaxMinColumn', dataParam, function(e) {
        load.hide()
        if (e.isError) {
          alertMsg('提示', e.message, 'info')
        } else {
          this.dict_map = e.map_range
        }
      }, 'json')
    },
    empty_set() {
      $('#row_add').empty()
      this.addRows()
      var sel_column = $('#hierarchy_column').val()
      if (sel_column === '') {
        $('#range').text('')
        return
      }
      var max_value = this.dict_map['max_' + sel_column]
      var min_value = this.dict_map['min_' + sel_column]
      if (!isNaN(parseInt(min_value)) && !isNaN(parseInt(max_value))) {
        $('#range').text('【最小值：' + min_value + ' ~ 最大值：' + max_value + '】')
      } else {
        $('#range').text('【最小值：空  ~  最大值：空】')
      }
    },
    /**
             * 添加行
             */
    addRows() {
      var length = $('#row_add tr').length
      if (length === 5) {
        return
      }
      this.keyId = this.keyId + 1
      this.items.push({ id: this.keyId, c_col_1: '', c_col_2: '' })
    },
    /**
             * 删除行
             */
    clickDel(index) {
      this.items.splice(index, 1)
    }
  }
}

$('table').css({ 'width': '900px', 'margin-left': function() {
  return ($(document).width() - 900) / 2 + 'px'
} })

/**
     * 获取所有区间分层
     * c_col_1:代表分层区间开始
     * c_col_2：代表分层区间结束
     */
function saveSetting() {
  var obj = {
    hierarchy_column: $('#hierarchy_column').val(),
    hierarchy_map: []
  }
  $('#row_add tr').each(function(index) {
    var $this = $(this)
    var c_col_1 = $this.find('.col-1').val()
    var c_col_2 = $this.find('.col-2').val()
    obj.hierarchy_map.push({ c_col_1: c_col_1, c_col_2: c_col_2 })
  })
  nodeData.setting = obj
}

// 页面输入项的校验(或空配置校验)
function inputVerify() {
  var verify = true
  var hierarchy_column = $('#hierarchy_column').val()
  if (hierarchy_column === '') {
    alertMsg('提示', '未选择分层字段', 'info')
    return false
  }
  $('.col-1').each(function(i, v) {
    if ($(this).val() == '' || $('.col-2:eq(' + i + ')').val() == '') {
      alertMsg('提示', '分层区间的输入值不能为空', 'info')
      verify = false
      return false
    }
  })
  return verify
}
</script>

<style scoped type="text/css">
    form {
        background: #0000;
    }
    .caption-btn-group{
        padding:0;
    }
</style>
