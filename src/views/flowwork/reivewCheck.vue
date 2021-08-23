<template>
  <div class="admin_right_main todoDetail" id="flowItem3">
    <div class="content_form">
      <el-form
        ref="applyTitleForm"
        :model="dataObj"
        label-width="128px"
        size="mini"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="审批标题："
              class="form_item form_item_one"
              style="display: flex"
            >
              <el-input
                type="input"
                :title="dataObj.applyTitle"
                v-model="dataObj.applyTitle"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template>
      <businessDetail
        ref="businessDetail"
        :flowItem="flowItem"
        :submitData="dataObj"
        :ifdel="true"
        @submitFlow="submitFlow"
      ></businessDetail>
    </template>
    <el-form>
      <el-form-item label="发布路径">
        <el-input v-model="dataObj.treeUrlname" disabled></el-input>
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="showWorkTree = true"
      >选择发布位置</el-button
    >

    <!-- 流程内容：审核意见、填写意见、选择下一步 -->
    <div class="flow_template">
      <template>
        <div class="opinion_template">
          <div class="title_template">
            <span class="title_font">审核意见</span>
          </div>
          <div class="content">
            <div class>
              <el-form
                ref="form"
                :model="dataObj"
                label-width="128px"
                size="mini"
              >
                <!-- 是否同意，切换工作流分支 -->
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item
                      label="处理意见"
                      class="form_item"
                      prop="opinion"
                    >
                      <el-input
                        type="textarea"
                        v-model="dataObj.opinion"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </div>
        </div>
      </template>
    </div>
    <el-dialog
      :visible.sync="showWorkTree"
      :modal="false"
      title="选择要发布到的位置"
    >
      <div>
        <ModelFolderTree
          ref="modelFolderTree"
          :public-model="publicModelValue"
        />
        <div slot="footer" style="padding: 10px 0">
          <el-button type="primary" @click="updatePublicModel">确定</el-button>
          <el-button @click="showWorkTree = false">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import ModelFolderTree from "@/views/analysis/auditmodel/modelfoldertree";
//用于知会人
import businessDetail from "./reviewDetail";
export default {
  components: {
    businessDetail,
    ModelFolderTree,
  },
  //预设数据
  //  dataObj = {
  //         applyTitle: "测试标题",
  //         opinion: "测试意见",
  //         treeUrlname: "测试路径",
  //         treeUrlid: "xxxid",
  //         busdatas: [{ modelName: "测试数据",runTime:'xxxxx',auditItemName:'xxxxxx',riskLevelUuid:'1',modelType:'1',createTime:'2021-8-23' }],
  //       };
  props: ["dataObj"],
  data() {
    return {
      // 发布模型
      publicModelValue: "publicModel",
      //文件结构树相关
      showWorkTree: false,
      flowItem: {},
    };
  },
  destroyed() {
    clearInterval(this.timer);
  },
  mounted: function () {
    this.init();
  },
  methods: {
    //初始化数据
    init() {},
    /**
     * 选择模型树
     */
    updatePublicModel() {
      const selectNode = this.$refs.modelFolderTree.getSelectNode();
      this.showWorkTree = false;
      console.log(selectNode);
      this.dataObj.treeUrlname = selectNode.label;
      this.dataObj.treeUrlid = selectNode.id;
    },
    submitFlow() {},
  },
};
</script>
<style>
.admin_right_main .content_form .el-input .el-input__inner {
  width: 360px;
}

.todoDetail .el-form-item__label {
  float: left !important;
}

.todoDetail .form_item_one .el-form-item__content {
  margin-left: 0px !important;
}
.todoDetail .el-form-item__label {
  font-weight: normal !important;
}
.todoDetail .el-radio__label {
  /* color: #68707a !important; */
  font-size: 13px !important;
}
.todoDetail .el-radio {
  color: #68707a !important;
}
#flowItem3 .el-button--primary {
  background-color: #409eff !important;
  border-color: #409eff !important;
  color: #fff !important;
}
.title_template {
  padding: 20px 0 10px 0 !important;
}
</style>