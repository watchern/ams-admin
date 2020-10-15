import request from '@/utils/request'
const analysisUrl = '/analysis'
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
 * 列图标路径
 * @type {string}
 */
var columnIconPath = '../../images/ico/column.png'

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
 * 初始化界面托拉拽事件
 */
export function initDragAndDrop() {
  // 实现左右拖拽改变大小
  var container = document.getElementById('container')
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
  vertical.onmousedown = function(e) {
    var disX = (e || event).clientX
    vertical.left = vertical.offsetLeft
    document.onmousemove = function(e) {
      var iT = vertical.left + ((e || event).clientX - disX)
      var e = e || window.event; var tarnameb = e.target || e.srcElement
      var maxT = container.clientWight - vertical.offsetWidth
      vertical.style.margin = 0
      iT < 0 && (iT = 0)
      iT > maxT && (iT = maxT)
      vertical.style.left = leftPart.style.width = iT + 'px'
      rightContent.style.width = parseInt(container.clientWidth - iT - offset - 20) + 'px'
      return false
    }
    document.onmouseup = function() {
      document.onmousemove = null
      document.onmouseup = null
      vertical.releaseCapture && vertical.releaseCapture()
    }
    vertical.setCapture && vertical.setCapture()
    return false
  }

  // 实现上下拖拽改变大小
  var rightPart = document.getElementById('rightPart')
  var topPart = document.getElementById('sqlEditorDiv')
  var bottomPart = document.getElementById('bottomPart')
  var horizontal = document.getElementById('horizontal')
  horizontal.onmousedown = function(e) {
    var disY = (e || event).clientY
    horizontal.top = horizontal.offsetTop
    var grids = $('.ui-jqgrid-bdiv').eq(0)[0]
    document.onmousemove = function(e) {
      var iT = horizontal.top + ((e || event).clientY - disY)
      var e = e || window.event; var tarnameb = e.target || e.srcElement
      var maxT = (rightPart.clientHeight == 0 ? rightPart.scrollHeight : rightPart.clientHeight) - horizontal.offsetHeight
      horizontal.style.margin = 0
      iT < 0 && (iT = 0)
      iT > maxT && (iT = maxT)
      var cmWrap = $('.CodeMirror-wrap')[0]
      horizontal.style.top = topPart.style.height = iT + 'px'
      cmWrap.style.height = iT - 38 + 'px'
      bottomPart.style.height = rightPart.clientHeight - iT + 'px'
      if (grids) {
        grids.style.height = rightPart.clientHeight - iT - 197 + 'px'
      }
      return false
    }
    document.onmouseup = function() {
      document.onmousemove = null
      document.onmouseup = null
      horizontal.releaseCapture && horizontal.releaseCapture()
    }
    horizontal.setCapture && horizontal.setCapture()
    return false
  }
}

/**
 * 初始化时间
 */
export function initEvent() {
  $('body').mousemove(function(e) {
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
 * @param relTableMap 只能提示的表对象
 * @returns {CodeMirror.EditorFromTextArea}
 */
export function initSQLEditor(textarea, relTableMap) {
  // 展示运行结果区域
  $('#exeResultTitle').tab('show')
  // 初始化CodeMirror
  var editor = CodeMirror.fromTextArea(textarea, {
    mode: 'text/x-mssql',
    theme: 'idea',
    indentWithTabs: true,
    lineNumbers: true,
    lineWrapping: true,
    smartIndent: true,
    autofocus: true,
    matchBrackets: true,
    styleActiveLine: false,
    hintOptions: {
      tables: relTableMap
    }
  })
  // 输入时事件cursorActivity
  editor.on('cursorActivity', function(cm) {
    if (cm.curOp.focus === false) {
      initHint(editor)
    }
    $('span').removeClass('errorHighlight')
  })
  editor.on('beforeChange', function(instance, changeObj) {
    if (changeObj.origin === 'paste' && isFirstPaste) {
      cursor = editor.getCursor()
      checkSqlText = editor.getRange({ ch: 0, line: cursor.line }, { ch: cursor.ch, line: cursor.line })
      isFirstPaste = false
    }
  })
  editor.on('change', function(instance, changeObj) {
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
    if (changeObj.origin === 'paste' && paramObj && paramObj.arr.length > 0) {
      var hasPaste = false
      for (var i = 0; i < paramObj.arr.length; i++) {
        if (changeText.indexOf(paramObj.arr[i].id) != -1) { // 如果粘贴的是已含有的参数
          var copyParamId = new UUIDGenerator().id
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
  var shieldString = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', ' ', ',', '-', '_', '=', '+', '-', '/', ';']
  // 如果用户输入空格，则退回
  if ($.trim(words) === '') {
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
    setTimeout(function() {
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
export function initTableTree() {
  // 数据表树加载,开始
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
      beforeDrag: function(treeId, treeNodes) {
        // 如果是表，视图或者列则允许拖动 否则不可以
        if (treeNodes[0] && (treeNodes[0].type === 'table' || treeNodes[0].type === 'view' || treeNodes[0].type === 'datasource' || treeNodes[0].type === 'column')) {
          return true
        } else {
          return false
        }
      },
      onRightClick: function(event, treeId, treeNode) {
        if (!treeNode) {
          return false
        }
        zTreeObj.selectNode(treeNode)
        var menuId = ''
        var numm = $(document).height() - event.clientY
        if (treeNode.type === 'table' || treeNode.type === 'view' || treeNode.type === 'datasource') {
          menuId = 'tableMenu'
          history.scrollRestoration = 'manual'
          if (treeNode.idPath.indexOf('bussDataRoot') == -1 || treeNode.pid === 'tempTable' || treeNode.pid === 'modelResultTable' || treeNode.pid == 'graphDataTable') {
            menuId = 'tableMenuTwo'
          }
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
      onExpand: function(event, treeId, treeNode) {
        if ((!treeNode.children || treeNode.children.length === 0) && treeNode.type === 'table' || treeNode.type === 'view' || treeNode.type === 'datasource') {
          zTreeObj.removeChildNodes(treeNode)
          var tableName = treeNode.name
          // 先从codeMirror里面找 如果能找到则不找数据库  找不到则找数据库
          var columns = CodeMirror.tableColMapping[tableName]
          if (!columns || (columns && columns.length === 0)) {
            request({
              baseURL: analysisUrl,
              url: '/SQLEditorController/getTableColsByName',
              method: 'get'
            }).then(result => {
              if (result.data.isError) {
                alert('错误' + e.message + 'error')
              } else {
                if (result.data.columns && result.data.columns.length > 0) {
                  CodeMirror.tableColMapping[tableName] = result.data.columns
                  editorObj.options.hintOptions.tables[tableName] = result.data.columns
                  var nodeList = []
                  $(result.data.columns).each(function() {
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
            $(columns).each(function() {
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
  // 调用后台获取数据表数据
  request({
    baseURL: analysisUrl,
    url: '/SQLEditorController/getTableTree',
    method: 'get'
  }).then(result => {
    result.data.push({
      'id': 'ALL_DATA',
      'pid': null,
      'name': '所有数据',
      'displayName': '所有数据',
      'type': 'ALL_DATA',
      'isParent': true,
      'open': true,
      'level': 0
    })
    zTreeObj = $.fn.zTree.init($('#dataTree'), setting, result.data)
  })
}

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
      onDrop: function(event, treeId, treeNodes) {
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
        var copyParamId = new UUIDGenerator().id
        var id = '{#' + copyParamId + '#}'
        editorObj.replaceRange(id, cursor, cursor)
        var dom = $("<button class='divEditorBtn' id='" + id + "'>" + treeNodes[0].name + '</buttonn>').get(0)
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
      beforeDrag: function(treeId, treeNodes) {
        // 如果是参数 允许拖动 否则不可以
        var thisNode = treeNodes[0]
        if (thisNode.type !== 'paramNode') {
          return false
        }
      },
      onRightClick: function(event, treeId, treeNode) {
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
      onExpand: function(event, treeId, treeNode) {
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
  request({
    baseURL: analysisUrl,
    url: '/SQLEditorController/getParamTree',
    method: 'get'
  }).then(result => {
    if (result.data.isError) {

    } else {
      paramZtree = $.fn.zTree.init($('#paramTree'), paramSetting, result.data.paramNode)
    }
  })
}
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
  dragOne(treeNodes[0]['name'], cursor, cursor)
}

/**
 * 初始化只能提示的数据表
 * @returns {AxiosPromise}
 */
export function initTableTip() {
  return request({
    baseURL: analysisUrl,
    url: '/SQLEditorController/getTableColumnRelationsMap',
    method: 'get'
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
  if (w_ < $('#' + menuId).width()) {
    x = $('#' + containerId).width() - $('#' + menuId).width()
  }
  $('#' + menuId + ' ul').show()
  $('#' + menuId).css({ 'top': y + 'px', 'left': x + 'px', 'visibility': 'visible' })
  $('body').bind('mousedown', { 'menuId': menuId }, onBodyMouseDown)
}

/**
 * 隐藏菜单
 * @param menuId 要隐藏的编号
 */
function hideRMenu(menuId) {
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
      beforeDrag: function(treeId, treeNodes) {
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
          nodes[i].icon = '../../images/ico/function.png'
        } else {
          nodes[i].icon = '../images/ico/function.png'
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
  request({
    baseURL: analysisUrl,
    url: '/SQLEditorController/getFolderAndParams',
    method: 'get',
    params: dataParam
  }).then(result => {
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
        var dom = $("<button class='divEditorBtn' id='" + arr[a].id + "'>" + arr[a].name + '</buttonn>').get(0)
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
    method: 'get',
    params: param
  }).then(result => {
    if (result.data.isError) {
      alert('SQL语句书写不正确，格式化时出错')
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
          var dom = $("<button class='divEditorBtn' id='" + arr[a].id + "'>" + arr[a].name + '</buttonn>').get(0)
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
    alertMsg('提示', '请选择转换内容', 'info')
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
    alert('请选择注释内容')
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
    alert('请选择待取消注释的内容')
  }
}
