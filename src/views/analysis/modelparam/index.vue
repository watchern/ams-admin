<!--<template>-->
<!--  &lt;!&ndash; index.vue是最外层的父页签组件，把firstParentTabCon.vue挂载进来作为第一个页签中的内容 &ndash;&gt;-->
<!--  <div>-->
<!--    <div class="app-container">-->
<!--      <div id="container">-->
<!--        <div-->
<!--          id="leftPart"-->
<!--          class="col-sm-2 leftCon"-->
<!--          style="overflow: auto; height: 100vh"-->
<!--        >-->
<!--          &lt;!&ndash; <myZtree></myZtree> &ndash;&gt;-->
<!--        </div>-->
<!--        <div id="rightPart" class="col-sm-10" style="height: 100vh">-->
<!--          <QueryField-->
<!--            ref="queryfield"-->
<!--            :form-data="queryFields"-->
<!--            @submit="getLikeList"-->
<!--          />-->
<!--          <el-dialog title="添加参数" :visible.sync="addVisible">-->
<!--            <addParamWindow />-->
<!--            <div slot="footer" class="dialog-footer">-->
<!--              <el-button @click="addVisible = false">取 消</el-button>-->
<!--              <el-button type="primary" @click="addVisible = false"-->
<!--                >确 定</el-button-->
<!--              >-->
<!--            </div>-->
<!--          </el-dialog>-->
<!--          <el-row>-->
<!--            <el-button type="primary" @click="addVisible = true"-->
<!--              >新增</el-button-->
<!--            >-->
<!--            <el-button type="primary">修改</el-button>-->
<!--            <el-button type="primary" @click="enableParam">启用</el-button>-->
<!--            <el-button type="primary" @click="disableParam">停用</el-button>-->
<!--            <el-button type="primary" @click="deleteParam">删除</el-button>-->
<!--          </el-row>-->
<!--          <el-table-->
<!--            id="table"-->
<!--            :key="tableKey"-->
<!--            v-loading="listLoading"-->
<!--            :data="list"-->
<!--            border-->
<!--            fit-->
<!--            highlight-current-row-->
<!--            @sort-change="sortChange"-->
<!--            @selection-change="handleSelectionChange"-->
<!--          >-->
<!--            <el-table-column type="selection" width="55" />-->
<!--            <el-table-column-->
<!--              label="参数名称"-->
<!--              width="500px"-->
<!--              align="center"-->
<!--              prop="paramName"-->
<!--            />-->
<!--            <el-table-column-->
<!--              label="数据类型"-->
<!--              width="200px"-->
<!--              align="center"-->
<!--              prop="dataType"-->
<!--              :formatter="readDataType"-->
<!--            />-->
<!--            <el-table-column-->
<!--              label="创建日期"-->
<!--              width="400px"-->
<!--              align="center"-->
<!--              prop="createTime"-->
<!--              :formatter="dateFormatter"-->
<!--            />-->
<!--            <el-table-column-->
<!--              label="创建人"-->
<!--              prop="createUserName"-->
<!--              align="center"-->
<!--              width="200px"-->
<!--            />-->
<!--            <el-table-column-->
<!--              label="参数状态"-->
<!--              width="200px"-->
<!--              align="center"-->
<!--              prop="enabled"-->
<!--              :formatter="readEnabled"-->
<!--            />-->
<!--          </el-table>-->
<!--          <pagination-->
<!--            v-show="total > 0"-->
<!--            :total="total"-->
<!--            :page.sync="pageQuery.pageNo"-->
<!--            :limit.sync="pageQuery.pageSize"-->
<!--            @pagination="getLikeList"-->
<!--          />-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->
<!--<script>-->
<!--import QueryField from "@/components/public/query-field/index";-->
<!--import Pagination from "@/components/Pagination/index";-->
<!--import myZtree from "@/views/analysis/modelparam/myztree";-->
<!--import addParamWindow from "@/views/analysis/modelparam/addparamwindow";-->
<!--import {-->
<!--  getListByAmmParam,-->
<!--  updateEnabled,-->
<!--  updateDisenable,-->
<!--  deleteParams-->
<!--} from "@/api/analysis/auditparam";-->
<!--export default {-->
<!--  components: {-->
<!--    myZtree,-->
<!--    Pagination,-->
<!--    QueryField,-->
<!--    addParamWindow,-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      tableKey: "errorUuid",-->
<!--      listLoading: false, //表格遮罩-->
<!--      pageQuery: {-->
<!--        condition: null,-->
<!--        pageNo: 1,-->
<!--        pageSize: 20,-->
<!--      },-->
<!--      total: 0,-->
<!--      list: null, //表格数据-->
<!--      queryFields: [-->
<!--        //界面最上边模糊查询所用数据-->
<!--        { label: "参数名称", name: "paramName", type: "fuzzyText" },-->
<!--        {-->
<!--          label: "数据类型",-->
<!--          name: "dataType",-->
<!--          type: "select",-->
<!--          data: [-->
<!--            { name: "请选择", value: "-1" },-->
<!--            { name: "数字", value: "num" },-->
<!--            { name: "日期时间", value: "date" },-->
<!--            { name: "文本", value: "str" },-->
<!--          ],-->
<!--          default: "-1",-->
<!--        },-->
<!--        {-->
<!--          label: "状态",-->
<!--          name: "enabled",-->
<!--          type: "select",-->
<!--          data: [-->
<!--            { name: "请选择", value: "-1" },-->
<!--            { name: "启用", value: "1" },-->
<!--            { name: "停用", value: "0" },-->
<!--            { name: "测试", value: "2" },-->
<!--          ],-->
<!--          default: "-1",-->
<!--        },-->
<!--      ],-->
<!--      selectedObj: [], //多选框选中的数据数组-->
<!--      selectedIds: [], //多选框选中的参数id数组-->
<!--      addVisible: false, //添加参数dialog是否可见-->
<!--    };-->
<!--  },-->
<!--  created() {-->
<!--    this.getLikeList();-->
<!--  },-->
<!--  methods: {-->
<!--    /**-->
<!--     * 格式化时间字符串-->
<!--     * @param row 行数据-->
<!--     * @param column 列数据-->
<!--     * @returns {string} 返回格式化后的字符串-->
<!--     */-->
<!--    dateFormatter(row, column) {-->
<!--      const datetime = row.createTime;-->
<!--      if (datetime) {-->
<!--        var dateMat = new Date(datetime);-->
<!--        var year = dateMat.getFullYear();-->
<!--        var month = dateMat.getMonth() + 1;-->
<!--        var day = dateMat.getDate();-->
<!--        var hh = dateMat.getHours();-->
<!--        var mm = dateMat.getMinutes();-->
<!--        var ss = dateMat.getSeconds();-->
<!--        var timeFormat =-->
<!--          year + "-" + month + "-" + day + " " + hh + ":" + mm + ":" + ss;-->
<!--        return timeFormat;-->
<!--      }-->
<!--      return "";-->
<!--    },-->
<!--    /**-->
<!--     * 当多选框改变时触发-->
<!--     */-->
<!--    handleSelectionChange(val) {-->
<!--      // 把选中的所有数据赋值给selected1，供后续方法使用-->
<!--      this.selectedObj = val;-->
<!--      var ids = [];-->
<!--      for (var i = 0; i < val.length; i++) {-->
<!--        ids.push(val[i].ammParamUuid);-->
<!--      }-->
<!--      this.selectedIds = ids;-->
<!--    },-->
<!--    sortChange(data) {-->
<!--      const { prop, order } = data;-->
<!--      this.pageQuery.sortBy = order;-->
<!--      this.pageQuery.sortName = prop;-->
<!--      this.handleFilter();-->
<!--    },-->
<!--    getLikeList(query) {-->
<!--      if (query == undefined) {-->
<!--        query = {};-->
<!--      }-->
<!--      this.listLoading = true;-->
<!--      this.pageQuery.condition = query;-->
<!--      getListByAmmParam(this.pageQuery).then((resp) => {-->
<!--        this.total = resp.data.total;-->
<!--        this.list = resp.data.records;-->
<!--        this.listLoading = false;-->
<!--      });-->
<!--    },-->
<!--    readEnabled(row, column) {-->
<!--      var status = row.enabled;-->
<!--      if (status == 0) {-->
<!--        return "停用";-->
<!--      } else if (status == 1) {-->
<!--        return "启用";-->
<!--      } else if (status == 2) {-->
<!--        return "测试";-->
<!--      }-->
<!--    },-->
<!--    readDataType(row, column) {-->
<!--      var status = row.dataType;-->
<!--      if (status == "str") {-->
<!--        return "文本";-->
<!--      } else if (status == "num") {-->
<!--        return "数字";-->
<!--      } else if (status == "date") {-->
<!--        return "日期时间";-->
<!--      }-->
<!--    },-->
<!--    /**-->
<!--     * 参数启用-->
<!--     */-->
<!--    enableParam() {-->
<!--      if (this.selectedIds.length == 0) {-->
<!--        alert("请选择后再进行启用");-->
<!--      } else {-->
<!--        updateEnabled(this.selectedIds.join(",")).then((resp) => {-->
<!--          if (resp.data == true) {-->
<!--            this.getLikeList();-->
<!--            this.$message({-->
<!--              type: "success",-->
<!--              message: "启用成功!",-->
<!--            });-->
<!--          } else {-->
<!--            this.$message({-->
<!--              type: "error",-->
<!--              message: "启用失败!",-->
<!--            });-->
<!--          }-->
<!--        });-->
<!--      }-->
<!--    },-->
<!--    /**-->
<!--     * 参数停用-->
<!--     */-->
<!--    disableParam() {-->
<!--      if (this.selectedIds.length == 0) {-->
<!--        alert("请选择后再进行停用");-->
<!--      } else {-->
<!--        updateDisenable(this.selectedIds.join(",")).then((resp) => {-->
<!--          if (resp.data == true) {-->
<!--            this.getLikeList();-->
<!--            this.$message({-->
<!--              type: "success",-->
<!--              message: "停用成功!",-->
<!--            });-->
<!--          } else {-->
<!--            this.$message({-->
<!--              type: "error",-->
<!--              message: "启用失败!",-->
<!--            });-->
<!--          }-->
<!--        });-->
<!--      }-->
<!--    },-->
<!--    /**-->
<!--     * 删除参数-->
<!--     */-->
<!--    deleteParam() {-->
<!--      if (this.selectedIds.length == 0) {-->
<!--        alert("请选择后再进行删除");-->
<!--      } else {-->
<!--        deleteParams(this.selectedIds.join(",")).then((resp) => {-->
<!--          if (resp.data == true) {-->
<!--            this.getLikeList();-->
<!--            this.$message({-->
<!--              type: "success",-->
<!--              message: "删除成功!",-->
<!--            });-->
<!--          } else {-->
<!--            this.$message({-->
<!--              type: "error",-->
<!--              message: "删除失败!",-->
<!--            });-->
<!--          }-->
<!--        });-->
<!--      }-->
<!--    },-->
<!--  },-->
<!--};-->
<!--</script>-->
