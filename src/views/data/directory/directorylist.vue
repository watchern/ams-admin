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
      <!-- !onlyImport 展示全部按钮 -->
      <el-col align="right" v-if="!onlyImport">
        <el-button
          type="primary"
          :disabled="disDeleteTable"
          class="oper-btn delete"
          @click="delData"
        />
        <el-button
          type="primary"
          class="oper-btn copy"
          :disabled="disCopyTable"
          @click="copyResource"
        />
        <el-button
          type="primary"
          class="oper-btn move"
          :disabled="disMoveTable"
          @click="movePath"
        />
        <el-button
          type="primary"
          class="oper-btn rename btn-width-md"
          :disabled="disRenameTable"
          @click="renameResource"
        />
        <el-button
          type="primary"
          class="oper-btn add-table btn-width-md"
          :disabled="disAddTable"
          @click="addTable"
        />
        <el-button
          type="primary"
          class="oper-btn import-table btn-width-md"
          :disabled="disAddTable"
          @click="uploadTable"
        />
        <el-button
          type="primary"
          class="oper-btn add-directory btn-width-max"
          :disabled="disAddDir"
          @click="createFolder"
        />
        <el-button
          type="primary"
          class="oper-btn edit"
          :disabled="disEditTable"
          @click="updateTable"
        />
        <el-button
          type="primary"
          class="oper-btn link-table  btn-width-md"
          :disabled="disLinkData"
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
          :disabled="disPreviewData"
          @click="preview"
        />
      <!--  分享 -->
        <el-button
          type="primary"
          class="oper-btn share"
          :disabled="disShareTable"
          @click="shareTable"
        />
      </el-col>
      <el-col align="right" v-else>
        <el-button
            type="primary"
            class="oper-btn import-table btn-width-md"
            :disabled="disAddTable"
            @click="uploadTable"
        />
      </el-col>
    </el-row>
    <el-table
      :key="tableKey"
      ref="directoryListTable"
      v-loading="listLoading"
      :data="temp"
      border
      fit
      style="
        width: 100%;
        min-height: 300px;
        max-height: calc(100% - 100px);
        overflow: auto;
      "
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
      </el-table-column> -->
    </el-table>
<!--    :page.sync="pageQuery.pageNo"-->
<!--    :limit.sync="pageQuery.pageSize"-->
<!--    <pagination-->
<!--      v-show="total > 0"-->
<!--      :total="total"-->
<!--      @pagination="getListSelect"-->
<!--    />-->
    <div class="pagesize">共 {{total}} 条</div>
    <el-dialog
      :close-on-click-modal="false"
      :title="textMap[dialogStatus]"
      :visible.sync="folderFormVisible"
      width="600px"

    >
      <!-- 复制表输入框 -->
      <el-form ref="folderForm" :model="resourceForm" :rules="uploadRules" v-if="dialogStatus === 'copyTable' || dialogStatus === 'updateFolder' || dialogStatus === 'updateTable'">
        <el-form-item :label="typeLabel" prop="displayTbName">
          <el-input
            v-model="resourceForm.displayTbName"
            style="width: 100%"
            class="detail-form"
          />
        </el-form-item>
      </el-form>
      <!-- 新增文件夾输入框 -->
      <el-form ref="folderForm" :model="resourceForm" :rules="uploadRules" v-if="dialogStatus === 'createFolder'">
        <el-form-item :label="typeLabel" prop="resourceName">
          <el-input v-model="resourceForm.resourceName" style="width: 100%" class="detail-form"/>
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
    <!-- 移动表 -->
    <el-dialog
      :visible.sync="moveTreeVisible"
      width="600px"
      :close-on-click-modal="false"
      title="移动"
    >
      <dataTree
        style="overflow: auto; height: 62vh"
        v-if="personcode !== ''"
        ref="dataTree"
        :data-user-id="personcode"
        :scene-code="currentSceneUuid"
        tree-type="move"
        @node-click="nodeclick"
      />
      <span slot="footer">
        <el-button @click="moveTreeVisible = false">取消</el-button>
        <el-button type="primary" @click="movePathSave()">保存</el-button>
      </span>
    </el-dialog>
    <!-- 导入表数据 -->
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
          >
            <el-form-item
              label="导入表名称：(当导入数据为txt格式时，列名和数据均以','分割即可)"
              prop="displayTbName"
            >
              <el-input v-model="uploadtemp.displayTbName" label="请输入表名称" class="detail-form" />
            </el-form-item>
            <el-form-item label="数据表描述" prop="tbComment">
              <el-input v-model="uploadtemp.tbComment" label="请输入表描述" class="detail-form"/>
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
                        pattern: /^[\D][\u4E00-\u9FA5\w]{0}[\u4E00-\u9FA5\w]*$/,
                        message: '请输入合法字段名称',
                      },{
                        type: 'string',
                        pattern: /^[\u4E00-\u9FA5\w]*$/,
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
              prop="dataLengthText"
              label="数据长度（精度）"
              show-overflow-tooltip
            >
              <template slot-scope="scope" show-overflow-tooltip>
                <el-input
                  v-model="scope.row.dataLengthText"
                  style="width: 90%; height: 55px"
                  :disabled="!scope.row.enableDataLength"
                  @change="isValidColumn(scope.row)"
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
            :forder-id="currTreeNode.id"
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
                :forder-id="currTreeNode.id"
                :open-type="openType"
                :tab-show.sync="tabShow"
                :get-tree="getTree"
                @append-node="appendnode"
                @table-show="tableshow"
                @saveTableInfoHelp="saveTableInfoHelp"
                @changeDataType="changeDataType"
                @isValidColumn="isValidColumn"
                @get-list="getList"
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
    <!-- 关联表弹窗 -->
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
                :forder-id="currTreeNode.id"
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
      title="分享"
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
import { getInfo } from '@/api/user';
import { getSystemRole} from '@/api/user';
// import { getById } from '@TCB/api/tcbaudit/personalManage';

export default {
  computed: {
    // 因为时序问题，store中没有personcode时组件可能被加载 导致dataUserId==''  所以要加personcode!=='' 控制
    // eslint-disable-next-line no-undef
    ...mapState({
      personcode: (state) => state.user.datauserid,
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
      // tree相关属性
      getTree: {
        tree: null,
        data: null,
        node: null
      },
      ifManager:false, //是否为管理员
      currentSceneUuid: "auditor",
      directyDataUserId: this.$store.state.user.code,
      openType: "",
      // 移动树节点展示
      /*tableKey: "id",*/
      tableKey: true,
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
        // {
        //   id: "",
        //   label: "",
        //   title: "",
        //   type: "",
        //   extMap: {
        //     createTime: "",
        //     tbSizeByte: "",
        //   },
        // },
      ],
      folderForm: {
        folderUuid: null,
        folderName: null,
        parentFolderUuid: null,
        orderNum: 0,
        fullPath: null,
      },
      // 树节点click
      currTreeNode: { id: "", type: "" },
      clickNode: {},
      clickFullPath: [],
      allList: [],
      selections: [],
      // 要移动的数据集合
      moveSelect: [],
      resourceForm: {
        displayTbName:null,
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
        displayTbName: "",
        tableFileName: "",
        folderUuid: "",
      },
      uploadRules: {
        displayTbName: [
          { required: true, message: "请填写表名称", trigger: "change" },
          {
            type: 'string',
            pattern: /^[\D][\u4E00-\u9FA5\w]{0}[\u4E00-\u9FA5\w]*$/,
            message: '请输入合法表名称',
          },{
            type: 'string',
            pattern: /^[\u4E00-\u9FA5\w]*$/,
            message: '请输入合法表名称',
          },
        ],
        resourceName: [
          {
            required: true,
            message: "请填写新增文件夹名称",
            trigger: "change",
          },
          {
            type: "string",
            pattern: /^[\D][\u4E00-\u9FA5\w]{0}[\u4E00-\u9FA5\w]*$/,
            message: "请输入合法文件夹名称",
          },
          {
            type: "string",
            pattern: /^[\u4E00-\u9FA5\w]*$/,
            message: "请输入合法文件夹名称",
          },
        ],
      } ,
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
      saveFlag: true,
      disableEditColumn: false,
      // 禁用添加文件夹，个人空间，判断根节点有没有sceneInstUuid
      disAddDir: true,
      // 禁用新增表，个人场景，或者save_to_folder
      disAddTable : true,
      // 禁用编辑表，个人场景
      disEditTable: true,
      // 禁用删除表,个人空间下
      disDeleteTable: true,
      // 禁用重命名表, 只能重命名个人空间下，
      disRenameTable: true,
      // 禁用移动表, 只能移动到个人空间下
      disMoveTable: true,
      // 禁用导入表，个人场景，或者save_to_folder
      disImportTable: true,
      // 禁用复制表, fetch_table_data，复制到个人场景，或者save_to_folder
      disCopyTable: true,
      // 禁用预览表数据，fetch_table_data
      disPreviewData: true,
      // 禁用管理表，个人场景
      disLinkData: true,
      // 禁用分享表,个人场景
      disShareTable: true,
      //复制表websocket对象
      webSocketCopy: null,
      //导入表websocket对象
      webSocketImport: null,
      onlyImport:false
    };
  },
  created() {
    // 路由中如果包含import=1,则只展示导入文件，否则展示全部按钮
    if(this.$route.query.import){
      this.$route.query.import == 1?this.onlyImport=true:this.onlyImport=false
    }
    // this.dataTypeRules = this.CommonUtil.DataTypeRules
    this.initDirectory();
    // //获取登录用户的信息来控制删除按钮是否显示
    // getInfo().then((resp) => {
    //   getById(resp.data.id).then((res) => {
    //     const dataArray = res.data;
    //     const newArray = dataArray[0].roleId;
    //     const sysRole = "系统管理员";
    //     getSystemRole(sysRole).then((re) => {
    //       for( const item in newArray){
    //         if(newArray[item] == re.data.roleid ){
    //           this.ifManager = true;
    //         }
    //       }
    //     })
    //   })
    // })
  },
  watch: {
    openType: {
      handler(newOpenType) {
        this.disableEditColumn = false
        this.disableEditColumn = newOpenType === 'showTable' || newOpenType === 'tableRegister'
      }
    },
    selections: {
      handler(newObj, oldObj) {
        console.log("**************selections");
        console.log(newObj);
        console.log("**************selections");

        this.disDeleteTable = newObj.length > 0 ? false : true;
        this.disEditTable = newObj.length == 1 ? false : true;
        this.disLinkData = newObj.length == 1 ? false : true;
        this.disMoveTable = newObj.length > 0 ? false : true;
        this.disPreviewData = newObj.length == 1 ? false : true;
        this.disRenameTable = newObj.length == 1 ? false : true;
        this.disShareTable = newObj.length > 0 ? false : true;
        this.disCopyTable = newObj.length == 1 ? false : true;
        if (newObj.length > 0) {
          for(var i; i<newObj.length; i++) {
            // 如果全部禁用，无须校验操作权限
            if (this.disDeleteTable && this.disEditTable && this.disLinkData && this.disMoveTable
                && this.disPreviewData && this.disPreviewData && this.disRenameTable && this.disShareTable) {
              break;
            }
            var item = newObj[i];
            var accessType = item.extMap.accessType;
            // 判断是否拥有预览权限
            if (!this.disPreviewData && accessType.indexOf(this.CommonUtil.DataPrivAccessType.FETCH_TABLE_DATA.value) < 0) {
              this.disPreviewData = false
            }
            var paths = item.path.split("/");
            var isPersonalSpace = paths[0].indexOf("场景") > -1;
            // 判断 数据权限
            if (accessType.indexOf(this.CommonUtil.DataPrivAccessType.SAVE_TO_FOLDER.value) > 0) {
              this.disDeleteTable = true
              this.disEditTable = true
              this.disLinkData = true
              this.disMoveTable = true
              this.disRenameTable = true
              if (!this.disShareTable && !isPersonalSpace) {
                this.disShareTable = true
              }
            } else {
              if (!isPersonalSpace) {
                this.disDeleteTable = true
                this.disEditTable = true
                this.disLinkData = true
                this.disMoveTable = true
                this.disRenameTable = true
                this.disShareTable = true
              }
            }
            }
          }
        }
    },
    currTreeNode(){
      console.log("**************currTreeNode");
      console.log(this.currTreeNode);
      console.log("**************currTreeNode");
      var type = this.currTreeNode.type;
      // var accessType = this.currTreeNode.extMap.accessType;
      // 个人空间，判断根节点有没有sceneInstUuid
      //在分享数据、模型结果、图形化临时结果文件夹（"shareFolder","modelFolder","graphFolder"）禁用新增表，导入表，新增文件夹操作
      var id = this.currTreeNode.id;
      this.disAddDir = type === "folder" &&  id != "shareFolder" && id != "modelFolder" && id != "graphFolder" ? false : true;
      this.disImportTable = type === "folder" &&  id != "shareFolder" && id != "modelFolder" && id != "graphFolder" ? false : true;
      this.disAddTable = type === "folder" &&  id != "shareFolder" && id != "modelFolder" && id != "graphFolder" ? false : true;
      this.disCopyTable =  this.selections.length == 1 ? false : true;
      this.disDeleteTable = this.selections.length > 0 ? this.disDeleteTable : true;
      this.disEditTable = this.selections.length == 1 ? this.disEditTable : true;
      this.disLinkData = this.selections.length == 1 ? this.disLinkData : true;
      this.disMoveTable = this.selections.length > 0 ? this.disMoveTable : true;
      this.disPreviewData = this.selections.length == 1 ? this.disPreviewData : true;
      this.disRenameTable = this.selections.length == 1 ? this.disRenameTable : true;
      this.disShareTable = this.selections.length > 0 ? this.disShareTable : true;

      //新增表，导入表，新增文件夹需要有写入权限
      var accessType = this.currTreeNode.extMap.accessType.indexOf("SAVE_TO_FOLDER");
      //下标小于0，表示不存在，没有 新增表，导入表，新增文件夹 三个权限，禁用对应按钮
      if(accessType<0){
        this.disAddDir = true;
        this.disImportTable = true;
        this.disAddTable = true;
      }
    }
  },
  methods: {
    changeDataType(row){
      const currRule = this.CommonUtil.DataTypeRules[row.dataType.toUpperCase().trim()];
      if (!this.disableEditColumn) {
        this.$set(row, "enableDataLength", currRule && this.CommonUtil.isNotUndefined(currRule.enableDataLength) ? currRule.enableDataLength : true);
      } else {
        this.$set(row, "enableDataLength", false);
      }
      if (this.CommonUtil.isNotUndefined(currRule.enableDataLength) && !currRule.enableDataLength) {
        this.$set(row, "dataLengthText", "");
      }

    },
    isValidColumn(row) {
      var currDataType = this.CommonUtil.DataTypeRules[row.dataType.toUpperCase().trim()];
      if (this.CommonUtil.isNotUndefined(currDataType) && this.CommonUtil.isNotUndefined(currDataType.lengthRule)) {
        if (!new RegExp(currDataType.lengthRule).test(row.dataLengthText)) {
          this.$message.error(row.dataType.toUpperCase() + currDataType["checkMsg"]);
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
      // 导入表 WebSocket 建立与服务端的连接
      const webSocketPathImport =
              this.AmsWebsocket.getWSBaseUrl(this.AmsModules.DATA) +
              this.$store.getters.personcode +
              "importTable";
      this.webSocketImport = new WebSocket(webSocketPathImport);
      this.webSocketImport.onopen =  function (event) {
        console.log("导入表websocket连接成功");
      };
      // 复制表 WebSocket 建立与服务端的连接
      const webSocketPathCopy =
              this.AmsWebsocket.getWSBaseUrl(this.AmsModules.DATA) +
              this.$store.getters.personcode +
              "copyTable";
      this.webSocketCopy = new WebSocket(webSocketPathCopy);
      this.webSocketCopy.onopen =  function (event) {
        console.log("复制表websocket连接成功");
      };
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
              duration: 2000,
              position: "bottom-right",
            });
            // this.$emit("remove", this.selections, this.clickNode);
            this.$emit("refresh", this.clickId);
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
        this.resourceForm.displayTbName = "";
        this.folderFormVisible = true;
      }
    },
    // 填写复制表名称后点击保存
    copyResourceSave() {
      if (
        !(
          /^[\D][\u4E00-\u9FA5\w]{0}[\u4E00-\u9FA5\w]*$/.test(
            this.resourceForm.displayTbName
          ) && /^[\u4E00-\u9FA5\w]*$/.test(this.resourceForm.displayTbName)
        )
      ) {
        this.$message({
          type: "info",
          message: "请填写正确的表名！",
        });
        return;
      }
      var tempData = Object.assign({}, this.selections[0]);
      tempData.label = this.resourceForm.displayTbName;
      this.$notify({
        title: "请稍后",
        message: "正在复制中..",
        type: "info",
        duration: 1500,
        position: "bottom-right",
      });
      //调用复制表方法
      copyTable(tempData);
        // 发送消息
      let _this = this;
        this.webSocketCopy.onmessage = function (res) {
          if("true" == res){
            _this.$notify({
              title: "成功",
              message: "复制表成功",
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
            _this.$emit("refresh", _this.clickId);
          }else{
            _this.$message.error('复制表失败！');
          }
        };

      // 通信失败
      this.webSocketCopy.onerror = function (event) {
          _this.$message({
          type: "error",
          message: "通信失败！请联系管理员！",
          });
      };
      //关闭连接
      this.webSocketCopy.onclose = function (event) {
        console.log("复制表WebSocket已关闭连接")
      };
      this.resourceForm.displayTbName = "";
      this.folderFormVisible = false;
      //手动清空temp，让用户重新选择
      this.temp = []
    },
    // 执行下一步 读取文件列信息
    nextImport() {
      judgeName(this.uploadtemp.displayTbName).then((resf) => {
        if (resf.code == 0) {
          this.uploadtemp.folderUuid = this.currTreeNode.id;
          this.$refs["dataForm"].validate((valid) => {
            if (valid) {
              getSqlType().then((resp) => {
                this.options = resp.data;
                nextUpload(this.uploadtemp).then((res) => {
                  this.uploadStep = 2;
                  this.uploadtempInfo = res.data;
                  if (this.uploadtempInfo.colMetas.length >0 ){
                    for(let i=0;i<this.uploadtempInfo.colMetas.length;i++) {
                      //设置默认数据类型长度为255
                      this.uploadtempInfo.colMetas[i].dataLengthText = 255;
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
      for (let i = 0; i < this.uploadtempInfo.colMetas.length; i++) {
        let obj = this.uploadtempInfo.colMetas[i];
        //先判空
        var a =this.judegeTable(obj.colName)
        if(this.CommonUtil.isBlank(obj.colName)){
          this.$message.error("请完善建表信息，字段名称不能为空");
          return
        }else if(this.CommonUtil.isBlank(obj.dataType)){
          this.$message.error("请完善建表信息，数据类型不能为空");
          return
        } if (!a){
          this.$message.error("请完善建表信息，字段名称不能有特殊符号");
          return
        }
        //再判合法
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
              tableName: res.data.importTable.displayTbName,
              tbSizeByte: 0,
              tblType: "T",
            },
          };
          // 添加节点
          this.$emit("append-node", childData, this.currTreeNode);
          this.$emit("refresh", this.clickId);
          this.$notify({
            title: "成功",
            message: "表创建成功，正在导入中...",
            type: "info",
            duration: 2000,
            position: "bottom-right",
          });
        } else {
          this.$message({
            type: "error",
            message: "表创建失败",
          });
        }
      })
      let _this = this;
      this.webSocketImport.onmessage = function (event) {
        const res = JSON.parse(event.data);
        if (res.isSuccess === true) {
          _this.$notify({
            title: "成功",
            message: res.result,
            type: "success",
            duration: 2000,
            position: "bottom-right",
          });
        }else{
          _this.$message({
            type: "error",
            message: res.result,
          });
        }
      };
      // 通信失败
      this.webSocketImport.onerror = function (event) {
        _this.$message({
          type: "error",
          message: "通信失败！请联系管理员！",
        });
      };
      //关闭连接
      this.webSocketImport.onclose = function (event) {
        console.log("导入表WebSocket已关闭连接")
      };


    },
    judegeTable(val){
      const judege=(/^[\D][\u4E00-\u9FA5\w]{0}[\u4E00-\u9FA5\w]*$/ && /^[\u4E00-\u9FA5\w]*$/)
      if (judege.test(val)){
        return true;
      }else{
        return false;
      }
    },
    // 不允许重命名系统文件夹
    renameResource() {
      this.resourceForm.displayTbName = "";
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
      // this.$emit("nodeclick",data, node, tree)
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
          duration: 2000,
          position: "bottom-right",
        });
        this.$emit("refresh");
      });
    },
    //现在右侧只显示表，排除对文件夹的提示信息
    // 重命名资源名称
    renameResourceSave() {
      if (
              !(
                      /^[\D][\u4E00-\u9FA5\w]{0}[\u4E00-\u9FA5\w]*$/.test(
            this.resourceForm.displayTbName
          ) && /^[\u4E00-\u9FA5\w]*$/.test(this.resourceForm.displayTbName)
              )
      ) {
        this.$message({
          type: "info",
          message: "请填写正确的表名！",
        });
        return;
      }
      var tempData = Object.assign({}, this.selections[0]);
      tempData.label = this.resourceForm.displayTbName;
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
      this.resourceForm.displayTbName = "";
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
      if (this.selections[0].type === "folder") {
        this.$message({ type: "info", message: "编辑失败!编辑文件夹操作不允许"});
        return;
      } else {
      this.openType = "updateTable";
      this.tableColumnVisible = true;
      this.tabShow = "column";
      this.tableId = this.selections[0].id;
      }
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
      if (query) {
        var list = this.allList.filter((obj) => {
          if (query.label === null) query.label=""
          return obj.label.indexOf(query.label) !== -1;
        });
        this.total = getArrLength(list);
        this.temp = list;
      } else {
        this.temp = this.allList;
        this.total = getArrLength(this.temp);
      }
      // 默认选中点击文件夹下第一个表
      let _this = this
      setTimeout(function(){
        _this.$refs.directoryListTable.selection.push(_this.temp[0])
        _this.selections.push(_this.temp[0])
      },200)
    },
    // 初始化列表页面
    getList(data, node, tree) {
      this.getTree.data = data
      this.getTree.node = node
      this.getTree.tree = tree
      this.currTreeNode = data;
      this.clickId = data.id;
      if(node=='pro'){
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
        // 默认选中点击的表
        let _this = this
        setTimeout(function(){
          _this.$refs.directoryListTable.selection.push(tempObj)
          _this.selections.push(tempObj)
        },200)
        // 父节点node
        this.total = 1;
      } else {
        this.temp = [];
        this.allList = [];
        this.total = 0;
        this.forChildren(data.children);
        // eslint-disable-next-line no-undef
        this.getListSelect();
        this.tableKey = !this.tableKey;
      }
    },
    forChildren(msg){
      if(msg.length>0){
        for(let i = 0;i<msg.length;i++){
          if(msg[i].type == "table"){
            this.temp.push(msg[i]);
            this.allList.push(msg[i]);
            this.total += 1;
          }
          if(msg[i].children.length > 0){
            this.forChildren(msg[i].children);
          }
        }
      }
    },
    createFolder() {
      if (this.currTreeNode.extMap.folderType === "virtual") {
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
      if (
          !(
            /^[\D][\u4E00-\u9FA5\w]{0}[\u4E00-\u9FA5\w]*$/.test(
                    this.resourceForm.resourceName
            ) && /^[\u4E00-\u9FA5\w]*$/.test(this.resourceForm.resourceName)
          )
      ) {
        this.$message({
          type: "info",
          message: "请填写正确的文件夹名！",
        });
        return;
      }
      if ( typeof this.currTreeNode.extMap !== 'undefined' && typeof this.currTreeNode.extMap.sceneInstUuid !== 'undefined') {
        this.resourceForm.sceneInstUuid = this.currTreeNode.extMap.sceneInstUuid;
      }
      this.resourceForm.parentFolderUuid = this.currTreeNode.id;
      this.resourceForm.fullPath = this.clickFullPath.reverse().join("/");
      this.resourceForm.folderName = this.resourceForm.resourceName;
      this.resourceForm.createUserUuid = this.$store.state.user.code;
      if(this.resourceForm.folderName == null || this.resourceForm.folderName.trim().length == 0){
        this.$message({type:'info',message:"文件夹名不可为空，请重新输入文件夹名！"})
        return
      }
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
          duration: 2000,
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
      if(persons.length == 0){
        this.$message({ type: 'warning', message: '请选择共享人员！' })
        return
      }
      for (let i = 0; i < selectObj.length; i++) {
        for (let j = 0; j < persons.length; j++) {
          if (persons[j].personuuid === userId) {
            verResult = false;
            break;
          }
          const obj = {
            tableMetaUuid: selectObj[i].id,
            seneInstUuid: persons[j].userid,
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
          this.disPreviewData = false;
        } else {
          this.disPreviewData = true;
        }
      } else {
        this.saveFlag = true;
        this.disPreviewData = true;
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
