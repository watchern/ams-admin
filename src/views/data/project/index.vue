<template>
  <div class="tree-list-container">
    <template>
      <el-row>
        <el-col :span="6">
          <el-input
            v-model="projectSelect"
            disabled
          />
        </el-col>
        <el-col :span="18">
          <span style="color:#4bc0f0">请选择项目:</span>
          <el-select v-model="dataUserId" style="width:400px" placeholder="请选择" :filterable="true">
            <el-option
              v-for="project in allProject"
              :key="project.id"
              :label="project.label"
              :value="project.id"
            />
          </el-select>
        </el-col>
      </el-row>
    </template>
    <el-col :span="24">
      <project-tabs v-if="divInfo" ref="projectTabs" :data-user-id="dataUserId" :scene-code="sceneCode" :tab-show.sync="tabShow" />
    </el-col>
  </div>
</template>

<script>
import projectTabs from '@/views/data/project/projecttabs'
import { getAllGropSelect } from '@/api/data/scene'

export default {
  components: { projectTabs },
  data() {
    return {
      tabShow: 'directory',
      divInfo: false,
      //sceneCode: 'project',
      sceneCode: this.$route.params.sceneCode,
      allProject: [],
      projectSelect: '',
      dataUserId: '',
      isTreeShow: true
    }
  },
  watch: {
    dataUserId: {
      // 深度监听，可监听到对象、数组的变化
      handler(val, oldVal) {
        this.dataUserId = val
        this.projectSelect = this.allProject.filter(e => { return e.id === this.dataUserId })[0].label
        this.divInfo = false
        this.$nextTick(() => {
          this.divInfo = true
        })
      }
    },
    deep: true
  },
  created() {
    getAllGropSelect(this.sceneCode).then(resp => {
      this.allProject = resp.data
      console.log(this.allProject[0])
      this.dataUserId = this.allProject[0].id
      this.projectSelect = this.allProject[0].label
      this.divInfo = false
      this.$nextTick(() => {
        this.divInfo = true
      })
    })
  },
  methods: {

  }
}
</script>

<style scoped>
.tree {
  width: 20%;
  float: left;
  margin-left: 1%;
  height: 95%;
}
.divContent {
  width: 78%;
  float: right;
}
</style>
