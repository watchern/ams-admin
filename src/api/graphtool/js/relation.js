let relationVue = null
let nodeData = null
let graph = null
let layeX = -1
let layeY = -1
export var sendVueObj = (_this) => {
    relationVue = _this;
    graph = _this.graph;
    nodeData = graph.nodeData[graph.curCell.id];
    relationVue.nodeIsSet = nodeData.isSet
    layeX = _this.layeX
    layeY = _this.layeY
}

export function init() {
    // init for these samples -- you don't need to call this初始化这些样本 - 您不需要调用它
    if (window.goSamples) {
        goSamples()
    }
    // for conciseness in defining templates为了简洁定义模板
    var make = go.GraphObject.make
    relationVue.myDiagram = make(
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
            click: function() {}
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
    relationVue.myDiagram.nodeTemplate = make(
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
            click: function() {}
        }
    ) // end Node

    // 结束表项目面板
    // 结束垂直面板
    // 结束节点
    relationVue.myDiagram.linkTemplate = make(
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
                    var i = indexOfJoin(data.from)
                    var j = indexOfJoin(data.to)

                    var idx = Math.max(i, j)
                    var compare = ''
                    for (var i = 0; i < relationVue.join[idx].on.length; i++) {
                        var on = relationVue.join[idx].on[i]
                        if ((data.fromPort === on.fromPort && data.toPort === on.toPort) || (data.fromPort === on.toPort && data.toPort === on.fromPort)) {
                            compare = on.compare
                        }
                    }
                    var fromCondition = data.from + "." + data.fromPort;
                    var toCondition = data.to + "." + data.toPort;
                    //重新组织连线关系，start
                    var onArr = [];
                    relationVue.join.forEach( o => {
                        if(typeof o.on !== "undefined"){
                            $.extend(onArr,o.on);
                        }
                    })
                    for(var t=0; t<onArr.length; t++){
                        if(onArr[t].from === data.from && onArr[t].fromPort === data.fromPort && onArr[t].to === data.to && onArr[t].toPort === data.toPort){
                            fromCondition = onArr[t].fromCondition;
                            toCondition = onArr[t].toCondition;
                            break;
                        }
                    }
                    //重新组织连线关系，end

                    relationVue.comper = compare
                    relationVue.mainPort = data.fromPort
                    relationVue.toPort = data.toPort
                    relationVue.from = data.from
                    relationVue.to = data.to
                    relationVue.useMainPort = fromCondition
                    relationVue.useToPort = toCondition
                    relationVue.showJoinArea = true
                    showJoin(data)
                } catch (e) {}
            }
        }
    )
    relationVue.myDiagram.model = make(
        go.GraphLinksModel,
        {
            copiesArrays: true,
            copiesArrayObjects: true,
            linkFromPortIdProperty: 'fromPort',
            linkToPortIdProperty: 'toPort',
            nodeDataArray: [],
            linkDataArray: []
        }
    )

    // this is a bit inefficient, but should be OK for normal-sized graphs with reasonable numbers of items per node
    // 这有点效率低，但对于每个节点具有合理数量项目的正常大小的图表应该没问题
    function findAllSelectedItems() {
        var items = []
        for (var nit = relationVue.myDiagram.nodes; nit.next();) {
            var node = nit.value
            var table = node.findObject('TABLE')
            if (table) {
                for (var iit = table.elements; iit.next();) {
                    var itempanel = iit.value
                    console.log(0)
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
    relationVue.myDiagram.commandHandler.canDeleteSelection = function() {
        // true if there are any selected deletable nodes or links,
        // or if there are any selected items within nodes
        // 如果有任何选定的可删除节点或链接，则为true
        // 或者节点中是否有任何选定的项目
        return go.CommandHandler.prototype.canDeleteSelection.call(relationVue.myDiagram.commandHandler) || findAllSelectedItems().length > 0
    }

    relationVue.myDiagram.commandHandler.deleteSelection = function() {
        go.CommandHandler.prototype.deleteSelection.call(relationVue.myDiagram.commandHandler)
    }

    // 禁用键盘快捷键事件
    relationVue.myDiagram.commandHandler.doKeyDown = function() {
        var e = relationVue.myDiagram.lastInput
        var control = e.control || e.meta
        var key = e.key
        // 取消Ctrl+X/C/V键的命令关联:
        if (control && (key === 'X' || key === 'C' || key === 'V' || key === 'Z' || key === 'Y')) return
        // 取消Del/Backspace删除键的命令关联:
        // if (key === 'Del' || key === 'Backspace') return;
        go.CommandHandler.prototype.doKeyDown.call(this)
    }

    relationVue.myDiagram.addModelChangedListener(function(evt) {
        if (!evt.isTransactionFinished) { return }
        var txn = evt.object
        var count = 0
        if (txn === null) { return }
        txn.changes.each(function(e) {
            // 连线修改
            if (e.change === go.ChangedEvent.Property) {
                if (e.modelChange === 'linkFromKey' || e.modelChange === 'linkToKey' || e.modelChange === 'linkToPortId' || e.modelChange === 'linkFromPortId') {
                    let objold = {...{},...e.object}
                    let obj = {...{},...e.object}
                    switch (e.modelChange) {
                        case "linkFromKey"://换源节点
                            objold.from = e.oldValue
                            obj.from = e.newValue
                            break;
                        case "linkToKey"://换目标节点
                            objold.to = e.oldValue
                            obj.to = e.newValue
                            break;
                        case "linkToPortId"://换线的目标列
                            objold.toPort = e.oldValue
                            obj.toPort = e.newValue
                            break;
                        case "linkFromPortId"://换线的源列
                            objold.fromPort = e.oldValue
                            obj.fromPort = e.newValue
                            break;
                    }
                    let idxold = Math.max(indexOfJoin(objold.from), indexOfJoin(objold.to)) // 求最大的
                    let delIdxold = -1
                    for (let i = 0; i < relationVue.join[idxold].on.length; i++) {
                        if (relationVue.join[idxold].on[i].fromPort === objold.fromPort && relationVue.join[idxold].on[i].toPort === objold.toPort) {
                            delIdxold = i
                            break
                        }
                    }
                    relationVue.join[idxold].on.splice(delIdxold, 1)
                    if (relationVue.join[idxold].on.length === 0) {
                        relationVue.join[idxold].type = ','
                        delete relationVue.join[idxold].on
                    }
                    idxold = Math.max(indexOfJoin(obj.from), indexOfJoin(obj.to))
                    if (relationVue.join[idxold].type === ',') {
                        relationVue.join[idxold].type = 'INNER JOIN'
                    }
                    if (!relationVue.join[idxold].on) {
                        relationVue.join[idxold].on = []
                    }
                    relationVue.join[idxold].on.push({
                        from: obj.from,
                        to: obj.to,
                        fromPort: obj.fromPort,
                        toPort: obj.toPort,
                        compare: '=',
                        fromCondition : obj.from + "." + obj.fromPort,
                        toCondition : obj.to + "." + obj.toPort
                    })
                    relationVue.comper = '='
                    relationVue.mainPort = ''
                    relationVue.toPort = ''
                    relationVue.from = ''
                    relationVue.to = ''
                    relationVue.useMainPort = ''
                    relationVue.useToPort = ''
                    showJoin(obj)
                    relationVue.showJoinArea = true
                }
            }
            // 连线新增
            else if (e.change === go.ChangedEvent.Insert && e.modelChange === 'linkDataArray') {
                try {} catch (e) {}
                addLine(e.newValue, true)				// 节点新增核心方法
            }
            // 连线删除
            else if (e.change === go.ChangedEvent.Remove && e.modelChange === 'linkDataArray') {
                try {} catch (e) {}
                let from = indexOfJoin(e.oldValue.from)
                let to = indexOfJoin(e.oldValue.to)
                const idx = Math.max(from, to)
                var delIdx = -1
                for (let i = 0; i < relationVue.join[idx].on.length; i++) {
                    if (relationVue.join[idx].on[i].fromPort === e.oldValue.fromPort && relationVue.join[idx].on[i].toPort === e.oldValue.toPort) {
                        delIdx = i
                        break
                    }
                }
                relationVue.join[idx].on.splice(delIdx, 1)
                try {
                    if (relationVue.join[idx].on.length === 0) {
                        relationVue.join[idx].type = ','
                        delete relationVue.join[idxold].on
                    }
                } catch (e) {}
                relationVue.showTableJoin = false
                relationVue.showJoinArea = false
            }

            // 节点删除
            else if (e.change === go.ChangedEvent.Remove && e.modelChange === 'nodeDataArray') {
                relationVue.join.splice(relationVue.join.indexOf(e.oldValue), 1)
                tableNames.splice(tableNames.indexOf(e.oldValue.chineseName), 1)
                keyNames.splice(keyNames.indexOf(e.oldValue.key), 1)
                relationVue.showTableJoin = false
                relationVue.showJoinArea = false
            }
            // 节点新增
            else if (e.change === go.ChangedEvent.Insert && e.modelChange === 'nodeDataArray') {
                addNode(e.newValue,true)				// 新增节点核心方法
            }
        })
    })
    // 加载图表,start
    if (relationVue.nodeIsSet) {
        if(nodeData.setting.join){
            relationVue.join = nodeData.setting.join
        }
        if (nodeData.setting.sqlEdit) {
            let obj = JSON.parse(nodeData.setting.sqlEdit)
            relationVue.myDiagram.model = go.Model.fromJson(nodeData.setting.sqlEdit)
            // 获取节点数据
            let nodeDataArray = obj.nodeDataArray
            // 获取连线数据
            let linkDataArray = obj.linkDataArray
            // 动态增加关联关系,start
            for (let i = 0; i < nodeDataArray.length; i++) {
                addNode(nodeDataArray[i],false)
            }
            for (let j = 0; j < linkDataArray.length; j++) {
                addLine(linkDataArray[j], false)
            }
            // 动态增加关联关系,end
            // 组装输出列的表格,start
            for (let k = 0; k < nodeData.columnsInfo.length; k++) {
                let id = k
                let resourceTableName = nodeData.columnsInfo[k].resourceTableName
                let rtn = nodeData.columnsInfo[k].rtn
                const columnInfo = nodeData.columnsInfo[k]
                let columnName = nodeData.columnsInfo[k].columnName
                let selectColumnName = nodeData.columnsInfo[k].selectColumnName
                let disColumnName = nodeData.columnsInfo[k].newColumnName
                let nodeId = nodeData.columnsInfo[k].nodeId
                let checked = true
                if(nodeData.columnsInfo[k].isOutputColumn === 0){
                    checked = false
                    if(relationVue.checkAll){
                        relationVue.checkAll = false
                    }
                }
                console.log(1)
                relationVue.items.push({id,nodeId,rtn,columnInfo,columnName,disColumnName,resourceTableName,checked,selectColumnName})
                relationVue.columnsInfo.push({...{},...nodeData.columnsInfo[k]})
            }
            // 组装输出列的表格,end
        }
    } else {
        let cells = graph.curCell.getSourceNodes()
        let dom = document.getElementById('myDiagramDiv')
        let height = dom.getBoundingClientRect().height
        let offsetY = 0 - height / 2
        let idNum = 0
        for (let i = 0; i < cells.length; i++) {
            let curNodeId = cells[i].id
            // 判断前置节点是否为未配置的结果表
            let optType = graph.nodeData[curNodeId].nodeInfo.optType
            let isSet = graph.nodeData[curNodeId].isSet
            let rtn = '"' + graph.nodeData[curNodeId].nodeInfo.nodeName + '"'
            let resourceTableName = graph.nodeData[curNodeId].nodeInfo.resultTableName
            let columnsInfo = graph.nodeData[curNodeId].columnsInfo
            let nodeId = graph.nodeData[curNodeId].nodeInfo.nodeId
            if (optType === 'newNullNode' && !isSet) {
                let parentIds = graph.nodeData[curNodeId].parentIds
                let preNodeData = graph.nodeData[parentIds[0]]
                resourceTableName = preNodeData.nodeInfo.resultTableName
                rtn = '"' + preNodeData.nodeInfo.nodeName + '"_' + rtn
                columnsInfo = preNodeData.columnsInfo
                nodeId = preNodeData.nodeInfo.nodeId
            }
            // 组装图表和输出列的表格,start
            let local = `${i*100} ${layeY}${offsetY}`
            let table = {
                'key': resourceTableName, // 表名
                'tableName': resourceTableName,
                'nodeId': curNodeId,
                'chineseName': cells[i].value,
                'type': 'INNER JOIN',
                'loc': local// 在画布上的位置
            }
            let fieldArr = []
            for (let j = 0; j < columnsInfo.length; j++) {
                if (columnsInfo[j].isOutputColumn === 1) {
                    let field = {}
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
            for (let k = 0; k < columnsInfo.length; k++) {
                if (columnsInfo[k].isOutputColumn === 1) {
                    let id = idNum
                    let columnInfo = {...{},...columnsInfo[k]}
                    // table.key + "." + 
                    let selectColumnName = table.key + "." + columnsInfo[k].newColumnName
                    let columnName = columnsInfo[k].newColumnName
                    let disColumnName = columnsInfo[k].newColumnName
                    let checked = false
                    relationVue.items.push({id,nodeId,rtn,columnInfo,columnName,disColumnName,resourceTableName,checked,selectColumnName})
                    relationVue.columnsInfo.push({...columnsInfo[k],...{"nodeId":nodeId,"rtn":rtn,"resourceTableName":resourceTableName}})
                    idNum++
                }
            }
            // 组装输出列的表格,end
        }
    }
    // 加载图表,end
}

/**
 * 新增/加载连接线
 * @param obj 连接线对象
 * @param isAdd 是否是新增操作
 */
function addLine(obj, isAdd) {
    const idx = Math.max(indexOfJoin(obj.from), indexOfJoin(obj.to))
    if (relationVue.join[idx].type === ',') {
        relationVue.join[idx].type = 'INNER JOIN'
    }
    if (!relationVue.join[idx].on) {
        relationVue.join[idx].on = []
    }
    let fromCondition = obj.from + "." + obj.fromPort;
    let toCondition = obj.to + "." + obj.toPort;
    if(isAdd){
        relationVue.join[idx].on.push({
            from: obj.from,
            to: obj.to,
            fromPort: obj.fromPort,
            toPort: obj.toPort,
            compare: '=',
            fromCondition : fromCondition,
            toCondition : toCondition
        })
    }else{
        if(typeof obj.fromCondition !== "undefined" && typeof obj.toCondition !== "undefined"){
            fromCondition = obj.fromCondition;
            toCondition = obj.toCondition;
        }
    }
    relationVue.comper = '='
    relationVue.mainPort = obj.fromPort
    relationVue.toPort = obj.toPort
    relationVue.from = obj.from
    relationVue.to = obj.to
    relationVue.useMainPort = fromCondition
    relationVue.useToPort = toCondition
    relationVue.showJoinArea = true
    showJoin(obj)
}

function addNode(obj,isAdd) {
    if(isAdd){
        relationVue.join.push(obj)
    }

    relationVue.showJoinArea = false
}

/**
 * 保存编辑后的连接条件
 * @param type
 */
export function saveCondition(type) {
    const idx = Math.max(indexOfJoin(relationVue.from), indexOfJoin(relationVue.to));
    let onArr = relationVue.join[idx].on
    if (typeof onArr !== "undefined" && onArr.length > 0) {
        for(var t=0; t<onArr.length; t++){
            if(onArr[t].from === relationVue.from && onArr[t].to === relationVue.to && onArr[t].fromPort === relationVue.mainPort && onArr[t].toPort === relationVue.toPort){
                if(type === "from"){
                    onArr[t].fromCondition = relationVue.useMainPort;
                }else{//type === "to"
                    onArr[t].toCondition = relationVue.useToPort;
                }
                break;
            }
        }
    }
}

// 查询join里对象的idx
export function indexOfJoin(tableName) {
    let idx = -1
    for (let i = 0; i < relationVue.join.length; i++) {
        if (relationVue.join[i].key === tableName || relationVue.join[i].chineseName === tableName) {
            idx = i
            break
        }
    }
    return idx
}
// 显示表连接关系
function showJoin(curLine) {
    try {
        if (relationVue.join.length > 0) {
            for (var i = 0; i < relationVue.join.length; i++) {
                var joinData = relationVue.join[i]
                if ((typeof curLine !== 'undefined' && (curLine.from === joinData.key || curLine.to === joinData.key)) || typeof curLine === 'undefined') {
                    if (!relationVue.joinShow) {
                        relationVue.mainTableName = joinData.chineseName
                        relationVue.joinShow = true
                        continue
                    }
                    relationVue.joinType = joinData.type
                    relationVue.slaverTableName = joinData.chineseName
                    changeType();
                    relationVue.joinShow = false;
                }
            }
            relationVue.showTableJoin = true
        }
    } catch (e) {}
}

function get() {
    return relationVue.myDiagram
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
        node.fields[i].fun = 'jh'
        node.fields[i].screen = ''
        node.fields[i].condition = ''
        node.fields[i].more = ''
        node.fields[i].key = node.key
        node.fields[i].screen = []
    }
    relationVue.myDiagram.model.addNodeData(node)
}
function createNewAS(asname) {
    var i = 0
    var db = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    while (tableNames.indexOf(asname + '_' + db[i]) > -1) {
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
    while (keyNames.indexOf(db[ii]) > -1) {
        if (ii >= 26) {
            return 'ml**'
        }
        ii++
    }
    return db[ii]
}

// 生成sql
function toSql() {
    let sql = 'SELECT * FROM '
    for (let i = 0; i < relationVue.join.length; i++) {
        let item = relationVue.join[i]
        if (i !== 0) {
            sql += ' ' + item.type + ' '
        }
        sql += item.tableName + ' ' + item.key + ' '
        if (typeof item.on !== 'undefined') {
            for (let j = 0; j < item.on.length; j++) {
                if (j === 0) {
                    sql += 'ON '
                }
                let option = item.on[j]
                sql += (option.from + '.' + option.fromPort + ' ' + option.compare + ' ' + option.to + '.' + option.toPort + ' ')
                if (j !== item.on.length - 1) {
                    sql += 'AND '
                }
            }
        }
    }
    if (relationVue.join.length === 0) {
        document.getElementById('sql').innerHTML = ''
    } else {
        document.getElementById('sql').innerHTML = sql
    }
    return sql
}
// 改变右上角表关联字段的选项
export function changeCopare(val) {
    let fromtab = relationVue.from
    let totab = relationVue.to
    let fromPort = relationVue.mainPort
    let toPort = relationVue.toPort
    const idx = Math.max(indexOfJoin(fromtab), indexOfJoin(totab))
    for (let k = 0; k < relationVue.join[idx].on.length; k++) {
        if (relationVue.join[idx].on[k].fromPort === fromPort && relationVue.join[idx].on[k].toPort === toPort && relationVue.join[idx].on[k].from === fromtab && relationVue.join[idx].on[k].to === totab) {
            relationVue.join[idx].on[k].compare = val
        }
    }
    showJoin()
}
// 改变join的类型
export function changeType() {
    const idx = indexOfJoin(relationVue.slaverTableName)
    relationVue.join[idx].type = relationVue.joinType
    let index = relationVue.joinTypeArr.findIndex(item => item.value === relationVue.joinType)
    if(index > -1){
        relationVue.joinDescription = relationVue.joinTypeArr[index].description
    }
}

// 提交方法
export function amplify() {
    relationVue.showRight = false
    relationVue.myDiagramDivWidth = 24
    relationVue.$nextTick( () => {
        relationVue.myDiagram.makeSvg()
    })
}
export function reduce() {
    relationVue.showRight = true
    relationVue.myDiagramDivWidth = 18
    relationVue.$nextTick( () => {
        relationVue.myDiagram.makeSvg()
    })
}

export function saveNodeInfo() {
    let columnsInfo = []
    let trDom = relationVue.$refs.outPutTable.$refs.bodyWrapper.children[0].children[1].children
    if(typeof trDom !== 'undefined' && trDom.length > 0){
        $.each(trDom,function () {
            const index = parseInt($(this).find("td:eq(0)>div>div").html()) - 1
            let columnInfo = {...{},...relationVue.items[index].columnInfo}
            let resourceTableName = relationVue.items[index].resourceTableName
            let rtn = relationVue.items[index].rtn
            if (relationVue.items[index].checked) {
                columnInfo.isOutputColumn = 1
            } else {
                columnInfo.isOutputColumn = 0
            }
            columnInfo.selectColumnName = relationVue.items[index].selectColumnName
            columnInfo.columnName = relationVue.items[index].columnName
            columnInfo.newColumnName = relationVue.items[index].disColumnName
            columnInfo.resourceTableName = resourceTableName
            columnInfo.rtn = rtn
            columnInfo.nodeId = relationVue.items[index].nodeId
            columnsInfo.push(columnInfo)
        })
    }
    // 开始保存节点所有数据信息
    let sqlEditStr = JSON.parse(relationVue.myDiagram.model.toJson());
    sqlEditStr.nodeDataArray = relationVue.join;
    //重新组织连线关系，start
    var onArr = [];
    relationVue.join.forEach(e => {
        if(typeof e.on !== "undefined"){
            $.extend(onArr,e.on);
        }
    })
    sqlEditStr.linkDataArray.forEach(e => {
        for(var t=0; t<onArr.length; t++){
            if(onArr[t].from === e.from && onArr[t].fromPort === e.fromPort && onArr[t].to === e.to && onArr[t].toPort === e.toPort){
                e.fromCondition = onArr[t].fromCondition;
                e.toCondition = onArr[t].toCondition;
                break;
            }
        }
    })
    //重新组织连线关系，end
    nodeData.setting.sqlEdit = JSON.stringify(sqlEditStr);
    nodeData.setting.join = relationVue.join//此处再存储一份是为了后端组装SQL语句
    nodeData.columnsInfo = columnsInfo
    relationVue.$refs.basicVueRef.save_base()						// 保存基础信息
    nodeData.isSet = true
}
