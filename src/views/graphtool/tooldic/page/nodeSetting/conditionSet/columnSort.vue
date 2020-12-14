<template>
  <div>
    <div style="width: 100%;height:auto;padding-left:50px;">
      <p style="height:30px;line-height: 30px;color: red;">注：已排序字段列表中，可通过拖动行改变字段的显示顺序</p>
      <div id="group2" class="demo-transfer twotransfer" style="width: 400px;float: left;margin-top:10px;" />
      <div style="float: left;width: 450px; height: 500px;margin-top:10px;background-color: #fff;border:1px solid #E6E6E6;overflow-y: auto">
        <table id="col_table_col" class="table_auto">
          <thead>
            <tr>
              <td width="80px">
                <!--<input @click="selectAll" type="checkbox"/>-->
                <el-checkbox v-model="selectAll" @change="handleCheckAllChange" />
              </td>
              <td width="200px" align="center">已选择排序字段</td>
              <td width="200px">排序方式</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(sortObj,index) in sortColumnArr" :id="sortObj.value">
              <td>
                <el-checkbox :key="sortObj.value" v-model="sortObj.checked" @change="checkBoxChange(index)" />
              </td>
              <td align="left">{{ sortObj.title }}</td>
              <td>
                <el-radio v-model="sortObj.sortType" label="ASC">升序</el-radio>
                <el-radio v-model="sortObj.sortType" label="DESC">降序</el-radio>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColumnSortSet',
  data() {
    return {
      nodeData: null,
      selectAll: false,
      sortColumnArr: [],
      columnData: [],
      group_transfer: null
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const graph = this.$parent.graph
      this.nodeData = graph.nodeData[graph.curCell.id]
      const columnsInfoPre = this.$parent.columnsInfoPre
      const $this = this
      layui.use('transfer', function() {
        const transfer = layui.transfer
        const reload_value = []
        const isSet = $this.nodeData.isSet				// 该节点是否配置
        if (isSet) {				// 配置过,字段信息来自本身节点
          const setting = $this.nodeData.setting			// 该节点的个性化配置信息
          $this.columnData = setting.leftData
          const rightData = setting.rightData
          if (rightData.length > 0) {
            for (var j = 0; j < rightData.length; j++) {
              reload_value.push(rightData[j].column)
              const value = rightData[j].column
              const title = rightData[j].column
              const checked = false
              const sortType = rightData[j].sortType
              $this.sortColumnArr.push({ value, title, checked, sortType })
            }
          }
        } else {					// 未配置过,字段信息来自父节点
          var columnsInfo = columnsInfoPre
          for (var i = 0; i < columnsInfo.length; i++) {
            var obj = { 'value': columnsInfo[i].newColumnName, 'title': columnsInfo[i].newColumnName }
            $this.columnData.push(obj)
          }
        }
        // 显示搜索框
        var height = 500
        $this.group_transfer = transfer.render({
          elem: '#group2',
          data: $this.columnData,
          title: ['待选择排序字段', ''],
          showSearch: true,
          id: 'group2key',
          height: height,
          width: 300,
          onchange: function(data, index) {
            if (index) {
              $this.ceil_tr(data)
            } else {
              $this.add_tr(data)
            }
          }
        })
        if (isSet) {
          transfer.reload('group2key', {
            title: ['待选择排序字段', ''],
            value: reload_value,
            showSearch: true
          })
        }
        $('#group2').find(".layui-transfer-box[data-index='1']").hide()
        $('ul.layui-transfer-data').css('height', height - 93)
      })
      $('#col_table_col>tbody').sortable().disableSelection()
    },
    add_tr(data) {
      const $this = this
      $(data).each(function(index) {
        const value = this.value
        const title = this.title
        const checked = false
        const sortType = 'ASC'
        $this.sortColumnArr.push({ value, title, checked, sortType })
      })
    },
    ceil_tr(data) {
      const value = []
      const newSortColumnArr = []
      $(data).each(function(index) {
        this.checked = false
        value.push(this.value)
      })
      for (let i = 0; i < this.sortColumnArr.length; i++) {
        if (!value.includes(this.sortColumnArr[i].value)) {
          newSortColumnArr.push(this.sortColumnArr[i])
        }
      }
      this.sortColumnArr = newSortColumnArr
      if (this.selectAll) {
        this.selectAll = false
      }
      this.reloadTransfer()
    },
    handleCheckAllChange(checked) {
      Array.from(this.sortColumnArr, (n) => n.checked = checked)
      const column = this.group_transfer.getData()
      const value = []
      $(column).each(function(index) {
        this.checked = checked
        value.push(this.value)
      })
      this.reloadTransfer(value)
    },
    checkBoxChange(index) {
      const data = this.group_transfer.getData()
      const value = []
      let count = 0
      for (var i = 0; i < data.length; i++) {
        if (this.sortColumnArr[index].value === data[i].value) { // 判断字段选中的值为对勾值
          data[i].checked = this.sortColumnArr[index].checked
        }
        if (data[i].checked) {
          count++
        }
        value.push(data[i].value)
      }
      if (data.length === count) {
        this.selectAll = true
      }
      this.reloadTransfer(value)
    },
    saveSetting() {
      const rightData = []
      for (let i = 0; i < this.sortColumnArr.length; i++) {
        var obj = { 'column': this.sortColumnArr[i].value, 'sortType': this.sortColumnArr[i].sortType }
        rightData.push(obj)
      }
      this.nodeData.setting.leftData = this.columnData
      this.nodeData.setting.rightData = rightData
    },
    inputVerify() {
      if (this.sortColumnArr.length === 0) {
        this.$message({ type: 'warning', message: '未选择排序字段' })
        return false
      }
      return true
    },
    reloadTransfer(value) {
      if (typeof value !== 'undefined') {
        this.group_transfer.reload({
          value: value
        })
      } else {
        this.group_transfer.reload({})
      }
      $('#group2').find(".layui-transfer-box[data-index='1']").hide()
    }
  }
}
</script>
<style scoped type="text/css">
    .table_auto {
        margin:0 auto;
        float: left;
        width: 100%;
        text-align: center;
    }
    .table_auto>thead>tr,.table_auto>tbody>tr{
        height:38px;
        line-height: 38px;
        border-bottom: solid 1px #e6e6e6;
    }
    .table_auto>thead>tr>td>div,.table_auto>tbody>tr>td>div{
        width:17px;
        height:17px;
        border:1px solid #E6E6E6;
    }
    .table_auto>tbody>tr>td{
        cursor:pointer;
    }
    .table_auto>thead>tr>td{
        background-color: #5886B2;
        color:#fff;
        border:1px solid #ddd;
    }
</style>
