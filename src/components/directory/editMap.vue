<template>
  <div id="myDiagramDiv">
    <canvas tabindex="0"></canvas>
    <!-- <div style="position: absolute; overflow: auto; width: 1054px; height: 398px; z-index: 1;">
      <div style="position: absolute; width: 1px; height: 1px;"></div>
    </div> -->
  </div>
</template>

<script>
import go from "@/utils/go.js";
export default {
  components: {},
  data () {
    return {

    };
  },
  computed: {},
  watch: {},
  mounted () {
    this.test();
  },
  created () {
  },
  methods: {
    test () {
      var $ = go.GraphObject.make;  // for conciseness in defining templates

      var myDiagram =
        $(go.Diagram, "myDiagramDiv",
          {
            validCycle: go.Diagram.CycleNotDirected,  // don't allow loops
            allowMove: true, // 允许拖动画板
            allowDragOut: true, // 允许拖拽节点
            allowDelete: true, // 允许删除节点
            allowCopy: true, // 允许复制节点
            allowClipboard: true, // 允许粘贴节点
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
            "clickCreatingTool.archetypeNodeData": { text: "111", color: "white" },//允许在后台双击以创建新node258节点
          });

      // myDiagram.toolManager.mouseDownTools.add(new RowResizingTool());
      // myDiagram.toolManager.mouseDownTools.add(new ColumnResizingTool());

      // This template is a Panel that is used to represent each item in a Panel.itemArray.
      // The Panel is data bound to the item object.
      var fieldTemplate =
        $(go.Panel, "TableRow",  // this Panel is a row in the containing Table
          new go.Binding("portId", "name"),  // this Panel is a "port"
          {
            background: "transparent",  // so this port's background can be picked by the mouse
            fromSpot: go.Spot.Right,  // links only go from the right side to the left side
            toSpot: go.Spot.Left,
            // allow drawing links from or to this port:
            fromLinkable: true, toLinkable: true
          },
          $(go.Shape,
            {
              column: 0,
              width: 12, height: 12, margin: 4,
              // but disallow drawing links from or to this shape:
              fromLinkable: false, toLinkable: false
            },
            new go.Binding("figure", "figure"),
            new go.Binding("fill", "color")),
          $(go.TextBlock,
            {
              column: 1,
              margin: new go.Margin(0, 2),
              stretch: go.GraphObject.Horizontal,
              font: "bold 13px sans-serif",
              wrap: go.TextBlock.None,
              overflow: go.TextBlock.OverflowEllipsis,
              // and disallow drawing links from or to this text:
              fromLinkable: false, toLinkable: false
            },
            new go.Binding("text", "name")),
          $(go.TextBlock,
            {
              column: 2,
              margin: new go.Margin(0, 2),
              stretch: go.GraphObject.Horizontal,
              font: "13px sans-serif",
              maxLines: 3,
              overflow: go.TextBlock.OverflowEllipsis,
              editable: true
            },
            new go.Binding("text", "_text").makeTwoWay())
        );
      function makeWidthBinding (idx) {
        function getColumnWidth (arr) {
          if (Array.isArray(arr) && idx < arr.length) return arr[idx];
          return NaN;
        }
        function setColumnWidth (w, data) {
          var arr = data.widths;
          if (!arr) arr = [];
          if (idx >= arr.length) {
            for (var i = arr.length; i <= idx; i++) arr[i] = NaN;  // default to NaN
          }
          arr[idx] = w;
          return arr;  // need to return the Array (as the value of data.widths)
        }
        return [
          { column: idx },
          new go.Binding("width", "widths", getColumnWidth).makeTwoWay(setColumnWidth)
        ]
      }


      // This template represents a whole "record".
      myDiagram.nodeTemplate =
        $(go.Node, "Auto",
          new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
          // this rectangular shape surrounds the content of the node
          $(go.Shape,
            { fill: "#EEEEEE" }),
          // the content consists of a header and a list of items
          $(go.Panel, "Vertical",
            { stretch: go.GraphObject.Horizontal, margin: 0.5 },
            // this is the header for the whole node
            $(go.Panel, "Auto",
              { stretch: go.GraphObject.Horizontal },  // as wide as the whole node
              $(go.Shape,
                { fill: "#1570A6", strokeWidth: 0 }),
              $(go.TextBlock,
                {
                  alignment: go.Spot.Center,
                  margin: 3,
                  stroke: "white",
                  textAlign: "center",
                  font: "bold 12pt sans-serif"
                },
                new go.Binding("text", "key"))),
            // this Panel holds a Panel for each item object in the itemArray;
            // each item Panel is defined by the itemTemplate to be a TableRow in this Table
            $(go.Panel, "Table",
              {
                name: "TABLE", stretch: go.GraphObject.Horizontal,
                minSize: new go.Size(100, 10),
                defaultAlignment: go.Spot.Left,
                defaultStretch: go.GraphObject.Horizontal,
                defaultColumnSeparatorStroke: "gray",
                defaultRowSeparatorStroke: "gray",
                itemTemplate: fieldTemplate
              },
              $(go.RowColumnDefinition, makeWidthBinding(0)),
              $(go.RowColumnDefinition, makeWidthBinding(1)),
              $(go.RowColumnDefinition, makeWidthBinding(2)),
              new go.Binding("itemArray", "fields")
            )  // end Table Panel of items
          )  // end Vertical Panel
        );  // end Node

      myDiagram.linkTemplate =
        $(go.Link,
          { relinkableFrom: true, relinkableTo: true, toShortLength: 4 },  // let user reconnect links
          $(go.Shape, { strokeWidth: 1.5 }),
          $(go.Shape, { toArrow: "Standard", stroke: null })
        );

      myDiagram.model =
        new go.GraphLinksModel(
          {
            copiesArrays: true,
            copiesArrayObjects: true,
            linkFromPortIdProperty: "fromPort",
            linkToPortIdProperty: "toPort",
            // automatically update the model that is shown on this page
            "Changed": function (e) {
              if (e.isTransactionFinished) showModel();
            },
            nodeDataArray: [
              {
                key: "对公信贷担保信息表",
                widths: [NaN, NaN, 60],
                fields: [
                  { name: "a1", _text: "测试测试1", color: "#F7B84B", figure: "Ellipse" },
                  { name: "a2", _text: "测试测试2", color: "#F25022", figure: "Ellipse" },
                  { name: "a3", _text: "测试测试3", color: "#00BCF2" }
                ],
                loc: "0 0"
              },
              {
                key: "对公信贷业务借据",
                widths: [NaN, NaN, NaN],
                fields: [
                  { name: "b1", _text: "测试测试1", color: "#FFB900", figure: "Diamond" },
                  { name: "b2", _text: "测试测试2", color: "#F25022", figure: "Rectangle" },
                  { name: "b3", _text: "测试测试3", color: "#7FBA00", figure: "Diamond" },
                  { name: "b4", _text: "测试测试4", color: "#00BCF2", figure: "Rectangle" }
                ],
                loc: "250 0"
              }
            ],
            linkDataArray: [
              { from: "对公信贷担保信息表", fromPort: "a1", to: "对公信贷业务借据", toPort: "b1" },
              { from: "对公信贷担保信息表", fromPort: "a2", to: "对公信贷业务借据", toPort: "b4" },
              { from: "对公信贷担保信息表", fromPort: "a3", to: "对公信贷业务借据", toPort: "b2" }
            ]
          });
      // showModel();  // show the diagram's initial model
      // function showModel () {
      //   document.getElementById("mySavedModel").textContent = myDiagram.model.toJson();
      // }
    }

  },

};
</script>

<style scoped >
#myDiagramDiv {
  width: 100%;
  height: 700px;
  border: 1px solid;
}
</style>