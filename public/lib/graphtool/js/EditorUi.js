/**
 * Constructs a new graph editor
 */
EditorUi = function (editor, container, lightbox) {
	mxEventSource.call(this);
	this.destroyFunctions = [];
	this.editor = editor || new Editor();
	this.container = container || document.getElementById("graphContainer");

	var graph = this.editor.graph;
	/*-----graph.lightbox = lightbox;*/

	// 使用CSS转换可以实现更快的滚动滚轮缩放
	if (graph.useCssTransforms) {
		this.lazyZoomDelay = 0;
	}

	// 在无铬模式下禁用图形和强制平移
	if (this.editor.chromeless && !this.editor.editable) {
		graph.isEnabled = function () {
			return false;
		};
		graph.panningHandler.isForcePanningEvent = function (me) {
			return !mxEvent.isPopupTrigger(me.getEvent());
		};
	}

	// 创建用户界面行为
	this.actions = new Actions(this);

	this.menus = this.createMenus();
	this.createDivs();
	this.createUi();
	this.refresh();

	// Disables HTML and text selection
	var textEditing = mxUtils.bind(this, function (evt) {
		if (evt == null) {
			evt = window.event;
		}
		return (this.isSelectionAllowed(evt) || graph.isEditing());
	});

	// 在编辑时使用内置的上下文菜单
	if (!this.editor.chromeless || this.editor.editable) {
		// Allows context menu for links in hints
		var linkHandler = function (evt) {
			var source = mxEvent.getSource(evt);

			if (source.nodeName == 'A') {
				while (source != null) {
					if (source.className == 'geHint') {
						return true;
					}
					source = source.parentNode;
				}
			}
			return textEditing(evt);
		};
		if (mxClient.IS_IE && (typeof (document.documentMode) === 'undefined' || document.documentMode < 9)) {
			mxEvent.addListener(this.diagramContainer, 'contextmenu', linkHandler);
		} else {
			// Allows browser context menu outside of diagram and sidebar
			this.diagramContainer.oncontextmenu = linkHandler;
		}
	} else {
		graph.panningHandler.usePopupTrigger = false;
	}

	// Contains the main graph instance inside the given panel
	graph.init(this.diagramContainer);

	// Improves line wrapping for in-place editor
	if (mxClient.IS_SVG && graph.view.getDrawPane() != null) {
		var root = graph.view.getDrawPane().ownerSVGElement;
		if (root != null) {
			root.style.position = 'absolute';
		}
	}

	// Creates hover icons
	this.hoverIcons = this.createHoverIcons();

	// Adds tooltip when mouse is over scrollbars to show space-drag panning option
	mxEvent.addListener(this.diagramContainer, 'mousemove', mxUtils.bind(this, function (evt) {
		var off = mxUtils.getOffset(this.diagramContainer);

		if (mxEvent.getClientX(evt) - off.x - this.diagramContainer.clientWidth > 0 ||
			mxEvent.getClientY(evt) - off.y - this.diagramContainer.clientHeight > 0) {
			this.diagramContainer.setAttribute('title', mxResources.get('panTooltip'));
		} else {
			this.diagramContainer.removeAttribute('title');
		}
	}));

	// Escape key hides dialogs, adds space+drag panning
	var spaceKeyPressed = false;

	// Overrides hovericons to disable while space key is pressed
	var hoverIconsIsResetEvent = this.hoverIcons.isResetEvent;

	this.hoverIcons.isResetEvent = function (evt, allowShift) {
		return spaceKeyPressed || hoverIconsIsResetEvent.apply(this, arguments);
	};

	this.keydownHandler = mxUtils.bind(this, function (evt) {
		if (evt.which == 32 /* Space */) {
			spaceKeyPressed = true;
			this.hoverIcons.reset();
			graph.container.style.cursor = 'move';

			// Disables scroll after space keystroke with scrollbars
			if (!graph.isEditing() && mxEvent.getSource(evt) == graph.container) {
				mxEvent.consume(evt);
			}
		} else if (!mxEvent.isConsumed(evt) && evt.keyCode == 27 /* Escape */) {
			this.hideDialog();
		}
	});

	mxEvent.addListener(document, 'keydown', this.keydownHandler);

	this.keyupHandler = mxUtils.bind(this, function (evt) {
		graph.container.style.cursor = '';
		spaceKeyPressed = false;
	});

	mxEvent.addListener(document, 'keyup', this.keyupHandler);

	// Forces panning for middle and right mouse buttons
	var panningHandlerIsForcePanningEvent = graph.panningHandler.isForcePanningEvent;
	graph.panningHandler.isForcePanningEvent = function (me) {
		// Ctrl+left button is reported as right button in FF on Mac
		return panningHandlerIsForcePanningEvent.apply(this, arguments) ||
			spaceKeyPressed || (mxEvent.isMouseEvent(me.getEvent()) &&
				(this.usePopupTrigger || !mxEvent.isPopupTrigger(me.getEvent())) &&
				((!mxEvent.isControlDown(me.getEvent()) &&
					mxEvent.isRightMouseButton(me.getEvent())) ||
					mxEvent.isMiddleMouseButton(me.getEvent())));
	};

	// Ctrl/Cmd+Enter applies editing value except in Safari where Ctrl+Enter creates
	// a new line (while Enter creates a new paragraph and Shift+Enter stops)
	var cellEditorIsStopEditingEvent = graph.cellEditor.isStopEditingEvent;
	graph.cellEditor.isStopEditingEvent = function (evt) {
		return cellEditorIsStopEditingEvent.apply(this, arguments) ||
			(evt.keyCode == 13 && ((!mxClient.IS_SF && mxEvent.isControlDown(evt)) ||
				(mxClient.IS_MAC && mxEvent.isMetaDown(evt)) ||
				(mxClient.IS_SF && mxEvent.isShiftDown(evt))));
	};

	// Switches toolbar for text editing
	var textMode = false;
	var fontMenu = null;
	var sizeMenu = null;
	var nodes = null;

	var ui = this;

	// Overrides cell editor to update toolbar
	var cellEditorStartEditing = graph.cellEditor.startEditing;
	graph.cellEditor.startEditing = function () {
		cellEditorStartEditing.apply(this, arguments);

		if (graph.cellEditor.isContentEditing()) {
			var updating = false;

			var updateCssHandler = function () {
				if (!updating) {
					updating = true;

					window.setTimeout(function () {
						var selectedElement = graph.getSelectedElement();
						var node = selectedElement;

						while (node != null && node.nodeType != mxConstants.NODETYPE_ELEMENT) {
							node = node.parentNode;
						}

						if (node != null) {
							var css = mxUtils.getCurrentStyle(node);

							if (css != null && ui.toolbar != null) {
								// Strips leading and trailing quotes
								var ff = css.fontFamily;

								if (ff.charAt(0) == '\'') {
									ff = ff.substring(1);
								}

								if (ff.charAt(ff.length - 1) == '\'') {
									ff = ff.substring(0, ff.length - 1);
								}

								ui.toolbar.setFontName(ff);
								ui.toolbar.setFontSize(parseInt(css.fontSize));
							}
						}

						updating = false;
					}, 0);
				}
			};

			mxEvent.addListener(graph.cellEditor.textarea, 'input', updateCssHandler);
			mxEvent.addListener(graph.cellEditor.textarea, 'touchend', updateCssHandler);
			mxEvent.addListener(graph.cellEditor.textarea, 'mouseup', updateCssHandler);
			mxEvent.addListener(graph.cellEditor.textarea, 'keyup', updateCssHandler);
			updateCssHandler();
		}
	};

	var cellEditorStopEditing = graph.cellEditor.stopEditing;
	graph.cellEditor.stopEditing = function (cell, trigger) {
		cellEditorStopEditing.apply(this, arguments);
	};

	// Enables scrollbars and sets cursor style for the container
	graph.container.setAttribute('tabindex', '0');
	graph.container.style.cursor = 'default';

	// Workaround for page scroll if embedded via iframe
	if (window.self === window.top && graph.container.parentNode != null) {
		try {
			graph.container.focus();
		} catch (e) {
			// ignores error in old versions of IE
		}
	}

	// Keeps graph container focused on mouse down
	var graphFireMouseEvent = graph.fireMouseEvent;
	graph.fireMouseEvent = function (evtName, me, sender) {
		if (evtName == mxEvent.MOUSE_DOWN) {
			this.container.focus();
			graph.curCell = undefined == me.sourceState ? null : me.sourceState.cell;
			try {
				if (graph.curCell && typeof graph.curCell.referedNodeId != "undefined") {
					graph.curCell = graph.model.cells[graph.curCell.referedNodeId];
				}
				initNodeDetail();
			} catch (e) { }
		}

		graphFireMouseEvent.apply(this, arguments);
	};

	// Configures automatic expand on mouseover
	graph.popupMenuHandler.autoExpand = true;

	// Installs context menu
	if (this.menus != null) {
		graph.popupMenuHandler.factoryMethod = mxUtils.bind(this, function (menu, cell, evt) {
			this.menus.createPopupMenu(menu, cell, evt);
		});
	}

	// Hides context menu
	mxEvent.addGestureListeners(document, mxUtils.bind(this, function (evt) {
		graph.popupMenuHandler.hideMenu();
	}));

	// Create handler for key events
	this.keyHandler = this.createKeyHandler(editor);

	// Getter for key handler
	this.getKeyHandler = function () {
		return keyHandler;
	};

	// Stores the current style and assigns it to new cells
	var styles = ['rounded', 'shadow', 'glass', 'dashed', 'dashPattern', 'comic', 'labelBackgroundColor'];
	var connectStyles = ['shape', 'edgeStyle', 'curved', 'rounded', 'elbow', 'comic', 'jumpStyle', 'jumpSize'];

	// Keys that should be ignored if the cell has a value (known: new default for all cells is html=1 so
	// for the html key this effecticely only works for edges inserted via the connection handler)
	var valueStyles = ['fontFamily', 'fontSize', 'fontColor'];

	// Keys that always update the current edge style regardless of selection
	var alwaysEdgeStyles = ['edgeStyle', 'startArrow', 'startFill', 'startSize', 'endArrow',
		'endFill', 'endSize', 'jettySize', 'orthogonalLoop'];

	// Keys that are ignored together (if one appears all are ignored)
	var keyGroups = [
		['startArrow', 'startFill', 'startSize', 'sourcePerimeterSpacing',
			'endArrow', 'endFill', 'endSize', 'targetPerimeterSpacing',
			'jettySize', 'orthogonalLoop'
		],
		['strokeColor', 'strokeWidth'],
		['fillColor', 'gradientColor'],
		valueStyles, ['opacity'],
		['align'],
		['html']
	];

	// Adds all keys used above to the styles array
	for (var i = 0; i < keyGroups.length; i++) {
		for (var j = 0; j < keyGroups[i].length; j++) {
			styles.push(keyGroups[i][j]);
		}
	}

	for (var i = 0; i < connectStyles.length; i++) {
		if (mxUtils.indexOf(styles, connectStyles[i]) < 0) {
			styles.push(connectStyles[i]);
		}
	}

	// Implements a global current style for edges and vertices that is applied to new cells
	var insertHandler = function (cells, asText) {
		var model = graph.getModel();

		model.beginUpdate();
		try {
			// Applies only basic text styles
			if (asText) {
				var edge = model.isEdge(cell);
				var current = (edge) ? graph.currentEdgeStyle : graph.currentVertexStyle;
				var textStyles = ['fontSize', 'fontFamily', 'fontColor'];

				for (var j = 0; j < textStyles.length; j++) {
					var value = current[textStyles[j]];

					if (value != null) {
						graph.setCellStyles(textStyles[j], value, cells);
					}
				}
			} else {
				for (var i = 0; i < cells.length; i++) {
					var cell = cells[i];

					// Removes styles defined in the cell style from the styles to be applied
					var cellStyle = model.getStyle(cell);
					var tokens = (cellStyle != null) ? cellStyle.split(';') : [];
					var appliedStyles = styles.slice();

					for (var j = 0; j < tokens.length; j++) {
						var tmp = tokens[j];
						var pos = tmp.indexOf('=');

						if (pos >= 0) {
							var key = tmp.substring(0, pos);
							var index = mxUtils.indexOf(appliedStyles, key);

							if (index >= 0) {
								appliedStyles.splice(index, 1);
							}

							// Handles special cases where one defined style ignores other styles
							for (var k = 0; k < keyGroups.length; k++) {
								var group = keyGroups[k];

								if (mxUtils.indexOf(group, key) >= 0) {
									for (var l = 0; l < group.length; l++) {
										var index2 = mxUtils.indexOf(appliedStyles, group[l]);

										if (index2 >= 0) {
											appliedStyles.splice(index2, 1);
										}
									}
								}
							}
						}
					}

					// Applies the current style to the cell
					var edge = model.isEdge(cell);
					var current = (edge) ? graph.currentEdgeStyle : graph.currentVertexStyle;
					var newStyle = model.getStyle(cell);

					for (var j = 0; j < appliedStyles.length; j++) {
						var key = appliedStyles[j];
						var styleValue = current[key];

						if (styleValue != null && (key != 'shape' || edge)) {
							// Special case: Connect styles are not applied here but in the connection handler
							if (!edge || mxUtils.indexOf(connectStyles, key) < 0) {
								newStyle = mxUtils.setStyle(newStyle, key, styleValue);
							}
						}
					}

					model.setStyle(cell, newStyle);
				}
			}
		} finally {
			model.endUpdate();
		}
	};

	graph.addListener('cellsInserted', function (sender, evt) {
		insertHandler(evt.getProperty('cells'));
	});

	graph.addListener('textInserted', function (sender, evt) {
		insertHandler(evt.getProperty('cells'), true);
	});

	graph.connectionHandler.addListener(mxEvent.CONNECT, function (sender, evt) {
		var cells = [evt.getProperty('cell')];

		if (evt.getProperty('terminalInserted')) {
			cells.push(evt.getProperty('terminal'));
		}

		insertHandler(cells);
	});

	this.addListener('styleChanged', mxUtils.bind(this, function (sender, evt) {
		// Checks if edges and/or vertices were modified
		var cells = evt.getProperty('cells');
		var vertex = false;
		var edge = false;

		if (cells.length > 0) {
			for (var i = 0; i < cells.length; i++) {
				vertex = graph.getModel().isVertex(cells[i]) || vertex;
				edge = graph.getModel().isEdge(cells[i]) || edge;

				if (edge && vertex) {
					break;
				}
			}
		} else {
			vertex = true;
			edge = true;
		}

		var keys = evt.getProperty('keys');
		var values = evt.getProperty('values');

		for (var i = 0; i < keys.length; i++) {
			var common = mxUtils.indexOf(valueStyles, keys[i]) >= 0;

			// Ignores transparent stroke colors
			if (keys[i] != 'strokeColor' || (values[i] != null && values[i] != 'none')) {
				// Special case: Edge style and shape
				if (mxUtils.indexOf(connectStyles, keys[i]) >= 0) {
					if (edge || mxUtils.indexOf(alwaysEdgeStyles, keys[i]) >= 0) {
						if (values[i] == null) {
							delete graph.currentEdgeStyle[keys[i]];
						} else {
							graph.currentEdgeStyle[keys[i]] = values[i];
						}
					}
					// Uses style for vertex if defined in styles
					else if (vertex && mxUtils.indexOf(styles, keys[i]) >= 0) {
						if (values[i] == null) {
							delete graph.currentVertexStyle[keys[i]];
						} else {
							graph.currentVertexStyle[keys[i]] = values[i];
						}
					}
				} else if (mxUtils.indexOf(styles, keys[i]) >= 0) {
					if (vertex || common) {
						if (values[i] == null) {
							delete graph.currentVertexStyle[keys[i]];
						} else {
							graph.currentVertexStyle[keys[i]] = values[i];
						}
					}

					if (edge || common || mxUtils.indexOf(alwaysEdgeStyles, keys[i]) >= 0) {
						if (values[i] == null) {
							delete graph.currentEdgeStyle[keys[i]];
						} else {
							graph.currentEdgeStyle[keys[i]] = values[i];
						}
					}
				}
			}
		}

		if (this.toolbar != null) {
			this.toolbar.setFontName(graph.currentVertexStyle['fontFamily'] || Menus.prototype.defaultFont);
			this.toolbar.setFontSize(graph.currentVertexStyle['fontSize'] || Menus.prototype.defaultFontSize);

			if (this.toolbar.edgeStyleMenu != null) {
				// Updates toolbar icon for edge style
				var edgeStyleDiv = this.toolbar.edgeStyleMenu.getElementsByTagName('div')[0];

				if (graph.currentEdgeStyle['edgeStyle'] == 'orthogonalEdgeStyle' && graph.currentEdgeStyle['curved'] == '1') {
					edgeStyleDiv.className = 'geSprite geSprite-curved';
				} else if (graph.currentEdgeStyle['edgeStyle'] == 'straight' || graph.currentEdgeStyle['edgeStyle'] == 'none' ||
					graph.currentEdgeStyle['edgeStyle'] == null) {
					edgeStyleDiv.className = 'geSprite geSprite-straight';
				} else if (graph.currentEdgeStyle['edgeStyle'] == 'entityRelationEdgeStyle') {
					edgeStyleDiv.className = 'geSprite geSprite-entity';
				} else if (graph.currentEdgeStyle['edgeStyle'] == 'elbowEdgeStyle') {
					edgeStyleDiv.className = 'geSprite geSprite-' + ((graph.currentEdgeStyle['elbow'] == 'vertical') ?
						'verticalelbow' : 'horizontalelbow');
				} else if (graph.currentEdgeStyle['edgeStyle'] == 'isometricEdgeStyle') {
					edgeStyleDiv.className = 'geSprite geSprite-' + ((graph.currentEdgeStyle['elbow'] == 'vertical') ?
						'verticalisometric' : 'horizontalisometric');
				} else {
					edgeStyleDiv.className = 'geSprite geSprite-orthogonal';
				}
			}

			if (this.toolbar.edgeShapeMenu != null) {
				// Updates icon for edge shape
				var edgeShapeDiv = this.toolbar.edgeShapeMenu.getElementsByTagName('div')[0];

				if (graph.currentEdgeStyle['shape'] == 'link') {
					edgeShapeDiv.className = 'geSprite geSprite-linkedge';
				} else if (graph.currentEdgeStyle['shape'] == 'flexArrow') {
					edgeShapeDiv.className = 'geSprite geSprite-arrow';
				} else if (graph.currentEdgeStyle['shape'] == 'arrow') {
					edgeShapeDiv.className = 'geSprite geSprite-simplearrow';
				} else {
					edgeShapeDiv.className = 'geSprite geSprite-connection';
				}
			}

			// Updates icon for optinal line start shape
			if (this.toolbar.lineStartMenu != null) {
				var lineStartDiv = this.toolbar.lineStartMenu.getElementsByTagName('div')[0];

				lineStartDiv.className = this.getCssClassForMarker('start',
					graph.currentEdgeStyle['shape'], graph.currentEdgeStyle[mxConstants.STYLE_STARTARROW],
					mxUtils.getValue(graph.currentEdgeStyle, 'startFill', '1'));
			}

			// Updates icon for optinal line end shape
			if (this.toolbar.lineEndMenu != null) {
				var lineEndDiv = this.toolbar.lineEndMenu.getElementsByTagName('div')[0];

				lineEndDiv.className = this.getCssClassForMarker('end',
					graph.currentEdgeStyle['shape'], graph.currentEdgeStyle[mxConstants.STYLE_ENDARROW],
					mxUtils.getValue(graph.currentEdgeStyle, 'endFill', '1'));
			}
		}
	}));

	// Update font size and font family labels
	if (this.toolbar != null) {
		var update = mxUtils.bind(this, function () {
			var ff = graph.currentVertexStyle['fontFamily'] || 'Helvetica';
			var fs = String(graph.currentVertexStyle['fontSize'] || '12');
			var state = graph.getView().getState(graph.getSelectionCell());

			if (state != null) {
				ff = state.style[mxConstants.STYLE_FONTFAMILY] || ff;
				fs = state.style[mxConstants.STYLE_FONTSIZE] || fs;

				if (ff.length > 10) {
					ff = ff.substring(0, 8) + '...';
				}
			}

			this.toolbar.setFontName(ff);
			this.toolbar.setFontSize(fs);
		});

		graph.getSelectionModel().addListener(mxEvent.CHANGE, update);
		graph.getModel().addListener(mxEvent.CHANGE, update);
	}

	// Makes sure the current layer is visible when cells are added
	graph.addListener(mxEvent.CELLS_ADDED, function (sender, evt) {
		var cells = evt.getProperty('cells');
		var parent = evt.getProperty('parent');

		if (graph.getModel().isLayer(parent) && !graph.isCellVisible(parent) && cells != null && cells.length > 0) {
			graph.getModel().setVisible(parent, true);
		}
	});

	// Global handler to hide the current menu
	this.gestureHandler = mxUtils.bind(this, function (evt) {
		if (this.currentMenu != null && mxEvent.getSource(evt) != this.currentMenu.div) {
			this.hideCurrentMenu();
		}
	});

	mxEvent.addGestureListeners(document, this.gestureHandler);

	// Updates the editor UI after the window has been resized or the orientation changes
	// Timeout is workaround for old IE versions which have a delay for DOM client sizes.
	// Should not use delay > 0 to avoid handle multiple repaints during window resize
	this.resizeHandler = mxUtils.bind(this, function () {
		window.setTimeout(mxUtils.bind(this, function () {
			if (this.editor.graph != null) {
				this.refresh();
			}
		}), 0);
	});

	mxEvent.addListener(window, 'resize', this.resizeHandler);

	this.orientationChangeHandler = mxUtils.bind(this, function () {
		this.refresh();
	});

	mxEvent.addListener(window, 'orientationchange', this.orientationChangeHandler);

	// Workaround for bug on iOS see
	// http://stackoverflow.com/questions/19012135/ios-7-ipad-safari-landscape-innerheight-outerheight-layout-issue
	if (mxClient.IS_IOS && !window.navigator.standalone) {
		this.scrollHandler = mxUtils.bind(this, function () {
			window.scrollTo(0, 0);
		});

		mxEvent.addListener(window, 'scroll', this.scrollHandler);
	}

	/**
	 * Sets the initial scrollbar locations after a file was loaded.
	 */
	this.editor.addListener('resetGraphView', mxUtils.bind(this, function () {
		this.resetScrollbars();
	}));

	/**
	 * Repaints the grid.
	 */
	this.addListener('gridEnabledChanged', mxUtils.bind(this, function () {
		graph.view.validateBackground();
	}));

	this.addListener('backgroundColorChanged', mxUtils.bind(this, function () {
		graph.view.validateBackground();
	}));

	/**
	 * Repaints the grid.
	 */
	graph.addListener('gridSizeChanged', mxUtils.bind(this, function () {
		if (graph.isGridEnabled()) {
			graph.view.validateBackground();
		}
	}));

	// Resets UI, updates action and menu states
	this.editor.resetGraph();
	this.init();
	this.open();

	//节点预执行，获取节点所含字段
	graph.preExeGetFields = function (cell, treeNode) {
		var isCreateTableNodeError = false;
		$.ajax({
			type: "post",
			url: "/data/tableMeta/getCols",
			dataType: "json",
			async: false,
			data: {
				"tableMetaUuid": treeNode.id,
				"isEnclose": "1"
			},
			success: function (e) {
				var nodeExcuteStatus = 3;//默认执行成功
				if (e.data == null) {
					isCreateTableNodeError = true;
					alert("获取数据表【" + cell.value + "】信息失败,无法创建数据表节点");
					nodeExcuteStatus = 4;//执行失败
				} else {
					var columnsInfo = [];
					var nodeSql = "SELECT";
					for (var i = 0; i < e.data.length; i++) {
						var columnName = e.data[i].colName;
						var newColumnName = e.data[i].chnName?e.data[i].chnName:columnName;
						columnsInfo.push({
							"columnName": columnName,
							"columnType": e.data[i].dataType,
							"columnLength": e.data[i].dataLength,
							"isOutputColumn": 1,
							"newColumnName": newColumnName,
						});
						if (i === e.data.length - 1) {
							nodeSql += e.data[i].chnName? " " + columnName + " AS " + e.data[i].chnName:" " + columnName;
						} else {
							nodeSql += e.data[i].chnName? " " + columnName + " AS " + e.data[i].chnName + ",":" " + columnName + ",";
						}
					}
					console.log(treeNode)
					nodeSql += treeNode.english ? " FROM " + treeNode.english+" AS " + treeNode.name : " FROM " + treeNode.name;
					console.log(nodeSql)
					graph.nodeData[cell.id].nodeInfo.nodeSql = nodeSql;
					graph.nodeData[cell.id].columnsInfo = columnsInfo;
				}
				graph.nodeData[cell.id].nodeInfo.nodeExcuteStatus = nodeExcuteStatus;
			}
		});
		return isCreateTableNodeError;
	};
	return this;
};


// Extends mxEventSource
mxUtils.extend(EditorUi, mxEventSource);

/**
 * Global config that specifies if the compact UI elements should be used.
 */
EditorUi.compactUi = true;

/**
 * Specifies the size of the split bar.
 */
EditorUi.prototype.splitSize = (mxClient.IS_TOUCH || mxClient.IS_POINTER) ? 6 : 6;

EditorUi.prototype.sidebarWidth = 240;

EditorUi.prototype.resultHeight = 335;

EditorUi.prototype.resultContentHeight = 225;

EditorUi.prototype.scrollBarHeight = 0;

EditorUi.prototype.detailContainerWidth = 300;

EditorUi.prototype.leftMenuWidth = 0;//系统右侧区域距离左侧菜单栏的边距
/**
 * Specifies the width of the format panel. Default is 240.
 */
EditorUi.prototype.formatWidth = 240;

/**
 * Specifies the height of the toolbar. Default is 36.
 */
EditorUi.prototype.toolbarHeight = 120;

/**
 * Specifies if animations are allowed in <executeLayout>. Default is true.
 */
EditorUi.prototype.allowAnimation = true;

/**
 * Installs the listeners to update the action states.
 */
EditorUi.prototype.init = function () {
	/**
	 * Keypress starts immediate editing on selection cell
	 */
	var graph = this.editor.graph;

	mxEvent.addListener(graph.container, 'keydown', mxUtils.bind(this, function (evt) {
		this.onKeyDown(evt);
	}));
	mxEvent.addListener(graph.container, 'keypress', mxUtils.bind(this, function (evt) {
		this.onKeyPress(evt);
	}));

	// Updates action states
	this.addUndoListener();
	this.addBeforeUnloadListener();

	graph.getSelectionModel().addListener(mxEvent.CHANGE, mxUtils.bind(this, function () {
		this.updateActionStates();
	}));

	graph.getModel().addListener(mxEvent.CHANGE, mxUtils.bind(this, function () {
		this.updateActionStates();
	}));

	// Changes action states after change of default parent
	var graphSetDefaultParent = graph.setDefaultParent;
	var ui = this;

	this.editor.graph.setDefaultParent = function () {
		graphSetDefaultParent.apply(this, arguments);
		ui.updateActionStates();
	};

	this.updateActionStates();
	this.initClipboard();
	this.initCanvas();

	if (this.format != null) {
		this.format.init();
	}
};

/**
 * Returns true if the given event should start editing. This implementation returns true.
 */
EditorUi.prototype.onKeyDown = function (evt) {
	var graph = this.editor.graph;

	// Tab selects next cell
	if (evt.which == 9 && graph.isEnabled() && !mxEvent.isAltDown(evt)) {
		if (graph.isEditing()) {
			graph.stopEditing(false);
		} else {
			graph.selectCell(!mxEvent.isShiftDown(evt));
		}

		mxEvent.consume(evt);
	}
};

/**
 * Returns true if the given event should start editing. This implementation returns true.
 */
EditorUi.prototype.onKeyPress = function (evt) {
	var graph = this.editor.graph;

	// KNOWN: Focus does not work if label is empty in quirks mode
	if (this.isImmediateEditingEvent(evt) && !graph.isEditing() && !graph.isSelectionEmpty() && evt.which !== 0 &&
		!mxEvent.isAltDown(evt) && !mxEvent.isControlDown(evt) && !mxEvent.isMetaDown(evt)) {
		graph.escape();
		graph.startEditing();

		// Workaround for FF where char is lost if cursor is placed before char
		if (mxClient.IS_FF) {
			var ce = graph.cellEditor;
			ce.textarea.innerHTML = String.fromCharCode(evt.which);

			// Moves cursor to end of textarea
			var range = document.createRange();
			range.selectNodeContents(ce.textarea);
			range.collapse(false);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}
};

/**
 * Returns true if the given event should start editing. This implementation returns true.
 */
EditorUi.prototype.isImmediateEditingEvent = function (evt) {
	return true;
};

/**
 * Private helper method.
 */
EditorUi.prototype.getCssClassForMarker = function (prefix, shape, marker, fill) {
	var result = '';

	if (shape == 'flexArrow') {
		result = (marker != null && marker != mxConstants.NONE) ?
			'geSprite geSprite-' + prefix + 'blocktrans' : 'geSprite geSprite-noarrow';
	} else {
		if (marker == mxConstants.ARROW_CLASSIC) {
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'classic' : 'geSprite geSprite-' + prefix + 'classictrans';
		} else if (marker == mxConstants.ARROW_CLASSIC_THIN) {
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'classicthin' : 'geSprite geSprite-' + prefix + 'classicthintrans';
		} else if (marker == mxConstants.ARROW_OPEN) {
			result = 'geSprite geSprite-' + prefix + 'open';
		} else if (marker == mxConstants.ARROW_OPEN_THIN) {
			result = 'geSprite geSprite-' + prefix + 'openthin';
		} else if (marker == mxConstants.ARROW_BLOCK) {
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'block' : 'geSprite geSprite-' + prefix + 'blocktrans';
		} else if (marker == mxConstants.ARROW_BLOCK_THIN) {
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'blockthin' : 'geSprite geSprite-' + prefix + 'blockthintrans';
		} else if (marker == mxConstants.ARROW_OVAL) {
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'oval' : 'geSprite geSprite-' + prefix + 'ovaltrans';
		} else if (marker == mxConstants.ARROW_DIAMOND) {
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'diamond' : 'geSprite geSprite-' + prefix + 'diamondtrans';
		} else if (marker == mxConstants.ARROW_DIAMOND_THIN) {
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'thindiamond' : 'geSprite geSprite-' + prefix + 'thindiamondtrans';
		} else if (marker == 'openAsync') {
			result = 'geSprite geSprite-' + prefix + 'openasync';
		} else if (marker == 'dash') {
			result = 'geSprite geSprite-' + prefix + 'dash';
		} else if (marker == 'cross') {
			result = 'geSprite geSprite-' + prefix + 'cross';
		} else if (marker == 'async') {
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'async' : 'geSprite geSprite-' + prefix + 'asynctrans';
		} else if (marker == 'circle' || marker == 'circlePlus') {
			result = (fill == '1' || marker == 'circle') ? 'geSprite geSprite-' + prefix + 'circle' : 'geSprite geSprite-' + prefix + 'circleplus';
		} else if (marker == 'ERone') {
			result = 'geSprite geSprite-' + prefix + 'erone';
		} else if (marker == 'ERmandOne') {
			result = 'geSprite geSprite-' + prefix + 'eronetoone';
		} else if (marker == 'ERmany') {
			result = 'geSprite geSprite-' + prefix + 'ermany';
		} else if (marker == 'ERoneToMany') {
			result = 'geSprite geSprite-' + prefix + 'eronetomany';
		} else if (marker == 'ERzeroToOne') {
			result = 'geSprite geSprite-' + prefix + 'eroneopt';
		} else if (marker == 'ERzeroToMany') {
			result = 'geSprite geSprite-' + prefix + 'ermanyopt';
		} else {
			result = 'geSprite geSprite-noarrow';
		}
	}

	return result;
};

/**
 * Overridden in Menus.js
 */
EditorUi.prototype.createMenus = function () {
	return null;
};

/**
 * Hook for allowing selection and context menu for certain events.
 */
EditorUi.prototype.updatePasteActionStates = function () {
	var graph = this.editor.graph;
	var paste = this.actions.get('paste');
	paste.setEnabled(this.editor.graph.cellEditor.isContentEditing() || (!mxClipboard.isEmpty() &&
		graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())));
};

/**
 * Hook for allowing selection and context menu for certain events.
 */
EditorUi.prototype.initClipboard = function () {
	var ui = this;

	var mxClipboardCut = mxClipboard.cut;
	mxClipboard.cut = function (graph) {
		if (graph.cellEditor.isContentEditing()) {
			document.execCommand('cut', false, null);
		} else {
			mxClipboardCut.apply(this, arguments);
		}

		ui.updatePasteActionStates();
	};

	var mxClipboardCopy = mxClipboard.copy;
	mxClipboard.copy = function (graph) {
		if (graph.cellEditor.isContentEditing()) {
			document.execCommand('copy', false, null);
		} else {
			mxClipboardCopy.apply(this, arguments);
		}

		ui.updatePasteActionStates();
	};

	var mxClipboardPaste = mxClipboard.paste;
	mxClipboard.paste = function (graph) {
		var result = null;

		if (graph.cellEditor.isContentEditing()) {
			document.execCommand('paste', false, null);
		} else {
			result = mxClipboardPaste.apply(this, arguments);
		}

		ui.updatePasteActionStates();

		return result;
	};

	// Overrides cell editor to update paste action state
	var cellEditorStartEditing = this.editor.graph.cellEditor.startEditing;

	this.editor.graph.cellEditor.startEditing = function () {
		cellEditorStartEditing.apply(this, arguments);
		ui.updatePasteActionStates();
	};

	var cellEditorStopEditing = this.editor.graph.cellEditor.stopEditing;

	this.editor.graph.cellEditor.stopEditing = function (cell, trigger) {
		cellEditorStopEditing.apply(this, arguments);
		ui.updatePasteActionStates();
	};

	this.updatePasteActionStates();
};

/**
 * Initializes the infinite canvas.
 */
EditorUi.prototype.lazyZoomDelay = 20;

/**
 * Initializes the infinite canvas.
 */
EditorUi.prototype.initCanvas = function () {
	// Initial page layout view, scrollBuffer and timer-based scrolling
	var graph = this.editor.graph;
	graph.timerAutoScroll = true;

	/**
	 * Returns the padding for pages in page view with scrollbars.
	 */
	graph.getPagePadding = function () {
		return new mxPoint(Math.max(0, Math.round(/*(graph.container.offsetWidth - 34) / graph.view.scale*/0)),
			Math.max(0, Math.round(/*(graph.container.offsetHeight - 34) / graph.view.scale*/0)));
	};

	// Fits the number of background pages to the graph
	graph.view.getBackgroundPageBounds = function () {
		var layout = this.graph.getPageLayout();
		var page = this.graph.getPageSize();

		return new mxRectangle(this.scale * (this.translate.x + layout.x * page.width),
			this.scale * (this.translate.y + layout.y * page.height),
			this.scale * layout.width * page.width,
			this.scale * layout.height * page.height);
	};

	graph.getPreferredPageSize = function (bounds, width, height) {
		var pages = this.getPageLayout();
		var size = this.getPageSize();

		return new mxRectangle(0, 0, pages.width * size.width, pages.height * size.height);
	};

	// Scales pages/graph to fit available size
	var resize = null;
	var ui = this;

	//-------------------------------------------------------------------------------------
	if (this.editor.extendCanvas) {
		/**
		 * Guesses autoTranslate to avoid another repaint (see below).
		 * Works if only the scale of the graph changes or if pages
		 * are visible and the visible pages do not change.
		 */
		var graphViewValidate = graph.view.validate;
		graph.view.validate = function () {
			if (this.graph.container != null && mxUtils.hasScrollbars(this.graph.container)) {
				var pad = this.graph.getPagePadding();
				var size = this.graph.getPageSize();

				// Updating scrollbars here causes flickering in quirks and is not needed
				// if zoom method is always used to set the current scale on the graph.
				var tx = this.translate.x;
				var ty = this.translate.y;
				this.translate.x = pad.x - (this.x0 || 0) * size.width;
				this.translate.y = pad.y - (this.y0 || 0) * size.height;
			}

			graphViewValidate.apply(this, arguments);
		};

		var graphSizeDidChange = graph.sizeDidChange;
		graph.sizeDidChange = function () {
			if (this.container != null && mxUtils.hasScrollbars(this.container)) {
				var pages = this.getPageLayout();
				var pad = this.getPagePadding();
				var size = this.getPageSize();

				// Updates the minimum graph size
				var minw = Math.ceil(2 * pad.x + pages.width * size.width);
				var minh = Math.ceil(2 * pad.y + pages.height * size.height);

				var min = graph.minimumGraphSize;

				// LATER: Fix flicker of scrollbar size in IE quirks mode
				// after delayed call in window.resize event handler
				if (min == null || min.width != minw || min.height != minh) {
					graph.minimumGraphSize = new mxRectangle(0, 0, minw, minh);
				}

				// Updates auto-translate to include padding and graph size
				var dx = pad.x - pages.x * size.width;
				var dy = pad.y - pages.y * size.height;

				if (!this.autoTranslate && (this.view.translate.x != dx || this.view.translate.y != dy)) {
					this.autoTranslate = true;
					this.view.x0 = pages.x;
					this.view.y0 = pages.y;

					// NOTE: THIS INVOKES THIS METHOD AGAIN. UNFORTUNATELY THERE IS NO WAY AROUND THIS SINCE THE
					// BOUNDS ARE KNOWN AFTER THE VALIDATION AND SETTING THE TRANSLATE TRIGGERS A REVALIDATION.
					// SHOULD MOVE TRANSLATE/SCALE TO VIEW.
					var tx = graph.view.translate.x;
					var ty = graph.view.translate.y;
					graph.view.setTranslate(dx, dy);

					// LATER: Fix rounding errors for small zoom
					graph.container.scrollLeft += Math.round((dx - tx) * graph.view.scale);
					graph.container.scrollTop += Math.round((dy - ty) * graph.view.scale);

					this.autoTranslate = false;

					return;
				}

				graphSizeDidChange.apply(this, arguments);
			}
		};
	}

	// Accumulates the zoom factor while the rendering is taking place
	// so that not the complete sequence of zoom steps must be painted
	graph.updateZoomTimeout = null;
	graph.cumulativeZoomFactor = 1;

	var cursorPosition = null;

	graph.lazyZoom = function (zoomIn) {
		if (this.updateZoomTimeout != null) {
			window.clearTimeout(this.updateZoomTimeout);
		}

		// Switches to 1% zoom steps below 15%
		// Lower bound depdends on rounding below
		if (zoomIn) {
			if (this.view.scale * this.cumulativeZoomFactor < 0.15) {
				this.cumulativeZoomFactor = (this.view.scale + 0.01) / this.view.scale;
			} else {
				// Uses to 5% zoom steps for better grid rendering in webkit
				// and to avoid rounding errors for zoom steps
				this.cumulativeZoomFactor *= this.zoomFactor;
				this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor * 20) / 20 / this.view.scale;
			}
		} else {
			if (this.view.scale * this.cumulativeZoomFactor <= 0.15) {
				this.cumulativeZoomFactor = (this.view.scale - 0.01) / this.view.scale;
			} else {
				// Uses to 5% zoom steps for better grid rendering in webkit
				// and to avoid rounding errors for zoom steps
				this.cumulativeZoomFactor /= this.zoomFactor;
				this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor * 20) / 20 / this.view.scale;
			}
		}

		this.cumulativeZoomFactor = Math.max(0.01, Math.min(this.view.scale * this.cumulativeZoomFactor, 160) / this.view.scale);

		this.updateZoomTimeout = window.setTimeout(mxUtils.bind(this, function () {
			var offset = mxUtils.getOffset(graph.container);
			var dx = 0;
			var dy = 0;

			if (cursorPosition != null) {
				dx = graph.container.offsetWidth / 2 - cursorPosition.x + offset.x;
				dy = graph.container.offsetHeight / 2 - cursorPosition.y + offset.y;
			}

			var prev = this.view.scale;
			this.zoom(this.cumulativeZoomFactor);
			var s = this.view.scale;

			if (s != prev) {
				if (resize != null) {
					ui.chromelessResize(false, null, dx * (this.cumulativeZoomFactor - 1),
						dy * (this.cumulativeZoomFactor - 1));
				}

				if (mxUtils.hasScrollbars(graph.container) && (dx != 0 || dy != 0)) {
					graph.container.scrollLeft -= dx * (this.cumulativeZoomFactor - 1);
					graph.container.scrollTop -= dy * (this.cumulativeZoomFactor - 1);
				}
			}

			this.cumulativeZoomFactor = 1;
			this.updateZoomTimeout = null;
		}), this.lazyZoomDelay);
	};

	mxEvent.addMouseWheelListener(mxUtils.bind(this, function (evt, up) {
		// Ctrl+wheel (or pinch on touchpad) is a native browser zoom event is OS X
		// LATER: Add support for zoom via pinch on trackpad for Chrome in OS X
		if ((this.dialogs == null || this.dialogs.length == 0) && graph.isZoomWheelEvent(evt)) {
			var source = mxEvent.getSource(evt);

			while (source != null) {
				if (source == graph.container) {
					cursorPosition = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
					graph.lazyZoom(up);
					mxEvent.consume(evt);

					return;
				}

				source = source.parentNode;
			}
		}
	}));
};

/**
 * Hook for allowing selection and context menu for certain events.
 */
EditorUi.prototype.isSelectionAllowed = function (evt) {
	return mxEvent.getSource(evt).nodeName == 'SELECT' || (mxEvent.getSource(evt).nodeName == 'INPUT' &&
		mxUtils.isAncestorNode(null, mxEvent.getSource(evt)));
};

/**
 * Installs dialog if browser window is closed without saving
 * This must be disabled during save and image export.
 */
EditorUi.prototype.addBeforeUnloadListener = function () {
	// Installs dialog if browser window is closed without saving
	// This must be disabled during save and image export
	window.onbeforeunload = mxUtils.bind(this, function () {
		return this.onBeforeUnload();
	});
};

/**
 * Sets the onbeforeunload for the application
 */
EditorUi.prototype.onBeforeUnload = function () {
	/*if(this.editor.modified) {
		return mxResources.get('allChangesLost');
	}*/
};

/**
 * 通过窗口打开当前关系图
 */
EditorUi.prototype.open = function () {
	this.editor.graph.view.validate();

	this.editor.graph.sizeDidChange();
	this.editor.fireEvent(new mxEventObject('resetGraphView'));
};

/**
 * Sets the current menu and element.
 */
EditorUi.prototype.setCurrentMenu = function (menu, elt) {
	this.currentMenuElt = elt;
	this.currentMenu = menu;
};

/**
 * Resets the current menu and element.
 */
EditorUi.prototype.resetCurrentMenu = function () {
	this.currentMenuElt = null;
	this.currentMenu = null;
};

/**
 * Hides and destroys the current menu.
 */
EditorUi.prototype.hideCurrentMenu = function () {
	if (this.currentMenu != null) {
		this.currentMenu.hideMenu();
		this.resetCurrentMenu();
	}
};

/**
 * Updates the document title.
 */
/*EditorUi.prototype.updateDocumentTitle = function() {
	var title = this.editor.getOrCreateFilename();

	if(this.editor.appName != null) {
		title += ' - ' + this.editor.appName;
	}

	document.title = title;
};
*/
/**
 * Updates the document title.
 */
EditorUi.prototype.createHoverIcons = function () {
	return new HoverIcons(this.editor.graph);
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
EditorUi.prototype.redo = function () {
	try {
		var graph = this.editor.graph;

		if (graph.isEditing()) {
			document.execCommand('redo', false, null);
		} else {
			this.editor.undoManager.redo();
		}
	} catch (e) {
		// ignore all errors
	}
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
EditorUi.prototype.undo = function () {
	try {
		var graph = this.editor.graph;
		if (graph.isEditing()) {
			// Stops editing and executes undo on graph if native undo
			// does not affect current editing value
			var value = graph.cellEditor.textarea.innerHTML;
			document.execCommand('undo', false, null);

			if (value == graph.cellEditor.textarea.innerHTML) {
				graph.stopEditing(true);
				this.editor.undoManager.undo();
			}
		} else {
			this.editor.undoManager.undo();
		}
	} catch (e) {
		// ignore all errors
	}
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
EditorUi.prototype.canRedo = function () {
	return this.editor.graph.isEditing() || this.editor.undoManager.canRedo();
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
EditorUi.prototype.canUndo = function () {
	return this.editor.graph.isEditing() || this.editor.undoManager.canUndo();
};

/**
 *
 */
EditorUi.prototype.getEditBlankXml = function () {
	return mxUtils.getXml(this.editor.getGraphXml());
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
EditorUi.prototype.getUrl = function (pathname) {
	var href = (pathname != null) ? pathname : window.location.pathname;
	var parms = (href.indexOf('?') > 0) ? 1 : 0;

	// Removes template URL parameter for new blank diagram
	for (var key in urlParams) {
		if (parms == 0) {
			href += '?';
		} else {
			href += '&';
		}

		href += key + '=' + urlParams[key];
		parms++;
	}

	return href;
};

/**
 * Specifies if the graph has scrollbars.
 */
EditorUi.prototype.setScrollbars = function (value) {
	var graph = this.editor.graph;
	var prev = graph.container.style.overflow;
	graph.scrollbars = value;
	this.editor.updateGraphComponents();

	if (prev != graph.container.style.overflow) {
		if (graph.container.style.overflow == 'hidden') {
			var t = graph.view.translate;
			graph.view.setTranslate(t.x - graph.container.scrollLeft / graph.view.scale, t.y - graph.container.scrollTop / graph.view.scale);
			graph.container.scrollLeft = 0;
			graph.container.scrollTop = 0;
			graph.minimumGraphSize = null;
			graph.sizeDidChange();
		} else {
			var dx = graph.view.translate.x;
			var dy = graph.view.translate.y;

			graph.view.translate.x = 0;
			graph.view.translate.y = 0;
			graph.sizeDidChange();
			graph.container.scrollLeft -= Math.round(dx * graph.view.scale);
			graph.container.scrollTop -= Math.round(dy * graph.view.scale);
		}
	}

	this.fireEvent(new mxEventObject('scrollbarsChanged'));
};

/**
 * Returns true if the graph has scrollbars.
 */
EditorUi.prototype.hasScrollbars = function () {
	return this.editor.graph.scrollbars;
};

/**
 * Resets the state of the scrollbars.
 */
EditorUi.prototype.resetScrollbars = function () {
	var graph = this.editor.graph;

	if (this.editor.extendCanvas) {
		if (mxUtils.hasScrollbars(graph.container)) {
			if (graph.pageVisible) {
				var pad = graph.getPagePadding();
				graph.container.scrollTop = Math.floor(pad.y - this.editor.initialTopSpacing) - 1;
				graph.container.scrollLeft = Math.floor(Math.min(pad.x,
					(graph.container.scrollWidth - graph.container.clientWidth) / 2)) - 1;

				// Scrolls graph to visible area
				var bounds = graph.getGraphBounds();

				if (bounds.width > 0 && bounds.height > 0) {
					if (bounds.x > graph.container.scrollLeft + graph.container.clientWidth * 0.9) {
						graph.container.scrollLeft = Math.min(bounds.x + bounds.width - graph.container.clientWidth, bounds.x - 10);
					}

					if (bounds.y > graph.container.scrollTop + graph.container.clientHeight * 0.9) {
						graph.container.scrollTop = Math.min(bounds.y + bounds.height - graph.container.clientHeight, bounds.y - 10);
					}
				}
			} else {
				var bounds = graph.getGraphBounds();
				var width = Math.max(bounds.width, graph.scrollTileSize.width * graph.view.scale);
				var height = Math.max(bounds.height, graph.scrollTileSize.height * graph.view.scale);
				graph.container.scrollTop = Math.floor(Math.max(0, bounds.y - Math.max(20, (graph.container.clientHeight - height) / 4)));
				graph.container.scrollLeft = Math.floor(Math.max(0, bounds.x - Math.max(0, (graph.container.clientWidth - width) / 2)));
			}
		} else {
			// This code is not actively used since the default for scrollbars is always true
			if (graph.pageVisible) {
				var b = graph.view.getBackgroundPageBounds();
				graph.view.setTranslate(Math.floor(Math.max(0, (graph.container.clientWidth - b.width) / 2) - b.x),
					Math.floor(Math.max(0, (graph.container.clientHeight - b.height) / 2) - b.y));
			} else {
				var bounds = graph.getGraphBounds();
				graph.view.setTranslate(Math.floor(Math.max(0, Math.max(0, (graph.container.clientWidth - bounds.width) / 2) - bounds.x)),
					Math.floor(Math.max(0, Math.max(20, (graph.container.clientHeight - bounds.height) / 4)) - bounds.y));
			}
		}
	}
};

/**
 * Loads the stylesheet for this graph.
 */
EditorUi.prototype.setPageVisible = function (value) {
	var graph = this.editor.graph;
	var hasScrollbars = mxUtils.hasScrollbars(graph.container);
	var tx = 0;
	var ty = 0;

	if (hasScrollbars) {
		tx = graph.view.translate.x * graph.view.scale - graph.container.scrollLeft;
		ty = graph.view.translate.y * graph.view.scale - graph.container.scrollTop;
	}

	graph.pageVisible = value;
	graph.pageBreaksVisible = value;
	graph.preferPageSize = value;
	graph.view.validateBackground();

	// Workaround for possible handle offset
	if (hasScrollbars) {
		var cells = graph.getSelectionCells();
		graph.clearSelection();
		graph.setSelectionCells(cells);
	}

	// Calls updatePageBreaks
	graph.sizeDidChange();

	if (hasScrollbars) {
		graph.container.scrollLeft = graph.view.translate.x * graph.view.scale - tx;
		graph.container.scrollTop = graph.view.translate.y * graph.view.scale - ty;
	}

	this.fireEvent(new mxEventObject('pageViewChanged'));
};

/**
 * Change types
 */
function ChangePageSetup(ui, color, image, format) {
	this.ui = ui;
	this.color = color;
	this.previousColor = color;
	this.image = image;
	this.previousImage = image;
	this.format = format;
	this.previousFormat = format;

	// Needed since null are valid values for color and image
	this.ignoreColor = false;
	this.ignoreImage = false;
}

/**
 * Implementation of the undoable page rename.
 */
ChangePageSetup.prototype.execute = function () {
	var graph = this.ui.editor.graph;
	var tmp;
	if (!this.ignoreColor) {
		this.color = this.previousColor;
		tmp = graph.background;
		this.ui.setBackgroundColor(this.previousColor);
		this.previousColor = tmp;
	}

	if (!this.ignoreImage) {
		this.image = this.previousImage;
		tmp = graph.backgroundImage;
		this.ui.setBackgroundImage(this.previousImage);
		this.previousImage = tmp;
	}

	if (this.previousFormat != null) {
		this.format = this.previousFormat;
		tmp = graph.pageFormat;

		if (this.previousFormat.width != tmp.width ||
			this.previousFormat.height != tmp.height) {
			this.ui.setPageFormat(this.previousFormat);
			this.previousFormat = tmp;
		}
	}

	if (this.foldingEnabled != null && this.foldingEnabled != this.ui.editor.graph.foldingEnabled) {
		this.ui.setFoldingEnabled(this.foldingEnabled);
		this.foldingEnabled = !this.foldingEnabled;
	}
};

// Registers codec for ChangePageSetup
(function () {
	var codec = new mxObjectCodec(new ChangePageSetup(), ['ui', 'previousColor', 'previousImage', 'previousFormat']);

	codec.afterDecode = function (dec, node, obj) {
		obj.previousColor = obj.color;
		obj.previousImage = obj.image;
		obj.previousFormat = obj.format;

		if (obj.foldingEnabled != null) {
			obj.foldingEnabled = !obj.foldingEnabled;
		}

		return obj;
	};

	mxCodecRegistry.register(codec);
})();

/**
 * Loads the stylesheet for this graph.
 */
EditorUi.prototype.setBackgroundColor = function (value) {
	this.editor.graph.background = value;
	this.editor.graph.view.validateBackground();

	this.fireEvent(new mxEventObject('backgroundColorChanged'));
};

/**
 * Loads the stylesheet for this graph.
 */
EditorUi.prototype.setFoldingEnabled = function (value) {
	this.editor.graph.foldingEnabled = value;
	this.editor.graph.view.revalidate();

	this.fireEvent(new mxEventObject('foldingEnabledChanged'));
};

/**
 * Loads the stylesheet for this graph.
 */
EditorUi.prototype.setPageFormat = function (value) {
	this.editor.graph.pageFormat = value;

	if (!this.editor.graph.pageVisible) {
		this.actions.get('pageView').funct();
	} else {
		this.editor.graph.view.validateBackground();
		this.editor.graph.sizeDidChange();
	}

	this.fireEvent(new mxEventObject('pageFormatChanged'));
};

/**
 * Loads the stylesheet for this graph.
 */
EditorUi.prototype.setPageScale = function (value) {
	this.editor.graph.pageScale = value;

	if (!this.editor.graph.pageVisible) {
		this.actions.get('pageView').funct();
	} else {
		this.editor.graph.view.validateBackground();
		this.editor.graph.sizeDidChange();
	}

	this.fireEvent(new mxEventObject('pageScaleChanged'));
};

/**
 * Loads the stylesheet for this graph.
 */
EditorUi.prototype.setGridColor = function (value) {
	this.editor.graph.view.gridColor = value;
	this.editor.graph.view.validateBackground();
	this.fireEvent(new mxEventObject('gridColorChanged'));
};

/**
 * Updates the states of the given undo/redo items.
 */
EditorUi.prototype.addUndoListener = function () {
	var undo = this.actions.get('undo');
	var redo = this.actions.get('redo');

	var undoMgr = this.editor.undoManager;

	var undoListener = mxUtils.bind(this, function () {
		undo.setEnabled(this.canUndo());
		redo.setEnabled(this.canRedo());
	});

	undoMgr.addListener(mxEvent.ADD, undoListener);
	undoMgr.addListener(mxEvent.UNDO, undoListener);
	undoMgr.addListener(mxEvent.REDO, undoListener);
	undoMgr.addListener(mxEvent.CLEAR, undoListener);

	// Overrides cell editor to update action states
	var cellEditorStartEditing = this.editor.graph.cellEditor.startEditing;

	this.editor.graph.cellEditor.startEditing = function () {
		cellEditorStartEditing.apply(this, arguments);
		undoListener();
	};

	var cellEditorStopEditing = this.editor.graph.cellEditor.stopEditing;

	this.editor.graph.cellEditor.stopEditing = function (cell, trigger) {
		cellEditorStopEditing.apply(this, arguments);
		undoListener();
	};

	// Updates the button states once
	undoListener();
};

/**
 * Updates the states of the given toolbar items based on the selection.
 */
EditorUi.prototype.updateActionStates = function () {
	var graph = this.editor.graph;
	var selected = !graph.isSelectionEmpty();
	var vertexSelected = false;
	var edgeSelected = false;

	var cells = graph.getSelectionCells();

	if (cells != null) {
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];

			if (graph.getModel().isEdge(cell)) {
				edgeSelected = true;
			}

			if (graph.getModel().isVertex(cell)) {
				vertexSelected = true;
			}

			if (edgeSelected && vertexSelected) {
				break;
			}
		}
	}

	// Updates action states
	var actions = ['cut', 'copy', 'delete'
		/*'toFront', 'toBack',*/
	];

	for (var i = 0; i < actions.length; i++) {
		this.actions.get(actions[i]).setEnabled(selected);
	}

	this.actions.get('turn').setEnabled(!graph.isSelectionEmpty());
	this.actions.get('curved').setEnabled(edgeSelected);
	var oneVertexSelected = vertexSelected && graph.getSelectionCount() == 1;
	this.actions.get('group').setEnabled(graph.getSelectionCount() > 1 ||
		(oneVertexSelected && !graph.isContainer(graph.getSelectionCell())));
	this.actions.get('ungroup').setEnabled(graph.getSelectionCount() == 1 &&
		(graph.getModel().getChildCount(graph.getSelectionCell()) > 0 ||
			(oneVertexSelected && graph.isContainer(graph.getSelectionCell()))));
	this.actions.get('removeFromGroup').setEnabled(oneVertexSelected &&
		graph.getModel().isVertex(graph.getModel().getParent(graph.getSelectionCell())));

	// Updates menu states
	var state = graph.view.getState(graph.getSelectionCell());
	var foldable = graph.getSelectionCount() == 1 && graph.isCellFoldable(graph.getSelectionCell());
	this.actions.get('guides').setEnabled(graph.isEnabled());
	this.actions.get('grid').setEnabled(!this.editor.chromeless || this.editor.editable);

	var unlocked = graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent());
	this.actions.get('selectVertices').setEnabled(unlocked);
	this.actions.get('selectEdges').setEnabled(unlocked);
	this.actions.get('selectAll').setEnabled(unlocked);
	this.actions.get('selectNone').setEnabled(unlocked);
	this.updatePasteActionStates();
};

/**
 * Refreshes the viewport.
 */
EditorUi.prototype.refresh = function (sizeDidChange) {
	var w = this.container.clientWidth;
	var h = this.container.clientHeight;

	if (mxClient.IS_IOS && !window.navigator.standalone) {
		if (window.innerHeight !== document.documentElement.clientHeight) {
			window.scrollTo(0, 0);
		}
	}
	var dw = this.graphToolDiv.clientWidth;
	this.hsplitPosition = typeof this.hsplitPosition !== "undefined" ? this.hsplitPosition : this.sidebarWidth;
	var effHsplitPosition = Math.max(0, Math.min(this.hsplitPosition, dw - this.splitSize - 20));
	if (this.sidebarContainer) {
		this.sidebarContainer.style.width = effHsplitPosition + 'px';
	}
	this.sidebarContainer.style.height = h + "px";
	this.container.style.width = ($(this.graphToolDiv).width() - this.hsplitPosition - this.detailContainerWidth - this.splitSize) + "px";
	this.vsplit.style.left = $(this.sidebarContainer).width() + $(this.graphToolDiv).offset().left + this.splitSize + "px";
	this.vsplit.style.width = ($(this.graphToolDiv).width() - this.hsplitPosition - this.detailContainerWidth - this.splitSize) + "px";
	this.detailContainer.style.height = this.sidebarContainer.style.height;
	this.detailContainer.style.bottom = this.sidebarContainer.style.height;
	this.container.style.left = (effHsplitPosition + this.splitSize) + 'px';
	this.hsplit.style.left = effHsplitPosition + "px";
};
/**
 * Refreshes the viewport.
 */
EditorUi.prototype.refreshv = function (sizeDidChange) {
	var h = document.documentElement.clientHeight;
	//距底部距离
	var effVsplitPosition = Math.max(1, Math.min(this.vsplitPosition, h - 200));
	var toolPosition = this.container.clientHeight - this.toolbarContainer.clientHeight;
	effVsplitPosition = effVsplitPosition < toolPosition ? effVsplitPosition : toolPosition;
	this.resultContainer.style.height = effVsplitPosition - 45 + "px";
	this.diagramContainer.style.bottom = effVsplitPosition + this.splitSize - 45 + 'px';
	this.vsplit.style.bottom = effVsplitPosition + 'px';
	this.tableArea.style.height = (effVsplitPosition - 110) + "px";
	this.sysInfoArea.style.height = (effVsplitPosition - 110) + "px";
	this.outLineArea.style.height = (effVsplitPosition - 110) + "px";
}

/**
 * 创建和初始化.
 */
EditorUi.prototype.createDivs = function () {
	this.graphToolDiv = document.getElementById("graphToolDiv");
	this.sidebarContainer = document.getElementById("accordion");
	this.toolbarContainer = document.getElementById("geToolbarContainer");
	this.diagramContainer = document.getElementById("geDiagramContainer");
	this.backgroundPage = document.getElementById("geBackgroundPage");
	this.detailContainer = document.getElementById("detailContainer");
	this.resultContainer = document.getElementById("geResultContainer");
	this.tableArea = document.getElementById("tableArea");
	this.sysInfoArea = document.getElementById("sysInfoArea");
	this.outLineArea = document.getElementById("outLineArea");
	this.hsplit = document.getElementById("geHsplit");
	this.vsplit = document.getElementById("geVsplit");
	this.leftMenuWidth = $(this.graphToolDiv).offset().left;
	var h = $(this.graphToolDiv).height() - this.toolbarHeight + 10;
	this.sidebarContainer.style.width = this.sidebarWidth + "px";
	this.resultContainer.style.height = this.resultHeight - 45 + "px";
	this.container.style.left = (this.sidebarWidth + this.splitSize) + "px";
	this.container.style.right = (this.detailContainerWidth + 15) + "px";
	this.container.style.width = ($(this.graphToolDiv).width() - this.sidebarWidth - this.splitSize - this.detailContainerWidth) + "px";
	this.container.style.height = h + "px";
	this.diagramContainer.style.bottom = this.resultHeight - 45 + "px";
	this.detailContainer.style.width = this.detailContainerWidth + "px";
	this.hsplit.style.width = this.splitSize + "px";
	this.hsplit.style.bottom = h + "px";
	this.hsplit.style.height = h + "px";
	this.hsplit.style.left = this.sidebarWidth + "px";
	this.vsplit.style.width = ($(this.graphToolDiv).width() - this.sidebarWidth - this.splitSize - this.detailContainerWidth) + "px";
	this.vsplit.style.height = this.splitSize + "px";
	this.vsplit.style.bottom = this.resultHeight + "px";
	this.vsplit.style.left = this.sidebarWidth + $(this.graphToolDiv).offset().left + this.splitSize + "px";
	this.tableArea.style.height = this.resultContentHeight + "px";
	this.sysInfoArea.style.height = this.resultContentHeight + "px";
	this.outLineArea.style.height = this.resultContentHeight + "px";

};

/**
 * Creates the required containers.
 */
EditorUi.prototype.createUi = function () {
	var w = document.body.clientWidth;
	this.container.appendChild(this.diagramContainer);

	if (this.container != null && this.tabContainer != null) {
		this.container.appendChild(this.tabContainer);
	}

	// Creates toolbar

	if (this.toolbar != null) {
		this.toolbarContainer.appendChild(this.toolbar.container);
		this.container.appendChild(this.toolbarContainer);
	}

	// HSplit
	if (this.hsplit != null) {
		this.addSplitHandler(this.hsplit, true, 0, mxUtils.bind(this, function (value) {
			var wh = w - this.sidebarWidth - this.splitSize - 500;
			if (value < wh && value > this.sidebarWidth) {
				this.hsplitPosition = value;
			}
			this.refresh();
		}));
	}
	// VSplit
	if (this.vsplit != null) {
		this.addSplitHandler(this.vsplit, false, 0, mxUtils.bind(this, function (value) {
			if (value > 150) {
				this.vsplitPosition = value;
			}
			this.refreshv();
		}));
	}

};

/**
 * Creates a new toolbar for the given container.
 */
//EditorUi.prototype.createToolbar = function(container) {
//	return new Toolbar(this, container);
//};

/**
 * Creates the actual toolbar for the toolbar container.
 */
EditorUi.prototype.createDiv = function (classname) {
	var elt = document.createElement('div');
	elt.className = classname;

	return elt;
};

/**
 * Updates the states of the given undo/redo items.
 */
EditorUi.prototype.addSplitHandler = function (elt, horizontal, dx, onChange) {
	var start = null;
	var initial = null;
	var ignoreClick = true;
	var last = null;
	var $this = this;
	// Disables built-in pan and zoom in IE10 and later
	if (mxClient.IS_POINTER) {
		elt.style.touchAction = 'none';
	}

	var getValue = mxUtils.bind(this, function () {
		return parseInt(((horizontal) ? (elt.style.left) : elt.style.bottom));
	});

	function moveHandler(evt) {
		if (start != null) {
			var pt = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
			// var w = Number($this.sidebarContainer.style.width.split("px")[0]);
			onChange(Math.max(0, initial + ((horizontal) ? (pt.x - start.x) : (start.y - pt.y)) - dx));
			mxEvent.consume(evt);
			if (initial !== getValue()) {
				ignoreClick = true;
				last = null;
			}
		}
	}

	function dropHandler(evt) {
		moveHandler(evt);
		initial = null;
		start = null;
	}

	mxEvent.addGestureListeners(elt, function (evt) {
		start = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
		initial = getValue();
		ignoreClick = false;
		mxEvent.consume(evt);
	});

	mxEvent.addGestureListeners(document, null, moveHandler, dropHandler);

	this.destroyFunctions.push(function () {
		mxEvent.removeGestureListeners(document, null, moveHandler, dropHandler);
	});
};

/**
 * Displays a print dialog.
 */
EditorUi.prototype.showDialog = function (elt, w, h, modal, closable, onClose, noScroll, trasparent) {
	this.editor.graph.tooltipHandler.hideTooltip();

	if (this.dialogs == null) {
		this.dialogs = [];
	}

	this.dialog = new Dialog(this, elt, w, h, modal, closable, onClose, noScroll, trasparent);
	this.dialogs.push(this.dialog);
};

/**
 * Displays a print dialog.
 */
EditorUi.prototype.hideDialog = function (cancel) {
	if (this.dialogs != null && this.dialogs.length > 0) {
		var dlg = this.dialogs.pop();
		dlg.close(cancel);

		this.dialog = (this.dialogs.length > 0) ? this.dialogs[this.dialogs.length - 1] : null;

		if (this.dialog == null && this.editor.graph.container.style.visibility != 'hidden') {
			this.editor.graph.container.focus();
		}

		mxUtils.clearSelection();
		this.editor.fireEvent(new mxEventObject('hideDialog'));
	}
};

/**
 * Display a color dialog.
 */
EditorUi.prototype.pickColor = function (color, apply) {
	var graph = this.editor.graph;
	var selState = graph.cellEditor.saveSelection();
	var h = 226 + ((Math.ceil(ColorDialog.prototype.presetColors.length / 12) +
		Math.ceil(ColorDialog.prototype.defaultColors.length / 12)) * 17);

	var dlg = new ColorDialog(this, color || 'none', function (color) {
		graph.cellEditor.restoreSelection(selState);
		apply(color);
	}, function () {
		graph.cellEditor.restoreSelection(selState);
	});
	this.showDialog(dlg.container, 230, h, true, false);
	dlg.init();
};

/**
 * Executes the given layout.
 */
EditorUi.prototype.executeLayout = function (exec, animate, post) {
	var graph = this.editor.graph;

	if (graph.isEnabled()) {
		graph.getModel().beginUpdate();
		try {
			exec();
		} catch (e) {
			throw e;
		} finally {
			// Animates the changes in the graph model except
			// for Camino, where animation is too slow
			if (this.allowAnimation && animate && navigator.userAgent.indexOf('Camino') < 0) {
				// New API for animating graph layout results asynchronously
				var morph = new mxMorphing(graph);
				morph.addListener(mxEvent.DONE, mxUtils.bind(this, function () {
					graph.getModel().endUpdate();

					if (post != null) {
						post();
					}
				}));

				morph.startAnimation();
			} else {
				graph.getModel().endUpdate();

				if (post != null) {
					post();
				}
			}
		}
	}
};

/**
 * Hides the current menu.
 */
EditorUi.prototype.showImageDialog = function (title, value, fn, ignoreExisting) {
	var cellEditor = this.editor.graph.cellEditor;
	var selState = cellEditor.saveSelection();
	var newValue = mxUtils.prompt(title, value);
	cellEditor.restoreSelection(selState);

	if (newValue != null && newValue.length > 0) {
		var img = new Image();

		img.onload = function () {
			fn(newValue, img.width, img.height);
		};
		img.onerror = function () {
			fn(null);
			mxUtils.alert(mxResources.get('fileNotFound'));
		};

		img.src = newValue;
	} else {
		fn(null);
	}
};

/**
 * Hides the current menu.
 */
EditorUi.prototype.showLinkDialog = function (value, btnLabel, fn) {
	var dlg = new LinkDialog(this, value, btnLabel, fn);
	this.showDialog(dlg.container, 420, 90, true, true);
	dlg.init();
};

/**
 * Hides the current menu.
 */
EditorUi.prototype.showDataDialog = function (cell) {
	if (cell != null) {
		var dlg = new EditDataDialog(this, cell);
		this.showDialog(dlg.container, 340, 340, true, false, null, false);
		dlg.init();
	}
};

/**
 * Hides the current menu.
 */
EditorUi.prototype.showBackgroundImageDialog = function (apply) {
	apply = (apply != null) ? apply : mxUtils.bind(this, function (image) {
		var change = new ChangePageSetup(this, null, image);
		change.ignoreColor = true;

		this.editor.graph.model.execute(change);
	});

	var newValue = mxUtils.prompt(mxResources.get('backgroundImage'), '');

	if (newValue != null && newValue.length > 0) {
		var img = new Image();

		img.onload = function () {
			apply(new mxImage(newValue, img.width, img.height));
		};
		img.onerror = function () {
			apply(null);
			mxUtils.alert(mxResources.get('fileNotFound'));
		};

		img.src = newValue;
	} else {
		apply(null);
	}
};

/**
 * Loads the stylesheet for this graph.
 */
EditorUi.prototype.setBackgroundImage = function (image) {
	this.editor.graph.setBackgroundImage(image);
	this.editor.graph.view.validateBackgroundImage();

	this.fireEvent(new mxEventObject('backgroundImageChanged'));
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
EditorUi.prototype.confirm = function (msg, okFn, cancelFn) {
	if (mxUtils.confirm(msg)) {
		if (okFn != null) {
			okFn();
		}
	} else if (cancelFn != null) {
		cancelFn();
	}
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
EditorUi.prototype.createOutline = function (wnd) {
	var outline = new mxOutline(this.editor.graph);
	outline.border = 20;

	mxEvent.addListener(window, 'resize', function () {
		outline.update();
	});

	this.addListener('pageFormatChanged', function () {
		outline.update();
	});

	return outline;
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
EditorUi.prototype.createKeyHandler = function (editor) {
	var editorUi = this;
	var graph = this.editor.graph;
	var keyHandler = new mxKeyHandler(graph);

	var isEventIgnored = keyHandler.isEventIgnored;
	keyHandler.isEventIgnored = function (evt) {
		// Handles undo/redo/ctrl+./,/u via action and allows ctrl+b/i only if editing value is HTML (except for FF and Safari)
		return (!this.isControlDown(evt) || mxEvent.isShiftDown(evt) || (evt.keyCode != 90 && evt.keyCode != 89 &&
			evt.keyCode != 188 && evt.keyCode != 190 && evt.keyCode != 85)) && ((evt.keyCode != 66 && evt.keyCode != 73) ||
				!this.isControlDown(evt) || (this.graph.cellEditor.isContentEditing() && !mxClient.IS_FF && !mxClient.IS_SF)) &&
			isEventIgnored.apply(this, arguments);
	};

	// Ignores graph enabled state but not chromeless state
	keyHandler.isEnabledForEvent = function (evt) {
		return (!mxEvent.isConsumed(evt) && this.isGraphEvent(evt) && this.isEnabled() &&
			(editorUi.dialogs == null || editorUi.dialogs.length == 0));
	};

	// Routes command-key to control-key on Mac
	keyHandler.isControlDown = function (evt) {
		return mxEvent.isControlDown(evt) || (mxClient.IS_MAC && evt.metaKey);
	};

	var queue = [];
	var thread = null;

	// Helper function to move cells with the cursor keys
	function nudge(keyCode, stepSize, resize) {
		queue.push(function () {
			if (!graph.isSelectionEmpty() && graph.isEnabled()) {
				stepSize = (stepSize != null) ? stepSize : 1;

				if (resize) {
					// Resizes all selected vertices
					graph.getModel().beginUpdate();
					try {
						var cells = graph.getSelectionCells();

						for (var i = 0; i < cells.length; i++) {
							if (graph.getModel().isVertex(cells[i]) && graph.isCellResizable(cells[i])) {
								var geo = graph.getCellGeometry(cells[i]);

								if (geo != null) {
									geo = geo.clone();

									if (keyCode == 37) {
										geo.width = Math.max(0, geo.width - stepSize);
									} else if (keyCode == 38) {
										geo.height = Math.max(0, geo.height - stepSize);
									} else if (keyCode == 39) {
										geo.width += stepSize;
									} else if (keyCode == 40) {
										geo.height += stepSize;
									}

									graph.getModel().setGeometry(cells[i], geo);
								}
							}
						}
					} finally {
						graph.getModel().endUpdate();
					}
				} else {
					// Moves vertices up/down in a stack layout
					var cell = graph.getSelectionCell();
					var parent = graph.model.getParent(cell);
					var layout = null;

					if (graph.getSelectionCount() == 1 && graph.model.isVertex(cell) &&
						graph.layoutManager != null && !graph.isCellLocked(cell)) {
						layout = graph.layoutManager.getLayout(parent);
					}

					if (layout != null && layout.constructor == mxStackLayout) {
						var index = parent.getIndex(cell);

						if (keyCode == 37 || keyCode == 38) {
							graph.model.add(parent, cell, Math.max(0, index - 1));
						} else if (keyCode == 39 || keyCode == 40) {
							graph.model.add(parent, cell, Math.min(graph.model.getChildCount(parent), index + 1));
						}
					} else {
						var dx = 0;
						var dy = 0;

						if (keyCode == 37) {
							dx = -stepSize;
						} else if (keyCode == 38) {
							dy = -stepSize;
						} else if (keyCode == 39) {
							dx = stepSize;
						} else if (keyCode == 40) {
							dy = stepSize;
						}

						graph.moveCells(graph.getMovableCells(graph.getSelectionCells()), dx, dy);
					}
				}
			}
		});

		if (thread != null) {
			window.clearTimeout(thread);
		}

		thread = window.setTimeout(function () {
			if (queue.length > 0) {
				graph.getModel().beginUpdate();
				try {
					for (var i = 0; i < queue.length; i++) {
						queue[i]();
					}

					queue = [];
				} finally {
					graph.getModel().endUpdate();
				}
				graph.scrollCellToVisible(graph.getSelectionCell());
			}
		}, 200);
	}

	// Overridden to handle special alt+shift+cursor keyboard shortcuts
	var directions = {
		37: mxConstants.DIRECTION_WEST,
		38: mxConstants.DIRECTION_NORTH,
		39: mxConstants.DIRECTION_EAST,
		40: mxConstants.DIRECTION_SOUTH
	};

	var keyHandlerGetFunction = keyHandler.getFunction;

	mxKeyHandler.prototype.getFunction = function (evt) {
		if (graph.isEnabled()) {
			// TODO: Add alt modified state in core API, here are some specific cases
			if (mxEvent.isShiftDown(evt) && mxEvent.isAltDown(evt)) {
				var action = editorUi.actions.get(editorUi.altShiftActions[evt.keyCode]);

				if (action != null) {
					return action.funct;
				}
			}

			if (evt.keyCode == 9 && mxEvent.isAltDown(evt)) {
				if (mxEvent.isShiftDown(evt)) {
					// Alt+Shift+Tab
					return function () {
						graph.selectParentCell();
					};
				} else {
					// Alt+Tab
					return function () {
						graph.selectChildCell();
					};
				}
			} else if (directions[evt.keyCode] != null && !graph.isSelectionEmpty()) {
				if (mxEvent.isShiftDown(evt) && mxEvent.isAltDown(evt)) {
					if (graph.model.isVertex(graph.getSelectionCell())) {
						return function () {
							var cells = graph.connectVertex(graph.getSelectionCell(), directions[evt.keyCode],
								graph.defaultEdgeLength, evt, true);

							if (cells != null && cells.length > 0) {
								if (cells.length == 1 && graph.model.isEdge(cells[0])) {
									graph.setSelectionCell(graph.model.getTerminal(cells[0], false));
								} else {
									graph.setSelectionCell(cells[cells.length - 1]);
								}

								graph.scrollCellToVisible(graph.getSelectionCell());

								if (editorUi.hoverIcons != null) {
									editorUi.hoverIcons.update(graph.view.getState(graph.getSelectionCell()));
								}
							}
						};
					}
				} else {
					// Avoids consuming event if no vertex is selected by returning null below
					// Cursor keys move and resize (ctrl) cells
					if (this.isControlDown(evt)) {
						return function () {
							nudge(evt.keyCode, (mxEvent.isShiftDown(evt)) ? graph.gridSize : null, true);
						};
					} else {
						return function () {
							nudge(evt.keyCode, (mxEvent.isShiftDown(evt)) ? graph.gridSize : null);
						};
					}
				}
			}
		}

		return keyHandlerGetFunction.apply(this, arguments);
	};

	// Binds keystrokes to actions
	keyHandler.bindAction = mxUtils.bind(this, function (code, control, key, shift) {
		var action = this.actions.get(key);

		if (action != null) {
			var f = function () {
				if (action.isEnabled()) {
					action.funct();
				}
			};

			if (control) {
				if (shift) {
					keyHandler.bindControlShiftKey(code, f);
				} else {
					keyHandler.bindControlKey(code, f);
				}
			} else {
				if (shift) {
					keyHandler.bindShiftKey(code, f);
				} else {
					keyHandler.bindKey(code, f);
				}
			}
		}
	});

	var ui = this;
	var keyHandlerEscape = keyHandler.escape;
	keyHandler.escape = function (evt) {
		keyHandlerEscape.apply(this, arguments);
	};

	// Ignores enter keystroke. Remove this line if you want the
	// enter keystroke to stop editing. N, W, T are reserved.
	keyHandler.enter = function () { };

	/*keyHandler.bindControlShiftKey(36, function() {
		graph.exitGroup();
	});*/ // Ctrl+Shift+Home
	/*keyHandler.bindControlShiftKey(35, function() {
		graph.enterGroup();
	});*/ // Ctrl+Shift+End
	/*keyHandler.bindKey(36, function() {
		graph.home();
	});*/ // Home
	/*keyHandler.bindKey(35, function() {
		graph.refresh();
	});*/ // End
	//	keyHandler.bindAction(107, true, 'zoomIn'); // Ctrl+Plus
	//	keyHandler.bindAction(109, true, 'zoomOut'); // Ctrl+Minus
	//	keyHandler.bindAction(80, true, 'print'); // Ctrl+P
	//	keyHandler.bindAction(79, true, 'outline', true); // Ctrl+Shift+O
	//	keyHandler.bindAction(112, false, 'about'); // F1

	//	if(!this.editor.chromeless || this.editor.editable) {
	/*keyHandler.bindControlKey(36, function() {
		if(graph.isEnabled()) {
			graph.foldCells(true);
		}
	});*/ // Ctrl+Home
	/*keyHandler.bindControlKey(35, function() {
		if(graph.isEnabled()) {
			graph.foldCells(false);
		}
	});*/ // Ctrl+End
	/*keyHandler.bindControlKey(13, function() {
		if(graph.isEnabled()) {
			graph.setSelectionCells(graph.duplicateCells(graph.getSelectionCells(), false));
		}
	});*/ // Ctrl+Enter
	//		keyHandler.bindAction(8, false, 'delete'); // Backspace
	//		keyHandler.bindAction(8, true, 'deleteAll'); // Backspace
	//		keyHandler.bindAction(46, false, 'delete'); // Delete
	//		keyHandler.bindAction(46, true, 'deleteAll'); // Ctrl+Delete
	//		keyHandler.bindAction(72, true, 'resetView'); // Ctrl+H
	//		keyHandler.bindAction(65, true, 'selectAll'); // Ctrl+A
	//		keyHandler.bindAction(73, true, 'selectVertices', true); // Ctrl+Shift+I
	//		keyHandler.bindAction(69, true, 'selectEdges', true); // Ctrl+Shift+E
	//		keyHandler.bindAction(66, true, 'toBack', true); // Ctrl+Shift+B
	//		keyHandler.bindAction(70, true, 'toFront', true); // Ctrl+Shift+F
	//		keyHandler.bindAction(68, true, 'duplicate'); // Ctrl+D
	//		keyHandler.bindAction(90, true, 'undo'); // Ctrl+Z
	//		keyHandler.bindAction(88, true, 'cut'); // Ctrl+X
	//		keyHandler.bindAction(67, true, 'copy'); // Ctrl+C
	//		keyHandler.bindAction(67, true, 'referCopy', true); // Ctrl+Shift+C
	//		keyHandler.bindAction(86, true, 'paste'); // Ctrl+V
	//		keyHandler.bindAction(71, true, 'group'); // Ctrl+G
	//		keyHandler.bindAction(85, true, 'ungroup', true); // Ctrl+Shift+U
	//		keyHandler.bindAction(66, true, 'bold'); // Ctrl+B	//加粗
	//		keyHandler.bindAction(71, true, 'grid', true); // Ctrl+Shift+G	//背景网格
	//		keyHandler.bindAction(73, true, 'italic'); // Ctrl+I	//斜体
	//		keyHandler.bindAction(76, true, 'lockUnlock'); // Ctrl+L	//锁定位置
	//		keyHandler.bindAction(85, true, 'underline'); // Ctrl+U		//下划线
	//	}

	//	if(!mxClient.IS_WIN) {
	//		keyHandler.bindAction(90, true, 'redo', true); // Ctrl+Shift+Z
	//	} else {
	//		keyHandler.bindAction(89, true, 'redo'); // Ctrl+Y
	//	}

	return keyHandler;
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
EditorUi.prototype.destroy = function () {
	if (this.editor != null) {
		this.editor.destroy();
		this.editor = null;
	}

	if (this.toolbar != null) {
		this.toolbar.destroy();
		this.toolbar = null;
	}

	if (this.sidebar != null) {
		this.sidebar.destroy();
		this.sidebar = null;
	}

	if (this.keyHandler != null) {
		this.keyHandler.destroy();
		this.keyHandler = null;
	}

	if (this.keydownHandler != null) {
		mxEvent.removeListener(document, 'keydown', this.keydownHandler);
		this.keydownHandler = null;
	}

	if (this.keyupHandler != null) {
		mxEvent.removeListener(document, 'keyup', this.keyupHandler);
		this.keyupHandler = null;
	}

	if (this.resizeHandler != null) {
		mxEvent.removeListener(window, 'resize', this.resizeHandler);
		this.resizeHandler = null;
	}

	if (this.gestureHandler != null) {
		mxEvent.removeGestureListeners(document, this.gestureHandler);
		this.gestureHandler = null;
	}

	if (this.orientationChangeHandler != null) {
		mxEvent.removeListener(window, 'orientationchange', this.orientationChangeHandler);
		this.orientationChangeHandler = null;
	}

	if (this.scrollHandler != null) {
		mxEvent.removeListener(window, 'scroll', this.scrollHandler);
		this.scrollHandler = null;
	}

	if (this.destroyFunctions != null) {
		for (var i = 0; i < this.destroyFunctions.length; i++) {
			this.destroyFunctions[i]();
		}

		this.destroyFunctions = null;
	}

	var c = [this.toolbarContainer, this.diagramContainer,
	this.chromelessToolbar, this.hsplit,
	this.layersDialog
	];

	for (var i = 0; i < c.length; i++) {
		if (c[i] != null && c[i].parentNode != null) {
			c[i].parentNode.removeChild(c[i]);
		}
	}
};

EditorUi.prototype.resetHistory = function () {
	this.editor.undoManager.clear();
	this.editor.graph.oldOptArr = [];
	this.editor.graph.newOptArr = [];
	this.editor.graph.edgeArr = [];
};

//主页各个区域的折叠与展开事件，start
var topAreaHide = false;
var leftAreaHide = false;
var rightAreaHide = false;
var old_toolbar_height, old_leftArea_width, old_rightArea_width;
/**
 * 工具栏的折叠与展开
 */
EditorUi.prototype.toolBarH_S = function () {
	var detailContainer = $("#detailContainer");
	var accordion = $("#accordion");
	var graphContainer = $("#graphContainer");
	var geHsplit = $("#geHsplit");
	var geToolbarContainer = $("#geToolbarContainer");
	if (topAreaHide) {
		$("#geToolbarContainer>.menu").show();
		$("#H_S_Menu>ul>li:eq(0)").html("折叠上方区域");
		$("#geToolbarContainer").height(old_toolbar_height + "px");
		detailContainer.css({ "height": (detailContainer.height() - 90) + "px", "bottom": (detailContainer.height() - 90) + "px" });
		accordion.css({ "height": (accordion.height() - 90) + "px" });
		graphContainer.css({ "height": (graphContainer.height() - 90) + "px" });
		geHsplit.css({ "height": (geHsplit.height() - 90) + "px", "bottom": (geHsplit.height() - 90) + "px" });
		this.toolbarHeight = 120;
		topAreaHide = false;
	} else {
		old_toolbar_height = geToolbarContainer.height();
		$("#geToolbarContainer>.menu").hide();
		$("#H_S_Menu>ul>li:eq(0)").html("展开上方区域");
		geToolbarContainer.height("20px");
		detailContainer.css({ "height": (detailContainer.height() + 90) + "px", "bottom": (detailContainer.height() + 90) + "px" });
		accordion.css({ "height": (accordion.height() + 90) + "px" });
		graphContainer.css({ "height": (graphContainer.height() + 90) + "px" });
		geHsplit.css({ "height": (geHsplit.height() + 90) + "px", "bottom": (geHsplit.height() + 90) + "px" });
		this.toolbarHeight = 30;
		topAreaHide = true;
	}
};

/**
* 左侧资源树的折叠与展开
*/
EditorUi.prototype.leftAreaH_S = function () {
	var accordion = $("#accordion");
	var geHsplit = $("#geHsplit");
	var geVsplit = $("#geVsplit");
	var graphContainer = $("#graphContainer");
	var left = graphContainer.position().left;
	if (leftAreaHide) {
		accordion.show();
		geHsplit.show();
		$("#H_S_Menu>ul>li:eq(1)").html("折叠左侧区域");
		graphContainer.css({ "width": (graphContainer.width() - old_leftArea_width - this.splitSize) + "px", "left": old_leftArea_width + this.splitSize + "px" });
		geVsplit.css({ "width": (geVsplit.width() - old_leftArea_width - this.splitSize) + "px", "left": (left + old_leftArea_width + this.splitSize) + "px" });
		this.hsplitPosition = old_leftArea_width + this.splitSize;
		leftAreaHide = false;
	} else {
		old_leftArea_width = accordion.width();
		accordion.hide();
		geHsplit.hide();
		$("#H_S_Menu>ul>li:eq(1)").html("展开左侧区域");
		graphContainer.css({ "width": (graphContainer.width() + old_leftArea_width + this.splitSize) + "px", "left": "0" });
		geVsplit.css({ "width": (geVsplit.width() + old_leftArea_width + this.splitSize) + "px", "left": (left - old_leftArea_width - this.splitSize) + "px" });
		this.hsplitPosition = 0;
		leftAreaHide = true;
	}
};

/**
 * 右侧所使用资源树的折叠与展开
 */
EditorUi.prototype.rightAreaH_S = function () {
	var detailContainer = $("#detailContainer");
	var geVsplit = $("#geVsplit");
	var graphContainer = $("#graphContainer");
	var left = graphContainer.position().left;
	if (rightAreaHide) {
		detailContainer.show();
		$("#H_S_Menu>ul>li:eq(2)").html("折叠右侧区域");
		graphContainer.css({ "width": (graphContainer.width() - old_rightArea_width) + "px", "right": (old_rightArea_width + 15) + "px" });
		geVsplit.css({ "width": (geVsplit.width() - old_rightArea_width) + "px" });
		rightAreaHide = false;
	} else {
		old_rightArea_width = detailContainer.width();
		detailContainer.hide();
		$("#H_S_Menu>ul>li:eq(2)").html("展开右侧区域");
		graphContainer.css({ "width": (graphContainer.width() + old_rightArea_width) + "px", "right": "14px" });
		geVsplit.css({ "width": (geVsplit.width() + old_rightArea_width) + "px" });
		rightAreaHide = true;
	}
};
//主页各个区域的折叠与展开事件，end

var iconDrag = function (treeNode) {
	let that = this
	//拖动后真实图形
	//获取所有的原表
	var valArr = getDataSourceTable();
	var isCopy = false;//当前节点是不是重复节点
	if ($.inArray(treeNode.name, valArr) > -1) {
		isCopy = true
	}

	//生成图形化节点方法
	var funct = function (graph, evt, target, x, y) {
		var nodeImgPath = createCellShape(treeNode.type, isCopy)
		var cell = new mxCell(treeNode.name, new mxGeometry(0, 0, 60, 80), nodeImgPath);
		cell.vertex = true;
		cell.nodeType = treeNode.type;
		//初始化节点配置信息,start
		var options = {
			"id": cell.id,
			"name": treeNode.name,
			"type": treeNode.type,
			"english":treeNode.english||''
		};
		initNodeData(options, true);
		//初始化节点配置信息,end
		var cells = graph.importCells([cell], x, y, target);
		graph.curCell = cell;
		var historyNodeName = "拖入【" + treeNode.name + "】";
		//节点预执行，获取节点所含字段
		if ("datasource" === cell.nodeType) {
			graph.nodeData[cell.id]["treeNodeId"] = treeNode.id;
			//获取拖入表的信息
			graph.isCreateTableNodeError = graph.preExeGetFields(cell, treeNode);
			//如果有错误，创建表节点失败
			if (graph.isCreateTableNodeError) {
				//先放入旧的操作数组
				graph.oldOptArr.push({ "optType": "drag", "optArr": [{ "id": cell.id, "nodeData": graph.nodeData[cell.id] }] });
				//然后再执行撤销操作，顺便从旧的操作数组中移除记录
				ownerEditor.editor.undoManager.undo();
				//从graph的历史纪录中移除此次记录
				ownerEditor.editor.undoManager.history.pop();
				delete graph.isCreateTableNodeError;
				return;
			}
			//判断该节点是否是复制节点
			if (isCopy) {
				setDataSourceCopyIcon(cell.id);
				graph.nodeData[cell.id].isCopy = true;
			}
			historyNodeName = "拖入表【" + treeNode.name + "】";
		}
		graph.oldOptArr.push({ "optType": "drag", "optArr": [{ "id": cell.id, "nodeData": graph.nodeData[cell.id] }] });
		console.log(graph.getModel().root.children[0].children)
		//刷新所使用资源树
		refrashResourceZtree(cell.id, treeNode.name, cell.nodeType);
		//刷新操作痕迹树
		refrashHistoryZtree(historyNodeName);
		//自动保存图形化
		autoSaveGraph();

		//当节点数大于两个的时候新增自动连线
		if (graph.getModel().root.children[0].children.length >= 2) {
			//起点
			var rep = (graph.getModel().root.children[0].children)[graph.getModel().root.children[0].children.length - 2];
			//判断上一个节点是否为连线，如果是连线则再向前寻找
			if (!rep.nodeType) {
				rep = (graph.getModel().root.children[0].children)[graph.getModel().root.children[0].children.length - 3]
			}
			//获取当前画布上所有子节点（包括模块和线） graph.getModel().root.children[0].children
			// console.log(rep)
			// console.log(cells[0])
			//终点
			var repcell = cells[0]
			//连线实例
			var edge = graph.insertEdge(graph.getDefaultParent(), null, getEdgeCount() + 1, rep, cells[0], 'rounded=0;html=1;jettySize=auto;orthogonalLoop=1;strokeColor=#3E6F96;strokeWidth=2;')     // 生成线
			console.log(edge)
			if (!edgeVerify(edge)) {
				return;
			} else {
				// 刷新画布
				// 将生成的线添加到线的集合中
				if (!graph.edgeArr[edge.id]) {
					graph.edgeArr[edge.id] = { 'source': rep, 'target': repcell }
				}
				// 添加父、子ID信息
				graph.nodeData[rep.id].childrenIds.push(repcell.id)
				graph.nodeData[repcell.id].parentIds.push(rep.id)
				console.log(graph.edgeArr)
			}
		}

	};
	//用于拖动预览的可选DOM节点
	var dragElt = document.createElement('div');
	dragElt.className = "geItem";
	dragElt.style.border = '1px solid red';
	dragElt.style.width = '60px';
	dragElt.style.height = '60px';
	// 节点操作
	switch (treeNode.type) {
		case "filter":
		case "sort":
		case "sample":
		case "layering":
		case "groupCount":
		case "delRepeat":
		case "comparison":
		case "change":
		case "union":
		case "sql":
		case "newNullNode":
		case "relation":
			mxUtils.makeDraggable($("#" + treeNode.id)[0], graph, funct, dragElt, null, null, true, true);
			break;
		case "datasource":
			mxUtils.makeDraggable($("#" + treeNode.tId + "_a")[0], graph, funct, dragElt, null, null, true, true);
			break;
	}
};


//初始化节点信息
var initNodeData = function (options, changeIcon) {
	var setting = { "settingId": new UUIDGenerator().id }, isSet = false, isChangeSource = false;
	var nodeInfo = { "nodeId": options.id, "nodeName": options.name, "optType": options.type, "isCreateTable": 0, "nodeExcuteStatus": 1, "nodeDescription": "", "resultTableName": "" };
	switch (options.type) {
		case "datasource":
			isSet = true;
			if(options.english){
				nodeInfo.resultTableName = options.english;
			}else{
				nodeInfo.resultTableName = options.name;
			}
			nodeInfo.nodeExcuteStatus = 3;
			delete setting.settingId;
			break;
		case "newNullNode":
			nodeInfo.resultTableStatus = 1;//最终结果表状态：1、未标记，2、已标记
			nodeInfo.midTableStatus = 1;//中间结果表状态：1、未标记，2、已标记
			break;
		case "barChart":
			delete setting.settingId;
			break;
		case "layering":
			nodeInfo.resultTableNameArr = [];
			nodeInfo.nodeSqlArr = [];
			nodeInfo.selectSqlNotViewTableArr = [];
			setting.index = 0;
			break;
		case "comparison":
			nodeInfo.dataTableName = "";				//存储所选各个来源表中需对比的数据的临时表名称
			break;
	}
	graph.nodeData[options.id] = {
		"isSet": isSet,	//是否配置，初始值为未配置
		"isChangeSource": isChangeSource,	//是否变更了前置节点信息
		"setting": setting,//配置属性对象，初始值为空对象
		"parentIds": [],   //父节点
		"childrenIds": [],   //子节点
		"columnsInfo": [],   //结果集列信息
		"nodeInfo": nodeInfo    //节点基本信息系
	};
	if (changeIcon) {
		changeNodeIcon(nodeInfo.nodeExcuteStatus, isSet, options.id);
	}
	graph.scrollCellToVisible(graph.getModel().getCell(options.id));
	graph.setSelectionCells(graph.getModel().getCell(options.id));
	//end
};

//创建图形样式
var createCellShape = function (type, isCopy) {
	var path = "";
	switch (type) {
		case "newNullNode"://中间表
			path = IMAGE_PATH + '/table.png';
			break;
		case "datasource"://基础表
			if (isCopy) {
				path = IMAGE_PATH + '/table_copy.png';
			} else {
				path = IMAGE_PATH + '/table.png';
			}
			break;
		case "sql"://SQL查询器
		case "filter"://数据筛选
		case "sort"://数据排序
		case "sample"://数据抽样
		case "layering"://数据分层
		case "groupCount"://分组汇总
		case "delRepeat"://数据去重
		case "comparison"://数据频次分析
		case "change"://数据转码
		case "union"://数据合并
		case "relation"://数据关联
		case "barChart"://图表
			path = IMAGE_PATH + '/' + type + '.png';
			break;
	}
	return "shape=label;image=" + path + ";whiteSpace=wrap;indicatorColor=#FF0000;verticalLabelPosition=bottom;verticalAlign=top;imageVerticalAlign=top;imageAlign=center;strokeColor=transparent;imageWidth=50;imageHeight=50;spacingTop=-45";
};

//获取边数
var getEdgeCount = function () {
	var parent = graph.getDefaultParent();
	var parentChildren = parent.children;
	var count = 0;
	for (var i = 0; i < parentChildren.length; i++) {
		if (parentChildren[i].edge) {
			count++;
		}
	}
	return count;
};

//工具节点初始化
var toolCellInitSql = function (curSelCell) {
	if (typeof curSelCell !== "undefined" && curSelCell.edge) {
		var isChange = false;
		//连线验证
		if (!edgeVerify(curSelCell)) {
			return;
		}
		if (!graph.edgeArr[curSelCell.id]) {				//如果当前线不在的集合中，新增线所关联的父子节点信息
			if ($.inArray(curSelCell.source.id, graph.nodeData[curSelCell.target.id].parentIds) < 0) {
				graph.nodeData[curSelCell.target.id].parentIds.push(curSelCell.source.id);
			}
			if ($.inArray(curSelCell.target.id, graph.nodeData[curSelCell.source.id].childrenIds) < 0) {
				graph.nodeData[curSelCell.source.id].childrenIds.push(curSelCell.target.id);
			}
			isChange = true;
		} else {
			var oldSource = graph.edgeArr[curSelCell.id].source;
			var oldTarget = graph.edgeArr[curSelCell.id].target;
			if ((graph.nodeData[oldSource.id] && oldSource.id !== curSelCell.source.id) || (graph.nodeData[oldTarget.id] && oldTarget.id !== curSelCell.target.id)) {
				//在oldSource节点中的子节点集合中去掉oldTarget节点的ID
				if (graph.nodeData[oldSource.id]) {
					var childrenIds = graph.nodeData[oldSource.id].childrenIds;
					if ($.inArray(oldTarget.id, childrenIds) > -1) {
						var index = $.inArray(oldTarget.id, childrenIds);
						graph.nodeData[oldSource.id].childrenIds.splice(index, 1);
					}
				}
				//在oldTarget节点的父节点集合中去掉oldSource节点的ID
				if (graph.nodeData[oldTarget.id]) {
					var parentIds = graph.nodeData[oldTarget.id].parentIds;
					if ($.inArray(oldSource.id, parentIds) > -1) {
						var index = $.inArray(oldSource.id, parentIds);
						graph.nodeData[oldTarget.id].parentIds.splice(index, 1);
					}
				}
				//重新为该线相关的节点附加父子关系
				if ($.inArray(curSelCell.source.id, graph.nodeData[curSelCell.target.id].parentIds) < 0) {
					graph.nodeData[curSelCell.target.id].parentIds.push(curSelCell.source.id);
				}
				if ($.inArray(curSelCell.target.id, graph.nodeData[curSelCell.source.id].childrenIds) < 0) {
					graph.nodeData[curSelCell.source.id].childrenIds.push(curSelCell.target.id);
				}
				//刷新新、旧target节点的配置信息
				changeNodeInfo(curSelCell.target.id, true);
				changeNodeInfo(oldTarget.id, true);
				isChange = true;
			}
		}
		if (isChange) {
			var lineType = "";
			//生成线上的文本信息（序号）
			if (curSelCell.value == null && !curSelCell.value) {
				graph.cellLabelChanged(curSelCell, "" + getEdgeCount(), null);
				ownerEditor.editor.undoManager.indexOfNextAdd -= 1;
				ownerEditor.editor.undoManager.history.pop();
				lineType = "生成线";
			} else {
				lineType = "改变线";
			}
			//刷新操作痕迹树
			refrashHistoryZtree(lineType + "【" + curSelCell.value + "】");
			//自动保存图形化
			autoSaveGraph();
			graph.edgeArr[curSelCell.id] = { "source": curSelCell.source, "target": curSelCell.target };
		}
	}
};
