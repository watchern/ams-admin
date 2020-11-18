<template>
  <div>
    <ul id="myTab" class="nav nav-tabs">
      <li>
        <a href="#basic" data-toggle="tab">基本信息</a>
      </li>
      <li class="active">
        <a href="#filterSet" data-toggle="tab">条件设置</a>
      </li>
      <li>
        <a href="#outputColumn" data-toggle="tab">输出字段设置</a>
      </li>
    </ul>
    <div id="myTabContent" class="tab-content">
      <div id="basic" class="tab-pane fade">
        <Basic />
      </div>
      <div id="filterSet" class="tab-pane fade in active">
        <div class="col-sm-12" style="padding: 20px;">
          <div id="accordion" class="panel-group">
            <div class="panel panel-default">
              <div class="panel-heading">
                <h4 class="panel-title">
                  <a data-toggle="collapse" data-parent="#accordion" href="#collapse">分组设置</a>
                </h4>
              </div>
              <div id="collapse" class="panel-collapse collapse in">
                <div class="panel-body">
                  <div id="group" class="demo-transfer" />
                </div>
              </div>
            </div>
          </div>
          <div id="accordion1" class="panel-group">
            <div class="panel panel-default">
              <div class="panel-heading">
                <h4 class="panel-title">
                  <a data-toggle="collapse" data-parent="#accordion1" href="#collapse1">汇总设置</a>
                </h4>
              </div>
              <div id="collapse1" class="panel-collapse collapse in">
                <div class="panel-body">
                  <table id="countTable" class="table table-striped" style="width:755px;">
                    <thead>
                      <tr>
                        <th width="350px">待汇总字段</th>
                        <th width="200px">汇总方式</th>
                        <th width="200px">操作</th>
                      </tr>
                    </thead>
                    <tbody id="row_add">
                      <tr class="countTr" :data-trNum="1">
                        <td><div id="searchName1" class="xm-select-demo searchName" /></td>
                        <td><div id="searchType1" class="xm-select-demo searchType" /></td>
                        <td align="center">
                          <button type="button" class="btn btn-primary" @click="addCountTr">添加行</button>
                        </td>
                      </tr>
                      <tr v-for="(item,index) in items" :key="item.id" class="countTr">
                        <td><div :id="`searchName${(item.id)}`" class="xm-select-demo searchName" /></td>
                        <td><div :id="`searchType${(item.id)}`" class="xm-select-demo searchType" /></td>
                        <td align="center"><button type="button" class="btn btn-primary" @click="delCountTr(index,$event)">删除行</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="outputColumn" class="tab-pane fade">
        <div style="width: 98%;margin: 4px 1%">
          <div style="color: red;">
            <p>注：（1）如果修改了【输出字段名称】且存在已配置过或执行过的后续节点，则后续节点关于该字段的配置信息会失效</p>
            <p style="text-indent: 2em">（2）如果继续使用后续节点，则需重新配置相关节点</p>
            <p style="text-indent: 2em">（3）如果修改了【输出字段名称】后并执行了当前节点，则后续节点的执行结果会发生变化</p>
            <p style="text-indent: 2em">（4）支持通过拖拽更改输出字段的顺序，同时在结果集中同步展示</p>
          </div>
          <table id="column_config" class="table table-bordered">
            <thead>
              <tr>
                <th width="30%" class="text-center">上一节点名称</th>
                <th width="25%" class="text-center">字段名称</th>
                <th width="30%" class="text-center">输出字段名称</th>
                <th width="15%" class="text-center">是否为输出字段
                  <input id="sel_all" type="checkbox" class="form-control">
                </th>
              </tr>
            </thead>
            <tbody />
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Basic from '@/views/graphtool/tooldic/page/nodeSetting/basic.vue'
import * as groupCountJs from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/groupCount/js/groupCount'
export default {
  name: 'GroupCountSet',
  components: { Basic },
  data() {
    return {
      items: [], // 存放霍总配置的行号
      nodeData: null,
      graph: parent.graph,
      columnsInfoPre: [], // 前置节点的输出列信息集合（只用于有且只有一个前置节点的节点）
      countTrNum: 1
    }
  },
  mounted() {
    this.nodeData = this.graph.nodeData[this.graph.curCell.id]
    groupCountJs.sendVueObj(this)
    groupCountJs.init()
  },
  methods: {
    addCountTr() {
      groupCountJs.addCountTr()
    },
    delCountTr(index, event) {
      const el = event.currentTarget
      groupCountJs.delCountTr(index, el)
    }
  }
}

$('#myTabContent').css({ 'overflow-y': 'auto', 'height': function() {
  return ($(document).height() - 50) + 'px'
} })
$('#group').css({ 'margin-left': function() {
  return ($('#collapse').width() - 760) / 2 + 'px'
}, 'padding': '10px 0' })
$('#countTable').css({ 'margin-left': function() {
  return ($('#collapse').width() - 760) / 2 + 'px'
}, 'margin-top': '10px', 'margin-bottom': '10px' })

// 保存节点信息
function saveNodeInfo() {
  return groupCountJs.saveNodeInfo()
}

// 节点输入项的校验(或空配置校验)
function inputVerify() {
  return groupCountJs.inputVerify()
}

// 全选点击事件
$('#sel_all').click(function() {
  if ($(this).prop('checked')) {
    $('.ckbox').addClass('checked')
  } else {
    $('.ckbox').removeClass('checked')
  }
})
</script>

<style scoped>
    .ui-widget.ui-widget-content{
        border-color: #e6e6e6;
    }
    .layui-transfer-header{
        padding-top: 10px;
    }
    #countTable{
        margin:0 auto;
        float: left;
        width: 100%;
    }
    #countTable>thead>tr>th{
        border:1px solid #ddd;
    }
    #countTable>tbody>tr>td{
        border:1px solid #ddd;
    }
</style>
