<template>
  <div class="page-container">
    <div class="page-left">
      <el-collapse class="tools-menu-small" v-model="activeName" accordion v-if="showmoremenu">
        <el-collapse-item :title="moremenugroupId[0].name" name="0">
          <el-tree
            :data="moremenugroup[0]"
            node-key="id"
            show-checkbox
            :check-strictly="defaultProps.checkStrictly"
            @check-change="handleCheckChange"
            ref="tree"
            highlight-current
            v-if="activeName === '0'"
            :props="defaultProps">
          </el-tree>
        </el-collapse-item>
        <el-collapse-item :title="moremenugroupId[1].name" name="1">
          <el-tree
            :data="moremenugroup[1]"
            node-key="id"
            show-checkbox
            :check-strictly="defaultProps.checkStrictly"
            @check-change="handleCheckChange"
            ref="tree"
            highlight-current
            v-if="activeName === '1'"
            :props="defaultProps">
          </el-tree>
        </el-collapse-item>
        <el-collapse-item :title="moremenugroupId[2].name" name="2">
          <el-tree
            :data="moremenugroup[2]"
            node-key="id"
            show-checkbox
            :check-strictly="defaultProps.checkStrictly"
            @check-change="handleCheckChange"
            ref="tree"
            highlight-current
            v-if="activeName === '2'"
            :props="defaultProps">
          </el-tree>
        </el-collapse-item>
        <el-collapse-item :title="moremenugroupId[3].name" name="3">
          <el-tree
            :data="moremenugroup[3]"
            node-key="id"
            show-checkbox
            :check-strictly="defaultProps.checkStrictly"
            @check-change="handleCheckChange"
            ref="tree"
            highlight-current
            v-if="activeName === '3'"
            :props="defaultProps">
          </el-tree>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="mytuieditor" v-if="refreshRichText" v-loading="loading">
      <wangeditor
        :content="richText"
        @retrieveData="retrieveData"
        ref="wangeditor"
      />
      <el-button type="primary" @click="saveNew" :disabled="canSave" style="margin-top:10px">保存</el-button>
    </div>
	</div>
</template>
<script>
import wangeditor from "../../../components/Ace/help-function/wangeditor.vue"
import { getUserRes } from '@/api/user'
import { saveHelpDocument, getByMenuId, updateHelpDocument } from '@/api/base/helpdocument'
export default {
  components: { wangeditor },
  data() {
    return {
      // 左侧数据块
      applications: [],
      // 各菜单内容
      moremenugroupId: [],
      moremenugroup: [],
      showmoremenu: false,
      // 左侧树数据
      defaultProps: {
        children: 'children',
        label: 'name',
        checkStrictly: true,
        disabled: this.ifFather,
      },
      // 富文本数据
      richText: '',
      // 激活菜单
      activeName: '1',
      // 刷新富文本编辑器
      refreshRichText: true,
      // 保存帮助富文本内容的uuid
      helpDocumentUuid: '',
      // loading
      loading: false,
      // 保存按钮
      canSave: true
    }
  },
  computed: {
  },
  created() {
	},
  mounted() {
    let listTree = JSON.parse(sessionStorage.getItem('shenjiMenuTree'))
    this.moremenugroup = listTree.second
    this.moremenugroupId = listTree.first
    this.showmoremenu = true
  },
  watch:{
    'richText'() {
        this.refreshRichText = false
        this.$nextTick(() => {
          this.refreshRichText = true
        })
    }
  },
  methods: {
    getCleanSrc(src) {
      if (src.indexOf('&resUUID') !== -1) {
        src = src.split('&resUUID')[0]
      } else if (src.indexOf('?resUUID') !== -1) {
        src = src.split('?resUUID')[0]
      }
      return src
    },
    // 保存富文本
    saveNew() {
      this.$refs.wangeditor.displayIn();
    },
    retrieveData(html) {
      let saveData = []
      saveData.push({
        menuId: this.$refs.tree.getCheckedNodes()[0].id,
        menuName: this.$refs.tree.getCheckedNodes()[0].label,
        menuPath: this.$refs.tree.getCheckedNodes()[0].path,
        helpDocument: html,
        helpDocumentUuid: this.helpDocumentUuid
      })
      updateHelpDocument(saveData[0]).then(resp => {
        if(resp.code === 0){
          this.$notify({
            title: '提示',
            message: '保存成功',
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
        }
      })
    },
    // 单选功能
    handleCheckChange (data, checked, indeterminate) {
      if (checked) {
        this.canSave = false
        this.loading = true
        this.$refs.tree.setCheckedNodes([data]);
        // 根据选择的模块显示已编辑的富文本
        getByMenuId(data.id).then(resp => {
          if(resp.code === 0 && resp.data !== null){
            this.richText = resp.data.helpDocument
            this.helpDocumentUuid = resp.data.helpDocumentUuid
            this.loading = false
          } else if (resp.code === 0 && resp.data === null){
            let saveData = []
            saveData.push({
              menuId: this.$refs.tree.getCheckedNodes()[0].id,
              menuName: this.$refs.tree.getCheckedNodes()[0].name,
              menuPath: this.$refs.tree.getCheckedNodes()[0].path,
              helpDocument: ''
            })
            saveHelpDocument(saveData[0])
            getByMenuId(data.id).then(resp => {
              this.helpDocumentUuid = resp.data.helpDocumentUuid
              this.loading = false
            })
          }
        })
      } else {
        this.canSave = true
      }
    },
    // 父节点不可选中
    ifFather(data) {
      if (data.children) {
        return true
      }else{
        return false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .page-container{
    width:100%;
    height:100%;
    overflow: hidden;
    position: relative;
  }
  .page-left{
    width: 290px;
    height: 100%;
    background-color: #fff;
    border-radius: 5px;
    padding: 10px;
    float: left;
    overflow: auto;
  }
  .mytuieditor{
    margin:40px 0 0 15px;
    float:left;
    width: calc(100vw - 495px);
    height: calc(100vh - 120px);
    overflow: auto;
  }
  >>>.el-tree {
    // 不可全选样式
    .el-tree-node {
      .is-leaf + .el-checkbox .el-checkbox__inner {
        display: inline-block;
      }
      .el-checkbox .el-checkbox__inner {
        display: none;
      }
    }
  }
</style>
