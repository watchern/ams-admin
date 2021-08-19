<template>
  <div v-loading="loading" class="page-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getListSelect"
      />
    </div>
    <el-row>
      <el-col align="right">
        <el-button
          type="primary"
          :disabled="selections.length === 0"
          class="oper-btn delete"
          @click="delData"
        />
        <el-button
          type="primary"
          class="oper-btn copy"
          :disabled="selections.length !== 1"
          @click="copyResource"
        />
        <el-button
          type="primary"
          class="oper-btn move"
          :disabled="selections.length === 0"
          @click="movePath"
        />
        <el-button
          type="primary"
          class="oper-btn rename"
          :disabled="selections.length !== 1"
          @click="renameResource"
        />
        <el-button
          type="primary"
          class="oper-btn add-table btn-width-md"
          :disabled="
            clickData.type == 'table' ||
            (typeof clickData.extMap !== 'undefined' && typeof clickData.extMap.sceneInstUuid !== 'undefined')
          "
          @click="addTable"
        />
        <el-button
          type="primary"
          class="oper-btn import-table btn-width-md"
          :disabled="
            clickData.type == 'table' ||
             (typeof clickData.extMap !== 'undefined' && typeof clickData.extMap.sceneInstUuid !== 'undefined')
          "
          @click="uploadTable"
        />
        <el-button
          type="primary"
          class="oper-btn add-directory btn-width-max"
          :disabled="clickData.type == 'table'"
          @click="createFolder"
        />
        <el-button
          type="primary"
          class="oper-btn edit"
          :disabled="selections.length !== 1"
          @click="updateTable"
        />
        <el-button
          type="primary"
          class="oper-btn link-table  btn-width-md"
          :disabled="selections.length !== 1"
          @click="relationTable"
        />
        <el-button
          type="primary"
          class="oper-btn detail"
          :disabled="selections.length !== 1"
          @click="showTable"
        />
        <!-- 预览数据 -->
        <el-button
          type="primary"
          class="oper-btn preview"
          :disabled="infoFlag"
          @click="preview"
        />
      <!--  分享 -->
        <el-button
          type="primary"
          class="oper-btn share"
          :disabled="selections.length === 0"
          @click="shareTable"
        />
      </el-col>
    </el-row>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="temp"
      border
      fit
      style="width: 100%; height: 500px; overflow: auto"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="名称" prop="label"/>
      <el-table-column label="中文名称" prop="title" />

      <el-table-column
        label="资源类型"
        :formatter="formatTableType"
        prop="type"
      />
      <el-table-column prop="createTime" label="创建时间" align="center" width="200">
        <template slot-scope="scope"
          >{{ formatCreateTime(scope.row.extMap.createTime) }}
        </template>
      </el-table-column>
      <!--<el-table-column prop="tbSizeByte" label="大小" align="center">
        <template slot-scope="scope"
          >{{ formatTableSize(scope.row.extMap.tbSizeByte) }}
        </template>
      </el-table-column>-->
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      @pagination="getListSelect"
    />
    <!-- 弹窗 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="textMap[dialogStatus]"
      :visible.sync="folderFormVisible"
      width="600px"
    >
      <el-form ref="folderForm" :model="resourceForm" label-width="80px">
        <el-form-item :label="typeLabel" label-width="120px">
          <el-input v-model="resourceForm.resourceName" style="width: 300px" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="folderFormVisible = false"
          >取消</el-button
        >
        <el-button
          v-if="dialogStatus === 'copyTable'"
          type="primary"
          @click="copyResourceSave()"
          @refresh-table="getListSelect"
          >保存</el-button
        >
        <el-button
          v-if="dialogStatus === 'createFolder'"
          type="primary"
          @click="createFolderSave()"
          >保存</el-button
        >
        <el-button
          v-if="
            dialogStatus === 'updateFolder' || dialogStatus === 'updateTable'
          "
          type="primary"
          @click="renameResourceSave()"
          >保存</el-button
        >
      </span>
    </el-dialog>
    <!-- 弹窗2 -->
    <el-dialog
      :visible.sync="moveTreeVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <dataTree
        style="overflow: auto; height: 62vh"
        v-if="personcode !== ''"
        ref="dataTree"
        :data-user-id="personcode"
        :scene-code="currentSceneUuid"
        :tree-type="treeType"
        @node-click="nodeclick"
      />
      <span slot="footer">
        <el-button @click="moveTreeVisible = false">取消</el-button>
        <el-button type="primary" @click="movePathSave()">保存</el-button>
      </span>
    </el-dialog>
    <!-- 弹窗3 -->
    <el-dialog
      :close-on-click-modal="false"
      v-if="uploadVisible"
      :visible.sync="uploadVisible"
      style="min-width: 1000px"
      width="80%"
      title="导入"
    >
      <el-row>
        <el-col>
          <directory-file-upload
            v-if="uploadStep === 1"
            @fileuploadname="fileuploadname"
          />
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-form
            v-if="uploadStep === 1"
            ref="dataForm"
            :rules="uploadRules"
            :model="uploadtemp"
            label-position="right"
            style="width: 750px"
          >
            <el-form-item
              label="导入表名称：(当导入数据为txt格式时，列名和数据均以','分割即可)"
              prop="tbName"
            >
              <el-input v-model="uploadtemp.tbName" label="请输入表名称" />
            </el-form-item>
            <el-form-item label="数据表描述" prop="tbComment">
              <el-input v-model="uploadtemp.tbComment" label="请输入表描述" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row
        v-loading="dialoading"
        element-loading-text="拼命导入中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
      >
        <el-col>
          <el-table
            v-if="uploadStep === 2"
            :data="uploadtempInfo.colMetas"
            height="500px"
            class="detail-form"
          >
            <el-table-column
              prop="colName"
              label="字段名称"
              show-overflow-tooltip
            >
              <template slot-scope="scope" show-overflow-tooltip>
                <el-form
                  style="width: 90%; height: 55px"
                  label-position="right"
                  :model="{ colName: scope.row.colName }"
                >
                  <el-form-item
                    prop="colName"
                    :rules="[
                      { required: true, message: '请输入字段名称' },
                      {
                        type: 'string',
                        pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                        message: '请输入合法字段名称',
                      },
                    ]"
                  >
                    <el-input v-model="scope.row.colName" />
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column
              prop="colComment"
              label="中文描述"
              show-overflow-tooltip
            >
              <template slot-scope="scope" show-overflow-tooltip>
                <el-input
                  v-model="scope.row.colComment"
                  style="width: 90%; height: 55px"
                />
              </template>
            </el-table-column>
            <el-table-column prop="dataType" label="数据类型">
              <template slot-scope="scope">
                <el-select
                  ref="dataType"
                  v-model="scope.row.dataType"
                  filterable
                  style="width: 90%; height: 55px"
                  @change="changeDataType(scope.row)"
                  placeholder="请选择数据类型"
                >
                  <el-option
                    v-for="item in options"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              prop="dataLength"
              label="数据长度"
              show-overflow-tooltip
            >
              <template slot-scope="scope" show-overflow-tooltip>
                <el-input
                  v-model="scope.row.dataLength"
                  style="width: 90%; height: 55px"
                  :disabled="!scope.row.enableDataLength"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <span slot="footer">
        <el-button v-if="uploadStep === 1" type="primary" @click="nextImport"
          >下一步</el-button
        >
        <el-button v-if="uploadStep === 2" type="primary" @click="importTable"
          >导入</el-button
        >
        <el-button type="primary" @click="uploadVisible = false"
          >关闭</el-button
        >
      </span>
    </el-dialog>
    <!-- 弹窗4 -->
    <el-dialog
      v-if="tableShowVisible"
      :visible.sync="tableShowVisible"
      width="80%"
      style="min-width: 1000px;"
      :close-on-click-modal="false"
      title="详情"
    >
      <el-row>
        <el-col>
          <tabledatatabs
            ref="tabledatatabs"
            :table-id="tableId"
            :forder-id="clickData.id"
            :open-type="openType"
            :tab-show.sync="tabShow"
            @table-show="tableshow"
          />
        </el-col>
      </el-row>
      <span slot="footer">
        <el-button type="primary" @click="tableShowVisible = false"
          >关闭</el-button
        >
      </span>
    </el-dialog>
    <!-- 弹窗5 -->
    <el-dialog
      v-if="tableColumnVisible"
      :visible.sync="tableColumnVisible"

      lock-scroll
      width="80%"
      style="min-width: 1000px"
      :close-on-click-modal="false"
    >
      <template>
        <div style="height: 62vh; overflow: auto">
          <el-button/>
          <el-row>
            <el-col>
              <column
                ref="column"
                :table-id="tableId"
                :forder-id="clickData.id"
                :open-type="openType"
                :tab-show.sync="tabShow"
                @append-node="appendnode"
                @table-show="tableshow"
                @saveTableInfoHelp="saveTableInfoHelp"
                @changeDataType="changeDataType"
                @isValidColumn="isValidColumn"
                class="detail-form"
              />
            </el-col>
          </el-row>
        </div>
        <span slot="footer">
          <el-button @click="tableColumnVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTableInfo">保存</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 弹窗6 -->
    <el-dialog
      v-if="tableRelationVisible"
      :visible.sync="tableRelationVisible"
      width="80%"
      style="min-width: 1000px"
      :close-on-click-modal="false"
    >
      <template>
        <div style="height: 62vh">
          <el-row>
            <el-col>
              <tablerelation
                ref="tablerelation"
                :table-id="tableId"
                :forder-id="clickData.id"
                :open-type="openType"
              />
            </el-col>
          </el-row>
        </div>
        <span slot="footer">
          <el-button @click="tableRelationVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTableRelation">保存</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 弹窗7 -->
    <!-- <el-dialog
        v-if="previewVisible"
        :visible.sync="previewVisible"
        width="80%"
        style="min-width: 1000px"
        :close-on-click-modal="false"
    >
      <el-row>
        <el-col>
          <childTabs
              ref="childTabs"
              :pre-value="executeSQLList"
              use-type="previewTable"
          />
        </el-col>
      </el-row>
      <span slot="footer">
        <el-button type="primary" @click="previewVisible = false"
        >关闭</el-button
        >
      </span>
    </el-dialog> -->
    <!-- 弹窗7 -->
    <el-dialog
      v-if="previewVisible"
      :visible.sync="previewVisible"
      width="80%"
      style="min-width: 1000px"
      :close-on-click-modal="false"
    >
      <el-row>
        <el-col>
          <childTabs
            ref="childTabs"
            :pre-value="executeSQLList"
            use-type="previewTable"
          />
        </el-col>
      </el-row>
      <span slot="footer">
        <el-button type="primary" @click="previewVisible = false"
          >关闭</el-button
        >
      </span>
    </el-dialog>
    <!-- 弹窗8 分享 -->
    <el-dialog
      :close-on-click-modal="false"
      v-if="shareVisible"
      :visible.sync="shareVisible"
      width="80%"
      style="min-width: 1000px"
    >
      <el-row>
        <el-col>
          <PersonTree ref="personTree" />
        </el-col>
      </el-row>
      <span slot="footer">
        <el-button @click="shareVisible = false">关闭</el-button>
        <el-button type="primary" @click="shareTableSave">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import PersonTree from "@/components/publicpersontree/index";
import column from "@/views/data/table/column";
import directoryFileUpload from "@/views/data/tableupload";
import { getSqlType } from "@/api/data/table-info";
import tabledatatabs from "@/views/data/table/tabledatatabs";
import tablerelation from "@/views/data/table/tablerelation";
import childTabs from "@/views/analysis/auditmodelresult/childtabs";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import QueryField from "@/components/public/query-field/index";
import { getArrLength } from "@/utils";
import {
  deleteDirectory,
  copyTable,
  renameResource,
  movePath,
  preview,
  nextUpload,
  importTable,
  shareTableSave,
  judgeName,
} from "@/api/data/directory";
import { saveFolder } from "@/api/data/folder";
import dataTree from "@/views/data/role-res/data-tree";
import { mapState } from "vuex";

export default {
  computed: {
    // 因为时序问题，store中没有personcode时组件可能被加载 导致dataUserId==''  所以要加personcode!=='' 控制
    // eslint-disable-next-line no-undef
    ...mapState({
      personcode: (state) => state.user.code,
    }),
  },
  // eslint-disable-next-line vue/order-in-components
  components: {
    Pagination,
    QueryField,
    dataTree,
    childTabs,
    tabledatatabs,
    directoryFileUpload,
    column,
    tablerelation,
    PersonTree,
  },
  // eslint-disable-next-line vue/require-prop-types
  props: ["dataUserId", "sceneCode"],
  // eslint-disable-next-line vue/order-in-components
  data() {
    return {
      saveFlag: true,
      infoFlag: true,
      currentSceneUuid: "auditor",
      directyDataUserId: this.$store.state.user.code,
      openType: "",
      // 移动树节点展示
      tableKey: "id",
      treeType: "save", // common:正常的权限树   save:用于保存数据的文件夹树
      tableId: "",
      typeLabel: "",
      list: null,
      executeSQLList: [],
      arrSql: {},
      data: null,
      node: null,
      tree: null,
      total: 0,
      listLoading: false,
      loading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [{ label: "名称", name: "label", type: "text", value: "" }],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: "asc",
        sortName: "create_time",
      },
      temp: [
        {
          id: "",
          label: "",
          title: "",
          type: "",
          extMap: {
            createTime: "",
            tbSizeByte: "",
          },
        },
      ],
      folderForm: {
        folderUuid: null,
        folderName: null,
        parentFolderUuid: null,
        orderNum: 0,
        fullPath: null,
      },
      clickData: { id: "", type: "" },
      clickNode: {},
      clickFullPath: [],
      allList: [],
      selections: [],
      // 要移动的数据集合
      moveSelect: [],
      resourceForm: {
        folderUuid: null,
        resourceName: null,
        parentFolderUuid: null,
        orderNum: 0,
        fullPath: null,
        extMap: {},
      },
      folderFormVisible: false,
      dialogStatus: "",
      tabShow: "",
      previewVisible: false,
      tableShowVisible: false,
      // 列信息弹窗
      tableColumnVisible: false,
      // 关联信息弹窗
      tableRelationVisible: false,
      // 移动表弹窗
      moveTreeVisible: false,
      // 选择人员窗口
      shareVisible: false,
      uploadVisible: false,
      uploadtemp: {
        tbName: "",
        tableFileName: "",
        folderUuid: "",
      },
      uploadRules: {
        tbName: [
          { required: true, message: "请填写导入表名称", trigger: "change" },
          {
            type: "string",
            pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
            message: "请填写合法导入表名称",
          },
        ],
      },
      // 导入步骤
      uploadStep: 1,
      uploadtempInfo: [],
      options: [],
      textMap: {
        updateFolder: "重命名文件夹",
        updateTable: "重命名表",
        copyTable: "复制表",
        createFolder: "新建文件夹",
      },
      downloadLoading: false,
      dialoading: false,
      clickId:'',
      dataTypeRules: {
      }
    };
  },
  created() {
    this.dataTypeRules = this.CommonUtil.DataTypeRules
    this.initDirectory();
  },
  watch: {
    uploadtempInfo: {
      handler(newTemp, oldemp) {
        // this.$emit('update:tab-show', newName)
        console.log("==================newTemp");
        if (typeof newTemp.colMetas != "undefined"){
          newTemp.colMetas.forEach((item) => {
            // if (!item.dataLengthText) {
            //   item.dataLengthText = item.dataLength + (item.colPrecision || item.colPrecision === 0 ? ',' + item.colPrecision : '');
            // }
            if (typeof item.dataLengthText == "undefined") {
              const dataTypeRule = this.dataTypeRules[item.dataType.toUpperCase().trim()]
              if (typeof dataTypeRule != "undefined" && typeof dataTypeRule.hasPrecision != "undefined") {
                if (dataTypeRule.hasPrecision) {
                  item.dataLengthText = item.dataLength + (item.colPrecision || item.colPrecision === 0 ? ',' + item.colPrecision : '')
                } else {
                  item.dataLengthText = item.dataLength
                }
              }
            }
          })
        }
      },
      deep: true
    }
  },
  methods: {
    changeDataType(row){
      const dataTypeRule = this.dataTypeRules[row.dataType.toUpperCase().trim()];
      row.enableDataLength = dataTypeRule && typeof dataTypeRule.enableDataLength !== "undefined" ? dataTypeRule.enableDataLength : true;
      if (this.CommonUtil.isUndefined(row.dataLengthText) && row.enableDataLength) {
        if (this.CommonUtil.isUndefined(dataTypeRule) && this.CommonUtil.isNotBlank(row.dataLength)) {
          if (typeof dataTypeRule.hasPrecision != "undefined" && dataTypeRule.hasPrecision) {
            row.dataLengthText = row.dataLength + (row.colPrecision || row.colPrecision === 0 ? ',' + row.colPrecision : '')
          } else {
            row.dataLengthText = row.dataLength
          }
        }
      } else if (typeof row.dataLength !== "undefined") {
        row.dataLength = "";
        row.colPrecision = "";
        row.dataLengthText = "";
      }
    },

    isValidColumn(row) {
      var currDataType = this.dataTypeRules[row.dataType.toUpperCase().trim()];

      var arr = typeof row.dataLengthText!= "undefined" ? row.dataLengthText.split(","):"";
      row.dataLength = arr.length > 0 ? arr[0].trim() : "";
      row.colPrecision = arr.length > 1 ? arr[1].trim() : "";

      if (currDataType && currDataType["lengthRule"]) {
        if (!new RegExp(this.dataTypeRules[currDataType.lengthRule]).test(row.dataLength)) {
          this.$message.error(row.dataType.toUpperCase() + currDataType["ruleMsg"]);
          return false;
      }
      }

      return true;
    },
    initDirectory() {
      if (typeof this.dataUserId !== "undefined") {
        this.directyDataUserId = this.dataUserId;
      }
      if (typeof this.sceneCode !== "undefined") {
        this.currentSceneUuid = this.sceneCode;
      }
    },
    fileuploadname(data) {
      this.uploadtemp.tableFileName = data
    },
    formatTableType(row) {
      if (row.type === "") {
        return "";
      }
      return row.type === "table" ? "数据表" : "文件夹";
    },
    // 删除资源
    delData() {
      var ids = [];
      var flag = true;
      this.selections.forEach((r, i) => {
        if (r.type === "folder") {
          if (r.extMap.folderType === "virtual") {
            this.$message({
              type: "info",
              message: "该文件为系统文件夹不允许删除!",
            });
            flag = false;
          }
          var foldObj = this.allList.filter((obj) => {
            return obj.label === r.label;
          });
          var objTotal = getArrLength(foldObj[0].children);
          if (objTotal > 0) {
            this.$message({
              type: "info",
              message:
                "删除失败！文件夹：" + foldObj[0].label + "不为空无法删除",
            });
            flag = false;
          }
        }
        ids.push(r);
      });
      if (flag) {
        this.$confirm("确定删除该资源?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true,
        }).then(() => {
          deleteDirectory(ids).then(() => {
            this.$notify({
              title: "成功",
              message: "删除成功",
              type: "success",
              duration: 5000,
              position: "bottom-right",
            });
            this.$emit("remove", this.selections, this.clickNode);
          });
        });
      }
    },
    // 复制资源(只允许复制数据表，不允许复制文件夹)
    copyResource() {
      if (this.selections[0].type === "folder") {
        this.$message({ type: "info", message: "所选资源为文件夹而非数据表!" });
        return;
      } else {

        this.dialogStatus = "copyTable";
        this.typeLabel = "复制表名称";
        this.resourceForm.resourceName = "";
        this.folderFormVisible = true;
      }
    },
    // 填写复制表名称后点击保存
    copyResourceSave() {
      var tempData = Object.assign({}, this.selections[0]);
      tempData.label = this.resourceForm.resourceName;
      this.$notify({
        title: "请稍后",
        message: "正在复制中..",
        type: "info",
        duration: 1500,
        position: "bottom-right",
      });
      copyTable(tempData).then((res) => {
        if (res.data) {
          this.$notify({
            title: "成功",
            message: "复制表成功",
            type: "success",
            duration: 2000,
            position: "bottom-right",
          });
          this.$emit("refresh",this.clickId);
          // this.getListSelect()
        } else {
          this.$message({
            type: "info",
            message: "复制失败!复制表名称已由现有对象使用",
          });
        }
      });
      this.resourceForm.resourceName = "";
      this.folderFormVisible = false;
      //手动清空temp，让用户重新选择
      this.temp = []
    },
    // 执行下一步 读取文件列信息
    nextImport() {
      judgeName(this.uploadtemp.tbName).then((resf) => {
        if (resf.code == 0) {
          this.uploadtemp.folderUuid = this.clickData.id;
          this.$refs["dataForm"].validate((valid) => {
            if (valid) {
              getSqlType().then((resp) => {
                this.options = resp.data;
                nextUpload(this.uploadtemp).then((res) => {
                  this.uploadStep = 2;
                  this.uploadtempInfo = res.data;
                  if (this.uploadtempInfo.colMetas.length >0 ){
                    for(let i=0;i<this.uploadtempInfo.colMetas.length;i++) {
                      this.changeDataType(this.uploadtempInfo.colMetas[i])
                    }
                  }
                });
              });
            }
          });
        } else {
          this.$message({
            type: "error",
            message: resf.msg,
          });
          return;
        }
      });
    },
    // 执行create后导入功能
    importTable() {
      // console.log(this.uploadtempInfo.colMetas);
      for (let i = 0; i < this.uploadtempInfo.colMetas.length; i++) {
        let obj = this.uploadtempInfo.colMetas[i];
        if (!this.isValidColumn(obj)) {
              return;
            }
      }
      this.dialoading = true;
      importTable(this.uploadtempInfo).then((res) => {
        this.dialoading = false;
        this.uploadVisible = false;
        if (res.data.resCode === true) {
          var childData = {
            id: res.data.importTable.tableMetaUuid,
            label: res.data.importTable.displayTbName,
            pid: res.data.importTable.folderUuid,
            type: "table",
            extMap: {
              accessType: ["FETCH_TABLE_DATA", "BASIC_PRIV"],
              createTime: res.data.importTable.createTime,
              tableName: res.data.importTable.tbName,
              tbSizeByte: 0,
              tblType: "T",
            },
          };
          // 添加节点
          this.$emit("append-node", childData, this.clickNode);
          this.$notify({
            title: "成功",
            message: res.data.msg,
            type: "success",
            duration: 5000,
            position: "bottom-right",
          });
        } else {
          this.$message({
            type: "error",
            message: res.data.msg,
          });
        }
      });
    },
    // 不允许重命名系统文件夹
    renameResource() {
      this.resourceForm.resourceName = "";
      if (this.selections[0].type === "folder") {
        if (this.selections[0].extMap.folderType === "virtual") {
          this.$message({
            type: "info",
            message: "重命名失败!该文件为系统文件夹不允许重命名",
          });
          return;
        }
        this.dialogStatus = "updateFolder";
        this.typeLabel = "重命名文件夹名称";
        this.folderFormVisible = true;
      } else {
        this.dialogStatus = "updateTable";
        this.typeLabel = "重命名数据表名称";
        this.folderFormVisible = true;
      }
    },
    // 移动资源
    nodeclick(data, node, tree) {
      var pathArr = [];
      var newNode = node.parent;
      while (newNode.parent != null) {
        pathArr.push(newNode.data.label);
        if (newNode.parent != null) {
          newNode = newNode.parent;
        }
      }
      this.moveSelect = data;
    },
    movePath() {
      var moveObj = this.selections.filter((obj) => {
        return obj.type === "folder";
      });
      var objTotal = getArrLength(moveObj);
      if (objTotal > 0) {
        this.$message({
          type: "info",
          message: "移动失败!移动文件夹操作不允许",
        });
        return;
      }
      this.moveTreeVisible = true;
    },
    movePathSave() {
      var ids = [];
      this.selections.forEach((r, i) => {
        r.pid = this.moveSelect.id;
        ids.push(r);
      });
      movePath(ids).then(() => {
        this.moveTreeVisible = false;
        this.$notify({
          title: "成功",
          message: "移动成功",
          type: "success",
          duration: 5000,
          position: "bottom-right",
        });
        this.$emit("refresh");
      });
    },
    // 重命名资源名称
    renameResourceSave() {
      var tempData = Object.assign({}, this.selections[0]);
      console.log(tempData);
      tempData.label = this.resourceForm.resourceName;
      renameResource(tempData).then((res) => {
        if (res.data) {
          this.$notify({
            title: "成功",
            message: "重命名资源成功",
            type: "success",
            duration: 2000,
            position: "bottom-right",
          });
          // 刷新数节点
          this.$emit("refresh",this.clickNode);
          if (this.dialogStatus === "updateTable") {
            this.selections[0].label = tempData.label;
          }
        } else {
          this.$message({
            type: "info",
            message: "重命名失败!重命名资源名称已由现有对象使用",
          });
        }
      });
      this.resourceForm.resourceName = "";
      this.folderFormVisible = false;
    },
    // 新增表
    addTable() {
      this.openType = "addTable";
      this.tableColumnVisible = true;
      this.tabShow = "column";
      this.tableId = "1";
    },
    // 上传表
    uploadTable() {
      this.uploadtemp = {};
      this.uploadtempInfo = [];
      this.uploadStep = 1;
      this.uploadVisible = true;
    },
    // 表结构维护
    updateTable() {
      this.openType = "updateTable";
      this.tableColumnVisible = true;
      this.tabShow = "column";
      this.tableId = this.selections[0].id;
    },
    // 表结构维护
    relationTable() {
      this.openType = "updateTable";
      this.tableRelationVisible = true;
      this.tabShow = "column";
      this.tableId = this.selections[0].id;

    },
    // 得到分页列表
    getListSelect(query) {
      console.log(query)
      if (query) {
        var list = this.allList.filter((obj) => {
          return obj.label.indexOf(query.label) !== -1;
        });
        this.total = getArrLength(list);
        this.temp = list;
      } else {
        this.temp = this.allList;
        this.total = getArrLength(this.temp);
      }
    },
    // 初始化列表页面
    getList(data, node, tree) {
      this.clickData = data;
      this.clickId = data.id;
      console.log(data);
      if(node=='pro'){
        console.log('复制刷新')
        node = this.clickNode
      }else{
        this.clickNode = node;
      }
      this.clickFullPath = [];
      this.clickFullPath.push(data.label);
      var newNode = node.parent;
      while (newNode.parent != null) {
        this.clickFullPath.push(newNode.data.label);
        if (newNode.parent != null) {
          newNode = newNode.parent;
        }
      }
      if (data.type === "table") {
        this.temp = [];
        this.allList = [];
        var tempObj = {};
        tempObj = data;
        this.temp.push(tempObj);
        this.allList.push(tempObj);
        // 父节点node
        this.total = 1;
      } else {
        this.temp = data.children;
        this.allList = data.children;
        // eslint-disable-next-line no-undef
        this.total = getArrLength(data.children);
        this.getListSelect();
      }
      console.log(this.temp)
    },
    createFolder() {
      if (this.clickData.extMap.folderType === "virtual") {
        this.$message({
          type: "info",
          message: "创建失败!该文件为系统文件夹不允许创建",
        });
        return;
      }
      this.dialogStatus = "createFolder";
      this.typeLabel = "新建文件夹名称";
      this.resourceForm.resourceName = "";
      this.folderFormVisible = true;
    },
    // 保存新建文件夹
    createFolderSave() {
      if ( typeof this.clickData.extMap !== 'undefined' && typeof this.clickData.extMap.sceneInstUuid !== 'undefined') {
        this.resourceForm.sceneInstUuid = this.clickData.extMap.sceneInstUuid;
      }
      this.resourceForm.parentFolderUuid = this.clickData.id;
      this.resourceForm.fullPath = this.clickFullPath.reverse().join("/");
      this.resourceForm.folderName = this.resourceForm.resourceName;
      this.resourceForm.createUserUuid = this.$store.state.user.code;
      saveFolder(this.resourceForm).then((resp) => {
        var childData = {
          id: resp.data,
          label: this.resourceForm.folderName,
          pid: this.resourceForm.parentFolderUuid,
          type: "folder",
          extMap: {
            folder_type: "maintained",
          },
        };
        // 添加节点
        this.$emit("append-node", childData, this.clickNode);
        this.$notify({
          title: "成功",
          message: "新建成功",
          type: "success",
          duration: 3000,
          position: "bottom-right",
        });
        this.folderFormVisible = false;
      });
    },
    // 预览表结构
    showTable() {
      if (this.selections[0].type === "folder") {
        this.$message({ type: "info", message: "请选择数据表进行查看!" });
      } else {
        this.openType = "showTable";
        this.tableShowVisible = true;
        this.tabShow = "basicinfo";
        this.tableId = this.selections[0].id;
      }
    },
    // 预览数据
    preview() {
      this.loading = true;
      preview(this.selections[0]).then((res) => {
        if (res.data.code === 200) {
          this.executeSQLList = res.data.executeTask.executeSQL;
          this.arrSql = res.data;
          this.previewVisible = true;
          this.$nextTick(() => {
            this.$refs.childTabs.loadTableData(this.arrSql);
            this.loading = false;
          });
        } else {
          this.loading = false;
          this.$message({ type: "info", message: res.data.msg });
        }
      });
    },
    // 分享表
    shareTable() {
      var flag = true;
      this.selections.forEach((r, i) => {
        if (r.type === "folder") {
          this.$message({ type: "info", message: "无法分享文件夹!" });
          flag = false;
          return;
        }
      });
      if (flag) {
        this.shareVisible = true;
      }
    },
    shareTableSave() {
      // 获取选中的人员
      // 循环组织对象添加数据
      var userId = this.$store.getters.personuuid;
      const tableShareRelList = [];
      var verResult = true;
      var selectObj = this.selections;
      const persons = this.$refs.personTree.getSelectValue();
      for (let i = 0; i < selectObj.length; i++) {
        for (let j = 0; j < persons.length; j++) {
          if (persons[j].personuuid === userId) {
            verResult = false;
            break;
          }
          console.log(persons);
          const obj = {
            tableMetaUuid: selectObj[i].id,
            seneInstUuid: persons[j].personcode,
            folderName: persons[j].cnname,
          };
          tableShareRelList.push(obj);
        }
      }
      if (!verResult) {
        this.$message({ type: "info", message: "不能共享给自己!" });
        return;
      }
      shareTableSave(tableShareRelList).then((result) => {
        if (result.code === 0) {
          this.$notify({
            title: "提示",
            message: "共享成功",
            type: "success",
            duration: 2000,
            position: "bottom-right",
          });
          this.shareVisible = false;
        } else {
          this.$message({ type: "error", message: "共享模型失败!" });
        }
      });
    },
    sortChange(data) {
      const { prop, order } = data;
      this.pageQuery.sortBy = order;
      this.pageQuery.sortName = prop;
      this.handleFilter();
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleSelectionChange(val) {
      this.selections = val;
      var objTotal = getArrLength(this.selections);
      if (objTotal === 1) {
        if (
          this.selections[0].extMap.accessType.indexOf("SAVE_TO_FOLDER") > -1
        ) {
          this.saveFlag = false;
        } else {
          this.saveFlag = true;
        }
        if (
          this.selections[0].extMap.accessType.indexOf("FETCH_TABLE_DATA") > -1
        ) {
          this.infoFlag = false;
        } else {
          this.infoFlag = true;
        }
      } else {
        this.saveFlag = true;
        this.infoFlag = true;
      }
    },
    appendnode(childData, parentNode) {
      this.$emit("append-node", childData, this.clickNode);
    },
    tableshow(show) {
      this.tableShowVisible = show;
    },
    getSortClass: function (key) {
      const sort = this.pageQuery.sort;
      return sort === `+${key}` ? "asc" : "desc";
    },
    saveTableInfo() {
      this.$refs.column.saveTableInfo();
    },
    saveTableInfoHelp() {
      this.tableColumnVisible = false;
    },
    saveRelationInfo() {
      this.$refs.tablerelation.saveRelationInfo();
      this.tableRelationVisible = false;
    },
    saveTableRelation() {
      this.$refs.tablerelation.saveTableRelation();
      this.tableRelationVisible = false;
    },
    // 将字节数转换成大小
    formatTableSize(limit) {
      if (limit === "") {
        return "";
      }
      if (limit === undefined) {
        limit = 0;
      }
      var size = "";
      if (limit < 1 * 1024) {
        // 小于1KB，则转化成B
        size = parseFloat(limit).toFixed(2) + "B";
      } else if (limit < 1 * 1024 * 1024) {
        // 小于1MB，则转化成KB
        size = (limit / 1024).toFixed(2) + "KB";
      } else if (limit < 1 * 1024 * 1024 * 1024) {
        // 小于1GB，则转化成MB
        size = (limit / (1024 * 1024)).toFixed(2) + "MB";
      } else {
        // 其他转化成GB
        size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
      }
      var sizeStr = size + ""; // 转成字符串
      var index = sizeStr.indexOf("."); // 获取小数点处的索引
      var dou = sizeStr.substr(index + 1, 2); // 获取小数点后两位的值
      if (dou === "00") {
        // 判断后两位是否为00，如果是则删除00
        return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2);
      }
      return size;
    },
    formatCreateTime(createTime) {
      // 拼接日期规格为YYYY-MM-DD hh:mm:ss
      if (createTime) {
        var date = new Date(createTime);
        var Y = date.getFullYear();
        var M = date.getMonth() + 1;
        var D = date.getDate();
        var HH = date.getHours();
        var MM = date.getMinutes();
        var SS = date.getSeconds();
        if (M < 10) {
          M = "0" + M;
        }
        if (D < 10) {
          D = "0" + D;
        }
        if (HH < 10) {
          HH = "0" + HH;
        }
        if (MM < 10) {
          MM = "0" + MM;
        }
        if (SS < 10) {
          SS = "0" + SS;
        }
        return Y + "-" + M + "-" + D + " " + HH + ":" + MM + ":" + SS;
      } else {
        return "";
      }
    },
  },
};
</script>
