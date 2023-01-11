<template>
  <div class="page-container">
    <el-row :gutter="5">
      <el-col :span="8">
        <el-select
          v-model="currentSceneUuid"
          placeholder="请选择"
          style="display: none"
        >
          <el-option
            v-for="scene in allScene"
            :key="scene.sceneUuid"
            :label="scene.sceneName"
            :value="scene.sceneUuid"
          />
        </el-select>
        <div class="org-box" v-loading="orgLoading">
          <el-tabs
            v-model="grpUuid"
            @tab-click="tabClick"
            ref="eltab"
            v-if="currentScene && currentScene.groups.length > 0"
          >
            <el-tab-pane
              v-for="grp in currentScene.groups"
              :key="grp.sceneGrpUuid"
              :label="grp.grpName"
              :name="grp.sceneGrpUuid"
            >
              <!-- <el-input
              v-model="filterText"
              placeholder="输入关键字进行过滤"
              /> -->
              <div class="orgTree-box">
                <div v-if="orglistLoading" class="orglistLoadingDia"></div>
                <MyElTree
                  :ref="'A' + grp.sceneGrpUuid"
                  v-loading="treeLoading"
                  :props="props"
                  class="filter-tree left-tree"
                  :highlight-current="true"
                  :data="orgTreeData"
                  node-key="id"
                  :filter-node-method="filterNode"
                  show-checkbox
                  :lazy="true"
                  :load="loadNode"
                  @node-expand="handleNodeClick"
                >
                  <span slot-scope="{ node, data }" class="custom-tree-node">
                    <span>{{ node.label }}</span>
                  </span>
                </MyElTree>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>

      <el-col :span="2" style="width: 45px; padding-top: 10%">
        <div class="transfer-center">
          <p class="transfer-center-item">
            <el-button
              type="primary"
              icon="el-icon-arrow-right"
              circle
              @click="addGrp"
              title="选中（或勾选）左侧组织树节点并点击此按钮可以向角色添加用户/用户组"
            />
          </p>
        </div>
      </el-col>

      <el-col :span="15">
        <el-col align="right" style="padding-top: 4px; padding-right: 50px">
          <!--          <el-button type="primary" class="oper-btn edit-period btn-width-max" :disabled="selections.length !== 1" @click="setExpireDate" />-->
          <el-button
            type="primary"
            class="oper-btn delete"
            :disabled="selections.length === 0"
            @click="removeGrp"
          />
        </el-col>
        <el-table
          key="colMetaUuid"
          v-loading="listLoading"
          :data="tableData"
          border
          fit
          highlight-current-row
          style="width: 100%"
          @selection-change="handleSelectionChange"
          max-height="500"
        >
          <el-table-column width="55" type="selection" />
          <el-table-column
            label="类型"
            min-width="150px"
            align="center"
            prop="userType"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.userType == 1 ? "用户组" : "用户" }}
            </template>
          </el-table-column>
          <el-table-column
            label="名称"
            min-width="150px"
            align="center"
            prop="userName"
            show-overflow-tooltip
          />
          <el-table-column label="编码" width="300px" align="center" show-overflow-tooltip>
            <template slot-scope="scope">
              <span v-if="scope.row.userType == 1">{{
                scope.row.grpInstUuid
              }}</span>
              <span v-if="scope.row.userType == 2">{{
                scope.row.unitUuid
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="使用期限" width="300px" align="center" show-overflow-tooltip>
            <template slot-scope="scope">
              <span v-if="role.startTime == null && role.endTime == null"
                >无限制</span
              >
              <span v-else>
                {{ role.startTime == null ? " - " : role.startTime }}
                至
                {{ role.endTime == null ? " - " : role.endTime }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="授权时间"
            width="200px"
            align="center"
            prop="createTime"
            show-overflow-tooltip
          />
          <!--<el-table-column label="操作" width="150px" align="center">
            <template slot-scope="scope">
              <el-button @click="removeGrp(scope)">删除</el-button>
            </template>
          </el-table-column>-->
        </el-table>
      </el-col>
    </el-row>
    <div class="bottom-btn">
      <el-button @click="goBack">返回</el-button>
      <el-button type="primary" @click="saveRoleGrp">保存</el-button>
    </div>
  </div>
</template>

<script>
import MyElTree from "@/components/public/tree/src/tree.vue";
import { getAllScene, initSceneTree, queryOrgTree } from "@/api/data/scene";
import { saveRoleGrp, getRoleGrp, getById } from "@/api/data/role";
import { commonNotify } from "@/utils";

export default {
  components: { MyElTree },
  data() {
    return {
      roleUuid: this.$route.params.roleUuid,
      paramSceneCode: this.$route.params.sceneCode,
      allScene: [],
      // currentScene: {},
      currentSceneUuid: "",
      treeLoading: false,
      grpUuid: "",
      filterText: null,
      treeData: {},
      listLoading: false,
      props: {
        label: "name",
        isLeaf: "leaf",
      },
      userMap: {},
      tableData: [],
      selections: [],
      role: {},
      loadTree: [], //左边树懒加载的数据
      orgTreeData: [],
      orglistLoading: false,
    };
  },
  computed: {
    currentTreeData() {
      return this.treeData["A" + this.grpUuid];
    },
    currentScene() {
      return this.allScene.filter((e) => {
        return e.sceneUuid === this.currentSceneUuid;
      })[0];
    },
    orgLoading() {
      if (this.currentScene && this.currentScene.groups.length) {
        return false;
      } else {
        return true;
      }
    },
  },
  watch: {
    filterText(val) {
      this.$refs["A" + this.grpUuid][0].filter(val);
    },
  },
  created() {
    // 获取树列表
    this.getOrgTree();
    getAllScene().then((resp) => {
      this.allScene = resp.data;
      if (this.allScene.length > 0)
        this.currentSceneUuid = this.allScene[0].sceneUuid;
      // //根据param设置默认scene
      // console.log("设置默认scene  "+this.paramSceneCode);
      if (this.paramSceneCode) {
        this.allScene.forEach((s) => {
          if (this.paramSceneCode === s.sceneCode) {
            this.currentSceneUuid = s.sceneUuid;
          }
        });
      }
    });
    getById(this.roleUuid).then((resp) => {
      this.role = resp.data;
    });
    getRoleGrp(this.roleUuid).then((resp) => {
      this.tableData = resp.data;
    });
  },
  mounted() {
    setTimeout(() => {
      if (this.currentScene && this.currentScene.groups) {
        document
          .getElementById("tab-" + this.currentScene.groups[0].sceneGrpUuid)
          .click();
      }
    }, 1000);
  },
  methods: {
    // 获取机构或人员列表
    getOrgTree() {
      this.treeLoading = true;
      queryOrgTree("").then((res) => {
        this.orgTreeData = res.data;
        this.treeLoading = false;
      });
    },
    loadNode(node, resolve) {
      if (node.level === 0) {
        return resolve(this.orgTreeData);
      }
      if (node.data.children && node.data.children != "") {
        return resolve(node.data.children);
      } else {
        setTimeout(() => {
          resolve(this.loadTree);
        }, 500);
      }
    },
    handleNodeClick(data, obj, node) {
      this.getLoadTree(data, obj, node);
    },
    //展开树形结构进行懒加载的方法 data该节点所对应的对象、obj节点对应的 Node、node节点组件本身
    getLoadTree(datas, obj, node) {
      this.orglistLoading = true;
      queryOrgTree(datas.id).then((res) => {
        this.loadTree = res.data;
        this.orglistLoading = false;
      });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    addGrp() {
      console.log(this.grpUuid);
      var nodes = this.$refs["A" + this.grpUuid][0].getCheckedNodes();
      if (nodes.length === 0) {
        nodes.push(this.$refs["A" + this.grpUuid][0].getCurrentNode());
      }
      nodes.forEach((node) => {
        console.log(node);
        if (
          this.tableData.filter((data) => {
            return data.unitUuid === node.id;
          }).length === 0
        ) {
          this.tableData.push({
            dataRoleUuid: this.roleUuid,
            sceneGrpUuid: this.grpUuid,
            userName: node.name,
            userType: node.type,
            grpInstUuid: node.type == 1 ? node.id : "null",
            unitUuid: node.type == 2 ? node.id : "null",
            valid: 1,
            startTime: null,
            endTime: null,
          });
        }
      });
      console.log(this.tableData);
    },

    saveRoleGrp() {
      this.listLoading = true;
      saveRoleGrp(this.roleUuid, this.tableData).then((resp) => {
        this.listLoading = false;
        this.$notify(commonNotify({ type: "success", message: "保存成功！" }));
      });
    },

    removeGrp() {
      var map = {};
      this.selections.forEach((sel) => {
        map[sel.userType + sel.grpInstUuid + sel.unitUuid] = sel;
      });
      for (var index = 0; index < this.tableData.length; ) {
        var value = this.tableData[index];
        if (map[value.userType + value.grpInstUuid + value.unitUuid]) {
          this.tableData.splice(index, 1);
        } else {
          index++;
        }
      }
    },

    /* setUserMap(roleGrps){
      roleGrps.forEach(sel=>{
        this.userMap[sel.userType+sel.grpInstUuid+sel.unitUuid] = sel;
      });
      return map;
    },
    getByUserMap(grp){
      return this.userMap[grp.userType+grp.grpInstUuid+grp.unitUuid];
    },*/

    setExpireDate() {},

    tabClick(tab, event) {
      // if (!this.currentTreeData) {
      //   var grpUuid = tab.paneName
      //   this.treeLoading = true
      //   initSceneTree(grpUuid).then(resp => {
      //     this.treeLoading = false
      //     console.log(resp)
      //     resp.data.map(i => {
      //       i.children = []
      //     })
      //     this.$set(this.treeData, 'A' + this.grpUuid, resp.data)
      //   })
      // }
    },

    handleSelectionChange(val) {
      console.log(val);
      this.selections = val;
    },

    goBack() {
      this.$router.go(-1);
    },
  }, // 注册
};
</script>

<style lang="scss" scoped>
.org-box {
  width: 100%;
  height: 70vh;
}
.orgTree-box {
  width: 100%;
  height: 100%;
  position: relative;
  .orglistLoadingDia {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 9999;
  }
}
.filter-tree {
  // margin-top: 20px;
}
.transfer-center-item {
  width: 40px;
  margin: 2px;
}
.page-container .left-tree {
  height: 70vh;
  overflow: scroll;
  padding-top: 10px;
}
.bottom-btn {
  float: right;
  padding-right: 100px;
}
</style>
