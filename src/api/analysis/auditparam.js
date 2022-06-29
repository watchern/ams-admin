import request from '@/utils/request'
import _ from 'lodash'

import * as paramCommonJs from "@/api/graphtool/js/paramCommon";
let settingVue = null
export const sendSettingVue = ( (_this) => {
  settingVue = _this
})
const analysisUrl = '/analysis'
/**
 * 参数树对象
 */
var paramZtree

var tabsigns = 0

var overallParmaobj = {}

var overallParmaobjc = {}

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
      selectedMulti: false // 设置是否允许同时选中多个节点
    },
    callback: {
      onRightClick: function (event, treeId, treeNode) {
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
  views['fontCss'] = setFontCss // 给view的颜色设置成黑色
  treeObj.updateNode()
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
 * 参数列表模糊查询
 * @param {*} data 分页对象，里面包含参数对象
 */
export function getListByAmmParam(data) {
  return request({
    baseURL: analysisUrl,
    url: '/paramController/listByAmmParam',
    method: 'post',
    data
  })
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
  })
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
  })
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
  })
}

var arr = [] // 用来存储本次设置的参数数组信息
var replaceSql = '' // 待替换的SQL语句（含参数）
/**
 * 根据有效的参数数组组织参数html界面
 * @param paramsArr 有效的参数数组集合（模型不用传此参数）
 * @param name 标题名称（可以是SQL编辑器或某个模型的名称）
 * @param modelId 模型名称（SQL编辑器不用传此参数）
 * @description 只适用于SQL编辑器执行和单个模型的运行
 * paramsArr中的对象结构：
 * var obj = {
 *      "id" : xx,//加上占位符后的复制参数ID
 *      "copyParamId" : xx,//复制参数ID
 *      "moduleParamId":xx,//复制参数的母参ID
 *      "allowedNull": xx,//是否允许为空（0、否，1、是）
 *      "name" : xx//参数名称
 *  }
 * @author 梁瑞
 */
export function initParamHtml(sql, paramsArr, name, id,serviceInfo) {
  if(serviceInfo==undefined){
    serviceInfo = ''
  }
  var paramObj = {
    'sql': sql,
    'paramsArr': paramsArr
  }
  overallParmaobj[id] = paramObj
  replaceSql = sql
  // $('#' + id + '1').find('a').html(name)
  try {
    // 获取数据库所有母参数信息集合以及该模型用到的参数集合（可以不传模型ID）
    findParamsAndModelRelParams().then((e) => {
      if (e.isError) {
        this.$message({
          type: 'error',
          message: e.data.message
        })
        // this.$message(e.data.message)
        // alertMsg("错误", e.data.message, "info");
      } else {
        var paramList = e.data.paramList // 定义所有母参信息数组
        arr = paramsArr
        var paramHtml = ''
        var moduleParamIdArr = [] // 存放已匹配的母参ID
        var isError = false
        var message = ''
        paramsArrFor: for (var i = 0; i < paramsArr.length; i++) { // 遍历所有有效参数
          for (var j = 0; j < paramList.length; j++) { // 遍历所有母参
            var description = '（参数说明：无）'
            if (typeof paramList[j].description !== 'undefined') {
              description = '（参数说明：' + paramList[j].description + '）'
            }
            if (paramsArr[i].moduleParamId === paramList[j].ammParamUuid && $.inArray(paramsArr[i].moduleParamId, moduleParamIdArr) == -1) { // 匹配复制参数的母版参数ID
              paramList[j].defaultVal = JSON.stringify(paramsArr[i])
              paramHtml += "<div class='row'><div class='col-sm-12'><div class='form-group'><label class='col-sm-2' style='text-align: right;padding: 10px 7px;'>" + paramsArr[i].name + "&nbsp;&nbsp;</label><div class='col-sm-4'>" // 加上前面的参数名称
              var RO = initParamHtml_Common(paramList[j],undefined,undefined,serviceInfo)
              if (RO.isError) {
                isError = RO.isError
                message = RO.message
                paramHtml += "</div><label class='col-sm-4'></label></div></div></div>"
              } else {
                paramHtml += RO.htmlContent + RO.spanHtml + "</div><label class='col-sm-4' style='padding: 10px 7px;'>" + description + '</label></div></div></div>'
              }
              moduleParamIdArr.push(paramsArr[i].moduleParamId)
              break
            }
          }
          if (isError) {
            break paramsArrFor
          }
        }
        if (isError) {
          this.$message({
            type: 'error',
            message: message
          })
          // this.$message(message)
          // alertMsg("错误", message, "info");
        } else {
          // $(".panel-body").html(paramHtml);
          $('#' + id).html(paramHtml)
          if(paramsArr.length==0){
            var paramHtml = "<div align='center' style='font-weight:lighter ;font-size:15px' >该模型没有参数</div>"
            $('#' + id).html(paramHtml)
          }
          initParamInputAndSelect(id,serviceInfo)
        }
      }
    })
  } catch (e) {
    console.info(e)
  }
}

/**
 * 根据有效的参数数组组织参数html界面 横向渲染
 * @param paramsArr 有效的参数数组集合（模型不用传此参数）
 * @param name 标题名称（可以是SQL编辑器或某个模型的名称）
 * @param modelId 模型名称（SQL编辑器不用传此参数）
 * @description 只适用于SQL编辑器执行和单个模型的运行
 * paramsArr中的对象结构：
 * var obj = {
 *      "id" : xx,//加上占位符后的复制参数ID
 *      "copyParamId" : xx,//复制参数ID
 *      "moduleParamId":xx,//复制参数的母参ID
 *      "allowedNull": xx,//是否允许为空（0、否，1、是）
 *      "name" : xx//参数名称
 *  }
 * @author 梁瑞
 */
export function initcrossrangeParamHtml(sql, paramsArr, name, id) {
  var paramObj = {
    'sql': sql,
    'paramsArr': paramsArr
  }
  overallParmaobjc[id] = paramObj
  replaceSql = sql
  $('#accordion').find('a').html(name)
  try {
    // 获取数据库所有母参数信息集合以及该模型用到的参数集合（可以不传模型ID）
    findParamsAndModelRelParams().then((e) => {
      if (e.isError) {
        this.$message({
          type: 'error',
          message: e.data.message
        })
        // this.$message(e.data.message)
        // alertMsg("错误", e.data.message, "info");
      } else {
        var paramList = e.data.paramList // 定义所有母参信息数组
        arr = paramsArr
        var paramHtml = ''
        var moduleParamIdArr = [] // 存放已匹配的母参ID
        var isError = false
        var message = ''
        paramsArrFor: for (var i = 0; i < paramsArr.length; i++) { // 遍历所有有效参数
          for (var j = 0; j < paramList.length; j++) { // 遍历所有母参
            var description = '（参数说明：无）'
            if (typeof paramList[j].description !== 'undefined') {
              description = '（参数说明：' + paramList[j].description + '）'
            }
            if (paramsArr[i].moduleParamId === paramList[j].ammParamUuid && $.inArray(paramsArr[i].moduleParamId, moduleParamIdArr) == -1) { // 匹配复制参数的母版参数ID
              paramList[j].defaultVal = JSON.stringify(paramsArr[i])
              paramHtml += "<div class='row' style='white-space: nowrap;'><div class='col-sm-12'><div class='form-group'><label class='col-sm-2' style='text-align: right;padding: 10px 7px;width:100px'>" + paramsArr[i].name + "&nbsp;&nbsp;</label><div class='col-sm-4'>" // 加上前面的参数名称
              var RO = initCrossrangeParamHtml_Common(paramList[j])
              if (RO.isError) {
                isError = RO.isError
                message = RO.message
                paramHtml += "</div><label class='col-sm-4'></label></div></div></div>"
              } else {
                paramHtml += RO.htmlContent + RO.spanHtml + '</div></div></div></div>'
              }
              moduleParamIdArr.push(paramsArr[i].moduleParamId)
              break
            }
          }
          if (isError) {
            break paramsArrFor
          }
        }
        if (isError) {
          this.$message({
            type: 'error',
            message: message
          })
          // this.$message(message)
          // alertMsg("错误", message, "info");
        } else {
          // $(".panel-body").html(paramHtml);
          $('#' + id).html(paramHtml)
          initParamInputAndSelect(id)
        }
      }
    })
  } catch (e) {
    console.info(e)
  }
}

/**
 * 根据参数类型组织参数的HTML元素
 * createParamNodeHtml()方法内部调用的方法
 * @param paramObj 参数对象
 * @param selectNum 下拉列表参数的个数
 * @param selectTreeNum 下拉树参数的个数
 * @author JL
 */
export function initParamHtml_Common(paramObj, selectNum, selectTreeNum,serviceInfo) {
  if(serviceInfo==undefined){
    serviceInfo = ''
  }
  var obj = {
    'htmlContent': '',
    'isError': false,
    'message': ''
  }
  var divWidth = 'width: calc(100% - 40px);'
  var title = paramObj.paramChoice.allowedNull === 0 ? '不可为空' : '可为空'
  obj.spanHtml = paramObj.paramChoice.allowedNull === 0 ? '<div style="color: red;display: inline-block;font-weight: bold;font-size: 20px;">*&nbsp&nbsp</div>' : '' // 如果不可为空则在后面加上*
  switch (paramObj.inputType) {
    case 'lineinp': // 下拉列表
      var hasSql = false // 下拉列表是非SQL方式或者是SQL方式但值为空
      var dataArr = [] // 下拉列表数据的数组
      var paramArr = [] // 影响当前参数的主参集合
      var associatedParamIdArr = [] // 受当前参数影响的被关联参数ID集合
      var paramSql = paramObj.paramChoice.optionsSql
      // 备选sql为空的情况下 取静态的option值
      if (!paramSql) { // 如果没有被选sql的时候进入
        $.each(paramObj.paramChoice.ammParamOptionsList, function (i, v) {
          if (v.optionsVal && v.optionsName) {
            // 组织下拉选项数据
            var optionObj = {
              'name': v.optionsName,
              'value': v.optionsVal
            }
            dataArr.push(optionObj)
          }
        })
      } else { // 如果有被选sql的时候
        if (paramSql !== '') {
          hasSql = true // 下拉列表是SQL方式
          if (typeof paramObj.defaultVal !== 'undefined') { // 如果有该参数默认值，则直接执行备选SQL加载初始化数据  当时写的时候有sql和没sql是分开的
              executeParamSql(paramObj.paramChoice.optionsSql).then(e => {
              if (e.data.isError) {
                obj.isError = true
                obj.message = '获取参数【' + paramObj.paramName + '】的值的失败，原因：' + e.data.message
              } else {
                if (e.data.paramList && e.data.paramList.length > 0) {//paramList
                  for (var k = 0; k < e.data.paramList.length; k++) {
                    var paramObj = {
                      'name': e.data.paramList[k].paramName,
                      'value': e.data.paramList[k].paramValue
                    }
                    dataArr.push(paramObj)
                  }
                }
              }
            }).catch(function () {
              obj.isError = true
              obj.message = '获取参数【' + paramObj.paramName + '】的值的请求失败'
            })
          }
        }
      }
      var divId = 'selectParam' + (typeof selectNum !== 'undefined' ? selectNum : paramObj.ammParamUuid)+serviceInfo
      obj.htmlContent += "<div id='" + divId + "' title='" + title + "'  data-id='" + paramObj.ammParamUuid + "' data-name='" + paramObj.paramName + "' data-choiceType='" + paramObj.paramChoice.choiceType + "'" +
        (hasSql ? " data-sql='" + paramSql + "' data-paramArr='" + JSON.stringify(paramArr) + "' data-associatedParamIdArr='" + JSON.stringify(associatedParamIdArr) + "' " : '') +
        (typeof paramObj.defaultVal !== 'undefined' ? " data-defaultVal='" + paramObj.defaultVal + "' " : '') +
        (dataArr.length > 0 ? " data='" + JSON.stringify(dataArr) + "' " : '') +
        (typeof paramObj.paramChoice.allowedNull !== 'undefined' ? " data-allowedNull='" + paramObj.paramChoice.allowedNull + "' " : '') +
        " class='xm-select-demo selectParam paramTr' style='" + divWidth + "display: inline-block;'></div>"
      if (typeof selectNum !== 'undefined') {
        obj.selectNum = selectNum + 1
      }
      break
    case 'textinp': // 文本框
      if (typeof paramObj.dataLength !== 'undefined') {
        title += ',参数值的长度为' + paramObj.dataLength
      }
      obj.htmlContent += "<input type='text' title='" + title + "' class='textParam paramOption form-control paramTr' data-id='" + paramObj.ammParamUuid + "' data-name='" + paramObj.paramName + "'" +
        (typeof paramObj.paramChoice.allowedNull !== 'undefined' ? " data-allowedNull='" + paramObj.paramChoice.allowedNull + "' " : '') +
        (typeof paramObj.defaultVal !== 'undefined' ? " data-defaultVal='" + paramObj.defaultVal + "' " : '') +
        (typeof paramObj.dataLength !== 'undefined' ? "data-dataLength='" + paramObj.dataLength + "'" : '') + " style='" + divWidth + "display: inline-block;'/>"
      break
    case 'timeinp': // 时间
      if (paramObj.dataType === 'date') { // 暂时只支持日期，不支持时间段
        obj.htmlContent += "<div class='input-group date form_date' title='" + title + "' data-date-format='yyyy-mm-dd' data-link-format='yyyy-mm-dd' style='" + divWidth + "display: inline-flex;'>" +
          "<input class='form-control paramOption dataParam paramTr' data-id='" + paramObj.ammParamUuid + "' data-name='" + paramObj.paramName + "' " +
          (typeof paramObj.paramChoice.allowedNull !== 'undefined' ? " data-allowedNull='" + paramObj.paramChoice.allowedNull + "' " : '') +
          (typeof paramObj.defaultVal !== 'undefined' ? " data-defaultVal='" + paramObj.defaultVal + "'" : '') + " readonly type='text'/>" +
          "<span class='input-group-addon' style='width: auto;'><span class='glyphicon glyphicon-remove'></span></span></div>"
      }
      break
    case 'treeinp': // 下拉树
      var dataArr = [] // 下拉树数据的数组
      var paramArr = [] // 影响当前参数的主参集合
      var associatedParamIdArr = [] // 受当前参数影响的被关联参数ID集合
      var paramSql = paramObj.paramChoice.optionsSql
      if (paramSql !== '') {
        if (typeof paramObj.defaultVal !== 'undefined') { // 如果有该参数默认值，则直接执行备选SQL加载初始化数据
          getSelectTreeData(paramSql).then(e => {
            if (e.data.isError) {
              obj.isError = true
              obj.message = '获取参数【' + paramObj.paramName + '】的值的失败，原因：' + e.data.message
            } else {
              dataArr = (e.data.result && e.data.result.length > 0) ? organizeSelectTreeData(e.data.result) : []
            }
          }).catch(function (error) {
            obj.isError = true
            obj.message = '获取参数【' + paramObj.paramName + '】的值的请求失败'
          })
        }
      }
      var divId = 'selectTreeParam' + (typeof selectTreeNum !== 'undefined' ? selectTreeNum : paramObj.ammParamUuid)+serviceInfo
      obj.htmlContent += "<div id='" + divId + "' title='" + title + "'  data-id='" + paramObj.ammParamUuid + "' data-name='" + paramObj.paramName + "' data-choiceType='" + paramObj.paramChoice.choiceType + "' " +
        (typeof paramObj.paramChoice.allowedNull !== 'undefined' ? " data-allowedNull='" + paramObj.paramChoice.allowedNull + "' " : '') +
        (paramSql !== '' ? " data-sql='" + paramSql + "' data-paramArr='" + JSON.stringify(paramArr) + "' data-associatedParamIdArr='" + JSON.stringify(associatedParamIdArr) + "' " : '') +
        (typeof paramObj.defaultVal !== 'undefined' ? " data-defaultVal='" + paramObj.defaultVal + "' data='" + JSON.stringify(dataArr) + "' " : '') +
        " class='xm-select-demo selectTreeParam paramTr' style='" + divWidth + "display: inline-block;'></div>"
      if (typeof selectTreeNum !== 'undefined') {
        obj.selectTreeNum = selectTreeNum + 1
      }
      break
  }
  return obj
}

/**
 * 初始化文本框、下拉列表、下拉树
 * @description 只适用于加载参数得html
 * @author JL
 */
function initParamInputAndSelect(id,serviceInfo) {
  if(serviceInfo==undefined){
    serviceInfo = ''
  }
  // 初始化普通文本框（只为反显默认值）
  if (($('#' + id).find('.textParam')).length > 0) {
    ($('#' + id).find('.textParam')).each(function (i, v) {
      // 设置默认值
      var defaultVal = $(this).attr('data-defaultVal')
      if (typeof defaultVal !== 'undefined') {
        var a = JSON.parse(defaultVal)
        var b = JSON.parse(defaultVal).paramValue
        $(this).val(JSON.parse(defaultVal).paramValue) // 设置默认值
      }
    })
  }
  // 初始化日期插件
  if (($('#' + id).find('.form_date')).length > 0) {
    ($('#' + id).find('.form_date')).each(function (i, v) {
      var setting = {
        format: 'yyyy-mm-dd',
        language: 'zh-CN',
        todayBtn: true,
        autoclose: true,
        todayHighlight: true,
        startView: 2,
        showMeridian: true,
        minView: 2
      }
      // 设置默认值
      var defaultVal = $(this).find('.dataParam').attr('data-defaultVal')
      if (typeof defaultVal !== 'undefined') {
        $(this).find('.dataParam').val(JSON.parse(defaultVal).paramValue) // 设置默认值
      }
      $(this).datetimepicker(setting)
    })
  }

  // 初始化下拉列表
  if (($('#' + id).find('.selectParam')).length > 0) {
    ($('#' + id).find('.selectParam')).each(function (i, v) {
      var choiceType = $(this).attr('data-choiceType') // 下拉列表的数据是单选还是多选
      var moduleParamId = $(this).attr('data-id') // 母参数ID
      var paramName = $(this).attr('data-name') // 母参数名称
      var sql = typeof $(this).attr('data-sql') !== 'undefined' ? $(this).attr('data-sql') : '' // 该参数是否有SQL语句（0否1是）
      var dataArr = typeof $(this).attr('data') !== 'undefined' ? JSON.parse($(this).attr('data')) : [] // 下拉列表数据
      var initDataArr = false // 是否初始化数据
      var selectSetting = {
        el: '#selectParam'+ moduleParamId+ serviceInfo , // 此处使用【i】的原因在于每个参数都可能被重复使用，只能通过数量下标来确保【el】唯一
        //el:  $(this) ,
        filterable: true,
        filterMethod: function (val, item, index, prop) {
          if (val === item.value) { // 把value相同的搜索出来
            return true
          }
          if (item.name && item.name.indexOf(val) != -1) { // 名称中包含的搜索出来
            return true
          }
          return false // 不知道的就不管了
        },
        data: dataArr
      }
      if (sql !== '') {// 当前参数是SQL语句方式
        var associatedParamIdArr = typeof $(this).attr('data-associatedParamIdArr') !== 'undefined' ? JSON.parse($(this).attr('data-associatedParamIdArr')) : [] // 当前参数的被关联的参数的集合
        var paramArr = typeof $(this).attr('data-paramArr') !== 'undefined' ? JSON.parse($(this).attr('data-paramArr')) : [] // 影响当前参数的主参数的集合
        selectSetting.show = function () {
          initDataArr = selectShow('#selectParam', moduleParamId, paramName, sql, choiceType, paramArr, dataArr, initDataArr,serviceInfo)
        }
        selectSetting.hide = function () {
          if (initDataArr && dataArr.length === 0) {
            var selectXs = xmSelect.get('#selectParam'+moduleParamId+serviceInfo, true) // 获取当前下拉框的实体对象
            dataArr = selectXs.options.data
            initDataArr = false
          }
          selectHide(associatedParamIdArr)
        }
      }
      if (choiceType == 1) { // 单选
        selectSetting.radio = true
        selectSetting.clickClose = true
      }
      //设置默认值
      var defaultVal = $(this).attr('data-defaultVal')
      if (typeof defaultVal !== 'undefined') {
        selectSetting.initValue = JSON.parse(defaultVal).paramValue // 初始化默认值
      }
      xmSelect.render(selectSetting)
    })
  }
  // 初始化下拉树
  if (($('#' + id).find('.selectTreeParam')).length > 0) {
    ($('#' + id).find('.selectTreeParam')).each(function (i, v) {
      var choiceType = $(this).attr('data-choiceType') // 下拉树的数据是单选还是多选
      var moduleParamId = $(this).attr('data-id') // 母参数ID
      var paramName = $(this).attr('data-name') // 母参数名称
      var sql = typeof $(this).attr('data-sql') !== 'undefined' ? $(this).attr('data-sql') : '' // 该参数是否有SQL语句（0否1是）
      var dataArr = typeof $(this).attr('data') !== 'undefined' ? JSON.parse($(this).attr('data')) : [] // 下拉树数据
      var initDataArr = false // 是否初始化数据
      var selectSetting = {
        el: '#selectTreeParam' + moduleParamId+serviceInfo, // 此处使用【i】的原因在于每个参数都可能被重复使用，只能通过数量下标来确保【el】唯一
        // autoRow: true,
        filterable: true,
        tree: {
          show: true,
          showFolderIcon: true, // 显示三角标
          showLine: true, // 显示虚线
          indent: 30, // 间距
          strict: false // 严格父子结构
        },
        height: 'auto',
        data: dataArr
      }
      if (sql !== '') { // 当前参数是SQL语句方式
        var associatedParamIdArr = typeof $(this).attr('data-associatedParamIdArr') !== 'undefined' ? JSON.parse($(this).attr('data-associatedParamIdArr')) : [] // 当前参数的被关联的参数的集合
        var paramArr = typeof $(this).attr('data-paramArr') !== 'undefined' ? JSON.parse($(this).attr('data-paramArr')) : [] // 影响当前参数的主参数的集合
        selectSetting.show = function () {
          initDataArr = selectShow('#selectTreeParam', moduleParamId, paramName, sql, choiceType, paramArr, dataArr, initDataArr,serviceInfo)
        }
        selectSetting.hide = function () {
          if (initDataArr && dataArr.length === 0) {
            var selectXs = xmSelect.get('#selectTreeParam' + moduleParamId+serviceInfo, true) // 获取当前下拉框的实体对象
            dataArr = selectXs.options.data
            initDataArr = false
          }
          selectHide(associatedParamIdArr)
        }
      }
      // 设置默认值
      var defaultVal = $(this).attr('data-defaultVal')
      if (typeof defaultVal !== 'undefined') {
        selectSetting.initValue = JSON.parse(defaultVal).paramValue // 初始化默认值
      }
      if (choiceType == 1) { // 单选
        selectSetting.radio = true
        selectSetting.clickClose = true
      } else {
        selectSetting.on = function (data) {
          var arr = data.arr
          var newDataArr = []
          var checkData = data.change.slice(0, 1) // 当前选中的节点数据
          newDataArr.push(checkData[0])
          newDataArr = getChildrenData(checkData[0], newDataArr) // 获取当前选中的节点数据和其子孙节点数据
          if (data.isAdd) { // 选中时
            // 先将dataArr在arr中已存在的部分移除
            for (var k = 0; k < newDataArr.length; k++) { // 遍历即将取消选中的上级节点
              for (var j = arr.length - 1; j >= 0; j--) { // 倒叙遍历所有选中的节点
                if (arr[j].value === newDataArr[k].value && arr[j].pValue === newDataArr[k].pValue) { // 若存在
                  arr.splice(j, 1) // 则倒序移除
                  break
                }
              }
            }
            // 将下拉树组装好的数据进行拆分，把每个对象的孩子差分出来
            var preDataArr = getSplitDataArr(dataArr)
            // 根据当前节点递归获取未被选中的且需要被选中的上级节点
            var parentUnCheckedArr = getParentUnChecked(checkData[0], [], preDataArr, arr)
            newDataArr = newDataArr.concat(parentUnCheckedArr)
            arr.push.apply(arr, newDataArr) // 将新选中的与已选中的进行合并
          } else { // 取消选中时
            // 根据当前节点递归获取被选中的且需要取消选中的上级节点
            var parentCheckedArr = getParentChecked(checkData[0], [], arr)
            // 遍历取消上级节点的选中状态
            for (var k = 0; k < parentCheckedArr.length; k++) { // 遍历即将取消选中的上级节点
              for (var j = arr.length - 1; j >= 0; j--) { // 倒叙遍历所有选中的节点
                if (arr[j].value === parentCheckedArr[k].value && arr[j].pValue === parentCheckedArr[k].pValue) { // 若存在
                  arr.splice(j, 1) // 则倒序移除
                  break
                }
              }
            }
            // 遍历取消当前节点的子孙节点的选中状态
            for (var k = 0; k < newDataArr.length; k++) { // 遍历即将取消选中的节点
              for (var j = arr.length - 1; j >= 0; j--) { // 倒叙遍历所有选中的节点
                if (arr[j].value === newDataArr[k].value && arr[j].pValue === newDataArr[k].pValue) { // 若存在
                  arr.splice(j, 1) // 则倒序移除
                  break
                }
              }
            }
          }
          return arr
        }
      }
      xmSelect.render(selectSetting)
    })
  }
}

/**
 * 根据当前节点递归获取被选中的且需要取消选中的上级节点
 * @param checkData 当前节点数据
 * @param parentCheckedArr 被选中的上级节点数组
 * @param arr 查找的源数组
 * @description 只适用于xmSelect下拉树（实现非严格父子结构下的取消全选功能）
 * @return parentCheckedArr
 * @author JL
 */
function getParentChecked(checkData, parentCheckedArr, arr) {
  if (arr && arr.length > 0) {
    var obj = {}
    for (var i = 0; i < arr.length; i++) {
      if (checkData.pValue === arr[i].value) {
        obj = arr[i]
        break
      }
    }
    if (Object.keys(obj).length > 0) {
      parentCheckedArr.push(obj)
      parentCheckedArr = getParentChecked(obj, parentCheckedArr, arr)
    }
  }
  return parentCheckedArr
}

/**
 * 根据影响当前参数的主参所选中的值，过滤当前参数的数据
 * @param idStr 当前下拉框是下拉列表还是下拉树（传它们的部分ID标识）
 * @param paramId 当前参数的ID
 * @param paramName 当前参数的名称
 * @param sql 当前参数的SQL语句
 * @param choiceType 当前参数时单选还是多选
 * @param paramArr 它受谁影响，即它为被关联参数时，其主参数的集合
 * @param dataArr 原始数据（未过滤之前的数据）
 * @param initDataArr 此次加载的是否是初始化数据
 * @description 下拉框展开时调用 "#selectParam"
 * @author JL
 */
function selectShow(idStr, paramId, paramName, sql, choiceType, paramArr, dataArr, initDataArr,serviceInfo) {
  if(serviceInfo==undefined){
    serviceInfo = ''
  }
  // 找出该参数与被关联参数之间的联系（它影响谁和谁影响它两种）
    var sqlWhereStr = ''
    // 在当前参数列表中匹配影响当前参数的主参数集合，获取其选中的值拼接where条件
    $('.xm-select-demo').each(function () {
      var curParamId = $(this).attr('data-id') // 参数ID
      for (var t = 0; t < paramArr.length; t++) {
        if (paramArr[t].paramId === curParamId) {
          var str = ''
          if ($(this).hasClass('selectParam')) {
            str = '#selectParam' + curParamId+serviceInfo
          }
          if ($(this).hasClass('selectTreeParam')) {
            str = '#selectTreeParam' + curParamId+serviceInfo
          }
          if (str !== '') {
            var selectXs = xmSelect.get(str, true) // 获取当前下拉框的实体对象
            var selectedObjArr = selectXs.getValue() // 获取选中的参数值集合
            if (selectedObjArr && selectedObjArr.length > 0) {
              var associatedParamCol = paramArr[t].associatedParamCol // 被关联参数值（对应的列名称）
              var key = paramArr[t].paramValueType === 'realValue' ? 'value' : 'name' // 判断是真实值还是显示值
              if (choiceType == 1) { // 单选
                sqlWhereStr += ' and ' + associatedParamCol + "='" + selectedObjArr[0][key] + "'"
              } else { // 多选
                var valueStr = ''
                for (var k = 0; k < selectedObjArr.length; k++) {
                  valueStr += "'" + selectedObjArr[k][key] + "',"
                }
                if (valueStr !== '') {
                  valueStr = valueStr.substring(0, valueStr.length - 1)
                }
                sqlWhereStr += ' and ' + associatedParamCol + ' in (' + valueStr + ')'
              }
            }
          }
          break
        }
      }
    })
    var selectXs = xmSelect.get(idStr + paramId+serviceInfo, true) // 获取当前下拉框的实体对象
    var oldSqlWhereStr = typeof $(idStr + paramId).attr('data-sqlWhereStr') !== 'undefined' ? $(idStr + paramId).attr('data-sqlWhereStr') : ''
    var url = ''
    if (idStr === '#selectParam'+serviceInfo) { // 下拉列表
      if (sqlWhereStr !== '') {
        if (oldSqlWhereStr === '' || oldSqlWhereStr !== sqlWhereStr) {
          sql = 'SELECT * FROM (' + sql + ') where 1=1' + sqlWhereStr
          executeParamSql(sql).then(res => {
            if (res.data.isError) {
              alert('获取参数【' + paramName + '】的值的失败，原因：' + res.data.message);
              this.$message({
                type: 'error',
                message: '获取参数【' + paramName + '】的值的失败，原因：' + res.data.message
              })
              // this.$message("获取参数【" + paramName + "】的值的失败，原因：" + res.data.message)
              // alertMsg("错误", "获取参数【" + paramName + "】的值的失败，原因：" + res.data.message, "error");
            } else {
              var newDataArr = []
              if (idStr === '#selectParam'+serviceInfo) {
                for (var k = 0; k < res.data.paramList.length; k++) {
                  var paramObj = {
                    'name': res.data.paramList[k].paramName,
                    'value': res.data.paramList[k].paramValue
                  }
                  newDataArr.push(paramObj)
                }
              } else { // idStr=='#selectTreeParam'
                newDataArr = organizeSelectTreeData(res.data.paramList)
              }
              selectXs.update({
                data: newDataArr
                // autoRow: true,
              })
              $(idStr + paramId).attr('data-sqlWhereStr', sqlWhereStr)
            }
          })
        } else {

        }
      }
      if (sqlWhereStr === '' && dataArr.length === 0) {
        // 当影响它的主参没有选择值且本身没数据时（第一次加载全部数据）
        initDataArr = true
        executeParamSql(sql).then(res => {
          if (res.data.isError) {
            this.$message({
              type: 'error',
              message: '获取参数【' + paramName + '】的值的失败，原因：' + res.data.message
            })
            // this.$message( "获取参数【" + paramName + "】的值的失败，原因：" + res.data.message)
            // alertMsg("错误", "获取参数【" + paramName + "】的值的失败，原因：" + res.data.message, "error");
          } else {
            if (idStr === '#selectParam'+serviceInfo) {
              for (var k = 0; k < res.data.paramList.length; k++) {
                var paramObj = {
                  'name': res.data.paramList[k].paramName,
                  'value': res.data.paramList[k].paramValue
                }
                dataArr.push(paramObj)
              }
            } else { // idStr=='#selectTreeParam'
              dataArr = organizeSelectTreeData(res.data.result)
            }
            selectXs.update({
              data: dataArr
              // autoRow: true,
            })
          }
        })
      }
    } else {
      // idStr=='#selectTreeParam'   下拉树
      if (sqlWhereStr !== '') {
        if (oldSqlWhereStr === '' || oldSqlWhereStr !== sqlWhereStr) {
          sql = 'SELECT * FROM (' + sql + ') where 1=1' + sqlWhereStr
          getSelectTreeData(sql).then(res => {
            if (res.data.isError) {
              this.$message({
                type: 'error',
                message: '获取参数【' + paramName + '】的值的失败，原因：' + res.data.message
              })
              // this.$message( "获取参数【" + paramName + "】的值的失败，原因：" + res.data.message)
              // alertMsg("错误", "获取参数【" + paramName + "】的值的失败，原因：" + res.data.message, "error");
            } else {
              var newDataArr = []
                newDataArr = organizeSelectTreeData(res.data.result)
              selectXs.update({
                data: newDataArr
                // autoRow: true,
              })
              $(idStr + paramId).attr('data-sqlWhereStr', sqlWhereStr)
            }
          })
        } else {

        }
      }
      if (sqlWhereStr === '' && dataArr.length === 0) { // 当影响它的主参没有选择值且本身没数据时（第一次加载全部数据）
        initDataArr = true
        getSelectTreeData(sql).then(res => {
          if (res.data.isError) {
            this.$message({
              type: 'error',
              message: '获取参数【' + paramName + '】的值的失败，原因：' + res.data.message
            })
            // this.$message("获取参数【" + paramName + "】的值的失败，原因：" + res.data.message)
            // alertMsg("错误", "获取参数【" + paramName + "】的值的失败，原因：" + res.data.message, "error");
          } else {
            if (idStr === '#selectParam'+serviceInfo) {
              for (var k = 0; k < res.data.result.length; k++) {
                var paramObj = {
                  'name': res.data.result[k].paramName,
                  'value': res.data.result[k].paramValue
                }
                dataArr.push(paramObj)
              }
            } else { // idStr=='#selectTreeParam'
              dataArr = organizeSelectTreeData(res.data.result)
            }
            selectXs.update({
              data: dataArr
              // autoRow: true,
            })
          }
        })
      }
    }
    if (sqlWhereStr === '' && dataArr.length !== 0) {
      if (paramArr.length !== 0) { // 本身受其它参数影响
        selectXs.update({
          data: dataArr
          // autoRow: true,
        })
      }
      $(idStr + paramId).removeAttr('data-sqlWhereStr')
    }
  return initDataArr
}

/**
 * 清空当前参数的被关联参数的值
 * @param associatedParamIdArr 当前参数的所有被关联参数ID数组
 * @description 当前参数选中值时
 * @author JL
 */
function selectHide(associatedParamIdArr) {
  $('.xm-select-demo').each(function () {
    var curParamId = $(this).attr('data-id') // 参数ID
    if ($.inArray(curParamId, associatedParamIdArr) != -1) {
      var str = ''
      if ($(this).hasClass('selectParam')) {
        str = '#selectParam' + curParamId
      }
      if ($(this).hasClass('selectTreeParam')) {
        str = '#selectTreeParam' + curParamId
      }
      if (str !== '') {
        var selectXs = xmSelect.get(str, true) // 获取当前下拉框的实体对象
        var selectedObj = selectXs.getValue() // 获取选中的参数值
        if (selectedObj && selectedObj.length > 0) {
          selectXs.setValue([]) // 清空选中值
        }
      }
    }
  })
}

/**
 * 组织下拉树数据（只用于参数）
 * @param result 待组织的数据（有效列：C_CODE,C_NAME,P_CODE）
 * @return dataArr 可用于xmSelect插件的格式数据数组
 * @author JL
 */
function organizeSelectTreeData(result, dataType) {
  var dataArr = []
  for (var i = 0; i < result.length; i++) { // 先把每一条数据转换成xmSelect的数据格式{"name":xx,"value":xx,"children":[]}
    var obj = {
      'name': result[i].C_NAME,
      'value': result[i].C_CODE,
      // 'value': dataType == 'str' ? `'` + result[i].C_CODE + `'` : result[i].C_CODE,
      'pValue': result[i].P_CODE,
      // 'pValue': dataType == 'str' ? `'` + result[i].P_CODE +`'` : result[i].P_CODE,
      'children': [],
      'sort': i
    }
    dataArr.push(obj)
  }
  dataArr = matchingPcRelation(dataArr) // 匹配父子关系
  return dataArr
}



/**
 * 递归获取当前选中的节点数据和其子孙节点数据
 * @param checkData 当前节点数据
 * @param dataArr 待返回的所有节点数据
 * @description 只适用于xmSelect下拉树（实现非严格父子结构下的全选功能）
 * @author JL
 */
function getChildrenData(checkData, dataArr) {
  if (checkData.children && checkData.children.length > 0) { // 若当前节点有子节点
    var childrenArr = [] // 存放有孙子节点的当前节点
    for (var i = 0; i < checkData.children.length; i++) {
      dataArr.push(checkData.children[i]) // 将当前节点的子节点存放到待返回节点数组中
      if (checkData.children[i].children && checkData.children[i].children.length > 0) { // 如果当前节点有孙子节点
        childrenArr.push(checkData.children[i]) // 记录
      }
    }
    for (var j = 0; j < childrenArr.length; j++) {
      dataArr = getChildrenData(childrenArr[j], dataArr)
    }
  }
  return dataArr
}

/**
 * 将下拉树组装好的数据进行拆分，把每个对象的孩子差分出来
 * @param dataArr 需要差分的数组
 * @description 只适用于xmSelect下拉树（拆分的时setting的data）
 * @return preDataArr 拆分后的数据
 * @author JL
 */
function getSplitDataArr(dataArr) {
  var preDataArr = []
  for (var i = 0; i < dataArr.length; i++) {
    preDataArr.push(dataArr[i])
    if (dataArr[i].children && dataArr[i].children.length > 0) {
      preDataArr = splitDataArr(dataArr[i], preDataArr)
    }
  }
  return preDataArr
}

/**
 * 递归拆分当前节点的子节点
 * @param curSplitData 需拆分的当前节点
 * @param preDataArr 需要差分的数组
 * @description 只适用于xmSelect下拉树
 * @return preDataArr 拆分后的数据
 * @author JL
 */
function splitDataArr(curSplitData, preDataArr) {
  var childrenArr = curSplitData.children
  for (var i = 0; i < childrenArr.length; i++) {
    preDataArr.push(childrenArr[i])
    if (childrenArr[i].children && childrenArr[i].children.length > 0) {
      preDataArr = splitDataArr(childrenArr[i], preDataArr)
    }
  }
  return preDataArr
}

/**
 * 根据当前节点递归获取未被选中的且需要被选中的上级节点
 * @param checkData 当前节点数据
 * @param parentUnCheckedArr 未被选中的上级节点数组
 * @param dataArr 查找的源数组
 * @param arr 处于选中状态的节点数组
 * @description 只适用于xmSelect下拉树（实现非严格父子结构下的全选功能）
 * @return parentUnCheckedArr
 * @author JL
 */
function getParentUnChecked(checkData, parentUnCheckedArr, dataArr, arr) {
  if (dataArr && dataArr.length > 0) {
    var obj = {}
    for (var i = 0; i < dataArr.length; i++) {
      if (checkData.pValue === dataArr[i].value) {
        obj = dataArr[i]
        break
      }
    }
    if (Object.keys(obj).length > 0) {
      var basicChildrenNum = obj.children.length // 当前父节点的孩子节点的数量
      var checkChildrenNum = 0 // 记录被选中状态下的当前父节点的孩子节点的数量
      for (var j = 0; j < basicChildrenNum; j++) {
        for (var k = 0; k < arr.length; k++) {
          if (obj.children[j].value === arr[k].value && obj.children[j].pValue === arr[k].pValue) {
            checkChildrenNum++
          }
        }
      }
      if (basicChildrenNum === (checkChildrenNum + 1)) {
        parentUnCheckedArr.push(obj)
        parentUnCheckedArr = getParentUnChecked(obj, parentUnCheckedArr, dataArr, arr)
      }
    }
  }
  return parentUnCheckedArr
}

/**
 * 递归匹配父子关系（只用于参数）
 * @param dataArr 可用于xmSelect插件的格式数据数组
 * @return dataArr
 * @author JL
 */
function matchingPcRelation(dataArr, rootValue) {
  // var newDataArr = []
  // var c_code_arr = [] // 用来记录执行本次方法的最末级节点集合
  // var hasUsed = false // 此方法是否有效，默认无效
  // for (var i = 0; i < dataArr.length; i++) { // 第一层循环
  //   var firstVal = dataArr[i] // 第一层的对象
  //   var C_CODE = firstVal.value // 拿到当前值的编码
  //   var C_NAME = firstVal.name // 拿到当前值的显示值
  //   var P_CODE = firstVal.pValue // 拿到当前值的父编码
  //   var sort = firstVal.sort // 拿到当前值的排序号
  //   var children = firstVal.children // 拿到当前值的子集
  //   var cNum = 0
  //   var isBreak = false
  //   for (var j = 0; j < dataArr.length; j++) { // 第二层循环
  //     var secondVal = dataArr[j] // 第二层的对象
  //     var value = secondVal.value // 拿到当前值的编码
  //     var pValue = secondVal.pValue // 拿到当前值的父编码
  //     if (P_CODE === value && C_CODE !== value && !isBreak) { // 如果firstVal的父编码等于secondVal子编码的值，则说明firstVal不是根节点
  //       var obj = {
  //         'name': C_NAME,
  //         'value': C_CODE,
  //         'pValue': P_CODE, // 临时有用
  //         'children': children.length > 0 ? children : null,
  //         'sort': sort
  //       }
  //       var ifExsit = false
  //       for (var k = 0; k < secondVal.children.length; k++) {
  //         if (obj.value === secondVal.children[k].value && obj.pValue === secondVal.children[k].pValue) {
  //           ifExsit = true
  //           break
  //         }
  //       }
  //       if (!ifExsit) { // 如果不存在,则将firstVal（子节点）加入到secondVal（父节点）的children中
  //         if (secondVal.children.length === 0) {
  //           secondVal.children.push(obj)
  //         } else {
  //           var sortInd = -1
  //           for (var n = 0; n < secondVal.children.length; n++) {
  //             if (secondVal.children[n].sort > sort) {
  //               sortInd = n
  //               break
  //             }
  //           }
  //           if (sortInd === -1) { // 如果当前对象（obj）比children中所有对象的排序值都大，则直接将obj添加至最后一个位置
  //             secondVal.children.push(obj)
  //           } else { // 只要children中的对象存在排序值比obj排序值大的，则将obj插入相应位置
  //             secondVal.children.splice(n, 0, obj)
  //           }
  //         }
  //       }
  //       hasUsed = true
  //       isBreak = true
  //     }
  //     if (C_CODE !== pValue) { // 本身不作为任何节点的父节点
  //       cNum++
  //     }
  //   }
  //   if (cNum === dataArr.length) {
  //     c_code_arr.push(firstVal) // 记录本次循环最末级节点的编码数组
  //   }
  // }
  // if (hasUsed) {
  //   // 寻找执行本次方法的最末级节点集合
  //   for (var c = 0; c < dataArr.length; c++) {
  //     var num = 0
  //     for (var t = 0; t < c_code_arr.length; t++) {
  //       if (dataArr[c].value !== c_code_arr[t].value) {
  //         num++
  //       }
  //     }
  //     if (num === c_code_arr.length) { // 如果当前编码与已记录的子节点的编码数组中每个对象的编码都不相等
  //       newDataArr.push(dataArr[c]) // 找出不是子节点的对象
  //     }
  //   }
  //   if (newDataArr.length > 0) {
  //     dataArr = matchingPcRelation(newDataArr)
  //   }
  // }



  // 通过pValue等于value 递归遍历数据为父子结构
  // 每层数据通过sort排序
  // var arr = [];
  // dataArr.forEach(item => {
  //     if (item.pValue == rootValue) {
  //         const children = matchingPcRelation(dataArr, item.value)
  //         children.sort((a, b) => {
  //             return a.sort - b.sort
  //         })
  //         if (children.length && children.length>0) {
  //             item.children = children
  //         } else {
  //             delete item.children;
  //         }
  //         arr.push(item)
  //         arr.sort((a, b) => {
  //             return a.sort - b.sort
  //         })
  //     }
  // })
  // return arr



  var  result = [];
	if (!Array.isArray(dataArr)) {
		return result
	}
	dataArr.forEach(function (item){
		delete item.children;
	});
	var map = {};
	dataArr.forEach(function (item) {
		map[item.value] = item;
	});
	dataArr.forEach(function (item){
		var parent = map[item.pValue];
		if (parent) {
			(parent.children || (parent.children = [])).push(item);
		} else {
			result.push(item);
		}
	});
	return result;
}

/**
 * 替换节点的参数
 */
export function replaceNodeParam(modelid,serviceInfo) {
  if(serviceInfo==undefined){
    serviceInfo=''
  }
  //根据编号找到sql，利用解析sql里面的所有参数编号，如果得到的数量与参数的arr不相等，则证明是多个同样的参数，进行特殊处理
  var returnObj = {
    'verify': true, // 校验是否通过
    'message': '', // 提示信息
    'sql': '', // 返回的SQL语句
    'paramsArr': [] // 返回的参数数组，对象格式{"moduleParamId":xx,"paramName":xx,"paramValue":xx,"allowedNull":xx}
  }
  // 循环所有节点
  var filterArr = [] // 参数条件的数组，包含参数ID和参数值
  var paramNum = 0 // 记录参数不允许为空却未输入值的参数数量
  var hasAllowedNullParam = false; // 本次设置是否含有可为空的参数条件
  // 获取参数查询条件（文本框）
  ($('#' + modelid).find('.paramOption')).each(function () {
    var moduleParamId = $(this).attr('data-id') // 母参数ID
    var paramName = $(this).attr('data-name') // 母参数名称
    var allowedNull = typeof $(this).attr('data-allowedNull') !== 'undefined' ? $(this).attr('data-allowedNull') : '1' // 是否允许为空，当为undefined时默认为可为空
    var paramValue = $(this).val()
    var obj = {
      'moduleParamId': moduleParamId,
      'paramName': paramName,
      'paramValue': $.trim(paramValue),
      'allowedNull': '0'
    }
    if (allowedNull === '1') { // 允许为空
      obj.allowedNull = '1'
      if (paramValue === '') {
        hasAllowedNullParam = true
        for (var k = 0; k < arr.length; k++) { // 遍历当前节点绑定的参数，给每个参数绑定空值
          if (arr[k].moduleParamId === moduleParamId) {
            arr[k]['value'] = ''
          }
        }
      }
      filterArr.push(obj)
    } else { // 不允许为空
      if (paramValue !== '') {
        filterArr.push(obj)
      } else {
        paramNum++
      }
    }
  });
  // 获取参数查询条件（下拉列表）
  ($('#' + modelid).find('.selectParam')).each(function (i, v) {
    var moduleParamId = $(this).attr('data-id') // 母参数ID
    var paramName = $(this).attr('data-name') // 母参数名称
    var allowedNull = typeof $(this).attr('data-allowedNull') !== 'undefined' ? $(this).attr('data-allowedNull') : '1' // 是否允许为空，当为undefined时默认为可为空
    var choiceType = $(this).attr('data-choiceType') // 当前参数是多选还是单选：0：多选，1、单选
    var selectParamXs = xmSelect.get('#selectParam' + moduleParamId+serviceInfo, true) // 获取下拉列表参数的单实例
    var paramSelectedObj = selectParamXs.getValue() // 获取选中的参数值名称
    var obj = {
      'moduleParamId': moduleParamId,
      'paramName': paramName,
      'paramValue': '',
      'allowedNull': '0'
    }
    if (allowedNull === '1') { // 允许为空
      obj.allowedNull = '1'
      if (paramSelectedObj.length === 0) { // 未选择值
        hasAllowedNullParam = true
        for (var k = 0; k < arr.length; k++) { // 遍历当前节点绑定的参数，给每个参数绑定空值
          if (arr[k].moduleParamId === moduleParamId) {
            arr[k]['value'] = ''
          }
        }
      } else {
        if (choiceType == 1) { // 单选
          let arr = []
          arr.push(paramSelectedObj[0].value)
          obj.paramValue = arr
        } else {
          let arr = []
          for (var j = 0; j < paramSelectedObj.length; j++) { // 多值，以'','',……形式展现
            arr.push(paramSelectedObj[j].value)
          }
          obj.paramValue = arr
        }
      }
      filterArr.push(obj)
    } else { // 不允许为空
      if (paramSelectedObj.length !== 0) {
        if (choiceType == 1) { // 单选
          obj.paramValue = paramSelectedObj[0].value
        } else {
          for (var j = 0; j < paramSelectedObj.length; j++) { // 多值，以'','',……形式展现
            obj.paramValue += "'" + paramSelectedObj[j].value + "',"
          }
          obj.paramValue = obj.paramValue.substring(0, obj.paramValue.length - 1)
        }
        filterArr.push(obj)
      } else {
        paramNum++
      }
    }
  });

  // 获取参数查询条件（下拉树）
  ($('#' + modelid).find('.selectTreeParam')).each(function (i, v) {
    var moduleParamId = $(this).attr('data-id') // 母参数ID
    var paramName = $(this).attr('data-name') // 母参数名称
    var allowedNull = typeof $(this).attr('data-allowedNull') !== 'undefined' ? $(this).attr('data-allowedNull') : '1' // 是否允许为空，当为undefined时默认为可为空
    var choiceType = $(this).attr('data-choiceType') // 当前参数是多选还是单选：0：多选，1、单选
    var selectTreeParamXs = xmSelect.get('#selectTreeParam' + moduleParamId+serviceInfo, true) // 获取下拉树参数的单实例
    var paramSelectedObj = selectTreeParamXs.getValue() // 获取选中的参数值名称
    var obj = {
      'moduleParamId': moduleParamId,
      'paramName': paramName,
      'paramValue': '',
      'allowedNull': '0'
    }
    if (allowedNull === '1') { // 允许为空
      obj.allowedNull = '1'
      if (paramSelectedObj.length === 0) { // 未选择值
        hasAllowedNullParam = true
        for (var k = 0; k < arr.length; k++) { // 遍历当前节点绑定的参数，给每个参数绑定空值
          if (arr[k].moduleParamId === moduleParamId) {
            arr[k]['value'] = ''
          }
        }
      } else {
        if (choiceType == 1) { // 单选
          obj.paramValue = paramSelectedObj[0].value
        } else {
          for (var j = 0; j < paramSelectedObj.length; j++) { // 多值，以'','',……形式展现
            obj.paramValue += "'" + paramSelectedObj[j].value + "',"
          }
          obj.paramValue = obj.paramValue.substring(0, obj.paramValue.length - 1)
        }
      }
      filterArr.push(obj)
    } else { // 不允许为空
      if (paramSelectedObj.length !== 0) {
        if (choiceType == 1) { // 单选
          obj.paramValue = paramSelectedObj[0].value
        } else {
          for (var j = 0; j < paramSelectedObj.length; j++) { // 多值，以'','',……形式展现
            obj.paramValue += "'" + paramSelectedObj[j].value + "',"
          }
          obj.paramValue = obj.paramValue.substring(0, obj.paramValue.length - 1)
        }
        filterArr.push(obj)
      } else {
        paramNum++
      }
    }
  })
  if (false) { // 第一步，先判断是否有必填的参数没有输入值
    returnObj.verify = false
    returnObj.message = '含有未输入值的参数项，请重新输入'
  } else {
    // 第二步，判断设置长度值文本框输入的值是否满足条件
    $('.textParam').each(function (t, v) {
      var dataLength = $(this).attr('data-datalength') // 获取参数值长度
      var paramName = $(this).attr('data-name') // 获取参数名称
      if (dataLength == 'null') {
        dataLength = null
      }
      if (dataLength !== null && $(this).val().length > parseInt(dataLength)) { // 如果该参数有长度限制且默认值不等于设置的长度值
        returnObj.verify = false
        returnObj.message = '参数【' + paramName + '】输入值的长度与设置的长度值【' + parseInt(dataLength) + '】不相等'
        return false
      }
    })
    var replaceSql1 = overallParmaobj[modelid].sql
    var arr1 = overallParmaobj[modelid].paramsArr
    if (returnObj.verify) {
      if (hasAllowedNullParam) { // 如果存在可为空的参数并且为空值，走后台进行空参替换
        replaceModelSqlByParams(replaceSql1, JSON.stringify(arr)).then(e => {
          if (e.isError) { // 出错后replaceSql的值会在后台置为空
            returnObj.verify = false
            returnObj.message = '替换空值参数时出错'
          }
          replaceSql1 = e.data.sql
        })
      }
      if (replaceSql1 !== '') {
        // 替换参数SQL中的ID（多值怎么替换？）
        for (var j = 0; j < filterArr.length; j++) { // 遍历所有母参数信息
          var moduleParamId = filterArr[j].moduleParamId
          var paramId = ''
          for (var k = 0; k < arr1.length; k++) { // 遍历当前节点绑定的参数
            if (arr1[k].moduleParamId === moduleParamId) {
              replaceSql1 = replaceSql1.replace(arr1[k].id, filterArr[j].paramValue) // 将参数SQL中的参数ID替换为输入得值
            }
          }
        }
        //2020年12月24日 17:35:22 ZhangSiWeiG
        //如果他俩不相等说明是一参输入多次，进行特殊处理
        if(filterArr.length != arr1.length){
          var newFilterArr = []
          for(var i = 0; i < arr1.length;i++){
            for (var j = 0; j < filterArr.length;j++){
              if(arr1[i].moduleParamId === filterArr[j].moduleParamId){
                var newObj = arr1[i];
                newObj.paramValue = filterArr[j].paramValue
                newObj.alloweNull = filterArr[j].alloweNull
                newFilterArr.push(newObj)
              }
            }
          }
          filterArr = newFilterArr;
        }
        else{
          for (var j = 0; j < arr1.length; j++) {
            filterArr[j].copyParamId = arr1[j].copyParamId
            filterArr[j].id = arr1[j].id
            filterArr[j].sort = arr1[j].sort
          }
          for(var k = 0;k<filterArr.length;k++){
            filterArr[k]= JSON.parse(JSON.stringify(filterArr[k]).replace(/paramName/g,"name"));
          }
        }
        returnObj.sql = replaceSql1
        returnObj.paramsArr = filterArr
      }
    }
  }
  return returnObj
}


/**
 * 获取设置的参数默认值和排序值
 * @param paramArr 有效的参数数组集合（被拖拽使用的参数集合）
 * @return returnObj
 * @description 返回值对象结构：
 * var returnObj = {
 *     "verify" : xx,//验证是否通过
 *     "message" : xx,//异常信息
 *     "paramSettingArr" : [] //返回组织好的参数数组
 *   }
 * paramSettingArr数组中的对象结构：
 * var obj = {
 *      "paramId" : xx,//参数ID
 *      "moduleParamId" : xx,//母参ID
 *      "defaultVal" : xx,//参数默认值（若对象中没有此属性，则默认该对象无默认值）
 *      "sortVal" : xx//参数排序值
 *   }
 * @author JL
 */
export function getParamSettingArr(paramArr,serviceInfo) {
  // 组装对象
  var returnObj = {
    'verify': true,
    'message': '',
    'paramSettingArr': []
  }
  // 绑定文本框输入的默认值
  $('.paramOption').each(function (i, v) {
    if ($(this).val() !== '') { // 如果当前值不为空
      var defaultVal = $(this).val()
      if ($(this).hasClass('textParam')) { // 如果是文本框参数（非日期）验证文本框参数值的长度是否满足
        var paramName = $(this).attr('data-name') // 获取参数名称
        var dataLength = $(this).attr('data-dataLength') // 获取参数值长度
        if (dataLength == 'null') {
          dataLength = null
        }
        if (dataLength !== null && defaultVal.length > parseInt(dataLength)) { // 如果该参数有长度限制且默认值不等于设置的长度值
          returnObj.verify = false
          returnObj.message = '参数【' + paramName + '】输入值的长度与设置的长度值【' + parseInt(dataLength) + '】不相等'
          return false
        }
      }
      $(this).attr('data-value', defaultVal)
    }
  })
  if (!returnObj.verify) {
    return returnObj
  }
  // 绑定下拉列表选中的默认值
  $('.selectParam').each(function (i, v) {
    var moduleParamId = $(this).attr('data-id') // 母参ID
    var selectParamXs = xmSelect.get('#selectParam' + moduleParamId, true)
    var paramSelectedObj = selectParamXs.getValue() // 获取选中的参数值名称
    var defaultValueArr = []
    for (var j = 0; j < paramSelectedObj.length; j++) {
      defaultValueArr.push(paramSelectedObj[j].value)
    }
    if (defaultValueArr.length > 0) {
      $(this).attr('data-value', JSON.stringify(defaultValueArr))
    }
  })
  // 绑定下拉树选中的默认值
  $('.selectTreeParam').each(function (i, v) {
    var moduleParamId = $(this).attr('data-id') // 母参ID
    var selectTreeParamXs = xmSelect.get('#selectTreeParam' + moduleParamId, true)
    var paramSelectedObj = selectTreeParamXs.getValue() // 获取选中的参数值名称
    var defaultValueArr = []
    for (var j = 0; j < paramSelectedObj.length; j++) {
      defaultValueArr.push(paramSelectedObj[j].value)
    }
    if (defaultValueArr.length > 0) {
      $(this).attr('data-value', JSON.stringify(defaultValueArr))
    }
  })

  for (var j = 0; j < paramArr.length; j++) {
    var obj = {
      'id': '{#' + paramArr[j].copyParamId + '#}',
      'copyParamId': paramArr[j].copyParamId,
      'moduleParamId': paramArr[j].moduleParamId,
      'sort': 1, // 默认排序值为1
      'name': paramArr[j].name
    }
    // 设置该参数的默认值和排序值
    var defaultVal = ''
    var sortVal = ''
    $('.paramTr').each(function (k, v) { // 遍历表格行中的参数标签
      var moduleParamId = $(this).attr('data-id') // 取得当前行绑定的参数ID
      if (obj.moduleParamId === moduleParamId) {
        if (typeof ($(this).attr('data-value')) !== 'undefined') {
          if ($(this).hasClass('paramOption')) { // 文本框
            defaultVal = $(this).attr('data-value')
          } else { // 下拉框
            defaultVal = JSON.parse($(this).attr('data-value'))
          }
        }
        sortVal = parseInt(k + 1)
        return false
      }
    })
    obj.paramValue = defaultVal
    if (sortVal !== '') {
      obj.sort = sortVal
    }
    returnObj.paramSettingArr.push(obj)
  }

  return returnObj
}

/**
 * 获取所有母版参数集合以及模型用到的参数集合
 */
export function findParamsAndModelRelParams() {
  return request({
    baseURL: analysisUrl,
    url: '/paramController/findParamsAndModelRelParams',
    method: 'post'
  })
}

/**
 * 执行当前参数SQL语句
 * @param {*} data   SQL语句
 */
function executeParamSql(sql) {
  return request({
    baseURL: analysisUrl,
    url: '/paramController/executeParamSql',
    method: 'get',
    async:false,
    params:{sql:sql}
  })
}

/**
 * 查询下拉树参数SQL的结果集
 * @param {*} sqlValue sql语句
 */
async function getSelectTreeData(sqlValue) {
  const data = {
    sqlValue: sqlValue
  }
  return await request({
    baseURL: analysisUrl,
    url: '/paramController/getSelectTreeData',
    method: 'post',
    data
  })
}

/**
 * 查询下拉树参数SQL的结果集
 * @param {*} sqlValue sql语句
 */
export function getSelectTreeData1(sqlValue) {
  const data = {
    sqlValue: sqlValue
  }
  return request({
    baseURL: analysisUrl,
    url: '/paramController/getSelectTreeData',
    method: 'post',
    data
  })
}

/**
 * 获取模型的SQL语句、输出列、通过AllowedNull判断是否替换模型SQL语句中相关参数的属性为1=1
 * @param {*} sql sql语句
 * @param {*} paramArr 参数Json字符串
 */
async function replaceModelSqlByParams(sql, paramArr) {
  const data = {
    sqlValue: sql,
    paramConditions: paramArr
  }
  return await request({
    baseURL: analysisUrl,
    url: '/paramController/replaceSqlByAllowedNull',
    method: 'post',
    data
  })
}

/**
 * 根据模型关联的参数查询对应的母参对象
 * @param {*} data 与模型关联的参数json字符串
 */
export function getParentParamByParamArr(data) {
  return request({
    baseURL: analysisUrl,
    url: '/paramController/getParentParamByParamArr',
    method: 'post',
    data
  })
}


/**
 * 根据有效的参数数组组织参数与默认值排序值的表格行html界面
 * @param sqlIsChanged SQL编辑器中的SQL是否被改变
 * @param paramArr 有效的参数数组集合（被拖拽使用的参数集合）
 * @param canEditor 表单元素是否可编辑
 * @description 模型生命周期中的【参数设置】节点专用
 * @description 调用此方法必须在页面中引用jquery-ui.js（支持拖拽表格）
 * table格式：
 * <table id="xx">
 *     <thead>
 *         <tr>
 *             <td>名称</td>
 *             <td>默认值</td>
 *             <td>排序值</td>
 *         </tr>
 *     </thead>
 *     <tbody></tbody>
 * </table>
 * paramArr中的对象结构：
 * var obj = {
 *      "id" : xx,//加上占位符后的复制参数ID
 *      "copyParamId" : xx,//复制参数ID
 *      "moduleParamId":xx,//复制参数的母参ID
 *      "allowedNull": xx,//是否允许为空（0、否，1、是）
 *      "name" : xx//参数名称
 *  }
 * @author LR
 */
export function createParamTableHtml(sqlIsChanged, paramArr, canEditor) {
  if (typeof canEditor === 'undefined') {
    canEditor = false
  }
  // 第一步：先判断编辑的参数SQL语句是否有变化
  if (!sqlIsChanged) {
    // 如果SQL无变化
    return
  }
  // 第二步：遍历已配置过得参数行（若已配置行的参数被删除，则删除）,同时找到已配置的参数
  var hasSetParamIdArr = [] // 存放有效参数集合中已配置过得参数集合
  var trLen = $('.setParamTr').length
  for (var i = trLen - 1; i >= 0; i--) {
    // 倒序遍历参数配置行
    var moduleParamId = $('.setParamTr:eq(' + i + ')').attr(
      'data-moduleParamId'
    ) // 取得当前行绑定的母参ID
    var num = 0 // 记录参数比较值不相等的次数
    for (var j = 0; j < paramArr.length; j++) {
      // 遍历有效的参数集合
      if (moduleParamId !== paramArr[j].moduleParamId) {
        num++
      }
      if (
        $.inArray(paramArr[j].moduleParamId, hasSetParamIdArr) == -1 &&
        moduleParamId === paramArr[j].moduleParamId
      ) {
        hasSetParamIdArr.push(paramArr[j].moduleParamId)
      }
    }
    if (num === paramArr.length) {
      // 如果参数配置行的参数与有效参数集合匹配不上
      $('.setParamTr:eq(' + i + ')').remove() // 则删除当前行
    }
  }
  if (paramArr===undefined || paramArr == null) {
    load.hide()
    return
  }
  // 第三步：获取数据库所有母参数信息集合以及该模型用到的参数集合
  getParentParamByParamArr(paramArr).then((e) => {
    var paramList = e.data.paramList // 定义所有母参信息数组
    //   var paramRelList = e.data.paramRelList;//定义所有与该模型关联的参数集合
    // 第四步：将模型下关联的参数的默认值和排序值绑定到对应的母参上
    if (typeof paramArr[0].sort === undefined && typeof paramArr[0].paramValue === undefined) {

    } else {
      $('#tbody').empty()
      for (var k = 0; k < paramList.length; k++) {
        // 遍历所有母版参数
        var moduleParamId = paramList[k].ammParamUuid
        for (var t = 0; t < paramArr.length; t++) {
          // 遍历所有模型关联参数
          if (paramArr[t].moduleParamId === moduleParamId) {
            // 匹配参数的默认值和排序值
            paramList[k].defaultVal = paramArr[t].paramValue
            paramList[k].sortVal = paramArr[t].sort // 排序值
            break
          }
        }
      }
    }
    // 第五步：找出有效参数集合中未配置的参数,并追加TR行 $("#mochu").empty()
    var moduleParamArr = [] // 存储已匹配的母版参数集合
    if (paramArr.length > 0) {
      $('#mochu').empty()
      for (var j = 0; j < paramArr.length; j++) {
        // 遍历有效的参数集合
        var hasExist = false
        $('.setParamTr').each(function (t, v) {
          var moduleParamId = $(this).attr('data-moduleParamId')
          if (moduleParamId === paramArr[j].moduleParamId) {
            hasExist = true
            return false
          }
        })
        if (
          $.inArray(paramArr[j].moduleParamId, hasSetParamIdArr) != -1 &&
          hasExist
        ) {
          // 过滤掉有效参数集合中已经配置过的参数
          continue
        }
        if ($.inArray(paramArr[j].moduleParamId, moduleParamArr) != -1) {
          // 过滤paramArr中母参重复的复制参数
          continue
        }
        // 生成列表行html
        var html =
          '<tr class="setParamTr" data-moduleParamId="' +
          paramArr[j].moduleParamId +
          '"><td align="center">' +
          paramArr[j].name +
          '</td>'
        var htmlContent = ''
        var description = ''
        for (var k = 0; k < paramList.length; k++) {
          // 循环所有母版参数
          var moduleParamId = paramList[k].ammParamUuid
          if (
            moduleParamId === paramArr[j].moduleParamId &&
            $.inArray(moduleParamId, moduleParamArr) == -1
          ) {
            // 匹配复制参数的母版参数ID    paramObj.defaultVal
            if(paramList[k].dataType!='date' && paramList[k].defaultVal!=''){
              paramList[k].defaultVal = JSON.stringify(paramList[k].defaultVal)
            }
            var returnObj = initParamHtml_Common(paramList[k])
            if (!returnObj.isError) {
              htmlContent = returnObj.htmlContent
            }
            moduleParamArr.push(moduleParamId)
            if (paramList[k].description == null) {
              paramList[k].description = '无'
            }
            if (typeof paramList[k].description !== 'undefined') {
              description = paramList[k].description
            }
            break
          }
        }
        html +=
          '<td>' + htmlContent + '</td><td>' + description + '</td></tr>'
        if (canEditor) {
          $('#paramTable>tbody').append(html).sortable().disableSelection()
        } else {
          $('#paramTable>tbody').append(html)
        }
      }
    }

    // 第六步：统一初始化参数的html（文本框、下拉列表、下拉树），并反显已配置参数的信息（包括默认值和排序值）
    initParam(canEditor)
  })
}

/**
 * 初始化参数配置
 */
export function initSetting() {
  let load = $(settingVue.$refs.settingParamDiv).mLoading({ 'text': '正在加载配置，请稍后……', 'hasCancel': false })
  try {
    let hasSetParamIdArr = []// 存放有效参数集合中已配置过得参数集合
      if (settingVue.paramsSetting && settingVue.paramsSetting.length > 0) {
        for (let i = 0; i < settingVue.paramsSetting.length; i++) {
          if ($.inArray(settingVue.paramsSetting[i].moduleParamId, hasSetParamIdArr) < 0) {
            hasSetParamIdArr.push(settingVue.paramsSetting[i].moduleParamId)
          }
        }
      }
    // 第二步：先获取有效的参数集合
    let paramArr = settingVue.paramsSetting
    if (paramArr===undefined || paramArr == null) {
      load.hide()
      settingVue.setParamArr = []
      return
    }
    // 第三步：遍历已配置过得参数行（若有多余行则删除）,同时找到已配置的参数
    for(let i=settingVue.setParamArr.length - 1; i>=0; i--){// 倒序遍历已渲染的参数配置数组
      let moduleParamId = settingVue.setParamArr[i].dataModuleParamId// 取得当前行绑定的母参ID
      let num = 0// 记录参数比较值不相等的次数
      for (let j = 0; j < paramArr.length; j++) { // 遍历有效的参数集合
        if (moduleParamId !== paramArr[j].moduleParamId) {
          num++
        }
        if ($.inArray(paramArr[j].moduleParamId, hasSetParamIdArr) < 0 && moduleParamId === paramArr[j].moduleParamId) {
          hasSetParamIdArr.push(paramArr[j].moduleParamId)
        }
        if (num === paramArr.length) { // 如果参数配置行的参数与有效参数集合匹配不上
          let index = settingVue.setParamArr.findIndex(item => item.dataModuleParamId === moduleParamId)
          settingVue.setParamArr.splice(index,1)// 则删除当前元素
          // $('.setParamTr:eq(' + i + ')').remove()// 则删除当前行
        }
      }
    }
    // 第四步：获取数据库所有母参数信息
     findParamsAndModelRelParams().then( response => {
      if(response.data == null){
        load.hide()
        settingVue.$message.error('获取参数信息失败')
      }else {
        if (response.data.isError) {
          load.hide()
          settingVue.$message.error({message: response.data.message})
        } else {
          let paramList = response.data.paramList// 定义所有母参信息数组
          // 第五步：找出有效参数集合中未配置的参数,并追加TR行
          let moduleParamArr = []// 存储已匹配的母版参数集合
          for (let j = 0; j < paramArr.length; j++) { // 遍历有效的参数集合
            let hasExist = false
            for (let i = 0; i < settingVue.setParamArr.length; i++) {
              if (settingVue.setParamArr[i].dataModuleParamId === paramArr[j].moduleParamId) {
                hasExist = true
                break
              }
            }
            if ($.inArray(paramArr[j].moduleParamId, hasSetParamIdArr) > -1 && hasExist) { // 过滤掉有效参数集合中已经配置过的参数
              continue
            }
            if ($.inArray(paramArr[j].moduleParamId, moduleParamArr) > -1) { // 过滤掉有效参数集合中母参重复的复制参数
              continue
            }
            let setParamObj = {dataModuleParamId: paramArr[j].moduleParamId, name: paramArr[j].name,}
            for (let k = 0; k < paramList.length; k++) { // 循环所有母版参数
              let moduleParamId = paramList[k].ammParamUuid
              let paramObj = {...{}, ...paramList[k]}
              if (moduleParamId === paramArr[j].moduleParamId && $.inArray(moduleParamId, moduleParamArr) < 0) { // 匹配复制参数的母版参数ID
                setParamObj.inputType = paramObj.inputType//参数类型
                //设置默认值
                setParamObj.value = ''
                if ($.inArray(paramArr[j].moduleParamId, hasSetParamIdArr) > -1 && moduleParamId === paramArr[j].moduleParamId &&
                  paramArr[j].defaultVal && paramArr[j].defaultVal !== '') {
                  setParamObj.value = paramArr[j].defaultVal
                  paramObj.defaultVal = paramArr[j].defaultVal
                }
                let returnObj =getSettingParamArr(paramObj, setParamObj)
                if (!returnObj.isError) {
                  setParamObj = returnObj.setParamObj
                } else {
                  settingVue.$message.error({message: returnObj.message})
                }
                moduleParamArr.push(moduleParamId)
                if (typeof paramObj.description !== 'undefined' && paramObj.description != null) {
                  setParamObj.description = paramObj.description
                }
                settingVue.setParamArr.push(setParamObj)
                break
              }
            }
          }
          $(settingVue.$refs.setParamTbody).sortable().disableSelection()
          settingVue.$nextTick(() => {
            // 第六步：统一初始化参数的html（文本框、下拉列表、下拉树），并反显已配置参数的信息（包括默认值和排序值）
            initParam(paramArr, hasSetParamIdArr)
            // 第七步：刷新SQL值，将已编写的SQL赋值给sql
            load.hide()
          })
        }
      }
    })
  } catch (e) {
    load.hide()
    console.info(e)
  }
}

/**
 * 初始化参数配置模型编辑新增 模型参数初始化
 */
 export function initSettingParam() {
  let load = $(settingVue.$refs.settingParamDiv).mLoading({
    'text': '正在加载配置，请稍后……',
    'hasCancel': false
  })
  try {
    let hasSetParamIdArr = [] // 存放有效参数集合中已配置过得参数集合
    if (settingVue.paramsSetting && settingVue.paramsSetting.length > 0) {
      for (let i = 0; i < settingVue.paramsSetting.length; i++) {
        if ($.inArray(settingVue.paramsSetting[i].moduleParamId, hasSetParamIdArr) < 0) {
          hasSetParamIdArr.push(settingVue.paramsSetting[i].moduleParamId)
        }
      }
    }
    // 第二步：先获取有效的参数集合
    let paramArr = settingVue.paramsSetting
    if (paramArr === undefined || paramArr == null) {
      load.hide()
      settingVue.setParamArr = []
      return
    }
    // 第三步：遍历已配置过得参数行（若有多余行则删除）,同时找到已配置的参数
    for (let i = settingVue.setParamArr.length - 1; i >= 0; i--) { // 倒序遍历已渲染的参数配置数组
      let moduleParamId = settingVue.setParamArr[i].dataModuleParamId // 取得当前行绑定的母参ID
      let num = 0 // 记录参数比较值不相等的次数
      for (let j = 0; j < paramArr.length; j++) { // 遍历有效的参数集合
        if (moduleParamId !== paramArr[j].moduleParamId) {
          num++
        }
        if ($.inArray(paramArr[j].moduleParamId, hasSetParamIdArr) < 0 && moduleParamId === paramArr[j].moduleParamId) {
          hasSetParamIdArr.push(paramArr[j].moduleParamId)
        }
        if (num === paramArr.length) { // 如果参数配置行的参数与有效参数集合匹配不上
          let index = settingVue.setParamArr.findIndex(item => item.dataModuleParamId === moduleParamId)
          settingVue.setParamArr.splice(index, 1) // 则删除当前元素
          // $('.setParamTr:eq(' + i + ')').remove()// 则删除当前行
        }
      }
    }
    // 第四步：获取数据库所有母参数信息
    findParamsAndModelRelParams().then(response => {
      if (response.data == null) {
        load.hide()
        settingVue.$message.error('获取参数信息失败')
      } else {
        if (response.data.isError) {
          load.hide()
          settingVue.$message.error({
            message: response.data.message
          })
        } else {
          let paramList = response.data.paramList // 定义所有母参信息数组
          // 第五步：找出有效参数集合中未配置的参数,并追加TR行
          let moduleParamArr = [] // 存储已匹配的母版参数集合
          let copyParamArr = []// 定义所有参数的对象数组（已去重）
          let promiseList = []
          for (let j = 0; j < paramArr.length; j++) { // 遍历有效的参数集合

            // let setParamObj = {
            //   dataModuleParamId: paramArr[j].moduleParamId,
            //   name: paramArr[j].name,
            // }
            let hasExist = false
            for (let i = 0; i < settingVue.setParamArr.length; i++) {
              if (settingVue.setParamArr[i].dataModuleParamId === paramArr[j].moduleParamId) {
                // 图形化默认值修改
                if (typeof settingVue.setParamArr[i].dataDefaultVal !== 'undefined' && settingVue.setParamArr[i].dataDefaultVal != null 
                && typeof paramArr[j].defaultVal !== 'undefined' && settingVue.setParamArr[i].dataDefaultVal != paramArr[j].defaultVal) {
                  settingVue.setParamArr[i].defaultVal = paramArr[j].defaultVal
                  settingVue.setParamArr[i].value = paramArr[j].defaultVal
                  settingVue.setParamArr[i].useQuotation = paramArr[j].useQuotation
                  // // 新增图形化执行修改参数
                  // if (settingVue.setParamArr[i].data == null) {
                  //   setParamObj.inputType = settingVue.setParamArr[i].inputType //参数类型
                  //   let param = _.find(paramList, ['ammParamUuid', settingVue.setParamArr[i].dataModuleParamId])
                  //   let paramObj = {...{},...param}
                  //   getSettingParamArr(paramObj, setParamObj).then(res => {
                  //       let returnObj = res
                  //       settingVue.setParamArr[i].data = returnObj.setParamObj.data
                  //   })
                  // }
                }
                hasExist = true
              }
            }

            if ($.inArray(paramArr[j].moduleParamId, hasSetParamIdArr) > -1 && hasExist) { // 过滤掉有效参数集合中已经配置过的参数
              continue
            }
            if ($.inArray(paramArr[j].moduleParamId, moduleParamArr) > -1) { // 过滤掉有效参数集合中母参重复的复制参数
              continue
            }
            for (let k = 0; k < paramList.length; k++) { // 循环所有母版参数
              let moduleParamId = paramList[k].ammParamUuid
              let paramObj = {
                ...{},
                ...paramList[k]
              }
              if (moduleParamId === paramArr[j].moduleParamId && $.inArray(moduleParamId, moduleParamArr) < 0) { // 匹配复制参数的母版参数ID
                // setParamObj.inputType = paramObj.inputType //参数类型
                // setParamObj.useQuotation = paramObj.useQuotation //参数类型
                //设置默认值
                // setParamObj.value = ''
                if ($.inArray(paramArr[j].moduleParamId, hasSetParamIdArr) > -1 && moduleParamId === paramArr[j].moduleParamId &&
                  paramArr[j].defaultVal && paramArr[j].defaultVal !== '') {
                 
                  // setParamObj.value = paramArr[j].defaultVal
                  // setParamObj.useQuotation = paramArr[j].useQuotation
                  paramObj.defaultVal = paramArr[j].defaultVal
                  // if (paramList[k].inputType == '')
                  paramList[k].defaultVal = paramArr[j].defaultVal
                  paramList[k].moduleParamId = paramArr[j].moduleParamId
                }
                copyParamArr.push(paramList[k])
                moduleParamArr.push(moduleParamId)
              }
            }
            
          }
          for (let n = 0; n < copyParamArr.length; n++) {
            let setParamObj = {
              "paramName": copyParamArr[n].paramName,
              "inputType": copyParamArr[n].inputType,//参数类型
              "masterparam": copyParamArr[n].paramRelationList[0],
              "useQuotation":copyParamArr[n].useQuotation,
              "example":copyParamArr[n].example,
              "paramConditionList":copyParamArr[n].paramConditionList,
              value: copyParamArr[n].defaultVal && copyParamArr[n].defaultVal || '',
              // defaultVal: copyParamArr[n].defaultVal,
              dataModuleParamId: copyParamArr[n].moduleParamId,
              name: copyParamArr[n].paramName,
              description: copyParamArr[n].description && copyParamArr[n].description || ''
            };
            promiseList.push(new Promise(function (resolve, reject) {
              resolve(getSettingParamArr(copyParamArr[n], setParamObj, null, null, n))
            }))
            
            // if (!returnObj.isError) {
            //   setParamObj = returnObj.setParamObj
            // } else {
            //   settingVue.$message.error({
            //     message: returnObj.message
            //   })
            // }
            // if (typeof copyParamArr[n].description !== 'undefined' && copyParamArr[n].description != null) {
            //   setParamObj.description = copyParamArr[n].description
            // }
            // settingVue.setParamArr.push(setParamObj)
            // settingVue.$forceUpdate();
            // load.hide()
          }
          Promise.all(promiseList).then((rspList)=> {
            rspList.map((val)=> {
              // if (!val.isError) {
              //   settingVue.setParamArr.push(val.setParamObj)
              //   alert('load关闭')
              //   load.destroy()
              // } else {
              //   settingVue.$message.error({
              //     message: val.message
              //   })
              // }
              settingVue.setParamArr.push(val.setParamObj)
            });
            settingVue.$nextTick(() => {
              load.destroy()
            })
           
        });
          $(settingVue.$refs.setParamTbody).sortable().disableSelection()
         
          // settingVue.$nextTick(() => {
          //   // 第六步：统一初始化参数的html（文本框、下拉列表、下拉树），并反显已配置参数的信息（包括默认值和排序值）
          //   // initParam(paramArr, hasSetParamIdArr)
          //   // 第七步：刷新SQL值，将已编写的SQL赋值给sql
           
          //   // alert('关闭')
          //   load.destroy()
          // })  
        }
      }
    })
  } catch (e) {
    load.hide()
    console.info(e)
  }
}


/**
 * 初始化及反显已配置的下拉树和下拉列表的参数（默认值和排序）
 * @param paramArr 待配置的复制参数集合
 * @param hasSetParamIdArr 已配置的复制参数ID集合
 */
function initParam(paramArr, hasSetParamIdArr) {
  // 初始化下拉列表
  let $selectParam = settingVue.$refs.selectParam
  if ($selectParam && $selectParam.length > 0) {
    for(let i=0; i<$selectParam.length; i++){
      let index = Number($selectParam[i].parentNode.getAttribute("index"))
      let choiceType = settingVue.setParamArr[index].dataChoiceType// 下拉列表的数据是单选还是多选
      let moduleParamId = settingVue.setParamArr[index].dataId// 母参ID
      let paramName = settingVue.setParamArr[index].dataName// 母参名称
      let sql = typeof settingVue.setParamArr[index].dataSql !== "undefined" ? settingVue.setParamArr[index].dataSql : ''// 该参数是否有SQL语句（0否1是）
      let dataArr = typeof settingVue.setParamArr[index].data !== 'undefined' ? settingVue.setParamArr[index].data : []// 下拉列表数据
      let initDataArr = false// 是否初始化数据
      let selectSetting = {
        el: '#selectParam' + moduleParamId, // 此处不使用【i】的原因在于每个参数都唯一不会重复，故【el】唯一
        filterable: true,
        filterMethod: function(val, item, index, prop) {
          if (val === item.value) { // 把value相同的搜索出来
            return true
          }
          if (item.name && item.name.indexOf(val) > -1) { // 名称中包含的搜索出来
            return true
          }
          return false// 不知道的就不管了
        },
        data: dataArr
      }
      if (choiceType == 1) { // 单选
        selectSetting.radio = true
        selectSetting.clickClose = true
      }
      if (sql !== '') { // 当前参数是SQL语句方式
        let associatedParamIdArr = typeof $(this).attr('data-associatedParamIdArr') !== 'undefined' ? JSON.parse($(this).attr('data-associatedParamIdArr')) : []// 当前参数的被关联的参数的集合
        let paramArrNew = typeof $(this).attr('data-paramArr') !== 'undefined' ? JSON.parse($(this).attr('data-paramArr')) : []// 影响当前参数的主参数的集合
        selectSetting.show = function() {
          initDataArr = paramCommonJs.selectShow(settingVue.$refs.settingParamDiv,'#selectParam', moduleParamId, paramName, sql, choiceType, paramArrNew, dataArr, initDataArr)
        }
        selectSetting.hide = function() {
          if (initDataArr && dataArr.length === 0) {
            let selectXs = xmSelect.get('#selectParam' + moduleParamId, true)// 获取当前下拉框的实体对象
            dataArr = selectXs.options.data
            initDataArr = false
          }
          if ($.inArray(moduleParamId, associatedParamIdArr) > -1) {
            paramCommonJs.selectHide('#selectParam', moduleParamId,associatedParamIdArr)
          }
        }
      }
      // 设置默认值
      if(typeof settingVue.setParamArr[index].value !== "undefined" && settingVue.setParamArr[index].value != null){
        selectSetting.initValue = settingVue.setParamArr[index].value
      }
      xmSelect.render(selectSetting)
    }
  }
  // 初始化下拉树
  let $selectTreeParam = settingVue.$refs.selectTreeParam
  if ($selectTreeParam && $selectTreeParam.length > 0) {
    for(let i=0; i<$selectTreeParam.length; i++){
      let index = Number($selectTreeParam[i].parentNode.getAttribute("index"))
      let choiceType = settingVue.setParamArr[index].dataChoiceType// 下拉列表的数据是单选还是多选
      let moduleParamId = settingVue.setParamArr[index].dataId// 母参ID
      let paramName = settingVue.setParamArr[index].dataName// 母参名称
      let sql = typeof settingVue.setParamArr[index].dataSql !== "undefined" ? settingVue.setParamArr[index].dataSql : ''// 该参数是否有SQL语句（0否1是）
      let dataArr = typeof settingVue.setParamArr[index].data !== 'undefined' ? settingVue.setParamArr[index].data : []// 下拉列表数据
      let initDataArr = false// 是否初始化数据
      let selectSetting = {
        el: '#selectTreeParam' + moduleParamId, // 此处不使用【i】的原因在于每个参数都唯一不会重复，故【el】唯一
        // autoRow: true,
        filterable: true,
        tree: {
          show: true,
          showFolderIcon: true, // 显示三角标
          showLine: true, // 显示虚线
          indent: 30, // 间距
          strict: false// 严格父子结构
        },
        height: 'auto',
        data: dataArr
      }
      if (sql !== '') { // 当前参数是SQL语句方式
        let associatedParamIdArr = typeof $(this).attr('data-associatedParamIdArr') !== 'undefined' ? JSON.parse($(this).attr('data-associatedParamIdArr')) : []// 当前参数的被关联的参数的集合
        let paramArrNew = typeof $(this).attr('data-paramArr') !== 'undefined' ? JSON.parse($(this).attr('data-paramArr')) : []// 影响当前参数的主参数的集合
        selectSetting.show = function() {
          initDataArr = paramCommonJs.selectShow(settingVue.$refs.settingParamDiv,'#selectTreeParam', moduleParamId, paramName, sql, choiceType, paramArrNew, dataArr, initDataArr)
        }
        selectSetting.hide = function() {
          if (initDataArr && dataArr.length === 0) {
            let selectXs = xmSelect.get('#selectTreeParam' + moduleParamId, true)// 获取当前下拉框的实体对象
            dataArr = selectXs.options.data
            initDataArr = false
          }
          if ($.inArray(moduleParamId, associatedParamIdArr) > -1) {
            paramCommonJs.selectHide('#selectTreeParam', moduleParamId,associatedParamIdArr)
          }
        }
      }
      // 设置默认值
      if(typeof settingVue.setParamArr[index].value !== "undefined" && settingVue.setParamArr[index].value != null){
        selectSetting.initValue = settingVue.setParamArr[index].value
      }
      if (choiceType == 1) { // 单选
        selectSetting.radio = true
        selectSetting.clickClose = true
      } else { // 多选
        selectSetting.on = function(data) {
          let arr = data.arr
          let change = data.change[0]// 每次选中change只有一个值
          let newDataArr = []
          let checkData = data.change.slice(0, 1)// 当前选中的节点数据
          newDataArr.push(checkData[0])
          newDataArr = getChildrenData(checkData[0], newDataArr)// 获取当前选中的节点数据和其子孙节点数据
          if (data.isAdd) { // 选中时
            // 先将dataArr在arr中已存在的部分移除
            for (let k = 0; k < newDataArr.length; k++) { // 遍历即将取消选中的上级节点
              for (let j = arr.length - 1; j >= 0; j--) { // 倒叙遍历所有选中的节点
                if (arr[j].value === newDataArr[k].value && arr[j].pValue === newDataArr[k].pValue) { // 若存在
                  arr.splice(j, 1)// 则倒序移除
                  break
                }
              }
            }
            // 将下拉树组装好的数据进行拆分，把每个对象的孩子差分出来
            let preDataArr = getSplitDataArr(dataArr)
            // 根据当前节点递归获取未被选中的且需要被选中的上级节点
            let parentUnCheckedArr = getParentUnChecked(checkData[0], [], preDataArr, arr)
            newDataArr = newDataArr.concat(parentUnCheckedArr)
            arr.push.apply(arr, newDataArr)// 将新选中的与已选中的进行合并
          } else { // 取消选中时
            // 根据当前节点递归获取被选中的且需要取消选中的上级节点
            let parentCheckedArr = getParentChecked(checkData[0], [], arr)
            // 遍历取消上级节点的选中状态
            for (let k = 0; k < parentCheckedArr.length; k++) { // 遍历即将取消选中的上级节点
              for (let j = arr.length - 1; j >= 0; j--) { // 倒叙遍历所有选中的节点
                if (arr[j].value === parentCheckedArr[k].value && arr[j].pValue === parentCheckedArr[k].pValue) { // 若存在
                  arr.splice(j, 1)// 则倒序移除
                  break
                }
              }
            }
            // 遍历取消当前节点的子孙节点的选中状态
            for (let k = 0; k < newDataArr.length; k++) { // 遍历即将取消选中的节点
              for (let j = arr.length - 1; j >= 0; j--) { // 倒叙遍历所有选中的节点
                if (arr[j].value === newDataArr[k].value && arr[j].pValue === newDataArr[k].pValue) { // 若存在
                  arr.splice(j, 1)// 则倒序移除
                  break
                }
              }
            }
          }
          return arr
        }
      }
      xmSelect.render(selectSetting)
    }
  }
}

/**
 * 获取参数配置，组织配置对象
 */
export function getParamsSetting() {
  // 组装对象 paramSettingArr
  let returnObj = {
    'verify': true,
    'message': '',
    // 'paramsSetting':[]
    'paramSettingArr':[]
  }
  // 验证文本框输入的默认值
  for(let i=0; i<settingVue.$refs.setParamTr.length; i++){
    let index = Number(settingVue.$refs.setParamTr[i].parentNode.getAttribute("index"))
    if(settingVue.setParamArr[index].value !== '' && settingVue.setParamArr[index].inputType === 'textinp'){// 如果当前值不为空且如果是文本框参数（非日期）
      //验证文本框参数值的长度是否满足
      let paramName = settingVue.setParamArr[index].dataName// 获取参数名称
      let dataLength = settingVue.setParamArr[index].dataDataLength// 获取参数值长度
      // 如果该参数有长度限制且默认值不等于设置的长度值
      if (settingVue.setParamArr[index].value ==undefined){
        returnObj.verify = false
        returnObj.message = '请先设置参数默认值'
        return returnObj
      }
      if (typeof dataLength !== 'undefined' && settingVue.setParamArr[index].value.length > parseInt(dataLength)) {
        returnObj.verify = false
        returnObj.message = '参数【' + paramName + '】输入值的长度与设置的长度值【' + parseInt(dataLength) + '】不相等'
        return returnObj
      }
    }
  }
  if (!returnObj.verify) {
    return returnObj
  }
  // 绑定下拉列表选中的默认值
  let $selectParam = settingVue.$refs.selectParam
  if ($selectParam && $selectParam.length > 0) {
    for (let i = 0; i < $selectParam.length; i++) {
      // $('.selectParam').each(function(i, v) {
      let index = Number($selectParam[i].parentNode.getAttribute("index"))
      let moduleParamId = settingVue.setParamArr[index].dataId// 母参ID
      let selectParamXs = xmSelect.get('#selectParam' + moduleParamId, true)
      let paramSelectedObj = selectParamXs.getValue()// 获取选中的参数值名称
      let defaultValueArr = []
      for (let j = 0; j < paramSelectedObj.length; j++) {
        defaultValueArr.push(paramSelectedObj[j].value)
      }
      if (defaultValueArr.length > 0) {
        settingVue.setParamArr[index].value = defaultValueArr
      }
    }
  }
  // 绑定下拉树选中的默认值
  let $selectTreeParam = settingVue.$refs.selectTreeParam
  if ($selectTreeParam && $selectTreeParam.length > 0) {
    for (let i = 0; i < $selectTreeParam.length; i++) {
      // $('.selectTreeParam').each(function(i, v) {
      let index = Number($selectTreeParam[i].parentNode.getAttribute("index"))
      let moduleParamId = settingVue.setParamArr[index].dataId// 母参ID
      let selectTreeParamXs = xmSelect.get('#selectTreeParam' + moduleParamId, true)
      let paramSelectedObj = selectTreeParamXs.getValue()// 获取选中的参数值名称
      let defaultValueArr = []
      for (let j = 0; j < paramSelectedObj.length; j++) {
        defaultValueArr.push(paramSelectedObj[j].value)
      }
      if (defaultValueArr.length > 0) {
        // $(this).attr('data-value', JSON.stringify(defaultValueArr))
        settingVue.setParamArr[index].value = defaultValueArr
      }
    }
  }
      for (let j = 0; j < settingVue.paramsSetting.length; j++) {
          let obj = settingVue.paramsSetting[j]
          obj.sortVal = 1// 先给每个参数赋值默认排序值为1
          // 设置该参数的默认值和排序值
          let defaultVal = ''
          let sortVal = ''
          for(let k=0; k<settingVue.$refs.setParamTr.length; k++){
            let index = Number(settingVue.$refs.setParamTr[k].getAttribute("index"))
            let moduleParamId = settingVue.setParamArr[index].dataId// 取得当前行绑定的参数ID
            // let moduleParamId = $(this).attr('data-id')// 取得当前行绑定的参数ID
            if (obj.moduleParamId === moduleParamId) {
              if (typeof settingVue.setParamArr[index].value !== 'undefined') {
                defaultVal = settingVue.setParamArr[index].value
              }
              sortVal = parseInt(k + 1)
              break
            }
          }
          obj.defaultVal = defaultVal
          if (sortVal !== '') {
            obj.sortVal = sortVal
          }
          returnObj.paramSettingArr.push(obj)
      }
  // 对参数数组的值按照排序值由小到大得顺序进行排序
  paramCommonJs.sortParamArr(returnObj.paramSettingArr)
  return returnObj
}

/**
 * 获取参数配置，组织配置对象
 */
export function getParamsSettingBySave() {
  // 组装对象 paramSettingArr
  let returnObj = {
    'verify': true,
    'message': '',
    // 'paramsSetting':[]
    'paramSettingArr': []
  }
  // 验证文本框输入的默认值
  for (let i = 0; i < settingVue.$refs.setParamTr.length; i++) {
    let index = Number(settingVue.$refs.setParamTr[i].parentNode.getAttribute("index"))
    if (settingVue.setParamArr[index].value !== '' && settingVue.setParamArr[index].inputType === 'textinp') { // 如果当前值不为空且如果是文本框参数（非日期）
      //验证文本框参数值的长度是否满足
      let paramName = settingVue.setParamArr[index].dataName // 获取参数名称
      let dataLength = settingVue.setParamArr[index].dataDataLength // 获取参数值长度
      // 如果该参数有长度限制且默认值不等于设置的长度值
      if (settingVue.setParamArr[index].value == undefined) {
        returnObj.verify = false
        returnObj.message = '请先设置参数默认值'
        return returnObj
      }
      if (typeof dataLength !== 'undefined' && settingVue.setParamArr[index].value.length > parseInt(dataLength)) {
        returnObj.verify = false
        returnObj.message = '参数【' + paramName + '】输入值的长度与设置的长度值【' + parseInt(dataLength) + '】不相等'
        return returnObj
      }
    }
  }
  if (!returnObj.verify) {
    return returnObj
  }
  for (let j = 0; j < settingVue.paramsSetting.length; j++) {
    let obj = settingVue.paramsSetting[j]
    obj.sortVal = 1 // 先给每个参数赋值默认排序值为1
    // 设置该参数的默认值和排序值
    let defaultVal = ''
    let sortVal = ''
    for (let k = 0; k < settingVue.$refs.setParamTr.length; k++) {
      let index = Number(settingVue.$refs.setParamTr[k].getAttribute("index"))
      let moduleParamId = settingVue.setParamArr[index].dataId // 取得当前行绑定的参数ID
      // let moduleParamId = $(this).attr('data-id')// 取得当前行绑定的参数ID
      if (obj.moduleParamId === moduleParamId) {
        if (typeof settingVue.setParamArr[index].value !== 'undefined') {
          defaultVal = settingVue.setParamArr[index].value
        }
        sortVal = parseInt(k + 1)
        break
      }
    }
    obj.defaultVal = defaultVal
    if (sortVal !== '') {
      obj.sortVal = sortVal
    }
    returnObj.paramSettingArr.push(obj)
  }
  // 对参数数组的值按照排序值由小到大得顺序进行排序
  paramCommonJs.sortParamArr(returnObj.paramSettingArr)
  return returnObj
}



/**
 * 根据参数类型组织参数的HTML元素
 * createParamNodeHtml()方法内部调用的方法
 * @param paramObj 参数对象
 * @param selectNum 下拉列表参数的个数
 * @param selectTreeNum 下拉树参数的个数
 * @param setParamObj 待返回的参数对象
 */
//  export function getSettingParamArr(paramObj, setParamObj, selectNum, selectTreeNum, index){
//   let obj = {
//     "selectNum":selectNum,
//     "selectTreeNum":selectTreeNum,
//     "setParamObj":{...{}, ...setParamObj},
//     "isError": false,
//     "message": ""
//   }
//   let dataArr = []// 下拉列表或下拉树的数据的数组
//   let paramArr = []// 影响当前参数的主参集合
//   let associatedParamIdArr = []// 受当前参数影响的被关联参数ID集合
//   let paramSql = paramObj.paramChoice.optionsSql//拉列表或下拉树的SQL语句
//   obj.setParamObj.title = paramObj.paramChoice.allowedNull === 0 ? '不可为空' : '可为空'
//   obj.setParamObj.dataType = paramObj.dataType // dataType
//   obj.setParamObj.paramConditionList = paramObj.paramConditionList
//   let hasSql = false// 下拉列表或下拉树是非SQL方式或者是SQL方式但值为空
//   switch (obj.setParamObj.inputType) {
//     case 'lineinp':// 下拉列表
//       if (!paramSql) { // 备选sql为空的情况下 取静态的option值
//          // 下拉静态列表赋值
//          paramObj.paramChoice.ammParamOptionsList.forEach(r => {
//            if (r.optionsVal && r.optionsName) {
//              // 组织下拉选项数据
//              dataArr.push({
//                'name': r.optionsName,
//                'value': r.optionsVal
//              })
//            }
          
//           obj.setParamObj.data = dataArr
//          })
//       } else { // 执行备选sql
//         if (paramSql !== '') {
//           hasSql = true// 下拉列表是SQL方式
//           // if (typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null) { // 如果有该参数默认值，则直接执行备选SQL加载初始化数据
//           //  let response = await executeParamSql(paramSql)
//           //  if(response.code == 0){
//           //   if(response.data == null){
//           //     obj.isError = true
//           //     obj.message = `获取参数【${paramObj.paramName}】的值的失败`
//           //   }else {
//           //     if (response.data.isError) {
//           //       obj.isError = true
//           //       obj.message = `获取参数【${paramObj.stateparamName}】的值的失败，原因：${response.data.message}`
//           //     } else {
//           //       let e = response.data
//           //       if (e.paramList && e.paramList.length > 0) {
//           //         for (let k = 0; k < e.paramList.length; k++) {
//           //            dataArr.push({
//           //              'name': e.paramList[k].paramName,
//           //              'value': e.paramList[k].paramValue
//           //            })
//           //         }
//           //       }
//           //      obj.setParamObj.data = dataArr
//           //     }
//           //   }
//           //  }

//           executeParamSql(paramSql).then(response=>{
//             if(response.data == null){
//               obj.isError = true
//               obj.message = `获取参数【${paramObj.paramName}】的值的失败`
//             }else {
//               if (response.data.isError) {
//                 obj.isError = true
//                 obj.message = `获取参数【${paramObj.stateparamName}】的值的失败，原因：${response.data.message}`
//               } else {
//                 let e = response.data
//                 if (e.paramList && e.paramList.length > 0) {
//                   for (let k = 0; k < e.paramList.length; k++) {
//                     dataArr.push({
//                       'name': e.paramList[k].paramName,
//                       'value': e.paramList[k].paramValue
//                     })
//                   }
//                 }
//               obj.setParamObj.data = dataArr
//               }
//             }
//           })

          
//         }
//       }
//       if(typeof obj.selectNum !== 'undefined' && obj.selectNum != null){
//         obj.setParamObj.id = `selectParam${obj.selectNum}`
//         obj.selectNum++
//       }else{
//         obj.setParamObj.id = `selectParam${paramObj.ammParamUuid}`
//       }
//       obj.setParamObj.dataId = paramObj.ammParamUuid
//       obj.setParamObj.dataName = paramObj.paramName
//       obj.setParamObj.dataChoiceType = paramObj.paramChoice.choiceType
//       if(hasSql){
//         obj.setParamObj.dataSql = paramSql
//         obj.setParamObj.dataParamArr = paramArr
//         obj.setParamObj.dataAssociatedParamIdArr = associatedParamIdArr
//       }
     
//       if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null && paramObj.defaultVal){
//         // 下拉列表默认值
//           obj.setParamObj.dataDefaultVal = paramObj.defaultVal
//           // 默认值
//           obj.setParamObj.value = obj.setParamObj.dataDefaultVal
//           if (paramObj.paramChoice.choiceType === '1'){
//             // 单选
//             settingVue.paramListValueList[index] = paramObj.defaultVal
//           } else {
//             // 多选
//             const list = [] 
//             if (paramObj.defaultVal.length > 0){
//               paramObj.defaultVal.forEach(o => {
//                 // if(paramObj.dataType == 'str') { list.push(`'` + o + `'`) }
//                 // else {list.push(o) }
//                 list.push(o)
//               })
//               settingVue.paramListValueList[index] = list
//             }
//           }
//        }else{
//          if (paramObj.paramChoice.choiceType === '1'){
//            // 单选
//            settingVue.paramListValueList[index] = ''
//          } else {
//            // 多选
//            settingVue.paramListValueList[index] = []
//          }
//        }
//       if(typeof paramObj.paramChoice.allowedNull !== 'undefined' && paramObj.paramChoice.allowedNull != null){
//         obj.setParamObj.dataAllowedNull = paramObj.paramChoice.allowedNull
//       }
//       break
//     case 'textinp':// 文本框
//       if (typeof paramObj.dataLength !== 'undefined' && paramObj.dataLength != null) {
//         obj.setParamObj.title += `,参数值的长度为${paramObj.dataLength}`
//       }
//       obj.setParamObj.dataId = paramObj.ammParamUuid
//       obj.setParamObj.dataName = paramObj.paramName
//       if(typeof paramObj.paramChoice.allowedNull !== 'undefined' && paramObj.paramChoice.allowedNull != null){
//         obj.setParamObj.dataAllowedNull = paramObj.paramChoice.allowedNull
//       }
//       if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null){
//         obj.setParamObj.dataDefaultVal = paramObj.defaultVal
//       }
//       if(typeof paramObj.dataLength !== 'undefined' && paramObj.dataLength != null){
//         obj.setParamObj.dataDataLength = paramObj.dataLength
//       }
//       break
//     case 'timeinp':// 时间
//       if (paramObj.dataType === 'date') { // 暂时只支持日期，不支持时间段
//         obj.setParamObj.dataId = paramObj.ammParamUuid
//         obj.setParamObj.dataName = paramObj.paramName
//         if(typeof paramObj.paramChoice.allowedNull !== 'undefined' && paramObj.paramChoice.allowedNull != null){
//           obj.setParamObj.dataAllowedNull = paramObj.paramChoice.allowedNull
//         }
//         if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null){
//           obj.setParamObj.dataDefaultVal = paramObj.defaultVal
//         }
//       }
//       break
//     case 'treeinp':// 下拉树
//       if (paramSql !== '') { // 执行备选SQL
//         hasSql = true
//         // if (typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null) { // 如果有该参数默认值，则直接执行备选SQL加载初始化数据
//         // let resp = await getSelectTreeData(paramSql)
//         // if (resp.data == null) {
//         //   obj.isError = true
//         //   obj.message = `获取参数【${paramObj.paramName}】的值的失败`
//         // } else {
//         //   if (resp.data.isError) {
//         //     obj.isError = true
//         //     obj.message = `获取参数【${paramObj.paramName}】的值的失败，原因：${resp.data.message}`
//         //   } else {
//         //     if (resp.data.result && resp.data.result.length > 0) {
//         //       // dataArr = organizeSelectTreeData(response.data.result)
//         //       dataArr = organizeSelectTreeData(resp.data.result, paramObj.dataType)
//         //     } else {
//         //       dataArr = []
//         //     }
//         //     obj.setParamObj.data = dataArr
//         //   }
//         // }
//         getSelectTreeData(paramSql).then(resp => {
//             if (resp.data == null) {
//               obj.isError = true
//               obj.message = `获取参数【${paramObj.paramName}】的值的失败`
//             } else {
//               if (resp.data.isError) {
//                 obj.isError = true
//                 obj.message = `获取参数【${paramObj.paramName}】的值的失败，原因：${resp.data.message}`
//               } else {
//                 if (resp.data.result && resp.data.result.length > 0) {
//                   // dataArr = organizeSelectTreeData(response.data.result)
//                   dataArr = organizeSelectTreeData(resp.data.result, paramObj.dataType)
//                 } else {
//                   dataArr = []
//                 }
//                 obj.setParamObj.data = dataArr
//                 if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null && paramObj.defaultVal){
//                 // 下拉树默认值
//                 obj.setParamObj.dataDefaultVal = paramObj.defaultVal
//                 obj.setParamObj.value = obj.setParamObj.dataDefaultVal
//                 if (paramObj.paramChoice.choiceType === '1'){
//                   // 单选
//                   // this.paramTreeValueList[index] = list[0]
//                   settingVue.paramTreeValueList[index] = paramObj.defaultVal
                
//                 } else {
//                   // 多选
//                   const list = []
//                   if (paramObj.defaultVal.length > 0){
//                     paramObj.defaultVal.forEach(o => {
//                       // if(paramObj.dataType == 'str') { list.push(`'` + o + `'`) }
//                       // else {list.push(o) }
//                       list.push(o)
//                     })
//                     settingVue.paramTreeValueList[index] = list
                    
//                   }
                  
//                 }
//                 }else{
//                   // 下拉树默认值
//                   if (paramObj.paramChoice.choiceType === '1'){
//                     // 单选
//                     // this.paramTreeValueList[index] = list[0]
//                     settingVue.paramTreeValueList[index] = ''
//                   } else {
//                     // 多选
//                     settingVue.paramTreeValueList[index] = []
//                   }
//                 }
//               }
//             }
//         })
//       }
//       if(typeof obj.selectTreeNum !== 'undefined' && obj.selectTreeNum != null){
//         obj.setParamObj.id = `selectTreeParam${obj.selectTreeNum}`
//         obj.selectTreeNum++
//       }else{
//         obj.setParamObj.id = `selectTreeParam${paramObj.ammParamUuid}`
//       }
//       obj.setParamObj.dataId = paramObj.ammParamUuid
//       obj.setParamObj.dataName = paramObj.paramName
//       obj.setParamObj.dataChoiceType = paramObj.paramChoice.choiceType
//       if(hasSql){
//         obj.setParamObj.dataSql = paramSql
//         obj.setParamObj.dataParamArr = paramArr
//         obj.setParamObj.dataAssociatedParamIdArr = associatedParamIdArr
//       }
//       // if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null && paramObj.defaultVal){
//       //   // 下拉树默认值
//       //   obj.setParamObj.dataDefaultVal = paramObj.defaultVal
//       //   obj.setParamObj.value = obj.setParamObj.dataDefaultVal
//       //   if (paramObj.paramChoice.choiceType === '1'){
//       //     // 单选
//       //     // this.paramTreeValueList[index] = list[0]
//       //     settingVue.paramTreeValueList[index] = paramObj.defaultVal
         
//       //   } else {
//       //     // 多选
//       //     const list = []
//       //     if (paramObj.defaultVal.length > 0){
//       //       paramObj.defaultVal.forEach(o => {
//       //         // if(paramObj.dataType == 'str') { list.push(`'` + o + `'`) }
//       //         // else {list.push(o) }
//       //         list.push(o)
//       //       })
//       //       settingVue.paramTreeValueList[index] = list
            
//       //     }
          
//       //   }
//       // }else{
//       //   // 下拉树默认值
//       //   if (paramObj.paramChoice.choiceType === '1'){
//       //     // 单选
//       //     // this.paramTreeValueList[index] = list[0]
//       //     settingVue.paramTreeValueList[index] = ''
//       //   } else {
//       //     // 多选
//       //     settingVue.paramTreeValueList[index] = []
//       //   }
//       // }
//       if(typeof paramObj.paramChoice.allowedNull !== 'undefined' && paramObj.paramChoice.allowedNull != null){
//         obj.setParamObj.dataAllowedNull = paramObj.paramChoice.allowedNull
//       }
//       break
//   }
//   return obj
// }

/**
 * 根据参数类型组织参数的HTML元素
 * createParamNodeHtml()方法内部调用的方法
 * @param paramObj 参数对象
 * @param selectNum 下拉列表参数的个数
 * @param selectTreeNum 下拉树参数的个数
 * @param setParamObj 待返回的参数对象
 */
export async function getSettingParamArr(paramObj, setParamObj, selectNum, selectTreeNum, index){
  let obj = {
    "selectNum":selectNum,
    "selectTreeNum":selectTreeNum,
    "setParamObj":{...{}, ...setParamObj},
    "isError": false,
    "message": ""
  }
  let dataArr = []// 下拉列表或下拉树的数据的数组
  let paramArr = []// 影响当前参数的主参集合
  let associatedParamIdArr = []// 受当前参数影响的被关联参数ID集合
  let paramSql = paramObj.paramChoice.optionsSql//拉列表或下拉树的SQL语句
  obj.setParamObj.title = paramObj.paramChoice.allowedNull === 0 ? '不可为空' : '可为空'
  obj.setParamObj.dataType = paramObj.dataType // dataType
  obj.setParamObj.paramConditionList = paramObj.paramConditionList
  let hasSql = false// 下拉列表或下拉树是非SQL方式或者是SQL方式但值为空
  switch (obj.setParamObj.inputType) {
    case 'lineinp':// 下拉列表
      if (!paramSql) { // 备选sql为空的情况下 取静态的option值
         // 下拉静态列表赋值
         paramObj.paramChoice.ammParamOptionsList.forEach(r => {
           if (r.optionsVal && r.optionsName) {
             // 组织下拉选项数据
             dataArr.push({
               'name': r.optionsName,
               'value': r.optionsVal
             })
           }
           if (dataArr.length > 0) {
             obj.setParamObj.data = dataArr
           }
         })
      } else { // 执行备选sql
        if (paramSql !== '') {
          hasSql = true// 下拉列表是SQL方式
          // if (typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null) { // 如果有该参数默认值，则直接执行备选SQL加载初始化数据
           let response = await executeParamSql(paramSql)
           if(response.code == 0){
            if(response.data == null){
              obj.isError = true
              obj.message = `获取参数【${paramObj.paramName}】的值的失败`
            }else {
              if (response.data.isError) {
                obj.isError = true
                obj.message = `获取参数【${paramObj.stateparamName}】的值的失败，原因：${response.data.message}`
              } else {
                let e = response.data
                if (e.paramList && e.paramList.length > 0) {
                  for (let k = 0; k < e.paramList.length; k++) {
                     dataArr.push({
                       'name': e.paramList[k].paramName,
                       'value': e.paramList[k].paramValue
                     })
                  }
                }
               obj.setParamObj.data = dataArr
              }
            }
           }
        }
      }
      if(typeof obj.selectNum !== 'undefined' && obj.selectNum != null){
        obj.setParamObj.id = `selectParam${obj.selectNum}`
        obj.selectNum++
      }else{
        obj.setParamObj.id = `selectParam${paramObj.ammParamUuid}`
      }
      obj.setParamObj.dataId = paramObj.ammParamUuid
      obj.setParamObj.dataName = paramObj.paramName
      obj.setParamObj.dataChoiceType = paramObj.paramChoice.choiceType
      if(hasSql){
        obj.setParamObj.dataSql = paramSql
        obj.setParamObj.dataParamArr = paramArr
        obj.setParamObj.dataAssociatedParamIdArr = associatedParamIdArr
      }
      if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null && paramObj.defaultVal){
         // 下拉列表默认值
          obj.setParamObj.dataDefaultVal = paramObj.defaultVal
          // 默认值
          obj.setParamObj.value = obj.setParamObj.dataDefaultVal
          if (paramObj.paramChoice.choiceType === '1'){
            // 单选
            // settingVue.paramListValueList[index] = paramObj.defaultVal
            settingVue.paramListValueList[index] = paramObj.dataType == 'str'? `'` + paramObj.defaultVal + `'` : paramObj.defaultVal
          } else {
            // 多选
            const list = [] 
            if (paramObj.defaultVal.length > 0){
              paramObj.defaultVal.forEach(o => {
                if(paramObj.dataType == 'str') { list.push(`'` + o + `'`) }
                else {list.push(o) }
                // list.push(o)
              })
              settingVue.paramListValueList[index] = list
            }
          }
      }else{
        if (paramObj.paramChoice.choiceType === '1'){
          // 单选
          settingVue.paramListValueList[index] = ''
        } else {
          // 多选
          settingVue.paramListValueList[index] = []
        }
      }
      if(typeof paramObj.paramChoice.allowedNull !== 'undefined' && paramObj.paramChoice.allowedNull != null){
        obj.setParamObj.dataAllowedNull = paramObj.paramChoice.allowedNull
      }
      break
    case 'textinp':// 文本框
      if (typeof paramObj.dataLength !== 'undefined' && paramObj.dataLength != null) {
        obj.setParamObj.title += `,参数值的长度为${paramObj.dataLength}`
      }
      obj.setParamObj.dataId = paramObj.ammParamUuid
      obj.setParamObj.dataName = paramObj.paramName
      if(typeof paramObj.paramChoice.allowedNull !== 'undefined' && paramObj.paramChoice.allowedNull != null){
        obj.setParamObj.dataAllowedNull = paramObj.paramChoice.allowedNull
      }
      if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null){
        obj.setParamObj.dataDefaultVal = paramObj.defaultVal
      }
      if(typeof paramObj.dataLength !== 'undefined' && paramObj.dataLength != null){
        obj.setParamObj.dataDataLength = paramObj.dataLength
      }
      break
    case 'timeinp':// 时间
      if (paramObj.dataType === 'date') { // 暂时只支持日期，不支持时间段
        obj.setParamObj.dataId = paramObj.ammParamUuid
        obj.setParamObj.dataName = paramObj.paramName
        if(typeof paramObj.paramChoice.allowedNull !== 'undefined' && paramObj.paramChoice.allowedNull != null){
          obj.setParamObj.dataAllowedNull = paramObj.paramChoice.allowedNull
        }
        if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null){
          obj.setParamObj.dataDefaultVal = paramObj.defaultVal
        }
        //时间类型（年/月/日/其他）
        obj.setParamObj.timeFormat = paramObj.paramTimes.timeFormat;
        obj.setParamObj.customizeFormat = paramObj.paramTimes.customizeFormat; 
      }
      break
    case 'treeinp':// 下拉树
      if (paramSql !== '') { // 执行备选SQL
        hasSql = true
        // if (typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null) { // 如果有该参数默认值，则直接执行备选SQL加载初始化数据
        let resp = await getSelectTreeData(paramSql)
        if (resp.data == null) {
          obj.isError = true
          obj.message = `获取参数【${paramObj.paramName}】的值的失败`
        } else {
          if (resp.data.isError) {
            obj.isError = true
            obj.message = `获取参数【${paramObj.paramName}】的值的失败，原因：${resp.data.message}`
          } else {
            if (resp.data.result && resp.data.result.length > 0) {
              // dataArr = organizeSelectTreeData(response.data.result)
              dataArr = organizeSelectTreeData(resp.data.result, paramObj.dataType)
            } else {
              dataArr = []
            }
            obj.setParamObj.data = dataArr
          }
        }
      }
      if(typeof obj.selectTreeNum !== 'undefined' && obj.selectTreeNum != null){
        obj.setParamObj.id = `selectTreeParam${obj.selectTreeNum}`
        obj.selectTreeNum++
      }else{
        obj.setParamObj.id = `selectTreeParam${paramObj.ammParamUuid}`
      }
      obj.setParamObj.dataId = paramObj.ammParamUuid
      obj.setParamObj.dataName = paramObj.paramName
      obj.setParamObj.dataChoiceType = paramObj.paramChoice.choiceType
      if(hasSql){
        obj.setParamObj.dataSql = paramSql
        obj.setParamObj.dataParamArr = paramArr
        obj.setParamObj.dataAssociatedParamIdArr = associatedParamIdArr
      }
      if(typeof paramObj.defaultVal !== 'undefined' && paramObj.defaultVal != null && paramObj.defaultVal){
        // 下拉树默认值
        obj.setParamObj.dataDefaultVal = paramObj.defaultVal
        obj.setParamObj.value = obj.setParamObj.dataDefaultVal
        if (paramObj.paramChoice.choiceType === '1'){
          // 单选
          // this.paramTreeValueList[index] = list[0]
          settingVue.paramTreeValueList[index] = paramObj.defaultVal
          // settingVue.paramTreeValueList[index] = paramObj.dataType == 'str' ? `'` + paramObj.defaultVal + `'` : paramObj.defaultVal
        } else {
          // 多选
          const list = []
          if (paramObj.defaultVal.length > 0){
            paramObj.defaultVal.forEach(o => {
              // if(paramObj.dataType == 'str') { list.push(`'` + o + `'`) }
              // else {list.push(o) }
              list.push(o)
            })
            settingVue.paramTreeValueList[index] = list
            // settingVue.paramTreeValueList[index] = ["102001"]
          }
          
        }
      }else{
        // 下拉树默认值
        if (paramObj.paramChoice.choiceType === '1'){
          // 单选
          // this.paramTreeValueList[index] = list[0]
          settingVue.paramTreeValueList[index] = ''
        } else {
          // 多选
          settingVue.paramTreeValueList[index] = []
        }
      }
      if(typeof paramObj.paramChoice.allowedNull !== 'undefined' && paramObj.paramChoice.allowedNull != null){
        obj.setParamObj.dataAllowedNull = paramObj.paramChoice.allowedNull
      }
      break
  }
  return obj
}

export function changeparamdata (info,ind) {
  let paramsArr = []
  if(info.paramConditionList.length>0){
    for(let i = 0; i<info.paramConditionList.length;i++){
      for(let j =0;j<settingVue.setParamArr.length;j++){
        if(info.paramConditionList[i].relationParamId == settingVue.setParamArr[j].dataId){
          let repvalue = settingVue.setParamArr[j].inputType == "textinp"?settingVue.setParamArr[j].dataDefaultVal:settingVue.setParamArr[j].inputType == "lineinp"?(Array.isArray(settingVue.paramListValueList[j])?settingVue.paramListValueList[j].join(','):settingVue.paramListValueList[j]):settingVue.setParamArr[j].inputType == "treeinp"?(Array.isArray(settingVue.paramTreeValueList[j])?settingVue.paramTreeValueList[j].join(','):settingVue.paramTreeValueList[j]):settingVue.setParamArr[j].dataDefaultVal

          if(settingVue.setParamArr[j].dataType != "int" && settingVue.setParamArr[j].inputType != "lineinp" && settingVue.setParamArr[j].inputType != "treeinp"){
            if(repvalue!=undefined && repvalue!=''){
              repvalue = "'" + repvalue + "'"
            }else{
              repvalue = ""
            }
          }
          paramsArr.push({
            id:info.paramConditionList[i].relationParamId,
            paramValue:repvalue,
            useQuotation:settingVue.setParamArr[j].useQuotation,
          })
        }
      }
    }
    request({
      baseURL: '/analysis',
      url: '/paramConditionController/getParamConditionSqlResult',
      method: 'post',
      data:{
        "paramId":info.dataId,
        "paramsArr":paramsArr
      }
    }).then(result => {
      if(result.data.isError == true){
        this.$message({type: 'error', message: result.data.message})
      }else{
        let list = []
        for(let i =0;i<result.data.paramList.length;i++){
          list.push(
            {
              'name': result.data.paramList[i].C_NAME,
              // 'value': info.dataType == 'str' ? `'` +  result.data.paramList[i].C_CODE + `'` : result.data.paramList[i].C_CODE,
              'value': result.data.paramList[i].C_CODE,
              // 'pValue':info.dataType == 'str' ? `'` +  result.data.paramList[i].P_CODE + `'` : result.data.paramList[i].P_CODE,
              'pValue': result.data.paramList[i].P_CODE,
              // 'pValue':paramCommonJs.pValueFormat(result.data.paramList[i].P_CODE, info),
              'children': [],
            }
          )
        }
        settingVue.setParamArr[ind].data = paramCommonJs.matchingPcRelation(list, 0, true)
        settingVue.$forceUpdate()
      }
    })
  }
}

export function changeRelationParam (ind, val, dataType) {
  // val 下拉框、树下拉参数回显
  // dataType 下拉框 参数类型为字符串时去掉前后引号，以为回显时会手动拼接
  if (val) {
    settingVue.setParamArr[ind].value = val;
    if (dataType) {
      if (dataType == 'str') {
        settingVue.setParamArr[ind].value = val.replace("\'","").replace("\'","");
      } else {
        settingVue.setParamArr[ind].value = val;
      }
    }
  } else {
    settingVue.setParamArr[ind].value = '';
  }
  for(let i=0;i<settingVue.setParamArr.length;i++){
    if(settingVue.setParamArr[i].paramConditionList){
      //找到被关联参数
      for(let j =0;j<settingVue.setParamArr[i].paramConditionList.length;j++){
        if(settingVue.setParamArr[i].paramConditionList[j].relationParamId == settingVue.setParamArr[ind].dataId){
          if(settingVue.setParamArr[i].selectNum==1){
            settingVue.paramListValueList[i] = [];
            settingVue.paramTreeValueList[i] = []
            settingVue.setParamArr[i].value = '';
          }else{
            settingVue.paramListValueList[i] = ''
            settingVue.paramTreeValueList[i] = ''
            settingVue.setParamArr[i].value = '';
          }
          settingVue.$forceUpdate() 
        }
      }
      // //拼sql
      // let paramSql = this.paramInfoArr[i].dataSql + " WHERE " + this.paramInfoArr[i].masterparam.slaveParamCol
      // // 单选
      // if(typeof(this.paramListValueList[ind])=='string'){
      //   paramSql += "="
      //   paramSql += this.paramListValueList[ind]
      // }else{
      //   // 多选
      //   paramSql += " in ("
      //   for(let j=0;j<this.paramListValueList[ind].length;j++){
      //     let rvalue = this.paramListValueList[ind][j]
      //     if(this.paramInfoArr[i].masterparam.relationMode==1){
      //       }else{
      //         let rdata = this.paramInfoArr[ind].data
      //         for(let k=0;k<rdata.length;k++){
      //           let rv1 = (rdata[k].value.indexOf("'") == -1? ("'"+rdata[k].value+"'"):rdata[k].value)
      //           let rv2 = (rvalue.indexOf("'") == -1? ("'"+rvalue+"'"):rvalue)
      //           if(rv1 == rv2){
      //             rvalue = rdata[k].name
      //           }
      //         }
      //       }
      //       if(rvalue.indexOf("'") != -1){
      //         paramSql += rvalue+","
      //       }else{
      //         paramSql += "'"+rvalue+"',"
      //       }
      //       }
      //       if(paramSql.charAt(paramSql.length-1)==","){
      //         paramSql = paramSql.substring(0, paramSql.length-1);
      //       }
      //   paramSql += ")"
      // }
      
      // const response = await executeParamSql(paramSql)
      // let dataArr = []
      // if(response.data == null){
      //   this.$message(`获取参数值的失败`)
      //   }else {
      //     if (response.data.isError) {
      //       this.$message(`获取参数值的失败`)
      //     } else {
      //       let e = response.data
      //       if (e.paramList && e.paramList.length > 0) {
      //         // 给下拉列表赋值
      //         for (let k = 0; k < e.paramList.length; k++) {
      //           dataArr.push({
      //             'name': e.paramList[k].paramName,
      //             'value': e.paramList[k].paramValue
      //           })
      //         }
      //       }
      //       this.paramInfoArr[i].data = dataArr
      //       this.paramListValueList[i] = ''
      //     }
      //   }
    }
  }
}