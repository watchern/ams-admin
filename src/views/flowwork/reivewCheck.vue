<template>
  <div class="admin_right_main todoDetail" id="flowItem3">
    <template>
      <div>
        <div class="table_header_default">
          <div style="float: left" class="title_template">
            <span class="busdatas title_font">模型数据</span>
          </div>
        </div>
        <el-table
                ref="tab"
                stripe
                :data="this.modelList"
                max-height="300"
        >
          <el-table-column label="模型名称" width="200px" prop="modelName">
            <template slot-scope="scope">
              {{ scope.row.modelName }}
            </template>
          </el-table-column>
          <el-table-column label="平均运行时间" width="150px" prop="runTime" />
          <el-table-column label="审计事项" prop="auditItemName" />
          <el-table-column
                  label="风险等级"
                  prop="riskLevelUuid"
                  align="center"
                  :formatter="riskLevelFormatter"
          />
          <el-table-column
                  label="模型类型"
                  prop="modelType"
                  align="center"
                  :formatter="modelTypeFormatter"
          />
          <el-table-column
                  label="创建时间"
                  prop="createTime"
                  align="center"
                  width="150px"
                  :formatter="dateFormatter"
          />
          <el-table-column
                  label="操作"
                  fixed="right"
                  width="120"
          >
            <template slot-scope="scope">
              <el-button  type="primary" @click="delsubmit(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
    <el-form>
      <el-form-item label="发布路径">
        <el-input v-model="form.commonModelName" disabled></el-input>
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="showWorkTree = true"
      >选择发布位置</el-button>
    <el-dialog
      :visible.sync="showWorkTree"
      :modal="false"
      title="选择要发布到的位置">
      <div>
        <ModelFolderTree
          ref="modelFolderTree"
          :public-model="publicModelValue"/>
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
  props: ["versionUuid", "appDataUuid", "applyType", "flowSetup","actionIdList"],
  components: {
    businessDetail,
    ModelFolderTree,
  },
  data() {
    return {
      // 发布模型
      publicModelValue: "publicModel",
      //文件结构树相关
      showWorkTree: false,
      //数据数组
      dataObj: {},
      flowItem: {},
      id: "",
      form:{},
      modelList:[],
      modleDataList:[],
    };
  },
  destroyed() {
    clearInterval(this.timer);
  },
  created: function () {
    //初始化数据
    this.init();
  },
  methods: {
    //初始化数据
    init() {
      this.form.modelRelationUuid = this.appDataUuid;
      this.$axios
              .post("/analysis/modelPublishRelation/pa/selectBusDatas", this.form)
              .then((response) => {
                this.modelList=response.data.data.modleDataList;
                this.form.commonModelName=response.data.data.commonModelName;
              })
              .catch((error) => {
                console.log(error);
              });
    },
    /**
     * 选择模型树
     */
    updatePublicModel() {
      const selectNode = this.$refs.modelFolderTree.getSelectNode();
      this.showWorkTree = false;
      console.log(selectNode);
      this.form.commonModelName = selectNode.label;
      this.form.commonModelUuid = selectNode.id;
    },

    updateSave() {
      var data = {
        modelRelationUuid: this.appDataUuid,
        status: this.$store.state.applyInfo.applyInfo.status,
        commonModelUuid: this.form.commonModelUuid,
        commonModelName: this.form.commonModelName,
      };
      this.$axios
              .post("/analysis/modelPublishRelation/updataSave", data)
              .then((response) => {
                if (response.data.code == "0") {
                  //修改业务审核状态
                  this.$store.dispatch("applyInfo/setMstate", "0");
                  this.common.alertMsg(1, "更新成功");
                } else {
                  this.common.alertMsg(2, "更新失败");
                }
              })
              .catch((error) => {
                this.common.alertMsg(2, "更新失败");
                console.log(error);
              });
    },

    delsubmit(val){
      // alert(JSON.stringify(val))
      this.modleDataList.push(val)
      // alert(JSON.stringify(this.modleDataList))
      this.$axios
              .post("/analysis/modleData/batchDelete", modleDataList)
              .then((response) => {
                if (response.data.code == "0") {
                  this.common.alertMsg(1, "删除成功");
                } else {
                  this.common.alertMsg(2, "删除失败");
                }
              })
              .catch((error) => {
                this.common.alertMsg(2, "删除失败");
                console.log(error);
              });
    },
    submitFlow() {
      this.axios.post("xxxx", this.dataObj).then((response) => {
        console.log(response);
        if(response.code == 200){
            alert("审核成功")
            this.goBack()
        }
      });
    },
    returnFlow() {
      this.axios.post("xxxx", this.dataObj).then((response) => {
        console.log(response);
        if(response.code == 200){
            alert("回退成功")
            this.goBack()
        }
      });
    },
    //返回
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>
<style>
/* .admin_right_main .content_form .el-input .el-input__inner {
  width: 360px;
} */

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
#flowItem3 {
  padding: 20px;
}
.bottom-btn {
  float: right;
  padding-right: 100px;
}
</style>