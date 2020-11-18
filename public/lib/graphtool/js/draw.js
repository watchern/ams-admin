/**
 * 图形化便捷 页面 右侧想详细部分
 */
fieldDetailItem = function(param) {
	this.html = '<div class="list-group-item" title="'+ param.text +'">'+ param.text +'</div>';
}

filterDetailItem = function(param) {
	this.html = '<div class="list-group-item" title="'+ param.text +'">'+ param.text +'</div>';
}

sortDetailItem = function(param) {
	this.html = '<div class="list-group-item" title="'+ param.text +'">'+ param.text +'<span style="float: right;">'+ (param.sortType == 0? "升序": "降序") +'</span></div>';
}

groupDetailItem = function(param) {
	this.html = '<div class="list-group-item" title="'+ param.text +'">'+ param.text +'</div>';
}

havingDetailItem = function(param) {
	this.html = '<div class="list-group-item" title="'+ param.text +'">'+ param.text +'</div>';
}

/**
 * 图形化便捷 页面 输出页
 */
fieldOutputItem = function(param) {
	var realText = param.realText;
	var showText = param.showText;
	var alias = param.alias;
	
	this.html = '<div class="list-group-item field-list-item" id="'+ new UUIDGenerator().id +'">' 
		+ '<span style="display: inline-block; width: 86%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" value="'+ realText +'" exeText="'+ param.exeText +'" text="'+ showText +'" >' 
		+ 	'<input type="text" style="width: 100%; border: solid thin #FFF;" onblur="if(this.value==\'\'){this.value=$(this).parent().attr(\'text\')}" value="'+ alias +'" />' 
		+ '</span>'
		+ '<i class="glyphicon glyphicon-cog pull-right" title="配置" style="margin-right: 20px; cursor: pointer; top: 4px;" onclick="resultSelfDefinedField(\'edit\', this);"></i>'
		+ '<i class="move-icon glyphicon glyphicon-menu-hamburger" title="拖动"></i>'
		+ '<i class="glyphicon glyphicon-minus" title="删除" onclick="$(this).parent().remove();"></i>'
		+ '</div>';
}
filterOutputItem = function(param) {
	this.html = '<div class="list-group-item condition-item" id="'+ new UUIDGenerator().id +'">' 
		+ '<div style="white-space: nowrap; max-height: 20px; overflow: hidden; text-overflow: ellipsis;" title="'+ param.showText +'" value="'+ param.realText +'" >'+ param.showText +'</div>'
		+ '<i class="glyphicon glyphicon-cog" title="配置" onclick="resultFilter(\'edit\', this);"></i>'
		+ '<i class="glyphicon glyphicon-minus" title="删除" onclick="$(this).parent().remove();"></i>'
		+ '</div>';
}
sortOutputItem = function(param) {
	this.html = '<div class="list-group-item sort-item">'
		+ '<div style="display: inline-block; width: 86%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="'+ param.showText +'" value="'+ param.realText +'">'+ param.showText +'</div>'
		+ '<i class="sort-icon glyphicon glyphicon-triangle-'+ (param.type == 0? "top": "bottom") +'" title="'+ (param.type == 0? "升序": "降序") +'" type="'+ (param.type? param.type: 0) +'" onclick="graphModelOutput.switchSortType(this);"></i>'
		+ '<i class="move-icon glyphicon glyphicon-menu-hamburger" title="拖动"></i>'
		+ '<i class="glyphicon glyphicon-minus" title="删除" onclick="$(this).parent().remove();"></i>'
		+ '</div>';
}
groupOutputItem = function(param) {
	this.html = '<div class="list-group-item group-item">' 
		+ '<span style="display: inline-block; width: 86%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="'+ param.showText +'" value="'+ param.realText +'">' + param.showText + '</span>'
		+ '<i class="glyphicon glyphicon-minus" title="删除" onclick="$(this).parent().remove();"></i>'
		+ '</div>';
}

/**
 * 图形化 节点 输出类型图标
 */
nodeOutputTypeIcon = function() {
	this.html = '<i class="output-type-icon" style="display: inline-block; width: 10px; height: 10px; background:#009688 ; border-radius: 50%;"></i>';
}

/**
 * 图形化 节点执行状态图标
 */
nodeExecuteStatusIcon = function() {
	this.html = '<i class="output-type-icon" style="display: inline-block; width: 10px; height: 10px; background:#009688 ; border-radius: 50%;"></i>';
}

/**
 * 图形化 关联
 * @param index
 * @param hasGroupDel 含有组删除按钮
 */
relationConfig = function(index, hasGroupDel) {
	this.html = '<div class="groupitem" style="border-bottom: dotted thin #333; padding-bottom: 10px; margin-bottom: 10px;">\
		<h1>关联关系' + 
			(hasGroupDel? '<button type="button" class="btn btn-xs btn-danger pull-right" onclick="$(this).parents(\'.groupitem\').remove();">删除</button>': '') + 
		'</h1>	\
		<div class="row relationTable" index="'+ index +'" style="width: 98%; margin-left: 1%; border: solid thin #DDD;">		\
			<div class="col-xs-5">															\
				<select id="mainTable'+ index +'" class="mainTable selectpicker col-xs-12"></select>		\
			</div>																			\
			<div class="col-xs-2">															\
				<select id="connType'+ index +'" class="connType selectpicker col-xs-12">							\
					<option value="0">内关联</option>		\
					<option value="1">左关联</option>		\
					<option value="2">右关联</option>		\
					<option value="3">全关联</option>		\
				</select>		\
			</div>		\
			<div class="col-xs-5">		\
				<select id="secondTable'+ index +'" class="secondTable selectpicker col-xs-12"></select>		\
			</div>		\
		</div>		\
		<h1>关联条件<button type="button" class="btn btn-xs pull-right" style="margin-top: 5px;" onclick="relationSwitch('+ index +');">切换</button></h1>		\
		<div class="relationOn" style="width: 98%; margin-left: 1%; border: solid thin #DDD;" onmouseenter="resetSelEditor('+ index +')">		\
			<div id="relaon-area'+ index +'" class="queryBulider "></div>\
			<div id="codemirror-area'+ index +'" class="hide"><textarea id="input-area'+ index +'" class="input-area"></textarea></div>		\
		</div></div>';
}

relationZtree = function(index) {
	this.html = '<div class="panel panel-default table-panel-'+ index +'">		\
			<div class="panel-heading">		\
				<h4 class="panel-title">		\
					<a data-toggle="collapse" href="#collapse'+ index +'">正在加载...</a>		\
				</h4>		\
			</div>		\
			<div id="collapse'+ index +'" class="panel-collapse collapse in">		\
				<div class="panel-body">		\
					<ul id="ztree_'+ index +'" class="ztree">正在加载...</ul>		\
				</div>		\
			</div>		\
		</div>';
}

/**
 * 添加占位符
 * @param text
 * @returns
 */
function setPlaceHolderForField(text) {
	return "{$$" + text + "$$}";
}

/**
 * 去除占位符
 * @param text
 * @returns
 */
function clearPlaceHolderForField(text) {
	var regExpField = /\{\<\[(.+?)\]\>\}/g;
	var res = text.replace(/\{\$\$/g, "").replace(/\$\$\}/g, "");
	var rep = res.match(regExpField);
	$(rep).each(function() {
		res = res.replace(this, "");
	});
	return res;
}

/**
 * 整理过滤条件
 * @param showIndex [0: 取uuid; 1: 取名称] 
 * @returns
 */
function clearPlaceHolderForFilter(text, showIndex) {
	showIndex = showIndex || 0;
	text = clearPlaceHolderForField(text);
	var regExpFilter = /\{\#(.+?)\#\}/g;
	var regArr = text.match(regExpFilter);
	$(regArr).each(function() {
		text = text.replace(this, 
				(0 == showIndex? "{#": "") + (this.replace(/\{\#/, "").replace(/\#\}/, "").split("^")[showIndex]) + (0 == showIndex? "#}": "")
			);
	});
	return text;
}