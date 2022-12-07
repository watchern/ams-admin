<template>
  <div>
    <div class="editor-flowC-chart">
      <div id="myPaletteDiv">
        <canvas tabindex="0">编辑器不支持您当前使用的浏览器</canvas>
      </div>
      <div id="myDiagramDiv">
        <canvas tabindex="0">编辑器不支持您当前使用的浏览器</canvas>
      </div>
      <div class="toolbar">
        <!-- 全屏功能 -->
        <!-- <a-button type="link" icon="fullscreen" /> -->
        <!-- <a-button type="primary"
                  shape="circle"
                  icon="fullscreen"
                  @click="fullscreen"
                  v-if="!isFullScreen">1</a-button>
        <a-button type="primary"
                  shape="circle"
                  icon="fullscreen-exit"
                  @click="fullscreen"
                  v-else>2</a-button> -->
      </div>
      <div class="testInput"
           id="myInspector"
           title="缩略图">
        <canvas tabindex="0"
                width="100%"
                height="700px">编辑器不支持您当前使用的浏览器</canvas>
      </div>
    </div>

  </div>
</template>

<script>
import go from "@/utils/go.js";
export default {
  name: "editorFlowChart",
  data () {
    return {
      $: {},
      selectNodeData: {},
      isFullScreen: false,
      myDiagram: {},
      backgGColor: "skyblue",
      Palette: {},
      HighlightTheme: {
        default: {
          back: "lightyellow",
          stroke: "black",
        },
        Comment: {
          back: "#282c34",
          stroke: "#DEE0A3",
        },
        Start: {
          back: "#282c34",
          stroke: "#09d3ac",
        },
        End: {
          back: "#282c34",
          stroke: "#09d3ac",
        },
        grid: "#d6e4dc",
      },
      darkTheme: {
        default: {
          back: "gray",
          stroke: "black",
        },
        Comment: {
          back: "blue",
          stroke: "#DEE0A3",
        },
        Start: {
          back: "green",
          stroke: "#09d3ac",
        },
        End: {
          back: "red",
          stroke: "#09d3ac",
        },
        grid: "rgba(255, 255, 255, 0.1)",
      },
    };
  },
  mounted () {
    this.initEchart();
    this.$EventBus.$on("setClass", (theme) => {
      let data = this.myDiagram.model.nodeDataArray;
      let linkData = this.myDiagram.model.linkDataArray;
      this.setTheme(data, linkData, theme);
    });
    this.myDiagram.links.each((node) => {
      console.log(node);
    });
  },
  methods: {
    setTheme (data, linkData, theme) {
      let themeData = theme ? this[theme + "Theme"] : this.HighlightTheme
      console.log(theme, themeData, this.HighlightTheme);
      // 调色板的默认节点
      let PaletteModel = [
        // 指定调色板的内容 category(类别)
        { category: "Start", text: "开始" },
        { key: "节点", name: "模板节点", color: "lightyellow" },
        // {
        //   category: "Icon",
        //   text: "说明",
        //   icon: "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fphotocdn.sohu.com%2F20140308%2FImg396262595.jpg&refer=http%3A%2F%2Fphotocdn.sohu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1651047886&t=075fe50f680f0f88bb94b0f11ccb11e1",
        // },
        { category: "End", text: "结束" },
        { category: "Comment", text: "说明" },
      ];
      // 在更换主题是遍历节点,修改其color属性的方法
      function ecchData (data) {
        console.log(themeData);
        data.forEach((item) => {
          if (!item.category) {
            item.color = themeData.default.back;
            item.stroke = themeData.default.stroke;
          } else if (themeData[item.category]) {
            item.color = themeData[item.category].back;
            item.stroke = themeData[item.category].stroke;
          }
        });
      }
      // 遍历调色板节点
      ecchData(PaletteModel);
      // 遍历画布所有节点
      ecchData(data);
      let $ = this.$;
      this.Palette.div = null;
      this.myDiagram.model = go.Model.fromJson({
        class: "go.GraphLinksModel",
        linkFromPortIdProperty: "fromPort",
        linkToPortIdProperty: "toPort",
        nodeDataArray: data,
        linkDataArray: linkData,
      });
      this.Palette = $(
        go.Palette,
        "myPaletteDiv", // 必须命名或引用DIV HTML元素
        {
          // 使用自定义淡入淡出，而不是默认动画
          "animationManager.initialAnimationStyle": go.AnimationManager.None,
          InitialAnimationStarting: this.animateFadeDown, // 相反，使用此函数设置动画
          nodeTemplateMap: this.myDiagram.nodeTemplateMap, // 共享myDiagram使用的模板
          model: new go.GraphLinksModel(PaletteModel),
        }
      );
      // 定义画布线
      this.myDiagram.grid = $(
        go.Panel,
        go.Panel.Grid, // or "Grid"
        { gridCellSize: new go.Size(30, 30) },
        $(go.Shape, "LineH", { stroke: themeData.grid }),
        $(go.Shape, "LineV", { stroke: themeData.grid })
      );
    },

    initEchart () {
      let that = this;
      let $ = this.$ = go.GraphObject.make;
      let myDiagram = {};
      this.myDiagram = myDiagram = $(
        go.Diagram,
        "myDiagramDiv", // 必须是一个html标签的id
        {
          // LinkDrawn: this.showLinkLabel,
          // LinkRelinked: this.showLinkLabel,
          // 开启分组
          "commandHandler.archetypeGroupData": {
            text: "Group",
            isGroup: true,
            color: "blue",
          },
          allowHorizontalScroll: false,
          allowVerticalScroll: false,
          "undoManager.isEnabled": true, // 启用撤消和重做
          click: function () {
            myDiagram.clearHighlighteds();
          },
        }
      );

      // this.myDiagram.grid.visible = false;
      this.myDiagram.toolManager.draggingTool.isGridSnapEnabled = true;
      this.myDiagram.toolManager.resizingTool.isGridSnapEnabled = true;
      // 画布网格结束
      this.addDefaultNode();
      this.addStartNode();
      this.addEndNode();
      this.addExplainNode();
      this.setGroupTemplate();
      this.setCanvasMenu();
      this.setLinkTemplate();
      this.addIconNode();

      this.load(); // 从一些JSON文本中加载初始图表
      // 加载缩略图
      $(go.Overview, "myInspector", {
        observed: this.myDiagram,
        contentAlignment: go.Spot.Center,
      });
      // 初始化键盘按下和弹起事件
      // that.myDiagram.commandHandler.click=function(){
      //   alert(666)
      // }
      that.myDiagram.commandHandler.doKeyDown = function () {
        let e = that.myDiagram.lastInput;
        if (e.key === " ") {
          that.myDiagram.allowHorizontalScroll = true;
          that.myDiagram.allowVerticalScroll = true;
        } else {
          go.CommandHandler.prototype.doKeyDown.call(this);
        }
        // var e = this.myDiagram.lastInput;
        // console.log(e);
      };
      that.myDiagram.commandHandler.doKeyUp = function () {
        let e = that.myDiagram.lastInput;
        if (e.key === " ") {
          that.myDiagram.allowHorizontalScroll = false;
          that.myDiagram.allowVerticalScroll = false;
        }
        go.CommandHandler.prototype.doKeyDown.call(this);
        // var e = this.myDiagram.lastInput;
        // console.log(e);
      };
    },
    // 设置调色板样式
    setGoPalette () {
      return {
        // 使用自定义淡入淡出，而不是默认动画
        "animationManager.initialAnimationStyle": go.AnimationManager.None,
        InitialAnimationStarting: this.animateFadeDown, // 相反，使用此函数设置动画
        nodeTemplateMap: this.myDiagram.nodeTemplateMap, // 共享myDiagram使用的模板
        model: new go.GraphLinksModel([
          // 指定调色板的内容 category(类别)
          { category: "Start", text: "开始" },
          { key: "节点", name: "模板节点", color: "lightyellow" },
          // {
          //   category: "Icon",
          //   text: "说明",
          //   icon: "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fphotocdn.sohu.com%2F20140308%2FImg396262595.jpg&refer=http%3A%2F%2Fphotocdn.sohu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1651047886&t=075fe50f680f0f88bb94b0f11ccb11e1",
          // },
          // { category: "End", text: "结束" },
          // { category: "Comment", text: "说明" },
        ]),
      };
    },
    // 全屏功能
    // fullscreen () {
    //   let elem = document.getElementsByClassName("editor-flowC-chart");
    //   if (!this.isFullScreen) {
    //     elem[0].style.position = "fixed";
    //     elem[0].style.width = "100vw";
    //     elem[0].style.height = "100vh";
    //     elem[0].style.padding = "0";
    //     this.isFullScreen = true;
    //   } else {
    //     elem[0].style.position = "static";
    //     elem[0].style.width = "0";
    //     elem[0].style.height = "100%";
    //     elem[0].style.padding = "5px";
    //     this.isFullScreen = false;
    //   }
    // },
    // 添加默认节点
    addDefaultNode () {
      let _that = this;
      let $ = this.$;
      let animonList = [];
      // 为常规节点定义节点模板
      this.myDiagram.nodeTemplateMap.add(
        "", // 默认节点类型
        $(
          go.Node,
          "Table",
          // 设置节点基本样式
          this.nodeStyle(),
          this.setEventGroup($),
          {
            contextMenu: this.partContextMenu(),
            click: function (e, node) {
              // 点击节点后高亮其名下所有节点
              var diagram = node.diagram;
              diagram.startTransaction("highlight");
              diagram.clearHighlighteds();
              node.findLinksOutOf().each(function (l) {
                l.isHighlighted = !l.isHighlighted;
              });
              node.findNodesOutOf().each(function (n) {
                n.isHighlighted = !n.isHighlighted;
              });
              diagram.commitTransaction("highlight");
            },
            selectionChanged: (e, node) => {
              // 点击节点后高亮其名下所有节点
              var diagram = e.diagram;
              diagram.startTransaction("highlight");
              diagram.clearHighlighteds();
              e.findLinksOutOf().each(function (l) {
                l.isHighlighted = !l.isHighlighted;
              });
              e.findNodesOutOf().each(function (n) {
                n.isHighlighted = !n.isHighlighted;
              });
              diagram.commitTransaction("highlight");

              // 判断当前是否选中，选中则开始动画，不选中则结束动画
              if (e.isSelected) {
                let index = animonList.findIndex((item) => {
                  if (item.key == e.data.key) {
                    return true;
                  }
                });
                let animation = {};
                if (index == -1) {
                  animation = new go.Animation();
                  animation.easing = go.Animation.EaseLinear;
                } else {
                  animation = animonList[index].animation;
                }
                e.findLinksOutOf().each((a) => {
                  animation.add(
                    a.findObject("PIPE"),
                    "strokeDashOffset",
                    20,
                    0
                  );
                  animation.runCount = Infinity;
                  if (index == -1) {
                    animonList.push({ key: e.data.key, animation: animation });
                  }
                  animation.start();
                });
                return;
              } else {
                let index = animonList.findIndex((item) => {
                  if (item.key == e.data.key) {
                    return true;
                  }
                });
                if (index !== -1) {
                  animonList[index].animation.stop();
                  animonList.splice(index, 1);
                }
              }
            },
            toolTip: $(
              "ToolTip",
              $(
                go.TextBlock,
                { margin: 4, editable: true, background: "transparent" },
                new go.Binding("text", "text")
              )
            ), // end Adornment
          },
          // 设置节点接口连接规则 此规则为只可下连上
          this.makePort("T", go.Spot.Top, go.Spot.TopSide, false, true, $),
          this.makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false, $)
        )
      );
    },
    // 设置节点中把方法或者其他元素分组
    setEventGroup ($) {
      return $(
        go.Panel,
        "Auto",
        $(
          go.Shape,
          "RoundedRectangle",
          { minSize: new go.Size(70, 40) },
          new go.Binding("stroke", "isHighlighted", function (h) {
            return h ? "red" : "black";
          }).ofObject(),
          new go.Binding("fill", "color")
        ),
        $(
          go.Panel,
          "Table",
          $(
            go.TextBlock,
            {
              row: 0,
              margin: 3,
              column: 0,
              font: "bold 12pt sans-serif",
              isMultiline: false,
              editable: true,
              stroke: "black",
            },
            new go.Binding("text", "name").makeTwoWay()
          ),
          // $("PanelExpanderButton", "LIST1", { column: 1 }),
          $(
            go.Panel,
            "Table",
            { defaultRowSeparatorStroke: "black", alignment: go.Spot.Center },
            { row: 1, name: "LIST1" },
            // 参与人员部分
            $(go.TextBlock, "参与人员", {
              row: 1,
              font: "italic 10pt sans-serif",
            }),
            $(
              go.Panel,
              "Vertical",
              { name: "user" },
              {
                row: 2,
                margin: 3,
                stretch: go.GraphObject.Fill,
                defaultAlignment: go.Spot.Center,
                visible: false,
              },
              new go.Binding("itemArray", "text")
            ),
            $(
              "PanelExpanderButton",
              "user",
              {
                row: 1,
                column: 1,
                alignment: go.Spot.TopRight,
                visible: false,
              },
              new go.Binding("visible", "text", function (arr) {
                return arr.length > 0;
              })
            ),
            // 其他部分
            $(
              go.TextBlock,
              "其他",
              { row: 5, font: "italic 10pt sans-serif", margin: 3 }
              // new go.Binding("visible", "visible", function (v) {
              //   return !v;
              // }).ofObject("PROPERTIES")
            ),
            $(
              go.Panel,
              "Vertical",
              { name: "PROPERTIES" },
              new go.Binding("itemArray", "text"),
              {
                row: 6,
                margin: 3,
                stretch: go.GraphObject.Fill,
                defaultAlignment: go.Spot.Center,
                visible: false,
              }
            ),
            $(
              "PanelExpanderButton",
              "PROPERTIES",
              {
                row: 5,
                column: 1,
                alignment: go.Spot.TopRight,
                visible: false,
              },
              new go.Binding("visible", "text", function (arr) {
                return arr.length > 0;
              })
            ),
            // 事件部分
            $(go.TextBlock, "事件", { row: 3, font: "italic 10pt sans-serif" }),
            $(
              go.Panel,
              "Vertical",
              { name: "METHODS" },
              new go.Binding("itemArray", "text"),
              {
                row: 4,
                margin: 3,
                stretch: go.GraphObject.Fill,
                defaultAlignment: go.Spot.Center,
                visible: false,
              }
            ),
            $(
              "PanelExpanderButton",
              "METHODS",
              {
                row: 3,
                column: 1,
                alignment: go.Spot.TopRight,
                visible: false,
              },
              new go.Binding("visible", "text", function (arr) {
                return arr.length > 0;
              })
            )
          )
        )
      );
    },
    test (obj, d) {
      var node = d.part;
      var nodeData = this.myDiagram.model.findNodeDataForKey(node.data.key);
      if (nodeData && nodeData.text) {
        nodeData.text.push("新增的");
        this.myDiagram.model.updateTargetBindings(nodeData);
      }
    },
    userTemplate ($) {
      return $(
        go.Panel,
        // method visibility/access
        $(
          go.TextBlock,
          { isMultiline: false, editable: false, width: 12 },
          new go.Binding("text", "text")
        )
      );
    },
    // 添加开始节点
    addStartNode () {
      let $ = this.$;
      this.myDiagram.nodeTemplateMap.add(
        "Start",
        $(
          go.Node,
          "Table",
          this.nodeStyle(),
          $(
            go.Panel,
            "Spot",
            $(
              go.Shape,
              "Circle",
              {
                desiredSize: new go.Size(50, 50),
                fill: "#282c34",
                stroke: "#09d3ac",
                strokeWidth: 2,
              },
              new go.Binding("fill", "color")
            ),

            $(go.TextBlock, "开始", this.textStyle(), new go.Binding("text"))
          ),
          this.makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false, $)
        )
      );
    },
    // 添加结束节点
    addEndNode () {
      let $ = this.$;
      this.myDiagram.nodeTemplateMap.add(
        "End",
        $(
          go.Node,
          "Table",
          this.nodeStyle(),
          $(
            go.Panel,
            "Spot",
            $(
              go.Shape,
              "Circle",
              {
                desiredSize: new go.Size(50, 50),
                fill: "#282c34",
                stroke: "#DC3C00",
                strokeWidth: 2,
              },
              new go.Binding("fill", "color")
            ),
            $(go.TextBlock, "结束", this.textStyle(), new go.Binding("text"))
          ),
          // 每侧一个节点
          this.makePort("T", go.Spot.Top, go.Spot.Top, false, true, $)
          // this.makePort("L", go.Spot.Left, go.Spot.Left, false, true, $),
          // this.makePort("R", go.Spot.Right, go.Spot.Right, false, true, $)
        )
      );
    },
    // 添加异形节点
    addIconNode () {
      let $ = this.$;
      this.myDiagram.nodeTemplateMap.add(
        "Icon",
        $(
          go.Node,
          "Vertical",
          this.nodeStyle(),
          $(
            go.Panel,
            "Spot",

            $(
              go.Picture,
              { margin: 5, width: 50, height: 100 },
              new go.Binding("source", "icon")
            )
          )
        )
      ); // end Auto Panel
    },
    // 添加说明节点
    addExplainNode () {
      let $ = this.$;
      this.myDiagram.nodeTemplateMap.add(
        "Comment",
        $(
          go.Node,
          "Auto",
          this.nodeStyle(),
          $(
            go.Shape,
            {
              fill: "#282c34",
              stroke: "#DEE0A3",
              strokeWidth: 3,
              minSize: new go.Size(60, 20),
            },
            new go.Binding("fill", "color")
          ),
          $(
            go.TextBlock,
            this.textStyle(),
            {
              margin: 8,
              maxSize: new go.Size(200, NaN),
              wrap: go.TextBlock.WrapFit,
              textAlign: "center",
              editable: true,
            },
            new go.Binding("text").makeTwoWay()
          )
          // no ports, because no links are allowed to connect with a comment
        )
      );
    },
    // 设置分组样式
    setGroupTemplate () {
      let $ = this.$;
      let that = this;
      this.myDiagram.groupTemplate = $(
        go.Group,
        "Auto",
        {
          background: "transparent",
          // highlight when dragging into the Group
          mouseDragEnter: function (e, grp, prev) {
            that.highlightGroup(e, grp, true);
          },
          mouseDragLeave: function (e, grp, next) {
            that.highlightGroup(e, grp, false);
          },
          computesBoundsAfterDrag: true,
          // when the selection is dropped into a Group, add the selected Parts into that Group;
          // if it fails, cancel the tool, rolling back any changes
          mouseDrop: this.finishDrop,
          handlesDragDropForMembers: true, // don't need to define handlers on member Nodes and Links
          // Groups containing Groups lay out their members horizontally
          layout: $(go.GridLayout, {
            wrappingWidth: Infinity,
            alignment: go.GridLayout.Position,
            cellSize: new go.Size(1, 1),
            spacing: new go.Size(4, 4),
          }),
        },
        new go.Binding("background", "isHighlighted", function (h) {
          return h ? "rgba(255,0,0,0.2)" : "transparent";
        }).ofObject(),
        $(go.Shape, "Rectangle", {
          fill: null,
          stroke: "#FFDD33",
          strokeWidth: 2,
        }),
        $(
          go.Panel,
          "Vertical", // title above Placeholder
          $(
            go.Panel,
            "Horizontal", // button next to TextBlock
            { stretch: go.GraphObject.Horizontal, background: "#FFDD33" },
            $("SubGraphExpanderButton", {
              alignment: go.Spot.Right,
              margin: 5,
            }),
            $(
              go.TextBlock,
              {
                alignment: go.Spot.Center,
                editable: true,
                margin: 5,
                font: "bold 18px sans-serif",
                opacity: 0.75,
                stroke: "#404040",
              },
              new go.Binding("text", "text").makeTwoWay()
            )
          ), // end Horizontal Panel
          $(go.Placeholder, { padding: 5, alignment: go.Spot.Center })
        ), // end Vertical Panel
        this.makePort("T", go.Spot.Top, go.Spot.TopSide, false, true, $),
        this.makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false, $)
      ); // end Group and call to add to template Map
    },
    // 设置画布右键菜单
    setCanvasMenu () {
      this.myDiagram.contextMenu = this.partContextMenu();
    },

    // 设置线条样式
    setLinkTemplate () {
      let myDiagram = this.myDiagram;
      let $ = this.$;
      myDiagram.linkTemplate = $(
        go.Link, // the whole link panel
        {
          routing: go.Link.Orthogonal,
          curve: go.Link.JumpOver,
          corner: 5,
          toShortLength: 10,
          relinkableFrom: true,
          relinkableTo: true,
          // 设置线条样式是否可拖拽
          // reshapable: true,
          resegmentable: true,
          mouseEnter: function (e, link) {
            link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)";
          },
          mouseLeave: function (e, link) {
            link.findObject("HIGHLIGHT").stroke = "transparent";
          },
          selectionAdorned: false,
        },

        new go.Binding("points").makeTwoWay(),
        $(
          go.Shape, // the highlight shape, normally transparent
          {
            isPanelMain: true,
            strokeWidth: 8,
            stroke: "transparent",
            name: "HIGHLIGHT",
          }
        ),
        // $(
        //   go.Shape,
        //   { isPanelMain: true, strokeWidth: 7 },
        //   new go.Binding("stroke", "isSelected", function (sel) {
        //     return sel ? "dodgerblue" : "gray";
        //   }).ofObject(),
        //   new go.Binding("strokeWidth", "isHighlighted", function (h) {
        //     return h ? 2 : 1;
        //   }).ofObject(),
        //   new go.Binding("stroke", "isHighlighted", function (h) {
        //     return h ? "red" : "white";
        //   }).ofObject()
        // ),
        $(
          go.Shape,
          { isPanelMain: true, strokeWidth: 5 },
          new go.Binding("stroke", "isSelected", function (sel) {
            return sel ? "dodgerblue" : "gray";
          }).ofObject(),
          new go.Binding("strokeWidth", "isHighlighted", function (h, xx) {
            return h ? 3 : 2;

            // Run indefinitely
          }).ofObject(),
          new go.Binding("stroke", "isHighlighted", function (h, xx) {
            return h ? "red" : "gray";
          }).ofObject()
        ),
        $(go.Shape, {
          isPanelMain: true,
          stroke: "white",
          strokeWidth: 3,
          name: "PIPE",
          strokeDashArray: [10, 10],
          fill: "gray",
        }),
        $(go.Shape, {
          toArrow: "Triangle",
          scale: 1.3,
          fill: "gray",
          stroke: null,
        })
      );
      return;
    },
    // 加载图表
    startAnimate () {
      var animation = new go.Animation();
      animation.easing = go.Animation.EaseLinear;
      this.myDiagram.links.each(function (link) {
        animation.add(link.findObject("PIPE"), "strokeDashOffset", 20, 0);
        animation.runCount = Infinity;
        animation.start();
      });
      return true;
    },
    load () {
      let data = [
        {
          category: "Comment",
          loc: "360 -10",
          text: "Kookie Brittle",
          key: -13,
          name: "文本内容",
        },
        {
          category: "Icon",
          text: "Kookie Brittle",
          key: -111,
          name: "文本内容",
          icon: "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fphotocdn.sohu.com%2F20140308%2FImg396262595.jpg&refer=http%3A%2F%2Fphotocdn.sohu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1651047886&t=075fe50f680f0f88bb94b0f11ccb11e1",
        },
        {
          key: -1,
          category: "Start",
          loc: "175 0",
          text: "开始",
          name: "开始",
        },
        {
          key: 2,
          loc: "175 250",
          text: [
            "测试1",
            "测试1",
            "测试1",
            "测试1",
            "测试1",
            "测试1",
            "测试1",
            "测试1",
          ],
          name: "节点",
        },
        {
          key: 3,
          loc: "175 340",
          text: ["测试1", "测试1", "测试1", "测试1"],
          name: "节点",
        },
        {
          key: 4,
          loc: "175 430",
          text: ["测试1测试1测试1测试1测试1", "测试1", "测试1", "测试1"],
          name: "节点",
        },
        {
          key: 5,
          loc: "355 135",
          text: ["测试1", "测试1", "测试1", "测试1"],
          name: "节点",
        },
        {
          key: 7,
          loc: "175 600",
          text: ["测试1", "测试1", "测试1", "测试1"],
          name: "节点",
        },
        {
          key: -2,
          category: "End",
          loc: "175 710",
          text: "结束",
          name: "结束",
        },
      ];
      let linkData = [
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
        { from: 4, to: 6 },
        { from: 6, to: 7 },
        { from: 7, to: 8 },
        { from: 8, to: -2 },
        { from: -1, to: 0 },
        { from: -1, to: 1 },
        { from: -1, to: 5 },
        { from: 5, to: 4 },
        { from: 0, to: 4 },
      ];
      let theme = localStorage.getItem("EDITOR-THEME");
      this.setTheme(data, linkData, theme);
    },
    nodeInfo (d) {
      var str = "Node " + d.key + ": " + d.text + "\n";
      if (d.group) str += "member of " + d.group;
      else str += "top-level node";
      return str;
    },
    groupInfo (adornment) {
      // 接受工具提示或关联菜单，而不是组节点数据对象
      var g = adornment.adornedPart; // 获取工具提示所修饰的组
      var mems = g.memberParts.count;
      var links = 0;
      g.memberParts.each(function (part) {
        if (part instanceof go.Link) links++;
      });
      return (
        "Group " +
        g.data.key +
        ": " +
        g.data.text +
        "\n" +
        mems +
        " members including " +
        links +
        " links"
      );
    },
    linkInfo (d) {
      // Tooltip info for a link data object
      return "Link:\nfrom " + d.from + " to " + d.to;
    },
    //如果链接标签来自“条件”节点，则使其可见。
    //此侦听器由“LinkDrawed”和“LinkRelinked”图事件调用。
    showLinkLabel (e) {
      var label = e.subject.findObject("LABEL");
      if (label !== null)
        label.visible = e.subject.fromNode.data.category === "Conditional";
    },
    //定义节点的外观和行为：
    //首先，为所有节点、链接和组定义共享上下文菜单。
    //为了简化这段代码，我们定义了一个创建上下文菜单按钮的函数：
    makeButton (text, action, visiblePredicate) {
      return this.$(
        "ContextMenuButton",
        this.$(go.TextBlock, text),
        { click: action },
        visiblePredicate
          ? new go.Binding("visible", "", function (o, e) {
            return o.diagram ? visiblePredicate(o, e) : false;
          }).ofObject()
          : {}
      );
    },
    // 这是默认动画的重新实现，只是它会从下而不是向上淡入。
    animateFadeDown (e) {
      var diagram = e.diagram;
      var animation = new go.Animation();
      animation.isViewportUnconstrained = true; // So Diagram positioning rules let the animation start off-screen
      animation.easing = go.Animation.EaseOutExpo;
      animation.duration = 900;
      // Fade "down", in other words, fade in from above
      animation.add(
        diagram,
        "position",
        diagram.position.copy().offset(0, 200),
        diagram.position
      );
      animation.add(diagram, "opacity", 0, 1);
      animation.start();
    },
    //图标样式
    chartStyle () {
      return [
        //节点。位置来自节点数据的“loc”属性，
        //按点转换。解析静态方法。
        //如果是节点。位置更改后，它会更新节点数据的“loc”属性，
        //使用点转换回来。严格化静态方法。
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
          go.Point.stringify
        ),
        {
          //节点。位置位于每个节点的中心
          locationSpot: go.Spot.Center,
        },
      ];
    },
    //定义用于创建通常透明的“端口”的函数。
    //“名称”用作GraphObject。波蒂德，
    //“对齐”用于确定端口相对于节点主体的位置，
    //“点”用于控制链接与端口的连接方式以及端口
    //沿着节点的侧面延伸，
    //布尔“输出”和“输入”参数控制用户是否可以从端口绘制链接。
    makePort (name, align, spot, output, input, $) {
      var horizontal =
        align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
      // the port is basically just a transparent rectangle that stretches along the side of the node,
      // and becomes colored when the mouse passes over it
      return $(go.Shape, {
        fill: "transparent", // changed to a color in the mouseEnter event handler
        strokeWidth: 0, // no stroke
        width: horizontal ? NaN : 8, // if not stretching horizontally, just 8 wide
        height: !horizontal ? NaN : 8, // if not stretching vertically, just 8 tall
        alignment: align, // align the port on the main Shape
        stretch: horizontal
          ? go.GraphObject.Horizontal
          : go.GraphObject.Vertical,
        portId: name, // declare this object to be a "port"
        fromSpot: spot, // declare where links may connect at this port
        fromLinkable: output, // declare whether the user may draw links from here
        toSpot: spot, // declare where links may connect at this port
        toLinkable: input, // declare whether the user may draw links to here
        cursor: "pointer", // show a different cursor to indicate potential link point
        mouseEnter: function (e, port) {
          // the PORT argument will be this Shape
          if (!e.diagram.isReadOnly) port.fill = "rgba(255,0,255,0.5)";
        },
        mouseLeave: function (e, port) {
          port.fill = "transparent";
        },
      });
    },
    textStyle () {
      return {
        font: "bold 11pt Lato, Helvetica, Arial, sans-serif",
        stroke: "#F8F8F8",
      };
    },
    finishDrop (e, grp) {
      var ok =
        grp !== null
          ? grp.addMembers(grp.diagram.selection, true)
          : e.diagram.commandHandler.addTopLevelParts(
            e.diagram.selection,
            true
          );
      if (!ok) e.diagram.currentTool.doCancel();
    },
    highlightGroup (e, grp, show) {
      if (!grp) return;
      e.handled = true;
      if (show) {
        // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
        // instead depend on the DraggingTool.draggedParts or .copiedParts
        var tool = grp.diagram.toolManager.draggingTool;
        var map = tool.draggedParts || tool.copiedParts; // this is a Map
        // now we can check to see if the Group will accept membership of the dragged Parts
        if (grp.canAddMembers(map.toKeySet())) {
          grp.isHighlighted = true;
          return;
        }
      }
      grp.isHighlighted = false;
    },
    // 节点模板的帮助器定义
    nodeStyle () {
      return [
        //节点。位置来自节点数据的“loc”属性，
        //按点转换。解析静态方法。
        //如果是节点。位置更改后，它会更新节点数据的“loc”属性，
        //使用点转换回来。严格化静态方法。
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
          go.Point.stringify
        ),
        {
          // 节点。位置位于每个节点的中心
          locationSpot: go.Spot.Center,
        },
      ];
    },
    // 以JSON格式显示图表的模型，供用户编辑
    save () {
      document.getElementById("mySavedModel").value =
        this.myDiagram.model.toJson();
      this.myDiagram.isModified = false;
    },
    partContextMenu () {
      return this.$(
        "ContextMenu",
        this.makeButton(
          "剪切",
          function (e, obj) {
            e.diagram.commandHandler.cutSelection();
          },
          function (o) {
            return o.diagram.commandHandler.canCutSelection();
          }
        ),
        this.makeButton(
          "复制",
          function (e, obj) {
            e.diagram.commandHandler.copySelection();
          },
          function (o) {
            return o.diagram.commandHandler.canCopySelection();
          }
        ),
        this.makeButton(
          "粘贴",
          function (e, obj) {
            e.diagram.commandHandler.pasteSelection(
              e.diagram.toolManager.contextMenuTool.mouseDownPoint
            );
          },
          function (o) {
            return o.diagram.commandHandler.canPasteSelection(
              o.diagram.toolManager.contextMenuTool.mouseDownPoint
            );
          }
        ),
        this.makeButton(
          "删除",
          function (e, obj) {
            e.diagram.commandHandler.deleteSelection();
          },
          function (o) {
            return o.diagram.commandHandler.canDeleteSelection();
          }
        ),
        this.makeButton(
          "撤回",
          function (e, obj) {
            e.diagram.commandHandler.undo();
          },
          function (o) {
            return o.diagram.commandHandler.canUndo();
          }
        ),
        this.makeButton(
          "重做",
          function (e, obj) {
            e.diagram.commandHandler.redo();
          },
          function (o) {
            return o.diagram.commandHandler.canRedo();
          }
        ),
        this.makeButton(
          "设置为组",
          function (e, obj) {
            e.diagram.commandHandler.groupSelection();
          },
          function (o) {
            return o.diagram.commandHandler.canGroupSelection();
          }
        ),
        this.makeButton(
          "解除分组",
          function (e, obj) {
            e.diagram.commandHandler.ungroupSelection();
          },
          function (o) {
            return o.diagram.commandHandler.canUngroupSelection();
          }
        )
      );
    },
  },
};

</script>
<style lang="scss" scoped>
// 画布
.editor-flowC-chart {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 5px;
  top: 0;
  left: 0;
  z-index: 10000;
  height: 500px;
  // border: 1px solid red;

  position: relative;

  #myPaletteDiv {
    // height: 100%;
    width: 130px;
    margin-right: 2px;
    // background-color: rgb(40, 44, 52);
    position: relative;
    // -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
    cursor: auto;
  }

  #myDiagramDiv {
    flex-grow: 1;
    // height: 100%;
    // background-color: rgb(40, 44, 52);
    position: relative;
    // -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
    cursor: auto;
  }
  // 缩略图
  .testInput {
    width: 130px;
    // background-color: white;
    height: 200px;
    position: absolute;
    bottom: 10px;
    right: 0;
    // position: fixed;
    // margin: 0; /*关键*/
    color: #f00;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 0.1);
  }

  .toolbar {
    height: 50px;
    width: 130px;
    // background-color: rgb(40, 44, 52);
    position: absolute;
    bottom: 200px;
    z-index: 100;
  }
}
</style>