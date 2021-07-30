<template>
  <div class="page-container">
    <el-row>
      <el-col :span="4">
        <div class="filter-container query-field">
          <el-form :inline="true">
            <el-form-item label="项目名称">
              <el-select v-model="projectUuid" filterable @change="changeProject">
                <el-option v-for="opt in projectlist" :key="opt.projectUuid" :label="opt.projectName" :value="opt.projectUuid" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <div style="height:80vh; overflow:auto;">
          <el-tree
            ref="tree"
            :data="taskNodelist"
            :props="defaultProps"
            default-expand-all
            node-key="auditedOrgUuid"
            style="margin-top:10px;"
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <el-col v-if="tabUrl!==null" :span="18" :offset="1">
        <component
          :is="childTaskNode"
          v-if="taskNodestatus"
          ref="childTaskNode"
          :project-id="projectUuid"
        />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { listByPage } from '@TCB/api/tcbaudit/project'
import { getTaskNodeTree } from '@TCB/api/tcbaudit/audittasknode'

export default {
  components: {
    // 组件列表 按需引入
    taskResulThandle(resolve) {
      require(['@/views/analysis/modelresulthandle/index'], resolve)
    },
    taskRiskWarning(resolve) {
      require(['@TCB/views/audit/riskwarning/index'], resolve)
    },
    taskManageSuggest(resolve){
      require(['@TCB/views/audit/manageSuggest/index'], resolve)
    }
  },
  data() {
    return {
      taskNodestatus: false,
      taskNodeUrl: '../project/index',
      checkedTask: null,
      tabUrl: null,
      childTaskNode: null,
      projectUuid: null,
      projectName: null,
      // 项目列表
      projectlist: null,
      // 项目资料树列表
      taskNodelist: null,
      // 树默认属性
      defaultProps: {
        children: 'children',
        label: 'taskNodeName',
        id: 'taskNodeUuid',
        value: ''
      },
      // 项目查询条件
      pageQuery: {
        condition: {},
        pageNo: 1,
        pageSize: 2000,
        sortBy: 'desc',
        sortName: 'createTime'
      }
    }
  },
  created() {
    this.getProjectList()
    this.getTaskNodeTreeList()
  },
  methods: {
    // 获取所有项目
    getProjectList(query) {
      this.listLoading = true
      if (query) {
        this.pageQuery.condition = query
        this.pageQuery.pageNo = 1
      }
      listByPage(this.pageQuery).then(resp => {
        this.projectlist = resp.data.records
        if (resp.data.records.length > 0) { this.projectUuid = resp.data.records[0].projectUuid }
      })
    },
    // 获取项目资料树
    getTaskNodeTreeList() {
      getTaskNodeTree().then(resp => {
        this.taskNodelist = resp.data
        if (this.taskNodelist[0].children !== null){
          // 默认选中第一个子元素
          this.handleNodeClick(this.taskNodelist[0].children[0])
        }
      })
    },
    // 项目切换事件
    changeProject(projectUuid) {
      this.projectUuid = projectUuid
      this.taskNodestatus = false
      if (this.checkedTask !== null) {
        this.handleNodeClick(this.checkedTask)
      }
    },
    // 树节点点击事件
    handleNodeClick(data) {
      this.checkedTask = data
      if (data.taskNodeUrl != null) {
        this.taskNodestatus = true
        this.tabUrl = data.taskNodeCode
        // 方法一
        // 直接引入，缺点不能异步，不能取变量，可能因为packjson引入的版本冲突导致import中不能使用${}
        // var childTaskNode = () => import('../project/index')
        // this.childTaskNode = childTaskNode
        // 方法二
        // 组件按需引入，缺点需要把所有可能用到的子组件都列出来，数据库中的名字也必须和子组件一样而不是路径
        // 解决方法名称数据库中的url可以存components组件名称
        this.childTaskNode = data.taskNodeUrl
      } else {
        this.tabUrl = null
      }
    }
  }
}
</script>
<style scoped>
.iframe {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: #fff;
    overflow-y: hidden;
}
</style>
