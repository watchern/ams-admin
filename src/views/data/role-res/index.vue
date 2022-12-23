<template>
  <div class="page-container" style="overflow: auto">
    <div slot="footer" style="height: 50px">
      <div style="float: right">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </div>
    </div>
    <!-- :gutter="5" -->
    <el-row style="display: flex; height: 90%" :gutter="20">
      <!-- :span="6" -->
      <!-- @原始数据@ -->

      <el-col :span="6">
        <el-input v-model="filterText1" placeholder="输入关键字进行过滤" />
        <div class="tree-container">
          <MyElTree
            ref="treeTable"
            v-loading="tree1Loading"
            :props="props"
            class="filter-tree"
            :default-expanded-keys="['ROOT']"
            :highlight-current="true"
            :data="treeData1"
            :check-strictly="true"
            node-key="id"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            :default-checked-keys="checkedNode"
            show-checkbox
            @check="setCheckedNodes"
          >
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <i
                v-if="data.id === 'root'"
                class="el-icon-s-home"
                style="color: #409eff"
              />
              <!-- class="el-icon-folder" style="color:#409EFF" / -->
              <i v-else-if="data.type === 'folder'">
                <img
                  src="../../../assets/img/table_0.png"
                  style="
                    height: 16px;
                    width: 16px;
                    margin-right: 2px;
                    vertical-align: top;
                    *vertical-align: middle;
                  "
                />
              </i>
              <!-- class="el-icon-tickets" style="color:#409EFF" / -->
              <i v-else-if="data.type === 'table'">
                <img
                  src="../../../assets/img/table_1.png"
                  style="
                    height: 16px;
                    width: 16px;
                    margin-right: 2px;
                    vertical-align: top;
                    *vertical-align: middle;
                  "
                />
              </i>
              <!-- style="color:#409EFF" -->
              <i
                v-else-if="data.type === 'column'"
                class="el-icon-c-scale-to-original"
              />
              <i v-else-if="data.extMap.tblType == 'V'">
                <img
                  src="../../../assets/img/table_2.png"
                  style="
                    height: 16px;
                    width: 16px;
                    margin-right: 2px;
                    vertical-align: top;
                    *vertical-align: middle;
                  "
                />
              </i>
              <i v-else>
                <img
                  src="../../../assets/img/table_2.png"
                  style="
                    height: 16px;
                    width: 16px;
                    margin-right: 2px;
                    vertical-align: top;
                    *vertical-align: middle;
                  "
                />
              </i>
              <span class="tree-label tree-label-width" :title="node.label"
                >{{ node.label
                }}<i
                  v-if="data.showReverseBtn"
                  class="fa fa-minus-square"
                  title="反向选中"
                  style="margin-left: 15px; color: #559ed4"
                  @click="reverseCheck(data)"
                ></i
              ></span>
            </span>
          </MyElTree>
        </div>
      </el-col>

      <el-col
        :span="1"
        style="display: flex; align-items: center; justify-content: center"
      >
        <div class="transfer-center">
          <p class="transfer-center-item">
            <el-button
              type="primary"
              icon="el-icon-arrow-right"
              circle
              @click="addRoleCheck"
            />
          </p>
        </div>
      </el-col>
      <!-- :span="6" -->
      <!-- @角色数据@ -->
      <el-col :span="6">
        <el-input v-model="filterText2" placeholder="输入关键字进行过滤" />
        <div class="tree-container">
          <MyElTree
            ref="treeRole"
            :props="props"
            v-loading="tree2Loading"
            :default-expand-all="true"
            :render-after-expand="false"
            class="filter-tree"
            :highlight-current="true"
            :data="treeData2"
            node-key="id"
            :default-expanded-keys="['ROOT']"
            :expand-on-click-node="false"
          >
            <span
              slot-scope="{ node, data }"
              class="custom-tree-node"
              style="width: 100%"
            >
              <!-- style="color:#409EFF"  -->
              <i v-if="data.id === 'ROOT'" class="el-icon-s-home" />
              <!-- class="el-icon-folder" style="color:#409EFF" / -->
              <i v-else-if="data.type === 'folder'">
                <img
                  src="../../../assets/img/table_0.png"
                  style="
                    height: 16px;
                    width: 16px;
                    margin-right: 2px;
                    vertical-align: top;
                    *vertical-align: middle;
                  "
                />
              </i>
              <!-- class="el-icon-tickets" style="color:#409EFF" / -->
              <i v-else-if="data.type === 'table'">
                <img
                  src="../../../assets/img/table_1.png"
                  style="
                    height: 16px;
                    width: 16px;
                    margin-right: 2px;
                    vertical-align: top;
                    *vertical-align: middle;
                  "
                />
              </i>
              <!-- style="color:#409EFF" -->
              <i
                v-else-if="data.type === 'column'"
                class="el-icon-c-scale-to-original"
              />
              <i v-else-if="data.type === 'view'">
                <img
                  src="../../../assets/img/table_2.png"
                  style="
                    height: 16px;
                    width: 16px;
                    margin-right: 2px;
                    vertical-align: top;
                    *vertical-align: middle;
                  "
                />
              </i>
              <i v-else>
                <img
                  src="../../../assets/img/table_2.png"
                  style="
                    height: 16px;
                    width: 16px;
                    margin-right: 2px;
                    vertical-align: top;
                    *vertical-align: middle;
                  "
                />
              </i>
              <span
                class="tree-label"
                :title="node.label"
                @click="onclick2(node)"
                >{{ node.label }}</span
              >
              <span v-if="data.id !== 'ROOT'" style="padding-left: 10px">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-remove"
                  v-if="data.checkedType !== 'children'"
                  @click="() => remove(node, data)"
                />
                <transition name="fade">
                  <el-checkbox-group
                    v-if="data.isShowCheck"
                    v-model="data.accessType"
                    style="display: inline; float: right; margin-left: 10px"
                    @change="(val) => handleCheckChange(val, data)"
                  >
                    <!--label="WRITE" 写入 -->
                    <el-checkbox label="WRITE">{{ "" }}</el-checkbox>
                  </el-checkbox-group>
                </transition>
              </span>
              <span v-if="data.id === 'ROOT'" class="xieru">写入</span>
            </span>
          </MyElTree>
        </div>
      </el-col>
      <!-- :span="8" -->
      <el-col :span="11">
        <!--<template >
          <span>{{ currentData.label }}</span>
          <div v-if="currentData.type==='table'">
            <el-table
              key="colMetaUuid"
              v-loading="listLoading"
              :data="currentData.cols"
              border
              fit
              highlight-current-row
              style="width: 100%;"
            >
              <el-table-column width="55">
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.selected" />
                </template>
              </el-table-column>
              <el-table-column label="列名" width="200px" align="center" prop="colName" />
              <el-table-column label="别名" width="200px" align="center" prop="chnName" />
              <el-table-column label="加密策略" width="150px" align="center" prop="encryptType" />
            </el-table>
            <div>
              <el-input
                v-model="currentData.whereStr"
                type="textarea"
                :rows="2"
                placeholder="请输入筛选语句，如： name='张三' and age=19 "
              />
            </div>
          </div>
          <div>
            <div>访问类型</div>
            <el-checkbox-group v-model="currentData.accessType">
              <el-checkbox v-for="(acc, i) in accessTypeArray" :key="acc.code" :label="acc.code">{{acc.name}}</el-checkbox>
            </el-checkbox-group>
          </div>
        </template>-->
        <el-form v-if="currentData !== null" ref="rightForm" label-width="80px">
          <el-form-item label="资源名称" label-width="100px">
            <el-input v-model="currentData.label" :disabled="true" />
          </el-form-item>
          <!-- <el-form-item label="访问类型设置" label-width="100px">
            <el-checkbox-group v-model="currentData.accessType">
              <el-checkbox v-for="(acc, i) in accessTypeArray" :key="acc.code" :label="acc.code">{{ acc.name }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item> -->
          <el-form-item
            v-if="currentData.type === 'table'"
            label="表行列筛选设置"
            label-width="100px"
          >
            <el-table
              key="colMetaUuid"
              v-loading="listLoading"
              :data="currentData.cols"
              border
              fit
              highlight-current-row
              style="width: 100%"
              max-height="300"
            >
              <el-table-column width="55">
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.selected" />
                </template>
              </el-table-column>
              <el-table-column
                label="列名"
                min-width="200px"
                align="center"
                prop="colName"
              />
              <el-table-column
                label="别名"
                width="200px"
                align="center"
                prop="chnName"
              />
              <el-table-column
                label="是否脱敏"
                width="100px"
                align="center"
                prop="chnName"
              />
              <!--                prop="encryptType"-->
              <!--              <el-table-column
                label="脱敏方式"
                width="150px"
                align="center"
              >
               <template slot-scope="scope">
                 <el-select  v-model="scope.row.roleCol.encryptType" placeholder="选择脱敏方式" value="NONE">
                   <el-option
                           v-for="item in options"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value">
                   </el-option>
                 </el-select>
              </template>
              </el-table-column>-->
            </el-table>
            <div style="margin: 8px">
              <el-input
                v-model="currentData.whereStr"
                type="textarea"
                :rows="2"
                placeholder="请输入筛选语句，如： name='张三' and age=19 "
              />
            </div>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import MyElTree from "@/components/public/tree/src/tree.vue";
import {
  getResELTree,
  getResByRole,
  getRoleCols,
  saveRoleTable,
  getAccessType,
} from "@/api/data/table-info";
import { commonNotify } from "@/utils";
import _ from "lodash";

export default {
  components: { MyElTree },
  data() {
    return {
      roleUuid: this.$route.params.roleUuid,
      filterText1: null,
      filterText2: null,
      tree1Loading: false,
      tree2Loading: false,
      listLoading: false,
      props: {
        label: "label",
        isLeaf: "leaf",
      },
      treeData1: [],
      treeData2: [
        {
          id: "ROOT",
          label: "角色数据",
          children: [],
          isShowCheck: true, // 设置是否显示右侧多选框默认值
        },
      ],
      oldRoleData: [], // 原始数据
      options: [
        { label: "未加密", value: "NONE" },
        { label: "中间加密", value: "MIDDLE" },
        { label: "两边加密", value: "SIDE" },
      ],
      currentData: null, // 当前选中的数据表
      currentSelection: [],
      accessTypeArray: [],
      selectList: [],
      checkedNode: [],
      writeNode: [], // 拥有写权限的数据
    };
  },
  computed: {},
  watch: {
    filterText1(val) {
      this.$refs.treeTable.filter(val);
    },
    filterText2(val) {
      this.$refs.treeRole.filter(val);
    },
  },
  created() {
    this.tree1Loading = true;
    this.tree2Loading = true;
    // getResELTree({ dataUserId: "master", sceneCode: "" }).then((resp) => {
    //   this.treeData1 = resp.data;
    //   this.tree1Loading = false;
    // });
    // getResByRole(this.$route.params.roleUuid).then((resp) => {
    //   resp.data.forEach((item) => {
    //     this.treeData2[0].children.push(item);
    //   });
    //   // 设置主树的checkBox
    //   this.tree1Checked(resp.data);
    // });
    getResByRole(this.$route.params.roleUuid).then((resp) => {
      let treeData2 = resp.data;
      this.oldRoleData = resp.data;
      // 设置主树的checkBox
      this.tree1Checked(treeData2);
      getResELTree({ dataUserId: "master", sceneCode: "auditor" }).then(
        (resp) => {
          this.treeData1 = resp.data;
          this.tree1Loading = false;
          let _this = this;
          setTimeout(function () {
            // 给右侧勾选的父节点下的子节点隐藏勾选框
            _this.checkedNode.map((i) => {
              console.log(
                _this.deepGetChildren(
                  _this.$refs.treeTable.getNode(i).data,
                  "111"
                )
              );
              _this.deepGetChildren(
                _this.$refs.treeTable.getNode(i).data,
                false
              );
            });
            // 给右侧树赋权
            _this.findWriteTree(_this.oldRoleData);
            setTimeout(function () {
              _this.addRoleCheck();
            }, 100);
            _this.tree2Loading = false;
          }, 100);
        }
      );
    });
    getAccessType().then((resp) => {
      this.accessTypeArray = resp.data;
    });
  },
  methods: {
    // 找到所有有写权限的节点
    findWriteTree(nodes) {
      nodes.map((i) => {
        if (i.accessType && i.accessType.includes("WRITE")) {
          this.writeNode.push(i);
        }
        if (i.children && i.children.length > 0) {
          this.findWriteTree(i.children, this.writeNode);
        }
      });
    },
    // 权限勾选情况
    initSetCheckStatus(nodes, treeData2) {
      treeData2.map((i) => {
        if (treeData2.id == "ROOT") {
          this.initSetCheckStatus(nodes, i.children);
        } else {
          // 拥有写的权限
          const hasNode = _.findIndex(
            nodes,
            (v) => v.id === i.id,
            (v) => v.label === i.label
          );
          if (hasNode > -1) {
            i.accessType = nodes[hasNode].accessType;
            this.handleCheckChange(i.accessType, i);
          }
          if (i.children && i.children.length > 0) {
            this.initSetCheckStatus(nodes, i.children);
          }
        }
      });
    },
    // 获取选中值得所有子集，并且设置isShowCheck值，控制右侧多选框动态显隐
    deepGetchildren(treeData2, data, isShowCheck) {
      let _this = this;
      const traverse = function (treeData2, data) {
        treeData2.map((i) => {
          if (i.id == data.id) {
            const targetFun = function (i, isShowCheck) {
              if (i.children) {
                i.children.map((j) => {
                  j.isShowCheck = isShowCheck;
                  if (j.type == "view") {
                    j.isShowCheck = false;
                  }
                  // 复选框隐藏后设为不勾选状态
                  if (!isShowCheck) {
                    let accessType = j.accessType.filter((item) => {
                      return item != "WRITE";
                    });
                    j.accessType = accessType;
                    const hasNode = _.findIndex(
                      _this.writeNode,
                      (v) => v.id === j.id,
                      (v) => v.label === j.label
                    );
                    if (hasNode > -1) {
                      _this.writeNode.splice(hasNode, 1);
                    }
                  }
                  targetFun(j, isShowCheck);
                });
              } else {
                return;
              }
            };
            targetFun(i, isShowCheck);
            i = targetFun(i, isShowCheck);
          } else {
            traverse(i.children, data);
          }
        });
      };
      traverse(treeData2, data);
    },
    handleCheckChange(value, data) {
      if (value.includes("WRITE")) {
        // 选中的状态 子集隐藏选择框 并且取消勾选
        const hasNode = _.findIndex(
          this.writeNode,
          (v) => v.id === data.id,
          (v) => v.label === data.label
        );
        if (hasNode < 0) {
          this.writeNode.push(data);
        }
        this.deepGetchildren(this.treeData2, data, false);
      } else {
        // 未选中的状态 子集不隐藏选择框
        const hasNode = _.findIndex(
          this.writeNode,
          (v) => v.id === data.id,
          (v) => v.label === data.label
        );
        if (hasNode > -1) {
          this.writeNode.splice(hasNode, 1);
        }
        this.deepGetchildren(this.treeData2, data, true);
      }
      this.$forceUpdate();
    },
    // 将已经被授权的节点在主树中勾上checkBox
    tree1Checked(datas) {
      for (var i in datas) {
        if (
          (datas[i].type === "table" || datas[i].type === "view") &&
          datas[i].accessType.includes("SHOW")
        ) {
          this.checkedNode.push(datas[i].id);
        }
        if (datas[i].children) {
          this.tree1Checked(datas[i].children);
          if (
            datas[i].accessType.includes("READ") &&
            datas[i].accessType.includes("SHOW")
          ) {
            this.checkedNode.push(datas[i].id);
          }
        }
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    changeTreeNodeStatus(val, flag) {
      const node = val;
      node.expanded = flag;
      for (let i = 0; i < node.childNodes.length; i++) {
        node.childNodes[i].expanded = flag;
        if (node.childNodes[i].childNodes.length > 0) {
          this.changeTreeNodeStatus(node.childNodes[i], flag);
        }
      }
    },
    // 获取选中节点的子节点
    getCheckNodesChildrenNodes(leftCheckNode, rightTreeNode, type) {
      for (var i = 0; i < leftCheckNode.length; i++) {
        leftCheckNode[i].checkedType = type;
        rightTreeNode.push(leftCheckNode[i]);
        if (leftCheckNode[i].children) {
          this.getCheckNodesChildrenNodes(
            leftCheckNode[i].children,
            rightTreeNode,
            "children"
          );
        }
      }
    },
    // 获取选中节点的父节点
    getCheckNodesParentNodes(leftCheckNode, checkedParentNodes, type) {
      for (var i = 0; i < leftCheckNode.length; i++) {
        // 查找当前节点的父节点
        const parent = this.$refs.treeTable.getNode(leftCheckNode[i]).parent;
        if (parent) {
          parent.data.checkedType = type;
          checkedParentNodes.push(parent.data);
          // 'ROOT'为跟节点不需要再找上级
          if (parent.data.pid != "ROOT") {
            const parentAarr = [];
            parentAarr.push(parent);
            this.getCheckNodesParentNodes(
              parentAarr,
              checkedParentNodes,
              "parent"
            );
          }
        }
      }
    },
    // 获取数据并赋权
    addRoleCheck() {
      this.addRoleTable();
      let _this = this;
      setTimeout(function () {
        _this.initSetCheckStatus(_this.writeNode, _this.treeData2);
      }, 100);
    },
    clearWriteNode() {
      let leftCheckNode = this.$refs.treeTable.getCheckedNodes(false, false);
      this.writeNode.map((i, k) => {
        const hasNode = _.findIndex(
          leftCheckNode,
          (v) => v.id === i.id,
          (v) => v.label === i.label
        );
        if (hasNode < 0 && i.accessType.includes("SHOW")) {
          this.writeNode.splice(k, 1);
        }
      });
    },
    addRoleTable() {
      this.clearWriteNode();
      this.treeData2 = [
        {
          id: "ROOT",
          label: "角色数据",
          children: [],
          isShowCheck: true, // 设置是否显示右侧多选框默认值
        },
      ];
      // 获取左侧选中节点
      let leftCheckNode = this.$refs.treeTable.getCheckedNodes(false, false);
      this.changeTreeNodeStatus(this.$refs.treeRole.getAllNodes()[0], true);
      let _this = this;
      setTimeout(function () {
        /* 先对选中节点以pid为key做hashmap */
        // var ckTbs = _this.$refs.treeTable.getCheckedNodes(false, true);
        var ckTbs = [];
        // 获取父节点
        _this.getCheckNodesParentNodes(leftCheckNode, ckTbs, "parent");
        // 获取子节点
        _this.getCheckNodesChildrenNodes(leftCheckNode, ckTbs, "checked");
        if (ckTbs.length == 0) {
          ckTbs.push(_this.$refs.treeTable.getCurrentNode());
        }
        var ckTbsMap = {};
        ckTbs.forEach((item) => {
          //默认即可读取
          item.accessType = ["READ"];
          if (item.checkedType == "parent") {
            item.accessType = ["SHOW"];
          }
          if (item.checkedType == "checked") {
            item.accessType = ["SHOW", "READ"];
          }
          const hasNode = _.findIndex(
            leftCheckNode,
            (v) => v.id === item.id,
            (v) => v.path === item.path
          );
          item.isShowCheck = hasNode > -1; // 左侧选中可以给写入单选框
          if (item.checkedType == "children") item.isShowCheck = true;
          var assItem = Object.assign({}, item);
          assItem.children = [];
          if (!ckTbsMap[item.pid]) ckTbsMap[item.pid] = [];
          ckTbsMap[item.pid].push(assItem);
        });
        /* 遍历selected data 然后将节点插入*/
        _this.goThroughTree(_this.treeData2[0], (treeNode) => {
          var children = ckTbsMap[treeNode.id];
          var myChildren = treeNode.children;
          if (children) {
            if (!myChildren) _this.$set(treeNode, "children", []);
            // 找孩子 并且现在没有这个孩子
            children.forEach((c) => {
              if (
                treeNode.children.filter((node) => {
                  return node.id === c.id;
                }).length === 0
              ) {
                // 从左侧树添加到右侧树view修改类型
                if (c.extMap.tblType == "V") {
                  c.isShowCheck = false;
                  c.type = "view";
                }
                treeNode.children.push(c);
              }
            });
          }
        });
      }, 100);
    },
    goThroughTree(treeNode, callback) {
      callback(treeNode);
      var children = treeNode.children;
      if (!children) return true;
      for (var i = 0; i < children.length; i++) {
        this.goThroughTree(children[i], callback);
      }
    },

    removeTable() {},
    remove(node, data) {
      const parent = node.parent;
      const children = parent.data.children || parent.data;
      const index = children.findIndex((d) => d.id === data.id);
      children.splice(index, 1);
      // 取消主树的checkBox
      // this.$refs.treeTable.setChecked(data,false,true)
      this.removeChild(data);
      // 若父节点没有任何其它子节点则删除父节点
      this.removeParent(data, "check");
      // 右侧删除节点时把左侧勾选状态取消
      this.deepGetChildren(this.$refs.treeTable.getNode(node.data).data, true);
    },
    // 取消选中子节点
    removeChild(data) {
      // 拥有写的权限
      const hasNode = _.findIndex(this.writeNode, (v) => v.id === data.id);
      if (hasNode > -1) {
        this.writeNode.splice(hasNode, 1);
      }
      this.$refs.treeTable.setChecked(data, false, true);
      if (data.children) {
        for (var i = 0; i < data.children.length; i++) {
          this.removeChild(data.children[i]);
        }
      }
    },
    // 取消选中父节点
    removeParent(data, type, parentArr) {
      // 拥有写的权限
      const hasNode = _.findIndex(this.writeNode, (v) => v.id === data.id);
      if (hasNode > -1) {
        this.writeNode.splice(hasNode, 1);
      }
      this.$refs.treeTable.setChecked(data, false, true);
      const parent = this.$refs.treeRole.getNode(data).parent;
      if (parent) {
        if (
          (type == "check" && data.pid !== "ROOT") ||
          (type == "parent" && data.data.pid !== "ROOT")
        ) {
          // 有且只有当前这一个要删除的节点,'check'情况节点已移除，所以子节点个数为0
          if (
            (parent.data.children.length == 1 && type == "parent") ||
            (parent.data.children.length == 0 && type == "check")
          ) {
            this.removeParent(parent, "parent");
            this.$refs.treeRole.remove(parent);
          }
        }
      }
    },
    //所有子集禁用
    witerData(node, data) {
      if (data.children.length > 0) {
        if (data.accessType.length === 2) {
          this.dealDisableWiter(data, false);
        } else {
          this.dealDisableWiter(data, true);
        }
      }
    },
    dealDisableWiter(data) {
      console.log(data);
    },
    /* 点击角色数据 展示列和wherestr */
    onclick2(node, data) {
      if (node.data.type === "table") {
        if (node.data.cols) {
          this.currentData = node.data;
          if (!this.currentData.accessType)
            this.$set(this.currentData, "accessType", []);
        } else {
          this.listLoading = true;
          getRoleCols(this.roleUuid, node.data.id).then((resp) => {
            this.listLoading = false;
            node.data.cols = resp.data;
            this.currentData = node.data;
            // if(!this.currentData.extMap) this.$set(this.currentData, 'extMap', null);
            this.currentData.cols.forEach((d) => {
              if (d.roleCol === null) {
                d.roleCol = { encryptType: "NONE" };
              } else {
                this.$set(d, "selected", d.roleCol !== null);
              }
            });
            if (!this.currentData.accessType)
              this.$set(this.currentData, "accessType", []);
          });
        }
      } else if (node.data.type === "folder") {
        this.currentData = node.data;
        if (!this.currentData.accessType)
          this.$set(this.currentData, "accessType", []);
      }
    },

    /* changeAccess(a, b){
      var i = parseInt(b.target.name.substr(1));
      this.currentData.extMap.accessType[i] = a;
    },*/

    save() {
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      var allNodes = this.$refs.treeRole.getAllNodes();
      var folders = [];
      var tables = [];
      var cols = [];
      allNodes.forEach((node) => {
        var data = node.data;
        if (data.id !== "ROOT") {
          if (!data.accessType) data.accessType = [];
          var accType1 = data.accessType.join(",");
          if (
            data.type === "folder" &&
            (data.checkedType !== "children" ||
              data.accessType.includes("WRITE"))
          ) {
            folders.push({
              dataRoleUuid: this.roleUuid,
              folderUuid: data.id,
              accessType: accType1,
            });
          } else if (
            (data.type === "table" &&
              (data.checkedType == "checked" ||
                data.accessType.includes("WRITE"))) ||
            (data.type === "view" && data.checkedType == "checked")
          ) {
            tables.push({
              dataRoleUuid: this.roleUuid,
              tableMetaUuid: data.id,
              accessType: accType1,
              whereStr: data.whereStr,
            });
            if (data.cols) {
              data.cols.forEach((col) => {
                if (col.selected) {
                  cols.push({
                    colMetaUuid: col.colMetaUuid,
                    dataRoleUuid: this.roleUuid,
                    encryptType: col.roleCol.encryptType,
                  });
                }
              });
            }
          }
        }
      });
      saveRoleTable(this.roleUuid, folders, tables, cols).then(() => {
        loading.close();
        this.$notify(commonNotify({ type: "success", message: "保存成功！" }));
      });
    },
    goBack() {
      this.$router.go(-1);
    },
    // 递归获取子节点并设置属性
    deepGetChildren(node, flag) {
      node.children.map((i) => {
        // 判断隐藏勾选框的时候所有子集取消选中
        this.$refs.treeTable.setChecked(i, false);
        this.$set(i, "showCheckbox", flag);
        if (i.children) {
          this.deepGetChildren(i, flag);
        }
      });
    },
    deepSetUncheck(node, flag) {
      node.children.map((i) => {
        this.$refs.treeTable.setChecked(i, false);
        if (i.children) {
          this.deepSetUncheck(i, flag);
        }
      });
    },
    findAncestry(arr, id) {
      var temp = [];
      var forFn = function (list, id) {
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          if (item.id === id) {
            temp.unshift(item.id);
            forFn(arr, item.parentId);
            break;
          } else {
            if (item.children) {
              forFn(item.children, id);
            }
          }
        }
      };
      forFn(arr, id);
      temp.unshift("0");
      return temp;
    },
    // 递归获取对应的父节点根据本节点id
    deepGetParentById(list, pid) {
      let pData = {};
      let that = this;
      var forFn = function (list, pid) {
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          if (item.id === pid) {
            pData = item;
            // item.showReverseBtn = true
            that.$set(item, "showReverseBtn", true);
            forFn(list, item.pid);
            break;
          } else {
            if (item.children) {
              forFn(item.children, pid);
            }
          }
        }
      };
      forFn(list, pid);
      return pData;
    },
    // 左侧树节点选中事件
    setCheckedNodes(node, isChecked) {
      if (isChecked.checkedKeys.includes(node.id)) {
        // 选中状态
        // 如果此节点勾选的话找到对应的父节点设置显示反选按钮
        // 此节点点击时对应的父节点展示反选按钮
        this.deepGetParentById(this.treeData1, node.pid);
        // 所有子节点隐藏勾选框
        if (node.children) {
          this.deepGetChildren(node, false);
          // 父元素勾选时隐藏反选按钮
          this.$set(node, "showReverseBtn", false);
        }
      } else {
        // 没选中状态
        // 所有子节点显示勾选框
        if (node.children) {
          this.deepGetChildren(node, true);
        }
      }
    },
    // 反向选中
    reverseCheck(data) {
      // 当前选中的节点
      let currentCheckedNodes = this.$refs.treeTable.getCheckedNodes();
      // 当前层级选中的id
      let currentCheckedId = [];
      if (data.children && data.children.length > 0) {
        data.children.map((i) => {
          currentCheckedNodes.map((j) => {
            if (i.id == j.id) {
              currentCheckedId.push(i.id);
              // 当前层级已选中的话取消勾选
              this.$refs.treeTable.setChecked(i, false);
            }
          });
          // 当前层级未选中的话执行勾选
          if (currentCheckedId.indexOf(i.id) == -1) {
            this.$refs.treeTable.setChecked(i, true);
            if (i.children.length > 0) {
              // 如果节点勾选有子集的话把子集的复选框隐藏
              this.deepGetChildren(i, false);
            }
          }
          // 如果节点未勾选有子集的话把子集的复选框展示
          if (i.children.length > 0 && currentCheckedId.indexOf(i.id) > -1) {
            this.deepGetChildren(i, true);
          }
        });
      }
    },
  }, // 注册
};
</script>

<style lang="scss" scoped>
.dialog-bottom-btns {
}
.bottom-btn {
  float: right;
  padding-right: 100px;
}
</style>

<style lang="scss">
.page-container .tree-container {
  height: 95%;
  overflow: auto;
}
.page-container .tree-container .filter-tree {
  margin-top: 12px;
}
.transfer-center-item {
  width: 40px;
  margin: 2px;
  height: 40vh;
}
.xieru {
  position: absolute;
  right: 10px;
}
.databg {
  background-color: #6a6a6a16;
}
.tree-label {
  display: inline-block;
  // width: 65%;
  width: calc(100% - 80px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tree-label-width {
  width: 250px;
}
.custom-tree-node {
  display: flex;
  align-items: center;
}
</style>
