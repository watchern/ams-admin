<template>
  <div class="page-container">
    <div class="page-left">
      <el-collapse class="tools-menu-small" v-model="activeName" accordion>
        <el-collapse-item title="审计作业" name="1">
          <el-tree
            :data="moremenugroup['402883817586fc2a017586fd9e1a0001']"
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
        <el-collapse-item title="审计分析" name="2">
          <el-tree
            :data="moremenugroup['4028838175880ded01758835b393006b']"
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
        <el-collapse-item title="审计资源" name="3">
          <el-tree
            :data="moremenugroup['4028838175880ded01758816610b001a']"
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
        <el-collapse-item title="系统配置" name="4">
          <el-tree
            :data="moremenugroup['4028838175880ded01758828366f0046']"
            node-key="id"
            show-checkbox
            :check-strictly="defaultProps.checkStrictly"
            @check-change="handleCheckChange"
            ref="tree"
            highlight-current
            v-if="activeName === '4'"
            :props="defaultProps">
          </el-tree>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="mytuieditor" v-if="refreshRichText">
      <wangeditor
        :content="richText"
        @retrieveData="retrieveData"
        ref="wangeditor"
      />
      <button @click="saveNew">保存</button>
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
      menugroup: [],
      moremenugroup: [],
      // 左侧树数据
      defaultProps: {
        children: 'children',
        label: 'label',
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
      helpDocumentUuid: ''
    }
  },
  computed: {
  },
  created() {
	},
  mounted() {
    getUserRes()
      .then(response => {
        response.data.application.forEach((app, index) => {
          // 设置左侧应用栏数据
          this.applications.push({
            name: app.name,
            id: app.id
          })
        })
        response.data.menugroup.forEach(grp => {
          const children = []
          grp.menuList.forEach(menu => {
            children.push({
              label: menu.name,
              id: menu.id,
              path: this.getCleanSrc(menu.src)
            })
          })
          if (!this.menugroup[grp.appuuid]) {
            this.menugroup[grp.appuuid] = []
          }
          this.menugroup[grp.appuuid].push({
            label: grp.name,
            path: grp.navurl,
            children: children
          })
        })
        this.moremenugroup = this.menugroup
      })
      .catch(error => {
        console.error(error)
      })
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
        this.$refs.tree.setCheckedNodes([data]);
        // 根据选择的模块显示已编辑的富文本
        getByMenuId(data.id).then(resp => {
          if(resp.code === 0 && resp.data !== null){
            console.log(resp.data)
            this.richText = resp.data.helpDocument
            this.helpDocumentUuid = resp.data.helpDocumentUuid
          } else if (resp.code === 0 && resp.data === null){
            let saveData = []
            saveData.push({
              menuId: this.$refs.tree.getCheckedNodes()[0].id,
              menuName: this.$refs.tree.getCheckedNodes()[0].label,
              menuPath: this.$refs.tree.getCheckedNodes()[0].path,
              helpDocument: ''
            })
            saveHelpDocument(saveData[0])
            getByMenuId(data.id).then(resp => {
              this.helpDocumentUuid = resp.data.helpDocumentUuid
            })
          }
        })
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
    width: 15vw;
    height: 100%;
    background-color: #fff;
    border-radius: 5px;
    padding: 10px;
    float: left;
    overflow: auto;
  }
  .mytuieditor{
    margin-top: 40px;
    float:left;
    width: 75vw;
  }
</style>
