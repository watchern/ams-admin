(function(global, factory) {
  (global.Relation = factory())
}(this, function() {
  'use strict'

  var models = []
  var linkData = []
  var join = []// 储存node对象
  // 构造函数
  var Relation = function() {
    this.init = init
    this.addNodeData = addNodeData
    this.get = get
    this.initSql = initSql
    // this.toSql = toSql;
    this.changeCopare = changeCopare
    this.changeType = changeType
    this.join = join
    // TODO 以下属性在编写完毕要删除
    this.hb = hb
    this.hbsx = hbsx
    this.saveNodeInfo = saveNodeInfo
  }
  var myDiagram

  function init() {
    // init for these samples -- you don't need to call this初始化这些样本 - 您不需要调用它
    if (window.goSamples) {
      goSamples()
    }
    // for conciseness in defining templates为了简洁定义模板
    var make = go.GraphObject.make
    myDiagram = make(
      go.Diagram,
      'myDiagramDiv',
      {
        validCycle: go.Diagram.CycleNotDirected, // don't allow loops不允许循环
        // For this sample, automatically show the state of the diagram's model on the page
        'ModelChanged': function(e) {
          if (e.isTransactionFinished) {
            // toSql();
          }
        },
        'undoManager.isEnabled': true,
        click: function() {
          // $("#form").html("");
          // document.getElementById("join2").style.display="none";
          // document.getElementById("select").style.display="none";
          // document.getElementById("join1").style.display="none";
        }
      }
    )

    // This template is a Panel that is used to represent each item in a Panel.itemArray.
    // 此模板是一个Panel，用于表示Panel.itemArray中的每个项目。
    // The Panel is data bound to the item object.
    // Panel是绑定到item对象的数据。
    var fieldTemplate = make(
      go.Panel,
      'TableRow', // this Panel is a row in the containing Table   此Panel是包含表中的一行
      new go.Binding('portId', 'name'), // this Panel is a "port"  这个小组是一个“港口”
      {
        background: 'transparent', // so this port's background can be picked by the mouse  所以这个港口的背景可以被鼠标选中
        fromSpot: go.Spot.LeftRightSides, // links only go from the right side to the left side 链接只从右侧到左侧
        toSpot: go.Spot.LeftRightSides,
        fromLinkable: true,
        toLinkable: true
      },
      make(
        go.TextBlock,
        {
          margin: new go.Margin(0, 2),
          column: 1,
          font: 'bold 13px sans-serif',
          width: 150
        },
        new go.Binding('text', 'name')
      )
    )

    // This template represents a whole "record".此模板代表整个“记录”。
    myDiagram.nodeTemplate = make(
      go.Node,
      'Auto',
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      // this rectangular shape surrounds the content of the node:这个矩形形状围绕着节点的内容
      make(go.Shape, { fill: '#EEEEEE' }),
      // the content consists of a header and a list of items  内容由标题和项目列表组成
      make(
        go.Panel,
        'Vertical',
        // this is the header for the whole node  这是整个节点的标题
        make(
          go.Panel,
          'Auto',
          { stretch: go.GraphObject.Horizontal }, // as wide as the whole node  和整个节点一样宽
          make(go.Shape, { fill: '#3d80c4', stroke: null }),
          make(
            go.TextBlock,
            {
              alignment: go.Spot.Center,
              margin: 3,
              stroke: 'white',
              textAlign: 'center',
              font: 'bold 12pt sans-serif'
            },
            new go.Binding('text', 'chineseName')
          )
        ),
        // this Panel holds a Panel for each item object in the itemArray;
        // each item Panel is defined by the itemTemplate to be a TableRow in this Table
        // 此Panel为itemArray中的每个item对象保存一个Panel;
        // 每个项目Panel由itemTemplate定义为此表中的TableRow
        make(
          go.Panel,
          'Table',
          {
            name: 'TABLE',
            padding: 2,
            minSize: new go.Size(100, 10),
            defaultStretch: go.GraphObject.Horizontal,
            itemTemplate: fieldTemplate
          },
          new go.Binding('itemArray', 'fields')
        ) // end Table Panel of items
      ) // end Vertical Panel
      , {
        click: function() {
          // $("#form").html("");
          // document.getElementById("join2").style.display="none";
          // document.getElementById("select").style.display="none";
          // document.getElementById("join1").style.display="none";
        }
      }
    ) // end Node

    // 结束表项目面板
    // 结束垂直面板
    // 结束节点
    myDiagram.linkTemplate = make(
      go.Link,
      {
        relinkableFrom: true,
        relinkableTo: true,
        toShortLength: 4
      }, // let user reconnect links让用户重新连接链接
      make(go.Shape, { strokeWidth: 1.5 }),
      // make(go.Shape, {toArrow: "Standard", stroke: null}),
      {
        // allow the user to select items -- the background color indicates whether "selected"
        // 允许用户选择项目 - 背景颜色表示是否“选中”
        // maybe this should be more sophisticated than simple toggling of selection
        // 也许这应该比简单的选择切换更复杂
        click: function(e, item) {
          // 线的点击事件
          try {
            var data = item.data

            var from = data.from
            var to = data.to
            var i = indexOfJoin(from)
            var j = indexOfJoin(to)

            var idx = Math.max(i, j)
            var compare = ''
            for (var i = 0; i < join[idx].on.length; i++) {
              var on = join[idx].on[i]
              if ((data.fromPort == on.fromPort && data.toPort == on.toPort) || (data.fromPort == on.toPort && data.toPort == on.fromPort)) {
                compare = on.compare
              }
            }
            $('#comper').val(compare)
            $('#MainPort').val(data.fromPort)
            $('#toPort').val(data.toPort)
            $('#from').val(data.from)
            $('#to').val(data.to)
            document.getElementById('join2').style.display = ''
            document.getElementById('select').style.display = ''
            document.getElementById('join1').style.display = ''
            showJoin(data)
          } catch (e) {}
        }
      }
    )
    myDiagram.model = make(
      go.GraphLinksModel,
      {
        copiesArrays: true,
        copiesArrayObjects: true,
        linkFromPortIdProperty: 'fromPort',
        linkToPortIdProperty: 'toPort',
        nodeDataArray: models,
        linkDataArray: linkData
      }
    )

    // this is a bit inefficient, but should be OK for normal-sized graphs with reasonable numbers of items per node
    // 这有点效率低，但对于每个节点具有合理数量项目的正常大小的图表应该没问题
    function findAllSelectedItems() {
      var items = []
      for (var nit = myDiagram.nodes; nit.next();) {
        var node = nit.value
        var table = node.findObject('TABLE')
        if (table) {
          for (var iit = table.elements; iit.next();) {
            var itempanel = iit.value
            if (itempanel.background !== 'transparent') {
              items.push(itempanel)
            }
          }
        }
      }
      return items
    }

    // Override the standard CommandHandler deleteSelection behavior.
    // If there are any selected items, delete them instead of deleting any selected nodes or links.
    // 覆盖标准CommandHandler deleteSelection行为。
    // 如果有任何选定的项目，请删除它们，而不是删除任何选定的节点或链接。
    myDiagram.commandHandler.canDeleteSelection = function() {
      // true if there are any selected deletable nodes or links,
      // or if there are any selected items within nodes
      // 如果有任何选定的可删除节点或链接，则为true
      // 或者节点中是否有任何选定的项目
      return go.CommandHandler.prototype.canDeleteSelection.call(myDiagram.commandHandler) || findAllSelectedItems().length > 0
    }

    myDiagram.commandHandler.deleteSelection = function() {
      go.CommandHandler.prototype.deleteSelection.call(myDiagram.commandHandler)
      return
    }

    // 禁用键盘快捷键事件
    myDiagram.commandHandler.doKeyDown = function() {
		    var e = myDiagram.lastInput
		    var control = e.control || e.meta
		    var key = e.key
		    // 取消Ctrl+X/C/V键的命令关联:
		    if (control && (key === 'X' || key === 'C' || key === 'V' || key === 'Z' || key === 'Y')) return
		    // 取消Del/Backspace删除键的命令关联:
		    // if (key === 'Del' || key === 'Backspace') return;
		    go.CommandHandler.prototype.doKeyDown.call(this)
    }

    myDiagram.addModelChangedListener(function(evt) {
      if (!evt.isTransactionFinished) { return }
      var txn = evt.object
      var count = 0
      if (txn === null) { return }
      txn.changes.each(function(e) {
        // 连线修改
        if (e.change === go.ChangedEvent.Property) {
          if (e.modelChange === 'linkFromKey' || e.modelChange === 'linkToKey' || e.modelChange === 'linkToPortId' || e.modelChange === 'linkFromPortId') {
            var objold = e.object
            if (e.modelChange === 'linkFromKey') { // 模型修改等于fromkey 就是换源节点
              objold.from = e.oldValue
            }
            if (e.modelChange === 'linkToKey') { // 模型修改等于tokey 就是换目标节点
              objold.to = e.oldValue
            }
            if (e.modelChange === 'linkToPortId') { // 模型修改等于portid 就是换线的目标列
              objold.toPort = e.oldValue
            }
            if (e.modelChange === 'linkFromPortId') { // 模型修改等于portid 就是换线的源列
              objold.fromPort = e.oldValue
            }
            var iold = indexOfJoin(objold.from)// 源节点在join里的下标
            var jold = indexOfJoin(objold.to)// 目标节点在join里的下标
            var idxold = Math.max(iold, jold) // 求最大的
            var delIdxold = -1
            for (var i = 0; i < join[idxold].on.length; i++) {
              if (join[idxold].on[i].fromPort === objold.fromPort && join[idxold].on[i].toPort === objold.toPort) {
                delIdxold = i
                break
              }
            }
            join[idxold].on.splice(delIdxold, 1)
            if (join[idxold].on.length === 0) {
              join[idxold].type = ','
              delete join[idxold].on
            }
            var obj = e.object
            if (e.modelChange === 'linkFromKey') {
              obj.from = e.newValue
            }
            if (e.modelChange === 'linkToKey') {
              obj.to = e.newValue
            }
            if (e.modelChange === 'linkToPortId') {
              obj.toPort = e.newValue
            }
            if (e.modelChange === 'linkFromPortId') {
              obj.fromPort = e.newValue
            }
            var i = indexOfJoin(obj.from)
            var j = indexOfJoin(obj.to)
            var idx = Math.max(i, j)
            if (join[idx].type === ',') {
              join[idx].type = 'INNER JOIN'
            }
            if (!join[idx].on) {
              join[idx].on = []
            }
            join[idx].on.push({
              from: obj.from,
              to: obj.to,
              fromPort: obj.fromPort,
              toPort: obj.toPort,
              compare: '='
            })
            $('#comper').val('=')
            $('#MainPort').val('')
            $('#toPort').val('')
            $('#from').val('')
            $('#to').val('')
            showJoin()
            // toSql();
            document.getElementById('join2').style.display = 'none'
            document.getElementById('select').style.display = 'none'
            document.getElementById('join1').style.display = 'none'
          }
        }
        // 连线新增
        else if (e.change === go.ChangedEvent.Insert && e.modelChange === 'linkDataArray') {
          try {} catch (e) {}
          var obj = e.newValue
          addLine(obj, true)				// 节点新增核心方法
        }
        // 连线删除
        else if (e.change === go.ChangedEvent.Remove && e.modelChange === 'linkDataArray') {
          try {} catch (e) {}
          var obj = e.oldValue
          var i = indexOfJoin(obj.from)
          var j = indexOfJoin(obj.to)
          var idx = Math.max(i, j)
          var delIdx = -1
          for (var i = 0; i < join[idx].on.length; i++) {
            if (join[idx].on[i].fromPort === obj.fromPort && join[idx].on[i].toPort === obj.toPort) {
              delIdx = i
              break
            }
          }
          join[idx].on.splice(delIdx, 1)
          try {
            if (join[idx].on.length === 0) {
              join[idx].type = ','
              delete join[idxold].on
            }
          } catch (e) {}
          $('#form').html('')
          // toSql();
          document.getElementById('join2').style.display = 'none'
          document.getElementById('select').style.display = 'none'
          document.getElementById('join1').style.display = 'none'
        }

        // 节点删除
        else if (e.change === go.ChangedEvent.Remove && e.modelChange === 'nodeDataArray') {
          join.splice(join.indexOf(e.oldValue), 1)
          tableNames.splice(tableNames.indexOf(e.oldValue.chineseName), 1)
          keyNames.splice(keyNames.indexOf(e.oldValue.key), 1)
          $('#form').html('')
          // toSql();
          document.getElementById('join2').style.display = 'none'
          document.getElementById('select').style.display = 'none'
          document.getElementById('join1').style.display = 'none'
        }
        // 节点新增
        else if (e.change === go.ChangedEvent.Insert && e.modelChange === 'nodeDataArray') {
          addNode(e.newValue)				// 新增节点核心方法
        }
      })
    })
    // 加载图表,start
    var curIsSet = nodeData.isSet			// 判断当前节点是否配置过
    if (curIsSet) {
      if (nodeData.setting.sqlEdit) {
        var columnsInfo = nodeData.columnsInfo
        var obj = JSON.parse(nodeData.setting.sqlEdit)
        myDiagram.model = go.Model.fromJson(nodeData.setting.sqlEdit)
        // 获取节点数据
        var nodeDataArray = obj.nodeDataArray
        // 获取连线数据
        var linkDataArray = obj.linkDataArray
        // 动态增加关联关系,start
        for (var i = 0; i < nodeDataArray.length; i++) {
          addNode(nodeDataArray[i])
        }
        for (var j = 0; j < linkDataArray.length; j++) {
          addLine(linkDataArray[j], false)
        }
        // 动态增加关联关系,end
        // 组装输出列的表格,start
        for (var k = 0; k < columnsInfo.length; k++) {
          var html = "<tr class='colTr' rtn='" + columnsInfo[k].resourceTableName + "' columnInfo='" + JSON.stringify(columnsInfo[k]) + "'><td>" + columnsInfo[k].rtn + '</td>'
	                html += '<td>' + columnsInfo[k].columnName + '</td>'
          html += "<td><input type='text' class='newColumn form-control sea_text' value='" + columnsInfo[k].newColumnName + "'/></td>"
          if (columnsInfo[k].isOutputColumn == 1) {
                    	 html += "<td class='text-center'><div class='ck_" + k + " ckbox icheckbox_square-purple icheck-item icheck[3xrz1] checked'>"
                    	 html += "<input type='checkbox'  name='" + columnsInfo[k].newColumnName + "' class='form-control  icheck-input icheck[3xrz1]'/></div></td>"
          } else {
                    	 html += "<td class='text-center'><div class='ck_" + k + " ckbox icheckbox_square-purple icheck-item icheck[3xrz1]'>"
                    	 html += "<input type='checkbox'  name='" + columnsInfo[k].newColumnName + "' class='form-control  icheck-input icheck[3xrz1]'/></div></td>"
          }
	                html += '</tr>'
	                $('#column_config>tbody').append(html).sortable().disableSelection()
	                register('ck_' + k)
        }
        var num = 0
		        $('.colTr').each(function() {
		        	if (!$(this).find('.ckbox').hasClass('checked')) {
            $('#sel_all').removeAttr('checked')
            num++
            return false
		        	}
		        })
		        if (num === 0) {
          $('#sel_all').parent().addClass('checked')
		        }
        // 组装输出列的表格,end
      }
    } else {
      var cells = graph.curCell.getSourceNodes()
      var dom = document.getElementById('myDiagramDiv')
      var height = dom.getBoundingClientRect().height
      var offsetY = 0 - height / 2
      var cordinateY = layeY + offsetY
      var combineColumnsInfo = []
      for (var i = 0; i < cells.length; i++) {
        var curNodeId = cells[i].id
        // 判断前置节点是否为未配置的结果表
        var optType = graph.nodeData[curNodeId].nodeInfo.optType
        var isSet = graph.nodeData[curNodeId].isSet
        var rtn = '"' + graph.nodeData[curNodeId].nodeInfo.nodeName + '"'
        var resourceTableName = graph.nodeData[curNodeId].nodeInfo.resultTableName
        var columnsInfo = graph.nodeData[curNodeId].columnsInfo
        if (optType === 'newNullNode' && !isSet) {
          var parentIds = graph.nodeData[curNodeId].parentIds
          var preNodeData = graph.nodeData[parentIds[0]]
          resourceTableName = preNodeData.nodeInfo.resultTableName
          rtn = '"' + preNodeData.nodeInfo.nodeName + '"_' + rtn
          columnsInfo = preNodeData.columnsInfo
        }
        resourceTableName = strDecryption(resourceTableName)
        // 组装图表和输出列的表格,start
        var cordinateX = i * 100
        var local = cordinateX + ' ' + cordinateY
        var table = {
          'key': resourceTableName, // 表名
          'tableName': resourceTableName,
          'nodeId': curNodeId,
          'chineseName': cells[i].value,
          'type': 'INNER JOIN',
          'loc': local// 在画布上的位置
        }
        var fieldArr = []
        for (var j = 0; j < columnsInfo.length; j++) {
          if (columnsInfo[j].isOutputColumn === 1) {
            var field = {}
            field.name = columnsInfo[j].newColumnName
            field.color = '#FFFFFF'
            field.hidden = true
            field.alias = columnsInfo[j].newColumnName
            fieldArr.push(field)
          }
        }
        table.fields = fieldArr
        addNodeData(table)
        // 组装图表,end
        // 组装输出列的表格,start
        var html = ''
        for (var k = 0; k < columnsInfo.length; k++) {
          if (columnsInfo[k].isOutputColumn === 1) {
            combineColumnsInfo.push(columnsInfo[k])
            html = "<tr class='colTr' rtn='" + resourceTableName + "' columnInfo='" + JSON.stringify(columnsInfo[k]) + "'><td>" + rtn + '</td>'
            html += '<td>' + columnsInfo[k].newColumnName + '</td>'
            html += "<td><input  type='text' class='newColumn form-control sea_text' value='" + columnsInfo[k].newColumnName + "'/></td>"
            html += "<td class='text-center'><div class='ck_" + i + '_' + k + " ckbox icheckbox_square-purple icheck-item icheck[3xrz1]'>"
            html +=	"<input type='checkbox'  name='" + columnsInfo[k].newColumnName + "' class='form-control  icheck-input icheck[3xrz1]'/></div></td>"
            html += '</tr>'
            $('#column_config>tbody').append(html).sortable().disableSelection()
            register('ck_' + i + '_' + k)
          }
        }
        // 组装输出列的表格,end
      }
      nodeData.columnsInfo = JSON.parse(JSON.stringify(combineColumnsInfo))
    }
    // 加载图表,end
  }

  function register(className) {
    $('.' + className).click(function() {
    		if ($(this).hasClass('checked')) {
    			if ($('#sel_all').parent().hasClass('checked')) {
    				$('#sel_all').parent().removeClass('checked')
    			}
    			$(this).removeClass('checked')
    		} else {
    			$(this).addClass('checked')
    			var trNum = $('.ckbox').length; var ckNum = 0
    			$('.ckbox').each(function(i, v) {
        			if ($(this).hasClass('checked')) {
        				ckNum++
        			}
        		})
        		if (trNum === ckNum) {
        			$('#sel_all').parent().addClass('checked')
        		}
    		}
    	})
  }

  /**
	 * 新增/加载连接线
     * @param obj 连接线对象
	 * @param isAdd 是否是新增操作
     */
  function addLine(obj, isAdd) {
    var i = indexOfJoin(obj.from)
    var j = indexOfJoin(obj.to)
    var idx = Math.max(i, j)
    if (join[idx].type === ',') {
      join[idx].type = 'INNER JOIN'
    }
    if (!join[idx].on) {
      join[idx].on = []
    }
    if (isAdd) {
      join[idx].on.push({
        from: obj.from,
        to: obj.to,
        fromPort: obj.fromPort,
        toPort: obj.toPort,
        compare: '='
      })
    }
    $('#comper').val('=')
    $('#MainPort').val(obj.fromPort)
    $('#toPort').val(obj.toPort)
    $('#from').val(obj.from)
    $('#to').val(obj.to)
    document.getElementById('join2').style.display = ''
    document.getElementById('select').style.display = ''
    document.getElementById('join1').style.display = ''
    // toSql();
    showJoin(obj)
  }

  function addNode(obj) {
    join.push(obj)
    // toSql();
    document.getElementById('join2').style.display = 'none'
    document.getElementById('select').style.display = 'none'
    document.getElementById('join1').style.display = 'none'
  }

  // 查询join里对象的idx
  function indexOfJoin(tableName) {
    var idx = -1
    for (var i = 0; i < join.length; i++) {
      if (join[i].key === tableName || join[i].chineseName === tableName) {
        idx = i
        break
      }
    }
    return idx
  }
  // 显示表连接关系
  function showJoin(curLine) {
    try {
      $('#form').html('')
      if (join.length > 0) {
        for (var i = 0; i < join.length; i++) {
          var joinData = join[i]
          if ((typeof curLine !== 'undefined' && (curLine.from === joinData.key || curLine.to === joinData.key)) || typeof curLine === 'undefined') {
            if ($('#MainTable').length === 0) {
              var mainHtml = '<div class="form-group" id="join">' +
												'<div class="col-sm-12">' +
													'<input name="MainTable" type="text" class="form-control" id="MainTable" disabled="disabled"></input>' +
												'</div>' +
											'</div>'
              $('#form').html(mainHtml)
              $('#MainTable').val(joinData.chineseName)
              continue
            }
            var joinHtml = '<div class="form-group">' +
											'<label for="" class="col-sm-6 control-label">关联关系：</label>' +
											'<div class="col-sm-6">' +
												'<select id="type' + i + '" style="width:100%" onchange="relation.changeType(' + i + ')">' +
													'<option value="LEFT JOIN">左连接</option>' +
													'<option value="RIGHT JOIN">右连接</option>' +
													'<option value="INNER JOIN">内连接</option>' +
													'<option value="FULL JOIN">外连接</option>' +
												'</select>' +
											'</div>' +
										'</div>' +
										'<div class="form-group">' +
											'<div class="col-sm-12">' +
												'<input name="slaverTable' + i + '" type="text" class="form-control" id="slaverTable' + i + '" disabled="disabled"></input>' +
											'</div>' +
										'</div>'
            $('#join').append(joinHtml)
            $('#type' + i).val(joinData.type)
            $('#slaverTable' + i).val(joinData.chineseName)
          }
        }
      }
    } catch (e) {}
  }

  function get() {
    return myDiagram
  }

  // 生成sql
  function initSql() { return sqlObj }

  // 表名去重记录器
  var tableNames = []
  var keyNames = []
  function addNodeData(node) {
    node.key = createTableName()
    if (node.key === 'ml**') {
      alertMsg('添加失败', '表不允许添加超过26个', 'error')
      return false
    }
    node.chineseName = createNewAS(node.chineseName)
    tableNames.push(node.chineseName)
    keyNames.push(node.key)
    for (var i = 0; i < node.fields.length; i++) {
      node.fields[i].id = node.key + 'id' + node.fields[i].name
      node.fields[i].alias = node.fields[i].alias
      node.fields[i].fun = 'jh'
      node.fields[i].screen = ''
      node.fields[i].condition = ''
      node.fields[i].more = ''
      node.fields[i].key = node.key
      node.fields[i].screen = []
    }
    myDiagram.model.addNodeData(node)
  }
  function createNewAS(asname) {
    var i = 0
    var idx = 0
    var db = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    while (tableNames.indexOf(asname + '_' + db[i]) !== -1) {
      if (i >= 26) {
        return 'ml**'
      }
      i++
    }
    return asname + '_' + db[i]
  }

  function createTableName() {
    var ii = 0
    var db = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    while (keyNames.indexOf(db[ii]) !== -1) {
      if (ii >= 26) {
        return 'ml**'
      }
      ii++
    }
    return db[ii]
  }

  // 生成sql
  function toSql() {
    var sql = 'SELECT * FROM '
    for (var i = 0; i < join.length; i++) {
      var item = join[i]
      if (i !== 0) {
        sql += ' ' + item.type + ' '
      }
      sql += item.tableName + ' ' + item.key + ' '
      if (typeof item.on !== 'undefined') {
        for (var j = 0; j < item.on.length; j++) {
          if (j === 0) {
            sql += 'ON '
          }
          var option = item.on[j]
          sql += (option.from + '.' + option.fromPort + ' ' + option.compare + ' ' + option.to + '.' + option.toPort + ' ')
          if (j !== item.on.length - 1) {
            sql += 'AND '
          }
        }
      }
    }
    if (join.length === 0) {
      document.getElementById('sql').innerHTML = ''
    } else {
		    document.getElementById('sql').innerHTML = sql
    }
    return sql
  }
  // 改变右上角表关联字段的选项
  function changeCopare() {
    var fromtab = $('#from').val()
    var totab = $('#to').val()
    var fromPort = $('#MainPort').val()
    var toPort = $('#toPort').val()
    var copare = $('#comper').val()
    var i = indexOfJoin(fromtab)
    var j = indexOfJoin(totab)
    var idx = Math.max(i, j)
    var editIdx = -1
    for (var k = 0; k < join[idx].on.length; k++) {
      if (join[idx].on[k].fromPort === fromPort && join[idx].on[k].toPort === toPort) {
        join[idx].on[k].compare = copare
      }
    }
    showJoin()
    // toSql();
  }
  // 改变join的类型
  function changeType(i) {
    var slaverTable = $('#slaverTable' + i).val()
    var type = $('#type' + i).val()
    var idx = indexOfJoin(slaverTable)
    join[idx].type = type
    // toSql();
    $('#description').show()
    $('#description>p').hide()
    var index = 0
    switch (type) {
      case 'LEFT JOIN':
        index = 0
        break
      case 'RIGHT JOIN':
        index = 1
        break
      case 'INNER JOIN':
        index = 2
        break
      case 'FULL JOIN':
        index = 3
        break
    }
    $('#description>p:eq(' + index + ')').show()
  }

  // 提交方法
  function hb() {
    $('#tjHidden').hide()
    $('#joins').hide()
    $('#fd').hide()
    $('#tips').hide()
    $('#sx').show()
    $('#dateTree').outerHeight($(document).height() * 0.97)
    document.getElementById('myDiagramDiv').className = 'col-sm-12'
    myDiagram.makeSvg()
  }
  function hbsx() {
    $('#dateTree').outerHeight($(document).height() * 0.585)
    $('#tjHidden').show()
    $('#joins').show()
    $('#fd').show()
    $('#tips').show()
    $('#sx').hide()
    document.getElementById('myDiagramDiv').className = 'col-sm-9'
    myDiagram.makeSvg()
  }

  function saveNodeInfo() {
    var newColumnArr = []; var columnsInfo = []; var isExsist = false
    var diaGramJson = JSON.parse(myDiagram.model.toJson())				// 获取图表的json串
    var nodeDataArray = diaGramJson.nodeDataArray		// 获取节点（图）的数组数据
    var linkDataArray = diaGramJson.linkDataArray
    if (linkDataArray.length === 0) {
      alertMsg('提示', '未设置表间的连接条件', 'warning')
      return false
    }
    $('.newColumn').parent().removeClass('has-error')
    var count = 0
    $('.colTr').each(function(i, v) {
      var columnInfo = JSON.parse($(this).attr('columnInfo'))
      var newColumn = $(this).find('.newColumn').val()// 输出字段名称（别名）
      if ($(this).find('.ckbox').hasClass('checked')) {
        count++
      }
      if ($.inArray(newColumn, newColumnArr) < 0) {
        newColumnArr.push(newColumn)
      } else {
        var index = $.inArray(newColumn, newColumnArr)
        if ($(this).find('.ckbox').hasClass('checked') && $('.colTr:eq(' + index + ')').find('.ckbox').hasClass('checked')) {
          isExsist = true						// 有相同的字段别名
          $('.newColumn:eq(' + index + ')').parent().addClass('has-error')
          $(this).find('.newColumn').parent().addClass('has-error')
          return false
        }
      }
      var tableAlias = ''
      var resourceTableName = $(this).attr('rtn')
      var rtn = $(this).find('td:eq(0)').html()
      for (var j = 0; j < nodeDataArray.length; j++) {
        if (nodeDataArray[j].tableName === resourceTableName) {
          tableAlias = nodeDataArray[j].key					// 获取来源表名称的别名
          break
        }
      }
      if ($(this).find('.ckbox').hasClass('checked')) {
        columnInfo.tableAlias = tableAlias
        columnInfo.isOutputColumn = 1
      } else {
        columnInfo.isOutputColumn = 0
      }
      columnInfo.columnName = $(this).find('td:eq(1)').html()
      columnInfo.newColumnName = newColumn
      columnInfo.resourceTableName = resourceTableName
      columnInfo.rtn = rtn
      columnsInfo.push(columnInfo)
    })
    if (count === 0) {
      alertMsg('提示', '请选择输出字段', 'warning')
      return false
    }
    if (isExsist) {
      alertMsg('提示', '输出字段名称有重复，请修改', 'warning')
      return false
    }
    // 开始保存节点所有数据信息
    var sql = toSql()
    // nodeData.nodeInfo.relationSql = strEncryption(sql);
    nodeData.setting.sqlEdit = myDiagram.model.toJson()
    nodeData.setting.join = join
    nodeData.columnsInfo = columnsInfo
    basicObj.save_base()						// 保存基础信息
    nodeData.isSet = true
    return true
  }

  return Relation
}))
