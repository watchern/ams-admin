<template>
  <div class="example"
       id="parentDiv">
    <div id="myDiagramDiv"></div>
    <div></div>
  </div>
</template>

<script>
import go from "@/utils/go.js";
import {
  selectTableRelationInfo
} from "@/api/lhg/processTree.js";

export default {
  props: {
    tableMetaUuid: {
      type: String,
      default () {
        return ''
      }
    },
  },
  components: {},
  data () {
    return {
      myDiagram: {},
      nodeDataArray: [],
      linkDataArray: [],
    };
  },
  computed: {},
  watch: {},
  mounted () {
    this.init();//初始化表关系
  },
  created () {
  },
  methods: {
    init (num) {
      if (num) {
        this.myDiagram.div = null;
        this.nodeDataArray = [];
        this.linkDataArray = [];
      }
      let $ = go.GraphObject.make; // for conciseness in defining templates
      this.myDiagram = $(
        go.Diagram,
        "myDiagramDiv", // id挂载dome节点
        {
          // allowDelete: false,
          // allowCopy: false,
          // isReadOnly: true, // 只读，无法编辑操作
          // allowMove: true, // 允许拖动画板
          allowDragOut: true, // 允许拖拽节点
          allowDelete: false, // 允许删除节点
          // allowCopy: true, // 允许复制节点
          // allowClipboard: true, // 允许粘贴节点
          allowLink: true,//是否可以绘制新链接。
          allowRelink: true,//是否可以重新连接现有链接
          initialContentAlignment: go.Spot.Center, // 居中显示
          initialAutoScale: go.Diagram.Uniform,  // 缩放以使所有内容都适合
          "grid.visible": true, //显示网格
          layout: $(go.ForceDirectedLayout),
          "undoManager.isEnabled": true, // 支持 Ctrl-Z 和 Ctrl-Y 操作
          "toolManager.hoverDelay": 100, //tooltip提示显示延时
          "toolManager.toolTipDuration": 10000, //tooltip持续显示时间
          "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom, //有鼠标滚轮事件放大和缩小，而不是向上和向下滚动
          // "clickCreatingTool.archetypeNodeData": { text: "111", color: "white" },//允许在后台双击以创建新node258节点
        }
      );
      var itemTempl =
        $(go.Panel, "Horizontal",
          // 整个控件是蓝色背景
          // { background: "#44CCFF" },
          $(go.Shape,
            { desiredSize: new go.Size(15, 15), strokeJoin: "round", strokeWidth: 3, stroke: null, margin: 2 },
            new go.Binding("figure", "figure"),
            new go.Binding("fill", "color"),
            new go.Binding("stroke", "color")),
          $(go.TextBlock,
            {
              stroke: "#333333",
              font: "bold 14px sans-serif"
            },
            new go.Binding("text", "name"))
        );

      // 定义模板
      this.myDiagram.nodeTemplate =
        $(go.Node, "Auto",  // the whole node panel
          {
            selectionAdorned: true,
            resizable: true,
            layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
            fromSpot: go.Spot.AllSides,
            toSpot: go.Spot.AllSides,
            isShadowed: true,
            shadowOffset: new go.Point(3, 3),
            shadowColor: "#C5C1AA"
          },

          // 动态绑定位置信息
          new go.Binding("location", "location").makeTwoWay(),
          // whenever the PanelExpanderButton changes the visible property of the "LIST" panel,
          // clear out any desiredSize set by the ResizingTool.
          new go.Binding("desiredSize", "visible", function (v) { return new go.Size(NaN, NaN); }).ofObject("LIST"),
          // define the node's outer shape, which will surround the Table
          $(go.Shape, "RoundedRectangle",
            { fill: 'white', stroke: "#eeeeee", strokeWidth: 3 }),
          $(go.Panel, "Table",
            { margin: 8, stretch: go.GraphObject.Fill },
            $(go.RowColumnDefinition, { row: 0, sizing: go.RowColumnDefinition.None }),
            // the table header
            $(go.TextBlock,
              {
                row: 0, alignment: go.Spot.Center,
                // margin: new go.Margin(0, 24, 0, 20),  // leave room for Button
                font: "bold 16px sans-serif",
              },
              new go.Binding("text", "key")),
            // the collapse/expand button
            $("PanelExpanderButton", "LIST",  // the name of the element whose visibility this button toggles
              { row: 0, alignment: go.Spot.TopRight }),
            // the list of Panels, each showing an attribute
            $(go.Panel, "Vertical",
              {
                name: "LIST",
                row: 1,
                padding: 3,
                alignment: go.Spot.TopLeft,
                defaultAlignment: go.Spot.Left,
                stretch: go.GraphObject.Horizontal,
                itemTemplate: itemTempl
              },
              new go.Binding("itemArray", "items"))
          )  // end Table Panel
        );  // end Node

      // 定义连接线
      this.myDiagram.linkTemplate =
        $(go.Link,  // the whole link panel
          {
            selectionAdorned: true,
            layerName: "Foreground",
            reshapable: true,
            routing: go.Link.AvoidsNodes,
            corner: 5,
            curve: go.Link.JumpOver
          },

          // 箭头
          $(go.Shape, { strokeWidth: 2 },
            new go.Binding("stroke", "color")  // 连接线样式
          ),
          $(go.Shape, { toArrow: "Standard", stroke: null },   // 箭头样式
            new go.Binding("fill", "color")
          ),
          // 无箭头
          // $(go.Shape,  // the link shape
          //   { stroke: "#303B45", strokeWidth: 2.5 },
          // ),
          $(go.TextBlock,  // the "from" label
            {
              textAlign: "right",
              font: "bold 14px sans-serif",
              stroke: "#999999",
              segmentIndex: 0,
              segmentOffset: new go.Point(NaN, NaN),
              segmentOrientation: go.Link.OrientUpright
            },
            new go.Binding("text", "text")),
          $(go.TextBlock,  // the "to" label
            {
              textAlign: "center",
              font: "bold 14px sans-serif",
              stroke: "#000",
              segmentIndex: -1,
              segmentOffset: new go.Point(NaN, NaN),
              segmentOrientation: go.Link.OrientUpright
            },
            new go.Binding("text", "toText"))


        );

      var colors = {
        'red': '#be4b15',
        'green': '#52ce60',
        'blue': '#6ea5f8',
        'lightred': '#fd8852',
        'lightblue': '#afd4fe',
        'lightgreen': '#b9e986',
        'pink': '#faadc1',
        'purple': '#d689ff',
        'orange': '#fdb400',
      }
      let params = {
        tableMetaUuid: this.tableMetaUuid
      }
      selectTableRelationInfo(params).then(resp => {

        // 第一步
        if (resp.data.nodeDataArray) {

          resp.data.nodeDataArray.forEach(item => {
            let items = []
            let obj_arr1 = {
              key: item.tableMeta.tbName,
              tableMetaUuid: item.tableMeta.tableMetaUuid,
              items: items
            }
            item.colMetas.forEach(item_son => {
              let obj = {
                name: item_son.colName,
                colMetaUuid: item_son.colMetaUuid,
                iskey: false,
                figure: "Hexagon",
                color: colors.blue,
              }
              items.push(obj)
            })

            this.nodeDataArray.push(obj_arr1)
          })
        }


        if (resp.data.linkDataArray) {
          // 第二步
          resp.data.linkDataArray.forEach(linkData_items => {
            let color = colors.red
            let from = ''
            let to = ''
            let text = ''
            this.nodeDataArray.forEach(items_child => {

              if (items_child.tableMetaUuid == linkData_items.tableMetaUuid) {
                from = items_child.key
                items_child.items.forEach(col_child => {
                  //  主表字段
                  if (col_child.colMetaUuid == linkData_items.colMetaUuid) {
                    col_child.color = color
                    // col_child.figure = 'Decision'
                  }
                })
              }
              if (items_child.tableMetaUuid == linkData_items.relTableMetaUuid) {
                to = items_child.key
                items_child.items.forEach(col_child => {
                  //  从表字段
                  if (col_child.colMetaUuid == linkData_items.relColMetaUuid) {
                    col_child.color = color
                  }
                })
              }
            })
            // 1. left join   2. right join  3.full join  4.inner join")
            // 
            switch (linkData_items.sqlGenJoinType) {
              case 1:
                text = 'left join'
                break
              case 2:
                text = 'right join'
                break
              case 3:
                text = 'full join'
                break
              case 4:
                text = 'inner join'
                break
              default:
                //没有对应的值处理
                text = ''
                break
            }
            let obj_arr2 = {
              from: from,
              to: to,
              text: text,
            }
            this.linkDataArray.push(obj_arr2)
          })
        }



        this.myDiagram.model = $(go.GraphLinksModel,
          {
            copiesArrays: true,
            copiesArrayObjects: true,
            nodeDataArray: this.nodeDataArray,
            linkDataArray: this.linkDataArray
          });

      })
    }
  }
};
</script>
 
<style scoped>
#myDiagramDiv {
  width: 100%;
  height: 900px;
  border: 1px solid;
}
</style>