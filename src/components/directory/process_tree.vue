<template>
  <div class="example">
    <div id="my-diagram-div"></div>
    <div></div>
  </div>
</template>

<script>
import go from "@/utils/go.js";
import {
  selectTableRelationInfo
} from "@/api/lhg/process_tree.js";

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
      nodeDataArray: [],
      linkDataArray: [],

    };
  },
  computed: {},
  watch: {},
  mounted () {
    // this.query_data();
    this.init();

  },
  created () {
  },
  methods: {

    // query_data () {


    //   this.init();
    // },

    init () {
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

      // 定义连接线
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
            { stroke: "#303B45", strokeWidth: 2.5 },
            // new go.Binding("stroke", "color"),
            // new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify)
          ),
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


      // var nodeDataArray = [
      //   {
      //     key: "对公信贷担保信息表",
      //     items: [{ name: "XDJJH", iskey: true, figure: "Hexagon", color: colors.blue },
      //     { name: "YXJGMC", iskey: false, figure: "Hexagon", color: colors.blue }]

      //   },
      // {
      //   key: "对公信贷业务借据",
      //   items: [{ name: "信贷借据号", iskey: true, figure: "Hexagon", color: colors.blue },
      //   { name: "客户名称", iskey: false, figure: "Hexagon", color: colors.blue },
      //   ]
      // },
      // {
      //   key: "信贷业务担保合同",
      //   items: [{ name: "担保合同号", iskey: true, figure: "Hexagon", color: colors.blue },
      //   { name: "担保类型", iskey: false, figure: "Hexagon", color: colors.blue },
      //   ]
      // },
      // {
      //   key: "担保关系",
      //   items: [{ name: "担保合同号", iskey: true, figure: "Hexagon", color: colors.red },
      //   { name: "被担保合同号", iskey: true, figure: "Hexagon", color: colors.blue },
      //   ],
      // },
      // ];
      // var linkDataArray = [
      //   { from: "对公信贷担保信息表", to: "对公信贷业务借据", text: "111", },
      //   { from: "对公信贷担保信息表", to: "信贷业务担保合同", text: "2222", },
      //   { from: "担保关系", to: "对公信贷担保信息表", text: "333", }
      // ];
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
        // console.log(resp);
        // 第一步
        // let nodeDataArray = []//相当于表详情 var nodeDataArray
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

        // 第二步
        // let linkDataArray_s = []//相当于表详情 var linkDataArray
        resp.data.linkDataArray.forEach(linkData_items => {
          let color = colors.red
          let from = ''
          let to = ''
          this.nodeDataArray.forEach(items_child => {
            console.log();
            if (items_child.tableMetaUuid == linkData_items.tableMetaUuid) {
              from = items_child.key
              items_child.items.forEach(col_child => {
                //  主表字段
                if (col_child.colMetaUuid == linkData_items.colMetaUuid) {
                  col_child.color = color
                  col_child.figure = 'Decision'
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
          console.log(linkData_items);
          let obj_arr2 = {
            from: from,
            to: to,
            text: linkData_items.sqlGenJoinType,
          }
          this.linkDataArray.push(obj_arr2)
        })
      })
      // console.log(this.linkDataArray);
      // console.log(this.nodeDataArray);
      //  copiesArrays: true,
      //         copiesArrayObjects: true,


      // const nodeData = [{ key: "ods_xdhtb(信贷合同表)" }, { key: "ods_dgkh(对公客户)" },
      // {
      //   key: "对公信贷担保信息表",
      //   items: [
      //     { name: "XDJJH", iskey: true, figure: "Hexagon", color: colors.blue },
      //     { name: "YXJGMC", iskey: false, figure: "Hexagon", color: colors.blue }
      //   ]
      // },
      // ];

      // const nodeData = [
      //   {
      //     "key": "ods_xdhtb(信贷合同表)",
      //     "tableMetaUuid": "ods>ods_xdhtb",
      //     "items": [
      //       {
      //         "name": "xdhth",
      //         "colMetaUuid": "ods>ods_xdhtb>1",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "zhth",
      //         "colMetaUuid": "ods>ods_xdhtb>2",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "khtybh",
      //         "colMetaUuid": "ods>ods_xdhtb>3",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "yxjgdm",
      //         "colMetaUuid": "ods>ods_xdhtb>4",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "jrxkzh",
      //         "colMetaUuid": "ods>ods_xdhtb>5",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "nbjgh",
      //         "colMetaUuid": "ods>ods_xdhtb>6",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#be4b15"
      //       },
      //       {
      //         "name": "khmc",
      //         "colMetaUuid": "ods>ods_xdhtb>7",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "cpmc",
      //         "colMetaUuid": "ods>ods_xdhtb>8",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "dkxgzl",
      //         "colMetaUuid": "ods>ods_xdhtb>9",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "xdywzl",
      //         "colMetaUuid": "ods>ods_xdhtb>10",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "bz",
      //         "colMetaUuid": "ods>ods_xdhtb>11",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "je",
      //         "colMetaUuid": "ods>ods_xdhtb>12",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "htydrq",
      //         "colMetaUuid": "ods>ods_xdhtb>13",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "htdqrq",
      //         "colMetaUuid": "ods>ods_xdhtb>14",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "lllx",
      //         "colMetaUuid": "ods>ods_xdhtb>15",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "jzll",
      //         "colMetaUuid": "ods>ods_xdhtb>16",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "llfd",
      //         "colMetaUuid": "ods>ods_xdhtb>17",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "zydbfs",
      //         "colMetaUuid": "ods>ods_xdhtb>18",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "ghjlgh",
      //         "colMetaUuid": "ods>ods_xdhtb>19",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "dkqx",
      //         "colMetaUuid": "ods>ods_xdhtb>20",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "fkfs",
      //         "colMetaUuid": "ods>ods_xdhtb>21",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "kjhsfs",
      //         "colMetaUuid": "ods>ods_xdhtb>22",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "dkyt",
      //         "colMetaUuid": "ods>ods_xdhtb>23",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "dktxdq",
      //         "colMetaUuid": "ods>ods_xdhtb>24",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "dktxxy",
      //         "colMetaUuid": "ods>ods_xdhtb>25",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "sfgjxzxy",
      //         "colMetaUuid": "ods>ods_xdhtb>26",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "cjrq",
      //         "colMetaUuid": "ods>ods_xdhtb>27",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "rpt_brh_class_two",
      //         "colMetaUuid": "ods>ods_xdhtb>28",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "rpt_brh_soab_class_one",
      //         "colMetaUuid": "ods>ods_xdhtb>29",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "rpt_brh_soab_class_two",
      //         "colMetaUuid": "ods>ods_xdhtb>30",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       }
      //     ]
      //   },
      //   {
      //     "key": "ods_dgkh(对公客户)",
      //     "tableMetaUuid": "ods>ods_dgkh",
      //     "items": [
      //       {
      //         "name": "khtybh",
      //         "colMetaUuid": "ods>ods_dgkh>1",
      //         "iskey": false,
      //         "figure": "Decision",
      //         "color": "#be4b15"
      //       },
      //       {
      //         "name": "zzjgdm",
      //         "colMetaUuid": "ods>ods_dgkh>2",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "yxjgdm",
      //         "colMetaUuid": "ods>ods_dgkh>3",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "jrxkzh",
      //         "colMetaUuid": "ods>ods_dgkh>4",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "nbjgh",
      //         "colMetaUuid": "ods>ods_dgkh>5",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "khmc",
      //         "colMetaUuid": "ods>ods_dgkh>6",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "khywmc",
      //         "colMetaUuid": "ods>ods_dgkh>7",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "frdb",
      //         "colMetaUuid": "ods>ods_dgkh>8",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "frdbzjlb",
      //         "colMetaUuid": "ods>ods_dgkh>9",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "frdbzjhm",
      //         "colMetaUuid": "ods>ods_dgkh>10",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "cwry",
      //         "colMetaUuid": "ods>ods_dgkh>11",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "cwryzjlb",
      //         "colMetaUuid": "ods>ods_dgkh>12",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "cwryzjhm",
      //         "colMetaUuid": "ods>ods_dgkh>13",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "jbckzh",
      //         "colMetaUuid": "ods>ods_dgkh>14",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "jbzhkhxmc",
      //         "colMetaUuid": "ods>ods_dgkh>15",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "zczb",
      //         "colMetaUuid": "ods>ods_dgkh>16",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "zcdz",
      //         "colMetaUuid": "ods>ods_dgkh>17",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "lxdh",
      //         "colMetaUuid": "ods>ods_dgkh>18",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "yyzzh",
      //         "colMetaUuid": "ods>ods_dgkh>19",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "yyzzyxjzrq",
      //         "colMetaUuid": "ods>ods_dgkh>20",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "jyfw",
      //         "colMetaUuid": "ods>ods_dgkh>21",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "clrq",
      //         "colMetaUuid": "ods>ods_dgkh>22",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "ssxy",
      //         "colMetaUuid": "ods>ods_dgkh>23",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "khlb",
      //         "colMetaUuid": "ods>ods_dgkh>24",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "dkzh",
      //         "colMetaUuid": "ods>ods_dgkh>25",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "gszh",
      //         "colMetaUuid": "ods>ods_dgkh>26",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "dszh",
      //         "colMetaUuid": "ods>ods_dgkh>27",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "mgskhtybh",
      //         "colMetaUuid": "ods>ods_dgkh>28",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "tysxbz",
      //         "colMetaUuid": "ods>ods_dgkh>29",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "sxed",
      //         "colMetaUuid": "ods>ods_dgkh>30",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "yyed",
      //         "colMetaUuid": "ods>ods_dgkh>31",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "ssgsbz",
      //         "colMetaUuid": "ods>ods_dgkh>32",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "xydjbh",
      //         "colMetaUuid": "ods>ods_dgkh>33",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "zczbbz",
      //         "colMetaUuid": "ods>ods_dgkh>34",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "sszbbz",
      //         "colMetaUuid": "ods>ods_dgkh>35",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "sszb",
      //         "colMetaUuid": "ods>ods_dgkh>36",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "zzc",
      //         "colMetaUuid": "ods>ods_dgkh>37",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "jzc",
      //         "colMetaUuid": "ods>ods_dgkh>38",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "nsr",
      //         "colMetaUuid": "ods>ods_dgkh>39",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "scjlxdgxny",
      //         "colMetaUuid": "ods>ods_dgkh>40",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "czhm",
      //         "colMetaUuid": "ods>ods_dgkh>41",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "ygrs",
      //         "colMetaUuid": "ods>ods_dgkh>42",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "xzqhdm",
      //         "colMetaUuid": "ods>ods_dgkh>43",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "khlx",
      //         "colMetaUuid": "ods>ods_dgkh>44",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "fxyjxh",
      //         "colMetaUuid": "ods>ods_dgkh>45",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "cjrq",
      //         "colMetaUuid": "ods>ods_dgkh>46",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "prov_no",
      //         "colMetaUuid": "ods>ods_dgkh>47",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "rpt_brh_class_one",
      //         "colMetaUuid": "ods>ods_dgkh>48",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "rpt_brh_class_two",
      //         "colMetaUuid": "ods>ods_dgkh>49",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "rpt_brh_soab_class_one",
      //         "colMetaUuid": "ods>ods_dgkh>50",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       },
      //       {
      //         "name": "rpt_brh_soab_class_two",
      //         "colMetaUuid": "ods>ods_dgkh>51",
      //         "iskey": false,
      //         "figure": "Hexagon",
      //         "color": "#6ea5f8"
      //       }
      //     ]
      //   }
      // ]
      // const nodeData = []
      // const linkData = []
      // const linkData = [
      //   {
      //     "from": "ods_dgkh(对公客户)",
      //     "to": "ods_xdhtb(信贷合同表)",
      //     "text": 2
      //   }
      // ]
      const linkData = this.linkDataArray
      const nodeData = this.nodeDataArray
      console.log(linkData);
      console.log(nodeData);


      // myDiagram.model = $(go.GraphLinksModel,
      //   {
      //     copiesArrays: true,
      //     copiesArrayObjects: true,
      //     nodeDataArray: nodeData,
      //     linkDataArray: linkData
      //   });


      // myDiagram.model = $(go.GraphLinksModel);
      // model.nodeDataArray =
      //   [
      //     { key: "A" },
      //     { key: "B" },
      //     { key: "C" }
      //   ];
      // model.linkDataArray =
      //   [
      //     { from: "A", to: "B" },
      //     { from: "B", to: "C" }
      //   ];
      // myDiagram.model = model;



      // nodeDataArray: this.nodeDataArray,
      // linkDataArray: this.linkDataArray
      console.log(myDiagram.model);
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