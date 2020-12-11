<template>
  <div class="page-container">
    <el-row :gutter="5">
      <el-col :span="8">
        <el-select v-model="currentSceneUuid" placeholder="请选择">
          <el-option
            v-for="scene in allScene"
            :key="scene.sceneUuid"
            :label="scene.sceneName"
            :value="scene.sceneUuid"
          />
        </el-select>
        <el-tabs v-model="grpUuid" @tab-click="tabClick">
          <el-tab-pane v-for="grp in currentScene.groups" :key="grp.sceneGrpUuid" :label="grp.grpName" :name="grp.sceneGrpUuid">
            <el-input
              v-model="filterText"
              placeholder="输入关键字进行过滤"
            />
            <MyElTree
              :ref="'A'+grp.sceneGrpUuid"
              v-loading="treeLoading"
              :props="props"
              class="filter-tree left-tree"
              :highlight-current="true"
              :data="currentTreeData"
              node-key="id"
              :filter-node-method="filterNode"
              show-checkbox
            >
              <span slot-scope="{ node, data }" class="custom-tree-node">
                <span>{{ node.label }}</span>
              </span>
            </MyElTree>
          </el-tab-pane>
        </el-tabs>
      </el-col>

      <el-col :span="2" style="width: 45px; padding-top: 10%">
        <div class="transfer-center">
          <p class="transfer-center-item">
            <el-button
              type="primary"
              icon="el-icon-arrow-right"
              circle
              @click="addGrp"
            />
          </p>
        </div>
      </el-col>

      <el-col :span="15">
        <div>已选择的用户组</div>
        <el-button @click="setExpireDate">设置使用期限</el-button>
        <el-button @click="removeGrp">删除</el-button>
        <el-table
          key="colMetaUuid"
          v-loading="listLoading"
          :data="tableData"
          border
          fit
          highlight-current-row
          style="width: 100%;"
          @selection-change="handleSelectionChange"
        >
          <el-table-column width="55" type="selection" />
          <el-table-column label="类型" width="150px" align="center" prop="userType">
            <template slot-scope="scope">
              {{ scope.row.userType == 1 ? '用户组':'用户' }}
            </template>
          </el-table-column>
          <el-table-column label="名称" width="200px" align="center" prop="userName" />
          <el-table-column label="编码" width="200px" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.userType == 1">{{ scope.row.grpInstUuid }}</span>
              <span v-if="scope.row.userType == 2">{{ scope.row.unitUuid }}</span>
            </template>
          </el-table-column>
          <el-table-column label="使用期限" width="200px" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.startTime==null && scope.row.endTime==null">无限制</span>
              <span v-else>
                {{ scope.row.startTime==null?' - ':scope.row.startTime }} 至
                {{ scope.row.endTime==null?' - ':scope.row.endTime }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="授权时间" width="150px" align="center" prop="createTime" />
          <!--<el-table-column label="操作" width="150px" align="center">
            <template slot-scope="scope">
              <el-button @click="removeGrp(scope)">删除</el-button>
            </template>
          </el-table-column>-->
        </el-table>
      </el-col>
    </el-row>
    <div class="bottom-btn">
      <el-button @click="goBack">取消</el-button>
      <el-button type="primary" @click="saveRoleGrp">保存</el-button>
    </div>
  </div>
</template>

<script>
import MyElTree from '@/components/Ace/tree/src/tree.vue'
import { getAllScene, initSceneTree } from '@/api/data/scene'
import { saveRoleGrp, getRoleGrp } from '@/api/data/role'
import { commonNotify } from '@/utils'

export default {
  components: { MyElTree },
  data() {
    return {
      roleUuid: this.$route.params.roleUuid,
      allScene: [],
      // currentScene: {},
      currentSceneUuid: '',
      treeLoading: false,
      grpUuid: '',
      filterText: null,
      treeData: {},
      listLoading: false,
      props: {
        label: 'label',
        isLeaf: 'leaf'
      },
      userMap: {},
      tableData: [],
      selections: []
    }
  },
  computed: {
    currentTreeData() {
      return this.treeData['A' + this.grpUuid]
    },
    currentScene() {
      return this.allScene.filter(e => { return e.sceneUuid === this.currentSceneUuid })[0]
    }
  },
  watch: {
    filterText(val) {
      this.$refs['A' + this.grpUuid].filter(val)
    }
  },
  created() {
    getAllScene().then(resp => {
      this.allScene = resp.data
      if (this.allScene.length > 0) this.currentSceneUuid = this.allScene[0].sceneUuid
    })
    getRoleGrp(this.roleUuid).then(resp => {
      this.tableData = resp.data
    })
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    addGrp() {
      console.log(this.grpUuid)
      var nodes = this.$refs['A' + this.grpUuid][0].getCheckedNodes()
      nodes.forEach(node => {
        console.log(node)
        if (this.tableData.filter(data => {
          return data.userName === node.label
        }).length === 0) {
          this.tableData.push({
            dataRoleUuid: this.roleUuid,
            sceneGrpUuid: this.grpUuid,
            userName: node.label,
            userType: node.type,
            grpInstUuid: node.type == 1 ? node.id : 'null',
            unitUuid: node.type == 2 ? node.id : 'null',
            valid: 1,
            startTime: null,
            endTime: null
          })
        }
      })
      console.log(this.tableData)
    },

    saveRoleGrp() {
      this.listLoading = true
      saveRoleGrp(this.roleUuid, this.tableData).then(resp => {
        this.listLoading = false
        this.$notify(commonNotify({ type: 'success', message: '保存成功！' }))
      })
    },

    removeGrp() {
      var map = {}
      this.selections.forEach(sel => {
        map[sel.userType + sel.grpInstUuid + sel.unitUuid] = sel
      })
      for (var index = 0; index < this.tableData.length;) {
        var value = this.tableData[index]
        if (map[value.userType + value.grpInstUuid + value.unitUuid]) {
          this.tableData.splice(index, 1)
        } else {
          index++
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

    setExpireDate() {

    },

    tabClick(tab, event) {
      if (!this.currentTreeData) {
        var grpUuid = tab.paneName
        this.treeLoading = true
        initSceneTree(grpUuid).then(resp => {
          this.treeLoading = false
          console.log(resp)
          this.$set(this.treeData, 'A' + this.grpUuid, resp.data)
        })
      }
    },

    handleSelectionChange(val) {
      console.log(val)
      this.selections = val
    },

    goBack() {
      this.$router.go(-1)
    }

  } // 注册
}

</script>

<style lang="scss" scoped>
  .filter-tree {
    margin-top: 20px;
  }
  .transfer-center-item{
    width: 40px;
    margin: 2px
  }
  .page-container .left-tree{
    height: 70vh;
    overflow: scroll;
  }
  .bottom-btn{
    float: right;
    padding-right: 100px
  }
</style>
