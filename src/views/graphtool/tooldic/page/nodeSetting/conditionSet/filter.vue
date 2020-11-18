<template>
  <div class="layui-col-md12" style="padding: 0px 7.5px">
    <div class="layui-card">
      <div class="layui-card-header" style="line-height: 42px;vertical-align:middle;">
        <div class="filter_cell_header">
          <span id="pre_node" style="color:red;" />
        </div>
      </div>
      <div class="layui-card-header" style="line-height: 42px;vertical-align:middle;">
        <div class="filter_cell_header">
          <span>筛选字段： </span>
          <select id="select_colms" style="width: 150px;" class="selectpicker" data-live-search="true">
            <option value="">请选择</option>
          </select>
        </div>
        <div class="filter_cell_header" style="display:flex;justify-content:center;align-items:center;">
          <input id="blank_space" type="checkbox">&nbsp;是否去除数据中的空格
        </div>
      </div>
      <div class="layui-card-header" style="line-height: 42px;vertical-align:middle;">
        <div class="filter_cell_header">
          <span>条件 : </span>
          <select id="select_cz" class="selectpicker" @change="selectCzChange">
            <option value="">请选择</option>
            <option value="=">等于</option>
            <option value="!=">不等于</option>
            <option value=">">大于</option>
            <option value=">=">大于等于</option>
            <option value="<">小于</option>
            <option value="<=">小于等于</option>
            <option value="like_star">开头是</option>
            <option value="like_end">结尾是</option>
            <option value="like_all">包含</option>
            <option value="not_like_all">不包含</option>
            <option value="in">包含多个值</option>
          </select>
        </div>
        <div class="filter_cell_header" style="display:flex;justify-content:center;align-items:center;">
          <span>筛选对象 ： </span>
          <select id="compareObj" class="selectpicker" @change="compareObjChange">
            <option value="value">值</option>
            <option value="column">字段</option>
          </select>
          <input id="conn_value" class="form-control" style="width: auto;" type="text">
          <div id="compareColumn" style="display:none;">
            <select id="compareColumnSel" class="selectpicker" data-live-search="true">
              <option value="">请选择</option>
            </select>
          </div>
          <span id="moreVal" style="display:none;color:red;margin-left:10px;">多个值请用英文逗号（“,”）隔开</span>
        </div>
      </div>
      <div class="layui-card-header" style="line-height: 42px;vertical-align:middle;">
        <div class="filter_cell_header" style="display:flex;justify-content:center;align-items:center;">
          <input id="quotes" type="checkbox" checked disabled>&nbsp;是否带引号（<span style="color:red;">筛选值在比较数值大小时不能带引号</span>）&nbsp;
        </div>
        <div id="filter_cell_div" class="filter_cell_header" style="display:flex;justify-content:center;align-items:center;">
          <span>[&nbsp;</span>
          <input id="radio_and" type="radio" name="filter_conn_type" value="and" checked="checked">&nbsp;与&nbsp;
          <input id="radio_or" type="radio" name="filter_conn_type" value="or">&nbsp;或&nbsp;
          <span>&nbsp;]</span>
        </div>
      </div>
      <div class="layui-card-body" style="height: 320px">
        <div class="filter_cell_header filter_cell_centent">
          <ul id="filterZtree" class="ztree" />
        </div>
        <div class="filter_cell_header" style="width: 10%;height: 100%">
          <div><button class="layui-btn hover-btn button-cz" style="margin-top: 40px;" @click="filter_ztree('add')">新增条件</button></div>
          <div><button class="layui-btn hover-btn button-cz" style="margin-top: 8px;" @click="filter_ztree('edit')">修改条件</button> </div>
          <div><button class="layui-btn hover-btn button-cz"style="margin-top: 8px;" title="按住Ctrl键对左侧节点进行多选后可批量删除" @click="filter_ztree('del')">删除条件</button></div>
          <div><button class="layui-btn hover-btn button-cz" style="margin-top: 8px;" title="按住Ctrl键对左侧节点进行多选后用括号合并条件" @click="filter_ztree('addbrack')">合并条件</button></div>
          <div><button class="layui-btn hover-btn button-cz" style="margin-top: 8px;" @click="filter_ztree('delbrack')">拆分条件</button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
var nodeData, columnsInfoPre, zTreeObj_Filter
export default {
  name: 'FilterSet',
  mounted() {
    this.init()
    window.inputVerify = this.inputVerify
    window.saveSetting = this.saveSetting
  },
  methods: {
    init() {
      const graph = this.$parent.graph
      nodeData = graph.nodeData[graph.curCell.id]
      columnsInfoPre = this.$parent.columnsInfoPre
      const parentIds = nodeData.parentIds
      const isSet = nodeData.isSet// 判断当前节点是否已经设置
      var parent_node = graph.nodeData[parentIds[0]] // one parent
      $('#pre_node').text('【上级节点名称：' + parent_node.nodeInfo.nodeName + '】')
      createFilterSelColoms()
      if (isSet) {
        zTreeObj_Filter = $.fn.zTree.init($('#filterZtree'), settingFilter, nodeData.setting.nodes)
      } else {
        zTreeObj_Filter = $.fn.zTree.init($('#filterZtree'), settingFilter, [])
      }
    },
    selectCzChange() {
      const val = $('#select_cz').val()
      switch (val) {
        case 'in':
          $('#moreVal').show()
          $('#quotes').icheck('disabled')
          $('#quotes').icheck('checked')
          $('#compareObj').selectpicker('val', 'value')
          $('#compareObj').prop('disabled', true)
          $('#compareObj').selectpicker('refresh')
          $('#conn_value').show()
          $('#compareColumn').hide()
          break
        case 'like_star':
        case 'like_end':
        case 'like_all':
        case 'not_like_all':
          $('#moreVal').hide()
          $('#quotes').icheck('checked')
          $('#quotes').icheck('disabled')
          $('#compareObj').selectpicker('val', 'value')
          $('#compareObj').prop('disabled', true)
          $('#compareObj').selectpicker('refresh')
          $('#conn_value').show()
          $('#compareColumn').hide()
          break
        case '=':
        case '!=':
          $('#moreVal').hide()
          $('#compareObj').prop('disabled', false)
          $('#compareObj').selectpicker('refresh')
          var compareObj = $('#compareObj').val()
          if (compareObj === 'value') {
            $('#quotes').icheck('checked')
            $('#quotes').icheck('enabled')
          } else {
            $('#quotes').icheck('unchecked')
            $('#quotes').icheck('disabled')
          }
          break
        case '>':
        case '>=':
        case '<':
        case '<=':
          $('#moreVal').hide()
          var compareObj = $('#compareObj').val()
          $('#quotes').icheck('unchecked')
          if (compareObj === 'value') {
            $('#quotes').icheck('enabled')
          } else {
            $('#quotes').icheck('disabled')
          }
          $('#compareObj').prop('disabled', false)
          $('#compareObj').selectpicker('refresh')
          break
      }
    },
    compareObjChange() {
      const val = $('#compareObj').val()
      if (val === 'value') {
        $('#conn_value').show()
        $('#compareColumn').hide()
        var select_cz = $('#select_cz').val()
        $('#select_cz').selectpicker('val', select_cz).trigger('change')
      } else {
        $('#conn_value').hide()
        $('#compareColumn').show()
        $('#compareColumnSel').selectpicker('val', '')
        $('#quotes').icheck('unchecked')
        $('#quotes').icheck('disabled')
      }
    },
    /**
             * 	保存setting
             */
    saveSetting() {
      var nodes = zTreeObj_Filter.getNodes()
      nodeData.isSet = true
      nodeData.setting.nodes = nodes
    },
    // 页面输入项的校验(或空配置校验)
    inputVerify() {
      var nodes = zTreeObj_Filter.getNodes()
      if (typeof nodes === 'undefined' || (typeof nodes !== 'undefined' && nodes.length === 0)) {
        alertMsg('提示', '未设置筛选条件！', 'info')
        return false
      }
      return true
    },
    /**
             * 	过滤树节点操作
             * @param type 操作类型（新增条件、修改条件、删除条件）
             */
    filter_ztree(type) {
      var select_colms = $('#select_colms').val()// 字段
      var select_cz = $('#select_cz').val()// 操作类型
      var conn_value = $('#conn_value').val()// 值
      var filter_conn_type = $("input[name='filter_conn_type']:checked").val()
      var select_name = $('#select_cz option:selected').html()
      var quotes = $('#quotes').prop('checked')// 是否带引号
      var blank_space = $('#blank_space').prop('checked')// 是否去除空格
      var nodesAll = zTreeObj_Filter.getNodes()// 如果为第一个节点 条件不加 and或者or
      var compareObj = $('#compareObj').val()// 筛选对象
      var compareColumnSel = $('#compareColumnSel').val()// 筛选对象的列名称
      if (typeof nodesAll === 'undefined') {
        nodesAll = []
      }
      var showFilterConnType = false
      var sele_nodes = zTreeObj_Filter.getSelectedNodes()
      var node
      switch (type) {
        case 'add':
          // 获取左侧树节点加载右侧树节点  这里只操作一张表的字段
          if (select_colms === '') {
            alertMsg('提示', '请选择筛选字段', 'info')
            return
          }
          if (select_cz === '') {
            alertMsg('提示', '请选择筛选条件', 'info')
            return
          }
          if (select_cz !== '=' && conn_value === '' && compareObj === 'value') {
            alertMsg('提示', '【' + select_name + '】条件的筛选值不能为空', 'info')
            return
          }
          if (compareObj === 'column' && $.trim(compareColumnSel) === '') {
            alertMsg('提示', '【' + select_name + '】条件的筛选值不能为空', 'info')
            return
          }
          if (nodesAll.length > 0) {
            showFilterConnType = true
          }
          node = switch_cz_f(select_cz, select_colms, conn_value, filter_conn_type, showFilterConnType, quotes, blank_space, compareObj, compareColumnSel)
          zTreeObj_Filter.addNodes(null, node)
          break
        case 'edit':
          if (select_colms === '') {
            alertMsg('提示', '请选择筛选字段', 'info')
            return
          }
          if (select_cz === '') {
            alertMsg('提示', '请选择筛选条件', 'info')
            return
          }
          if (select_cz !== '=' && conn_value === '' && compareObj === 'value') {
            alertMsg('提示', '【' + select_name + '】条件的筛选值不能为空', 'info')
            return
          }
          if (compareObj === 'column' && $.trim(compareColumnSel) === '') {
            alertMsg('提示', '【' + select_name + '】条件的筛选值不能为空', 'info')
            return
          }
          if (sele_nodes.length > 1) {
            alertMsg('提示', '只能修改一个过滤条件', 'info')
            return
          }
          if (sele_nodes[0].children && sele_nodes[0].children.length !== 0) {
            alertMsg('提示', '不能修改合并条件', 'info')
            return
          }
          if (sele_nodes.length !== 1) {
            alertMsg('提示', '请选择一个待修改的筛选条件', 'info')
            return
          }
          showFilterConnType = !!((sele_nodes[0].realInfo && sele_nodes[0].realInfo.showFilterConnType))
          node = switch_cz_f(select_cz, select_colms, conn_value, filter_conn_type, showFilterConnType, quotes, blank_space, compareObj, compareColumnSel)
          sele_nodes[0].name = node.name
          sele_nodes[0].realInfo = node.realInfo
          zTreeObj_Filter.updateNode(sele_nodes[0])
          if (sele_nodes[0].pId != null && typeof sele_nodes[0].pId !== 'undefined') {
            var parentNodes = zTreeObj_Filter.getNodesByParam('id', sele_nodes[0].pId, null)
            if (parentNodes && parentNodes.length > 0) {
              var curChildrenNodes = parentNodes[0].children
              var curName = ''
              $(parentNodes[0].children).each(function(i) {
                curName += ' ' + this.name
              })
              parentNodes[0].name = curName
              zTreeObj_Filter.updateNode(parentNodes[0])
            }
          }
          break
        case 'del':
          if (sele_nodes.length === 0) {
            alertMsg('提示', '请选择待删除的筛选条件', 'info')
            return
          }
          var isChildNode = false
          $(sele_nodes).each(function(index) {
            if (this.pId != null && typeof this.pId !== 'undefined') {
              isChildNode = true
            }
          })
          if (isChildNode) {
            alertMsg('提示', '合并条件的子条件不可删除', 'info')
            return
          }
          $(sele_nodes).each(function(index) {
            zTreeObj_Filter.removeNode(this)
          })
          if (nodesAll && nodesAll.length > 0) { // 变更第一个条件的连接条件
            var filter_conn_type_ = ''
            if (nodesAll[0].realInfo && nodesAll[0].realInfo.showFilterConnType) { // 如果第一个条件显示了连接条件，则应隐藏
              filter_conn_type_ = nodesAll[0].realInfo.filter_conn_type
              nodesAll[0].name = nodesAll[0].name.replace(filter_conn_type_ + ' ', '')// 去掉连接条件（只替换第一次出现的位置，不能全替换）
              nodesAll[0].realInfo.showFilterConnType = false
              zTreeObj_Filter.updateNode(nodesAll[0])
              var childrenNodes = nodesAll[0].children// 找子节点
              if (typeof childrenNodes !== 'undefined' && childrenNodes.length > 0) {
                filter_conn_type_ = childrenNodes[0].realInfo.filter_conn_type
                childrenNodes[0].name = childrenNodes[0].name.replace(filter_conn_type_ + ' ', '')// 去掉连接条件（只替换第一次出现的位置，不能全替换）
                childrenNodes[0].realInfo.showFilterConnType = false
                zTreeObj_Filter.updateNode(childrenNodes[0])
              }
            }
          }
          break
        case 'addbrack':
          var sumName = ''
          if (sele_nodes.length > 0 && sele_nodes[0].pId != null) {
            alertMsg('提示', '该条件不能被合并', 'info')
            return
          }
          if (sele_nodes.length < 2) {
            alertMsg('提示', '请至少选择两个条件', 'info')
            return
          }
          sele_nodes = sortNode(sele_nodes)// 对选择的节点按照节点显示顺序进行排序
          var firstNode = false// 所选合并条件中是否包含第一个不带关联关系的连接条件
          if (sele_nodes[0].realInfo.showFilterConnType) { // 如果显示连接条件
            sumName = sele_nodes[0].realInfo.filter_conn_type + ' ('
          } else {
            sumName = '('
          }
          var ind = sele_nodes[0].getIndex()// 第一个合并条件所在位置
          $(sele_nodes).each(function(index) {
            if (index === 0) {
              if (this.realInfo.showFilterConnType) { // 如果显示连接条件
                sumName += this.name.split(this.realInfo.filter_conn_type + ' ')[1]
              } else {
                sumName += this.name
                firstNode = true
              }
            } else {
              sumName += ' ' + this.name
            }
            zTreeObj_Filter.removeNode(this)
          })
          sumName += ')'
          node = {
            id: new UUIDGenerator().id,
            name: sumName,
            children: sele_nodes,
            realInfo: {// 继承第一个合并条件的部分属性值
              filter_conn_type: sele_nodes[0].realInfo.filter_conn_type,
              showFilterConnType: sele_nodes[0].realInfo.showFilterConnType
            }
          }
          if (firstNode) {
            zTreeObj_Filter.addNodes(null, 0, node)
          } else {
            zTreeObj_Filter.addNodes(null, ind, node)
          }
          break
        case 'delbrack':
          if (sele_nodes.length > 1) {
            alertMsg('提示', '只能拆分一个条件', 'info')
            return
          }
          var childrens = sele_nodes[0]['children']
          if (childrens.length === 0) {
            alertMsg('提示', '该条件不是合并条件，不能被拆分', 'info')
            return
          }
          $(childrens).each(function(index) { // 将子节点上移成为父级节点同级节点
            if (this.realInfo.showFilterConnType) { // 如果显示连接条件
              zTreeObj_Filter.addNodes(null, this)
            } else {
              zTreeObj_Filter.addNodes(null, 0, this)
            }
          })
          zTreeObj_Filter.removeNode(sele_nodes[0]) // 删除当前节点
          break
      }
    }
  }
}
var settingFilter = {
  view: {
    selectedMulti: true, // 可以多选
    showLine: false
  },
  data: {
    simpleData: {// 简单数据模式
      enable: true,
      idKey: 'id',
      pIdKey: 'pId',
      rootPId: null
    }
  },
  edit: {
    enable: true,
    drag: {
      isCopy: false,
      inner: false,
      prev: true,
      next: true
    },
    showRemoveBtn: false,
    showRenameBtn: false
  },
  callback: {
    beforeDrag: function(treeId, treeNodes) {
      var rootNode = true
      for (var i = 0; i < treeNodes.length; i++) {
        if (treeNodes[i].pId != null && treeNodes[i].pId !== '' && typeof treeNodes[i].pId !== 'undefined') { // 是合并条件的子条件
          rootNode = false
          break
        }
      }
      return rootNode
    },
    beforeDrop: function(treeId, treeNodes, targetNode, moveType) { // 只允许同级之间移动
      var isSameLevel = true
      var targetLevel = targetNode.level
      for (var i = 0; i < treeNodes.length; i++) {
        if (treeNodes[i].level !== targetLevel) { // 非同级移动
          isSameLevel = false
          break
        }
      }
      return isSameLevel
    },
    onDrop: function(event, treeId, treeNodes, targetNode, moveType) {
      // 先对选择的节点进行排序
      var nodes = zTreeObj_Filter.getNodes()
      for (var i = 0; i < nodes.length; i++) {
        var conn_type = nodes[i].realInfo.filter_conn_type
        if (i === 0) {
          if (nodes[i].realInfo.showFilterConnType) {
            nodes[i].realInfo.showFilterConnType = false
            nodes[i].name = nodes[i].name.substring(conn_type.length + 1, nodes[i].name.length)
            zTreeObj_Filter.updateNode(nodes[i])
          }
        } else {
          if (!nodes[i].realInfo.showFilterConnType) {
            nodes[i].realInfo.showFilterConnType = true
            nodes[i].name = conn_type + ' ' + nodes[i].name
            zTreeObj_Filter.updateNode(nodes[i])
          }
        }
        updateChildrenNode(nodes[i], nodes[i].realInfo.showFilterConnType)
      }
    },
    onClick: function(event, treeId, treeNode) {
      if (treeNode.realInfo) {
        $('#select_colms').selectpicker('val', treeNode.realInfo.select_colms)// 反显列
        $('#select_cz').selectpicker('val', treeNode.realInfo.select_cz)// 反显操作类型
        var compareObj = typeof treeNode.realInfo.compareObj === 'undefined' ? 'value' : treeNode.realInfo.compareObj
        $('#compareObj').selectpicker('val', compareObj).trigger('change')// 反显筛选对象
        $('#compareColumnSel').selectpicker('val', treeNode.realInfo.compareColumnSel)// 反显筛选对象
        $('#conn_value').val(treeNode.realInfo.conn_value)// 反显值
        $('#radio_and').icheck('unchecked')
        $('#radio_or').icheck('unchecked')
        if (treeNode.realInfo.filter_conn_type === 'and') {
          $('#radio_and').icheck('checked')
        } else {
          $('#radio_or').icheck('checked')
        }
        if (treeNode.realInfo.quotes) {
          $('#quotes').icheck('checked')
        } else {
          $('#quotes').icheck('unchecked')
        }
        if (treeNode.realInfo.blank_space) {
          $('#blank_space').icheck('checked')
        } else {
          $('#blank_space').icheck('unchecked')
        }
      }
    }
  }
}

/**
     * 对选择的节点按照节点显示顺序进行排序（直接选择排序）
     * @param nodeArr 待排序的节点
     * */
function sortNode(nodeArr) {
  var index = 0
  for (var i = 1; i < nodeArr.length; i++) { // 第一层是控制循环的次数
    index = 0// 每次进入循环需使用数组的第一个值进行比较
    for (var j = 0; j <= nodeArr.length - i; j++) { // 第二次循环是每次循环需比较的次数
      if (parseInt(nodeArr[j].getIndex()) > parseInt(nodeArr[index].getIndex())) {
        index = j
      }
    }
    var tempObj = nodeArr[nodeArr.length - i]// 将此次要交换的值存储到临时变量中（较小的值）
    nodeArr[nodeArr.length - i] = nodeArr[index]// 将较大的值存储到之前存储较小值的位置
    nodeArr[index] = tempObj// 将较小的值存储在原来存储较大值的位置
  }
  return nodeArr
}

/**
     *  递归更新当前节点的子孙节点中第一个的条件的关联字符的显示情况
     *  @param curNode 当前节点对象
     *  @param showFilterConnType 是否需要显示连接条件
     * */
function updateChildrenNode(curNode, showFilterConnType) {
  var children = curNode.children
  if (children && children.length > 0) {
    children = sortNode(children)// 先排个序
    var conn_type = children[0].realInfo.filter_conn_type
    if (children[0].realInfo.showFilterConnType && !showFilterConnType) {
      children[0].realInfo.showFilterConnType = false
      children[0].name = children[0].name.substring(conn_type.length + 1, children[0].name.length)
      zTreeObj_Filter.updateNode(children[0])
    }
    if (!children[0].realInfo.showFilterConnType && showFilterConnType) {
      children[0].realInfo.showFilterConnType = true
      children[0].name = conn_type + ' ' + children[0].name
      zTreeObj_Filter.updateNode(children[0])
    }
    updateChildrenNode(children[0], showFilterConnType)
  }
}

/**
     *	创建过滤字段select
     */
function createFilterSelColoms() {
  var html = ''
  $(columnsInfoPre).each(function() { // 过滤字段
    html += "<option value='" + this.newColumnName + "'>" + this.newColumnName + '（' + this.columnType + '）</option>'
  })
  $('#select_colms').append(html)
  $('#select_colms').selectpicker('refresh')
  $('#compareColumnSel').append(html)
  $('#compareColumnSel').selectpicker('refresh')
}

/**
     * 生成条件节点
     * @param select_cz 条件类型
     * @param select_colms 选择的字段
     * @param conn_value 值
     * @param filter_conn_type 与或的类型
     * @param showFilterConnType 是否拼接与或条件（第一个条件不拼接）
     * @param quotes 筛选值是否带引号（数值比较时不能带）
     * @param blank_space 筛选字段是否去除空格
     * @param compareObj 筛选对象
     * @param compareColumnSel 筛选对象的列名称
     **/
function switch_cz_f(select_cz, select_colms, conn_value, filter_conn_type, showFilterConnType, quotes, blank_space, compareObj, compareColumnSel) {
  var node = {}; var newSelect_colms = select_colms
  if (blank_space) {
    newSelect_colms = 'TRIM(' + newSelect_colms + ')'
  }
  var nameStr = newSelect_colms
  if (showFilterConnType) {
    nameStr = filter_conn_type + ' ' + newSelect_colms
  }
  if (compareObj === 'value' || typeof compareObj === 'undefined') {
    switch (select_cz) {
      case 'like_star':
        node.name = nameStr + "  like '" + conn_value + "%'"
        break
      case 'like_end':
        node.name = nameStr + "  like '%" + conn_value + "'"
        break
      case 'like_all':
        node.name = nameStr + " like '%" + conn_value + "%'"
        break
      case 'not_like_all':
        node.name = nameStr + " not like '%" + conn_value + "%'"
        break
      case 'in':
        var arrVal = conn_value.split(',')
        var str = ''
        for (var i = 0; i < arrVal.length; i++) {
          var val = "'" + arrVal[i] + "'"
          str = str === '' ? val : str + ',' + val
        }
        node.name = nameStr + ' in (' + str + ')'
        break
      case '=':
      case '!=':
        node.name = nameStr + ' ' + select_cz + " '" + conn_value + "'"
        break
      case '>':
      case '>=':
      case '<':
      case '<=':
        if (quotes) { // 值带引号
          node.name = nameStr + ' ' + select_cz + " '" + conn_value + "'"
        } else {
          node.name = nameStr + ' ' + select_cz + ' ' + conn_value + ''
        }
        break
    }
    if (conn_value === '') {
      var str = '(' + newSelect_colms + "='' or " + newSelect_colms + ' is null' + ')'
      if (showFilterConnType) {
        str = filter_conn_type + ' ' + str
      }
      node.name = str
    }
  } else {
    node.name = nameStr + ' ' + select_cz + ' ' + compareColumnSel
  }
  node.id = new UUIDGenerator().id
  node.realInfo = {
    select_colms: select_colms,
    select_cz: select_cz,
    conn_value: conn_value,
    filter_conn_type: filter_conn_type,
    showFilterConnType: showFilterConnType,
    quotes: quotes,
    blank_space: blank_space,
    compareObj: compareObj,
    compareColumnSel: compareColumnSel
  }
  return node
}

</script>

<style type="text/css">
    .filter_cell_header{
        float: left;
        margin-left: 20px;
    }
    .filter_cell_centent{
        height: 310px;
        width: 47.5%;
        overflow-y: auto;
        border: 1px solid lightgrey;
    }
    #dragDiv {
        width:100%;
        height:90%;
        overflow: hidden;
        color: green;
        border: 1px solid #DDDAD6;
        background-color: #ffffff;
        margin-top:10px;
    }
    .divEditorBtn {
        border: 1px solid #ADADAD;
        background-color: #E1E1E1;
        margin: 2px;
        padding: 0 5px;
        height: 24px;
        display: inline-block;
    }

    .layui-table thead tr{
        background: #5887B3;
        color: #fff;
    }
    .layui-btn{
        background: #4476A7;
    }

    .layui-laypage .layui-laypage-curr .layui-laypage-em{
        background: #5887B3;
    }
    .concet_foot span:hover{
        color: #F5A623;
    }
    .concet_foot .active{
        color: #fff;
        background: #F5A623;
    }
    .concet_foot .active:hover{
        color: #fff;
    }
    .layui-form-checkbox[lay-skin="primary"]:hover i{
    }
    .layui-table tbody tr:hover,.layui-table-hover{
        background: #e3edf7 !important;
    }
    .layui-card{
        margin-top: 5px;
        margin-bottom: 5px;
    }
    .button-cz {
        cursor: pointer;
        margin-left: 6px;
    }
</style>
