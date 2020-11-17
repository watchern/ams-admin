var hot = null;
var handSonTableLoad = null;
/**
 * editor：JL
 * time：2019.07.04
 * return：handSonTable的html内容
 * */
var handSonTableHtml = function(){
	var html = '<div id="handSonTable"></div>';
	return html;
};

var handSonTablePageHtml = function(viewAllData){
	var pageDesc = viewAllData ? "点击列名称排序时，只对当前页数据进行排序" : "只显示10000条数据，点击列名称排序时，可对10000条数据进行排序";
	var	html = '<div class="text-center pageInput pagination" style="margin:0;height:35px;line-height:30px;padding-left:10px;">';
		html += '<label>第</label><span id="CurrentPage"></span>/<span id="AllPage"></span><label>页&nbsp;&nbsp;</label>';
		html += '<label>共</label><span id="total"></span><label>条&nbsp;&nbsp;</label>';
		html += '<a id="FirstPage" class="a-state" href="javascript:void(0);">首页&nbsp;&nbsp;</a>';
		html += '<a id="UpPage" class="a-state" href="javascript:void(0);">上一页&nbsp;&nbsp;</a>';
		html += '<a id="DownPage" class="a-state" href="javascript:void(0);">下一页&nbsp;&nbsp;</a>';
		html += '<a id="LastPage" class="a-state" href="javascript:void(0);">尾页&nbsp;&nbsp;</a>';
		html += '<select id="pageSize">';
		html += '<option value="15" selected="selected">15</option>';
		html += '<option value="50">50</option>';
		html += '<option value="100">100</option>';
		html += '<option value="200">200</option>';
		html += '<option value="500">500</option>';
		html += '<option value="1000">1000</option>';
		html += '</select>';
		html += '<span style="padding-left:20px;">跳转到：</span>';
		html += '<input type="text" value="1" id="txtNeedPage" style="height:20px;width:40px;line-height:20px;">';
		html += '<a id="lnkGoto" class="a-state" href="javascript:void(0);" style="padding-left:10px;">跳转</a><input id="whereStr" type="hidden"/></div>';
    	html += '<div style="color: red;margin:0;height:35px;line-height:30px;padding-left:10px;">注：' + pageDesc + '</div>';
	return html;
};

var handSonTableFunHtml = function(){
	var html = '<div id="fun" style="display:none;width:100%;height:35px;line-height:30px;padding-left:10px;">';
	html += '<table width="100%"><tr>';
	html += '<td>字段名称：<span id="colName"></span></td>';
	html += '<td>汇总值：<span id="sumVal"></span></td>';
	html += '<td>平均值：<span id="averageVal"></span></td>';
	html += '<td>最大值：<span id="maxVal"></span></td>';
	html += '<td>最小值：<span id="minVal"></span></td>';
	html += '<td>最长字符串：<span id="longString"></span></td>';
	html += '<td>最短字符串：<span id="shortString"></span></td>';
	html += '</tr></table></div>';
	return html;
};

/**
 * editor：JL
 * time：2019.07.03
 * param：
 * 		1、url：请求数据的访问地址
 * 		2、param：url中附带的参数，以json对象形式传值
 * 		3、res：请求数据的返回的结果集，组成结构{"columnInfo":{"columnList":[]},"columns":[],"isError":"","message":"","pagination":[],"result":[]}
 * 		4、isPage：是否开启分页
 * 		5、contextMenu：
 * 			（1）可以是true/false：是否开启默认单元格右键菜单（汇总、平均值、最大值、最小值、全表关联、单元格数据关联、场景查询）
 * 			（2）也可以是自定义菜单(定义到数组中)，对象格式如下：[{items:{"唯一键名称1":{"name":"显示名称1","callback":function(key, selection, clickEvent){},
 * 												 "唯一键名称2":{"name":"显示名称2","callback":function(key, selection, clickEvent){}……}}]
 * 		6、dropDownMenu：是否开启表头下拉菜单功能（筛选）
 * 		7、readOnly：单元格数据是否可编辑
 * 		8、height_：表格的高度
 * 		9、hideColumns：隐藏列设置，对象为需隐藏的列的下标的数组
 * 		10、columnsSet：需特殊处理数据的所在列集合
 * 		11、pageUp：分页是否在表格的上方显示
 * 		12、connGraph：是否关联图形化功能菜单
 * */
var handSonTableFun = function(setting){
	//获取传递的参数,start
	var url = setting.url;
	var param = setting.param;
	var res = setting.res;
	var isPage = setting.isPage;
	var contextMenu = setting.contextMenu;
	var dropDownMenu = setting.dropDownMenu;
	var readOnly = setting.readOnly;
	var height_ = setting.height_;
	var hideColumns = setting.hideColumns;
	var columnsSet = setting.columnsSet ? setting.columnsSet : [];
	var pageUp = setting.pageUp;
	var connGraph = setting.connGraph ? true: false;
	var viewAllData = setting.viewAllData ? true : false;
	//end
	var columnInfo = [], data = [], columns = [],mergeCells = [];
	if(typeof(res.isError) === "undefined" || typeof(res.pagination) === "undefined" || typeof(res.columnInfo) === "undefined" || typeof(res.result) === "undefined"){
		alertMsg("错误","请求所返回的结果集出错","error");
		return;
	}
	if(res.isError){
		alertMsg("错误","运行结果出错","error");
		return;
	}
	if(res.columnInfo && res.columnInfo.columnList){
		columnInfo = res.columnInfo.columnList;
		for(var i=0;i<columnInfo.length;i++){
			columns.push(columnInfo[i].columnName);
		}
	}
	if(res.result.length==0){				//空数据处理
		var obj = [];
		for(var i=0;i<columns.length;i++){
			if(i == 0){
				obj = ["暂无数据"];
			}else{
				obj.push("");
			}
		}
		data.push(obj);
		mergeCells.push({"row": 0, "col": 0, "rowspan": 1, "colspan":columns.length});
	}else{
		for(var j=0;j<res.result.length;j++){
			var obj = [];
			for(var k=0; k<columnInfo.length; k++){
				obj.push(res.result[j][columnInfo[k].columnName]);
			}
			data.push(obj);
		}
	}
	var container = document.getElementById("handSonTable");
	var h_setting =  {
    	height:height_ ? height_ : "auto",
        data:  data , 				//导入数据
        rowHeaders: true,			//开启行头
        colHeaders: columns,		//列名称集合
        autoRowSize:true,			//禁止行列自动计算距离
        autoColumnSize:true,		//列宽 度自适应
        wordWrap:true,
        sortDataByCurPage:viewAllData ? true : false,//是否启用插件自带排序（自定义属性），当预览全部数据时对当前页数据进行前台排序
        dropdownMenu: dropDownMenu ? ['filter_by_condition', 'filter_by_value', 'filter_action_bar'] : false,		//表头下拉菜单
        manualRowResize: true,		//行可拉缩
        manualColumnResize: true,	//列可拉缩
        manualColumnMove: false,	//可整列移动
        manualRowMove: false,		//整行移动
        mergeCells : mergeCells.length === 0 ? false : mergeCells,			//查询无数据时，合并单元格
        cell : mergeCells.length === 0 ? [] : [{row:0, col:0, className: 'htCenter htMiddle', editor: false}],	//查询无数据时，设置单元格居中
        filters: true,				//筛选
        readOnly:readOnly ? true : false,				//列只读
        columnSorting: true,			//排序
        hiddenColumns: hideColumns ?　{columns: hideColumns,indicators: true} : {},
        contextMenu: contextMenu ? ((contextMenu.length && contextMenu.length > 0)  ? contextMenu[0] : defaultMenu(columnInfo,connGraph)) : false,		//单元格右键菜单
        manualColumnFreeze: true,
        licenseKey: 'non-commercial-and-evaluation'
    };
	if(columnsSet.length > 0){
		h_setting.columns = columnsSet;
		if(res.result.length > 0){
			h_setting.data = res.result;
		}
	}
    hot = new Handsontable(container,h_setting);
    if($(".htMiddle")[0] && $(".htMiddle").html() === ""){
    	$(".htMiddle").html("暂无数据");
    }
	//监听鼠标选取数据事件，返回数据区域的坐标数组
    Handsontable.hooks.add('afterOnCellMouseUp',function(){//若使用此方法，需将hot申明为全局变量，并解封focusSelectedData()方法
        hot.rowColArr = hot.getSelected();
    },hot);

    if(!viewAllData){//如果不是加载全部数据
        Handsontable.hooks.add('afterColumnSort',function(sortConfig,sortColumnArr,sortPossible){//自定义点击列名称进行排序的事件
            if(sortColumnArr && sortColumnArr.length > 0){
                var columnName = hot.getColHeader(sortColumnArr[0].column);
                var orderInfo = {"columnName":columnName,"orderType":sortColumnArr[0].sortOrder};
                for(var i=0;i<columnInfo.length;i++){
                    if(columnName === columnInfo[i].columnName){
                        orderInfo.columnType = columnInfo[i].columnType;
                        break;
                    }
                }
                var otherParam = {"orderInfo":JSON.stringify(orderInfo)};
                handSonTableLoad = $("#tableArea").mLoading({"text":"正在排序，请稍后……","hasCancel":false,"hasTime":true});
                if(param){
                    param = $.extend(param,otherParam);
                }else{
                    param = otherParam;
                }
            }else{
                if(sortConfig.length === 0){
                    alertMsg("提示","排序时出现错误","info");
                    return false;
                }
            }
            $.post(url,param,function(rs){
                if(handSonTableLoad){
                    handSonTableLoad.hide();
                }
                var data = [];
                columnInfo = rs.columnInfo.columnList;
                for(var j=0;j<rs.result.length;j++){
                    var obj = [];
                    for(var k=0; k<columnInfo.length; k++){
                        obj.push(rs.result[j][columnInfo[k].columnName]);
                    }
                    data.push(obj);
                }
                hot.updateSettings({
                    data:columnsSet.length > 0 ?  rs.result : data
                });
            },"json");
        },hot);
	}

    if(isPage){
    	if(pageUp){
    		$("#handSonTable").before(handSonTablePageHtml(viewAllData));
    	}else{
    		$("#handSonTable").after(handSonTablePageHtml(viewAllData));
    	}
		var pageInfo = res.pagination;
		$("#CurrentPage").text(pageInfo.pageNum);
		$("#AllPage").text(pageInfo.pageCount);
		$("#total").text(pageInfo.dataCount);
		$("#whereStr").val(pageInfo.whereStr);
	    var otherParam = {};
	    if(parseInt($("#AllPage").html()) != 0){
	    	//首页 
	        $("#FirstPage").click(function () {
	        	if(parseInt($("#CurrentPage").html()) == 1 || parseInt($("#AllPage").html()) == 1){
	        		alertMsg("提示","已经是第一页了","info");
	        		return;
	        	}
	        	otherParam = {"pageNum":1,"pageSize":$("#pageSize").val(),"whereStr":$("#whereStr").val()};
	    		reloadData(otherParam);
	         });
	    	//尾页
	         $("#LastPage").click(function () {
	        	if(parseInt($("#AllPage").html()) == 1 || parseInt($("#CurrentPage").html()) == parseInt($("#AllPage").html())){
                    alertMsg("提示","已经是最后一页了","info");
	         		return;
	         	}
	        	otherParam = {"pageNum":parseInt($("#AllPage").html()),"pageSize":$("#pageSize").val(),"whereStr":$("#whereStr").val()};
	        	reloadData(otherParam);
	         });
	    	//上一页
	         $("#UpPage").click(function () {
	         	if(parseInt($("#CurrentPage").html()) == 1){
                    alertMsg("提示","已经是第一页了","info");
                    return;
				}
				otherParam = {"pageNum":(parseInt($("#CurrentPage").html()) - 1),"pageSize":$("#pageSize").val(),"whereStr":$("#whereStr").val()};
				reloadData(otherParam);
	         });
	    	//下一页
	         $("#DownPage").click(function () {
                 if (parseInt($("#CurrentPage").html()) == parseInt($("#AllPage").html())){
                     alertMsg("提示","已经是最后一页了","info");
                     return;
				 }
				otherParam = {"pageNum":(parseInt($("#CurrentPage").html()) + 1),"pageSize":$("#pageSize").val(),"whereStr":$("#whereStr").val()};
				reloadData(otherParam);
	         });
	    	//跳转
	         $("#lnkGoto").click(function () {
	             if (parseInt($("#txtNeedPage").val().trim()) == parseInt($("#CurrentPage").html())) {
                     alertMsg("提示","已经是第" + parseInt($("#CurrentPage").html()) + "页了","info");
                     return;
	             }else if(parseInt($("#txtNeedPage").val().trim()) > 0 && parseInt($("#txtNeedPage").val().trim()) <= parseInt($("#AllPage").html())){
                     otherParam = {"pageNum":parseInt($("#txtNeedPage").val().trim()),"pageSize":$("#pageSize").val(),"whereStr":$("#whereStr").val()};
                     reloadData(otherParam);
				 }else{
	            	 alertMsg("提示","请输入正确的页码","error");
	             }
	         });
	         $("#pageSize").change(function(){
	        	 otherParam = {"pageNum":1,"pageSize":$(this).val(),"whereStr":$("#whereStr").val()};
	             reloadData(otherParam);
	         });
	    }
	     
	     var reloadData = function(otherParam){
             handSonTableLoad = $("#tableArea").mLoading({"text":"正在跳转加载数据，请稍后……","hasCancel":false,"hasTime":true});
	    	 if(param){
	    		 param = $.extend(param,otherParam);
	    	 }else{
	    		 param = $.extend({},otherParam);
	    	 }
	    	 $.ajax({
	    		url : url,
	    		data : param,
				type : "post",
				dataType : "json",
				success : function(rs){
	    			if(handSonTableLoad){
                        handSonTableLoad.hide();
					}
					var data = [];
					var pageInfo = rs.pagination;
					columnInfo = rs.columnInfo.columnList;
					$("#CurrentPage").text(pageInfo.pageNum);
					$("#AllPage").text(pageInfo.pageCount);
					$("#total").text(pageInfo.dataCount);
					$("#whereStr").val(pageInfo.whereStr);
					for(var j=0;j<rs.result.length;j++){
						var obj = [];
						for(var k=0; k<columnInfo.length; k++){
							obj.push(rs.result[j][columnInfo[k].columnName]);
						}
						data.push(obj);
					}
                    hot.updateSettings({
                        data:columnsSet.length > 0 ?  rs.result : data
                    });
				}
	    	 });
	     }
    }
};

function focusSelectedData(){
	var rowColArr = hot.rowColArr;
	if(rowColArr){
		var len = rowColArr.length;
		hot.selectCells(rowColArr,false);
	}
}

function defaultMenu(columnInfo,connGraph,relation){
	$("#handSonTable").after(handSonTableFunHtml());
	var typeArr = ["INTEGER","DECIMAL","NUMBER","FLOAT","REAL","DATE","TIMESTAMP"];
	var mainMenu = {
		callback: function (key, options, clickEvent) {
			if(key === "freeze_column" || key === "unfreeze_column"){
				return;
			}
			//关联图形化功能，start
			if(key === "filter" || key === "sort"|| key === "layering" || key === "sample" || key === "groupCount" || key === "delRepeat"){
				var cell = graph.getModel().getCell(graph.curCellId);
				createGraphNode(cell, key, clickEvent.target.innerText);
				return;
			}
			//关联图形化功能，end
			//数据预处理,start
			//判断所选数据是否有且只有一个,默认值为false;判断所选数据是否可参与计算，默认值false
			var cellData = false, calculate = false;
			var currColumnName = "",currColumnType = "";
			var cellColArr = [], cellRowArr = [];
			if(options.length==1){
				var cellStart = options[0].start;
				var cellend = options[0].end;
				if(cellStart.col == cellend.col){
					cellColArr.push(cellend.col);
					if(cellStart.row == cellend.row){
						cellData = true;
					}
					cellRowArr.push({"start":cellStart.row,"end":cellend.row});
				}else{			//判断所选数据是否在同一列
					alertMsg("错误","不允许操作跨列数据","error");
					return;
				}
			}else{
				for(var i=0;i<options.length;i++){
					var cellStart = options[i].start;
					var cellend = options[i].end;
					if($.inArray(cellStart.col,cellColArr)==-1){
						cellColArr.push(cellStart.col);
					}
					if($.inArray(cellend.col,cellColArr)==-1){
						cellColArr.push(cellend.col);
					}
					var obj = {"start":cellStart.row,"end":cellend.row};
					if(JSON.stringify(cellRowArr).indexOf(JSON.stringify(obj))==-1){
						cellRowArr.push(obj);
					}
				}
				//判断所选数据是否在同一列
				if(cellColArr.length > 1){
					alertMsg("错误","不允许操作跨列数据","error");
					return;
				}
			}
			currColumnType = columnInfo[cellColArr[0]].columnType;
			currColumnName = hot.getColHeader(cellColArr[0]);
			if($.inArray(currColumnType,typeArr) != -1){
				calculate = true;
			}
			//数据预处理,end
			//单元格数据关联和场景查询
			if(key == "cellDataRelation" || key.indexOf("sceneQuery") != -1){
				if(!cellData){
					alertMsg("错误","不能关联查询多个单元格数据","error");
					return;
				}else{
					if(key == "cellDataRelation"){				//单元格数据关联
						viewRelationData(key);
					}else{						//场景查询—资金流向
						showSceneQuery(key);
					}
				}
				return;
			}
			if(key == "tableDataRelation"){					//全表关联
				viewRelationData(key);
				return;
			}
			if(cellData){
				alertMsg("错误","单个单元格数据不能参与计算","error");
				return;
			}else{
				var val = 0, dataArr = [], longString = "", shortString = "";
				for(var i=0;i<cellRowArr.length;i++){
					var obj = cellRowArr[i];
					if(obj.start == obj.end){
						var cellVal = hot.getDataAtCell(obj.start,cellColArr[0]);
						dataArr.push(cellVal);
						if(calculate){
							val += parseInt(cellVal);
						}
						if(longString == ""){
							longString = cellVal;
						}
						if(shortString == ""){
							shortString = cellVal;
						}
						if(longString.length < cellVal.length){
							longString = cellVal;
						}
						if(shortString.length > cellVal.length){
							shortString = cellVal;
						}
					}else{
						for(var j=obj.start; j<=obj.end; j++){
							var cellVal = hot.getDataAtCell(j,cellColArr[0]);
							dataArr.push(cellVal);
							if(calculate){
								val += parseInt(cellVal);
							}
							if(longString == ""){
								longString = cellVal;
							}
							if(shortString == ""){
								shortString = cellVal;
							}
							if(longString.length < cellVal.length){
								longString = cellVal;
							}
							if(shortString.length > cellVal.length){
								shortString = cellVal;
							}
						}
					}
				}
				if (key === "sumVal") {
					if(!calculate){
						alertMsg("错误","当前列数据类型不能参与计算","error");
						return;
					}
					if(currColumnType === "DATE" || currColumnType === "TIMESTAMP"){
						return;
					}
					$("#colName").html(currColumnName);
					$("#sumVal").html(val);
					$("#fun").show();
					$("#fun td").hide();
					$("#fun td:eq(0)").show();
					$("#fun td:eq(1)").show();
				}
				if (key === "averageVal") {
					if(!calculate){
						alertMsg("错误","当前列数据类型不能参与计算","error");
						return;
					}
					if(currColumnType === "DATE" || currColumnType === "TIMESTAMP"){
						return;
					}
					var averageVal = val/dataArr.length;
					$("#colName").html(currColumnName);
					$("#averageVal").html(averageVal.toFixed(2));
					$("#fun").show();
					$("#fun td").hide();
					$("#fun td:eq(0)").show();
					$("#fun td:eq(2)").show();
				}
				if (key === "maxVal") {
					if(!calculate){
						alertMsg("错误","当前列数据类型不能参与计算","error");
						return;
					}
					var maxVal = dataArr[0];
					for(var c=0;c<dataArr.length;c++){
						if(maxVal < dataArr[c]){
							maxVal = dataArr[c];
						}
					}
					$("#colName").html(currColumnName);
					$("#maxVal").html(maxVal);
					$("#fun").show();
					$("#fun td").hide();
					$("#fun td:eq(0)").show();
					$("#fun td:eq(3)").show();
				}
				if (key === "minVal") {
					if(!calculate){
						alertMsg("错误","当前列数据类型不能参与计算","error");
						return;
					}
					var minVal = dataArr[0];
					for(var c=0;c<dataArr.length;c++){
						if(minVal > dataArr[c]){
							minVal = dataArr[c];
						}
					}
					$("#colName").html(currColumnName);
					$("#minVal").html(minVal);
					$("#fun").show();
					$("#fun td").hide();
					$("#fun td:eq(0)").show();
					$("#fun td:eq(4)").show();
				}
				if(key === "longString"){
					if(calculate){
						alertMsg("错误","当前列数据类型不能计算最长字符串","error");
						return;
					}
					$("#colName").html(currColumnName);
					$("#longString").html(longString);
					$("#fun").show();
					$("#fun td").hide();
					$("#fun td:eq(0)").show();
					$("#fun td:eq(5)").show();
				}
				if(key === "shortString"){
					if(calculate){
						alertMsg("错误","当前列数据类型不能计算最短字符串","error");
						return;
					}
					$("#colName").html(currColumnName);
					$("#shortString").html(shortString);
					$("#fun").show();
					$("#fun td").hide();
					$("#fun td:eq(0)").show();
					$("#fun td:eq(6)").show();
				}
			}
		},
		items: {}
	};
	//如果设置了关联图形化菜单
	if(connGraph){
		mainMenu.items["filter"] = {name : "数据筛选"};
		mainMenu.items["sort"] = {name : "数据排序"};
		mainMenu.items["sample"] = {name : "数据抽样"};
		mainMenu.items["groupCount"] = {name : "分组汇总"};
		mainMenu.items["delRepeat"] = {name : "数据去重"};
		mainMenu.items["layering"] = {name : "数据分层"};
		mainMenu.items["hsep1"] = "---------";
	}
	mainMenu.items["sumVal"] = {name: "汇总值"};
	mainMenu.items["averageVal"] = {name: "平均值"};
	mainMenu.items["maxVal"] = {name: "最大值"};
	mainMenu.items["minVal"] = {name: "最小值"};
	mainMenu.items["longString"] = {name: "最长字符串"};
	mainMenu.items["shortString"] = {name: "最短字符串"};
	mainMenu.items["hsep2"] = "---------";
	mainMenu.items["freeze_column"] = {};
	mainMenu.items["unfreeze_column"] = {};
	if(typeof(graph) != "undefined" && graph.openType === 2){
		mainMenu.items["hsep3"] = "---------";
		mainMenu.items["tableDataRelation"] = {name: "全表关联"};
		mainMenu.items["cellDataRelation"] = {name: "单元格数据关联"};
		mainMenu.items["sceneQuery"] = {
			name: "场景查询—资金流向",
			submenu: {
				items: [{
					key: "sceneQuery:keHuNumber",
					name: "客户号"
				},
				{
					key: "sceneQuery:keHuName",
					name: "客户名称"
				},
				{
					key: "sceneQuery:identificationNumber",
					name: "证件号码"
				},
				{
					key: "sceneQuery:account",
					name: "帐号"
				},
				{
					key: "sceneQuery:faShengE",
					name: "发生额"
				},
				{
					key: "sceneQuery:startTime",
					name: "起止时间—起"
				},
				{
					key: "sceneQuery:endTime",
					name: "起止时间—止"
				},
				{
					key: "sceneQuery:suoShuJiGou",
					name: "帐户所属机构"
				},
				{
					key: "sceneQuery:duiFangAccount",
					name: "对方帐号"
				},
				{
					key: "sceneQuery:duiFangHuMing",
					name: "对方户名"
				},
				{
					key: "sceneQuery:zhaiYao",
					name: "摘要"
				}]
			}
		};
	}
	return mainMenu;
}

/**
 * 自动生成图形化功能节点和连接线
 * @param	curCell	当前预览数据的节点对象
 * @param	type		要生成的功能节点的类型
 * @param	name	要生成的功能节点的名称
 * */
function createGraphNode(curCell,type,name){
	var cell, edge;
	graph.getModel().beginUpdate();
	try{
		//获取当前节点的坐标位置
		var x = curCell.geometry.x;
		var y = curCell.geometry.y;
		cell = graph.insertVertex(graph.getDefaultParent(),null, name, x + 180, y, 100, 100, createCellShape(type));			//生成节点
		cell.nodeType = type;
		var options = {
			"id" : cell.id,
			"name" : name,
			"type" : type
		};
		initNodeData(options,true);
		edge = graph.insertEdge(graph.getDefaultParent(), null, getEdgeCount()+1, curCell, cell, "rounded=0;html=1;jettySize=auto;orthogonalLoop=1;strokeColor=#3E6F96;strokeWidth=2;");		//生成线
	}finally {
		graph.getModel().endUpdate();
	}
	//将生成的线添加到线的集合中
	if(!graph.edgeArr[edge.id]){
		graph.edgeArr[edge.id] = {"source" : curCell,"target" : cell};
	}
	//添加父、子ID信息
	graph.nodeData[curCell.id].childrenIds.push(cell.id);
	graph.nodeData[cell.id].parentIds.push(curCell.id);
	//将生成的节点添加到节点集合中
	graph.oldOptArr.push({"optType":"create","optArr":[{"id":cell.id,"nodeData":graph.nodeData[cell.id]}]});
	//刷新所使用资源树
	refrashResourceZtree(cell.id, name, cell.nodeType);
	//刷新操作痕迹树
	refrashHistoryZtree("自动生成节点【" + name +"】");
	//自动保存图形化
	autoSaveGraph();
}

/**
 * 展示全表关联、单元格数据关联的关联表结果集
 * */
function viewRelationData(type){
	var selectDataIndexArr = hot.getSelected();
	var columnName = hot.getColHeader(selectDataIndexArr[0][1]);				//获取选中数据所在列的列名称
	var resourceTableArr = getResourceTableByColumn(columnName);
	if(resourceTableArr.length == 0){
		alertMsg("提示","未找到该字段的来源表名称","info");
		return;
	}else{
        var load = $("body").mLoading({"text":"正在加载关联表信息，请稍后……","hasCancel" : false});
		$.ajax({
			url : contextPath + "/graphEditor/getRelationTables",
			data : {"resourceTableArr" : resourceTableArr,"curColumnName" : columnName},
			dataType : "json",
			type : "post",
			traditional:true,
			success : function(res){
                if(res.isError){
                    load.destroy();
                    alertMsg("错误","获取关联表信息失败，原因："+res.message,"error");
                    return;
                }
                var relationTableArr = res.resultList ? res.resultList : [];
				if(relationTableArr.length == 0){
                    load.destroy();
                    alertMsg("提示","该字段的来源表未关联其他数据表","info");
                    return;
                }
                var curTableName = graph.curTableName;
                var targetTableName = "";
                //如果字段的来源表只有一个
                if(resourceTableArr.length == 1){
                    targetTableName = relationTableArr[0].targetTableName;
                }else{
                    //否侧，获取弹框列表中所选择的来源表名称
                    targetTableName = getTargetTableName(relationTableArr);
                }
                if(targetTableName == ""){
                    load.destroy();
                    alertMsg("提示","您尚未选择关联表","info");
                    return;
                }else{
                    var paramData = {
                        "cTableName" :curTableName,	//当前结果表名称
                        "rTableName" : targetTableName,//关联表名称
                        "columnName" : columnName//关联字段名称
                    };
                    if(type == "cellDataRelation"){
                        paramData.columnValue = hot.getDataAtCell(selectDataIndexArr[0][0],selectDataIndexArr[0][1]);
                    }
                    $.post(contextPath + "/graphEditor/getRelationResult", paramData, function(e){
                        if(e.isError){
                            $("ul.layui-tab-title li:eq(1)").click();
                            $("#sysInfoArea").html(e.message);
                            $("#sysInfoArea").css({"color":"red"});
                        }else{
                            $("#exportAllData").show();
                            $("#viewAllData").show();
                            $("#sysInfoArea").html(e.message);
                            $("#sysInfoArea").css({"color":"#0DD140"});
                            $("#tableArea").html(handSonTableHtml());
                            var url = contextPath + "/graphEditor/executeNodeSqlPage";
                            var setting = {
                                "url":url,
                                "param":{"sql" : e.sql},
                                "res":e,
                                "isPage":true,
                                "contextMenu":true,
                                "dropDownMenu":true,
                                "readOnly":true,
                                "pageUp" : true,
                                "height_":300
                            };
                            handSonTableFun(setting);
                            graph.curTableName = strEncryption(targetTableName);
                            graph.viewDataType = 1;
                            load.destroy();
                        }
                        load.destroy();
                    },"json");
                }
				isError = res.isError;
				message = res.message ? res.message : "";
				relationTableArr = e.resultList ? e.resultList : [];
			}
		});
	}
}

/*
 * 根据当前结果集的列名称，获取其来源表名称集合
 * 注：若该列来自于SQL编辑器节点，则不支持关联查询功能
 * @param columnName 列名称
 * */
function getResourceTableByColumn(columnName){
	var type = graph.viewDataType;		//1、右键资源树预览数据；2、双击节点预览数据 / 右键节点查看数据
	var tableNameArr = [];
	if(type == 1){
		tableNameArr.push(strDecryption(graph.curTableName));
		return tableNameArr;
	}
	if(type == 2){
		var curNodeId = graph.curCellId;
		tableNameArr = getParentTableName(curNodeId,tableNameArr);
		return tableNameArr;
	}
}

/**
 * 递归查当前节点的根节点（原表）的表名称
 * @param curNodeId 当期节点ID
 * @param tableNameArr 当前的表名称集合
 * */
function getParentTableName(curNodeId,tableNameArr){
	var nodeData = graph.nodeData[curNodeId];
	var parentIds = nodeData.parentIds;
	if(nodeData.parentIds.length == 0){
		if(nodeData.nodeInfo.optType == "datasource" && $.inArray(strDecryption(nodeData.nodeInfo.nodeName),tableNameArr) == -1){
			tableNameArr.push(nodeData.nodeInfo.nodeName);
		}
	}else{
		for(var i=0;i<parentIds.length;i++){
			tableNameArr = getParentTableName(parentIds[i],tableNameArr);
		}
	}
	return tableNameArr
}

/**
 * 获得关联表名称
 * */
function getTargetTableName(relationTableArr){
	var targetTableName = "";
	var html = "<div class='table-view m-b-20' id='hideRT' style='display:none;'><table class='table table-striped' id='relationTable'></table></div>";
	$("body").append(html);
	layer.open({
		id: "chooseRelationTable",
		type: 1,
		title: "选择关联表",
		content: $("#hideRT"),
		area: ["800px", "90%"],
		skin: "layui-layer-lan",
		resize: false,
		btn : ["确定","取消"],
		success: function(layero,index){
			var setting = {
				tableId : "relationTable",
				rownumbers : true,// 序号
				multiselect : true,// 多选框
				height : "auto",
				colNames : ['结果集表名称', '关联字段名称', '字段来源表名称', '关联表名称'],
				colModel : [
					{
						label : "结果集表名称",
						name : "curTableName",
						align : "center"
					},
					{
						label : "关联字段名称",
						name : "columnName",
						align : "center"
					},

					{
						label : "字段来源表名称",
						name : "resourceTableName",
						align : "center"
					},
					{
						label : "关联表名称",
						name : "targetTableName",
						align : "center"
					},
				]
			};
			$(layero).find("#relationTable").jqGrid(setting);
			for(var i=0;i<resourceTableArr.length;i++){
				relationTableArr[i].curTableName = curTableName;
				$(layero).find("#relationTable").jqGrid('addRowData', parseInt(i+1), relationTableArr[i]);
			}
		},
		btn1 : function(index,layero){
			var ids = $(layero).find("#relationTable").jqGrid("getGridParam", "selarrrow");
			if(ids.length>1){
				alertMsg("提示","只能关联查询一张关联表！","warning");
				return ;
			}
			var id = $(layero).find("#relationTable").jqGrid('getGridParam','selrow');
			if(id == null || id == ""){
				alertMsg("提示","请选择一张关联表！","warning");
				return ;
			}
			var rowData = $(layero).find("#relationTable").jqGrid('getRowData',id);
			targetTableName = rowData.targetTableName;
			layer.close(index);
		},
		btn2 : function(index,layero){
			layer.close(index);
		}
	});
	return targetTableName;
}

function showSceneQuery(key){
	var selectDataIndexArr = hot.getSelected();
	var columnName = hot.getColHeader(selectDataIndexArr[0][1]);				//获取选中数据所在列的列名称
	var columnValue = hot.getDataAtCell(selectDataIndexArr[0][0],selectDataIndexArr[0][1]);
	var keyArr = key.split(":");
	var newKey = keyArr[keyArr.length-1];
	top.layer.open({
		id: "moneyFlow",
		type: 2,
		title: "资金流向查询",
		content: "../../../../AuditAnalysis/page/moneyFlowAnalysis/moneyFlow.jsp",
		area: ["95%", "90%"],
		skin: "layui-layer-lan",
		btn : ["关闭"],
		success: function(layero,index){
			var $this = top.window[layero.find('iframe')[0]['name']].$("#"+newKey);
			var type = $this[0].localName;
			if(type == "select"){
				top.window[layero.find('iframe')[0]['name']].$("#"+newKey).selectpicker("val", columnValue);
			}else{
				top.window[layero.find('iframe')[0]['name']].$("#"+newKey).val(columnValue);	
			}
			if(key.indexOf("faShengE") != -1){
				top.window[layero.find('iframe')[0]['name']].$("#fuHao").selectpicker("val", "=");			//默认发生额选择【等于】
			}
			// top.window[layero.find('iframe')[0]['name']].moneyFlow.queryBtn(); 因查询有条件限制，故不做自动查询
		},
		btn1 : function(index,layero){
			top.layer.close(index);
		}
	});
}
