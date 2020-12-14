<template>
  <div ref="outputContentDiv" style="width: 98%;margin: 4px 1%">
    <div style="color: red;">
      <p>注：（1）如果修改了【输出字段名称】且存在已配置过或执行过的后续节点，则后续节点关于该字段的配置信息会失效</p>
      <p style="text-indent: 2em">（2）如果继续使用后续节点，则需重新配置和执行相关节点</p>
      <p style="text-indent: 2em">（3）如果修改了【输出字段名称】后并执行了当前节点，则后续节点的执行结果会发生变化</p>
      <p style="text-indent: 2em">（4）支持通过拖拽更改输出字段的顺序，同时在结果集中同步展示</p>
    </div>
    <div ref="outPutTable" style="height: 480px;overflow-y: auto;">
      <table id="column_config" class="table table-bordered">
        <thead>
          <tr>
            <th width="5%" style="text-align: center">序号</th>
            <th width="30%" style="text-align: center">上一节点名称</th>
            <th width="25%" style="text-align: center">字段名称</th>
            <th width="25%" style="text-align: center">输出字段名称</th>
            <th width="15%" style="text-align: center">是否为输出字段
              <el-checkbox v-model="checkAll" :disabled="isAllDisabled" @change="handleCheckAllChange" />
            </th>
          </tr>
        </thead>
        <tbody ref="outPutTbody">
          <tr v-for="(item,index) in items" ref="colTr" :data-index="index">
            <td align="center">{{ index+1 }}</td>
            <td>{{ item.rtn }}</td>
            <td>{{ item.curColumnName }}</td>
            <td>
              <input v-model="item.disColumnName" type="text" class="form-control newColumn" @blur="vilidata_simple(index)">
            </td>
            <td class="text-center">
              <el-checkbox :key="item.id" v-model="item.checked" :name="item.attrColumnName" :disabled="isDisabled" @change="checkBoxChange(index)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OutputColumnSetting',
  data() {
    return {
      nodeData: null,
      columnsInfoPre: this.$parent.columnsInfoPre,
      re_columnsInfo: '',
      items: [],
      isIndeterminate: true,
      checkAll: false,
      isAllDisabled: false,
      isDisabled: false
    }
  },
  mounted() {
    this.init()
    // window.outputVerify = this.outputVerify
  },
  methods: {
    init() {
      const graph = this.$parent.graph
      this.nodeData = graph.nodeData[graph.curCell.id]
      this.initConfig()
    },
    check_old_column() { // 重构字段组，优化查询
      const object = {}
      $(this.nodeData.columnsInfo).each(function(index) {
        object[this.columnName] = this
      })
      return object
    },
    initConfig() { // 初始化字段列表
      this.re_columnsInfo = this.check_old_column()
      this.createTrFacture()
      var num = 0
      for (let i = 0; i < this.items.length; i++) {
        if (!this.items[i].checked) {
          this.checkAll = false
          num++
          break
        }
      }
      if (num === 0) {
        this.checkAll = true
      }
      if (this.nodeData.nodeInfo.optType === 'groupCount' || this.nodeData.nodeInfo.optType === 'delRepeat' || this.nodeData.nodeInfo.optType === 'union') {				// 分组汇总和数据去重节点的输出字段单独处理，置为不可编辑
        this.isAllDisabled = true
        this.isDisabled = true
      }
    },
    re_checkbox(data, hasMoreTable) {
      var num = 0
      for (let i = 0; i < this.items.length; i++) {
        this.items[i].checked = false
      }
      for (let j = 0; j < this.items.length; j++) {
        var nodeId = this.items[j].nodeId
        var nullNodeId = this.items[j].nullNodeId
        if (data && data.length > 0) {
          for (var i = 0; i < data.length; i++) {
            if (data[i].value === this.items[j].curColumnName) {
              if (data[i].nodeId === nodeId && hasMoreTable && data[i].nullNodeId === nullNodeId) {
                this.items[j].checked = true
                num++
                break
              }
              if (!hasMoreTable) {
                this.items[j].checked = true
                num++
                break
              }
            }
          }
        }
      }
      if (num === this.items.length) {
        this.checkAll = true
      } else {
        if (this.checkAll) {
          this.checkAll = false
        }
      }
    },
    createTrFacture() {
      const isSet = this.nodeData.isSet// 判断当前节点是否已经设置
      const columnsInfoArray = isSet ? this.nodeData.columnsInfo : this.columnsInfoPre
      for (let column = 0; column < columnsInfoArray.length; column++) {
        let isHide = false
        if (isSet) {
          let num = 0
          for (let j = 0; j < this.columnsInfoPre.length; j++) {
            if (columnsInfoArray[column].columnName === this.columnsInfoPre[j].newColumnName) {
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
        const curColumnName = isSet ? columnsInfoArray[column].columnName : columnsInfoArray[column].newColumnName
        const oldSetColumn = this.find_self_column(curColumnName, this.columnsInfoPre[column].nodeId)
        const nodeId = this.columnsInfoPre[column].nodeId
        const nullNodeId = this.columnsInfoPre[column].nullNodeId
        const columnInfo = JSON.stringify(this.columnsInfoPre[column])
        const rtn = this.columnsInfoPre[column].rtn
        let checked = false
        const id = column
        let disColumnName = ''
        let attrColumnName = ''
        if (isSet && oldSetColumn.flag) {
          disColumnName = oldSetColumn.newColumnName
          attrColumnName = oldSetColumn.columnName
          if (oldSetColumn.checked && !isHide) {
            checked = true
          }
        } else {
          disColumnName = curColumnName
          attrColumnName = curColumnName
        }
        this.items.push({ id, curColumnName, nodeId, nullNodeId, columnInfo, rtn, disColumnName, attrColumnName, checked })
      }
      $(this.$refs.outPutTbody).sortable().disableSelection()
    },
    get_column() { // 这里保存的是上级节点所有的字段，包括输出字段，（意义：不输出的字段不代表不是该节点的字段，在获取上级节点字段应该进一步筛选师傅是输出字段）
      const this_columnInfos = []
      for (let i = 0; i < this.$refs.colTr.length; i++) {
        const index = this.$refs.colTr[i].getAttribute('data-index')
        var checked = this.items[index].checked
        var this_column = JSON.parse(this.items[index].columnInfo)
        var old_colum_name = this.items[index].curColumnName// 之前的newColumnName
        var re_is_filter_comumn = []
        $(this.$parent.is_filter_column).each(function() {
          re_is_filter_comumn.push(this.value)
        })
        if (re_is_filter_comumn.length === 0 || $.inArray(old_colum_name, re_is_filter_comumn) > -1) { // 没有做配置、没有类似去重此功能需求或者配置并且在对勾显示字段的
          if (checked) {
            this_column.isOutputColumn = 1// is output column
          } else {
            this_column.isOutputColumn = 0
          }
        } else {
          this_column.isOutputColumn = 0
        }
        this_column.newColumnName = this.items[index].disColumnName
        this_column.columnName = old_colum_name
        this_column.rtn = this.items[index].rtn
        this_column.nodeId = this.items[index].nodeId
        this_columnInfos.push(this_column)
      }
      this.nodeData.columnsInfo = this_columnInfos
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
    handleCheckAllChange(checked) {
      Array.from(this.items, (n) => n.checked = checked)
    },
    checkBoxChange(index) {
      var chk = 0
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].checked) {
          chk++
        }
      }
      if (this.items.length === chk) { // 全选
        this.checkAll = true
      } else { // 不全选
        this.checkAll = false
      }
    },
    vilidata_simple(index) {
      const checkedIndex = this.items.findIndex(n => n.checked === true)
      if (checkedIndex < 0) {
        this.$message({ type: 'info', message: '请选择输出字段' })
        return false
      }
      const vili_column = []
      let verify = true
      let message = ''
      if (typeof index !== 'undefined') { // 失焦时校验输出列是否重复
        const curDisColumnName = this.items[index].disColumnName
        if (this.items[index].checked) {
          for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].checked) {
              if (index !== i) {
                if (curDisColumnName === this.items[i].disColumnName) {
                  verify = false
                  message = `第${index + 1}行与第${i + 1}行的输出字段重复！请修改`
                  break
                }
              }
            }
          }
        }
      } else { // 保存配置时校验输出列是否重复
        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].checked) {
            const disColumnName = this.items[i].disColumnName
            const curIndex = vili_column.findIndex(item => item === disColumnName)
            if (curIndex > 0) {
              verify = false
              message = `第${curIndex + 1}行与第${i + 1}行的输出字段重复！请修改`
            }
          }
          vili_column.push(this.items[i].disColumnName)
        }
      }
      if (!verify) {
        this.$message({ type: 'info', message: message })
      }
      return verify
    },
    outputVerify() {
      return this.vilidata_simple()
    }
  }
}
</script>

<style scoped type="text/css">
    td>.form-group{
        margin-bottom: 0;
    }
    .table > tbody > tr > td{
        font-size: 13px;
        color: #4B4B4B;
    }
    .table > thead > tr > th {
        background-color: #5886B2;
        color: #ECF0F5;
    }
</style>
