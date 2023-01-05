<template class="divContent">
  <div>
    <el-tabs ref="tabs"
             v-model="tabShowName"
             style="text-align:center">
      <el-tab-pane label="数据资源目录"
                   name="directory">
        <directory :data-user-id="dataUserId"
                   :scene-code="sceneCode" />
      </el-tab-pane>
      <el-tab-pane label="模型编写"
                   name="auditmodel">
        <auditmodel :data-user-id="dataUserId"
                    :scene-code="sceneCode"
                    :folder-name="folderName" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import directory from '@/views/data/directory/index'
import auditmodel from '@/views/analysis/auditmodel/index'
export default {
  components: { directory, auditmodel },
  // eslint-disable-next-line vue/require-prop-types
  props: ['dataUserId', 'sceneCode', 'tabShow'],
  data () {
    return {
      tabShowName: '',
      folderName: "项目模型"
    }
  },
  watch: {
    tabShowName: {
      handler (newName, oldName) {
        this.$emit('update:tab-show', newName)
      },
      deep: true
    }
  },
  created () {
    this.tabShowName = this.tabShow
  },
  methods: {
  }
}
</script>
