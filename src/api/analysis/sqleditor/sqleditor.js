import request from '@/utils/request'
import { compareSql } from '@/api/graphtool/apiJs/graphList'
const CodeMirror = require('@/components/ams-codemirror/lib/codemirror')
import store from '@/store'
const analysisUrl = '/analysis'
const dataUrl = '/data'
/**
 *
 * @type {boolean}
 */
var nowPick = false
/**
 * 当前鼠标所在位置，不可删除
 * @type {null}
 */
var cursor = null
/**
 * 本次改变内容是否是执行第一次粘贴操作
 * @type {boolean}
 */
var isFirstPaste = true
/**
 * 当前光标所在行从第0列到光标所在列之间的文本内容
 * @type {string}
 */
var checkSqlText = ''

/**
 * 数据表树对象
 */
var zTreeObj

/**
 * SQL编辑器
 */
var editorObj

/**
 * SQL函数树对象
 */
var sqlZtreeObj

/**
 * 参数树对象
 */
var paramZtree
/**
 * 标记树对象
 */
var bjZtreeObj
/**
 * 当前窗体路径
 * @type {string | null | string}
 */
var pathname = window.location.pathname
/**
 * 鼠标X轴位置
 */
var mouseX

/**
 * 鼠标Y轴位置
 */
var mouseY

/**
 * 参数图标路径
 * @type {string}
 */
var paramIconPath = require("@/styles/icons/param.png")
/**
 * 参数图标路径
 * @type {string}
 */
var paramPackageIconPath = require("@/components/ams-ztree/css/zTreeStyle/img/zTreezywjjc.png")
/**
 * 列图标路径
 * @type {string}
 */
var columnIconPath = require("@/styles/icons/column.png")

/**
 * 表图标路径
 * @type {string}
 */
var tableIconPath = require("@/styles/icons/table_1.png")
/**
 * 视图图标路径
 * @type {string}
 */
var viewIconPath = require("@/styles/icons/view.png")

/**
 * 函数图标路径
 */
var functionIconPath = require("@/styles/icons/function.png")
/**
 * 参数对象
 * @type {{}}
 */
var paramObj = {}

/**
 * 用来记录参数按钮（因反显时不能全部渲染参数的div元素，因此只能用变量记录）
 * @type {*[]}
 */
var paramDivArr = []
/**
 * 用来记录已经替换过的参数ID集合（不可去除）
 * @type {*[]}
 */
var paramIdDivArr = []

/**
 * 模型图表设置，如果模型设置了图表则该对象有值
 * @type {{}}
 */
var modelChartSetup = {}

/**
 * sql草稿对象
 * @type {{}}
 */
var sqlDraftObj
/**
 * 存储数据表
 */
var tableTreeData = []

/**
 * 记录sql编辑器是否被修改
 * @type {boolean}
 */
var isUpdate = false

/**
 * 是否第一次加载
 * @type {number}
 */
var isFirst = 0

let sqlEditorVue = null

export const sendSqlEditorVue = ((this_) => {
  sqlEditorVue = this_
})

/**
 * 获取参数树
 */
export function getParamsTree() {
  return request({
    baseURL: analysisUrl,
    url: '/ParamFolderController/getParamsTree',
    method: 'get'
  })
}

/**
 * 获取参数树节点的子孙节点
 */
export function getFolderAndParams(dataParam) {
  return request({
    baseURL: analysisUrl,
    url: '/paramController/getFolderAndParams',
    method: 'get',
    params: dataParam
  })
}

/**
 * 初始化界面托拉拽事件
 */
export function initDragAndDrop() {
  // 实现左右拖拽改变大小
  var container = document.getElementById('container') // 整个窗口
  var pathname = window.location.pathname
  var img = document.getElementById('iconImg')
  if (pathname.match('page')) {
    img.src = '../../images/ico/maximize.png'
  } else {
    img.src = '../images/ico/maximize.png'
  }
  var offset = 0
  var leftPart = document.getElementById('leftPart')
  var rightContent = document.getElementById('rightPart')
  var vertical = document.getElementById('vertical')
  // var left_min = container.clientWidth*0.2
  // var right_max = rightContent.offsetWidth*0.5
  var iT = 0
  vertical.onmousedown = function (e) {
    var disX = (e || event).clientX
    the_left_all()
    document.onmousemove = function (e) {
      var e = e || window.event
      var tarnameb = e.target || e.srcElement
      vertical.style.margin = 0
      iT = (e || event).clientX
      // if(iT < left_min){iT = left_min}
      // else if(iT > container.clientWidth*.85){iT = container.clientWidth*.85}
      // 模型脚本编辑页面限制拖动的最大范围
      // 控制左侧大于百分之20小于百分之50 并且右侧宽度大于百分之20小于百分之70
      if ((((iT - 86 - tz_path) / container.clientWidth * 100)<70 && ((iT - 86 - tz_path) / container.clientWidth * 100) >10)&& ( (iT - 80 - tz_path) / container.clientWidth * 100) >10&&((iT - 80 - tz_path) / container.clientWidth * 100<50) ) {
        vertical.style.left = (iT - 80 - tz_path) / container.clientWidth * 100 + '%'
        leftPart.style.width = (iT - 86 - tz_path) / container.clientWidth * 100 + '%'
        rightContent.style.width = (container.clientWidth - iT + 76 + tz_path) / container.clientWidth * 100 + '%'
      }
     
      return false
    }
    document.onmouseup = function () {
      document.onmousemove = null
      document.onmouseup = null
      vertical.releaseCapture && vertical.releaseCapture()
    }
    vertical.setCapture && vertical.setCapture()
    return false
  }

  // 单击侧边按钮收起左边栏
  function tree_zy_zhan() {
    var overWidth = document.getElementById('container').clientWidth - 229
    if (tree_shuju == false && tree_canshu == false && tree_sql == false && tree_bj == false) {
      $('#leftPart').stop(true).animate({ 'width': 203 }, 300)
      $('#vertical').delay(300).fadeIn(100).css('left', 11.5 + '%')
      $('#rightPart').stop(true).animate({ 'width': overWidth + 'px', 'left': 0 }, 300)
      $('#sidebar').css('border-right', 1 + 'px' + ' solid' + ' rgb(206,208,212)')
    }
  }

  function tree_zy_zhanhe() {
    var overWidth = document.getElementById('container').clientWidth - 34
    if (tree_shuju == false && tree_canshu == false && tree_sql == false && tree_bj == false) {
      $('#vertical').fadeOut(100)
      $('#leftPart').delay(100).stop(true).animate({ 'width': 0 }, 300)
      $('#rightPart').delay(100).stop(true).animate({ 'width': overWidth + 'px', 'left': 15 }, 300)
      $('#sidebar').css('border', 'none')
    }
  }

  function tree_zy_all() {
    $('#sidebar div').removeClass('add-sidiv')
    $('.left-dataTree').fadeOut(0)
    $('.left-paramTree').fadeOut(0)
    $('.left-sqlFunTree').fadeOut(0)
    $('.left-bjTree').fadeOut(0)
    tree_shuju = false
    tree_canshu = false
    tree_sql = false
    tree_bj = false
  }
  // 分别显示隐藏三个表
  var tree_shuju = true
  var tree_canshu = false
  var tree_sql = false
  var tree_bj = false
  $('.left-paramTree').fadeOut(300)
  $('.left-sqlFunTree').fadeOut(300)
  $('.left-bjTree').fadeOut(300)
  $('.unfold-shuju').on('click', function () {
    if (tree_shuju == true) {
      $('.left-dataTree').fadeOut(300)
      $(this).removeClass('add-sidiv')
      tree_shuju = false
      tree_zy_zhanhe()
    } else if (tree_shuju == false) {
      tree_zy_zhan()
      tree_zy_all()
      $('.left-dataTree').fadeIn(300)
      $(this).addClass('add-sidiv')
      tree_shuju = true
    }
  })
  $('.unfold-canshu').on('click', function () {
    if (tree_canshu == true) {
      $('.left-paramTree').fadeOut(300)
      $(this).removeClass('add-sidiv')
      tree_canshu = false
      tree_zy_zhanhe()
    } else if (tree_canshu == false) {
      tree_zy_zhan()
      tree_zy_all()
      $('.left-paramTree').fadeIn(300)
      $(this).addClass('add-sidiv')
      tree_canshu = true
    }
  })
  $('.unfold-sql').on('click', function () {
    if (tree_sql == true) {
      $('.left-sqlFunTree').fadeOut(300)
      $(this).removeClass('add-sidiv')
      tree_sql = false
      tree_zy_zhanhe()
    } else if (tree_sql == false) {
      tree_zy_zhan()
      tree_zy_all()
      $('.left-sqlFunTree').fadeIn(300)
      $(this).addClass('add-sidiv')
      tree_sql = true
    }
  })
  $('.unfold-bj').on('click', function () {
    if (tree_bj== true) {
      $('.left-bjTree').fadeOut(300)
      $(this).removeClass('add-sidiv')
      tree_bj = false
      tree_zy_zhanhe()
    } else if (tree_bj == false) {
      tree_zy_zhan()
      tree_zy_all()
      $('.left-bjTree').fadeIn(300)
      $(this).addClass('add-sidiv')
      tree_bj = true
    }
  })

  // 实现上下拖拽改变大小
  var rightPart = document.getElementById('rightPart')
  var topPart = document.getElementById('sqlEditorDiv')
  var bottomPart = document.getElementById('bottomPart')
  var horizontal = document.getElementById('horizontal')
  horizontal.onmousedown = function (e) {
    var disY = (e || event).clientY
    horizontal.top = horizontal.offsetTop
    var grids = $('.ui-jqgrid-bdiv').eq(0)[0]
    document.onmousemove = function (e) {
      var iT = horizontal.top + ((e || event).clientY - disY)
      var e = e || window.event; var tarnameb = e.target || e.srcElement
      var maxT = (rightPart.clientHeight == 0 ? rightPart.scrollHeight : rightPart.clientHeight) - horizontal.offsetHeight
      horizontal.style.margin = 0
      iT < 0 && (iT = 0)
      iT > maxT && (iT = maxT)
      var cmWrap = $('.CodeMirror-wrap')[0]
      horizontal.style.top = topPart.style.height = iT + 'px'
      cmWrap.style.height = iT - 37 + 'px'
      bottomPart.style.height = rightPart.clientHeight - iT - 11 + 'px'
      if (grids) {
        grids.style.height = rightPart.clientHeight - iT - 197 + 'px'
      }
      return false
    }
    document.onmouseup = function () {
      document.onmousemove = null
      document.onmouseup = null
      horizontal.releaseCapture && horizontal.releaseCapture()
    }
    horizontal.setCapture && horizontal.setCapture()
    return false
  }
}

/**
 * 初始化变量
 */
export function initVariable() {
  nowPick = false
  cursor = null
  isFirstPaste = true
  checkSqlText = ''
  paramObj = { arr: [] }
  paramDivArr = []
  paramIdDivArr = []
  modelChartSetup = {}
  sqlDraftObj = undefined
  isFirst = 0
  isUpdate = false
}
/**
 * 初始化事件
 */
export function initEvent() {
  $('body').mousemove(function (e) {
    e = e || window.event
    var scroolX = document.documentElement.scrollLeft || document.body.scrollLeft
    var scroolY = document.documentElement.scrollTop || document.body.scrollTop
    mouseX = e.pageX || e.clientX + scroolX
    mouseY = e.pageY || e.clientY + scroolY
  })
}
/**
 * 初始化SQL编辑器
 * @param textarea 编辑器id
 * @param relTableMap 智能提示的表对象
 * @returns {CodeMirror.EditorFromTextArea}
 */
export function initSQLEditor(textarea, relTableMap, expTableMap) {
  // 初始化CodeMirror
  var editor = CodeMirror.fromTextArea(textarea, {
    mode: 'text/x-mssql',
    theme: 'idea',
    indentWithTabs: true, // 带字符表得缩进
    lineNumbers: true, // 线条数量
    lineWrapping: true, // 线条包装
    smartIndent: true, // 智能缩进
    autofocus: true, // 自动对齐
    matchBrackets: true, // 开启括号匹配
    styleActiveLine: false, // 样式激活线
    hintOptions: { // 选项
      tables: relTableMap,
      tablesTitle: expTableMap
    }
  })
  // 输入时事件cursorActivity
  editor.on('cursorActivity', function (cm) { // 光标活动
    if (cm.curOp.focus === false) {
      initHint(editor)
    }
    $('span').removeClass('errorHighlight')
  })
  editor.on('beforeChange', function (instance, changeObj) { // 改变之前
    if (changeObj.origin === 'paste' && isFirstPaste) { // 第一次粘贴？？？
      cursor = editor.getCursor() // 获取光标
      checkSqlText = editor.getRange({ ch: 0, line: cursor.line }, { ch: cursor.ch, line: cursor.line })// 光标范围
      isFirstPaste = false
    }
  })
  editor.on('change', function (instance, changeObj) {
    // 如果第一次加载不做任何校验
    if (isFirst != 0) {
      isUpdate = true
    }
    isFirst++
    if (!changeObj.origin) {
      return
    }
    var changeText = ''
    var opt = 1// 默认有效
    var selectTextArr = changeObj.text// 这个值是个数组，有默认值（为长度为1的空串）
    if ((selectTextArr.length === 1 && selectTextArr[0] !== '') || selectTextArr.length > 1) { // 恢复、插入内容
      for (var i = 0; i < selectTextArr.length; i++) {
        changeText += selectTextArr[i]
      }
    }
    if (changeText === '') {
      selectTextArr = changeObj.removed// 这个值也是个数组，有默认值（为长度为1的空串）
      if ((selectTextArr.length === 1 && selectTextArr[0] !== '') || selectTextArr.length > 1) { // 撤销、删除内容
        for (var i = 0; i < selectTextArr.length; i++) {
          changeText += selectTextArr[i]
        }
        opt = 0
      }
    }
    // 匹配“{#”和“#}”纯粹是为了提高代码的执行效率（只有参数按钮会同时含有“{#”和“#}”）
    if (changeText.indexOf('{#') != -1 && changeText.indexOf('#}') != -1 && paramDivArr && paramDivArr.length > 0) {
      for (var i = 0; i < paramDivArr.length; i++) {
        if (changeText.indexOf(paramDivArr[i].id) != -1) {
          paramDivArr[i].opt = opt
        }
      }
    }
    // 如果是粘贴操作
    if (changeObj.origin === 'paste' && paramObj && paramObj.arr != undefined && paramObj.arr.length > 0) {
      var hasPaste = false
      for (var i = 0; i < paramObj.arr.length; i++) {
        if (changeText.indexOf(paramObj.arr[i].id) != -1) { // 如果粘贴的是已含有的参数
          var copyParamId = getUuid()
          var id = '{#' + copyParamId + '#}'
          var name = paramObj.arr[i].name
          var obj = {
            'oldParamId': paramObj.arr[i].id, // 被复制参数的ID
            'id': id, // 加上占位符后的复制参数ID
            'copyParamId': copyParamId, // 复制参数ID
            'allowedNull': paramObj.arr[i].allowedNull, // 参数是否可以为空
            'moduleParamId': paramObj.arr[i].moduleParamId, // 复制参数的母参ID
            'name': name// 参数名称
          }
          paramObj.arr.push(obj)
          hasPaste = true
        }
      }
      if (hasPaste) {
        replaceCopyParam(paramObj)
      }
      isFirstPaste = true
    }
  })
  // 设置脚本展示tab的上面编辑器高度
  editor.setSize('auto', ($(document).height() * 0.5 - 40) + 'px')
  editorObj = editor
  $('.CodeMirror-scroll').focus()
  editor.setSize('auto', '88%')
  // sql编辑器颜色 为了不影响公共样式
  $('.CodeMirror-scroll:eq(0)').css('background-color', 'rgb(237, 241, 245)')
}

/**
 * 初始化SQL编辑器里的校验规则
 * @param editor SQL编辑器
 */
export function initHint(editor) {
  if (nowPick) {
    nowPick = false
    return
  }
  // 获取用户当前的编辑器中的编写的代码
  var cur = editor.getCursor()
  var words = editor.getTokenAt(cur).string
  var shieldString = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
    ' ', ',', '-', '_', '=', '+', '-', '/', ';', '{', '}', '\'', '\'\'', '\'\'\'', '|', '\\', '<', '>']
  // 如果用户输入空格，则退回
  if ($.trim(words) === '') {
    return
  }
  //判断是否拖拽参数进来，如果是拖拽参数进来则不显示
  if (words.indexOf("{#") != -1 && words.indexOf("#}") != -1) {
    return
  }
  if (shieldString.indexOf(words) != -1) {
    return
  }
  // 利用正则取出用户输入的所有的英文的字母
  words = words.replace(/[a-z]+[\-|\']+[a-z]+/ig, '').match(/([a-z]+)/ig)
  // 将获取到的用户的单词传入CodeMirror,并在javascript-hint中做匹配
  CodeMirror.ukeys = words
  // 调用显示提示
  completeAfter(editor)
}

/**
 * 智能提示
 * @param cm
 * @param pred
 * @returns {{toString(): "CodeMirror.PASS"}}
 */
export function completeAfter(cm, pred) {
  var cur = cm.getCursor()
  if (!pred || pred()) {
    setTimeout(function () {
      if (!cm.state.completionActive) {
        cm.showHint({
          completeSingle: false
        })
      }
    }, 100)
  }
  return CodeMirror.Pass
}

/**
 * 初始化图标
 */
export function initIcon() {
  $('#tableSearchImg').attr('src', '../images/ico/search_blue.png')
  $('#paramSearchImg').attr('src', '../images/ico/search_blue.png')
  $('#funSearchImg').attr('src', '../images/ico/search_blue.png')
}

/**
 * 初始化数据表树
 */
export function initTableTree(result) {
  // 数据表树加载,开始
  var setting = {
    // 异步加载
    data: {
      key: {
        checked: 'isChecked',
        name: 'name',
        title: 'name'
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
      selectedMulti: false
    },
    callback: {
      onDrop: onDrop,
      beforeDrag: function (treeId, treeNodes) {
        // 如果是表，视图或者列则允许拖动 否则不可以
        if (treeNodes[0] && (treeNodes[0].type === 'table' || treeNodes[0].type === 'view' || treeNodes[0].type === 'datasource' || treeNodes[0].type === 'column')) {
          return true
        } else {
          return false
        }
      },
      onRightClick: function (event, treeId, treeNode) {
        if (!treeNode) {
          return false
        }
        zTreeObj.selectNode(treeNode)
        var menuId = ''
        var numm = $(document).height() - event.clientY
        if (treeNode.type === 'table' || treeNode.type === 'view' || treeNode.type === 'datasource') {
          menuId = 'tableMenu'
          history.scrollRestoration = 'manual'
          // 判断是不是导入数据节点、和分享节点，右键可便捷表结构
          if (treeNode.pid === 'importDataTable') {
            menuId = 'importTableMenu'
          }
        } else {
          // 外部导入数据节点加导入功能
          if (treeNode.id === 'importDataTable') {
            menuId = 'importDataMenu'
          }

          if (treeNode.id === 'bussDataRoot' || treeNode.id === 'bussRootNode' || treeNode.id === 'my_space' ||
            treeNode.id === 'bussRootNode_dev' || treeNode.id === 'my_space_dev' || treeNode.id === 'other_space_dev') {
            menuId = 'rootMenu'
          }
        }
        if (menuId !== '') {
          showRMenu('node', 'dataTree', menuId, event.clientX, numm < $('#' + menuId).height() ? (event.clientY - $('#' + menuId).height()) : event.clientY)
        } else {
          return false
        }
      },
      onExpand: function (event, treeId, treeNode) {
        if ((!treeNode.children || treeNode.children.length === 0) && treeNode.type === 'table' || treeNode.type === 'view' || treeNode.type === 'datasource') {
          zTreeObj.removeChildNodes(treeNode)
          var tableName = treeNode.name
          var tableMetaUuid = treeNode.id
          request({
            baseURL: dataUrl,
            url: '/tableMeta/getCols',
            method: 'post',
            params: { tableMetaUuid: tableMetaUuid, isEnclose: "1" }
          }).then(result => {
            if (result.data == null) {
              this.$message({
                message: '错误' + e.message + 'error',
              });
              // alert('错误' + e.message + 'error')
            } else {
              // 处理拿回来的数据 处理成列表
              const columns = []
              var nodeList = []
              for (let i = 0; i < result.data.length; i++) {
                if (result.data[i].chnName === '' || result.data[i].chnName == null || result.data[i].chnName == undefined) {
                  columns.push(result.data[i].colName)
                  var node = {
                    'id': tableName + '_' + this,
                    'name': result.data[i].colName,
                    'displayName': result.data[i].colName,
                    'pid': treeNode.id,
                    'isParent': false,
                    'open': false,
                    'type': 'column',
                    'icon': columnIconPath,
                    'enName': result.data[i].colName
                  }
                  nodeList.push(node)
                } else {
                  //如果有汉化字段则用中文加汉化字段
                  let columnName = result.data[i].colName + "(" + result.data[i].chnName + ")"
                  columns.push(result.data[i].colName)
                  var node = {
                    'id': tableName + '_' + this,
                    'name': columnName,
                    'displayName': columnName,
                    'pid': treeNode.id,
                    'isParent': false,
                    'open': false,
                    'type': 'column',
                    'icon': columnIconPath,
                    'enName': result.data[i].colName
                  }
                  nodeList.push(node)
                  editorObj.options.hintOptions.tablesTitle[result.data[i].colName] = result.data[i].chnName
                }
              }
              if (columns.length > 0) {
                CodeMirror.tableColMapping[tableName] = columns
                editorObj.options.hintOptions.tables[tableName] = columns
                zTreeObj.addNodes(treeNode, nodeList)
              }
            }
          })
        }
      }
    },
    edit: {
      enable: true,
      showRenameBtn: false,
      showRemoveBtn: false,
      // 不允许ztree内部互相拖拽
      drag: {
        autoExpandTrigger: false, // 拖拽时父节点自动展开是否触发 onExpand
        prev: false,
        next: false,
        inner: false
      }
    }
  }
  /*  const params = { sceneCode: 'auditor', dataUserId: userId }
  // 调用后台获取数据表数据
  request({
    baseURL: dataUrl,
    url: '/tableMeta/getResTree',
    method: 'post',
    params: params
  }).then(result => {*/
  // 设置图标
  for (let i = 0; i < result.data.length; i++) {
    if (result.data[i].type === 'table') {
      result.data[i].icon = tableIconPath
      result.data[i].enName = result.data[i].name;
      if (result.data[i].nameCn) {
        // result.data[i].name = result.data[i].name + "(" + result.data[i].nameCn + ")"
        result.data[i].name = result.data[i].nameCn
      }
      result.data[i].isParent = true
    } else if (result.data[i].type === 'view') {
      result.data[i].icon = viewIconPath
      result.data[i].isParent = true
      result.data[i].enName = result.data[i].name;
      if (result.data[i].nameCn) {
        // result.data[i].name = result.data[i].name + "(" + result.data[i].nameCn + ")"
        result.data[i].name = result.data[i].nameCn
      }
    } else if (result.data[i].type === 'folder') {
      result.data[i].isParent = true
    }
  }
  result.data.push({
    'id': 'ROOT',
    'pid': null,
    'name': '所有数据',
    'displayName': '所有数据',
    'type': 'ROOT',
    'isParent': true,
    'open': true,
    'level': 0
  })
  tableTreeData = result.data
  zTreeObj = $.fn.zTree.init($('#dataTree'), setting, result.data)
  // })
}
/**
 * 执行create语句后刷新左侧树
 */
export function refushTableTree(treeNodes) {
  var setting = {
    // 异步加载
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
      selectedMulti: false
    },
    callback: {
      onDrop: onDrop,
      beforeDrag: function (treeId, treeNodes) {
        // 如果是表，视图或者列则允许拖动 否则不可以
        if (treeNodes[0] && (treeNodes[0].type === 'table' || treeNodes[0].type === 'view' || treeNodes[0].type === 'datasource' || treeNodes[0].type === 'column')) {
          return true
        } else {
          return false
        }
      },
      onRightClick: function (event, treeId, treeNode) {
        if (!treeNode) {
          return false
        }
        zTreeObj.selectNode(treeNode)
        var menuId = ''
        var numm = $(document).height() - event.clientY
        if (treeNode.type === 'table' || treeNode.type === 'view' || treeNode.type === 'datasource') {
          menuId = 'tableMenu'
          history.scrollRestoration = 'manual'
          // 判断是不是导入数据节点、和分享节点，右键可便捷表结构
          if (treeNode.pid === 'importDataTable') {
            menuId = 'importTableMenu'
          }
        } else {
          // 外部导入数据节点加导入功能
          if (treeNode.id === 'importDataTable') {
            menuId = 'importDataMenu'
          }

          if (treeNode.id === 'bussDataRoot' || treeNode.id === 'bussRootNode' || treeNode.id === 'my_space' ||
            treeNode.id === 'bussRootNode_dev' || treeNode.id === 'my_space_dev' || treeNode.id === 'other_space_dev') {
            menuId = 'rootMenu'
          }
        }
        if (menuId !== '') {
          showRMenu('node', 'dataTree', menuId, event.clientX, numm < $('#' + menuId).height() ? (event.clientY - $('#' + menuId).height()) : event.clientY)
        } else {
          return false
        }
      },
      onExpand: function (event, treeId, treeNode) {
        if ((!treeNode.children || treeNode.children.length === 0) && treeNode.type === 'table' || treeNode.type === 'view' || treeNode.type === 'datasource') {
          zTreeObj.removeChildNodes(treeNode)
          var tableName = treeNode.name
          var tableMetaUuid = treeNode.id
          // 先从codeMirror里面找 如果能找到则不找数据库  找不到则找数据库
          var columns = CodeMirror.tableColMapping[tableName]
          if (!columns || (columns && columns.length === 0)) {
            request({
              baseURL: dataUrl,
              url: '/tableMeta/getCols',
              method: 'post',
              params: { tableMetaUuid: tableMetaUuid, isEnclose: "1" }
            }).then(result => {
              if (result.data == null) {
                this.$message({
                  message: '错误' + e.message + 'error',
                });
                // alert('错误' + e.message + 'error')
              } else {
                // 处理拿回来的数据 处理成列表
                const columns = []
                for (let i = 0; i < result.data.length; i++) {
                  if (result.data[i].chnName === '' || result.data[i].chnName == null || result.data[i].chnName == undefined) {
                    columns.push(result.data[i].colName)
                  } else {
                    columns.push(result.data[i].chnName)
                  }
                }
                if (columns.length > 0) {
                  CodeMirror.tableColMapping[tableName] = columns
                  editorObj.options.hintOptions.tables[tableName] = columns
                  var nodeList = []
                  $(columns).each(function () {
                    var node = {
                      'id': tableName + '_' + this,
                      'name': this.toString(),
                      'displayName': this.toString(),
                      'pid': treeNode.id,
                      'isParent': false,
                      'open': false,
                      'type': 'column',
                      'icon': columnIconPath
                    }
                    nodeList.push(node)
                  })
                  zTreeObj.addNodes(treeNode, nodeList)
                }
              }
            })
          } else {
            var nodeList = []
            $(columns).each(function () {
              var node = {
                'id': tableName + '_' + this,
                'name': this.toString(),
                'displayName': this.toString(),
                'pid': treeNode.id,
                'isParent': false,
                'open': false,
                'type': 'column',
                'icon': columnIconPath
              }
              nodeList.push(node)
            })
            zTreeObj.addNodes(treeNode, nodeList)
          }
        }
      }
    },
    edit: {
      enable: true,
      showRenameBtn: false,
      showRemoveBtn: false,
      // 不允许ztree内部互相拖拽
      drag: {
        autoExpandTrigger: false, // 拖拽时父节点自动展开是否触发 onExpand
        prev: false,
        next: false,
        inner: false
      }
    }
  }
  if (treeNodes != undefined && treeNodes.length > 0) {
    for (let i = 0; i < treeNodes.length; i++) {
      if (treeNodes[i].type === 'table') {
        treeNodes[i].icon = tableIconPath
        treeNodes[i].enName = treeNodes[i].name;
        if (treeNodes[i].nameCn) {
          // treeNodes[i].name = treeNodes[i].name + "(" + treeNodes[i].nameCn + ")"
          treeNodes[i].name = treeNodes[i].nameCn
        }
        treeNodes[i].isParent = true
      } else if (treeNodes[i].type === 'view') {
        treeNodes[i].icon = viewIconPath
        treeNodes[i].isParent = true
        treeNodes[i].enName = treeNodes[i].name;
        if (treeNodes[i].nameCn) {
          // treeNodes[i].name = treeNodes[i].name + "(" + treeNodes[i].nameCn + ")"
          treeNodes[i].name = treeNodes[i].nameCn
        }
      } else if (treeNodes[i].type === 'folder') {
        treeNodes[i].isParent = true
      }
    }
    tableTreeData = tableTreeData.concat(treeNodes)
    zTreeObj = $.fn.zTree.init($('#dataTree'), setting, tableTreeData)
    for (var i = 0; i < treeNodes.length; i++) {
      // 添加sql编辑器智能提示
      CodeMirror.tableColMapping[treeNodes[i].name] = []
      // 重新加载表与列的关系
      editorObj.options.hintOptions.tables[treeNodes[i].name] = []
    }
  }
}

/**
 * 删除表或试图后删除左侧树
 * @param dropTableArr 删除的表
 */
export function dropTable(dropTableArr) {
  if (dropTableArr != undefined && dropTableArr.length > 0) {
    for (var k = 0; k < dropTableArr.length; k++) {
      var dropedNode = zTreeObj.getNodesByParam('name', dropTableArr[k], null)[0]
      zTreeObj.removeNode(dropedNode)
      // 删除智能提示
      delete CodeMirror.tableColMapping[dropTableArr[k]]
      // 清除表与列的关系
      delete editorObj.options.hintOptions.tables[dropTableArr[k]]
    }
  }
}

var max_left = 0
var max_width = 0
var tz_path = 0
// 实时获取最左侧主菜单栏的宽度
function the_left_all() {
  var leftcard = document.getElementsByClassName('left-menu')[0]
  var offleftcard = leftcard.style.width
  if (offleftcard == 120 + 'px') {
    max_left = 125
    max_width = 93
    tz_path = 55
  } else if (offleftcard == 64 + 'px') {
    max_left = 70
    max_width = 96
    tz_path = 0
  } else {
    tz_path = -63
    max_width = 100
  }
}

// 表单最大化
var maxormin = true
export function maxOpenOne() {
  the_left_all()
  if (maxormin == true) {
    $('#drag').hide(100)
    $('#iconImg').css('display', 'none')
    $('#iconImg-huifu').css('display', 'block')
    $('#bottomPart').css({ 'position': 'fixed', 'width': max_width + '%', 'left': max_left, 'top': 0, 'height': 100 + '%', 'z-index': 10000 })
    // $('.ag-theme-balham').css('height', 650)
    maxormin = false
  } else if (maxormin == false) {
    $('#drag').show(100)
    $('#iconImg').css('display', 'block')
    $('#iconImg-huifu').css('display', 'none')
    $('#bottomPart').css({ 'position': 'static', 'left': 0, 'width': 100 + '%', 'height': 'calc(100% - 250px)', 'z-index': 100 })
    // $('.ag-theme-balham').css('height', 300)
    maxormin = true
  }
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
        PidKey: 'pid'
      }
    },
    check: {
      enable: false,
      chkStyle: 'radio',
      radioType: 'all'
    },
    view: {
      selectedMulti: false
    },
    callback: {
      onDrop: function (event, treeId, treeNodes) {
        // 这是存放参数的数组
        var arr = new Array()
        var selText = editorObj.getSelection()
        // 如果选中执行等于全部待执行SQL或者没有选中直接执行SQL 则视为满足模型生成条件第一条 即：必须将SQL编译器的内容全部执行才可以保存模型结果 flag为控制标识
        if ($.trim(selText) === '' || selText === editorObj.getValue()) {
          selText = editorObj.getValue()
        }
        var parArr = selText.split('#')
        for (var i = 0; i < parArr.length; i++) {
          if (i % 2 != 0) {
            arr.push(parArr[i])
          }
        }
        var width = $('.CodeMirror').width()
        var height = $('#sqlEditorDiv').height()
        var offLeft = $('.leftCon').width()
        var offTop = $('.table-view-caption').height()
        if ((mouseX < (offLeft + 30) || (mouseX > (offLeft + width)) || (mouseY < offTop) || (mouseY > height))) {
          return
        }
        var cursor = editorObj.getCursor()
        /* 新修改 star*/
        var copyParamId = getUuid()
        var id = '{#' + copyParamId + '#}'
        editorObj.replaceRange(id, cursor, cursor)
        var dom = $("<button type='button' class='divEditorBtn' id='" + id + "'>" + treeNodes[0].name + '</buttonn>').get(0)
        var endCursor = { ch: cursor.ch + id.length, line: cursor.line, sticky: null }
        editorObj.markText(cursor, endCursor, {
          replacedWith: dom,
          className: 'paramBlock'
        })
        var obj = {
          'id': id, // 加上占位符后的复制参数ID
          'copyParamId': copyParamId, // 复制参数ID
          'moduleParamId': treeNodes[0].id, // 复制参数的母参ID
          'allowedNull': treeNodes[0].extCol, // 临时占用此属性来存储该参数是否可以为空
          'name': treeNodes[0].name// 参数名称
        }
        if (Object.keys(paramObj).length === 0) {
          paramObj.arr = []
        }
        paramObj.arr.push(obj)
        var divBtnObj = {
          'id': id, // 加上占位符后的复制参数ID
          'opt': 1// 参数是否生效（不生效是指在当前SQL编辑中已被删除），0、不生效，1、生效
        }
        paramDivArr.push(divBtnObj)
      },
      beforeDrag: function (treeId, treeNodes) {
        // 如果是参数 允许拖动 否则不可以
        var thisNode = treeNodes[0]
        if (thisNode.type !== 'paramNode') {
          return false
        }
      },
      onRightClick: function (event, treeId, treeNode) {
        if (!treeNode) {
          return false
        }
        paramZtree.selectNode(treeNode)
        // 参数、系统参数、没有权限的公共参数、模型私有参数不能右键操作
        if (treeNode.type === 'paramRoot' || treeNode.type === 'sysParam' || (!paramManager && treeNode.type === 'publicParam')) {
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
      },
      onExpand: function (event, treeId, treeNode) {
        if (!treeNode.children || treeNode.children.length === 0) {
          loadParamChildrenNodes(treeNode)
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
  getParamsTree().then(result => {
    if (result.data.isError) {

    } else {
      result.data.paramNode.open = true
      // 'open': true,
      paramZtree = $.fn.zTree.init($('#paramTree'), paramSetting, result.data.paramNode)
    }
  })
}

/**
 * 初始化参数树
 */
export function initParamTreeNew() {
  var paramSetting = {
    data: {
      key: {
        checked: 'isChecked',
        name: 'name',
        title: 'label'
      },
      // 设置数据格式
      simpleData: {
        enable: true,
        idKey: 'id',
        PidKey: 'pid'
      }
    },
    check: {
      enable: false,
      chkStyle: 'radio',
      radioType: 'all'
    },
    view: {
      selectedMulti: false
    },
    callback: {
      onDrop: function (event, treeId, treeNodes) {
        // 这是存放参数的数组
        var arr = new Array()
        var selText = editorObj.getSelection()
        // 如果选中执行等于全部待执行SQL或者没有选中直接执行SQL 则视为满足模型生成条件第一条 即：必须将SQL编译器的内容全部执行才可以保存模型结果 flag为控制标识
        if ($.trim(selText) === '' || selText === editorObj.getValue()) {
          selText = editorObj.getValue()
        }
        var parArr = selText.split('#')
        for (var i = 0; i < parArr.length; i++) {
          if (i % 2 != 0) {
            arr.push(parArr[i])
          }
        }
        var width = $('.CodeMirror').width()
        var height = $('#sqlEditorDiv').height()
        var offLeft = $('.leftCon').width()
        var offTop = $('.table-view-caption').height()
        if ((mouseX < (offLeft + 30) || (mouseX > (offLeft + width)) || (mouseY < offTop) || (mouseY > height))) {
          return
        }
        var cursor = editorObj.getCursor()
        /* 新修改 star*/
        var copyParamId = getUuid()
        var id = '{#' + copyParamId + '#}'
        editorObj.replaceRange(id, cursor, cursor)
        var dom = $("<button type='button' class='divEditorBtn' id='" + id + "'>" + treeNodes[0].name + '</buttonn>').get(0)
        var endCursor = { ch: cursor.ch + id.length, line: cursor.line, sticky: null }
        editorObj.markText(cursor, endCursor, {
          replacedWith: dom,
          className: 'paramBlock'
        })
        var obj = {
          'id': id, // 加上占位符后的复制参数ID
          'copyParamId': copyParamId, // 复制参数ID
          'moduleParamId': treeNodes[0].id, // 复制参数的母参ID
          'allowedNull': treeNodes[0].extMap.allowedNull, // 临时占用此属性来存储该参数是否可以为空
          'name': treeNodes[0].name// 参数名称
        }
        if (Object.keys(paramObj).length === 0) {
          paramObj.arr = []
        }
        paramObj.arr.push(obj)
        var divBtnObj = {
          'id': id, // 加上占位符后的复制参数ID
          'opt': 1// 参数是否生效（不生效是指在当前SQL编辑中已被删除），0、不生效，1、生效
        }
        paramDivArr.push(divBtnObj)
        $('#modelDesign').data(paramObj)
      },
      beforeDrag: function (treeId, treeNodes) {
        // 如果是参数 允许拖动 否则不可以
        var thisNode = treeNodes[0]
        if (thisNode.type !== 'param') {
          return false
        }
      },
      onRightClick: function (event, treeId, treeNode) {
        if (!treeNode) {
          return false
        }
        zTreeObj.selectNode(treeNode)
        var menuId = ''
        var numm = $(document).height() - event.clientY
        if (treeNode.type === 'folder') {
          menuId = 'paramfolderMenu'
          $('#paramfolderdatabox').val(treeNode)
        } else {
          menuId = 'paramMenu'
          $('#paramdatabox').val(treeNode)
        }
        if (menuId !== '') {
          showRMenu('node', 'paramTree', menuId, event.clientX, numm < $('#' + menuId).height() ? (event.clientY - $('#' + menuId).height()) : event.clientY)
        } else {
          return false
        }
      },
      onExpand: function (event, treeId, treeNode) {
        $('#paramfolderdatabox').val(treeNode)
        console.log(treeNode)
        /*        if (!treeNode.children || treeNode.children.length === 0) {
                  loadParamChildrenNodes(treeNode)
                }*/
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
  getParamsTree().then(result => {
    if (result.data.isError) {

    } else {
      for (let i = 0; i < result.data.paramNode.length; i++) {
        setIcon(result.data.paramNode[i])
      }
      paramZtree = $.fn.zTree.init($('#paramTree'), paramSetting, result.data.paramNode)
    }
  })
}

/**
 * 递归设置参数相关信息
 * @param treeNode 节点
 */
function setIcon(treeNode) {
  if (typeof (treeNode.children) !== 'undefined' && treeNode.children.length > 0 && treeNode.type == "folder") {
    for (let i = 0; i < treeNode.children.length; i++) {
      setIcon(treeNode.children[i])
    }
  } else {
    if (treeNode.type == 'param') {
      //删除Children 防止出现展开伸缩箭头
      delete treeNode.children;
      treeNode.icon = paramIconPath
      treeNode.isParent = false
    }
    else if (treeNode.type == 'folder') {
      treeNode.icon = paramPackageIconPath;
    }
  }
}
$('.ag-theme-balham .ag-header-row').css('background-color', 'white')

/**
 * 数据表树拖拽事件
 * @param event
 * @param treeId
 * @param treeNodes
 */
function onDrop(event, treeId, treeNodes) {
  var width = $('.CodeMirror').width()
  var height = $('#sqlEditorDiv').height()
  var offLeft = $('.leftCon').width()
  var offTop = $('.table-view-caption').height()
  if ((mouseX < (offLeft + 30) || (mouseX > (offLeft + width)) || (mouseY < offTop) || (mouseY > height))) {
    return
  }
  var cursor = editorObj.getCursor()
  dragOne(treeNodes[0]['enName'] + " ", cursor, cursor)
}

/**
 * 初始化智能提示的数据表
 * @returns {AxiosPromise}
 */
export function initTableTip(dataUserId, scenecode) {
  var dataUserId1 = ''
  var sceneCode1 = ''
  if (dataUserId != undefined && scenecode != undefined) {
    dataUserId1 = dataUserId
    sceneCode1 = scenecode
  } else {
    dataUserId1 = store.getters.datauserid
    sceneCode1 = store.getters.scenecode
  }
  const params = { sceneCode: sceneCode1, dataUserId: dataUserId1 }
  // 调用后台获取数据表数据
  return request({
    baseURL: dataUrl,
    url: '/tableMeta/getResTree',
    method: 'post',
    params: params
  })
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
  /* if (w_ < $('#' + menuId).width()) {
     x = $('#' + containerId).width() - $('#' + menuId).width()
   }*/
  $('#' + menuId + ' ul').show()
  $('#' + menuId).css({ 'top': y + 'px', 'left': x + 'px', 'visibility': 'visible' })
  $('body').bind('mousedown', { 'menuId': menuId }, onBodyMouseDown)
}

/**
 * 隐藏菜单
 * @param menuId 要隐藏的编号
 */
export function hideRMenu(menuId) {
  if ($('#' + menuId)[0]) $('#' + menuId).css({ 'visibility': 'hidden' })
  $('body').unbind('mousedown', onBodyMouseDown)
}

/**
 * 整个界面点击事件
 * @param event 时间
 */
function onBodyMouseDown(event) {
  if (!(event.target.id === event.data.menuId || $(event.target).parents('#' + event.data.menuId).length > 0)) {
    $('#' + event.data.menuId).css({ 'visibility': 'hidden' })
  }
}
//初始化标记树
export function initBJTree() {
  // 函数树加载,开始
  var bjSetting = {
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
        PidKey: 'pid'
      }
    },
    check: {
      enable: false,
      chkStyle: 'radio',
      radioType: 'all'
    },
    view: {
      selectedMulti: false
    },
    callback: {
      onDrop: function (event, treeId, treeNodes) {
        // 这是存放参数的数组
        var arr = new Array()
        var selText = editorObj.getSelection()
        // 如果选中执行等于全部待执行SQL或者没有选中直接执行SQL 则视为满足模型生成条件第一条 即：必须将SQL编译器的内容全部执行才可以保存模型结果 flag为控制标识
        if ($.trim(selText) === '' || selText === editorObj.getValue()) {
          selText = editorObj.getValue()
        }
        var parArr = selText.split('#')
        for (var i = 0; i < parArr.length; i++) {
          if (i % 2 != 0) {
            arr.push(parArr[i])
          }
        }
        var width = $('.CodeMirror').width()
        var height = $('#sqlEditorDiv').height()
        var offLeft = $('.leftCon').width()
        var offTop = $('.table-view-caption').height()
        if ((mouseX < (offLeft + 30) || (mouseX > (offLeft + width)) || (mouseY < offTop) || (mouseY > height))) {
          return
        }
        var cursor = editorObj.getCursor()
        /* 新修改 star*/
        var id = ''
        console.log(treeNodes[0].id)
        if(treeNodes[0].id=="start"){
          id = '{$'
        }else{
          id = '$}'
        }
        editorObj.replaceRange(id, cursor, cursor)
        var dom = $("<button type='button' class='bjbutton' id='" + id + "'>" + treeNodes[0].name + '</buttonn>').get(0)
        var endCursor = { ch: cursor.ch + id.length, line: cursor.line, sticky: null }
        editorObj.markText(cursor, endCursor, {
          replacedWith: dom,
          className: 'paramBlock'
        })
        var obj = {
          'id': id, // 加上占位符后的复制参数ID
          'name': treeNodes[0].name// 参数名称
        }
        if (Object.keys(paramObj).length === 0) {
          paramObj.arr = []
        }
        var divBtnObj = {
          'id': id, // 加上占位符后的复制参数ID
          'opt': 1// 参数是否生效（不生效是指在当前SQL编辑中已被删除），0、不生效，1、生效
        }
      },
      beforeDrag: function (treeId, treeNodes) {
        // 如果是参数 允许拖动 否则不可以
        var thisNode = treeNodes[0]
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
  var bjRootNode = {
    children: [
      {
        disable: false,
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA1UlEQVQ4T72T4Q3BUBRGTydgBBuoDWzABtIJ2AAb2IARmIAN1CZsIIf3ktdqm4rE96dN893z7vvubcZbOTAL730fJ6DMgBFwBYZ9K4PvDkwETIHzl8XRXrQBCtsDVsCiA75NAd5pB9iaxVF2WJff1kAFEE98JABzGTcA5qG7CiD1bYBLMGluUyugb6b/AdwAr+SyGVyqSgcaHVtdhutklBCDNZdlfQpHwPlHc1cOdvQxxraCgyeF0/e1lf85xNcq+zN5z0Hf2QWfC5cLiOF0LUwT28zKJ9N4MRHAxdADAAAAAElFTkSuQmCC",
        id: "start",
        isParent: false,
        label: "开始",
        leaf: false,
        name: "开始",
        parent: false,
        path: "bj/start",
        pid: "bj",
        showCheckbox: true,
        type: "param"
      },
      {
        disable: false,
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA1UlEQVQ4T72T4Q3BUBRGTydgBBuoDWzABtIJ2AAb2IARmIAN1CZsIIf3ktdqm4rE96dN893z7vvubcZbOTAL730fJ6DMgBFwBYZ9K4PvDkwETIHzl8XRXrQBCtsDVsCiA75NAd5pB9iaxVF2WJff1kAFEE98JABzGTcA5qG7CiD1bYBLMGluUyugb6b/AdwAr+SyGVyqSgcaHVtdhutklBCDNZdlfQpHwPlHc1cOdvQxxraCgyeF0/e1lf85xNcq+zN5z0Hf2QWfC5cLiOF0LUwT28zKJ9N4MRHAxdADAAAAAElFTkSuQmCC",
        id: "end",
        isParent: false,
        label: "结束",
        leaf: false,
        name: "结束",
        parent: false,
        path: "bj/end",
        pid: "bj",
        showCheckbox: true,
        type: "param"
      }
    ],
    length: 2,
    displayName: "标记",
    id: "bj",
    isParent: true,
    level: 0,
    name: "标记",
    open: true,
    pid: null,
    type: "rootNode"
  }
  bjZtreeObj = $.fn.zTree.init($('#bjTree'), bjSetting, bjRootNode)
}


/**
 * 初始化函数树
 */
export function initFunctionTree() {
  // 函数树加载,开始
  var funSetting = {
    data: {
      // 设置数据格式
      simpleData: {
        enable: true,
        idKey: 'id',
        PidKey: 'pid'
      },
      key: {
        title: 'displayName'
      }
    },
    callback: {
      onDrop: funOnDrop,
      beforeDrag: function (treeId, treeNodes) {
        if (!treeNodes[0].type || treeNodes[0].type !== 'funNode') {
          return false
        }
      }
    },
    edit: {
      enable: true,
      showRenameBtn: false,
      showRemoveBtn: false,
      drag: {
        autoExpandTrigger: false, // 拖拽时父节点自动展开是否触发 onExpand
        prev: false,
        inner: false,
        next: false
      }
    }
  }

  var functionRootNode = { 'name': '函数', 'displayName': '函数', 'level': 0, 'isParent': true, 'open': true, 'type': 'rootNode', 'id': 'function', 'pid': null, 'children': [] }
  request({
    baseURL: analysisUrl,
    url: '/SQLEditorController/getFunctionData',
    method: 'get'
  }).then(result => {
    functionRootNode.children = JSON.parse(result.data)
    sqlZtreeObj = $.fn.zTree.init($('#sqlFunTree'), funSetting, functionRootNode)
    var nodes = sqlZtreeObj.getNodesByParam('type', 'funNode', null)
    if (nodes && nodes.length > 0) {
      for (var i = 0; i < nodes.length; i++) {
        if (pathname.match('page')) {
          nodes[i].icon = functionIconPath
        } else {
          nodes[i].icon = functionIconPath
        }
      }
      sqlZtreeObj.updateNode(nodes)
    }
  })
}

/**
 * 函数树拖拽方法
 * @param event 事件
 * @param treeId 树编号
 * @param treeNodes 树节点
 */
function funOnDrop(event, treeId, treeNodes) {
  var width = $('.CodeMirror').width()
  var height = $('#sqlEditorDiv').height()
  var offLeft = $('.leftCon').width()
  var offTop = $('.table-view-caption').height()
  if ((mouseX < (offLeft + 30) || (mouseX > (offLeft + width)) || (mouseY < offTop) || (mouseY > height))) {
    return
  }
  var cursor = editorObj.getCursor()
  var funContent = treeNodes[0].content || treeNodes[0].name
  dragOne(funContent, cursor, cursor)
}

/**
 * 树拖拽结束事件
 * @param str 字符串
 * @param from 要放入的form
 * @param to 到哪
 */
function dragOne(str, from, to) {
  editorObj.replaceRange(str, from, to)
  nowPick = true
}

/**
 * 异步加载参数树节点
 * @param treeNode
 */
function loadParamChildrenNodes(treeNode) {
  var dataParam = {
    'id': treeNode.id,
    'type': treeNode.type,
    'level': treeNode.level
  }
  dataParam.isPersonalParam = getRootNodeType(treeNode, paramZtree)
  getFolderAndParams(dataParam).then(result => {
    paramZtree.removeChildNodes(treeNode)
    paramZtree.addNodes(treeNode, result.data)
  })
}

/**
 * 递归获取当前节点的根节点类型
 * @param treeNode 树节点
 * @param ztreeObj 树对象
 * @return {boolean}
 */
function getRootNodeType(treeNode, ztreeObj) {
  var isPersonalParam = false
  if (treeNode.type === 'personalParam') {
    isPersonalParam = true
  } else {
    var nodes = ztreeObj.getNodesByParam('id', treeNode.pId, null)
    if (nodes.length > 0) {
      if (nodes[0].type !== 'personalParam') {
        isPersonalParam = getRootNodeType(nodes[0], ztreeObj)
      } else {
        isPersonalParam = true
      }
    }
  }
  return isPersonalParam
}

/**
 * 数据表树搜索
 */
export function tableTreeSearch() {
  var searchText = $('#dataSearch').val()
  isHiddenNodes(false, zTreeObj)
  if (searchText === '') {
    // 当输入结果为空时，使树节点全部收回，恢复成初始状态
    zTreeObj.expandAll(false)
    zTreeObj.expandNode(zTreeObj.getNodeByParam('pid', null, null), true)
  }
  var views = zTreeObj.setting.view
  views['fontCss'] = setFontCss
  if (searchText !== '') {
    var nodesT = zTreeObj.getNodesByParam('type', 'table')
    var nodesV = zTreeObj.getNodesByParam('type', 'view')
    var nodes = nodesT.concat(nodesV)
    var allNodeList = zTreeObj.transformToArray(nodes)
    updateNodes(allNodeList, false, zTreeObj)
    var nodeList = zTreeObj.getNodesByParamFuzzy('name', searchText)
    expandNodes(nodeList, zTreeObj)
    if (nodeList && nodeList.length > 0) {
      updateNodes(nodeList, true, zTreeObj)
      hiddenNodes(nodeList, zTreeObj)
    }
  } else {
    views['fontCss'] = resetFontCss
    zTreeObj.refresh()
  }
}

/**
 * 参数树搜索
 */
export function paramTreeSearch() {
  var searchText = $('#paramSearch').val()
  isHiddenNodes(false, paramZtree)
  if (searchText === '') {
    // 当输入结果为空时，使树节点全部收回，恢复成初始状态
    paramZtree.expandAll(false)
    paramZtree.expandNode(paramZtree.getNodeByParam('pid', null, null), true)
  }
  var views = paramZtree.setting.view
  views['fontCss'] = setFontCss
  if (searchText !== '') {
    var nodes = paramZtree.getNodesByParam('type', 'paramNode')
    var allNodeList = paramZtree.transformToArray(nodes)
    updateNodes(allNodeList, false, paramZtree)
    var nodeList = paramZtree.getNodesByParamFuzzy('name', searchText)
    expandNodes(nodeList, paramZtree)
    if (nodeList && nodeList.length > 0) {
      updateNodes(nodeList, true, paramZtree)
      hiddenNodes(nodeList, paramZtree)
    }
  } else {
    views['fontCss'] = resetFontCss
    paramZtree.refresh()
  }
}

/**
 * 函数树搜索
 */
export function functionTreeSearch() {
  var searchText = $('#sqlSearch').val()
  isHiddenNodes(false, sqlZtreeObj)
  if (searchText === '') {
    // 当输入结果为空时，使树节点全部收回，恢复成初始状态
    sqlZtreeObj.expandAll(false)
    sqlZtreeObj.expandNode(sqlZtreeObj.getNodeByParam('pid', null, null), true)
  }
  var views = sqlZtreeObj.setting.view
  views['fontCss'] = setFontCss
  if (searchText !== '') {
    var nodes = sqlZtreeObj.getNodesByParam('type', 'funNode')
    var allNodeList = sqlZtreeObj.transformToArray(nodes)
    updateNodes(allNodeList, false, sqlZtreeObj)
    var nodeList = sqlZtreeObj.getNodesByParamFuzzy('name', searchText)
    expandNodes(nodeList, sqlZtreeObj)
    if (nodeList && nodeList.length > 0) {
      updateNodes(nodeList, true, sqlZtreeObj)
      hiddenNodes(nodeList, sqlZtreeObj)
    }
  } else {
    views['fontCss'] = resetFontCss
    sqlZtreeObj.refresh()
  }
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
      if (allNodeList[i].pid != null) {		// 过滤掉最根节点
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
      if (pNode != null && pNode.pid != null) {
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
 * 替换复制参数
 * @param paramObj 所有参数对象
 */
function replaceCopyParam(paramObj) {
  if (!paramObj) return
  if (Object.keys(paramObj).length > 0) {
    var arr = paramObj.arr// 获取参数列表
    var lines = editorObj.lineCount()// 获取sql行数
    for (var a = 0; a < arr.length; a++) { // 第一层循环参数列表
      if (!arr[a].oldParamId) {
        continue
      }
      var oldParamId = arr[a].oldParamId
      delete paramObj.arr[a].oldParamId
      var indexArr = []
      for (var b = cursor.line; b < lines; b++) { // 第二层循环sql编辑器的内容行数
        indexArr = []// 数组清空
        var text = editorObj.getLine(b)// 获取当前行的内容
        if (text === '') {
          continue
        }
        indexArr = getIndexArr(text, oldParamId, 0, indexArr)// 获取某行内容中参数id字符串出现的位置数组
        if (indexArr.length === 0) {
          continue
        }
        var ch = cursor.ch
        if (indexArr.length === 1) { // 复制的参数到新的行时
          ch = indexArr[0]
        } else { // indexArr.length > 1（复制参数在当前行时）
          if (cursor.line === b && checkSqlText.indexOf(oldParamId) < 0) { // 在当前行已有参数前粘贴
            ch = indexArr[0]
          } else { // 在当前行已有参数后粘贴
            ch = indexArr[1]
          }
        }
        var startCursor = { ch: ch, line: b, sticky: null }
        var endCursor = { ch: ch + arr[a].id.length, line: b, sticky: null }
        editorObj.replaceRange(arr[a].id, startCursor, endCursor)// 替换复制的参数的ID
        var dom = $("<button type='button' class='divEditorBtn' id='" + arr[a].id + "'>" + arr[a].name + '</buttonn>').get(0)
        editorObj.markText(startCursor, endCursor, {
          replacedWith: dom,
          className: 'paramBlock'
        })
        if (paramIdDivArr.indexOf(arr[a].id) < 0) {
          var obj = {
            'id': arr[a].id, // 加上占位符后的复制参数ID
            'opt': 1// 参数是否生效（不生效是指在当前SQL编辑中已被删除），0、不生效，1、生效
          }
          paramDivArr.push(obj)
          paramIdDivArr.push(arr[a].id)
        }
      }
    }
  }
}

/**
 * 获取某行内容中字符串出现的位置数组
 * @param text 文本内容
 * @param str 字符串
 * @param index 出现位置
 * @param indexArr 位置数组
 * */
function getIndexArr(text, str, index, indexArr) {
  index = text.indexOf(str, index)
  if (index !== -1) {
    indexArr.push(index)
    indexArr = getIndexArr(text, str, parseInt(index + 1), indexArr)
  }
  return indexArr
}

/**
 * 格式化SQL语句
 */
export function sqlFormat() {
  if (!paramObj) {
    paramObj = {}
  }
  var selected = true// 是否选中内容
  var text = editorObj.getSelection()
  if (text.length === 0) {
    text = editorObj.getValue()
    selected = false
  }
  if (Object.keys(paramObj).length > 0) {
    var arr = paramObj.arr
    for (var i = 0; i < arr.length; i++) {
      text = text.replace(arr[i].id, arr[i].name + '_rpm_JL')
    }
  }
  var param = { sql: text }
  request({
    baseURL: analysisUrl,
    url: '/SQLEditorController/formatSql',
    method: 'post',
    data: param
  }).then(result => {
    if (result.data.isError) {
      this.$message({
        message: 'SQL语句书写不正确，格式化时出错',
      });
      // alert('SQL语句书写不正确，格式化时出错')
    } else {
      var newVal = result.data.sql
      if (Object.keys(paramObj).length > 0) {
        var arr = paramObj.arr
        for (var i = 0; i < arr.length; i++) {
          newVal = newVal.replace(arr[i].name + '_rpm_JL', arr[i].id)
        }
      }
      if (selected) {
        editorObj.replaceSelection(newVal)
      } else {
        editorObj.setValue(newVal)
      }
      replaceParam(paramObj)
    }
  })
}

/**
 * 替换参数
 * @param paramObj 所有参数的对象
 */
function replaceParam(paramObj) {
  console.log(0)
  var lines = editorObj.lineCount()// 获取sql行数
  var indexArrstart = []
  var indexArrend = []
  for (var b = 0; b < lines; b++) { // 第二层循环sql编辑器的内容行数
    indexArrstart = []// 数组清空
    indexArrend = []
    var text = editorObj.getLine(b)// 获取当前行的内容
    indexArrstart = getIndexArr(text, '{$', 0, indexArrstart)// 获取某行内容中参数id字符串出现的位置数组
    indexArrend = getIndexArr(text, '$}', 0, indexArrend)// 获取某行内容中参数id字符串出现的位置数组
    for (var i = 0; i < indexArrstart.length; i++) { // 第三层循环获取出来的字符串数组
      var dom = $("<button type='button' class='bjbutton' id='{$'>开始</buttonn>'").get(0)
      var startCursor = { ch: indexArrstart[i], line: b, sticky: null }
      var endCursor = { ch: indexArrstart[i] + 2, line: b, sticky: null }
      editorObj.markText(startCursor, endCursor, {
        replacedWith: dom,
        className: 'paramBlock'
      })
    }
    for (var j = 0; j < indexArrend.length; j++) { // 第三层循环获取出来的字符串数组
      var dom = $("<button type='button' class='bjbutton' id='$}'>结束</buttonn>'").get(0)
      var startCursor = { ch: indexArrend[j], line: b, sticky: null }
      var endCursor = { ch: indexArrend[j] + 2, line: b, sticky: null }
      editorObj.markText(startCursor, endCursor, {
        replacedWith: dom,
        className: 'paramBlock'
      })
    }
  }

  if (!paramObj) {
    return
  }
  if (Object.keys(paramObj).length > 0) {
    var arr = paramObj.arr// 获取参数列表
    var lines = editorObj.lineCount()// 获取sql行数
    for (var a = 0; a < arr.length; a++) { // 第一层循环参数列表
      var indexArr = []
      for (var b = 0; b < lines; b++) { // 第二层循环sql编辑器的内容行数
        indexArr = []// 数组清空
        var text = editorObj.getLine(b)// 获取当前行的内容
        indexArr = getIndexArr(text, arr[a].id, 0, indexArr)// 获取某行内容中参数id字符串出现的位置数组
        for (var i = 0; i < indexArr.length; i++) { // 第三层循环获取出来的字符串数组
          var dom = $("<button type='button' class='divEditorBtn' id='" + arr[a].id + "'>" + arr[a].name + '</buttonn>').get(0)
          var startCursor = { ch: indexArr[i], line: b, sticky: null }
          var endCursor = { ch: indexArr[i] + arr[a].id.length, line: b, sticky: null }
          editorObj.markText(startCursor, endCursor, {
            replacedWith: dom,
            className: 'paramBlock'
          })
          if ($.inArray(arr[a].id, paramIdDivArr) == -1) {
            var divBtnObj = {
              'id': arr[a].id, // 加上占位符后的复制参数ID
              'opt': 1// 参数是否生效（不生效是指在当前SQL编辑中已被删除），0、不生效，1、生效
            }
            paramDivArr.push(divBtnObj)
            paramIdDivArr.push(arr[a].id)
          }
        }
      }
    }
  }
}

/**
 * 查找或替换
 * @param type 1查找2替换
 */
export function findAndReplace(type) {
  if (type === 1) {
    CodeMirror.commands.replace(editorObj, true)
  }
  if (type === 2) {
    CodeMirror.commands.find(editorObj)
  }
}

/**
 * 对sql编辑器里的选中值进行大小写转换
 * @param type 1大写 2小写
 */
export function caseTransformation(type) {
  var selectValue = editorObj.getSelection()
  if (selectValue !== '' && typeof selectValue !== 'undefined') {
    if (type === 1) {
      selectValue = selectValue.toUpperCase()
    }
    if (type === 2) {
      selectValue = selectValue.toLocaleLowerCase()
    }
    editorObj.replaceSelection(selectValue)
  } else {
    this.$message({
      message: '请选择转换内容',
    });
    // alertMsg('提示', '请选择转换内容', 'info')
  }
}

/**
 *注释选中行
 */
export function selectSqlNotes() {
  if (editorObj.somethingSelected()) {
    var strSelect = editorObj.getSelection()
    if (strSelect.length >= 2) {
      // 如果字符串开头不为/*，则可以进行下面操作
      var fststr = strSelect.substring(0, 2)
      if (fststr !== '/*') {
        // 如果字符串最后是*/，则需要替换成
        var latstr = strSelect.substring(strSelect.length - 2, strSelect.length)
        if (latstr === '*/') {
          strSelect = '/*' + strSelect.substring(0, strSelect.length - 2) + '*\\*/'
        } else {
          strSelect = '/*' + strSelect + '*/'
        }
      }
    } else {
      strSelect = '/*' + strSelect + '*/'
    }
    editorObj.replaceSelection(strSelect)
    // 如果有参数，替换显示状态
    var newParamObj = { 'arr': [] }// 为了调用replaceParam方法申明的变量
    for (var i = 0; i < paramObj.arr.length; i++) { // 循环有效的参数数组
      if (strSelect.indexOf(paramObj.arr[i].id) > -1) { // 找出注释SQL语句中所包含的参数
        newParamObj.arr.push(paramObj.arr[i])
      }
    }
    replaceParam(newParamObj)
  } else {
    this.$message({
      message: '请选择注释内容',
    });
    // alert('请选择注释内容')
  }
}

/**
 * 取消注释选中行
 */
export function selectSqlCancelNotes() {
  if (editorObj.somethingSelected()) {
    var strSelect = editorObj.getSelection()
    var fststr = strSelect.substring(0, 2)
    if (fststr === '/*') {
      strSelect = strSelect.substring(2, strSelect.length)
    }
    if (strSelect.length > 3) {
      var latfourstr = strSelect.substring(strSelect.length - 4, strSelect.length)
      var lattwostr = strSelect.substring(strSelect.length - 2, strSelect.length)
      if (latfourstr === '*\*/') {
        strSelect = strSelect.substring(0, strSelect.length - 4) + '*/'
      } else if (lattwostr === '*/') {
        strSelect = strSelect.substring(0, strSelect.length - 2)
      }
    }
    editorObj.replaceSelection(strSelect)
    // 如果有参数，替换显示状态
    var newParamObj = { 'arr': [] }// 为了调用replaceParam方法申明的变量
    for (var i = 0; i < paramObj.arr.length; i++) { // 循环有效的参数数组
      if (strSelect.indexOf(paramObj.arr[i].id) > -1) { // 找出注释SQL语句中所包含的参数
        newParamObj.arr.push(paramObj.arr[i])
      }
    }
    replaceParam(newParamObj)
  } else {
    this.$message({
      message: '请选择待取消注释的内容',
    });
    // alert('请选择待取消注释的内容')
  }
}

/**
 *标记选中行
 */
 export function bjSqlNotes() {
  if (editorObj.somethingSelected()) {
    var strSelect = editorObj.getSelection()
    if (strSelect.length >= 2) {
      // 如果字符串开头不为/*，则可以进行下面操作
      var fststr = strSelect.substring(0, 2)
      if (fststr !== '{$') {
        // 如果字符串最后是*/，则需要替换成
        var latstr = strSelect.substring(strSelect.length - 2, strSelect.length)
        if (latstr === '$}') {
          strSelect = '{$' + strSelect.substring(0, strSelect.length - 2) + '*\\$}'
        } else {
          strSelect = '{$' + strSelect + '$}'
        }
      }
    } else {
      strSelect = '{$' + strSelect + '$}'
    }
    editorObj.replaceSelection(strSelect)
    // 如果有参数，替换显示状态
    var newParamObj = { 'arr': [] }// 为了调用replaceParam方法申明的变量
    for (var i = 0; i < paramObj.arr.length; i++) { // 循环有效的参数数组
      if (strSelect.indexOf(paramObj.arr[i].id) > -1) { // 找出注释SQL语句中所包含的参数
        newParamObj.arr.push(paramObj.arr[i])
      }
    }
    replaceParam(newParamObj)
  } else {
    this.$message({
      message: '请选择标记内容',
    });
    // alert('请选择注释内容')
  }
}

/**
 * 获取SQL编辑器里面的对象
 * @returns {{arr: [], flag: (jQuery|string|undefined|*), InfoFlag: jQuery, outColumn: jQuery, flag2: (jQuery|string|undefined), sql: *}}
 */
export function getSaveInfo() {
  //
  // 组装对象
  var returnObj = {
    sqlValue: editorObj.getValue(),
    params: [],
    modelChartSetup: modelChartSetup
  }
  for (var i = 0; i < paramDivArr.length; i++) {
    if (paramDivArr[i].opt === 1) { // 如果当前参数有效
      for (var j = 0; j < paramObj.arr.length; j++) {
        if (paramDivArr[i].id === paramObj.arr[j].id) { // 在已拖拽过得参数（包含中间删掉的参数）中匹配参数
          returnObj.params.push(paramObj.arr[j])
          break
        }
      }
    }
  }
  return returnObj
}

/**
 * 生成select语句
 * @param menuId 菜单编号
 */
export function getSelectSql(menuId) {
  hideRMenu(menuId)
  var nodes = zTreeObj.getSelectedNodes()
  if (nodes.length > 0) {
    var tableName = nodes[0].enName
    var tableMetaUuid = nodes[0].id
    var columns = CodeMirror.tableColMapping[tableName]
    var oldSql = editorObj.getValue()
    if (!columns || (columns && columns.length === 0)) {
      request({
        baseURL: dataUrl,
        url: '/tableMeta/getCols',
        method: 'post',
        params: { tableMetaUuid: tableMetaUuid, isEnclose: "1" }
      }).then(result => {
        if (result.data == undefined || result.data == null) {
          return
        } else {
          if (result.data && result.data.length > 0) {
            var columns = []
            var enColumns = []
            for (var i = 0; i < result.data.length; i++) {
              if (result.data[i].chnName == '' || result.data[i].chnName == null || result.data[i].chnName == undefined) {
                columns.push(result.data[i].colName)
                enColumns.push(result.data[i].colName)
              } else {
                columns.push(result.data[i].chnName)
                enColumns.push(result.data[i].colName)
                editorObj.options.hintOptions.tablesTitle[result.data[i].colName] = result.data[i].chnName
              }
            }
            CodeMirror.tableColMapping[tableName] = enColumns
            editorObj.options.hintOptions.tables[tableName] = enColumns
            getSelectSQLByColumns(enColumns, tableName, oldSql, null)
          } else {
          }
        }
      })
    } else {
      getSelectSQLByColumns(columns, tableName, oldSql, null)
    }
  }
}

/**
 * 获取数据表的列后组装SELECT语句并格式化
 * @param columns 数据表的列
 * @param tableName 数据表名称
 * @param oldSql SQL编辑器内原语句
 * @param loading 有遮罩层就传，没有就传null
 */
function getSelectSQLByColumns(columns, tableName, oldSql, loading) {
  var sql = 'SELECT '
  $(columns).each(function (idx) {
    if (idx !== 0) {
      sql += ',' + this
    } else {
      sql += this
    }
  })
  sql += ' FROM ' + tableName
  request({
    baseURL: analysisUrl,
    url: '/SQLEditorController/formatSql',
    method: 'post',
    data: { 'sql': sql }
  }).then(result => {
    if (result.data.isError) {
      if (loading) {
        loading.destroy()
      }
      this.$message({
        message: 'SQL语句书写不正确，格式化时出错',
      });
      // alert('SQL语句书写不正确，格式化时出错')
    } else {
      editorObj.setValue(oldSql === '' ? result.data.sql : oldSql + '\n' + result.data.sql)
      // 如果有参数，替换显示状态
      var newParamObj = { 'arr': [] }// 为了调用replaceParam方法申明的变量
      for (var i = 0; i < paramObj.arr.length; i++) { // 循环有效的参数数组
        if (oldSql.indexOf(paramObj.arr[i].id) != -1) { // 找出注释SQL语句中所包含的参数
          newParamObj.arr.push(paramObj.arr[i])
        }
      }
      replaceParam(newParamObj)
      if (loading) {
        loading.destroy()
      }
    }
  })
}

/**
 * 保存SQL
 */
export function saveSqlDraft(data) {
  return request({
    baseURL: analysisUrl,
    url: '/sqlDraft/save',
    method: 'post',
    data
  })
}

/**
 * 获取保存SQL草稿的数据
 * @param type 1、保存 2、另存为
 * @returns {{}}
 */
export function getSaveSqlDraftObj(type) {
  if (type == 1) {
    var sql = editorObj.getValue()
    if (sqlDraftObj != undefined) {
      sqlDraftObj.isOld = true
      sqlDraftObj.draftSql = sql
      sqlDraftObj.paramJson = JSON.stringify(paramObj)
      return sqlDraftObj
    } else {
      return getSqlDraftObj()
    }
  } else if (type == 2) {
    return getSqlDraftObj()
  }
}

/**
 * 获取sql草稿对象
 * @returns {{}}
 */
function getSqlDraftObj() {
  var data = {}
  data.draftSql = editorObj.getValue()
  data.paramJson = JSON.stringify(paramObj)
  data.isOld = false
  return data
}
/**
 * 使用sql
 * @param returnObj sql草稿对象
 */
export function useSql(returnObj) {
  if (returnObj.sqlDraftObj.paramJson !== '' && returnObj.sqlDraftObj.paramJson !== '{}') {
    // 有参数树时才能执行此方法
    paramObj = JSON.parse(returnObj.sqlDraftObj.paramJson)
  }
  sqlDraftObj = returnObj.sqlDraftObj
  $('#sqlDraft').html('当前SQL名称：' + sqlDraftObj.draftTitle).show()
  editorObj.setValue(sqlDraftObj.draftSql)
  $('#modelDesign').data(JSON.parse(sqlDraftObj.paramJson))
  replaceParam(JSON.parse(sqlDraftObj.paramJson))
}

/**
 * 获取sql
 */
export function getSql() {
  var result = {}
  var isAllExecute = false
  var selText = editorObj.getSelection()
  if ($.trim(selText) === '' || selText === editorObj.getValue()) {
    selText = editorObj.getValue()
    isAllExecute = true
  }
  result.isAllExecute = isAllExecute
  result.sql = selText
  return result
}

// 校验sql 只返回true或者false
export async function verifySql() {
  var selText = editorObj.getSelection()
  if ($.trim(selText) === '') {
    selText = editorObj.getValue()
  }
  console.log(selText)
  if (paramObj && Object.keys(paramObj).length > 0) {
    var arr = paramObj.arr
    for (var i = 0; i < arr.length; i++) {
      selText = selText.replace(arr[i].id, arr[i].name + '_rpm_JL')
    }
  }
  var data = { sqls: selText }
  return await request({
    baseURL: analysisUrl,
    url: '/SQLEditorController/checkSql',
    method: 'post',
    data
  })
}

/**
 * 执行SQL
 */
export function executeSQL() {
  // 显示最大化按钮
  $('.max-size').show()
  // 这是存放参数的数组
  var arr = new Array()
  var selText = editorObj.getSelection()
  var isAllRun = true
  // 如果选中执行等于全部待执行SQL或者没有选中直接执行SQL 则视为满足模型生成条件第一条 即：必须将SQL编译器的内容全部执行才可以保存模型结果 flag为控制标识
  if ($.trim(selText) === '' || selText === editorObj.getValue()) {
    selText = editorObj.getValue()
  } else {
    isAllRun = false
  }
  // 处理带参数的sql语句 去掉被删除的参数
  for (var i = 0; i < paramDivArr.length; i++) {
    if (paramDivArr[i].opt === 1) { // 如果当前参数有效
      for (var j = 0; j < paramObj.arr.length; j++) {
        if (paramDivArr[i].id === paramObj.arr[j].id) { // 在已拖拽过得参数（包含中间删掉的参数）中匹配参数
          arr.push(paramObj.arr[j])
          break
        }
      }
    }
  }
  paramObj.arr = arr
  paramObj.sql = selText
  // 将SQL送入后台然后等待websocket将结果返回
  var parArrs = []
  for (var i = 0; i < arr.length; i++) {
    if (selText.indexOf(arr[i].id) > -1) {
      parArrs.push(arr[i])
    }
  }
  if (parArrs.length === 0) {
    var data = {
      sqls: selText,
      isExistParam: false
    }
    return data
  } else {
    paramObj.isExistParam = true
    return paramObj
    // alert('带参数的sql暂不支持');
  }
}

/**
 * 开始执行SQL
 * @param {*} data 要执行的数据
 */
export function startExecuteSql(data) {
  return request({
    baseURL: analysisUrl,
    url: '/SQLEditorController/executeSql',
    method: 'post',
    data
  })
}

/**
 * 获取执行任务
 * @param {*} data 要执行的数据
 */
export function getExecuteTask(data, dataUserId, sceneCode) {
  var dataUserId1 = ''
  var sceneCode1 = ''
  if (dataUserId != undefined && sceneCode != undefined) {
    dataUserId1 = dataUserId
    sceneCode1 = sceneCode
  } else {
    dataUserId1 = store.getters.datauserid
    sceneCode1 = store.getters.scenecode
  }
  data.userId = dataUserId1;
  data.sceneCode = sceneCode1;
  return request({
    baseURL: analysisUrl,
    url: '/SQLEditorController/getExecuteTask',
    method: 'post',
    data
  })
}

/**
 * 编辑模型
 * @param sql 要编辑的sql
 * @param paramObjOne 参数对象
 */
export function editorSql(sql, paramObjOne) {
  editorObj.setValue(sql)
  paramObj = paramObjOne
  replaceParam(paramObjOne)
}

export function refreshCodeMirror() {
  // 修复sql编辑区多次加载界面错位情况，手动刷新codeMirror
  setTimeout(() => {
    editorObj.refresh()
  }, 1)// 让编辑器每次在调用的时候进行自动刷新
  // $('#sql').click()
  $(sqlEditorVue.$refs.sql).click()
}

/**
 * 将编写好的替换参数前的sql传入后台
 * @param {*} data
 */
export function getColumnSqlInfo(data) {
  return request({
    baseURL: analysisUrl,
    url: '/SQLEditorController/getColumnSqlInfo',
    method: 'post',
    data
  })
}

/**
 * 获取是否被修改
 * @returns {boolean}
 */
export function getIsUpdate() {
  return isUpdate
}

/**
 * 设置sql的被修改状态
 * @param value true或false
 */
export function setIsUpdate(value) {
  isUpdate = value
}

export function getUuid() {
  var s = []
  var hexDigits = '0123456789abcdef'
  for (var i = 0; i < 32; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23]
  var uuid = s.join('')
  return uuid
}

/**
 * 根据登录人的Uuid查询此人有没有默认的模型结果保存路径
 */
export function getDefaultSqlEditorLocationByPersonUuid() {
  return request({
    baseURL: analysisUrl,
    url: '/defaultSqlLocation/getByPersonUuid',
    method: 'get'
  })
}

/**
 * 保存当前登录人在sql编辑器所选择的默认执行路径方便下次使用
 * @param data  对象
 * @returns {AxiosPromise}
 */
export function saveSqlEditorExecuteDefaultPath(data) {
  return request({
    baseURL: analysisUrl,
    url: '/defaultSqlLocation/save',
    method: 'post',
    data
  })
}

export async function getGraphSaveInfo() {
  var returnObj = {
    "isError": false,
    "message": "",
    "sql": editorObj.getValue(),
    "isChange": false
  };
  //检查SQL语句是否发生变化
  const response = await compareSql({ "oldSql": sqlEditorVue.sqlValue, "newSql": returnObj.sql })
  if (response.data == null || response.data.isError) {
    returnObj.isError = true;
    returnObj.message = "检测SQL语句是否改变发生错误";
  } else {
    if (response.data.isChange) {
      returnObj.message = "系统检查到SQL语句已发生改变，可能会影响已配置的参数信息";
    }
    returnObj.isChange = response.data.isChange;
  }
  return returnObj;
}

/**
 * 获取选中节点
 * @returns {*}
 */
export function getZtreeSelectNode() {
  var nodes = zTreeObj.getSelectedNodes()
  return nodes
}
