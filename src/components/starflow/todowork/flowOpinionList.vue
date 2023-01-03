<template>
  <div class="admin_right_main">
    <template>
      <div class="table_template">
        <div
          class="table_header"
          v-if="
            tableOption.isShowHeader != undefined
              ? tableOption.isShowHeader
              : true
          "
        >
          <div class="table_header_default">
            <div class="table_header_default_title">
              <div class="marginR40">
                <span class="title_font">流程跟踪</span>
              </div>
            </div>
          </div>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column label="序号" type="index"></el-table-column>
          <el-table-column
            prop="activityName"
            label="活动"
            width
          ></el-table-column>
          <el-table-column prop="noteText" label="意见"></el-table-column>
          <el-table-column
            prop="personName"
            label="姓名"
            width
          ></el-table-column>
          <el-table-column prop="noteDate" label="办理时间"></el-table-column>
        </el-table>
      </div>
    </template>
  </div>
</template>

<script>
import { viewProcessWithApplyUuid,viewProcessWithAppDataUuid } from "@/api/starflow";
export default {
  props: ["applyUuid","pageFrom"],
  data() {
    return {
      tableOption: { isShowHeader: true, height: "auto" },
      tableData: [],
    };
  },
  //mounted：页面初始化方法，html加载完成后执行，执行顺序:子组件-父组件
  mounted: function () {
    this.init();
  },
  computed: {},
  methods: {
    init() {
      var obj = {
        applyUuid: this.applyUuid,
      };
      //原方法 只支持在每人的待办中查看流程 因为个人的业务页面中 没有审批单id这条数据
      // 拿不到审批单主键id 能拿到也是非常的繁琐
      //现在只需要父页面 写死applyPage 这个值 就会根据 业务主键id去查询对应的流程
      if(this.pageFrom == 'applyPage'){
        viewProcessWithAppDataUuid(obj)
        .then((res)=>{
          if (res.data) {
            //初始化参数流程，人员参数
            this.tableData = res.data;
          }
        })
      }else{
        viewProcessWithApplyUuid(obj).then((resp) => {
          //初始化审核列表数据
          if (resp.data) {
            //初始化参数流程，人员参数
            this.tableData = resp.data;
          }
        });
      }
      // this.$axios
      //   .get("/starflow/applyMes/sf/apply/viewProcessWithApplyUuid", {
      //       params: {
      //         applyUuid: this.applyUuid,
      //         }
      //       })
      //   .then(response => {
      //     //初始化审核列表数据
      //     if (response.data.data) {
      //       //初始化参数流程，人员参数
      //       this.tableData = response.data.data;
      //     }
      //   })
      //   .catch(function(error) {
      //     console.log(error);
      //   });
    },
  },
};
</script>
<style src="../css/tableItem.css" scoped>
</style>