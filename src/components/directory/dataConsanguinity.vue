<template>
  <div id="container" class="data-consanguinity"></div>
</template>

<script>
import G6 from '@antv/g6';
import {
  getDataConsanguinity,
} from "@/api/data/table-info.js";
export default {
  name: "dataConsanguinity",
  data(){
    return{
      g6Data:{
        // 点集
        nodes: [
          {
            id: 'node1', // String，该节点存在则必须，节点的唯一标识
            x: 100, // Number，可选，节点位置的 x 值
            y: 200, // Number，可选，节点位置的 y 值
          },
          {
            id: 'node2', // String，该节点存在则必须，节点的唯一标识
            x: 300, // Number，可选，节点位置的 x 值
            y: 200, // Number，可选，节点位置的 y 值
          },
        ],
        // 边集
        edges: [
          {
            source: 'node1', // String，必须，起始点 id
            target: 'node2', // String，必须，目标点 id
          },
        ],
      }
    }
  },
  methods:{
    init(list){
      const {
        Util,
        registerBehavior,
        registerEdge,
        registerNode
      } = G6;

      const rawData = [
        {
          "id": "info",
          "label": "Employee",
          "attrs": [
            {
              "key": "id",
              "type": "number(6)",
              "relation": [{
                "key": "id",
                "nodeId": "dept"
              },{
                "key": "title",
                "nodeId": "dept"
              },
                {
                  "key": "manager",
                  "nodeId": "dept"
                },
              ]
            },
            {
              "key": "key",
              "type": "varchar(255)"
            },
            {
              "key": "gender",
              "type": "enum(M, F)"
            },
            {
              "key": "birthday",
              "type": "date"
            },
            {
              "key": "hometown",
              "type": "varchar(255)"
            },
            {
              "key": "country",
              "type": "varchar(255)"
            },
            {
              "key": "nation",
              "type": "varchar(255)"
            },
            {
              "key": "jobId",
              "type": "number(3)",
              "relation": [{
                "key": "id",
                "nodeId": "job"
              }]
            },
            {
              "key": "phone",
              "type": "varchar(255)"
            },
            {
              "key": "deptId",
              "type": "number(6)",
              "relation": [{
                "key": "id",
                "nodeId": "dept"
              }]
            },
            {
              "key": "startTime",
              "type": "date"
            },
            {
              "key": "leaveTime",
              "type": "date"
            }
          ]
        },
        {
          "id": "dept",
          "label": "Department",
          "attrs": [
            {
              "key": "id",
              "type": "number(6)",
              "relation": [{
                "key": "id",
                "nodeId": "dept2"
              }]
            },
            {
              "key": "title",
              "type": "varchar(255)"
            },
            {
              "key": "desc",
              "type": "text"
            },
            {
              "key": "parent",
              "type": "number(6)",
              "relation": [{
                "key": "id",
                "nodeId": "dept2"
              }]
            },
            {
              "key": "manager",
              "type": "number(6)"
            }
          ]
        },
        {
          "id": "dept2",
          "label": "Department2",
          "attrs": [
            {
              "key": "id",
              "type": "number(6)",
              "relation": [{
                "key": "id",
                "nodeId": "dept3"
              }]
            },
            {
              "key": "title",
              "type": "varchar(255)"
            },
            {
              "key": "desc",
              "type": "text"
            },
            {
              "key": "parent",
              "type": "number(6)",
              "relation": [{
                "key": "id",
                "nodeId": "dept3"
              }]
            },
            {
              "key": "manager",
              "type": "number(6)"
            }
          ]
        },
        {
          "id": "dept3",
          "label": "Department2",
          "attrs": [{
            "key": "id",
            "type": "number(6)"
          },
            {
              "key": "title",
              "type": "varchar(255)"
            },
            {
              "key": "desc",
              "type": "text"
            },
            {
              "key": "parent",
              "type": "number(6)",
            },
            {
              "key": "manager",
              "type": "number(6)"
            }
          ]
        }
      ]



      const isInBBox = (point, bbox) => {
        const {
          x,
          y
        } = point;
        const {
          minX,
          minY,
          maxX,
          maxY
        } = bbox;

        return x < maxX && x > minX && y > minY && y < maxY;
      };

      const itemHeight = 20;
      registerBehavior("dice-er-scroll", {
        getDefaultCfg() {
          return {
            multiple: true,
          };
        },
        getEvents() {
          return {
            itemHeight,
            // wheel: "scorll",
            click: "click",
            "node:mousemove": "move",
          };
        },
        scorll(e) {
          e.preventDefault();
          const {
            graph
          } = this;
          const nodes = graph.getNodes().filter((n) => {
            const bbox = n.getBBox();

            return isInBBox(graph.getPointByClient(e.clientX, e.clientY), bbox);
          });

          const x = e.deltaX || e.movementX;
          let y = e.deltaY || e.movementY;
          if (!y && navigator.userAgent.indexOf('Firefox') > -1) y = (-e.wheelDelta * 125) / 3

          if (nodes) {
            const edgesToUpdate = new Set();
            nodes.forEach((node) => {
              const model = node.getModel();
              if (model.attrs.length < 2) {
                return;
              }
              const idx = model.startIndex || 0;
              let startX = model.startX || 0.5;
              let startIndex = idx + y * 0.02;
              startX -= x;
              if (startIndex < 0) {
                startIndex = 0;
              }
              if (startX > 0) {
                startX = 0;
              }
              if (startIndex > model.attrs.length - 1) {
                startIndex = model.attrs.length - 1;
              }

              graph.updateItem(node, {
                startIndex,
                startX,
              });
              node.getEdges().forEach(edge => edgesToUpdate.add(edge))
            });
            // G6 update the related edges when graph.updateItem with a node according to the new properties
            // here you need to update the related edges manualy since the new properties { startIndex, startX } for the nodes are custom, and cannot be recognized by G6
            edgesToUpdate.forEach(edge => edge.refresh())
          }


        },
        click(e) {
          const {
            graph
          } = this;
          const item = e.item;
          const shape = e.shape;
          if (!item) {
            return;
          }

          if (shape.get("name") === "collapse") {
            graph.updateItem(item, {
              collapsed: true,
              size: [300, 50],
            });
            setTimeout(() => graph.layout(), 100);
          } else if (shape.get("name") === "expand") {
            graph.updateItem(item, {
              collapsed: false,
              size: [300, height],
            });
            setTimeout(() => graph.layout(), 100);
          };

          const name = e.shape.get("name");
          function setPreSel(key,parentId,list,graph){
            function sp(k,p){
              for(let len=list.length,i=len-1;i>-1;i--){
                let item=list[i];
                item._cfg.model.attrs.forEach((vtem,m)=>{
                  if(vtem.relation){
                    vtem.relation.forEach((rtem)=>{
                      if(rtem.key==k&&rtem.nodeId==p){
                        vtem.iss=true;
                        graph.updateItem(item, {
                          // relationSelectedIndex: Number(m),
                          iss:true,
                        });
                        item.getEdges().forEach(edge => edge.refresh())
                        sp(vtem.key,item._cfg.id)
                      }
                    })
                  }
                })

              }
            }
            sp(key,parentId)
          }
          function setNextSel(key,parentId,list,graph){
            function sp(k,p){
              for(let len=list.length,i=0;i<len;i++){
                let item=list[i];
                item._cfg.model.attrs.forEach((vtem,m)=>{
                  if(vtem.key==k&&item._cfg.id==p){
                    vtem.parentId=item._cfg.id;
                    vtem.iss=true;
                    graph.updateItem(item, {
                      // relationSelectedIndex: Number(m),
                      iss:true,
                    });
                    item.getEdges().forEach(edge => edge.refresh())
                    if(vtem.relation){
                      vtem.relation.forEach((rtem)=>{
                        sp(rtem.key,rtem.nodeId)
                      })
                    }
                  }

                })

              }
            }
            sp(key,parentId)
          }
          function removeAtc(graph){
            graph.getNodes().forEach((node)=>{

              node._cfg.model.attrs.forEach((modelNode)=>{
                modelNode.iss=false;
              });
              graph.updateItem(node, {
                relationSelectedIndex: NaN,
                iss:false,
                selectedIndex: NaN,
              });
            })
            graph.getEdges().forEach((edge)=>{
              // item.getEdges().forEach((edge)=>{
              graph.updateItem(edge, {
                selected:false,
              });
            });
          };
          if (name && name.startsWith("item")) {
            removeAtc(this.graph);
            this.graph.getEdges().forEach((edge)=>{
              // item.getEdges().forEach((edge)=>{
              let model=edge.getModel();
              // console.log(model);
              let sel=item._cfg.model.attrs[Number(name.split("-")[1])];
              // console.log(sel,293);
              if(sel.key == model.sourceKey||sel.key==model.targetKey){
                sel.parentId=item._cfg.id;
                sel.iss=true;
                this.graph.updateItem(edge, {
                  selected:true,
                });
                // console.log(sel,model,item._cfg.model)
                let nodeList=this.graph.getNodes();
                nodeList.forEach((node)=>{

                  if(node._cfg.id == model.target||node._cfg.id == model.source){
                    node._cfg.model.attrs.forEach((modelNode,m)=>{
                      modelNode.parentId=node._cfg.id;



                      if(sel.relation){
                        sel.relation.forEach((sr)=>{
                          if(sr.nodeId==node._cfg.id&&sr.key==modelNode.key){
                            modelNode.iss=true;
                            modelNode.preRelation=sel;
                            setNextSel(modelNode.key,node._cfg.id,nodeList,this.graph);
                            // console.log(modelNode,349)
                            this.graph.updateItem(node, {
                              // relationSelectedIndex: Number(m),
                              iss:true,
                            });
                            node.getEdges().forEach(edge => edge.refresh())
                          }

                        })
                      }
                      if(modelNode.relation){
                        modelNode.relation.forEach((rrr)=>{
                          if(rrr.key==sel.key&&rrr.nodeId==sel.parentId){
                            modelNode.iss=true;
                            modelNode.nextRelation=sel;
                            setPreSel(modelNode.key,node._cfg.id,nodeList,this.graph);
                            this.graph.updateItem(node, {
                              // relationSelectedIndex: Number(m),
                              iss:true,
                            });
                            node.getEdges().forEach(edge => edge.refresh())
                          }
                        })
                      }

                    })
                  }
                })

              }

            });

            this.graph.updateItem(item, {
              selectedIndex: Number(name.split("-")[1]),
            });
            // 更新所有 combos
            this.graph.updateCombos();
          } else {
            // this.graph.updateItem(item, {
            //   selectedIndex: NaN,
            // });
            removeAtc(this.graph);
          }
        },
        move(e) {

          function setPreSel(key,parentId,list,graph){
            function sp(k,p){
              for(let len=list.length,i=len-1;i>-1;i--){
                let item=list[i];
                item._cfg.model.attrs.forEach((vtem,m)=>{
                  if(vtem.relation){
                    vtem.relation.forEach((rtem)=>{
                      if(rtem.key==k&&rtem.nodeId==p){
                        vtem.iss=true;
                        graph.updateItem(item, {
                          // relationSelectedIndex: Number(m),
                          iss:true,
                        });
                        item.getEdges().forEach(edge => edge.refresh())
                        sp(vtem.key,item._cfg.id)
                      }
                    })
                  }
                })

              }
            }
            sp(key,parentId)
          }
          function setNextSel(key,parentId,list,graph){
            function sp(k,p){
              for(let len=list.length,i=0;i<len;i++){
                let item=list[i];
                item._cfg.model.attrs.forEach((vtem,m)=>{
                  if(vtem.key==k&&item._cfg.id==p){
                    vtem.parentId=item._cfg.id;
                    vtem.iss=true;
                    graph.updateItem(item, {
                      // relationSelectedIndex: Number(m),
                      iss:true,
                    });
                    item.getEdges().forEach(edge => edge.refresh())
                    if(vtem.relation){
                      vtem.relation.forEach((rtem)=>{
                        sp(rtem.key,rtem.nodeId)
                      })
                    }
                  }

                })

              }
            }
            sp(key,parentId)
          }
          function removeAtc(graph){
            graph.getNodes().forEach((node)=>{

              node._cfg.model.attrs.forEach((modelNode)=>{
                modelNode.iss=false;
              });
              graph.updateItem(node, {
                relationSelectedIndex: NaN,
                iss:false,
                selectedIndex: NaN,
              });
            })
            graph.getEdges().forEach((edge)=>{
              // item.getEdges().forEach((edge)=>{
              graph.updateItem(edge, {
                selected:false,
              });
            });
          };
          const name = e.shape.get("name");
          const item = e.item;
          // if (name && name.startsWith("item")) {
          //   // console.log(item)
          //   // console.log( this.graph.getNodes());
          //   this.graph.getEdges().forEach((edge)=>{
          //   // item.getEdges().forEach((edge)=>{
          //     let model=edge.getModel();
          //     // console.log(model);
          //     let sel=item._cfg.model.attrs[Number(name.split("-")[1])];
          //     // console.log(sel,293);
          //     if(sel.key == model.sourceKey||sel.key==model.targetKey){
          //       sel.parentId=item._cfg.id;
          //       sel.iss=true;
          //       this.graph.updateItem(edge, {
          //         selected:true,
          //       });
          //       // console.log(sel,model,item._cfg.model)
          //       let nodeList=this.graph.getNodes();
          //       nodeList.forEach((node)=>{
          //
          //         if(node._cfg.id == model.target||node._cfg.id == model.source){
          //           node._cfg.model.attrs.forEach((modelNode,m)=>{
          //             modelNode.parentId=node._cfg.id;
          //
          //
          //
          //             if(sel.relation){
          //               sel.relation.forEach((sr)=>{
          //                 if(sr.nodeId==node._cfg.id&&sr.key==modelNode.key){
          //                   modelNode.iss=true;
          //                   modelNode.preRelation=sel;
          //                   setNextSel(modelNode.key,node._cfg.id,nodeList,this.graph);
          //                   // console.log(modelNode,349)
          //                   this.graph.updateItem(node, {
          //                     // relationSelectedIndex: Number(m),
          //                     iss:true,
          //                   });
          //                   node.getEdges().forEach(edge => edge.refresh())
          //                 }
          //
          //               })
          //             }
          //             if(modelNode.relation){
          //               modelNode.relation.forEach((rrr)=>{
          //                 if(rrr.key==sel.key&&rrr.nodeId==sel.parentId){
          //                   modelNode.iss=true;
          //                   modelNode.nextRelation=sel;
          //                   setPreSel(modelNode.key,node._cfg.id,nodeList,this.graph);
          //                   this.graph.updateItem(node, {
          //                     // relationSelectedIndex: Number(m),
          //                     iss:true,
          //                   });
          //                   node.getEdges().forEach(edge => edge.refresh())
          //                 }
          //               })
          //             }
          //
          //           })
          //         }
          //       })
          //
          //     }
          //
          //   });
          //
          //   this.graph.updateItem(item, {
          //     selectedIndex: Number(name.split("-")[1]),
          //   });
          //   // 更新所有 combos
          //   this.graph.updateCombos();
          // } else {
          //   removeAtc(this.graph);
          // }
        },
      });

      registerEdge("dice-er-edge", {
        draw(cfg, group) {
          // const {
          //   selected
          // } = cfg;
          const edge = group.cfg.item;
          const sourceNode = edge.getSource().getModel();
          const targetNode = edge.getTarget().getModel();


          const sourceIndex = sourceNode.attrs.findIndex(
              (e) => e.id === cfg.sourceKey
          );

          const sourceStartIndex = sourceNode.startIndex || 0;

          let sourceY = 15;

          if (!sourceNode.collapsed && sourceIndex > sourceStartIndex - 1) {
            sourceY = 30 + (sourceIndex - sourceStartIndex + 0.5) * itemHeight;
            sourceY = Math.min(sourceY, height);
          }

          const targetIndex = targetNode.attrs.findIndex(
              (e) => e.key === cfg.targetKey
          );
          // console.log(sourceNode.attrs[sourceIndex],targetNode.attrs[targetIndex],427)

          const targetStartIndex = targetNode.startIndex || 0;

          let targetY = 15;

          if (!targetNode.collapsed && targetIndex > targetStartIndex - 1) {
            targetY = (targetIndex - targetStartIndex + 0.5) * itemHeight + 30;
            targetY = Math.min(targetY, height);
          }

          const startPoint = {
            ...cfg.startPoint
          };
          const endPoint = {
            ...cfg.endPoint
          };

          startPoint.y = startPoint.y + sourceY;
          endPoint.y = endPoint.y + targetY;

          // function getLineNode(s,t,sid,tid){
          //   let _n={sourceNode:null,targetNode:null}
          //   s.forEach((stem)=>{
          //     if(stem.id==sid){
          //       _n.sourceNode=stem;
          //     }
          //   });
          //   t.forEach((ttem)=>{
          //     if(ttem.id==tid){
          //       _n.targetNode=ttem;
          //     }
          //   });
          //   return _n;
          // };
          // let lineNode=getLineNode(cfg.sourceNode._cfg.model.attrs,cfg.targetNode._cfg.model.attrs,cfg.sourceKey,cfg.targetKey);

          let shape;
          if (sourceNode.id !== targetNode.id) {
            shape = group.addShape("path", {
              attrs: {
                stroke: sourceNode.attrs[sourceIndex]&&targetNode.attrs[targetIndex]&&sourceNode.attrs[sourceIndex].iss&&targetNode.attrs[targetIndex].iss?'#000':"#999",
                lineWidth:sourceNode.attrs[sourceIndex]&&targetNode.attrs[targetIndex]&&sourceNode.attrs[sourceIndex].iss&&targetNode.attrs[targetIndex].iss?2:1,
                path: [
                  ["M", startPoint.x, startPoint.y],
                  [
                    "C",
                    endPoint.x / 3 + (2 / 3) * startPoint.x,
                    startPoint.y,
                    endPoint.x / 3 + (2 / 3) * startPoint.x,
                    endPoint.y,
                    endPoint.x,
                    endPoint.y,
                  ],
                ],
                endArrow: true,
              },
              // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
              name: "path-shape",
            });
          } else if (!sourceNode.collapsed) {
            let gap = Math.abs((startPoint.y - endPoint.y) / 3);
            if (startPoint["index"] === 1) {
              gap = -gap;
            }
            shape = group.addShape("path", {
              attrs: {
                stroke: sourceNode.attrs[sourceIndex]&&targetNode.attrs[targetIndex]&&sourceNode.attrs[sourceIndex].iss&&targetNode.attrs[targetIndex].iss?'#000':"#999",
                lineWidth:sourceNode.attrs[sourceIndex]&&targetNode.attrs[targetIndex]&&sourceNode.attrs[sourceIndex].iss&&targetNode.attrs[targetIndex].iss?2:1,
                path: [
                  ["M", startPoint.x, startPoint.y],
                  [
                    "C",
                    startPoint.x - gap,
                    startPoint.y,
                    startPoint.x - gap,
                    endPoint.y,
                    startPoint.x,
                    endPoint.y,
                  ],
                ],
                endArrow: true,
              },
              // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
              name: "path-shape",
            });
          }

          return shape;
        },
        afterDraw(cfg, group) {
          // const labelCfg = cfg.labelCfg || {};
          const edge = group.cfg.item;
          const sourceNode = edge.getSource().getModel();
          const targetNode = edge.getTarget().getModel();
          if (sourceNode.collapsed && targetNode.collapsed) {
            return;
          }
          const path = group.find(
              (element) => element.get("name") === "path-shape"
          );

          const labelStyle = Util.getLabelPosition(path, 0.5, 0, 0, true);
          const label = group.addShape("text", {
            attrs: {
              ...labelStyle,
              text: cfg.label || '',
              fill: "#000",
              textAlign: "center",
              stroke: "#fff",
              lineWidth: 1,
            },
          });
          label.rotateAtStart(labelStyle.rotate);
        },

      });

      registerNode("dice-er-box", {
        draw(cfg, group) {
          const width = 250;
          const height =cfg.attrs.length*20+30+16;
          const itemCount = cfg.attrs.length+1;
          function getColor(str){
            let color='';
            switch (str) {
              case "table":
                color ="#91c051";
                break;
              case "insert-select":
                color ="#b24b78";
                break;
              case "select_list":
                color ="#d26b58";
                break;
              case "select_union":
                color ="#357e7e";
                break;
              default:
                color="#096DD9";
            }
            return color;
          }
          const boxStyle = {
            stroke: getColor(cfg.showType),
            radius: 4,
          };
          const {
            attrs = [],
            startIndex = 0,
            selectedIndex,
            // relationSelectedIndex,
            collapsed,
            icon,
            coordinates
          } = cfg;
          // cfg.x=(coordinates[0].x+coordinates[1].x)*25;
          // cfg.y=(coordinates[0].y+coordinates[1].y)*15;
          // console.log(cfg);
          const list = attrs;
          const afterList = list.slice(
              Math.floor(startIndex),
              Math.floor(startIndex + itemCount - 1)
          );
          const offsetY = (0.5 - (startIndex % 1)) * itemHeight + 30;

          group.addShape("rect", {
            attrs: {
              fill: boxStyle.stroke,
              height: 30,
              width,
              radius: [boxStyle.radius, boxStyle.radius, 0, 0],
            },
            draggable: true,
          });

          let fontLeft = 12;

          if (icon && icon.show !== false) {
            group.addShape("image", {
              attrs: {
                x: 8,
                y: 8,
                height: 16,
                width: 16,
                ...icon,
              },
            });
            fontLeft += 18;
          }

          group.addShape("text", {
            attrs: {
              y: 22,
              x: fontLeft,
              fill: "#fff",
              text: cfg.label,
              fontSize: 12,
              fontWeight: 500,
            },
          });

          group.addShape("rect", {
            attrs: {
              x: 0,
              y: collapsed ? 30 : height,
              height: 15,
              width,
              fill: "#eee",
              radius: [0, 0, boxStyle.radius, boxStyle.radius],
              cursor: "pointer",
            },
            // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
            name: collapsed ? "expand" : "collapse",
          });

          group.addShape("text", {
            attrs: {
              x: width / 2 - 6,
              y: (collapsed ? 30 : height) + 12,
              text: collapsed ? "+" : "-",
              width,
              fill: "#000",
              radius: [0, 0, boxStyle.radius, boxStyle.radius],
              cursor: "pointer",
            },
            // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
            name: collapsed ? "expand" : "collapse",
          });

          const keyshape = group.addShape("rect", {
            attrs: {
              x: 0,
              y: 0,
              width,
              height: collapsed ? 45 : height,
              ...boxStyle,
            },
            draggable: true,
          });

          if (collapsed) {
            return keyshape;
          }

          const listContainer = group.addGroup({});
          listContainer.setClip({
            type: "rect",
            attrs: {
              x: -8,
              y: 30,
              width: width + 16,
              height: height - 30,
            },
          });
          listContainer.addShape({
            type: "rect",
            attrs: {
              x: 1,
              y: 30,
              width: width - 2,
              height: height - 30,
              fill: "#fff",
            },
            draggable: true,
          });

          if (list.length > itemCount) {
            const barStyle = {
              width: 4,
              padding: 0,
              boxStyle: {
                stroke: "#00000022",
              },
              innerStyle: {
                fill: "#00000022",
              },
            };

            listContainer.addShape("rect", {
              attrs: {
                y: 30,
                x: width - barStyle.padding - barStyle.width,
                width: barStyle.width,
                height: height - 30,
                ...barStyle.boxStyle,
              },
            });

            const indexHeight =
                afterList.length > itemCount ?
                    (afterList.length / list.length) * height :
                    10;

            listContainer.addShape("rect", {
              attrs: {
                y: 30 +
                    barStyle.padding +
                    (startIndex / list.length) * (height - 30),
                x: width - barStyle.padding - barStyle.width,
                width: barStyle.width,
                height: Math.min(height, indexHeight),
                ...barStyle.innerStyle,
              },
            });
          }
          if (afterList) {
            afterList.forEach((e, i) => {
              const isSelected =
                  Math.floor(startIndex) + i === Number(selectedIndex);
              const isSelectedRelation =e.iss;
              // const isSelectedRelation =
              //     Math.floor(startIndex) + i === Number(relationSelectedIndex);
              let {
                name,
              } = e;
              // if (type) {
              //   key += " - " + type;
              // }
              const label = name.length > 26 ? name.slice(0, 24) + "..." : name;


              listContainer.addShape("rect", {
                attrs: {
                  x: 1,
                  y: i * itemHeight - itemHeight / 2 + offsetY,
                  width: width - 4,
                  height: itemHeight,
                  radius: 2,
                  lineWidth: 1,
                  cursor: "pointer",
                },
                // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
                name: `item-${Math.floor(startIndex) + i}-content`,
                draggable: true,
              });

              if (!cfg.hideDot) {
                listContainer.addShape("circle", {
                  attrs: {
                    x: 0,
                    y: i * itemHeight + offsetY,
                    r: 3,
                    stroke: boxStyle.stroke,
                    fill: "white",
                    radius: 2,
                    lineWidth: 1,
                    cursor: "pointer",
                  },
                });
                listContainer.addShape("circle", {
                  attrs: {
                    x: width,
                    y: i * itemHeight + offsetY,
                    r: 3,
                    stroke: boxStyle.stroke,
                    fill: "white",
                    radius: 2,
                    lineWidth: 1,
                    cursor: "pointer",
                  },
                });
              }

              listContainer.addShape("rect", {
                attrs: {
                  x: 0,
                  y: i * itemHeight+ offsetY-10,
                  fill: isSelected ? "rgba(253,153,30,.6)":isSelectedRelation?"rgba(0,0,0,.4)":"transparent",
                  height: itemHeight,
                  width,
                },
              });
              listContainer.addShape("text", {
                attrs: {
                  x: 12,
                  y: i * itemHeight + offsetY + 6,
                  text: label,
                  fontSize: 12,
                  fill: "#000",
                  fontFamily: "Avenir,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol",
                  full: e,
                  fontWeight: isSelected ? 500 : 100,
                  cursor: "pointer",
                },
                // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
                name: `item-${Math.floor(startIndex) + i}`,
              });

            });
          }



          return keyshape;
        },
        getAnchorPoints() {
          return [
            [0, 0],
            [1, 0],
          ];
        },
      });

      const dataTransform = (data) => {
        const nodes = [];
        const edges = [];

        data.map((node) => {
          nodes.push({
            ...node
          });
          if (node.attrs) {
            node.attrs.forEach((attr) => {
              if (attr.relation) {
                attr.relation.forEach((relation) => {
                  edges.push({
                    source: node.id,
                    target: relation.parentId,
                    sourceKey: attr.id,
                    targetKey: relation.id,
                    label: relation.label,
                  });
                });
              }

            });
          }
        });

        return {
          nodes,
          edges,
        };
      }

      const container = document.getElementById('container');

      const width = container.scrollWidth;
      const height = (container.scrollHeight || 400) - 20;

      const graph = new G6.Graph({
        container: 'container',
        width,
        height,
        defaultNode: {
          // size: [300, 200],
          type: 'dice-er-box',
          color: '#5B8FF9',
          style: {
            fill: '#9EC9FF',
            lineWidth: 3,
          },
          labelCfg: {
            style: {
              fill: 'black',
              fontSize: 20,
            },
          },
        },
        defaultEdge: {
          type: 'dice-er-edge',
          style: {
            stroke: '#e2e2e2',
            lineWidth: 4,
            endArrow: true,
          },
        },
        modes: {
          default: ['dice-er-scroll', 'drag-node', 'drag-canvas','zoom-canvas'],//
        },
        layout: {
          type: 'dagre',
          begin:[10,10],
          rankdir: 'LR',
          align: 'UL',
          controlPoints: true,
          sortByCombo:true,
          nodesepFunc: () => 0.2,
          ranksepFunc: () => 0.5,
        },
        animate: true,
        fitView: false,
        minZoom:0.3,
      })

      graph.data(dataTransform(list||rawData));

      graph.render();

    },
    getSchemas(list){
      let schemas=[];
      function gs(list2){
        for(let i=0,len=list2.length;i<len;i++){
          let item=list2[i];
          if(item.schemas){
            schemas=schemas.concat(item.schemas)
          }
          if(item.databases&&item.databases.length>0){
            gs(item.databases);
          }
        }
      }
      gs(list);
      return schemas;
    },
    setRelation(id,list){
      let ls=[];
      list.forEach((item)=>{
        if(item.sources&&item.sources.length>0){
          item.sources.forEach((vtem)=>{
            if(vtem.id==id){
              item.target.key=item.target.id;
              item.target.nodeId=item.target.parentId;
              ls=ls.concat(item.target);
            }
          })
        }
      });
      return ls;
    },
    handleData(datas){
      let list=this.getSchemas(datas.dbobjs.servers);
      let resultList=[];
      list.forEach((item)=>{
        if(item.others&&item.others.length>0){
          item.others.forEach((o)=>{
            o.size=[250,item.others.length*20+46];
            o.label=o.name;
            o.columns.forEach((c)=>{
              c.key=c.id;
              // c.type=c.name;
              c.iss=false;
              c.relation=this.setRelation(c.id,datas.relationships);
            })

            o.key=o.id;
            o.showType=JSON.parse(JSON.stringify(o.type));
            delete o.type;
            o.attrs=o.columns;
          });
          resultList=resultList.concat(item.others);
        }
        if(item.tables&&item.tables.length>0){
          item.tables.forEach((t)=>{
            t.size=[250,item.tables.length*20+46];
            t.label=JSON.parse(JSON.stringify(item.name))+"."+t.name;
            t.columns.forEach((tc)=>{
              tc.key=tc.id;
              // tc.type=tc.name;
              tc.iss=false;
              tc.relation=this.setRelation(tc.id,datas.relationships);
            })
            t.attrs=t.columns;
            t.showType=JSON.parse(JSON.stringify(t.type));
            t.key=t.id;

            delete t.type;
          });
          resultList=resultList.concat(item.tables)
        }
      })
      // console.log(resultList);
      this.init(resultList);
    }
  },
  mounted() {
    getDataConsanguinity().then((resp)=>{
      console.log(resp)
      this.handleData(JSON.parse(resp.data));
    })

  }
}
</script>

<style scoped>
.data-consanguinity{
  border: 1px solid #999;
  width: 100%;
  height: 900px;
}
</style>