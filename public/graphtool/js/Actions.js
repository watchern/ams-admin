/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs the actions object for the given UI.
 */
function Actions(editorUi) {
	this.editorUi = editorUi;
	this.actions = new Object();
	this.init();
}

/**
 * Adds the default actions.
 */
Actions.prototype.init = function() {
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var isGraphEnabled = function() {
		return Action.prototype.isEnabled.apply(this, arguments) && graph.isEnabled();
	};

	// Edit actions
	//撤销
	this.addAction('undo', function() {
		ui.undo();
	}, null, 'sprite-undo', Editor.ctrlKey + '+Z');
	//还原
	this.addAction('redo', function() {
		ui.redo();
	}, null, 'sprite-redo', (!mxClient.IS_WIN) ? Editor.ctrlKey + '+Shift+Z' : Editor.ctrlKey + '+Y');
	//剪切
	this.addAction('cut', function() {
		confirmMsg('提示', '剪切操作会影响所选择节点的后置未剪切节点的节点信息，确定剪切？', "info", function() {
			cutCells();
		}, function() {});
	}, null, 'sprite-cut', Editor.ctrlKey + '+X');
	//复制
	this.addAction('copy', function() {
		copyCells();
	}, null, 'sprite-copy', Editor.ctrlKey + '+C');
	//粘贴
	this.addAction('paste', function() {
		 var cells = mxClipboard.paste(graph);
		 pasteCells(cells);
		 if(cells.length > 0){
			//自动保存图形化
			autoSaveGraph();
		 }
	}, false, 'sprite-paste', Editor.ctrlKey + '+V');
	//粘贴到
	this.addAction('pasteHere', function(evt) {
		if(graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
			graph.getModel().beginUpdate();
			try {
				var cells = mxClipboard.paste(graph);
				pasteCells(cells);
				if(cells != null) {
					var includeEdges = true;

					for(var i = 0; i < cells.length && includeEdges; i++) {
						includeEdges = includeEdges && graph.model.isEdge(cells[i]);
					}

					var t = graph.view.translate;
					var s = graph.view.scale;
					var dx = t.x;
					var dy = t.y;
					var bb = null;

					if(cells.length == 1 && includeEdges) {
						var geo = graph.getCellGeometry(cells[0]);

						if(geo != null) {
							bb = geo.getTerminalPoint(true);
						}
					}

					bb = (bb != null) ? bb : graph.getBoundingBoxFromGeometry(cells, includeEdges);

					if(bb != null) {
						var x = Math.round(graph.snap(graph.popupMenuHandler.triggerX / s - dx));
						var y = Math.round(graph.snap(graph.popupMenuHandler.triggerY / s - dy));

						graph.cellsMoved(cells, x - bb.x, y - bb.y);
					}
					//自动保存图形化
					autoSaveGraph();
				}
			} finally {
				graph.getModel().endUpdate();
			}
		}
	});

	function cutCells(){
		graph.escape();
		var verify = true;
		var cells = graph.getDeletableCells(graph.getSelectionCells());
		var hasExecutingNode = false;
		for(var i=0;i<cells.length;i++){
			if(cells[i].vertex && graph.nodeData[cells[i].id] && graph.nodeData[cells[i].id].nodeInfo.nodeExcuteStatus == 2){
				hasExecutingNode = true;
				break;
			}
		}
		if(hasExecutingNode){
			alertMsg("错误","剪切的节点中有正在执行的节点，剪切失败！","error");
			return;
		}
		if(cells != null && cells.length > 0) {
			var arr = [], cellIdArr = [], nodeIdArr = [];
			for(var i = 0; i < cells.length; i++){
				cellIdArr.push(cells[i].id);
			}
			for(var i = 0; i < cells.length; i++){
				if(!cells[i].edge){
					nodeIdArr.push(cells[i].id);
					arr.push({
						"id":cells[i].id,
						"nodeData":graph.nodeData[cells[i].id]
					});
					//找出要剪切的节点中的末级节点，更改该末级节点及后续节点的信息，start
					var lastNodeIdArr = [];
					var childrenIds = graph.nodeData[cells[i].id].childrenIds;
					for(var k=0;k<childrenIds.length;k++){
						if($.inArray(childrenIds[k],cellIdArr) == -1){
							lastNodeIdArr.push(childrenIds[k]);
						}
					}
					for(var t=0;t<lastNodeIdArr.length;t++){
						changeNodeInfo(lastNodeIdArr[t],true);
					}
					//end
				}else{
					if((cells[i].source && $.inArray(cells[i].source.id,cellIdArr) != -1) && (cells[i].target && $.inArray(cells[i].target.id,cellIdArr) != -1)){
						continue;
					}else{
						verify = false;
						break;
					}
				}
			}
			if(!verify){
				alertMsg("错误","连接线必须连同节点一起剪切","error");
				return;
			}
			for(var i = 0; i < cells.length; i++){
				if(cells[i].edge){
					var preNode = cells[i].source;
					var nextNode = cells[i].target;
					if(graph.nodeData[nextNode.id] && $.inArray(preNode.id,graph.nodeData[nextNode.id].parentIds) != -1){
						var index = $.inArray(preNode.id,graph.nodeData[nextNode.id].parentIds);
						graph.nodeData[nextNode.id].parentIds.splice(index,1);
						//找出要剪切的连接线的目标节点，更改该目标节点及后续节点的信息，start
						if($.inArray(nextNode.id,cellIdArr) == -1){
							changeNodeInfo(nextNode.id,true);
						}
						//end
					}
					if(graph.nodeData[preNode.id] && $.inArray(nextNode.id,graph.nodeData[preNode.id].childrenIds) != -1){
						var index = $.inArray(nextNode.id,graph.nodeData[preNode.id].childrenIds);
						graph.nodeData[preNode.id].childrenIds.splice(index,1);
					}
				}
			}
			for(var k=0;k<arr.length;k++){
				delete graph.nodeData[arr[k].id];
			}
			graph.oldOptArr.push({"optType":"cut","optArr":arr});
			mxClipboard.cut(graph);
			//同步隐藏右侧所使用资源树的节点
			deleteResourceZtreeNode(nodeIdArr);
			//记录剪切操作的操作痕迹
			refrashHistoryZtree("剪切节点操作");
			//自动保存图形化
			autoSaveGraph();
		}
	}
	
	function copyCells(){
		graph.escape();
		var verify = true;
		var cells = graph.getDeletableCells(graph.getSelectionCells());
		var hasExecutingNode = false;
		for(var i=0;i<cells.length;i++){
			if(cells[i].vertex && graph.nodeData[cells[i].id] && graph.nodeData[cells[i].id].nodeInfo.nodeExcuteStatus == 2){
				hasExecutingNode = true;
				break;
			}
		}
		if(hasExecutingNode){
			alertMsg("错误","复制的节点中有正在执行的节点，复制失败！","error");
			return;
		}
		if(cells != null && cells.length > 0) {
			var arr = [], cellIdArr = [];
			for(var i = 0; i < cells.length; i++){
				cellIdArr.push(cells[i].id);
			}
			for(var i = 0; i < cells.length; i++){
				if(cells[i].edge){
					if((cells[i].source && $.inArray(cells[i].source.id,cellIdArr) != -1) && (cells[i].target && $.inArray(cells[i].target.id,cellIdArr) != -1)){
						continue;
					}else{
						verify = false;
						break;
					}
				}
			}
			if(!verify){
				alertMsg("错误","连接线必须连同节点一起复制","error");
				return;
			}
			mxClipboard.copy(graph);
		}
	}
	
	function pasteCells(cells){
		var oldCells = graph.getImportableCells(mxClipboard.getCells());
		if(oldCells != null && oldCells.length > 0) {
			var arr = [];
			for(var i = 0; i < oldCells.length; i++){
				if(!oldCells[i].edge){
					//将操作的节点信息存根
					var nodeData = {};
					if(graph.nodeData[oldCells[i].id]){					//复制后的粘贴操作
						nodeData = graph.nodeData[oldCells[i].id];
					}else{																//剪切后的粘贴操作
						for(var j=(graph.oldOptArr.length); j>0;j--){														//剪切后未对剪切内容做任何操作
							var optType = graph.oldOptArr[j-1].optType;
							var optArr = graph.oldOptArr[j-1].optArr;
							if(optType == "cut"){
								for(var k=0;k<optArr.length;k++){
									if(oldCells[i].id == optArr[k].id){
										nodeData = optArr[k].nodeData;
									}
								}
								break;
							}
						}
						if(Object.keys(nodeData).length==0){																		//剪切后有过撤回操作且未做二次剪切操作
							for(var t=0; t<graph.newOptArr.length; t++){
								var optType = graph.newOptArr[t].optType;
								var optArr = graph.newOptArr[t].optArr;
								if(optType == "cut"){
									for(var g=0;g<optArr.length;g++){
										if(oldCells[i].id == optArr[g].id){
											nodeData = optArr[g].nodeData;
										}
									}
									break;
								}
							}
						}
					}
					if(Object.keys(nodeData).length==0){
						alertMsg("错误","粘贴出错","error");
						return;
					}
					graph.nodeData[cells[i].id] = {};
					//改变节点配置信息的初始值
					if(nodeData.nodeInfo.optType == "datasource"){
						for(var s=0;s<Object.keys(nodeData).length;s++){
							var key =  Object.keys(nodeData)[s];
							graph.nodeData[cells[i].id][key] = nodeData[key];
						}
						changeNodeIcon(3,true,cells[i].id);
						graph.nodeData[cells[i].id].nodeInfo.nodeId = cells[i].id;
						graph.nodeData[cells[i].id].isCopy = true;
					}else{
						var options = {
								"id" : cells[i].id,
								"name" : nodeData.nodeInfo.nodeName,
								"type" : nodeData.nodeInfo.optType
						};
						initNodeData(options,true);
					}
					arr.push( {
						"id":cells[i].id,
						"nodeData":nodeData
					});
					//同步右侧所使用资源树，增加节点
					refrashResourceZtree(cells[i].id, cells[i].value, cells[i].nodeType);
					//记录粘贴操作的操作痕迹
					refrashHistoryZtree("粘贴节点操作");
				}
			}
			graph.oldOptArr.push({"optType":"paste","optArr":arr});
		}
		
		//重新配置粘贴节点的父、子节点ID集合
		for(var i = 0; i < cells.length; i++){
			if(cells[i].edge){
				var source = cells[i].edge.source;
				var target = cells[i].edge.target;
				graph.nodeData[source].childrenIds.push(target.id);
				graph.nodeData[target].parentIds.push(source.id);
			}
		}
	}
	
	//删除
	this.addAction('delete', function(evt) {
		confirmMsg('提示', '删除操作会影响所选择节点的后置未删除节点的节点信息，确定删除？', "info", function() {
			var nodeIdArr = deleteCells(evt != null && mxEvent.isShiftDown(evt));
			//对应删除右侧所使用资源树上的节点
			deleteResourceZtreeNode(nodeIdArr);
			//记录删除操作的操作痕迹
			refrashHistoryZtree("删除节点操作");
			//自动保存图形化
			autoSaveGraph();
		}, function() {});
	}, null, null, 'Delete');
	//删除所有
	this.addAction('deleteAll', function() {
		confirmMsg('提示', '删除操作会影响所选择节点的后置未删除节点的节点信息，确定删除？', "info", function() {
			var nodeIdArr = deleteCells(true);
			//对应删除右侧所使用资源树上的节点
			deleteResourceZtreeNode(nodeIdArr);
			//记录删除操作的操作痕迹
			refrashHistoryZtree("删除节点操作");
			//自动保存图形化
			autoSaveGraph();
		}, function() {});
	}, null, null, Editor.ctrlKey + '+Delete');
	//副本
	/*this.addAction('duplicate', function() {
		graph.setSelectionCells(graph.duplicateCells());
	}, null, null, Editor.ctrlKey + '+D');*/
	this.put('turn', new Action(mxResources.get('turn') + ' / ' + mxResources.get('reverse'), function() {
		graph.turnShapes(graph.getSelectionCells());
	}, null, null, Editor.ctrlKey + '+R'));
	this.addAction('selectVertices', function() {
		graph.selectVertices();
	}, null, null, Editor.ctrlKey + '+Shift+I');
	this.addAction('selectEdges', function() {
		graph.selectEdges();
	}, null, null, Editor.ctrlKey + '+Shift+E');
	this.addAction('selectAll', function() {
		graph.selectAll(null, true);
	}, null, null, Editor.ctrlKey + '+A');
	this.addAction('selectNone', function() {
		graph.clearSelection();
	}, null, null, Editor.ctrlKey + '+Shift+A');
	this.addAction('lockUnlock', function() {
		if(!graph.isSelectionEmpty()) {
			graph.getModel().beginUpdate();
			try {
				var defaultValue = graph.isCellMovable(graph.getSelectionCell()) ? 1 : 0;
				graph.toggleCellStyles(mxConstants.STYLE_MOVABLE, defaultValue);
				graph.toggleCellStyles(mxConstants.STYLE_RESIZABLE, defaultValue);
				graph.toggleCellStyles(mxConstants.STYLE_ROTATABLE, defaultValue);
				graph.toggleCellStyles(mxConstants.STYLE_DELETABLE, defaultValue);
				graph.toggleCellStyles(mxConstants.STYLE_EDITABLE, defaultValue);
				graph.toggleCellStyles('connectable', defaultValue);
			} finally {
				graph.getModel().endUpdate();
			}
		}
	}, null, null, Editor.ctrlKey + '+L');

	// Arrange actions
	this.addAction('toFront', function() {
		graph.orderCells(false);
	}, null, null, Editor.ctrlKey + '+Shift+F');
	this.addAction('toBack', function() {
		graph.orderCells(true);
	}, null, null, Editor.ctrlKey + '+Shift+B');
	this.addAction('group', function() {
		if(graph.getSelectionCount() == 1) {
			graph.setCellStyles('container', '1');
		} else {
			graph.setSelectionCell(graph.groupCells(null, 0));
		}
	}, null, null, Editor.ctrlKey + '+G');
	this.addAction('ungroup', function() {
		if(graph.getSelectionCount() == 1 && graph.getModel().getChildCount(graph.getSelectionCell()) == 0) {
			graph.setCellStyles('container', '0');
		} else {
			graph.setSelectionCells(graph.ungroupCells());
		}
	}, null, null, Editor.ctrlKey + '+Shift+U');
	this.addAction('removeFromGroup', function() {
		graph.removeCellsFromParent();
	});
	// View actions
	this.addAction('resetView', function() {
		graph.zoomTo(1);
		ui.resetScrollbars();
	}, null, null, Editor.ctrlKey + '+H');
	this.addAction('zoomIn', function(evt) {
		graph.zoomIn();
	}, null, null, 'Alt+Mousewheel');
	this.addAction('zoomOut', function(evt) {
		graph.zoomOut();
	}, null, null, 'Alt+Mousewheel');
	this.addAction('fitWindow', function() {
		graph.fit();
	}, null, null, Editor.ctrlKey + '+Shift+H');
	
	// Option actions
	var action = null;
	action = this.addAction('grid', function() {
		graph.setGridEnabled(!graph.isGridEnabled());
		ui.fireEvent(new mxEventObject('gridEnabledChanged'));
	}, null, null, Editor.ctrlKey + '+Shift+G');
	action.setToggleAction(true);
	action.setSelectedCallback(function() {
		return graph.isGridEnabled();
	});
	action.setEnabled(false);

	action = this.addAction('guides', function() {
		graph.graphHandler.guidesEnabled = !graph.graphHandler.guidesEnabled;
		ui.fireEvent(new mxEventObject('guidesEnabledChanged'));
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() {
		return graph.graphHandler.guidesEnabled;
	});
	action.setEnabled(false);

	action = this.addAction('tooltips', function() {
		graph.tooltipHandler.setEnabled(!graph.tooltipHandler.isEnabled());
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() {
		return graph.tooltipHandler.isEnabled();
	});

	action = this.addAction('collapseExpand', function() {
		var change = new ChangePageSetup(ui);
		change.ignoreColor = true;
		change.ignoreImage = true;
		change.foldingEnabled = !graph.foldingEnabled;

		graph.model.execute(change);
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() {
		return graph.foldingEnabled;
	});
	action.isEnabled = isGraphEnabled;
	action = this.addAction('scrollbars', function() {
		ui.setScrollbars(!ui.hasScrollbars());
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() {
		return graph.scrollbars;
	});
	action = this.addAction('pageView', mxUtils.bind(this, function() {
		ui.setPageVisible(!graph.pageVisible);
	}));
	action.setToggleAction(true);
	action.setSelectedCallback(function() {
		return graph.pageVisible;
	});
	action = this.addAction('connectionArrows', function() {
		graph.connectionArrowsEnabled = !graph.connectionArrowsEnabled;
		ui.fireEvent(new mxEventObject('connectionArrowsChanged'));
	}, null, null, 'Alt+Shift+A');
	action.setToggleAction(true);
	action.setSelectedCallback(function() {
		return graph.connectionArrowsEnabled;
	});
	action = this.addAction('connectionPoints', function() {
		graph.setConnectable(!graph.connectionHandler.isEnabled());
		ui.fireEvent(new mxEventObject('connectionPointsChanged'));
	}, null, null, 'Alt+Shift+P');
	action.setToggleAction(true);
	action.setSelectedCallback(function() {
		return graph.connectionHandler.isEnabled();
	});
	action = this.addAction('copyConnect', function() {
		graph.connectionHandler.setCreateTarget(!graph.connectionHandler.isCreateTarget());
		ui.fireEvent(new mxEventObject('copyConnectChanged'));
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() {
		return graph.connectionHandler.isCreateTarget();
	});
	action.isEnabled = isGraphEnabled;
	action = this.addAction('autosave', function() {
		ui.editor.setAutosave(!ui.editor.autosave);
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() {
		return ui.editor.autosave;
	});
	action.isEnabled = isGraphEnabled;
	action.visible = false;

	// Font style actions
	var toggleFontStyle = mxUtils.bind(this, function(key, style, fn, shortcut) {
		return this.addAction(key, function() {
			if(fn != null && graph.cellEditor.isContentEditing()) {
				fn();
			} else {
				graph.stopEditing(false);

				graph.getModel().beginUpdate();
				try {
					graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, style);

					// Removes bold and italic tags and CSS styles inside labels
					if((style & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
						graph.updateLabelElements(graph.getSelectionCells(), function(elt) {
							elt.style.fontWeight = null;

							if(elt.nodeName == 'B') {
								graph.replaceElement(elt);
							}
						});
					} else if((style & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
						graph.updateLabelElements(graph.getSelectionCells(), function(elt) {
							elt.style.fontStyle = null;

							if(elt.nodeName == 'I') {
								graph.replaceElement(elt);
							}
						});
					} else if((style & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) {
						graph.updateLabelElements(graph.getSelectionCells(), function(elt) {
							elt.style.textDecoration = null;

							if(elt.nodeName == 'U') {
								graph.replaceElement(elt);
							}
						});
					}
				} finally {
					graph.getModel().endUpdate();
				}
			}
		}, null, null, shortcut);
	});

	toggleFontStyle('bold', mxConstants.FONT_BOLD, function() {
		document.execCommand('bold', false, null);
	}, Editor.ctrlKey + '+B');
	toggleFontStyle('italic', mxConstants.FONT_ITALIC, function() {
		document.execCommand('italic', false, null);
	}, Editor.ctrlKey + '+I');
	toggleFontStyle('underline', mxConstants.FONT_UNDERLINE, function() {
		document.execCommand('underline', false, null);
	}, Editor.ctrlKey + '+U');

	// Color actions
	this.addAction('fontColor...', function() {
		ui.menus.pickColor(mxConstants.STYLE_FONTCOLOR, 'forecolor', '000000');
	});
	this.addAction('strokeColor...', function() {
		ui.menus.pickColor(mxConstants.STYLE_STROKECOLOR);
	});
	this.addAction('fillColor', function() {
		ui.menus.pickColor(mxConstants.STYLE_FILLCOLOR);
	});
	this.addAction('gradientColor...', function() {
		ui.menus.pickColor(mxConstants.STYLE_GRADIENTCOLOR);
	});
	this.addAction('backgroundColor...', function() {
		ui.menus.pickColor(mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, 'backcolor');
	});
	this.addAction('borderColor...', function() {
		ui.menus.pickColor(mxConstants.STYLE_LABEL_BORDERCOLOR);
	});

	// Format actions
	this.addAction('vertical', function() {
		ui.menus.toggleStyle(mxConstants.STYLE_HORIZONTAL, true);
	});
	this.addAction('shadow', function() {
		ui.menus.toggleStyle(mxConstants.STYLE_SHADOW);
	});
	this.addAction('solid', function() {
		graph.getModel().beginUpdate();
		try {
			graph.setCellStyles(mxConstants.STYLE_DASHED, null);
			graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, null);
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN],
				'values', [null, null], 'cells', graph.getSelectionCells()));
		} finally {
			graph.getModel().endUpdate();
		}
	});
	this.addAction('dashed', function() {
		graph.getModel().beginUpdate();
		try {
			graph.setCellStyles(mxConstants.STYLE_DASHED, '1');
			graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, null);
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN],
				'values', ['1', null], 'cells', graph.getSelectionCells()));
		} finally {
			graph.getModel().endUpdate();
		}
	});
	this.addAction('dotted', function() {
		graph.getModel().beginUpdate();
		try {
			graph.setCellStyles(mxConstants.STYLE_DASHED, '1');
			graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, '1 4');
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN],
				'values', ['1', '1 4'], 'cells', graph.getSelectionCells()));
		} finally {
			graph.getModel().endUpdate();
		}
	});
	this.addAction('sharp', function() {
		graph.getModel().beginUpdate();
		try {
			graph.setCellStyles(mxConstants.STYLE_ROUNDED, '0');
			graph.setCellStyles(mxConstants.STYLE_CURVED, '0');
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
				'values', ['0', '0'], 'cells', graph.getSelectionCells()));
		} finally {
			graph.getModel().endUpdate();
		}
	});
	this.addAction('rounded', function() {
		graph.getModel().beginUpdate();
		try {
			graph.setCellStyles(mxConstants.STYLE_ROUNDED, '1');
			graph.setCellStyles(mxConstants.STYLE_CURVED, '0');
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
				'values', ['1', '0'], 'cells', graph.getSelectionCells()));
		} finally {
			graph.getModel().endUpdate();
		}
	});
	this.addAction('toggleRounded', function() {
		if(!graph.isSelectionEmpty() && graph.isEnabled()) {
			graph.getModel().beginUpdate();
			try {
				var cells = graph.getSelectionCells();
				var state = graph.view.getState(cells[0]);
				var style = (state != null) ? state.style : graph.getCellStyle(cells[0]);
				var value = (mxUtils.getValue(style, mxConstants.STYLE_ROUNDED, '0') == '1') ? '0' : '1';

				graph.setCellStyles(mxConstants.STYLE_ROUNDED, value);
				graph.setCellStyles(mxConstants.STYLE_CURVED, null);
				ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
					'values', [value, '0'], 'cells', graph.getSelectionCells()));
			} finally {
				graph.getModel().endUpdate();
			}
		}
	});
	this.addAction('curved', function() {
		graph.getModel().beginUpdate();
		try {
			graph.setCellStyles(mxConstants.STYLE_ROUNDED, '0');
			graph.setCellStyles(mxConstants.STYLE_CURVED, '1');
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
				'values', ['0', '1'], 'cells', graph.getSelectionCells()));
		} finally {
			graph.getModel().endUpdate();
		}
	});
	this.addAction('collapsible', function() {
		var state = graph.view.getState(graph.getSelectionCell());
		var value = '1';

		if(state != null && graph.getFoldingImage(state) != null) {
			value = '0';
		}

		graph.setCellStyles('collapsible', value);
		ui.fireEvent(new mxEventObject('styleChanged', 'keys', ['collapsible'],
			'values', [value], 'cells', graph.getSelectionCells()));
	});
	this.addAction('editStyle...', mxUtils.bind(this, function() {
		var cells = graph.getSelectionCells();

		if(cells != null && cells.length > 0) {
			var model = graph.getModel();

			var dlg = new TextareaDialog(this.editorUi, mxResources.get('editStyle') + ':',
				model.getStyle(cells[0]) || '',
				function(newValue) {
					if(newValue != null) {
						graph.setCellStyle(mxUtils.trim(newValue), cells);
					}
				}, null, null, 400, 220);
			this.editorUi.showDialog(dlg.container, 420, 300, true, true);
			dlg.init();
		}
	}), null, null, Editor.ctrlKey + '+E');
	this.addAction('addWaypoint', function() {
		var cell = graph.getSelectionCell();

		if(cell != null && graph.getModel().isEdge(cell)) {
			var handler = editor.graph.selectionCellsHandler.getHandler(cell);

			if(handler instanceof mxEdgeHandler) {
				var t = graph.view.translate;
				var s = graph.view.scale;
				var dx = t.x;
				var dy = t.y;

				var parent = graph.getModel().getParent(cell);
				var pgeo = graph.getCellGeometry(parent);

				while(graph.getModel().isVertex(parent) && pgeo != null) {
					dx += pgeo.x;
					dy += pgeo.y;

					parent = graph.getModel().getParent(parent);
					pgeo = graph.getCellGeometry(parent);
				}

				var x = Math.round(graph.snap(graph.popupMenuHandler.triggerX / s - dx));
				var y = Math.round(graph.snap(graph.popupMenuHandler.triggerY / s - dy));

				handler.addPointAt(handler.state, x, y);
			}
		}
	});
	this.addAction('removeWaypoint', function() {
		var rmWaypointAction = ui.actions.get('removeWaypoint');
		if(rmWaypointAction.handler != null) {
			rmWaypointAction.handler.removePoint(rmWaypointAction.handler.state, rmWaypointAction.index);
		}
	});
	
	//查看数据
	this.addAction('previewNodeData', function() {
		previewNodeData();
	});
	
	//重命名
	this.addAction('reName', function() {
		reName();
	});

    //修改参数设置
    this.addAction('modifyParam', function() {
        modifyParam();
    });

	//重置配置
	this.addAction('reSetProperty', function() {
		reSetProperty();
	});

    //清除配置
    this.addAction('reSetOptProperty', function() {
        reSetOptProperty();
    });
	
	//执行本节点
	this.addAction('executeNode', function() {
		executeNode();
	});
	
	//执行到本节点
	this.addAction('executeToNode', function() {
		executeToNode();
	});
	
	//取消执行
	this.addAction('cancelExecute', function() {
		cancelExecute();
	});

	
	//XX设置，开始
	this.addAction('sortSet', function() {
		var type = graph.curCell.nodeType;
		var name = graph.curCell.value;
		var nodeName = "数据排序";
		data_filter(type,name,nodeName);
	});
	this.addAction('sampleSet', function() {
		var type = graph.curCell.nodeType;
		var name = graph.curCell.value;
		var nodeName = "数据抽样";
		data_filter(type,name,nodeName);
	});
	this.addAction('groupCountSet', function() {
		var type = graph.curCell.nodeType;
		var name = graph.curCell.value;
		var nodeName = "分组汇总";
		data_filter(type,name,nodeName);
	});
	this.addAction('comparisonSet', function() {
		var type = graph.curCell.nodeType;
		var name = graph.curCell.value;
		var nodeName = "数据频次分析";
		data_filter(type,name,nodeName);
	});
	this.addAction('changeSet', function() {
		var type = graph.curCell.nodeType;
		var name = graph.curCell.value;
		var nodeName = "数据转码";
		data_filter(type,name,nodeName);
	});
	this.addAction('filterSet', function() {
		var type = graph.curCell.nodeType;
		var name = graph.curCell.value;
		var nodeName = "数据筛选";
		data_filter(type,name,nodeName);
	});
	this.addAction('delRepeatSet', function() {
		var type = graph.curCell.nodeType;
		var name = graph.curCell.value;
		var nodeName = "数据去重";
		data_filter(type,name,nodeName);
	});
	this.addAction('unionSet', function() {
		var type = graph.curCell.nodeType;
		var name = graph.curCell.value;
		var nodeName = "数据融合";
		data_filter(type,name,nodeName);
	});
	this.addAction('relationSet', function() {
		var type = graph.curCell.nodeType;
		var name = graph.curCell.value;
		var nodeName = "数据关联";
		data_filter(type,name,nodeName);
	});
	this.addAction('layeringSet', function() {
		var type = graph.curCell.nodeType;
		var name = graph.curCell.value;
		var nodeName = "数据分层";
		data_filter(type,name,nodeName);
	});
	this.addAction('barChartSet', function() {
		var type = graph.curCell.nodeType;
		var name = graph.curCell.value;
		var nodeName = "自定义图形";
		data_filter(type,name,nodeName);
	});
	//XX设置，结束
	//标记为模型辅助结果表
	this.addAction('markCenterOutput', function(e) {
        var resultTableStatus = graph.nodeData[graph.curCell.id].nodeInfo.resultTableStatus;//模型最终结果表状态
        var midTableStatus = graph.nodeData[graph.curCell.id].nodeInfo.midTableStatus;//模型辅助结果表状态
        //设置输出图标
        if(midTableStatus == 2) {//若已标记，则去掉标记
            graph.nodeData[graph.curCell.id].nodeInfo.midTableStatus = 1;
            setNodeOutputTypeIcon(1,0);
            //自动保存图形化
            autoSaveGraph();
        } else {
            if(resultTableStatus == 2){//如果该结果表已被标记为模型辅助结果表，则不能再被标记为模型最终结果表
                alertMsg("提示", "该结果表已被标记为模型最终结果表", "info");
            }else{
                graph.nodeData[graph.curCell.id].nodeInfo.midTableStatus = 2;
                setNodeOutputTypeIcon(2,0);
                //自动保存图形化
                autoSaveGraph();
            }
        }
	});
	
	//标记为模型最终结果表
	this.addAction('markFinalOutput', function(e) {
		var verify = true;
		var resultTableStatus = graph.nodeData[graph.curCell.id].nodeInfo.resultTableStatus;//模型最终结果表状态
		var midTableStatus = graph.nodeData[graph.curCell.id].nodeInfo.midTableStatus;//模型辅助结果表状态
		//设置输出图标
		if(resultTableStatus == 2) {//若已标记，则去掉标记
			graph.nodeData[graph.curCell.id].nodeInfo.resultTableStatus = 1;
            setNodeOutputTypeIcon(1,1);
            //自动保存图形化
            autoSaveGraph();
		} else {
			if(midTableStatus == 2){//如果该结果表已被标记为模型辅助结果表，则不能再被标记为模型最终结果表
				verify = false;
				alertMsg("提示", "该结果表已被标记为模型辅助结果表", "info");
			}else{
				var keyArr = Object.keys(graph.model.cells);
                for(var i=0;i<keyArr.length;i++) {
                    var item = graph.model.cells[keyArr[i]];
                    if(item.vertex == 1) {
                        resultTableStatus = graph.nodeData[item.id].nodeInfo.resultTableStatus;
                        if(resultTableStatus == 2 && item.id != graph.curCell.id) {
                            alertMsg("提示", "已存在被标记的模型最终结果表", "info");
                            verify = false;
                            break;
                        }
                    }
                }
			}
            if(verify){
                graph.nodeData[graph.curCell.id].nodeInfo.resultTableStatus = 2;
                setNodeOutputTypeIcon(2,1);
                //自动保存图形化
                autoSaveGraph();
            }
		}
	});
	
	//查看节点结果集SQL语句
	this.addAction('showCurNodeSQL', function(e) {
		curNodeSQL();
	});
	
	//我的SQL节点编辑
	this.addAction('nullSqlEdit', function(e) {
		sqlNodeEdit();
	});
	
	//线，切换样式[-->直线]
	this.addAction('switchLineStyleToStraight', function(e) {
		var keys = [mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE];
		var values = [null, null, null];
		ui.menus.edgeLineStyleToChange(keys, values, true);
		//记录执行操作的操作痕迹
	    refrashHistoryZtree("切换连接线【" + graph.curCell.value + "】为直线");
		//自动保存图形化
		autoSaveGraph();
	});
	
	//线，切换样式[-->曲线]
	this.addAction('switchLineStyleToCurved', function(e) {
		var keys = [mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE];
		var values = ['orthogonalEdgeStyle', '1', null];
		ui.menus.edgeLineStyleToChange(keys, values, true);
		//记录执行操作的操作痕迹
	    refrashHistoryZtree("切换连接线【" + graph.curCell.value + "】为曲线");
		//自动保存图形化
		autoSaveGraph();
	});
	
	action.setToggleAction(true);
	action.setSelectedCallback(mxUtils.bind(this, function() {
		return this.layersWindow != null && this.layersWindow.window.isVisible();
	}));
	action.setToggleAction(true);
	action.setSelectedCallback(mxUtils.bind(this, function() {
		return ui.formatWidth > 0;
	}));
	action = this.addAction('outline', mxUtils.bind(this, function() {
		if(this.outlineWindow == null) {
			// LATER: Check layers window for initial placement
			this.outlineWindow = new OutlineWindow(ui, document.body.offsetWidth - 260, 100, 180, 180);
			this.outlineWindow.window.addListener('show', function() {
				ui.fireEvent(new mxEventObject('outline'));
			});
			this.outlineWindow.window.addListener('hide', function() {
				ui.fireEvent(new mxEventObject('outline'));
			});
			this.outlineWindow.window.setVisible(true);
			ui.fireEvent(new mxEventObject('outline'));
		} else {
			this.outlineWindow.window.setVisible(!this.outlineWindow.window.isVisible());
		}
	}), null, null, Editor.ctrlKey + '+Shift+O');

	action.setToggleAction(true);
	action.setSelectedCallback(mxUtils.bind(this, function() {
		return this.outlineWindow != null && this.outlineWindow.window.isVisible();
	}));
};

/**
 * Registers the given action under the given name.
 */
Actions.prototype.addAction = function(key, funct, enabled, iconCls, shortcut) {
	var title;
	if(key.substring(key.length - 3) == '...') {
		key = key.substring(0, key.length - 3);
		title = mxResources.get(key) + '...';
	} else {
		title = mxResources.get(key);
	}

	return this.put(key, new Action(title, funct, enabled, iconCls, shortcut));
};

/**
 * Registers the given action under the given name.
 */
Actions.prototype.put = function(name, action) {
	this.actions[name] = action;

	return action;
};

/**
 * Returns the action for the given name or null if no such action exists.
 */
Actions.prototype.get = function(name) {
	return this.actions[name];
};

/**
 * Constructs a new action for the given parameters.
 */
function Action(label, funct, enabled, iconCls, shortcut) {
	mxEventSource.call(this);
	this.label = label;
	this.funct = this.createFunction(funct);
	this.enabled = (enabled != null) ? enabled : true;
	this.iconCls = iconCls;
	this.shortcut = shortcut;
	this.visible = true;
};

// Action inherits from mxEventSource
mxUtils.extend(Action, mxEventSource);

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.createFunction = function(funct) {
	return funct;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setEnabled = function(value) {
	if(this.enabled != value) {
		this.enabled = value;
		this.fireEvent(new mxEventObject('stateChanged'));
	}
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.isEnabled = function() {
	return this.enabled;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setToggleAction = function(value) {
	this.toggleAction = value;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setSelectedCallback = function(funct) {
	this.selectedCallback = funct;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.isSelected = function() {
	return this.selectedCallback();
};