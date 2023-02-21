<template>
  <div class="page-container"
       style="background-color: none;border: none;">
    <!-- left_conter -->
    <div class="left_conter">
      <LeftTrees ref="tree_left"
                 @details='Details'
                 @queryList='query_list'
                 @edit_list="Edit_list"
                 @delete_list="delete_list"></LeftTrees>
    </div>
    <!-- left_conter end-->
    <!-- right_conter -->
    <div class="right_conter">
      <div class="list_style">
        <DataResourceDisplay @down_template_cn="DownTemplateCN"
                             @Important_cn="ImportantCn"
                             @Importdata_dictionary="ImportdataDictionary"
                             @down_template_dictionary="DownTemplateDictionary"
                             @Important_table="ImportantTable"
                             @down_template_table="DownTemplateTable"
                             @on_deails="onDeailsChange"
                             @sync_data="SyncData"
                             :isBtn="isBtn"
                             @on_register="registTable"
                             @Recognition="recognitionChange"
                             @handleCurrentChange="handleCurrent"
                             @handleSizeChange="handleSize"
                             :list="list"
                             :list_data="list_data"
                             :list_loading="list_loading"
                             @edit_list="Edit_list"
                             @search="search"
                             @clearSearch="clearSearch"
                             ref="Display"
                             v-if="show_details == false">
        </DataResourceDisplay>
      </div>
      <!-- 基本信息详情 -->
      <Details ref="Details_ref"
               :dataSource="dataSource"
               :tableMetaUuid="tableMetaUuid"
               :isDisable_input="isDisable_input"
               @update_list="UpdateList"
               :is_Edit_list="is_Edit_list"
               @update_details="updateDetails"
               @query_data="QueryData"
               @step="Step"
               v-if="show_details == true"></Details>

      <!-- 注册资源 -->
      <el-dialog :close-on-click-modal="false"
                 :default-expand-all="true"
                 :title="'选择注册表'"
                 :visible.sync="registTableFlag"
                 class="dlag_width"
                 width="60%"
                 top="5vh">
        <!-- 选择模式 -->
        <div class="schema-search">
          模式名称：
          <el-select v-model="schemaNameFilter"
                     @change="filterTablesBySchema"
                     style="width: 400px;"
                     clearable>
            <el-option v-for="item in schemaData"
                       :key="item"
                       :label="item"
                       :value="item"></el-option>
          </el-select>
        </div>
        <div>
          表名称：
          <el-input style="width: 330px;margin-left: 10px;"
                    v-model="tableNameFilter"
                    clearable
                    placeholder="输入想要查询的表名称（模糊搜索）" />
          <el-button type="primary"
                     size="small"
                     @click="getTables">查询</el-button>
        </div>
        <div class="dlag_conter containerselect padding10">
          <MyElTree ref="tree1"
                    v-loading="treeLoading"
                    :props="props"
                    :data="tableData"
                    class="filter-tree"
                    show-checkbox
                    :filter-node-method="filterNode"
                    @check-change="nodeClick_table"
                    @node-click="nodeClick_table">
            <span slot-scope="{ node, data }"
                  class="custom-tree-node">
              <i v-if="data.type === 'USER'">
                <img src="../../../assets/img/table_0.png"
                     style="
                    height: 16px;
                    width: 16px;
                    margin-right: 2px;
                    vertical-align: top;
                    *vertical-align: middle;
                  " />
              </i>
              <i v-if="data.type === 'TABLE'">
                <img src="../../../assets/img/table_1.png"
                     style="
                    height: 16px;
                    width: 16px;
                    margin-right: 2px;
                    vertical-align: top;
                    *vertical-align: middle;
                  " />
              </i>
              <i v-if="data.type === 'COLUMN'">
                <img src="../../../assets/img/table_2.png"
                     style="
                    height: 16px;
                    width: 16px;
                    margin-right: 2px;
                    vertical-align: top;
                    *vertical-align: middle;
                  " />
              </i>
              <span>{{ node.label }}</span>
            </span>
          </MyElTree>
        </div>
        <span slot="footer">
          <el-button @click="registTableFlag = false">取消</el-button>
          <el-button type="primary"
                     v-if="is_next == true"
                     @click="next()">下一步</el-button>
        </span>
      </el-dialog>

      <!-- 批量注册 -->
      <el-dialog :visible.sync="dialogVisible_forms"
                 width="60%"
                 title="批量注册"
                 :close-on-click-modal="false"
                 class="dlag_width">
        <div class="dlag_conter">
          <el-table :data="Column_table"
                    style="width: 100%">
            <el-table-column prop="date"
                             show-overflow-tooltip
                             label="字段名称">
              <template slot-scope="scope">
                <span v-for="(item, index) in scope.row.colMetas"
                      :key="index">
                  {{ item.colName }}
                  <i v-if="scope.row.colMetas.length !== 1">、</i>
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="title"
                             show-overflow-tooltip
                             label="表名称">
              <template slot-scope="scope">
                {{ scope.row.tbName }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="dialogVisible_forms = false">关闭</el-button>
          <el-button type="primary"
                     @click="next_save()">确定</el-button>
        </span>
      </el-dialog>

      <!-- 单个注册-->
      <el-dialog title="基本信息"
                 :close-on-click-modal="false"
                 class="data_res dlag_width"
                 :visible.sync="dialogVisible_information"
                 @close="handleClose('form')"
                 width="60%"
                 top="5vh">
        <div style="height: calc(75vh); overflow: auto;">
          <el-form :rules="rules"
                   ref="form"
                   label-width="100px"
                   label-position="top"
                   :model="form"
                   :inline="false">
            <!-- 表名-->
            <el-row>
              <el-col :span="24">
                <el-form-item label="表名称："
                              prop="tbName">
                  <el-input type="text"
                            disabled
                            placeholder="请输入表名称"
                            v-model="form.tbName"
                            style="width: 100%;"
                            :rows="4">
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 表中文名 -->
            <el-row>
              <el-col :span="24">
                <el-form-item label="表中文名：">
                  <el-input type="text"
                            placeholder="请输入表中文名"
                            style="width: 100%;"
                            v-model="form.chnName"
                            :rows="4">
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <!--  表说明-->
            <el-row>
              <el-col :span="24">
                <el-form-item label="表说明："
                              prop="tableRemarks">
                  <el-input type="textarea"
                            placeholder="请输入表说明"
                            style="resize: none;width: 100%;"
                            v-model="form.tableRemarks">
                  </el-input>
                </el-form-item>
              </el-col>
              <!-- 资源编码 && 资源类型：-->
              <el-col :span="11">
                <el-form-item label="资源编码："
                              prop="tableCode">
                  <el-input type="text"
                            placeholder="请输入资源编码"
                            v-model="form.tableCode"
                            style="width: 100%;"
                            disabled
                            :rows="4">
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="11"
                      :offset="2">
                <el-form-item label="资源类型："
                              prop="tableType">
                  <el-select v-model="form.tableType"
                             style="width: 100%;"
                             placeholder="请选择资源类型">
                    <el-option v-for="item in data_type"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <!-- </div> -->
              <!-- 资源主题 && 资源分层 -->
              <el-col :span="24">
                <el-form-item label="资源主题："
                              prop="tableThemeId">
                  <el-select v-model="form.tableThemeId"
                             style="width: 100%;"
                             placeholder="请选择资源主题">
                    <el-option v-for="item in next_data.themeList"
                               :key="item.codeUuid"
                               :label="item.codeName"
                               :value="item.codeUuid" />
                  </el-select>
                </el-form-item>
                <el-form-item label="资源分层："
                              prop="tableLayeredId">
                  <el-select v-model="form.tableLayeredId"
                             style="width: 100%;"
                             :rows="4"
                             placeholder="请选择资源分层">
                    <el-option v-for="item in next_data.layeredList"
                               :key="item.codeUuid"
                               :label="item.codeName"
                               :value="item.codeUuid" />
                  </el-select>
                </el-form-item>
              </el-col>
              <!-- 所属系统 && 文件名-->
              <el-col :span="11">

                <el-form-item label="所属系统："
                              prop="businessSystemId">
                  <el-select v-model="form.businessSystemId"
                             style="width: 100%;"
                             :rows="4"
                             placeholder="请选择所属系统">
                    <el-option v-for="item in next_data.businessSystemList"
                               :key="item.businessSystemUuid"
                               :label="item.businessSystemName"
                               :value="item.businessSystemUuid" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="11"
                      :offset="2">

                <el-form-item label="文件名：">
                  <el-input type="text"
                            placeholder="请输入文件名称"
                            style="width: 100%;"
                            v-model="form.fileName"
                            :rows="4">
                  </el-input>
                </el-form-item>
              </el-col>
              <!-- 数据日期 && 表大小-->
              <el-col :span="11">
                <el-form-item label="数据日期：">
                  <el-date-picker format="yyyy-MM-dd"
                                  type="date"
                                  style="width: 100%;"
                                  value-format="yyyy-MM-dd"
                                  @change="changeRelationParam"
                                  placeholder="请输入数据日期"
                                  :rows="4"
                                  v-model="form.dataDate">
                  </el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="11"
                      :offset="2">
                <el-form-item label="表大小：">
                  <el-input type="text"
                            disabled
                            style="width: 100%;"
                            placeholder="请输入表大小"
                            v-model="form.tableSize"
                            :rows="4">
                  </el-input>
                </el-form-item>
              </el-col>
              <!-- 表数据量 && 负责人-->
              <el-col :span="11">
                <el-form-item label="表数据量：">
                  <el-input type="text"
                            disabled
                            style="width: 100%;"
                            placeholder="请输入表数据量"
                            v-model="form.rowNum"
                            :rows="4">
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="11"
                      :offset="2">
                <div class="son_check">
                  <el-form-item label="负责人：">
                    <el-col :span="19">
                      <el-input type="textarea"
                                disabled
                                style="width: 100%;"
                                v-model="form.personName_str">
                      </el-input>
                    </el-col>
                    <el-col :span="2">
                      <el-button type="primary"
                                 size="small"
                                 @click="check_people()">选择</el-button>
                    </el-col>
                  </el-form-item>

                </div>
              </el-col>
              <!-- </div> -->
              <!-- </div> -->
              <!--表分区 && 增全量 -->
              <!-- <div class="son"> -->
              <el-col :span="11">
                <el-form-item label="表分区："
                              prop="partitions">
                  <div class="table">
                    <div class="head">分区名称</div>
                    <div v-if="form.partitions == null">--</div>
                    <div v-else>
                      <div v-for="(item, index_partitions) in form.partitions"
                           :key="index_partitions"
                           class="li_son">
                        {{ item }}
                      </div>
                    </div>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="11"
                      :offset="2">
                <el-form-item label="增全量："
                              prop="isSpike">
                  <el-select v-model="form.isSpike"
                             style="width: 100%;"
                             :rows="4"
                             placeholder="请选择是否增量">
                    <el-option v-for="item in option_isSpike"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <!-- </div> -->
              <!-- 数据标签 -->
              <!-- <div class="son">
              <div class="son_check">
                <el-form-item label="数据标签：">
                  <div class="_width tag_conter">
                    <el-tag :key="tag.labelLibraryId"
                            v-for="tag in form.labelList"
                            closable
                            :disable-transitions="false"
                            @close="handleDeleteLabel(tag)">
                      {{ tag.labelLibraryName }}
                    </el-tag>
                  </div>
                </el-form-item>
                <el-button type="primary"
                           class="oper-btn"
                           @click="check_tag()">选择</el-button>
              </div>
            </div> -->
            </el-row>

          </el-form>
          <!-- 列信息 -->
          <div class="padding10_l">
            <p style="text-align: center"
               class="mb10">列信息</p>
            <el-table :data="Column_table"
                      :show-overflow-tooltip='true'
                      style="width: 100%">
              <el-table-column prop="colName"
                               show-overflow-tooltip
                               label="字段名称">
              </el-table-column>
              <el-table-column prop="chnName"
                               show-overflow-tooltip
                               label="字段中文名">
              </el-table-column>
              <el-table-column prop="dataType"
                               show-overflow-tooltip
                               label="字段类型">
              </el-table-column>
              <el-table-column prop="dataLength"
                               show-overflow-tooltip
                               label="字段长度">
              </el-table-column>
            </el-table>
          </div>
        </div>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="step_data('form')">上一步</el-button>
          <el-button type="primary"
                     :loading="btnLoading"
                     :disabled="isDisable"
                     @click="save('form')">{{ this.btnLoading == true ? "保存中" : "保存" }}</el-button>
          <el-button @click="close_diag('form')">关闭</el-button>
        </span>
      </el-dialog>

      <!-- 选择责任人 -->
      <el-dialog title="选择责任人"
                 :close-on-click-modal="false"
                 :visible.sync="resultShareDialogIsSee"
                 width="80%"
                 class="dlag_width">
        <div class="dlag_conter">
          <personTree :reverseDisplay="personReverseDisplay"
                      ref="orgPeopleTree"></personTree>
        </div>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="close_people()">取消</el-button>
          <el-button type="primary"
                     @click="modelResultShare()">确定</el-button>
        </span>
      </el-dialog>

      <!-- 选择标签 -->
      <!-- <select-label title="选择标签"
                    :visible.sync="dialogVisible_tag"
                    :close-on-click-modal="false"
                    :has-selected="form.labelList"
                    @confirm="confirmSelectLabel"></select-label> -->

      <!-- 认权管理 -->
      <el-dialog title="认权管理"
                 :close-on-click-modal="false"
                 :visible.sync="visible_Recognition"
                 width="60%"
                 class="dlag_width">
        <div class="dlag_conter">
          <div class="com">
            <el-form ref="form"
                     label-width="80px"
                     :model="Recognition">
              <el-form-item label="认权人:"
                            prop="people">
                <el-input type="text"
                          disabled
                          placeholder="请选择认权人"
                          style="width: 30%;"
                          v-model="Recognition.personName_str">
                </el-input>
                <el-button type="primary"
                           @click="check_people()">选择</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div class="padding10_l">
            <el-table :data="Recognition_check_list"
                      :show-overflow-tooltip='true'
                      style="width: 100%">
              <el-table-column prop="tbName"
                               show-overflow-tooltip
                               align="center"
                               label="表名称">
              </el-table-column>
              <el-table-column prop="tableRelationQuery"
                               show-overflow-tooltip
                               align="center"
                               label="表类型">
                <template slot-scope="scope">
                  <div v-if="scope.row.tableRelationQuery">{{ scope.row.tableRelationQuery.tableThemeName }}</div>
                </template>

              </el-table-column>
            </el-table>
          </div>
        </div>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="visible_Recognition = false">取消</el-button>
          <el-button type="primary"
                     :loading="save_people_Loading"
                     @click="save_people_change()">确定</el-button>
        </span>
      </el-dialog>

      <!-- 导入数据 -->
      <el-dialog v-if="importVisible"
                 :title="upload_title"
                 :visible.sync="importVisible"
                 :close-on-click-modal="false"
                 width="800px">
        <el-row>
          <el-col>
            <directory-file-import @fileuploadname="fileuploadname" />
          </el-col>
        </el-row>
        <span slot="footer">
          <el-button size="small"
                     @click="importVisible = false">取消</el-button>

          <el-button @click="importTableDictionary()"
                     size="small"
                     type="primary"
                     v-if="upload_title == '导入数据资源'">导入</el-button>
          <el-button @click="importTablCn()"
                     size="small"
                     type="primary"
                     v-else-if="upload_title == '导入汉化信息'">导入</el-button>
          <el-button @click="importTableTable()"
                     v-else
                     size="small"
                     type="primary">导入</el-button>

          <!-- <el-button type="primary"
                     @click="upload_title = '数据字典导入' ? importTableDictionary()
  :upload_title = '汉化信息导入' ? importTablCn()
   : upload_title = '表关系导入' ? importTableTable() :'' ">导入</el-button> -->
        </span>
      </el-dialog>
    </div>
    <!-- right_conter end-->
  </div>
</template>

<script>
import tabledatatabs from "@/views/data/table/tabledatatabs";
import MyElTree from "@/components/public/tree/src/tree.vue";
import LeftTrees from "@/components/loginTree/leftTree.vue";
import {
  listUnCached,
  listByTreePage, //列表
  getColsInfoByTableName, //获取列信息
  synDataStructure, //同步数据
  listSchemas, //获取模式名
  downTemplateDictionary, // 下载资源目录模版
  downTemplateCN, // 下载汉化信息模版
  downTemplateTable, // 下载表关系模版
  getPersonLiableByTableMetaUuid,// 获取认权人信息
} from "@/api/data/table-info";
import QueryField from "@/components/public/query-field/index";
import personTree from "@/components/publicpersontree/index";
import DataResourceDisplay from "@/components/directory/dataResourceDisplay.vue";
import Details from "@/components/directory/details.vue";
import directoryFileImport from "@/views/data/tableupload"; //导入
import {
  importTable,
  import_dictionary,
  importTable_table,
} from "@/api/data/dict";
import qs from "qs";
import SelectLabel from "@/components/directory/selectLabel.vue";
import {
  batchSaveTable_save, //下一步 保存
  getListTree, //注册资源下一步
} from "@/api/lhg/register.js";

import {
  update_data, //认权人
} from "@/api/lhg/dataAccreditationManagement.js";

export default {
  components: {
    MyElTree,
    LeftTrees,
    tabledatatabs,
    QueryField,
    DataResourceDisplay,
    SelectLabel,
    Details,
    directoryFileImport,
    personTree,
  },
  data () {
    return {
      activeName: "0", //tab切换
      registTableFlag: false, // 注册资源弹窗显示
      schemaNameFilter: "", // 注册资源搜索模式名
      tableNameFilter: null, // 注册资源搜索表名
      props: {
        label: "label",
        isLeaf: "leaf",
        children: "children",
      }, // 注册资源树配置选项
      treeLoading: false, // 注册资源树加载
      tableData: [], // 注册资源展示表
      tableDataAll: [], // 注册资源全量表
      schemaData: [], // 注册资源模式数据
      chooseTables: [],
      dialogVisible_information: false, // 单个注册弹窗显示
      rules: {
        tableRemarks: [
          { required: true, message: '请输入资源编码', trigger: 'blur' },
        ],
        tableCode: [
          { required: true, message: '请输入资源编码', trigger: 'blur' },
        ],
        tableType: [
          { required: true, message: "请选择资源类型", trigger: "change" },
        ],
        tableThemeId: [
          { required: true, message: "请选择所属主题", trigger: "change" },
        ],
        businessSystemId: [
          { required: true, message: "请选择id", trigger: "change" },
        ],
        tableLayeredId: [
          { required: true, message: "请选择资源分层", trigger: "change" },
        ],
        folderUuid: [
          { required: true, message: "请选择所属目录", trigger: "change" },
        ],
        isSpike: [
          { required: true, message: "请选择是否增量", trigger: "change" },
        ],
        isSentFile: [
          { required: true, message: "请选择是否推送文件", trigger: "change" },
        ],
        fileName: [
          { required: true, message: "请输入文件名称", trigger: "change" },
        ],
        personName_str: [
          { required: true, message: "请选择资源责任人", trigger: "change" },
        ],
        tableRemarks: [
          { required: true, message: "请输入资源备注", trigger: "blur" },
        ],
      }, // 单个注册表单规则
      btnLoading: false, //保存loading
      form: {
        tbName: '', //表名
        chnName: '', //表中文名
        tableRemarks: '',//表说明
        tableCode: '',// 资源编码
        tableType: '',// 资源类型
        tableThemeName: '',//所属主题
        tableThemeId: '',// 资源主题 id
        tableLayeredName: '',//资源分层
        tableLayeredId: '',//资源分层 id
        businessSystemName: '',//所属系统
        businessSystemId: '',//所属系统 id
        fileName: '',//文件名
        dataDate: '',//数据日期
        tableSize: '',//表大小:
        rowNum: '',//表数据量
        personLiables: [],//负责人
        personName_str: '',//责任人
        personUuid: '',//资源责任人
        partitions: '',//表分区
        isSpike: 1,//是否增量
        labelList: [], // 标签列表
        isSentFile: 0, //是否推送文件
        personName: "",
        check_list: [
          {
            label: "",
            fileName: "",
            pid: "",
            id: "",
          },
        ], // 选择的数据表
      }, // 单个注册表单数据
      option_isSpike: [
        {
          value: 0,
          label: "全量",
        },
        {
          value: 1,
          label: "增量",
        },
      ],// 增量全量
      isDisable: false, // 防止重复提交
      resultShareDialogIsSee: false, // 选择责任人弹窗显示
      next_data: [], // 系统、主题、分层数据
      is_next: false, //是否显示下一步
      ischeck_data: {}, //第一步选择的数据库
      data_type: [
        {
          value: "1",
          label: "表",
        },
        {
          value: "2",
          label: "视图",
        },
      ], // 资源类型
      show_details: false, //显示基本信息详情
      isBtn: true, //是否显示按钮
      isDisable_input: true, //详情禁止输入修改
      visible_Recognition: false, //认权管理
      Recognition_check_list: [], //认权列表
      Recognition: {
        personName_str: "",
      }, // 认权人信息
      save_people_Loading: false, // 认权按钮加载
      dialogVisible_forms: false, //批量注册弹窗显示
      dialogVisible_tag: false, //选择标签弹窗显示
      importVisible: false, // 导入数据弹窗显示
      upload_title: "", // 导入数据弹窗名称
      importtemp: {}, // 导入文件信息
      Column_table: [], //列信息
      list_loading: false, // 右侧列表加载
      list: [], // 右侧列表数据
      list_data: {}, // 右侧列表分页信息
      tableMetaUuid: "", //详情id
      is_Edit_list: 0, //是否编辑
      dataSource: '',// 详情数据源
      personReverseDisplay: [],// 认权人人员选择反显
      serachParams: {},
    };
  },
  computed: {},
  watch: {
    tableNameFilter (val) {
      this.$refs.tree1.filter(val);
    },
  },
  created () { },
  methods: {
    // 查询
    search (serachParams) {
      this.serachParams = serachParams;

      let data = this.$refs.tree_left.query;
      this.dataSource = data.dataSource//新增关系树 和注册首页数据源绑定且不可修改
      this.show_details = false; //显示列表
      this.list_loading = true; //子组件loading
      let params = {
        businessSystemId: data.businessSystemId, //id主键
        tableThemeId: data.tableThemeId, //主题
        tableLayeredId: data.tableLayeredId, //分层
        folderUuid: data.folderUuid, //目录
        dataSource: data.dataSource, //数据源
        pageNo: data.pageNo,
        pageSize: data.pageSize,
        tbName: data.tbName,
        param: this.serachParams,
      };
      listByTreePage(params).then(res => {
        this.list_loading = false; //子组件loading
        this.list_data = res.data;
        this.list = res.data.records;
      });
    },

    clearSearch (data) {
      this.serachParams = data

    },
    // 返回上一步
    Step () {
      this.show_details = false;
      this.query_list(this.$refs.tree_left.query, false);
    },
    // 获取资料书的参数
    QueryData () {
      this.query_list(this.$refs.tree_left.query, false);
      this.update_tree();//更新左侧树
    },
    // 更新左侧树
    update_tree () {
      if (this.$refs.tree_left.activeName == '0') {
        this.$refs.tree_left.post_getBusinessSystemTree() //系统
      } else if (this.$refs.tree_left.activeName == '1') {
        this.$refs.tree_left.post_getThemeTree(); //主题
      } else if (this.$refs.tree_left.activeName == '2') {
        this.$refs.tree_left.post_getLayeredTree(); //分层
      } else {
        this.$refs.tree_left.post_getDataTreeNode(); //目录
      }
    },
    // 跟新关系图
    updateDetails (id) {
      this.tableMetaUuid = id
      this.show_details = true;
      this.isDisable_input = true;
    },
    // 修改后 刷新列表
    UpdateList () {
      this.show_details = false;
      this.query_list(this.$refs.tree_left.query, false);
    },
    // 数据字典导入
    ImportdataDictionary (data) {
      this.upload_title = data;
      this.importVisible = true;
      this.importtemp.tableFileName = '';
    },
    // 汉化信息导入
    ImportantCn (data) {
      this.upload_title = data;
      this.importVisible = true;
      this.importtemp.tableFileName = '';
    },
    // 表关系导入
    ImportantTable (data) {
      this.upload_title = data;
      this.importVisible = true;
      this.importtemp.tableFileName = '';
    },
    // 数据字典下载
    DownTemplateDictionary () {
      // 导出表信息作为模板
      // this.$message({ type: 'info', message: '无选择表,失败!' })
      downTemplateDictionary().then((res) => {
        const filename = decodeURI(
          res.headers["content-disposition"].split(";")[1].split("=")[1]
        );
        const blob = new Blob([res.data], {
          type: "application/octet-stream",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
      });
    },
    // 汉化模版下载
    DownTemplateCN (data) {
      // 导出表信息作为模板
      // this.$message({ type: 'info', message: '无选择表,失败!' })
      downTemplateCN(qs.stringify({ tableMetasJson: JSON.stringify(data) })).then((res) => {
        const filename = decodeURI(
          res.headers["content-disposition"].split(";")[1].split("=")[1]
        );
        const blob = new Blob([res.data], {
          type: "application/octet-stream",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
      });
    },
    // 表关系下载
    DownTemplateTable () {
      // 导出表信息作为模板
      downTemplateTable().then((res) => {
        const filename = decodeURI(
          res.headers["content-disposition"].split(";")[1].split("=")[1]
        );
        const blob = new Blob([res.data], {
          type: "application/octet-stream",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
      });
    },
    // 上传文件信息
    fileuploadname (data) {
      this.importtemp.tableFileName = data;
    },
    // 字典确认导入
    importTableDictionary () {
      let importtemp = JSON.parse(JSON.stringify(this.importtemp))
      if (importtemp.tableFileName == '') {
        this.$message({
          type: "warning",
          message: '请先上传文件',
        });
      } else {
        import_dictionary(this.importtemp).then((res) => {
          if (res.data.code === "200") {
            this.importVisible = false;
            this.$notify({
              title: "成功",
              message: res.data.msg,
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
            this.update_tree();//更新左侧树
            this.query_list(this.$refs.tree_left.query, false);
          } else {
            this.$message({
              type: "error",
              message: res.data.msg,
            });
          }
        });
      }
    },
    // 汉化确认导入
    importTablCn () {
      let importtemp = JSON.parse(JSON.stringify(this.importtemp))
      if (importtemp.tableFileName == '') {
        this.$message({
          type: "warning",
          message: '请先上传文件',
        });
      } else {
        importTable(this.importtemp).then((res) => {
          if (res.data.code === "200") {
            this.importVisible = false;
            this.$notify({
              title: "成功",
              message: res.data.msg,
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
            this.query_list(this.$refs.tree_left.query, false);
          } else {
            this.$message({
              type: "error",
              message: res.data.msg,
            });
          }
        });
      }
    },
    // 表关系导入
    importTableTable () {
      let importtemp = JSON.parse(JSON.stringify(this.importtemp))
      if (importtemp.tableFileName == '') {
        this.$message({
          type: "warning",
          message: '请先上传文件',
        });
      } else {
        importTable_table(this.importtemp).then((res) => {
          if (res.data.code === "200") {
            this.importVisible = false;
            this.$notify({
              title: "成功",
              message: res.data.msg,
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
            this.query_list(this.$refs.tree_left.query, false);
          } else {
            this.$message({
              type: "error",
              message: res.data.msg,
            });
          }
        });
      }
    },
    // 同步数据
    SyncData (data) {
      let arr_str = [];
      for (var i = 0; i < data.length; i++) {
        arr_str.push(data[i].tableMetaUuid);
      }
      let params = {
        dataSource: this.$refs.tree_left.query.dataSource,
        tableMetaUuids: arr_str,
      };
      synDataStructure(params).then((resp) => {
        if (resp.code == 0) {
          this.$message({
            type: "success",
            message: "同步成功!",
          });
          this.query_list(this.$refs.tree_left.query, false);//刷新列表
        } else {
          this.$message({
            type: "error",
            message: resp.msg,
          });
        }
      });
    },
    // 认权管理
    recognitionChange (data) {
      this.Recognition_check_list = data;
      let tableMetaUuidList = [];
      this.Recognition_check_list.forEach(item => {
        tableMetaUuidList.push(item.tableMetaUuid)
      })
      this.Recognition.personName_str = "";
      // 获取当前表认权人
      getPersonLiableByTableMetaUuid(tableMetaUuidList).then(resp => {
        let personLibaleList = resp.data;
        let personLibales = [];
        this.personReverseDisplay = [];
        personLibaleList.forEach(item => {
          personLibales.push(item.personName);
        });
        this.personReverseDisplay = personLibaleList;
        this.Recognition.personName_str = personLibales.join("、")
      });
      this.visible_Recognition = true;

      if (this.$refs.orgPeopleTree) {
        if (this.$refs.multipleTable) {
          this.$refs.orgPeopleTree.$refs.multipleTable.clearSelection(); //清空选择的认权人
          this.$refs.orgPeopleTree.findOrgTree_data();
          this.$refs.orgPeopleTree.list = [];
          this.$refs.orgPeopleTree.total = 0;
        }
      }
    },
    // 认权确认
    save_people_change () {
      //请选择认权人
      if (this.Recognition.personName_str == "") {
        this.$message({ type: "warning", message: "请选择认权人" });

      } else {
        this.save_people_Loading = true;

        var personUuids = [];
        var personNames = [];
        var arr = [];
        var selectedNode = this.$refs.orgPeopleTree.getSelectValue();
        // 清除人员组件选择数据
        this.$refs.orgPeopleTree.refreshSelected();
        for (var i = 0; i < selectedNode.length; i++) {
          personUuids.push(selectedNode[i].personuuid);
          personNames.push(selectedNode[i].cnname);
          let obj = {
            personuuid: selectedNode[i].personuuid,
            personName: selectedNode[i].cnname,
          };
          arr.push(obj);
        }
        this.form.personLiables = arr;
        var tableMetaUuids = [];
        for (var i = 0; i < this.Recognition_check_list.length; i++) {
          tableMetaUuids.push(this.Recognition_check_list[i].tableMetaUuid);
        }
        let params = {
          tableMetaUuids: tableMetaUuids,
          personLiables: this.form.personLiables, // 资源责任人
        };
        // 修改
        update_data(params).then((res) => {
          this.save_people_Loading = false;

          if (res.code == 0) {
            this.$message({
              message: "认权成功",
              type: "success",
              showClose: true,
            });
            this.query_list(this.$refs.tree_left.query, false);//刷新列表
            this.visible_Recognition = false;
            this.clearcheckbox();
          } else {
            this.$message({
              message: res.msg,
              type: "error",
              showClose: true,
            });
          }
        });
      }
    },
    // 关闭 选择责任人
    close_people () {
      this.resultShareDialogIsSee = false;
      this.$refs.orgPeopleTree.$emit("clear"); //清空组件 值
    },
    // 显示基本信息详情
    onDeailsChange (data) {
      this.tableMetaUuid = data.tableMetaUuid;
      this.show_details = true;
      this.isDisable_input = true;

    },
    // 通过模式名过滤表名
    filterTablesBySchema (val) {
      if (val) {
        this.tableData = [];
        this.tableDataAll.forEach(item => {
          if (item.id == val) {
            this.tableData.push(item);
          }
        })
      } else {
        this.tableData = this.tableDataAll;
      }
    },
    // 获取模式名
    getSchemas () {
      listSchemas(this.$refs.tree_left.query.dataSource).then((res) => {
        this.schemaData = res.data;
      });
    },
    // 点击注册资源的 数据库列表
    getTables () {
      this.treeLoading = true;
      listUnCached(
        "table",
        "",
        this.tableNameFilter == null ? "" : this.tableNameFilter,
        this.$refs.tree_left.query.dataSource
      ).then((resp) => {
        this.treeLoading = false;
        this.tableDataAll = resp.data;
        this.tableData = resp.data;
      });
    },
    // 刷根据节点ID刷新节点
    refreshNodeBy (id) {
      let node = this.$refs.tree2.getNode(id); // 通过节点id找到对应树节点对象
      node.loaded = false;
      node.expand(); // 主动调用展开节点方法，重新查询该节点下的所有子节点
    },
    // 点击切换树 切换 表单
    // 查看详情
    Details (tableMetaUuid, show_details, isDisable_input) {
      this.tableMetaUuid = tableMetaUuid
      this.show_details = show_details;
      this.isDisable_input = isDisable_input;
      this.$nextTick(() => {
        this.$refs.Details_ref.$refs.tableLines.init(1)//刷新列表 更新关系树
        this.$refs.Details_ref.post_sql_data()//更新查看sql
        this.$refs.Details_ref.table_list(this.tableMetaUuid)//更新列信息
      })
    },
    // 列表 接口
    query_list (data, show_details) {
      this.dataSource = data.dataSource//新增关系树 和注册首页数据源绑定且不可修改
      this.show_details = show_details; //显示列表
      // this.query = data;
      this.list_loading = true; //子组件loading
      let params = {
        businessSystemId: data.businessSystemId, //id主键
        tableThemeId: data.tableThemeId, //主题
        tableLayeredId: data.tableLayeredId, //分层
        folderUuid: data.folderUuid, //目录
        dataSource: data.dataSource, //数据源
        pageNo: data.pageNo,
        pageSize: data.pageSize,
        tbName: data.tbName,
      };
      listByTreePage(params).then((resp) => {
        this.list_loading = false; //子组件loading
        this.list_data = resp.data;
        this.list = resp.data.records;
        // this.$nextTick(() => {
        // this.$refs.Display.$el.style.border = '1px solid red'
        // })
      });
    },
    // 注册资源
    registTable () {
      this.registTableFlag = true;
      this.schemaNameFilter = '';
      this.tableNameFilter = null;
      this.getSchemas();
      this.getTables();
    },
    // 选择注册表 筛选
    filterNode (value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 上一步
    step_data (form) {
      this.$nextTick(() => {
        this.$refs['form'].resetFields(); //清空添加的值
        this.$refs["form"].clearValidate();
      });
      this.dialogVisible_information = false; //关闭基本信息
      this.clear();
    },
    // 清除注册资源第二步的数据
    clear () {
      // 清空
      this.form.tbName = "";
      this.form.tableCode = "";
      this.form.chnName = ''
      this.form.tableType = "";
      this.form.tableThemeId = "";
      this.form.rowNum = '';
      this.form.tableSize = '';
      this.form.partitions = '';
      this.form.tableRemarks = '';
      this.form.businessSystemId = "";
      this.form.tableLayeredId = "";
      this.form.folderUuid = "";
      this.form.personUuid = "";
      this.form.tableRemarks = "";
      this.form.isSpike = 1;
      this.form.isSentFile = 0;
      this.form.fileName = '';
      this.form.check_list.fileName = "";
      this.form.check_list.pid = "";
      this.form.check_list.id = "";
      this.form.check_list.label = "";
      this.form.dataDate = "";
      this.form.personName_str = "";
    },
    // 第一步选择的数据库
    nodeClick_table (data, node, tree) {
      //获取所有选中的节点 start
      let res = this.$refs.tree1.getCheckedNodes();
      var check_list = [];
      for (var i = 0; i < res.length; i++) {
        let obj = {
          label: res[i].label,
          fileName: "",
          pid: res[i].pid,
          id: res[i].id,
        };
        check_list.push(obj);
      }
      this.form.check_list = check_list;
      if (this.form.check_list.length !== 0) {
        // 显示保存按钮
        this.is_next = true;
        this.ischeck_data = data;
      } else {
        this.is_next = false;
      }
    },
    // 注册资源 下一步
    next () {
      let dbName = []; // 选中的模式 唯一
      let tbList = []; // 选中的表
      this.form.check_list.forEach(item => {
        if (item.pid != 'ROOT') {
          if (dbName.indexOf(item.pid) == -1) {
            dbName.push(item.pid);
          }
          tbList.push(item.label);
        }
      });
      if (dbName.length > 1) {
        this.$message({
          type: "warning",
          message: "不能跨模式注册资源！",
        });
        return false;
      }
      // 选择多个数据表
      // if (this.form.check_list.length >= 2) {
      //   this.post_getColsInfoByTableName(); //获取列信息
      //   this.dialogVisible_forms = true;
      // } else {
      //   // this.registTableFlag = false;//关闭上一步
      //   this.dialogVisible_information = true; //显示下一步 基本信息
      //   this.form.personLiables = []//清空责任人
      // }

      const params = {
        dbName: dbName[0],
        tbNames: tbList,
        tableDataSource: this.$refs.tree_left.query.dataSource,
      }
      // 获取列信息
      getColsInfoByTableName(params).then((resp) => {
        if (resp.data.length !== 1) {
          this.Column_table = resp.data;
        } else {
          this.form.tbName = resp.data[0].tbName; //表名赋值
          this.Column_table = resp.data[0].colMetas; // 列信息
          this.form.rowNum = resp.data[0].rowNum; //表数据量
          this.form.tableSize = resp.data[0].tableSize; //表大小
          this.form.partitions = resp.data[0].partitions; //表分区
          this.form.tableCode = resp.data[0].tableRelationQuery.tableCode; //资源编码
          this.form.tableType = resp.data[0].tableRelationQuery.tableType;//资源类型
          this.form.tableRemarks = resp.data[0].tableRelationQuery.tableRemarks; //表说明
        }
      });
      // 获取系统、主题、分层列表
      getListTree().then((res) => {
        this.next_data = res.data;
      });
      // 判断是批量注册还是单个注册
      if (this.form.check_list.length >= 2) {
        this.dialogVisible_forms = true;
      } else {
        this.dialogVisible_information = true;
      }
    },
    // 选择多个的情况  下一步的确认 批量多个注册
    next_save () {
      for (var i = 0; i < this.form.check_list.length; i++) {
        const tableForm = {
          tableMetaUuid: this.form.check_list[i].id,
          displayTbName: this.form.check_list[i].label,
          dbName: this.form.check_list[i].pid,
          tbName: this.form.check_list[i].label,
          folderUuid: this.form.folderUuid, //目录id
          personLiables: this.form.personLiables, // 资源责任人
          // increment: this.form.increment,//是否增量
          isSpike: this.form.isSpike, //是否增量
          tableRelationQuery: {
            tableDataSource: this.$refs.tree_left.query.dataSource, //数据源
            businessSystemId: '0', //id主键
            tableCode: '', //资源编码
            tableLayeredId: '0', //资源分层主键
            tableMetaUuid: this.form.check_list[i].id, //资源主键
            tableRemarks: "", //资源备注
            tableThemeId: "0", //资源主题主键
            tableType: "1", //资源类型
            isSpike: this.form.isSpike, //是否增量
            isSentFile: 0, //是否推送文件
            fileName: "",
          },
        };
        this.chooseTables.push(tableForm);
      }

      batchSaveTable_save(this.chooseTables).then((resp) => {
        if (resp.code == 0) {
          this.$message({
            type: "success",
            message: "新增成功!",
          });
          this.btnLoading = false; //保存loadnin
          this.chooseTables = []; //传输的数据
          // this.post_getBusinessSystemTree(); //系统
          // this.post_getThemeTree(); //主题
          // this.post_getLayeredTree(); //分层
          // this.post_getDataTreeNode();//目录
          this.query_list(this.$refs.tree_left.query, false);
          this.update_tree();//更新左侧树
          let activeName = this.$refs.tree_left.activeName
          this.$refs.tree_left.handleClick(activeName)//更新查看sql
          // this.$nextTick(() => {
          //   this.$refs.form.resetFields(); //清空添加的值
          //   this.$refs.form.clearValidate();
          // })
        } else {
          this.btnLoading = false;
          this.$message({
            type: "error",
            message: res.msg,
          });
        }
        this.dialogVisible_information = false;
        this.registTableFlag = false; //关闭上一步
      });
      this.dialogVisible_forms = false; //关闭多选的表单弹窗显示
    },
    // 点击 所属目录层级联动
    handleChange (val) {
      // const checkedNode = this.$refs["cascaderArr"].getCheckedNodes();
      //   //获取当前点击节点的label值
      //   //获取由label组成的数组
      // return false
      // this.form.folderUuid = checkedNode[0].id
      let folderUuid = val.toString();
      this.form.folderUuid = folderUuid;
    },
    // 格式化数据，递归将空的children置为undefined
    formatCascaderData (data) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].children.length < 1) {
          // children若为空数组，则将children设为undefined
          data[i].children = undefined;
        } else {
          // children若不为空数组，则继续 递归调用 本方法
          this.formatCascaderData(data[i].children);
        }
      }
      return data;
    },
    // 关闭弹窗
    handleClose (form) {
      this.$nextTick(() => {
        this.$refs[form].resetFields(); //清空添加的值
        this.$refs[form].clearValidate();
      });
      this.clear();
    },
    // 数据日期:
    changeRelationParam (value) {
      this.form.dataDate = value;
    },
    // 下一步的关闭
    close_diag (form) {
      this.dialogVisible_information = false;
      this.chooseTables = []; //传输的数据
      this.$nextTick(() => {
        this.$refs[form].resetFields(); //清空添加的值
        this.$refs["form"].clearValidate();
      });
      this.clear();
    },
    // 下一步的保存
    save (form) {
      this.btnLoading = true;
      this.isDisable = true;
      setTimeout(() => {
        this.isDisable = false;
      }, 2000);
      this.$refs[form].validate((valid) => {
        if (valid) {
          let names = this.form.check_list.map((item) => item["fileName"]);
          let nameSet = new Set(names);
          if (nameSet.size == names.length) {
            for (var i = 0; i < this.form.check_list.length; i++) {
              const tableForm = {
                chnName: this.form.chnName,
                tableMetaUuid: this.form.check_list[i].id,
                displayTbName: this.form.check_list[i].label,
                dbName: this.form.check_list[i].pid,
                tbName: this.form.check_list[i].label,
                folderUuid: this.form.folderUuid, //目录id
                personLiables: this.form.personLiables, // 资源责任人
                isSpike: this.form.isSpike, //是否增量
                labelList: this.form.labelList,
                tableRelationQuery: {
                  tableDataSource: this.$refs.tree_left.query.dataSource, //数据源
                  businessSystemId: this.form.businessSystemId, //id主键
                  tableCode: this.form.tableCode, //资源编码
                  tableLayeredId: this.form.tableLayeredId, //资源分层主键
                  tableMetaUuid: this.form.check_list[i].id, //资源主键
                  tableRemarks: this.form.tableRemarks, //资源备注
                  tableThemeId: this.form.tableThemeId, //资源主题主键
                  tableType: this.form.tableType, //资源类型
                  isSpike: this.form.isSpike, //是否增量
                  isSentFile: this.form.isSentFile, //是否推送文件
                  fileName: this.form.fileName, //文件名称
                  dataDate: this.form.dataDate, //时间
                },
              };
              this.chooseTables.push(tableForm);
            }
            //
            batchSaveTable_save(this.chooseTables).then((resp) => {
              if (resp.code == 0) {
                this.$message({
                  type: "success",
                  message: "新增成功!",
                });
                // this.$message.success("新增成功");
                this.btnLoading = false; //保存loadnin
                this.chooseTables = []; //传输的数据
                this.update_tree();//更新左侧树
                this.query_list(this.$refs.tree_left.query, false);//刷新列表
                this.$nextTick(() => {
                  this.$refs.form.resetFields(); //清空添加的值
                  this.$refs.form.clearValidate();
                })
              } else {
                this.btnLoading = false;
                this.$message.error(res.msg);
              }
              this.dialogVisible_information = false;//关闭注册资源
              this.registTableFlag = false; //关闭上一步
            });
          } else {
            this.$message({ type: "info", message: "文件名字不可以重复!" });
          }
        } else {
          this.btnLoading = false; //保存loadnin
          this.$message({
            message: "请填写信息",
            type: "info",
            showClose: true,
          });
          return false;
        }
        this.btnLoading = false;
      });
    },
    // 选择责任人
    check_people () {
      this.resultShareDialogIsSee = true;
      this.form.personLiables = [];
      this.clearcheckbox();
      // this.$nextTick(() => {
      //   if (this.$refs.orgPeopleTree) {
      //     if (this.$refs.multipleTable) {
      //       this.$refs.orgPeopleTree.$refs.multipleTable.clearSelection();//清空选择的责任人
      //     }
      //   }
      // })
    },
    // 选择标签
    check_tag () {
      this.dialogVisible_tag = true;
    },
    confirmSelectLabel (val) {
      this.form.labelList = val;
    },
    // 删除标签
    handleDeleteLabel (tag) {
      this.form.labelList.splice(this.form.labelList.indexOf(tag), 1);
    },
    // 清除多选框
    clearcheckbox () {
      this.$nextTick(() => {
        if (this.$refs.orgPeopleTree.$refs.multipleTable) {
          this.$refs.orgPeopleTree.$refs.multipleTable.clearSelection(); //清除多选框
        }
        if (this.$refs.orgPeopleTree) {
          if (this.$refs.orgPeopleTree.$refs.multipleTable) {
            this.$refs.orgPeopleTree.$refs.multipleTable.clearSelection(); //清空选择的认权人
            this.$refs.orgPeopleTree.findOrgTree_data();
            this.$refs.orgPeopleTree.list = [];
            this.$refs.orgPeopleTree.total = 0;
          }
        }
      });
    },
    // 确定责任人
    modelResultShare () {
      var runTaskRelUuids = [];
      var personUuids = [];
      var personNames = [];

      var arr = [];
      var selectedNode = this.$refs.orgPeopleTree.getSelectValue();
      if (selectedNode != null && selectedNode.length == 0) {
        this.form.personName_str = ""
        this.Recognition.personName_str = ""
      }
      for (var i = 0; i < selectedNode.length; i++) {
        personUuids.push(selectedNode[i].personuuid);
        personNames.push(selectedNode[i].cnname);

        // this.form.personName_str = personNames.join(",");
        this.Recognition.personName_str = personNames.join(",");
        this.form.personName_str = personNames.join(",");

        this.form.personUuid = personUuids;
        this.form.personName = personNames;
        // this.form.personName = personNames.toString();

        let obj = {
          personUuid: selectedNode[i].personuuid,
          personName: selectedNode[i].cnname,
        };
        arr.push(obj);
      }
      this.form.personLiables = arr;
      this.resultShareDialogIsSee = false;
    },
    // 修改
    Edit_list (data) {
      this.is_Edit_list = 1;
      for (var i = 0; i < data.length; i++) {
        this.tableMetaUuid = data[i].tableMetaUuid;
      }
      this.show_details = true
      this.isDisable_input = false
    },
    //删除
    delete_list () {
      var query = this.$refs.tree_left.query;
      query.businessSystemId = ''
      this.query_list(query, false);
      this.update_tree();//更新左侧树
    },
    // 分页
    handleCurrent (val) {

      this.$refs.tree_left.query.pageNo = val;
      this.query_list(this.$refs.tree_left.query, false);
    },
    // 每页多少条
    handleSize (val) {
      this.$refs.tree_left.query.pageSize = val;
      this.query_list(this.$refs.tree_left.query, false);
    },
  },
};
</script>

<style scoped>
@import url("./../../../assets/css/common.css");

.schema-search {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

/* 隐藏列表的多选框 */
.list_style >>> .el-table__header-wrapper {
  /* border: 1px solid blue; */
  display: none;
}

.right_conter {
  min-width: 900px;
}

.left_conter {
  /* height: calc(100vh - 140px); */
  /* height: calc(100vh - 120px); */
}

.page-container {
  display: flex;
  padding: 0 !important;
  background: transparent !important;
}

.data_res >>> .el-form-item {
  /* margin-bottom: 0 !important; */
}
/* 
.dlag_width >>> .el-dialog {
  min-width: 600px !important;
}

.data_res >>> .el-form {
  padding: 20px 20px 0;
  box-sizing: border-box;
}

.son {
  display: flex;
  margin-bottom: 20px;
}

.son >>> .el-form-item,
.son >>> .el-select,
.son >>> .el-cascader {
  width: 100%;
  display: flex;
  margin-bottom: 0 !important;
}

.data_res >>> .el-form-item__content,
.data_res >>> .el-date-editor {
  flex: 1;
  margin-left: 0 !important;
  float: left;
} */

.data_res >>> .el-textarea .el-textarea__inner {
  resize: none;
}

/* .data_res >>> .el-form-item--medium .el-form-item__label {
  float: left !important;
  text-align: right;
  width: 110px;
} */
.son_check >>> .el-textarea.is-disabled .el-textarea__inner {
  color: #606266 !important;
  background-color: rgba(0, 0, 0, 0.05) !important;
}
.son_check >>> .el-form-item {
  width: 100% !important;
}
.son_check {
  display: flex;
  align-items: center;
  width: 100%;
}

.son_check >>> .el-button {
  margin-left: 10px;
  height: 36px !important;
}

.table {
  border: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
}

.table .head {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  height: 30px;
  line-height: 30px;
  color: rgba(0, 0, 0, 0.5);
  font-weight: 400;
}

.table .li_son {
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 20px;
  padding: 5px 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}
.table .li_son:last-child {
  border: none !important;
}

/* 标签回显框 */
.tag_conter {
  color: #c0c4cc;
  cursor: not-allowed;
  box-sizing: border-box;
  width: 100%;
  font-size: inherit;
  color: #606266;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 4px 7px 7px 7px;
  min-height: 48px;
}

.tag_conter span {
  margin: 0 3px;
}

/* 认权人 */
.com >>> .el-form {
  /* width: 100%; */
}

/* .com >>> .el-form-item__content {
  width: 100%;
  display: flex;
  align-items: center;
}

.com >>> .el-form-item {
  display: flex;
}

.com >>> .el-input {
  width: 300px;
} */

.com >>> .el-button {
  margin: 0 10px;
}
</style>

<style lang="scss" scoped>
.trees {
  width: 45%;
  float: left;
  margin-top: 1%;
  height: 95%;
}

.divContent {
  position: absolute;
  width: 56%;
  left: 45%;
  height: 95%;
}

.select-link {
  // margin-top: 10px;
  cursor: pointer;
  margin-left: 10px;
}

// .page-container .tree-containerselect {
//   height: 55vh;
//   overflow: auto;
//   border: 1px solid greenyellow;
// }
// 选择注册表

.transfer-center-item {
  width: 40px;
  margin: 2px;
  height: 40vh;
}

.agreeicon0 {
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../assets/img/table_0.png");
  vertical-align: top;
  *vertical-align: middle;
}

.agreeicon1 {
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../assets/img/table_1.png");
  vertical-align: top;
  *vertical-align: middle;
}

.agreeicon2 {
  display: inline-block;
  height: 14px;
  width: 14px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../assets/img/table_2.png");
  vertical-align: top;
  *vertical-align: middle;
}

.agreeicon4 {
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../styles/icons/view.png");
  vertical-align: top;
  *vertical-align: middle;
}

.controlTreeNode {
  width: 100%;
  height: 36px;
  text-align: center;
}

.expandTreeNode {
  position: relative;
  border: 1px #656565;
  top: 6px;
  left: 10px;
  height: 25px;
  width: 25px;
  display: inline-block;
  background: #559ed4;

  &:active {
    background: #5ac3eb !important;
  }

  &:hover {
    background: #5ac3eb !important;
  }

  &:focus {
    background: #5ac3eb !important;
  }
}

.collapseTreeNode {
  position: relative;
  border: 1px #656565;
  top: 6px;
  left: 5px;
  height: 25px;
  width: 25px;
  display: inline-block;
  background: #559ed4;

  &:active {
    background: #5ac3eb !important;
  }

  &:hover {
    background: #5ac3eb !important;
  }

  &:focus {
    background: #5ac3eb !important;
  }
}

.expandIcon {
  height: 12px;
  z-index: 100;
  position: relative;
}

.collapseIcon {
  height: 12px;
  z-index: 100;
  position: relative;
}

.tree-line-btn {
  background: rgba(255, 255, 255, 0) !important;
}

.custom-label-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 15px;
}

// .left_conter >>> .el-input.is-disabled .el-input__inner,
// .right_conter >>> .el-input.is-disabled .el-input__inner {
//   background-color: rgba(0, 0, 0, 0.1) !important;
// }
</style>
