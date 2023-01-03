<template>
  <div style="height: 100%">
    <el-container style="">
      <el-aside width="28%" height="100%">
        <el-tree
          :data="treeData"
          :props="defaultProps"
          @node-click="handleNodeClick"
          style="height: 100%"
        ></el-tree>
      </el-aside>
      <!--            style="justify-content: center"-->
      <el-main width="72%; flex-flow: column warp;">
        <div style="width: 100%">
          <div class="filter-container">
            <QueryField
              ref="queryfield"
              :form-data="queryFields"
              @submit="getList"
            />
          </div>
        </div>

        <div style="width: 100%; padding-top: 5px">
          <el-form style="padding-left: 1%">
            <el-form-item>
              <div>
                <el-col :span="21">
                    <el-button type="text" @click="showPersonListTable">人员列表</el-button>
                    <el-button type="text" @click="showDataListTable" >数据清单</el-button>
                </el-col>
                <el-col :span="3" >
                  <el-button type="primary" class="oper-btn export" @click="showExportList" />
                  <el-button type="primary" class ="oper-btn count" @click="showCountList" />
                </el-col>
              </div>
            </el-form-item>
              <div v-if="showPersonList" >
                  <el-table :data="personTable" style="width: 100%">
                      <el-table-column prop="cole" label="角色" align="center">
                      </el-table-column>
                      <el-table-column prop="coleNumber" label="工号" align="center">
                      </el-table-column>
                      <el-table-column prop="coleName" label="姓名" align="center">
                      </el-table-column>
                      <el-table-column prop="filter" label="部门" align="center">
                      </el-table-column>
                      <el-table-column prop="createUserName" label="创建人" align="center">
                      </el-table-column>
                  </el-table>
              </div>
              <div v-if="showDataList" >
                  <el-table :data="dataTable" style="width: 100%">
                      <el-table-column prop="cole" label="角色"align="center">
                      </el-table-column>
                      <el-table-column prop="tableName" label="表名称" align="center">
                      </el-table-column>
                      <el-table-column prop="tableNameCn" label="表中文名称" align="center">
                      </el-table-column>
                      <el-table-column prop="filter" label="筛选条件" align="center">
                      </el-table-column>
                      <el-table-column prop="createUserName" label="创建人" align="center">
                      </el-table-column>
                  </el-table>
              </div>

          </el-form>
        </div>
      </el-main>
         <el-dialog title="选择导出方式" :visible.sync="dialogExportVisible" :close-on-click-modal="false">
            <div class="dialog-Export" style="display: flex;justify-content: center;align-items: center;">
                <el-radio v-model="radio" label="1" border>xls格式</el-radio>
                <el-radio v-model="radio" label="2" border>xlsx格式</el-radio>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogExportVisible = false">取消</el-button>
                <el-button type="primary" @click="exportList">确定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="统计" :visible.sync="dialogCountVisible" :close-on-click-modal="false">
            <div class="detail-form">
                <template class="detail-form">
                    <el-button style="margin:auto 0px auto 10px;" @click="showCountPersonTable">人员列表</el-button>
                    <el-button style="margin:auto 0px auto 10px;" @click="showCountDataListTable" >数据清单</el-button>
                    <div v-if="showCountPersonList">
                        <el-table
                                :data="countPersonList"
                                stripe
                                border
                                fit
                                style="width: 100%;"
                                highlight-current-row
                        >
<!--                            @current-change="handleCurrentChange"-->

                            <el-table-column type="index" width="50"/>
                            <el-table-column label="角色" align="center" prop="cole" />
                            <el-table-column label="工号" align="center" prop="coleNumber"/>
                            <el-table-column label="姓名" align="center" prop="coleName" />
                            <el-table-column label="部门" align="center" prop="coleDept" />
                            <el-table-column label="创建人" align="center" prop="createUserName" />
                        </el-table>
                    </div>
                    <div v-if="showCountDataList">
                        <el-table
                                :data="countDataList"
                                stripe
                                border
                                fit
                                style="width: 100%;"
                                highlight-current-row
                        >
<!--                            @current-change="handleCurrentChange"-->

                            <el-table-column type="index" width="50"/>
                            <el-table-column label="角色" align="center" prop="角色" />
                            <el-table-column label="表名称" align="center" prop="tableName"/>
                            <el-table-column label="表中文名称" align="center" prop="tableNameCn" />
                            <el-table-column label="筛选条件" align="center" prop="filter" />
                            <el-table-column label="创建人" align="center" prop="createUserName" />
                        </el-table>

                   <pagination
                            :page.sync="pageCountDataList.pageNo"
                            :limit.sync="pageCountDataList.pageSize"
                            @pagination="getCountDataList" />

                    </div>
                </template>
            </div>
        </el-dialog>
    </el-container>
  </div>
</template>
<script>
import { getById } from "@/api/data/permQuery";
import QueryField from "@/components/public/query-field/index";
export default {
  name: "index",
  data() {
    return {
      treeData: [
        {
          label: "一级 1",
          children: [
            {
              label: "二级 1-1",
              children: [
                {
                  label: "三级 1-1-1",
                },
              ],
            },
          ],
        },
        {
          label: "一级 2",
          children: [
            {
              label: "二级 2-1",
              children: [
                {
                  label: "三级 2-1-1",
                },
              ],
            },
            {
              label: "二级 2-2",
              children: [
                {
                  label: "三级 2-2-1",
                },
              ],
            },
          ],
        },
        {
          label: "一级 3",
          children: [
            {
              label: "二级 3-1",
              children: [
                {
                  label: "三级 3-1-1",
                },
              ],
            },
            {
              label: "二级 3-2",
              children: [
                {
                  label: "三级 3-2-1",
                },
              ],
            },
          ],
        },
      ],
      defaultProps: {
        children: "children",
        label: "label",
      },

      //查询条件
      queryFields: [
        {
          label: "角色名称",
          name: "coleName",
          type: "fuzzyText",
          value: "",
        },
        {
          label: "创建人",
          name: "auditItemName",
          type: "fuzzyText",
          value: "",
        },
        {
          label: "执行时间范围",
          name: "xxxx",
          type: "timePeriod",
          data: [],
          default: "-1",
        },
      ],
      personTable:[],
      dataTable:[],


      showPersonList:true,
      showDataList:false,
      // 导出弹框
      dialogExportVisible:false,
      // 统计弹框
      dialogCountVisible:false,
      showCountPersonList:true,
      showCountDataList:false,

      countPersonList:[],
      countDataList:[],
      //统计弹框数据清单分页
      pageCountDataList:{
        condition: null,
        pageNo: 1,
        pageSize: 10,
      },
        radio:'',


      // 被选中树节点的id
      treeId: "",

      ColeName: "",
      EffectTime: "",
      CreateUser: "",
      CreateTime: "",

      textWidth: 163,
      selectWidth: 163,
      timePeriodWidth: 220,


     
    };
  },
  computed: {
},
  components: {
    QueryField,
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      debugger
      console.log(document.getElementById("personId"))
      let id = "1";
      getById(id).then((res) => {
        console.log(res);
        this.treeData = res.data;
      });
    },
      showPersonListTable(){
        this.showPersonList=true,
        this.showDataList=false
      },
      showDataListTable(){
         this.showPersonList=false,
         this.showDataList=true
      },

      getList(){},
      // 导出按钮：
    showExportList(){
      this.dialogExportVisible=true,
      this.radio=1
    },
    // 统计按钮
    showCountList(){
      this.dialogCountVisible=true,
      this.dialogExportVisible=false
    },
      showCountPersonTable(){
        this.showCountPersonList=true,
        this.showCountDataList=false
      },
      showCountDataListTable(){
          this.showCountPersonList=false,
          this.showCountDataList=true
      },
    //  导出
    exportList(){
        if (this.selections.length == 0 || this.selections.length == undefined) {
            this.$confirm('未选择指定数据将导出全部?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            })
            //         .then(()=>{
            //         exportAllData()
            //         })
            // }
            // else{
            //     setPersonalSpaceSession(this.personalSpaceUuidList)
            //         .then((res)=>{
            //             if(res.msg == "成功"){
            //                 exportAllPersonalSpace()
            //             }
            //         })
            //  }
        }
    },



      // 统计弹框数据清单分页
    getCountDataList(){},




    handleNodeClick(id) {
      this.treeId = id;
    },
  },
};
</script>

<style scoped>
.containerTop {
  height: 18%;
  width: 100%;
  font-weight: bold;
  background: pink;
}
</style>
