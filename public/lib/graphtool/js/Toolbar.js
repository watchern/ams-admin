/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Construcs a new toolbar for the given editor.
 */
function Toolbar(editorUi, container) {
	this.editorUi = editorUi;
	this.container = container;
	this.initZoom();
	this.initZoomIn();
	this.initZoomOut();
	
	this.initUndo();
	this.initRedo();
	
	this.initIntersect();
	this.initUnion();
	this.initExclude();
	this.initRelation();
	this.initNewNullNode();
	this.initSQL();

	// Global handler to hide the current menu
	/*this.gestureHandler = mxUtils.bind(this, function(evt) {
		if(this.editorUi.currentMenu != null && mxEvent.getSource(evt) != this.editorUi.currentMenu.div) {
			this.hideMenu();
		}
	});

	mxEvent.addGestureListeners(document, this.gestureHandler);*/
};

/**
 * Image for the dropdown arrow.
 */
Toolbar.prototype.dropdownImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/dropdown.gif' : 'data:image/gif;base64,R0lGODlhDQANAIABAHt7e////yH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCREM1NkJFMjE0NEMxMUU1ODk1Q0M5MjQ0MTA4QjNDMSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCREM1NkJFMzE0NEMxMUU1ODk1Q0M5MjQ0MTA4QjNDMSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkQzOUMzMjZCMTQ0QjExRTU4OTVDQzkyNDQxMDhCM0MxIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkQzOUMzMjZDMTQ0QjExRTU4OTVDQzkyNDQxMDhCM0MxIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAIfkEAQAAAQAsAAAAAA0ADQAAAhGMj6nL3QAjVHIu6azbvPtWAAA7';

/**
 * Image element for the dropdown arrow.
 */
Toolbar.prototype.dropdownImageHtml = '<img border="0" style="position:absolute;right:4px;top:' +
	((!EditorUi.compactUi) ? 8 : 6) + 'px;" src="' + Toolbar.prototype.dropdownImage + '" valign="middle"/>';

/**
 * Defines the background for selected buttons.
 */
Toolbar.prototype.selectedBackground = '#d0d0d0';

/**
 * Defines the background for selected buttons.
 */
Toolbar.prototype.unselectedBackground = 'none';

/**
 * 图元 - 交集
 */
Toolbar.prototype.initIntersect = function() {
	var item = this.addItems(['intersect'])[0];
	var intersectInterval = setInterval(function() {
		if(document.getElementById(item.id) != null) {
			iconDrag({
				type: "intersect",
				shape: "hexagon",
				id: "intersect",
				tId: item.id,
				name: item.title
			});
			clearInterval(intersectInterval);
		}
	}, 100);
	
};
/**
 * 图元 - 并集
 */
Toolbar.prototype.initUnion = function() {
	var item = this.addItems(['union'])[0];
	var unionInterval = setInterval(function() {
		if(document.getElementById(item.id) != null) {
			iconDrag({
				type: "union",
				shape: "hexagon",
				id: "union",
				tId: item.id,
				name: item.title
			});
			clearInterval(unionInterval);
		}
	}, 100);
};
/**
 * 图元 - 排除
 */
Toolbar.prototype.initExclude = function() {
	var item = this.addItems(['exclude'])[0];
	var excludeInterval = setInterval(function() {
		if(document.getElementById(item.id) != null) {
			iconDrag({
				type: "exclude",
				shape: "hexagon",
				id: "exclude",
				tId: item.id,
				name: item.title
			});
			clearInterval(excludeInterval);
		}
	}, 100);
};
/**
 * 图元 - 关联
 */
Toolbar.prototype.initRelation = function() {
	var item = this.addItems(['relation'])[0];
	var relationInterval = setInterval(function() {
		if(document.getElementById(item.id) != null) {
			iconDrag({
				type: "relation",
				shape: "rhombus",
				id: "relation",
				tId: item.id,
				name: item.title
			});
			clearInterval(relationInterval);
		}
	}, 100);
};

/**
 * 图元 - 新的空节点
 */
Toolbar.prototype.initNewNullNode = function() {
	var item = this.addItems(['newNullNode'])[0];
	var newNullNodeInterval = setInterval(function() {
		if(document.getElementById(item.id) != null) {
			iconDrag({
				type: "newNullNode",
				shape: "rhombus",
				id: "newNullNode",
				tId: item.id,
				name: item.title
			});
			clearInterval(newNullNodeInterval);
		}
	}, 100);
}

Toolbar.prototype.initSQL = function() {
	var item = this.addItems(['SQL'])[0];
	var newSQLInterval = setInterval(function() {
		if(document.getElementById(item.id) != null) {
			iconDrag({
				type: "sql",
				shape: "rhombus",
				id: "sql",
				tId: item.id,
				name: item.title
			});
			clearInterval(newSQLInterval);
		}
	}, 100);
}

/**
 * 添加工具-变焦
 */
Toolbar.prototype.initZoom = function() {
	var viewMenu = this.addMenu('', mxResources.get('zoom') + ' (Alt+Mousewheel)', true, 'viewZoom', null, true);
	viewMenu.showDisabled = true;
	viewMenu.style.whiteSpace = 'nowrap';
	viewMenu.style.position = 'relative';
	viewMenu.style.overflow = 'hidden';
	viewMenu.style.width = '60px';


	// Updates the label if the scale changes
	this.updateZoom = mxUtils.bind(this, function() {
		viewMenu.innerHTML = Math.round(this.editorUi.editor.graph.view.scale * 100) + '%' +
			this.dropdownImageHtml;

		if(EditorUi.compactUi) {
			viewMenu.getElementsByTagName('img')[0].style.right = '1px';
			viewMenu.getElementsByTagName('img')[0].style.top = '5px';
		}
	});

	this.editorUi.editor.graph.view.addListener(mxEvent.EVENT_SCALE, this.updateZoom);
	this.editorUi.editor.addListener('resetGraphView', this.updateZoom);
};

/**
 * 放大
 */
Toolbar.prototype.initZoomIn = function() {
	var elts = this.addItems(['zoomIn']);
	elts[0].setAttribute('title', mxResources.get('zoomIn') + ' (' + this.editorUi.actions.get('zoomIn').shortcut + ')');
	
};
/**
 * 缩小
 */
Toolbar.prototype.initZoomOut = function() {
	var elts = this.addItems(['zoomOut']);
	elts[0].setAttribute('title', mxResources.get('zoomOut') + ' (' + this.editorUi.actions.get('zoomOut').shortcut + ')');
};
/**
 * 撤销
 */
Toolbar.prototype.initUndo = function() {
	var elts = this.addItems(['undo']);
	elts[0].setAttribute('title', mxResources.get('undo') + ' (' + this.editorUi.actions.get('undo').shortcut + ')');
};
/**
 * 恢复
 */
Toolbar.prototype.initRedo = function() {
	var elts = this.addItems(['redo']);
	elts[0].setAttribute('title', mxResources.get('redo') + ' (' + this.editorUi.actions.get('redo').shortcut + ')');
};
/**
 * 删除
 */
Toolbar.prototype.initDelete = function() {
	var elts = this.addItems(['delete']);
	elts[0].setAttribute('title', mxResources.get('delete') + ' (' + this.editorUi.actions.get('delete').shortcut + ')');
};
/**
 * 置顶
 */
Toolbar.prototype.initToFront = function() {
	this.addItems(['toFront']);
};
/**
 * 置底
 */
Toolbar.prototype.initToBack = function() {
	this.addItems(['toBack']);
};
/**
 * 填充色
 */
Toolbar.prototype.initFillColor = function() {
	this.addItems(['fillColor']);
};
/**
 * 线条色
 */
Toolbar.prototype.initStrokeColor = function() {
	this.addItems(['strokeColor']);
};
/**
 * 线条色
 */
Toolbar.prototype.initWaypoints = function() {
	this.edgeStyleMenu = this.addMenuFunction('geSprite-orthogonal', mxResources.get('waypoints'), false, mxUtils.bind(this, function(menu) {
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE], [null, null, null], 'geIcon geSprite geSprite-straight', null, true).setAttribute('title', mxResources.get('straight'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE], ['orthogonalEdgeStyle', null, null], 'geIcon geSprite geSprite-orthogonal', null, true).setAttribute('title', mxResources.get('orthogonal'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE], ['orthogonalEdgeStyle', '1', null], 'geIcon geSprite geSprite-curved', null, true).setAttribute('title', mxResources.get('curved'));
	}));

	this.addDropDownArrow(this.edgeStyleMenu, 'geSprite-orthogonal', 44, 50, 0, 0, 22, -4);
};


/**
 * Adds the toolbar elements.
 */
Toolbar.prototype.addDropDownArrow = function(menu, sprite, width, atlasWidth, left, top, atlasDelta, atlasLeft) {
	atlasDelta = (atlasDelta != null) ? atlasDelta : 32;
	left = (EditorUi.compactUi) ? left : atlasLeft;

	menu.style.whiteSpace = 'nowrap';
	menu.style.overflow = 'hidden';
	menu.style.position = 'relative';
	menu.innerHTML = '<div class="geSprite ' + sprite + '" style="margin-left:' + left + 'px;margin-top:' + top + 'px;"></div>' +
		this.dropdownImageHtml;
	menu.style.width = (mxClient.IS_QUIRKS) ? atlasWidth + 'px' : (atlasWidth - atlasDelta) + 'px';

	if(mxClient.IS_QUIRKS) {
		menu.style.height = (EditorUi.compactUi) ? '24px' : '26px';
	}

	// Fix for item size in kennedy theme
	if(EditorUi.compactUi) {
		menu.getElementsByTagName('img')[0].style.left = '24px';
		menu.getElementsByTagName('img')[0].style.top = '5px';
		menu.style.width = (mxClient.IS_QUIRKS) ? width + 'px' : (width - 10) + 'px';
	}
};

/**
 * Sets the current font name.
 */
Toolbar.prototype.setFontName = function(value) {
	if(this.fontMenu != null) {
		this.fontMenu.innerHTML = '<div style="width:60px;overflow:hidden;display:inline-block;">' +
			mxUtils.htmlEntities(value) + '</div>' + this.dropdownImageHtml;
	}
};

/**
 * Sets the current font name.
 */
Toolbar.prototype.setFontSize = function(value) {
	if(this.sizeMenu != null) {
		this.sizeMenu.innerHTML = '<div style="width:24px;overflow:hidden;display:inline-block;">' +
			value + '</div>' + this.dropdownImageHtml;
	}
};

/**
 * Hides the current menu.
 * 当节点内文字被编辑时，创建文字样式工具条[EditorUI.js内方法updateToolbar有用到]
 */
/*Toolbar.prototype.createTextToolbar = function() {
	var graph = this.editorUi.editor.graph;

	var styleElt = this.addMenu('', mxResources.get('style'), true, 'formatBlock');
	styleElt.style.position = 'relative';
	styleElt.style.whiteSpace = 'nowrap';
	styleElt.style.overflow = 'hidden';
	styleElt.innerHTML = mxResources.get('style') + this.dropdownImageHtml;

	if(EditorUi.compactUi) {
		styleElt.style.paddingRight = '18px';
		styleElt.getElementsByTagName('img')[0].style.right = '1px';
		styleElt.getElementsByTagName('img')[0].style.top = '5px';
	}

	this.addSeparator();

	this.fontMenu = this.addMenu('', mxResources.get('fontFamily'), true, 'fontFamily');
	this.fontMenu.style.position = 'relative';
	this.fontMenu.style.whiteSpace = 'nowrap';
	this.fontMenu.style.overflow = 'hidden';
	this.fontMenu.style.width = (mxClient.IS_QUIRKS) ? '80px' : '60px';

	this.setFontName(Menus.prototype.defaultFont);

	if(EditorUi.compactUi) {
		this.fontMenu.style.paddingRight = '18px';
		this.fontMenu.getElementsByTagName('img')[0].style.right = '1px';
		this.fontMenu.getElementsByTagName('img')[0].style.top = '5px';
	}

	this.addSeparator();

	this.sizeMenu = this.addMenu(Menus.prototype.defaultFontSize, mxResources.get('fontSize'), true, 'fontSize');
	this.sizeMenu.style.position = 'relative';
	this.sizeMenu.style.whiteSpace = 'nowrap';
	this.sizeMenu.style.overflow = 'hidden';
	this.sizeMenu.style.width = (mxClient.IS_QUIRKS) ? '44px' : '24px';

	this.setFontSize(Menus.prototype.defaultFontSize);

	if(EditorUi.compactUi) {
		this.sizeMenu.style.paddingRight = '18px';
		this.sizeMenu.getElementsByTagName('img')[0].style.right = '1px';
		this.sizeMenu.getElementsByTagName('img')[0].style.top = '5px';
	}

	var elts = this.addItems(['-', 'undo', 'redo', '-', 'bold', 'italic', 'underline']);
	elts[1].setAttribute('title', mxResources.get('undo') + ' (' + this.editorUi.actions.get('undo').shortcut + ')');
	elts[2].setAttribute('title', mxResources.get('redo') + ' (' + this.editorUi.actions.get('redo').shortcut + ')');
	elts[4].setAttribute('title', mxResources.get('bold') + ' (' + this.editorUi.actions.get('bold').shortcut + ')');
	elts[5].setAttribute('title', mxResources.get('italic') + ' (' + this.editorUi.actions.get('italic').shortcut + ')');
	elts[6].setAttribute('title', mxResources.get('underline') + ' (' + this.editorUi.actions.get('underline').shortcut + ')');

};*/

/**
 * Hides the current menu.
 */
Toolbar.prototype.hideMenu = function() {
	this.editorUi.hideCurrentMenu();
};

/**
 * Adds a label to the toolbar.
 */
Toolbar.prototype.addMenu = function(label, tooltip, showLabels, name, c, showAll, ignoreState) {
	var menu = this.editorUi.menus.get(name);
	var elt = this.addMenuFunction(label, tooltip, showLabels, function() {
		menu.funct.apply(menu, arguments);
	}, c, showAll);

	return elt;
};

/**
 * Adds a label to the toolbar.
 */
Toolbar.prototype.addMenuFunction = function(label, tooltip, showLabels, funct, c, showAll) {
	return this.addMenuFunctionInContainer((c != null) ? c : this.container, label, tooltip, showLabels, funct, showAll);
};

/**
 * Adds a label to the toolbar.
 */
Toolbar.prototype.addMenuFunctionInContainer = function(container, label, tooltip, showLabels, funct, showAll) {
	var elt = (showLabels) ? this.createLabel(label) : this.createButton(label);
	this.initElement(elt, tooltip);
	this.addMenuHandler(elt, showLabels, funct, showAll);
	container.appendChild(elt);

	return elt;
};

/**
 * Adds a separator to the separator.
 */
Toolbar.prototype.addSeparator = function(c) {
	c = (c != null) ? c : this.container;
	var elt = document.createElement('div');
	elt.className = 'geSeparator';
	c.appendChild(elt);

	return elt;
};

/**
 * Adds given action item
 */
Toolbar.prototype.addItems = function(keys, c, ignoreDisabled) {
	var items = [];

	for(var i = 0; i < keys.length; i++) {
		var key = keys[i];

		if(key == '-') {
			items.push(this.addSeparator(c));
		} else {
			items.push(this.addItem('geSprite-' + key.toLowerCase(), key, c, ignoreDisabled));
		}
	}

	return items;
};

/**
 * Adds given action item
 */
Toolbar.prototype.addItem = function(sprite, key, c, ignoreDisabled) {
	var action = this.editorUi.actions.get(key);
	var elt = null;

	if(action != null) {
		var tooltip = action.label;

		if(action.shortcut != null) {
			tooltip += ' (' + action.shortcut + ')';
		}

		elt = this.addButton(sprite, tooltip, action.funct, c);

		if(!ignoreDisabled) {
			elt.setEnabled(action.enabled);

			action.addListener('stateChanged', function() {
				elt.setEnabled(action.enabled);
			});
		}
	}

	return elt;
};

/**
 * Adds a button to the toolbar.
 */
Toolbar.prototype.addButton = function(classname, tooltip, funct, c) {
	var elt = this.createButton(classname);
	c = (c != null) ? c : this.container;

	this.initElement(elt, tooltip);
	this.addClickHandler(elt, funct);
	c.appendChild(elt);

	return elt;
};

/**
 * Initializes the given toolbar element.
 */
Toolbar.prototype.initElement = function(elt, tooltip) {
	// Adds tooltip
	if(tooltip != null) {
		elt.setAttribute('title', tooltip);
	}

	this.addEnabledState(elt);
};

/**
 * Adds enabled state with setter to DOM node (avoids JS wrapper).
 */
Toolbar.prototype.addEnabledState = function(elt) {
	var classname = elt.className;

	elt.setEnabled = function(value) {
		elt.enabled = value;

		if(value) {
			elt.className = classname;
		} else {
			elt.className = classname + ' mxDisabled';
		}
	};

	elt.setEnabled(true);
};

/**
 * Adds enabled state with setter to DOM node (avoids JS wrapper).
 */
Toolbar.prototype.addClickHandler = function(elt, funct) {
	if(funct != null) {
		mxEvent.addListener(elt, 'click', function(evt) {
			if(elt.enabled) {
				funct(evt);
			}

			mxEvent.consume(evt);
		});

		// Prevents focus
		mxEvent.addListener(elt, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown',
			mxUtils.bind(this, function(evt) {
				evt.preventDefault();
			}));
	}
};

/**
 * Creates and returns a new button.
 */
Toolbar.prototype.createButton = function(classname) {
	var elt = document.createElement('a');
	elt.className = 'geButton';
	elt.id = mxUtils.uuid();

	var inner = document.createElement('div');

	if(classname != null) {
		inner.className = 'geSprite ' + classname;
	}

	elt.appendChild(inner);

	return elt;
};

/**
 * Creates and returns a new button.
 */
Toolbar.prototype.createLabel = function(label, tooltip) {
	var elt = document.createElement('a');
	elt.className = 'geLabel';
	mxUtils.write(elt, label);

	return elt;
};

/**
 * Adds a handler for showing a menu in the given element.
 */
Toolbar.prototype.addMenuHandler = function(elt, showLabels, funct, showAll) {
	if(funct != null) {
		var graph = this.editorUi.editor.graph;
		var menu = null;
		var show = true;

		mxEvent.addListener(elt, 'click', mxUtils.bind(this, function(evt) {
			if(show && (elt.enabled == null || elt.enabled)) {
				graph.popupMenuHandler.hideMenu();
				menu = new mxPopupMenu(funct);
				menu.div.className += ' geToolbarMenu';
				menu.showDisabled = showAll;
				menu.labels = showLabels;
				menu.autoExpand = true;

				var offset = mxUtils.getOffset(elt);
				menu.popup(offset.x, offset.y + elt.offsetHeight, null, evt);
				this.editorUi.setCurrentMenu(menu, elt);

				// Workaround for scrollbar hiding menu items
				if(!showLabels && menu.div.scrollHeight > menu.div.clientHeight) {
					menu.div.style.width = '40px';
				}

				menu.hideMenu = mxUtils.bind(this, function() {
					mxPopupMenu.prototype.hideMenu.apply(menu, arguments);
					this.editorUi.resetCurrentMenu();
					menu.destroy();
				});

				// Extends destroy to reset global state
				menu.addListener(mxEvent.EVENT_HIDE, mxUtils.bind(this, function() {
					this.currentElt = null;
				}));
			}

			show = true;
			mxEvent.consume(evt);
		}));

		// Hides menu if already showing and prevents focus
		mxEvent.addListener(elt, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown',
			mxUtils.bind(this, function(evt) {
				show = this.currentElt != elt;
				evt.preventDefault();
			}));
	}
};

/**
 * Adds a handler for showing a menu in the given element.
 */
Toolbar.prototype.destroy = function() {
	if(this.gestureHandler != null) {
		mxEvent.removeGestureListeners(document, this.gestureHandler);
		this.gestureHandler = null;
	}
};