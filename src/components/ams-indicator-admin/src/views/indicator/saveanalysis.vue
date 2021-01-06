<template>
    <el-form>
        <el-form-item label="常用分析名称">
            <el-input id="anaName" v-model="form.anaName"></el-input>
        </el-form-item>
        <el-form-item label="所属分类">
            <el-select v-model="form.folderName" placeholder="请选择所属分类" style="width: 100%" ref="folderName">
                <el-option :value="form.folderName" :label="form.folderName" style="width: 100%;height:200px;overflow: auto;background-color:#fff">
                    <tree :nodes="commonTreeNodes" :setting="commonTreeSetting" @onCreated="commonTreeCreate"></tree>
                </el-option>
            </el-select>
        </el-form-item>
      <el-footer>
        <div style="float: right">
          <el-button type="primary" @click="enter">保存</el-button>
          <el-button type="primary" @click="closeDialog">取消</el-button>
        </div>
      </el-footer>
    </el-form>
</template>
<script>
import request from '@/utils/request'
import $ from 'jquery'
import { Loading } from 'element-ui'

export default {
  name: 'saveAnalysis',
  props: ['isInManager','isOrgManager'],
  components: {
    tree: resolve => require(["../../lib/ztree/ztree.vue"], resolve)
  },
  data() {
    return {
      form: {
        anaName: '',
        folderName: ''
      },
      treePathId: "",
      treePathName: "",
      pbScopeUuid: "",
      commonTree: null,
      commonTreeNodes: null,
      commonTreeSetting: null,
      ZtreeId:'',
      level:''
    }
  },
  mounted() {
      this.initZtree()
  },
  created() {

  },
  methods: {
    commonTreeCreate(commonTree){
      this.commonTree = commonTree
      this.commonTree.expandAll(true)
      var node = this.commonTree.getNodes() //可以获取所有的父节点
      //var nodes = this.commonTree.transformToArray(node) //获取树所有节点
      //直接判断最父级节点就行  不需要判断其他子节点
      for(var i = 0;i < node.length; i++){
          //判断是否为全行并且是否有全行管理权限
          if (node[i].auditorOrauditorgan == 1 && this.isInManager != "true") {
              this.commonTree.hideNode(node[i])
          }
          //判断是否为机构并且是否有全行管理权限
          if (node[i].auditorOrauditorgan == 2 && this.isInManager != "true") {
              if(this.isOrgManager != "true"){
                  this.commonTree.hideNode(node[i])
              }
          }
      }
    },
      //region 树加载以及操作
    /**
     * 初始化树
     */
    initZtree() {
      let that = this
        var urlOne = this.contextUrl + "/InOfteninfolder/getCommonlyAnalysisZtree"
        $.post(urlOne, {}, function (res) {
          var zNodes = res
          var setting = {
              check: {
                  enable: false,
                  chkboxType: {"Y": "s", "N": "ps"},
                  drag: {
                      autoExpandTrigger: true,
                      prev: true,
                      inner: true,
                      next: true
                  },
              },
              data: {
                  key: {
                      name: "name"
                  },
                  simpleData: {
                      enable: true,
                      idKey: "id",
                      pIdKey: "pid"
                  }
              },
              async: {
                  enable: false
              },
              callback: {
                  // aOnAsyncError : //加载错误的fun
                  onClick: that.onClick
              },
              view: {
                  addDiyDom: that.addDiyDom
              },
              edit: {
                  enable: true,
                  showRemoveBtn: false,
                  showRenameBtn: false
              }
          }
          that.commonTreeSetting = setting
          that.commonTreeNodes = zNodes
        }, "json")
    },

    /**
     * 添加dom样式
     * @param treeId 树节点编号
     * @param treeNode 树节点
     */
    addDiyDom(treeId, treeNode) {
        var aObj = $("#" + treeNode.tId + "_a")
        var editStr1 = "<i class='icon-circle-3'></i>"
        var editStr2 = "<i class='icon-circle-4'></i>"
        var editStr3 = "<div class='icon-circle-5'><i></i><span>收起</span></div>"
        if (treeNode.iconSkin === 'ztree_2') {
            aObj.append(editStr1)
        }
        if (treeNode.iconSkin === 'ztree_3') {
            aObj.append(editStr2)
        }

        if (treeNode.iconSkin === 'ztree_4') {
            aObj.append(editStr3)
        }
        if (treeNode.iconSkin === 'ztree_5') {
            aObj.append(editStr1)
        }
    },

    /**
     * 树点击事件
     * @param e
     * @param treeId
     * @param treeNode
     */
    onClick(e, treeId, treeNode) {
      if(treeNode.type!="folder"){
          that.$message("不能选择分析！")
          return
      }
      this.getPah()
      this.commonTree.expandNode(treeNode)
      this.ZtreeId = treeNode.id
      this.level = treeNode.level
      this.form.folderName = treeNode.name
      this.pbScopeUuid = treeNode.pbScopeUuid
    },

    /**
     * 获取选中节点的路径
     * @returns {string} 返回路径
     */
    getPah() {
        this.treePathId = ""
        this.treePathName = ""
        var selNode = this.commonTree.getSelectedNodes()
        var ztreePath = this.getzTreePath(selNode)
        return ztreePath
    },

    /**
     *递归获取zTree选中节点的所有父级节点
     * @param Node
     * @returns {string}
     */
    getzTreePath(Node) {
        var pNode = this.commonTree.getNodesByParam("id", Node[0].pid, null)
        this.treePathName += Node[0].name + "/"
        this.treePathId += Node[0].id + ","
        if (pNode.length != 0) {
            this.getzTreePath(pNode)
        }
        return this.treePathId
    },
    /**
     * 关闭窗体
     */
    closeDialog() {
        this.$emit('closeSaveAnalysisDialog')
    },

    /**
     * 确定按钮
     */
    enter() {
        //组织分析对象
      let that = this
      var analysisName = $("#anaName").val()
      if(analysisName == null || analysisName === "")
      {
          this.$message("请输入分析名称！")
          return
      }
      if(this.level == 0){
        this.$message("不能创建在根目录下！")
          return
      }
      var flag = false
      var message = ""
      var verUrl = this.contextUrl + "/InOftenindicators/verAnalysisName"
      $.ajax({
          type: "post",
          url: verUrl,
          data: {newName:analysisName,pbScopeUuid:this.pbScopeUuid},
          dataType:"json",
          async: false,
          success: function (res) {
              if(res.state == false){
                  message = res.message
                  flag = res.state
              }
              else{
                  flag = true
              }
              return flag
          }
      })
      if(flag == false){
          that.$message(message)
          return false
      }
      this.$emit('addAnalistsNode',analysisName,this.pbScopeUuid,this.ZtreeId)
      this.$emit('initCommonlyAnalysisZtree')
    }
  }
}
</script>
