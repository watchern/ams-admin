<template>
  <div class="page-container" style="overflow: auto">
    <div slot="footer" style="height:50px;display:inline-block;float:right;">
      <div>
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </div>
    </div>
    
    <el-row style="display: flex; height: 100%" :gutter="20">
      <!-- @原始数据表树@ -->
      <el-col :span="6">
        <LeftTrees ref="tree_left"
          @switchTabAccredit="switchTabAccredit" 
          @switchDataSourceAccredit="switchDataSourceAccredit"
          @addRoleCheck="addRoleCheck"
        ></LeftTrees>
      </el-col> 

      <!-- @>符号@ -->
      <el-col :span="1" style="display: flex; align-items: center; justify-content: center">
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

      <!-- @选中的表数据@ -->
      <el-col :span="6">
        <CentreTree ref="tree_centre" 
          @nodeClick="onclick2" 
          @unLeftTreeSelected="unLeftTreeSelected"
          @switchTabAccreditLeft="switchTabAccreditLeft" 
          @switchDataSourceAccreditLeft="switchDataSourceAccreditLeft" 
        ></CentreTree>
      </el-col> 

      <!-- @表及表字段选择@ -->
      <el-col :span="11">
       
        <el-form v-if="currentData !== null" ref="rightForm" label-width="80px">
          <el-form-item label="资源名称" >
            <el-input v-model="currentData.label" :disabled="true" />
          </el-form-item>
         
          <el-form-item
            v-if="currentData.type === 'table'"
            label="表行列筛选设置"
            label-width="100px"
          >
            <el-button @click="selectedAllTable">全选</el-button>
            <el-button @click="selectedNoAllTable">取消全选</el-button>
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
                show-overflow-tooltip
              />
              <el-table-column
                label="别名"
                min-width="200px"
                align="center"
                prop="chnName"
                show-overflow-tooltip
              />
              <!-- <el-table-column
                label="是否脱敏"
                min-width="100px"
                align="center"
                prop="chnName"
              /> -->
            </el-table>
            <div style="margin: 8px;display: flex;align-items: center">
              <el-input
                v-model="whereStr"
                type="textarea"
                :rows="2"
                v-on:input="whereStrFun"
                placeholder="请输入筛选语句，如： name='张三' and age=19 "
              />
                <el-button style="height: 40px;margin-left: 20px" type="primary" @click="showSelect = true">选择条件</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
      <!--选择查询条件-->
      <el-dialog
          title="选择条件"
          :visible.sync="showSelect"
          v-if="showSelect"
          width="80%"
      >
          <div>
              <myQueryBuilder
                  v-if="showSelect"
                  ref="myquerybuilder"
                  :columns="queryData"
                  :data="queryJson"
              />
          </div>
          <span slot="footer">
        <el-button
            size="mini"
            type="info"
            class="table_header_btn"
            @click="showSelect = false"
        >关闭</el-button>
        <el-button
            size="mini"
            type="primary"
            @click="changeWhereStr"
              >保存</el-button>
      </span>
      </el-dialog>
  </div>
</template>
<script>
import LeftTrees from "@/components/loginTree/leftTree.vue";
import CentreTree from "@/views/data/role-res/centreTree.vue";
import {
  getResELTree,
  getResByRole2,
  getRoleCols,
  saveRoleTable,
  saveRoleTable2,
  getAccessType,
} from "@/api/data/table-info";
import { commonNotify } from "@/utils";
import _ from "lodash";
import myQueryBuilder from "@/views/analysis/auditmodelresult/myquerybuilder";

export default {
  components: { LeftTrees, CentreTree, myQueryBuilder },
  data() {
    return {
      
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
      currentData: {}, // 当前选中的数据表
      currentSelection: [],
      accessTypeArray: [],
      selectList: [],
      checkedNode: [],
      writeNode: [], // 拥有写权限的数据
      //-----ym修改  需要用到的参数
      roleUuid: this.$route.params.roleUuid,//数据授权主键 
      tableCellUUID:"",//选中单元格的主键
      treeNodeSelectedObj:"",//选中的树节点-需要保存的数据
      tableColCheckedMap:{},//临时勾选的表字段，用于反选
      tableWhereStrMap:{},//临时填写的表条件，用于反选
      whereStr:"",//字段条件
      showSelect:false, //显示选择查询条件对话框
      queryData: [], // querybuilder的规则数据
      queryJson: {}, // queryBuilder上动态绑定的json数据
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
    this.tableColCheckedMap = new Map()
    this.tableWhereStrMap = new Map()
  },
  mounted () {
    //初始左侧数据表树 添加复选框
    this.$refs.tree_left.loadLeftTreeTypeFun("2");
    
    //反显数据
    getResByRole2(this.$route.params.roleUuid).then((resp) => {
      //反勾选树节点-左侧树
      this.$refs.tree_left.uncheckTreeNode(resp.data)
      //赋值
      this.treeNodeSelectedObj = resp.data
    });
  },
  methods: {
    //页签切换联动
    switchTabAccredit(index){
      this.$refs.tree_centre.switchTabAccredit(index)
    },
    switchTabAccreditLeft(index){
      this.$refs.tree_left.switchTabAccreditLeft(index)
    },
    //数据源切换
    switchDataSourceAccredit(val){
      this.$refs.tree_centre.switchDataSourceAccredit(val)
    },
    switchDataSourceAccreditLeft(val){
      this.$refs.tree_left.switchDataSourceAccreditLeft(val)
    },
    //取消左侧树节点勾选状态
    unLeftTreeSelected(data){
      this.$refs.tree_left.unLeftTreeSelected(data.id)
      console.log(data)
      this.treeNodeSelectedObj.forEach(function(item,k){
        if(data.strLevel === item.strLevel){
          item.data.forEach(function(t,k){
            if(data.id === t.id){
              item.data.splice(k, 1);
            }
            
          })
        }
      })
    },
    whereStrFun(val){
      //取筛选语句
      var strLevelType = this.currentData.strLevelType
      for(var i=0;i<this.treeNodeSelectedObj.length;i++){
        if(this.treeNodeSelectedObj[i].strLevel === strLevelType){
          for(var k=0;k<this.treeNodeSelectedObj[i].data.length;k++){
            if(this.currentData.id === this.treeNodeSelectedObj[i].data[k].id){
              this.treeNodeSelectedObj[i].data[k].whereStr = val
              break
            }
          }
          break
        }
      }
    },
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
      this.treeNodeSelectedObj = []
      var treeNodeSelectedObj2 = this.$refs.tree_left.treeNodeSelectedObj
      if(treeNodeSelectedObj2.length>0){
        this.treeNodeSelectedObj = JSON.parse(JSON.stringify(this.$refs.tree_left.treeNodeSelectedObj))
      }

      //中间树数据反显
      var leftTreeCheckedNodes = JSON.parse(JSON.stringify(this.$refs.tree_left.getCheckedNodes()))
      this.$refs.tree_centre.loadLeftTreeTypeFun(leftTreeCheckedNodes)
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
    /* 展示表字段 */
    onclick2(node) {
      var _this = this
      if (node.type === "table" || node.type === "view") {
        this.listLoading = true;
        if(this.currentData!=null){
          //取选中的字段集合
          var tableType = this.currentData.strLevelType +'-'+ this.currentData.id
          var cols = this.currentData.cols
          var selectedCols = []
          if(cols!=undefined){
            cols.forEach(function(item,k){
              if(item.selected){
                selectedCols.push(item.colMetaUuid)
              }
            })
          }
          this.tableColCheckedMap.set(tableType,selectedCols)
          this.tableWhereStrMap.set(tableType,this.whereStr)
        }
        getRoleCols(this.roleUuid, node.id, node.strLevelType).then((resp) => {
          this.listLoading = false;
          node.cols = resp.data;
          this.currentData = node;
          this.whereStr = resp.data[0].whereStr
          //先从临时条件获取 存在取临时条件
          var lsWhereStr = _this.tableWhereStrMap.get(node.strLevelType +'-'+ node.id)
          var whereStrKey = node.strLevelType +'-'+ node.id
          _this.tableWhereStrMap.forEach(function(value,key){
            if(whereStrKey===key){
              _this.whereStr = lsWhereStr
            }
          })
          // 将条件选择数据置空
          this.queryData=[];
          this.currentData.cols.forEach((d) => {
              // 初始化条件选择数据
              let obj = {};
              obj.columnType=d.dataType
              obj.columnName= d.colName
              if (obj.columnType.toUpperCase().indexOf("INT") == -1){
                  obj.columnType = "VARCHAR";
              }
              this.queryData.push(obj);
            //先清空勾选信息
            this.$set(d, "selected", false);
            var checkedCols = _this.tableColCheckedMap.get(node.strLevelType +'-'+ node.id)
            if(checkedCols!=undefined && checkedCols.length>0){
              for(var k=0;k<checkedCols.length;k++){
                if(d.colMetaUuid === checkedCols[k]){
                  this.$set(d, "selected", d.colMetaUuid === checkedCols[k]);
                  break
                }
              }
            }else if(d.roleCol != null){
              this.$set(d, "selected", d.roleCol != null);
            }
          });
          // 初始化条件选择数据
          this.queryData.columnList=this.queryData;
          //赋值
          for(var i=0;i<this.treeNodeSelectedObj.length;i++){
            if(this.treeNodeSelectedObj[i].strLevel === node.strLevelType){
              for(var k=0;k<this.treeNodeSelectedObj[i].data.length;k++){
                if(node.id === this.treeNodeSelectedObj[i].data[k].id){
                  this.treeNodeSelectedObj[i].data[k].cols = node.cols
                  break
                }
              }
              break
            }
          }
        }).catch(err=>{
          this.listLoading = false;
          this.$notify(commonNotify({ type: "error", message: "查询失败" }));
        });;
      }
    },
    //全选
    selectedAllTable(){
      this.currentData.cols.forEach((d) => {
        this.$set(d, "selected", true);
      });
    },
    //取消全选
    selectedNoAllTable(){
      this.currentData.cols.forEach((d) => {
        this.$set(d, "selected", false);
      });
    },
    save() {
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      //encryptType: 'NONE',
      console.log(this.treeNodeSelectedObj)
      saveRoleTable2(this.roleUuid, this.treeNodeSelectedObj).then(() => {
        loading.close();
        this.$notify(commonNotify({ type: "success", message: "保存成功！" }));
      }).catch(err=>{
        loading.close();
        this.$notify(commonNotify({ type: "error", message: "保存失败！" }));
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
      //获取条件选择组件数据
    changeWhereStr(){
        const obj = this.$refs.myquerybuilder.getSelectSql();
        this.queryJson = obj.queryJson;
        this.whereStr = obj.sql;
        this.showSelect = false;
        this.whereStrFun(this.whereStr);
    }
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
// 点击后背景颜色和文本颜色
.el-table .warning-row {
  background-color: #e8f7fd !important;
  color: #1890ff;
}
.el-form-item__content {
  margin-left: 0 !important;
}
</style>
