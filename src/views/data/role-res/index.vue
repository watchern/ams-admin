<template>
  <div class="page-container">
    <el-row :gutter="5">
      <el-col :span="6">
        <el-input
          v-model="filterText1"
          placeholder="输入关键字进行过滤"
        />
        <div class="tree-container">
          <MyElTree
            ref="tree1"
            v-loading="tree1Loading"
            :props="props"
            class="filter-tree"
            :default-expanded-keys="['ROOT']"
            :highlight-current="true"
            :data="treeData1"
            node-key="id"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            show-checkbox
          >
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <i v-if="data.id==='root'" class="el-icon-s-home" style="color:#409EFF" />
              <i v-if="data.type==='folder'" class="el-icon-folder" style="color:#409EFF" />
              <i v-if="data.type==='table'" class="el-icon-tickets" style="color:#409EFF" />
              <i v-if="data.type==='column'" class="el-icon-c-scale-to-original" style="color:#409EFF" />
              <span :title="node.name">{{ node.label }}</span>
            </span>
          </MyElTree>
        </div>
      </el-col>

      <el-col :span="2" style="width: 45px; padding-top: 10%">
        <div class="transfer-center">
          <p class="transfer-center-item">
            <el-button
              type="primary"
              icon="el-icon-arrow-right"
              circle
              @click="addRoleTable"
            />
          </p>
        </div>
      </el-col>

      <el-col :span="6">
        <el-input
          v-model="filterText2"
          placeholder="输入关键字进行过滤"
        />
        <div class="tree-container">
          <MyElTree
            ref="tree2"
            :props="props"
            class="filter-tree"
            :highlight-current="true"
            :data="treeData2"
            node-key="id"
            :default-expanded-keys="['ROOT']"
            :expand-on-click-node="false"
            show-checkbox
          >
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <i v-if="data.id==='ROOT'" class="el-icon-s-home" style="color:#409EFF" />
              <i v-if="data.type==='folder'" class="el-icon-folder" style="color:#409EFF" />
              <i v-if="data.type==='table'" class="el-icon-tickets" style="color:#409EFF" />
              <i v-if="data.type==='column'" class="el-icon-c-scale-to-original" style="color:#409EFF" />
              <span :title="node.name" @click="onclick2(node)">{{ node.label }}</span>
              <span v-if="data.id!=='ROOT'" style="padding-left: 10px">
                <el-button type="text" size="mini" icon="el-icon-remove" @click="() => remove(node, data)" />
              </span>
            </span>
          </MyElTree>
        </div>
      </el-col>

      <el-col :span="8">
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

          <el-form-item label="访问类型设置" label-width="100px">
            <el-checkbox-group v-model="currentData.accessType">
              <el-checkbox v-for="(acc, i) in accessTypeArray" :key="acc.code" :label="acc.code">{{ acc.name }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item v-if="currentData.type==='table'" label="表行列筛选设置" label-width="100px">
            <el-table
              key="colMetaUuid"
              v-loading="listLoading"
              :data="currentData.cols"
              border
              fit
              highlight-current-row
              style="width: 100%;"
              max-height="350"
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
    <div slot="footer" style="float:right;">
      <el-button @click="goBack">取消</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </div>
  </div>
</template>
<script>
import MyElTree from '@/components/public/tree/src/tree.vue'
import { getResELTree, getResByRole, getRoleCols, saveRoleTable, getAccessType } from '@/api/data/table-info'
import { commonNotify } from '@/utils'

export default {
  components: { MyElTree },
  data() {
    return {
      roleUuid: this.$route.params.roleUuid,
      filterText1: null,
      filterText2: null,
      tree1Loading: false,
      listLoading: false,
      props: {
        label: 'label',
        isLeaf: 'leaf'
      },
      treeData1: [],
      treeData2: [{
        id: 'ROOT',
        label: '角色数据',
        children: []
      }],
      currentData: null, // 当前选中的数据表
      currentSelection: [],
      accessTypeArray: [],
      selectList: []
    }
  },
  computed: {
  },
  watch: {
    filterText1(val) {
      this.$refs.tree1.filter(val)
    },
    filterText2(val) {
      this.$refs.tree2.filter(val)
    }
  },
  created() {
    this.tree1Loading = true
    getResELTree({ dataUserId: 'master', sceneCode: '' }).then(resp => {
      this.treeData1 = resp.data
      this.tree1Loading = false
    })
    getResByRole(this.$route.params.roleUuid).then(resp => {
      resp.data.forEach(item => {
        this.treeData2[0].children.push(item)
      })
    })
    getAccessType().then(resp => {
      this.accessTypeArray = resp.data
    })
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    addRoleTable() {
      /* 先对选中节点以pid为key做hashmap */
      var ckTbs = this.$refs.tree1.getCheckedNodes(false, true)
      if (ckTbs.length == 0) {
        ckTbs.push(this.$refs.tree1.getCurrentNode())
      }
      var ckTbsMap = {}
      ckTbs.forEach((item) => {
        var assItem = Object.assign({}, item)
        assItem.children = []
        if (!ckTbsMap[item.pid]) ckTbsMap[item.pid] = []
        ckTbsMap[item.pid].push(assItem)
      })

      /* 遍历selected data 然后将节点插入*/
      this.goThroughTree(this.treeData2[0], treeNode => {
        var children = ckTbsMap[treeNode.id]
        var myChildren = treeNode.children
        if (children) {
          if (!myChildren) this.$set(treeNode, 'children', [])
          // 找孩子 并且现在没有这个孩子
          children.forEach(c => {
            if (treeNode.children.filter(node => { return node.id === c.id }).length === 0) {
              treeNode.children.push(c)
            }
          })
        }
      })
    },

    goThroughTree(treeNode, callback) {
      callback(treeNode)
      var children = treeNode.children
      if (!children) return true
      for (var i = 0; i < children.length; i++) {
        this.goThroughTree(children[i], callback)
      }
    },

    removeTable() {

    },
    remove(node, data) {
      const parent = node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex(d => d.id === data.id)
      children.splice(index, 1)
    },

    /* 点击角色数据 展示列和wherestr */
    onclick2(node, data) {
      if (node.data.type === 'table') {
        if (node.data.cols) {
          this.currentData = node.data
          if (!this.currentData.accessType) this.$set(this.currentData, 'accessType', [])
        } else {
          this.listLoading = true
          getRoleCols(this.roleUuid, node.data.id).then(resp => {
            this.listLoading = false
            node.data.cols = resp.data
            this.currentData = node.data
            // if(!this.currentData.extMap) this.$set(this.currentData, 'extMap', null);
            this.currentData.cols.forEach(d => {
              this.$set(d, 'selected', d.roleCol !== null)
            })
            if (!this.currentData.accessType) this.$set(this.currentData, 'accessType', [])
          })
        }
      } else if (node.data.type === 'folder') {
        this.currentData = node.data
        if (!this.currentData.accessType) this.$set(this.currentData, 'accessType', [])
      }
    },

    /* changeAccess(a, b){
      var i = parseInt(b.target.name.substr(1));
      this.currentData.extMap.accessType[i] = a;
    },*/

    save() {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      var allNodes = this.$refs.tree2.getAllNodes()
      var folders = []
      var tables = []
      var cols = []
      allNodes.forEach(node => {
        var data = node.data
        if (data.id !== 'ROOT') {
          if (!data.accessType) data.accessType = []
          var accType1 = data.accessType.join(',')
          if (data.type === 'folder') {
            folders.push({
              dataRoleUuid: this.roleUuid,
              folderUuid: data.id,
              accessType: accType1
            })
          } else if (data.type === 'table') {
            tables.push({
              dataRoleUuid: this.roleUuid,
              tableMetaUuid: data.id,
              accessType: accType1,
              whereStr: data.whereStr
            })
            if (data.cols) {
              data.cols.forEach(col => {
                if (col.selected) {
                  cols.push({
                    colMetaUuid: col.colMetaUuid,
                    dataRoleUuid: this.roleUuid
                  })
                }
              })
            }
          }
        }
      })
      saveRoleTable(this.roleUuid, folders, tables, cols).then(() => {
        loading.close()
        this.$notify(commonNotify({ type: 'success', message: '保存成功！' }))
      })
    },
    goBack() {
      this.$router.go(-1)
    }

  } // 注册
}

</script>

<style lang="scss" scoped>
  .dialog-bottom-btns{

  }
  .bottom-btn{
    float: right;
    padding-right: 100px
  }
</style>

