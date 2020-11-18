/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs a new graph editor
 */
Menus = function(editorUi) {
	this.editorUi = editorUi;
	this.menus = new Object();
	this.init();

	// Pre-fetches checkmark image
	if(!mxClient.IS_SVG) {
		new Image().src = this.checkmarkImage;
	}
};

/**
 * Sets the default font family.
 */
Menus.prototype.defaultFont = 'Helvetica';

/**
 * Sets the default font size.
 */
Menus.prototype.defaultFontSize = '12';

/**
 * Sets the default font size.
 */
Menus.prototype.defaultMenuItems = ['file', 'edit', 'view', 'arrange', 'extras' /*, 'help'*/ ];

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.defaultFonts = ['Helvetica', 'Verdana', 'Times New Roman', 'Garamond', 'Comic Sans MS',
	'Courier New', 'Georgia', 'Lucida Console', 'Tahoma'
];

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.init = function() {
	var graph = this.editorUi.editor.graph;
	var isGraphEnabled = mxUtils.bind(graph, graph.isEnabled);

	this.customFonts = [];
	this.customFontSizes = [];

	this.put('fontFamily', new Menu(mxUtils.bind(this, function(menu, parent) {
		var addItem = mxUtils.bind(this, function(fontname) {
			var tr = this.styleChange(menu, fontname, [mxConstants.STYLE_FONTFAMILY], [fontname], null, parent, function() {
				document.execCommand('fontname', false, fontname);
			}, function() {
				graph.updateLabelElements(graph.getSelectionCells(), function(elt) {
					elt.removeAttribute('face');
					elt.style.fontFamily = null;

					if(elt.nodeName == 'PRE') {
						graph.replaceElement(elt, 'div');
					}
				});
			});
			tr.firstChild.nextSibling.style.fontFamily = fontname;
		});

		for(var i = 0; i < this.defaultFonts.length; i++) {
			addItem(this.defaultFonts[i]);
		}

		menu.addSeparator(parent);

		if(this.customFonts.length > 0) {
			for(var i = 0; i < this.customFonts.length; i++) {
				addItem(this.customFonts[i]);
			}

			menu.addSeparator(parent);

			menu.addItem(mxResources.get('reset'), null, mxUtils.bind(this, function() {
				this.customFonts = [];
			}), parent);

			menu.addSeparator(parent);
		}

		this.promptChange(menu, mxResources.get('custom') + '...', '', mxConstants.DEFAULT_FONTFAMILY, mxConstants.STYLE_FONTFAMILY, parent, true, mxUtils.bind(this, function(newValue) {
			this.customFonts.push(newValue);
		}));
	})));
	this.put('formatBlock', new Menu(mxUtils.bind(this, function(menu, parent) {
		function addItem(label, tag) {
			return menu.addItem(label, null, mxUtils.bind(this, function() {
				// TODO: Check if visible
				if(graph.cellEditor.textarea != null) {
					graph.cellEditor.textarea.focus();
					document.execCommand('formatBlock', false, '<' + tag + '>');
				}
			}), parent);
		};

		addItem(mxResources.get('normal'), 'p');

		addItem('', 'h1').firstChild.nextSibling.innerHTML = '<h1 style="margin:0px;">' + mxResources.get('heading') + ' 1</h1>';
		addItem('', 'h2').firstChild.nextSibling.innerHTML = '<h2 style="margin:0px;">' + mxResources.get('heading') + ' 2</h2>';
		addItem('', 'h3').firstChild.nextSibling.innerHTML = '<h3 style="margin:0px;">' + mxResources.get('heading') + ' 3</h3>';
		addItem('', 'h4').firstChild.nextSibling.innerHTML = '<h4 style="margin:0px;">' + mxResources.get('heading') + ' 4</h4>';
		addItem('', 'h5').firstChild.nextSibling.innerHTML = '<h5 style="margin:0px;">' + mxResources.get('heading') + ' 5</h5>';
		addItem('', 'h6').firstChild.nextSibling.innerHTML = '<h6 style="margin:0px;">' + mxResources.get('heading') + ' 6</h6>';

		addItem('', 'pre').firstChild.nextSibling.innerHTML = '<pre style="margin:0px;">' + mxResources.get('formatted') + '</pre>';
		addItem('', 'blockquote').firstChild.nextSibling.innerHTML = '<blockquote style="margin-top:0px;margin-bottom:0px;">' + mxResources.get('blockquote') + '</blockquote>';
	})));
	this.put('fontSize', new Menu(mxUtils.bind(this, function(menu, parent) {
		var sizes = [6, 8, 9, 10, 11, 12, 14, 18, 24, 36, 48, 72];

		var addItem = mxUtils.bind(this, function(fontsize) {
			this.styleChange(menu, fontsize, [mxConstants.STYLE_FONTSIZE], [fontsize], null, parent, function() {
				document.execCommand('fontSize', false, '3');

				var elts = graph.cellEditor.textarea.getElementsByTagName('font');

				for(var i = 0; i < elts.length; i++) {
					if(elts[i].getAttribute('size') == '3') {
						elts[i].removeAttribute('size');
						elts[i].style.fontSize = fontsize + 'px';

						break;
					}
				}
			});
		});

		for(var i = 0; i < sizes.length; i++) {
			addItem(sizes[i]);
		}

		menu.addSeparator(parent);

		if(this.customFontSizes.length > 0) {
			for(var i = 0; i < this.customFontSizes.length; i++) {
				addItem(this.customFontSizes[i]);
			}

			menu.addSeparator(parent);

			menu.addItem(mxResources.get('reset'), null, mxUtils.bind(this, function() {
				this.customFontSizes = [];
			}), parent);

			menu.addSeparator(parent);
		}

	})));
	this.put('navigation', new Menu(mxUtils.bind(this, function(menu, parent) {
		this.addMenuItems(menu, ['home', '-', 'exitGroup', 'enterGroup', '-', 'expand', 'collapse', '-', 'collapsible'], parent);
	})));

	this.put('viewZoom', new Menu(mxUtils.bind(this, function(menu, parent) {
		this.addMenuItems(menu, ['resetView', '-'], parent);
		var scales = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

		for(var i = 0; i < scales.length; i++) {
			(function(scale) {
				menu.addItem((scale * 100) + '%', null, function() {
					graph.zoomTo(scale);
				}, parent);
			})(scales[i]);
		}

	})));
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.put = function(name, menu) {
	this.menus[name] = menu;

	return menu;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.get = function(name) {
	return this.menus[name];
};

/**
 * Adds the given submenu.
 */
Menus.prototype.addSubmenu = function(name, menu, parent, label) {
	var entry = this.get(name);

	if(entry != null) {
		var enabled = entry.isEnabled();

		if(menu.showDisabled || enabled) {
			var submenu = menu.addItem(label || mxResources.get(name), null, null, parent, null, enabled);
			this.addMenu(name, menu, submenu);
		}
	}
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.addMenu = function(name, popupMenu, parent) {
	var menu = this.get(name);

	if(menu != null && (popupMenu.showDisabled || menu.isEnabled())) {
		this.get(name).execute(popupMenu, parent);
	}
};


/**
 * Adds a style change item to the given menu.
 */
Menus.prototype.edgeStyleChange = function(menu, label, keys, values, sprite, parent, reset) {
	return menu.addItem(label, null, mxUtils.bind(this, function() {
		var graph = this.editorUi.editor.graph;
		graph.stopEditing(false);

		graph.getModel().beginUpdate();
		try {
			var cells = graph.getSelectionCells();
			var edges = [];

			for(var i = 0; i < cells.length; i++) {
				var cell = cells[i];

				if(graph.getModel().isEdge(cell)) {
					if(reset) {
						var geo = graph.getCellGeometry(cell);

						// Resets all edge points
						if(geo != null) {
							geo = geo.clone();
							geo.points = null;
							graph.getModel().setGeometry(cell, geo);
						}
					}

					for(var j = 0; j < keys.length; j++) {
						graph.setCellStyles(keys[j], values[j], [cell]);
					}

					edges.push(cell);
				}
			}

			this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', keys,
				'values', values, 'cells', edges));
		} finally {
			graph.getModel().endUpdate();
		}
	}), parent, sprite);
};

Menus.prototype.edgeLineStyleToChange = function(keys, values, reset) {
	var graph = this.editorUi.editor.graph;
	graph.stopEditing(false);

	graph.getModel().beginUpdate();
	try {
		var cells = graph.getSelectionCells();
		var edges = [];

		for(var i = 0; i < cells.length; i++) {
			var cell = cells[i];

			if(graph.getModel().isEdge(cell)) {
				if(reset) {
					var geo = graph.getCellGeometry(cell);

					// Resets all edge points
					if(geo != null) {
						geo = geo.clone();
						geo.points = null;
						graph.getModel().setGeometry(cell, geo);
					}
				}

				for(var j = 0; j < keys.length; j++) {
					graph.setCellStyles(keys[j], values[j], [cell]);
				}

				edges.push(cell);
			}
		}

		this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', keys,
			'values', values, 'cells', edges));
	} finally {
		graph.getModel().endUpdate();
	}
};

/**
 * Adds a style change item to the given menu.
 */
Menus.prototype.styleChange = function(menu, label, keys, values, sprite, parent, fn, post) {
	var apply = this.createStyleChangeFunction(keys, values);

	return menu.addItem(label, null, mxUtils.bind(this, function() {
		var graph = this.editorUi.editor.graph;

		if(fn != null && graph.cellEditor.isContentEditing()) {
			fn();
		} else {
			apply(post);
		}
	}), parent, sprite);
};

/**
 * 
 */
Menus.prototype.createStyleChangeFunction = function(keys, values) {
	return mxUtils.bind(this, function(post) {
		var graph = this.editorUi.editor.graph;
		graph.stopEditing(false);

		graph.getModel().beginUpdate();
		try {
			for(var i = 0; i < keys.length; i++) {
				graph.setCellStyles(keys[i], values[i]);
			}

			if(post != null) {
				post();
			}

			this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', keys, 'values', values,
				'cells', graph.getSelectionCells()));
		} finally {
			graph.getModel().endUpdate();
		}
	});
};

/**
 * Adds a style change item with a prompt to the given menu.
 */
Menus.prototype.promptChange = function(menu, label, hint, defaultValue, key, parent, enabled, fn, sprite) {
	return menu.addItem(label, null, mxUtils.bind(this, function() {
		var graph = this.editorUi.editor.graph;
		var value = defaultValue;
		var state = graph.getView().getState(graph.getSelectionCell());

		if(state != null) {
			value = state.style[key] || value;
		}

		var dlg = new FilenameDialog(this.editorUi, value, mxResources.get('apply'), mxUtils.bind(this, function(newValue) {
			if(newValue != null && newValue.length > 0) {
				graph.getModel().beginUpdate();
				try {
					graph.stopEditing(false);
					graph.setCellStyles(key, newValue);
				} finally {
					graph.getModel().endUpdate();
				}

				if(fn != null) {
					fn(newValue);
				}
			}
		}), mxResources.get('enterValue') + ((hint.length > 0) ? (' ' + hint) : ''));
		this.editorUi.showDialog(dlg.container, 300, 80, true, true);
		dlg.init();
	}), parent, sprite, enabled);
};

/**
 * Adds a handler for showing a menu in the given element.
 */
Menus.prototype.pickColor = function(key, cmd, defaultValue) {
	var graph = this.editorUi.editor.graph;
	var h = 226 + ((Math.ceil(ColorDialog.prototype.presetColors.length / 12) +
		Math.ceil(ColorDialog.prototype.defaultColors.length / 12)) * 17);

	if(cmd != null && graph.cellEditor.isContentEditing()) {
		// Saves and restores text selection for in-place editor
		var selState = graph.cellEditor.saveSelection();

		var dlg = new ColorDialog(this.editorUi, defaultValue || '000000', mxUtils.bind(this, function(color) {
			graph.cellEditor.restoreSelection(selState);
			document.execCommand(cmd, false, (color != mxConstants.NONE) ? color : 'transparent');
		}), function() {
			graph.cellEditor.restoreSelection(selState);
		});
		this.editorUi.showDialog(dlg.container, 230, h, true, true);
		dlg.init();
	} else {
		if(this.colorDialog == null) {
			this.colorDialog = new ColorDialog(this.editorUi);
		}

		this.colorDialog.currentColorKey = key;
		var state = graph.getView().getState(graph.getSelectionCell());
		var color = 'none';

		if(state != null) {
			color = state.style[key] || color;
		}

		if(color == 'none') {
			color = 'ffffff';
			this.colorDialog.picker.fromString('ffffff');
			this.colorDialog.colorInput.value = 'none';
		} else {
			this.colorDialog.picker.fromString(color);
		}

		this.editorUi.showDialog(this.colorDialog.container, 230, h, true, false);
		this.colorDialog.init();
	}
};

/**
 * Adds a handler for showing a menu in the given element.
 */
Menus.prototype.toggleStyle = function(key, defaultValue) {
	var graph = this.editorUi.editor.graph;
	var value = graph.toggleCellStyles(key, defaultValue);
	this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [key], 'values', [value],
		'cells', graph.getSelectionCells()));
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
Menus.prototype.addMenuItem = function(menu, key, parent, trigger, sprite, label) {
	var action = this.editorUi.actions.get(key);

	if(action != null && (menu.showDisabled || action.isEnabled()) && action.visible) {
		var item = menu.addItem(label || action.label, null, function() {
			action.funct(trigger);
		}, parent, sprite, action.isEnabled());

		// Adds checkmark image
		if(action.toggleAction && action.isSelected()) {
			menu.addCheckmark(item, Editor.checkmarkImage);
		}

		this.addShortcut(item, action);

		return item;
	}

	return null;
};

/**
 * Adds a checkmark to the given menuitem.
 */
Menus.prototype.addShortcut = function(item, action) {
	if(action.shortcut != null) {
		var td = item.firstChild.nextSibling.nextSibling;
		var span = document.createElement('span');
		span.style.color = 'gray';
		mxUtils.write(span, action.shortcut);
		td.appendChild(span);
	}
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
Menus.prototype.addMenuItems = function(menu, keys, parent, trigger, sprites) {
	for(var i = 0; i < keys.length; i++) {
		if(keys[i] == '-') {
			menu.addSeparator(parent);
		} else {
			this.addMenuItem(menu, keys[i], parent, trigger, (sprites != null) ? sprites[i] : null);
		}
	}
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
Menus.prototype.createPopupMenu = function(menu, cell, evt) {
	var graph = this.editorUi.editor.graph;
	menu.smartSeparators = true;
	graph.curCell = cell;
	//右键位置是否是空白
	if(graph.isSelectionEmpty()) {
		this.addMenuItems(menu, ['selectVertices', 'selectEdges', 'selectAll','-','undo', 'redo', 'pasteHere'], null, evt);
	} else {
		var commonMenu = [];
		if(cell.vertex == 1) {
			var nodeMenus = this.createNodeMenus(cell.nodeType,cell.id);
			this.addMenuItems(menu, nodeMenus, null, evt);
			if(graph.canEditor){
                commonMenu = ['-','cut','copy','delete'];
			}
		}
		if(cell.edge == 1 && graph.canEditor){
			if(cell.style.indexOf("edgeStyle=orthogonalEdgeStyle") != -1) {
				this.addMenuItems(menu, ['switchLineStyleToStraight'], null, evt);
			} else {
				this.addMenuItems(menu, ['switchLineStyleToCurved'], null, evt);
			}
			this.addMenuItems(menu, ['reName'], null, evt);
			commonMenu = ['-','delete'];
		}
		this.addMenuItems(menu, commonMenu, null, evt);
	}
};

/**
 * Construcs a new menubar for the given editor.
 */
function Menubar(editorUi, container) {
	this.editorUi = editorUi;
	this.container = container;
};
Menubar.prototype.addMenuHandler = function(elt, funct) {
	if(funct != null) {
		var show = true;

		var clickHandler = mxUtils.bind(this, function(evt) {
			if(show && elt.enabled == null || elt.enabled) {
				this.editorUi.editor.graph.popupMenuHandler.hideMenu();
				var menu = new mxPopupMenu(funct);
				menu.div.className += ' geMenubarMenu';
				menu.smartSeparators = true;
				menu.showDisabled = true;
				menu.autoExpand = true;

				// Disables autoexpand and destroys menu when hidden
				menu.hideMenu = mxUtils.bind(this, function() {
					mxPopupMenu.prototype.hideMenu.apply(menu, arguments);
					this.editorUi.resetCurrentMenu();
					menu.destroy();
				});

				var offset = mxUtils.getOffset(elt);
				menu.popup(offset.x, offset.y + elt.offsetHeight, null, evt);
				this.editorUi.setCurrentMenu(menu, elt);
			}

			mxEvent.consume(evt);
		});

		// Shows menu automatically while in expanded state
		mxEvent.addListener(elt, 'mousemove', mxUtils.bind(this, function(evt) {
			if(this.editorUi.currentMenu != null && this.editorUi.currentMenuElt != elt) {
				this.editorUi.hideCurrentMenu();
				clickHandler(evt);
			}
		}));

		// Hides menu if already showing and prevents focus
		mxEvent.addListener(elt, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown',
			mxUtils.bind(this, function(evt) {
				show = this.currentElt != elt;
				evt.preventDefault();
			}));

		mxEvent.addListener(elt, 'click', mxUtils.bind(this, function(evt) {
			clickHandler(evt);
			show = true;
		}));
	}
};

/**
 * Constructs a new action for the given parameters.
 */
function Menu(funct, enabled) {
	mxEventSource.call(this);
	this.funct = funct;
	this.enabled = (enabled != null) ? enabled : true;
};

// Menu inherits from mxEventSource
mxUtils.extend(Menu, mxEventSource);

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Menu.prototype.isEnabled = function() {
	return this.enabled;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Menu.prototype.setEnabled = function(value) {
	if(this.enabled != value) {
		this.enabled = value;
		this.fireEvent(new mxEventObject('stateChanged'));
	}
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Menu.prototype.execute = function(menu, parent) {
	this.funct(menu, parent);
};

/**
 * "Installs" menus in EditorUi.
 */
EditorUi.prototype.createMenus = function() {
	return new Menus(this);
};

/**
 * 创建每种类型节点各自的右键菜单
 */
Menus.prototype.createNodeMenus = function(nodeType,nodeId) {
	var menuArr = [];
	if(graph.canEditor === false){//如果当前图形不可编辑
		if(nodeType == "datasource"){
			return ["previewNodeData", "showCurNodeSQL"];
		}else if(nodeType == "newNullNode"){
			return ["executeNode","executeToNode","cancelExecute","previewNodeData", "showCurNodeSQL"];
		}else if(nodeType == "barChart"){
			return ["barChartSet"];
		}else{
			return ["showCurNodeSQL"];
		}
	}
	switch (nodeType) {
		//数据库表
		case "datasource":
            menuArr = ["previewNodeData", "showCurNodeSQL","markCenterOutput","reName"];
			break;
		//结果表
		case "newNullNode":
			menuArr = ["executeNode","executeToNode","previewNodeData", "showCurNodeSQL", "-","cancelExecute","-","markCenterOutput","markFinalOutput",/*"reSetProperty"*/"reName"];
			break;
		//SQL
		case "sql":
			menuArr = ["nullSqlEdit","showCurNodeSQL","reName"];
			break;
		//行数据处理
		case "filter":
			menuArr = ["filterSet", "reSetOptProperty","showCurNodeSQL","reName"];
			break;
		case "sort":
			menuArr = ["sortSet", "reSetOptProperty","showCurNodeSQL","reName"];
			break;
		case "layering":
			menuArr = ["layeringSet", "reSetOptProperty","showCurNodeSQL","reName"];
			break;
		case "groupCount":
			menuArr = ["groupCountSet", "reSetOptProperty","showCurNodeSQL","reName"];
			break;
		case "delRepeat":
			menuArr = ["delRepeatSet","reSetOptProperty", "showCurNodeSQL","reName"];
			break;
		//列数据处理
		case "change":
			menuArr = ["changeSet","reSetOptProperty", "showCurNodeSQL","reName"];
			break;
		//表间数据处理
		case "union":
			menuArr = ["unionSet","reSetOptProperty", "showCurNodeSQL","reName"];
			break;
		case "relation":
			menuArr = ["relationSet", "reSetOptProperty","showCurNodeSQL","reName"];
			break;
		//数据抽样
		case "sample":
			menuArr = ["sampleSet","reSetOptProperty","showCurNodeSQL","reName"];
			break;
		//数据频次分析
		case "comparison":		
			menuArr = ["comparisonSet","reSetOptProperty","showCurNodeSQL","reName"];
			break;
		//图形
		case "barChart":
			menuArr = ["barChartSet","reSetOptProperty","reName"];
			break;
	}
	if(graph.nodeData[nodeId].hasParam && graph.openGraphType != "1"){//如果当前图形不是普通图形（是场景查询图形或模型图形）且当前节点有参数
		menuArr.push("-");
        menuArr.push("modifyParam");
	}
	return menuArr;
};