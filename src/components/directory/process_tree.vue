<template>
  <div class="example">
    <div id="my-diagram-div"></div>
    <div></div>

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
      let $ = go.GraphObject.make; // for conciseness in defining templates
      let myDiagram = $(
        go.Diagram,
        "my-diagram-div", // id挂载dome节点
        {
          // allowDelete: false,
          // allowCopy: false,
          // isReadOnly: true, // 只读，无法编辑操作
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
          // "clickCreatingTool.archetypeNodeData": { text: "111", color: "white" },//允许在后台双击以创建新node258节点
        }
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
      // the template for each attribute in a node's array of item data
      var itemTempl =
        $(go.Panel, "Horizontal",
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

      // define the Node template, representing an entity
      myDiagram.nodeTemplate =
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
                margin: new go.Margin(0, 24, 0, 2),  // leave room for Button
                font: "bold 16px sans-serif"
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

      // define the Link template, representing a relationship
      myDiagram.linkTemplate =
        $(go.Link,  // the whole link panel
          {
            selectionAdorned: true,
            layerName: "Foreground",
            reshapable: true,
            routing: go.Link.AvoidsNodes,
            corner: 5,
            curve: go.Link.JumpOver
          },
          $(go.Shape,  // the link shape
            { stroke: "#303B45", strokeWidth: 2.5 }),
          $(go.TextBlock,  // the "from" label
            {
              textAlign: "center",
              font: "bold 14px sans-serif",
              stroke: "#1967B3",
              segmentIndex: 0,
              segmentOffset: new go.Point(NaN, NaN),
              segmentOrientation: go.Link.OrientUpright
            },
            new go.Binding("text", "text")),
          $(go.TextBlock,  // the "to" label
            {
              textAlign: "center",
              font: "bold 14px sans-serif",
              stroke: "#1967B3",
              segmentIndex: -1,
              segmentOffset: new go.Point(NaN, NaN),
              segmentOrientation: go.Link.OrientUpright
            },
            new go.Binding("text", "toText"))
        );

      // create the model for the E-R diagram
      var nodeDataArray = [
        {
          key: "对公信贷担保信息表",
          items: [{ name: "XDJJH", iskey: true, figure: "Hexagon", color: colors.blue },
          { name: "DKFHZH", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "KHTYBH", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "KHMC", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "XDHTH", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "YXJGDM", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "JRXKZH", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "NBJGH", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "MXKMBH", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "YXJGMC", iskey: false, figure: "Hexagon", color: colors.blue }]

        },
        {
          key: "对公信贷业务借据",
          items: [{ name: "信贷借据号", iskey: true, figure: "Hexagon", color: colors.blue },
          { name: "贷款分户账号", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "客户统一编号", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "客户名称", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "信贷合同号", iskey: false, figure: "Hexagon", color: colors.red },
          { name: "银行机构代码", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "金融许可证号", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "内部机构号", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "明细科目编号", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "银行机构名称", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "明细科目名称", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "信贷业务种类", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "币种", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "借款金额", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "借款余额", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "贷款期限", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "展期次数", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "总期数", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "当前期数", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "放款方式", iskey: false, figure: "Hexagon", color: colors.blue },
          ]
        },
        {
          key: "信贷业务担保合同",
          items: [{ name: "担保合同号", iskey: true, figure: "Hexagon", color: colors.blue },
          { name: "金融许可证号", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "银行机构代码", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "担保类型", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "担保合同类型", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "保证人类别", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "保证人名称", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "证件类别", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "证件号码", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "保证人净资产", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "担保合同状态", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "担保合同签订日期", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "担保合同生效日期", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "担保合同到期日期", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "担保币种", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "担保总金额", iskey: false, figure: "Hexagon", color: colors.blue },
          ]
        },
        {
          key: "担保关系",
          items: [{ name: "担保合同号", iskey: true, figure: "Hexagon", color: colors.red },
          { name: "被担保合同号", iskey: true, figure: "Hexagon", color: colors.blue },
          { name: "银行机构代码", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "金融许可证号", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "内部机构号", iskey: false, figure: "Hexagon", color: colors.blue },
          { name: "担保类型", iskey: false, figure: "Hexagon", color: colors.blue },
          ],
        },
      ];
      var linkDataArray = [
        { from: "对公信贷担保信息表", to: "对公信贷业务借据", text: "对公信贷担保信息表", },
        { from: "对公信贷担保信息表", to: "信贷业务担保合同", text: "机构信息关联", },
        { from: "担保关系", to: "对公信贷担保信息表", text: "担保关系", }
      ];
      myDiagram.model = $(go.GraphLinksModel,
        {
          copiesArrays: true,
          copiesArrayObjects: true,
          nodeDataArray: nodeDataArray,
          linkDataArray: linkDataArray
        });
    }

  }
};
</script>

 
<style scoped>
#my-diagram-div {
  width: 100%;
  height: 900px;
  border: 1px solid;
}
</style>