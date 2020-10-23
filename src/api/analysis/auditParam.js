import request from '@/utils/request'
import {
  getDictSonList
} from "@/utils/index"
const analysisUrl = '/analysis'
/**
 * 参数树对象
 */
var paramZtree

var setJsonSelectValueData = {}

var contextPath = "/AuditAnalysis"

var initivalInputtype = ''

var initivalDatatype = '';

var tabsigns = 0;


/**
 * 初始化图标
 */
export function initIcon() {
  $('#paramSearchImg').attr('src', '../images/ico/search_blue.png')
}

/**
 * 初始化参数树
 */
export function initParamTree() {
  var paramSetting = {
    data: {
      key: {
        checked: 'isChecked',
        name: 'name',
        title: 'displayName'
      },
      // 设置数据格式
      simpleData: {
        enable: true,
        idKey: 'id',
        pIdKey: 'pid'
      }
    },
    check: {
      enable: false,
      chkStyle: 'radio',
      radioType: 'all'
    },
    view: {
      selectedMulti: false //设置是否允许同时选中多个节点
    },
    callback: {
      onRightClick: function (event, treeId, treeNode) {
        console.log(treeNode)
        if (!treeNode) {
          return false
        }
        paramZtree.selectNode(treeNode)
        // 参数、系统参数、没有权限的公共参数、模型私有参数不能右键操作
        if (treeNode.type === 'publicParam') {
          return
        }
        if (treeNode.type === 'paramNode') {
          showRMenu('node', 'paramTree', 'paramMenu', event.clientX, event.clientY)
        } else {
          if (treeNode.level == 1) {
            showRMenu('node', 'paramTree', 'paramFolderMenu2', event.clientX, event.clientY)
          } else {
            showRMenu('node', 'paramTree', 'paramFolderMenu1', event.clientX, event.clientY)
          }
        }
      }
    },
    edit: {
      enable: true,
      showRenameBtn: false,
      showRemoveBtn: false,
      drag: {
        prev: false,
        next: false,
        inner: false
      }
    }
  }
  request({
    baseURL: analysisUrl,
    url: '/ParamFolderController/findParamFoldeTree',
    method: 'get'
  }).then(result => {
    console.log(result.data)
    paramZtree = $.fn.zTree.init($('#paramTree'), paramSetting, result.data)
  })
}

/**
 * 参数树搜索
 */
export function paramTreeSearch() {
  var searchText = $('#paramSearch').val()
  var views = paramZtree.setting.view
  var nodeList = paramZtree.getNodesByParamFuzzy('name', searchText)
  isHiddenNodes(false, paramZtree)
  if (searchText === '') {
    // 当输入结果为空时，使树节点全部收回，恢复成初始状态
    paramZtree.expandAll(false)
    paramZtree.expandNode(paramZtree.getNodeByParam('pid', null, null), true)
  }
  views['fontCss'] = setFontCss //给view的颜色设置成黑色
  treeObj.updateNode()
  // views['fontCss'] = resetFontCss
  // if (searchText !== '') {
  //   var nodes = paramZtree.getNodesByParam('type', 'paramNode')
  //   var allNodeList = paramZtree.transformToArray(nodes)
  //   updateNodes(allNodeList, false, paramZtree)  //设置highlight为false
  //   var nodeList = paramZtree.getNodesByParamFuzzy('name', searchText)
  //   expandNodes(nodeList, paramZtree)
  //   if (nodeList && nodeList.length > 0) {
  //     updateNodes(nodeList, true, paramZtree)
  //     views['fontCss'] = setFontCss
  //     hiddenNodes(nodeList, paramZtree)
  //   }
  // } else {
  //   views['fontCss'] = resetFontCss
  //   paramZtree.refresh()
  // }
}

/**
 * 整个界面点击事件
 * @param event 时间
 */
function onBodyMouseDown(event) {
  if (!(event.target.id === event.data.menuId || $(event.target).parents('#' + event.data.menuId).length > 0)) {
    $('#' + event.data.menuId).css({
      'visibility': 'hidden'
    })
  }
}

/**
 * 节点右键事件
 * @param type 类型
 * @param containerId 点击编号
 * @param menuId 菜单编号
 * @param x x坐标
 * @param y y坐标
 */
function showRMenu(type, containerId, menuId, x, y) {
  var height = $('#' + containerId).height()
  var offsetTop = $('#' + containerId).offset().top
  var h_ = height - (event.clientY - offsetTop)
  var w_ = $('#' + containerId).width() - event.clientX
  if (h_ < $('#' + menuId).height()) {
    y = y - $('#' + menuId).height()
  }
  if (w_ < $('#' + menuId).width()) {
    x = $('#' + containerId).width() - $('#' + menuId).width()
  }
  $('#' + menuId + ' ul').show()
  $('#' + menuId).css({
    'top': y + 'px',
    'left': x + 'px',
    'visibility': 'visible'
  })
  $('body').bind('mousedown', {
    'menuId': menuId
  }, onBodyMouseDown)
}

/**
 * 对指定树节点隐藏
 * @param flag true或false
 * @param treeObj 树对象
 */
function isHiddenNodes(flag, treeObj) {
  var allNodeList = treeObj.transformToArray(treeObj.getNodes())
  if (flag) {
    for (var i = 0; i < allNodeList.length; i++) {
      if (allNodeList[i].pid != null) { // 过滤掉最根节点
        treeObj.hideNode(allNodeList[i])
      }
    }
  } else {
    for (var i = 0; i < allNodeList.length; i++) {
      if (allNodeList[i].isHidden === true) {
        allNodeList[i].isHidden = false
        treeObj.updateNode(allNodeList[i])
      }
    }
  }
}

/**
 * 设置树节点样式
 * @param treeId 树编号
 * @param treeNode 树节点
 * @returns {{color: string, 'font-weight': string, 'font-size': string}|{color: string, 'font-weight': string}}
 */
function setFontCss(treeId, treeNode) {
  return (treeNode.highlight) ? {
    color: '#F00',
    'font-weight': 'bold',
    'font-size': '14px'
  } : {
    color: '#000',
    'font-weight': 'normal'
  }
}

/**
 * 修改树节点
 * @param nodeList 节点列表
 * @param highlight 隐藏
 * @param treeObj 树对象
 */
function updateNodes(nodeList, highlight, treeObj) {
  for (var i = 0; i < nodeList.length; i++) {
    nodeList[i].highlight = highlight
    treeObj.updateNode(nodeList[i])
  }
}

/**
 * 展开树节点
 * @param nodes 节点
 * @param treeObj 树对象
 */
function expandNodes(nodes, treeObj) {
  if (!nodes) {
    return
  }
  for (var i = 0, l = nodes.length; i < l; i++) {
    var pNode = nodes[i].getParentNode()
    treeObj.expandNode(pNode, true, false, false)
  }
}

/**
 * 隐藏节点
 * @param nodeList 节点列表
 * @param treeObj 树对象
 */
function hiddenNodes(nodeList, treeObj) {
  isHiddenNodes(true, treeObj)
  for (var i = 0; i < nodeList.length; i++) {
    nodeList[i].isHidden = false
    treeObj.updateNode(nodeList[i])
    var z = true
    var tmpnode = nodeList[i]
    while (z) {
      var pNode = tmpnode.getParentNode()
      if (pNode.pid != null) {
        if (pNode.isHidden) {
          pNode.isHidden = false
          pNode.open = true
          treeObj.updateNode(pNode)
        }
      } else {
        z = false
      }
      tmpnode = pNode
    }
  }
  treeObj.refresh()
}

/**
 * 重置树样式
 * @param treeId 树编号
 * @param treeNode 树节点
 * @returns {{color: string, 'font-weight': string}}
 */
function resetFontCss(treeId, treeNode) {
  return (!treeNode.highlight) ? {
    color: '#000',
    'font-weight': 'normal'
  } : {}
}

/**
 * 参数列表模糊查询
 * @param {*} data 分页对象，里面包含参数对象
 */
export function getListByAmmParam(data) {
  return request({
    baseURL: analysisUrl,
    url: '/paramController/listByAmmParam',
    method: 'post',
    data
  });
}

/**
 * 启用参数
 * @param {*} data 要启用的参数主键字符串，用逗号隔开
 */
export function updateEnabled(data) {
  return request({
    baseURL: analysisUrl,
    url: '/paramController/editenable/' + data,
    method: 'post'
  });
}
/**
 * 停用参数
 * @param {*} data 要停用的参数主键字符串，用逗号隔开
 */
export function updateDisenable(data) {
  return request({
    baseURL: analysisUrl,
    url: '/paramController/editDisable/' + data,
    method: 'post'
  });
}

/**
 * 删除参数
 * @param {*} data 要删除的参数主键字符串，用逗号隔开
 */
export function deleteParams(data) {
  return request({
    baseURL: analysisUrl,
    url: '/paramController/deleteParam/' + data,
    method: 'delete'
  });
}



function linkAll(inputTypeValue, dataType) {
  if (inputTypeValue != "") {
    if (inputTypeValue == "002001002003" && dataType == "002001003002") { //日期选择器
      $("#timeInterval").show();
      $("#formalType").hide();
      $("#alternateValue").hide();
      $("#dataLengthInterVal").hide();
      $("#paramTab>li:eq(1)").hide();
      $("#relParamSetting").hide();
    } else if (inputTypeValue == "002001002004") { //下拉列表
      $("#formalType").show();
      $("#timeInterval").hide();
      $("#alternateValue").show();
      $("#myTab").show();
      $("#treeTab").hide();
      $("#myTabContent").show();
      $("#SQLdtree").hide();
      $("#myTab>li").each(function (i, v) {
        if ($(this).hasClass("active")) {
          tabsigns = i;
        }
      });
      if (tabsigns == 1) {
        $("#SQLd").show();
        $("#paramTab>li:eq(1)").show();
        $("#relParamSetting").show();
      } else {
        $("#SQLd").hide();
        $("#paramTab>li:eq(1)").hide();
        $("#relParamSetting").hide();
      }
      $("#dataLengthInterVal").hide();
    } else if (inputTypeValue == "002001002002") { //下拉树
      tabsigns = 1;
      $("#formalType").show();
      $("#timeInterval").hide();
      $("#alternateValue").show();
      $("#treeTab").show();
      $("#myTab").hide();
      $("#myTabContent").hide();
      $("#SQLdtree").show();
      $("#SQLd").hide();
      $("#dataLengthInterVal").hide();
      $("#paramTab>li:eq(1)").show();
      $("#relParamSetting").show();
    } else { //文本
      $("#formalType").hide();
      $("#timeInterval").hide();
      $("#alternateValue").hide();
      $("#dataLengthInterVal").show();
      $("#paramTab>li:eq(1)").hide();
      $("#relParamSetting").hide();
    }
  }
}

//设置数据类型设置输入类型
var map_data_input = {
  "002001003001": { //数字
    type: [
      "002001002001", //文本
      "002001002004", //列表
      "002001002002" //树
    ]
  },
  "002001003003": {
    type: [
      "002001002001", //文本
      "002001002004", //列表
      "002001002002" //树
    ]
  },
  "002001003002": { //时间
    type: [
      "002001002003", //时间
    ]
  }
};
//设置输入类型设置数据类型
var map_input_data = {
  "002001002001": { //文本框
    type: [
      "002001003003", //文本
      "002001003001", //数字
    ]
  },
  "002001002004": { //列表
    type: [
      "002001003003", //文本
      "002001003001", //数字
    ]
  },
  "002001002002": { //树
    type: [
      "002001003003", //文本
      "002001003001", //数字
    ]
  },
  "002001002003": { //时间日期
    type: [
      // "tims",
      "002001003002" //日期时间
    ]
  }
};
