var layer;
layui.use('layer', function() {
    layer = layui.layer;
});

//获取layer.open的url参数
function getParams(){
    var url = window.location.href;
    url = url.split("?")[1];
    if(!url) return "";
    var para = url.split("&");
    var len = para.length;
    var res = {};
    var arr = [];
    for(var i=0;i<len;i++){
        arr = para[i].split("=");
        res[arr[0]] = arr[1];
    }
    return res;
}

/**
 * 校验字段名称是否含有特殊字符
 * @param columnName
 * @return {boolean}
 */
function verifyReg(columnName) {
    var flag = true;
    if (columnName) {
        columnName = columnName.replace(/\s+/g, "");
    }
    var regExpressions = /(^_([a-zA-Z0-9\u4e00-\u9fa5]_?)*$)|(^[a-zA-Z\u4e00-\u9fa5#$_](_?[a-zA-Z0-9\u4e00-\u9fa5#$_])*_?$)/;
    if (!regExpressions.test(columnName)) {
        flag = false;
    }
    return flag;
}

/**
 * 给String字符串增加原型方法，判断字符串变量是否以某个字符串结尾
 * @param endStr 结尾的字符串
 * @returns {boolean}
 */
String.prototype.endWith = function(endStr){
    var d = this.length - endStr.length;
    return (d>=0 && this.lastIndexOf(endStr) === d);
};

(function(global, factory) {
    (global.TableGrid = factory());
}
(
    this,
    (function() {
        'use strict';
        // 构造函数
        var TableGrid = function() {
            this.initGridData = initGridData;
            this.reloadGridData = reloadGridData;
            this._url = _url;
            this.setSelection = setSelection;
            this.getCell = getCell;
            this.getReccount = getReccount;
            this.getSelectedValues = getSelectedValues;
            this.getSelectedData = getSelectedData;
            this.getAllData = getAllData;
            this.setGroupHeaders = setHeaders;
            this.setFrozenColumn = setFrozenColumns;
            this.addRowData = addRowData;
            this.getRowData = getRowData;
            this.getGridTable = getGridTable;
        };
        var gridTable;
        var queryForm;
        var _url;
        var postParamMap = {};
        var gridTableMap = {};
        var settingMap = {};
        var initGridData = function(option) {
            settingMap[option.tableId] = option;
            var setting = settingMap[option.tableId];
            setting.width = setting.width ? setting.width : $(".table-view").width();
            setting.height = setting.height ? setting.height : 570;
            setting.datatype = "local";
            //公共加载jqgride方法时 异步加载有遮罩  默认不传参数则时同步加载 无法显示遮罩
            if(typeof setting.tableAsync === "undefined"){//默认为true
                setting.tableAsync = true;
            }
            gridTable = $("#" + setting.tableId);
            gridTableMap[option.tableId] = gridTable;
            queryForm = $("#" + setting.queryFormId);
            if (setting.queryFormId
                && setting.queryFormId !== ""
                && (typeof (setting.params) === "undefined" || setting.params === "")) {
                postParamMap[option.tableId] = queryForm.serializeJson();
            }
            if (setting.params
                && setting.params !== ""
                && (typeof (setting.queryFormId) === "undefined" || setting.queryFormId === "")) {
                postParamMap[option.tableId] = setting.params;
            }
            if (setting.params && setting.params !== ""
                && setting.queryFormId
                && setting.queryFormId !== "") {
                postParamMap[option.tableId] = $.extend(queryForm.serializeJson(), setting.params);
            }
            gridTable.jqGrid(setting);
            _url = setting.tableUrl;
            gridTable.jqGrid("clearGridData");
            loadTable(setting.tableId);
        };

        var getGridTable = function () {
            return gridTable;
        };

        var loadTable = function(tableId) {
            var setting = settingMap[tableId];
            var gridTable = gridTableMap[tableId];
            //公共加载jqgride方法时 异步加载有遮罩  默认不传参数则时同步加载 无法显示遮罩
            if(typeof setting.tableAsync === "undefined" || setting.tableAsync === false || setting.tableAsync === "false"){
                setting.tableAsync = false;
            }else{
                setting.tableAsync = true;
            }
            var $this = typeof setting.loadDivId === "undefined" ? $("body") : $("#" + setting.loadDivId);
            //加载数据时添加遮罩 -吕贺 2019-10-25
            var load = $this.mLoading({text:"正在加载数据,请稍后……",hasCancel:false});
            $.ajax({
                url : _url,
                method : "post",
                dataType : "json",
                data : postParamMap[tableId],
                async : setting.tableAsync,
                success : function(data, textStatus, jqXHR) {
                    //加载数据完毕关闭遮罩 -吕贺 2019-10-25
                    load.hide();
                    data = data.body ? data.body : data;
                    if(typeof data.pagination === "undefined" || typeof data.result === "undefined"){
                        alertMsg("提示","数据表加载数据出错","error");
                        return;
                    }
                    if(typeof data.pagination !== "undefined"){
                        if($("#"+tableId+"Count")[0]){//应用于多个表格的分页的情况
                            $("#"+tableId+"Count").html(data.pagination.dataCount);
                            if(data.pagination.dataCount === 0 && typeof data.result !== "undefined"){
                                $("#"+tableId+"Count").html(data.result.length);
                            }
                        }else{//应用于单个表格的分页
                            $(".table-row-span").html(data.pagination.dataCount);
                        }
                        initPage(data.pagination.pageNum, data.pagination.dataCount, data.pagination.pageSize,setting.tableId);
                    }
                    if (typeof data.result !== "undefined"){
                        if(data.result.length === 0 && !setting.noShowData){//是否不展示暂无数据提示
                            mergerNoData(setting);
                        }
                        for (var i = 0; i <= data.result.length; i++) {
                            gridTable.jqGrid('addRowData', i + 1, data.result[i]);
                        }
                    }
                },
                error : function(data, textStatus) {
                    //加载数据完毕关闭遮罩 -吕贺 2019-10-25
                    load.hide();
                    alertMsg("提示", "load data error:" + textStatus, "error");
                }
            });
        };

        var reloadGridData = function(pageNum, pageSize, otherParams,tableId) {
            var gridTable = gridTableMap[tableId];
            var postParam = postParamMap[tableId];
            postParam = queryForm.serializeJson();
            postParam.pageNum = pageNum;
            postParam.pageSize = pageSize;
            $.extend(true, postParam, otherParams);
            gridTable.jqGrid("clearGridData");
            postParamMap[tableId] = postParam;
            loadTable(tableId);
        };

        var getSelectedIds = function() {
            // 获取多选到的id集合
            return gridTable.getGridParam("selarrrow");
        };

        // chenfei 设置row行是选中的, row是行号，0，1，2，3
        var setSelection = function(row){
            gridTable.jqGrid("setSelection", row);
        };
        // chenfei 获取指定单元格的值，row是行号，col是列名称
        var getCell = function(row,col){
            return gridTable.getCell(row, col);
        };
        // chenfei 获取行数
        var getReccount = function(){
            return gridTable.getGridParam("reccount");
        };

        var getSelectedValues = function(key) {
            // 获取多选到的id集合
            var ids = gridTable.jqGrid("getGridParam", "selarrrow");
            // 遍历访问这个集合
            var selectObjs = new Array()
            $(ids).each(function(index, id) {
                // 由id获得对应数据行
                var row = gridTable.jqGrid('getRowData', id);
                selectObjs.push(row[key]);
            });
            return selectObjs;
        };

        var getSelectedData = function() {
            // 获取多选到的id集合
            var ids = gridTable.jqGrid("getGridParam", "selarrrow");
            // 遍历访问这个集合
            var selectObjs = new Array()
            $(ids).each(function(index, id) {
                // 由id获得对应数据行
                var row = gridTable.jqGrid('getRowData', id);
                selectObjs.push(row);
            });
            return selectObjs;
        };

        var getAllData = function() {
            var rows = gridTable.getGridParam("reccount");
            var rowIds = gridTable.getDataIDs();
            var arrayData = new Array();
            if (rowIds.length > 0) {
                for (var i = 0; i < rowIds.length; i++) {
                    //rowData=obj.getRowData(rowid);//这里rowid=rowIds[i];
                    arrayData.push(gridTable.getRowData(rowIds[i]));
                }
            }
            return arrayData;
        };

        var initPage = function(currentPage, dataCount, pageSize,tableId) {
            var setting = settingMap[tableId];
            if (!setting.pageId || setting.pageId == null
                || setting.pageId === '') {
                return;
            }
            layui.use([ 'laypage', 'layer' ], function() {
                var laypage = layui.laypage;
                var objSetting = {
                    elem : setting.pageId,
                    count : dataCount,
                    limit : pageSize,
                    skin : '#5886B2',
                    curr : currentPage,
                    layout: ['prev', 'page', 'next','skip'],
                    jump : function(obj, first) {
                        if (!first) {
                            if(setting.params && setting.params !== ""){
                                reloadGridData(obj.curr,obj.limit,setting.params,tableId);
                            }else{
                                reloadGridData(obj.curr,obj.limit,null,tableId);
                            }
                        }
                    }
                };
                if(setting.limits){//可使用true，也可使用定义的数组值（例：[15, 30, 50, 100, 300, 500]）
                    objSetting.layout.push("limit");
                    objSetting.limits = (setting.limits.length > 0) ? setting.limits : [15, 30, 50, 100, 300, 500, 1000];
                }
                laypage.render(objSetting);
            });
        };

        var setHeaders = function (groupHearders) {
            gridTable.jqGrid('setGroupHeaders', {
                useColSpanStyle: true,
                groupHeaders:groupHearders
            });
        };

        var setFrozenColumns = function () {
            //设置冻结列生效
            gridTable.jqGrid('setFrozenColumns');
        };

        var addRowData = function (rowid,data, position, srcrowid ) {
            gridTable.jqGrid('addRowData', rowid, data, position, srcrowid);
        };

        var getRowData = function (rowid) {
            if (typeof rowid === "undefined") {
                gridTable.jqGrid('getRowData');
            }
            gridTable.jqGrid('getRowData', rowid);

        };
        return TableGrid;
    })));


/**
 * 暂无数据时合并所有列
 * @param	setting	表格的配置对象
 */
function mergerNoData(setting){
    var colModel = setting.colModel;
    var mergerColumnNameArr = [];			//需要合并的列的name属性的数组（不是label属性数组）
    var leftColumnName = "", b = false;				//保留的列name
    if(colModel && colModel.length > 0){
        var obj = {};
        for(var j=0;j<colModel.length;j++){
            obj[colModel[j].name] = "";
            if(!colModel[j].hidden){
                if(!b && !colModel[j].formatter){
                    leftColumnName = colModel[j].name;
                    b = true;
                }else{
                    mergerColumnNameArr.push(colModel[j].name);
                }
            }
        }
        $("#" +setting.tableId).jqGrid('addRowData', 1, obj);
        for(var i=0;i<mergerColumnNameArr.length;i++){
            $("#" +setting.tableId).setCell(1, mergerColumnNameArr[i], '', {"display" : "none"});
        }
        var len = mergerColumnNameArr.length + 1;
        if(setting.rownumbers){
            $("#" +setting.tableId).setCell(1, "rn", '', {"display" : "none"});
            len++;
        }
        if(setting.multiselect){
            $("#" +setting.tableId).setCell(1, "cb", '', {"display" : "none"});
            len++;
        }
        $("#" + setting.tableId).setCell(1, leftColumnName, '暂无数据', {"text-align" : "center"}, {"colspan" : len});
    }
}
