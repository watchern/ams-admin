<template>
  <div class="tab-content addparambox">
    <el-tabs v-model="baseName">
      <el-tab-pane label="基本信息" name="base"></el-tab-pane>
      <!-- <el-tab-pane
        label="关联参数配置"
        name="relevance"
        v-if="form.inputType == 'lineinp' || form.inputType == 'treeinp'"
      ></el-tab-pane> -->
      <el-tab-pane
        label="关联条件参数"
        name="condition"
        v-if="
          (form.inputType == 'lineinp' && activeName == 'SQL') ||
          form.inputType == 'treeinp'
        "
      ></el-tab-pane>
    </el-tabs>
    <div id="basicInfo" v-if="baseName == 'base'">
      <el-form
        id="ammParamAdd"
        :model="form"
        class="detail-form"
        style="height: 62vh; overflow: auto"
        :rules="rules"
        ref="ruleForm"
      >
        <input type="hidden" id="paramUuid" />
        <input id="inputTypeStr" type="hidden" />
        <input id="dataTypeStr" type="hidden" />
        <input id="typeUuid" type="hidden" />
        <input type="hidden" id="treeId" name="treeId" />
        <input id="scopeType" type="hidden" name="scopeType" />
        <input id="scopeUuid" type="hidden" name="scopeUuid" />
        <input id="timesUuid" type="hidden" name="timesUuid" />
        <input name="choiceUuid" id="choiceUuid" type="hidden" />
        <input id="flag" type="hidden" name="flag" />
        <el-row>
          <el-col :span="24">
            <el-form-item label="参数名称" prop="paramName">
              <el-input
                v-model="form.paramName"
                id="paramName"
                placeholder="参数名称"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <el-form-item label="数据类型" prop="dataType">
              <el-select
                v-model="form.dataType"
                @change="changeValue"
                id="dataType"
                name="dataType"
                style="width: 100%"
              >
                <el-option value="" key="" label="请选择"></el-option>
                <el-option
                  v-for="dataType in this.dataTypes"
                  :value="dataType.codeValue"
                  :key="dataType.codeValue"
                  :label="dataType.codeName"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="1">
            <el-form-item label="输入方式" prop="inputType">
              <el-select
                v-model="form.inputType"
                @change="changeInputType"
                id="inputType"
                name="inputType"
                style="width: 100%"
              >
                <el-option value="" key="" label="请选择"></el-option>
                <el-option
                  v-for="inputType in this.inputTypes"
                  :value="inputType.codeValue"
                  :key="inputType.codeValue"
                  :label="inputType.codeName"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="this.isShowElement.dateFormatTag">
          <el-col :span="12">
            <el-form-item label="日期单位" prop="dataType">
              <el-select v-model="form.timeFormat" @change="changeTimeValue">
                <el-option value="" label="请选择"></el-option>
                <el-option value="year" label="年"></el-option>
                <el-option value="month" label="月"></el-option>
                <el-option value="date" label="日"></el-option>
                <el-option value="other" label="其他"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="自定义其他格式"
              prop="dataType"
              v-if="this.isShowElement.customizeFormatTag"
            >
              <el-input
                v-model="form.customizeFormat"
                placeholder="请输入其他格式"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="示例" prop="example" v-if="this.isShowElement.dataLengthInterValShow"
          >
            <el-input
              name="example"
              id="example"
              v-model="form.example"
              autocomplete="off"
              placeholder="示例"
              :disabled="!(form.inputType!='lineinp'&&form.inputType!='treeinp')"
            />
            <!-- :disabled="form.inputType!=''&&" -->
          </el-form-item>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="允许为空">
              <el-radio-group v-model="form.allowedNull">
                <el-radio id="allowedNull" :label="1" value="1">是</el-radio>
                <el-radio id="allowedNull1" :label="0" value="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="使用单引号">
              <el-radio-group v-model="form.useQuotation">
                <el-radio
                  id="useQuotation"
                  v-model="form.useQuotation"
                  label="1"
                  >是</el-radio
                >
                <el-radio
                  id="useQuotation1"
                  v-model="form.useQuotation"
                  label="0"
                  >否</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <div
          id="dataLengthInterVal"
          v-show="this.isShowElement.dataLengthInterValShow"
        >
          <el-form-item label="参数值长度" prop="dataLength">
            <el-input
              v-model.number="form.dataLength"
              id="dataLength"
              placeholder="参数值长度"
              autocomplete="false"
            />
          </el-form-item>
        </div>
        <!--        <div class="form-group" id="timeInterval" v-show="this.isShowElement.timeIntervalShow">
          <el-form-item label="最大间隔时间" prop="maxIntervalVal">
            <el-col :span="10">
              <el-input v-model="form.maxIntervalVal" id="maxIntervalVal" placeholder="最大间隔时间"/>
            </el-col>
            <el-col :span="10" style="margin-left: 20px;">
              <el-select id="maxIntervalUnit" v-model="form.maxIntervalUnit" name="maxIntervalUnit">
                <el-option value="" key="" label="请选择"></el-option>
                <el-option v-for="maxIntervalUnit in this.maxIntervalUnits" :value="maxIntervalUnit.codeValue"  :key="maxIntervalUnit.codeValue" :label="maxIntervalUnit.codeName"></el-option>
              </el-select>
            </el-col>
          </el-form-item>
        </div>-->
        <div id="formalType" v-show="this.isShowElement.formalTypeShow">
          <el-row>
            <el-col :span="24">
              <el-form-item label="形式类型">
                <el-radio-group v-model="form.formalType">
                  <el-radio id="choiceType" name="choiceType" :label="'1'"
                    >单选</el-radio
                  >
                  <el-radio id="choiceType1" name="choiceType" :label="'0'"
                    >多选</el-radio
                  >
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div id="alternateValue" v-show="this.isShowElement.alternateValueShow">
          <el-row>
            <el-form-item label="备选值设置">
              <el-tabs
                v-model="activeName"
                type="card"
                @tab-click="tabsigntree"
              >
                <el-tab-pane label="自定义静态" name="custom">
                  <div id="customStatic">
                    <el-input
                      name="name"
                      v-model="defaultExistsCustomStaticValues.uuid"
                      v-show="false"
                      autocomplete="off"
                    />
                    <el-col :span="9">
                      <el-input
                        name="name"
                        v-model="defaultExistsCustomStaticValues.names"
                        autocomplete="off"
                        placeholder="名称"
                      />
                    </el-col>
                    <el-col :span="9" style="margin-left: 20px">
                      <el-input
                        name="value"
                        v-model="defaultExistsCustomStaticValues.values"
                        autocomplete="off"
                        placeholder="值"
                      />
                    </el-col>
                    <el-col :span="2">
                      <el-button
                        id="addStaticData"
                        type="primary"
                        class="oper-btn add"
                        @click="addStaticData()"
                      />
                    </el-col>
                    <div
                      v-for="(customStaticValue, index) in this
                        .customStaticValues"
                      :key="'customStaticValues' + index"
                    >
                      <el-input
                        name="name"
                        v-model="customStaticValue.uuid"
                        v-show="false"
                        autocomplete="off"
                      />
                      <el-col :span="9">
                        <el-input
                          name="name"
                          v-model="customStaticValue.names"
                          autocomplete="off"
                          placeholder="名称"
                        />
                      </el-col>
                      <el-col :span="9" style="margin-left: 20px">
                        <el-input
                          name="value"
                          v-model="customStaticValue.values"
                          autocomplete="off"
                          placeholder="值"
                        />
                      </el-col>
                      <el-col :span="2">
                        <el-button
                          type="primary"
                          class="oper-btn delete"
                          @click="deleteStaticData(index)"
                        />
                      </el-col>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="SQL动态" name="SQL">
                  <div name="SQLd" id="SQLd">
                    <el-input
                      type="textarea"
                      v-model="form.paramChoice.optionsSqlLine"
                      name="optionsSqlline"
                      id="optionsSqlline"
                      autocomplete="off"
                      :autosize="{ minRows: 3, maxRows: 5 }"
                      :placeholder="getSqlRule(1)"
                    />
                    <el-popover
                      placement="right"
                      width="500"
                      trigger="click"
                      :value="sqlRuleVisible1">
                      <el-input
                        :autosize="{ minRows: 4 }"
                        type="textarea"
                        :disabled="true"
                        v-model="SQLRuleText"
                      >
                      </el-input>
                      <el-button
                        type="primary"
                        @click="viewSqlRule(1)"
                        class="btn btn-primary"
                        slot="reference"
                        >查看SQL规则</el-button
                      >
                    </el-popover>
                    <el-button
                      type="primary"
                      @click="sqlPreview(1)"
                      class="btn btn-primary"
                      style="margin-left: 15px"
                      >预览</el-button
                    >
                  </div>
                </el-tab-pane>
              </el-tabs>
            </el-form-item>
          </el-row>
        </div>
        <div
          name="SQLdtree"
          id="SQLdtree"
          v-show="this.isShowElement.SQLdtreeShow"
        >
          <el-input
            type="textarea"
            v-model="form.paramChoice.optionsSql"
            name="optionsSql"
            id="optionsSql"
            :autosize="{ minRows: 3, maxRows: 5 }"
            autocomp
            lete="off"
            :placeholder="getSqlRule(2)"
            class="sqlRule-input"
          />

          <el-popover
            placement="right"
            width="500"
            trigger="click"
            :value="sqlRuleVisible2">
            <el-input
              :autosize="{ minRows: 4 }"
              type="textarea"
              :disabled="true"
              v-model="SQLRuleText"
            >
            </el-input>
            <el-button
              type="primary"
              @click="viewSqlRule(2)"
              class="btn btn-primary"
              slot="reference"
              >查看SQL规则</el-button
            >
          </el-popover>
          <el-button
            type="primary"
            @click="sqlPreview(2)"
            class="btn btn-primary"
            style="margin-left:15px"
            >预览</el-button
          >
        </div>
        <el-row>
          <el-form-item label="说明">
            <el-input
              name="description"
              v-model="form.description"
              type="textarea"
              id="description"
              autocomplete="off"
              placeholder="说明"
            />
          </el-form-item>
        </el-row>
      </el-form>
      <el-dialog
        :append-to-body="true"
        :close-on-click-modal="false"
        v-if="seeSqlDataDialog"
        title="数据预览"
        :visible.sync="seeSqlDataDialog"
      >
        <seeSqlData :seeDataSql="seeDataSql" ref="seeSqlData"></seeSqlData>
        <div slot="footer" class="dialog-footer">
          <el-button @click="loadNewData2()">加载更多</el-button>
          <el-button @click="seeSqlDataDialog = false">取 消</el-button>
        </div>
      </el-dialog>
      <el-dialog
        :append-to-body="true"
        :close-on-click-modal="false"
        v-if="SQLRuleDialog"
        title="SQL规则"
        :visible.sync="SQLRuleDialog"
        custom-class="sqlRule-dia"
      >
        <el-input
          :autosize="{ minRows: 2, maxRows: 5 }"
          type="textarea"
          :disabled="true"
          v-model="SQLRuleText"
        >
        </el-input>
        <div slot="footer" class="dialog-footer">
          <el-button @click="SQLRuleDialog = false">取 消</el-button>
        </div>
      </el-dialog>
    </div>
    <!-- <div class="relevanceInfo" v-if="baseName == 'relevance'">
      <el-form ref="relevance" :rules="relevancerules" :model="relevanceform">
        <div @click.stop="choosetree()" style="cursor: pointer !important">
          <el-form-item label="被关联参数名称" prop="slaveParamName">
            <el-input
              v-model="relevanceform.slaveParamName"
              placeholder="请选择被关联参数名称"
            ></el-input>
          </el-form-item>
        </div>
        <el-form-item label="被关联参数值" prop="slaveParamCol">
          <el-select
            v-model="relevanceform.slaveParamCol"
            placeholder="请选择被关联参数值"
          >
            <el-option
              v-for="(item, i) in rvaluelist"
              :key="'rvalue' + i"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关联参数值" prop="relationMode">
          <el-select
            v-model="relevanceform.relationMode"
            placeholder="请选择关联参数值"
          >
            <el-option label="真实值" value="1"></el-option>
            <el-option label="显示值" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="addrelevance(relevanceform)"
            type="primary"
            size="small"
            style="float: right"
            plain
            >保存</el-button
          >
        </el-form-item>
      </el-form>

      <el-table :data="relevanceData" style="width: 100%">
        <el-table-column prop="slaveParamName" label="被关联参数名称">
        </el-table-column>
        <el-table-column prop="slaveParamCol" label="被关联参数值">
        </el-table-column>
        <el-table-column prop="relationMode" label="关联参数值">
          <template slot-scope="scope">
            <span v-if="scope.row.relationMode == 1">真实值</span>
            <span v-else>显示值</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              @click="delrelevance(scope.row, scope.$index)"
              type="danger"
              size="small"
              plain
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div> -->
    <div v-if="baseName == 'condition'">
      <el-tree :data="relevancetreedata" node-key="id" default-expand-all>
        <div
          class="custom-tree-node"
          style="margin-top: 5px"
          slot-scope="{ node, data }"
        >
          <span v-if="data.type == 'relation'">
            <el-button
              type="primary"
              plain
              @click.stop="
                data.relation == 'and'
                  ? (data.relation = 'or')
                  : (data.relation = 'and')
              "
              >{{ data.relation }}</el-button
            >
            <el-button
              type="primary"
              plain
              size="small"
              @click.stop="addrelevancetreenode(data, node)"
              >添加组</el-button
            >
            <span
              class="relationaddicon"
              @click.stop="remrelevancetreenode(data, node)"
              ><i class="el-icon-error"></i
            ></span>
            <span
              class="relationaddicon"
              @click.stop="addrelevancetreechild(data, node)"
              ><i class="el-icon-circle-plus"></i
            ></span>
          </span>
          <span v-else>
            <el-select
              v-model="data.value.relationFiled"
              placeholder="请选择关联字段"
            >
              <el-option
                v-for="item in relationFiledoptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
            <el-select
              v-model="data.value.relationLogic"
              placeholder="请选择关联关系"
            >
              <el-option
                v-for="item in relationLogicoptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <span style="float: left" v-if="item.value=='='">{{item.value}}</span>
                <span style="float: left" v-else-if="item.value=='<>'">≠</span>
                <span style="float: left" v-else-if="item.value=='>'">{{item.value}}</span>
                <span style="float: left" v-else-if="item.value=='>='">≥</span>
                <span style="float: left" v-else-if="item.value=='<'">{{item.value}}</span>
                <span style="float: left" v-else-if="item.value=='<='">≤</span>
                <span style="float: left" v-else-if="item.value=='charindex > 0'">
                  a<span style="color:green;">b</span>c
                </span>
                <span style="float: left" v-else-if="item.value=='charindex < 0'">
                  a<span style="color:red;">c</span>b
                </span>
                <span style="float: left" v-else-if="item.value=='LLike'">
                  <span style="color:blue;">[</span>a<span style="color:blue;">]</span>b
                </span>
                <span style="float: left" v-else-if="item.value=='RLike'">
                  b<span style="color:blue;">[</span>c<span style="color:blue;">]</span>
                </span>
                <span style="float: left" v-else-if="item.value=='AllLike'">
                  a<span style="color:green;">%</span>b
                </span>
                <span style="float: left" v-else-if="item.value=='not like'">
                  a<span style="color:red;">%</span>b
                </span>
                <span style="float: left" v-else-if="item.value=='in'">
                  <span style="color:green;">ooo</span>
                </span>
                <span style="float: left" v-else-if="item.value=='not in'">
                  <span style="color:red;">ooo</span>
                </span>
                <span style="float: right">{{ item.label }}</span>
              </el-option>
            </el-select>
            <div
              @click.stop="choosetree(data, node)"
              style="cursor: pointer !important; display: inline-block"
            >
              <el-input
                v-model="data.value.relationParamName"
                placeholder="请选择被关联参数名称"
              ></el-input>
            </div>
            <span
              class="relationaddicon"
              @click.stop="remrelevancetreenode(data, node)"
              ><i class="el-icon-error"></i
            ></span>
          </span>
        </div>
      </el-tree>
    </div>
    <el-dialog
      title="请选择被关联的参数"
      :visible.sync="opentree"
      :modal="false"
      width="50%"
    >
      <div style="max-height:62vh;overflow:auto;">
      <el-tree
        :data="treedata"
        :props="defaultProps"
        @node-click="treeNodeClick"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span class="table-icon" v-if="data.type == 'param'"></span>
          <span>{{ node.label }}</span>
        </span>
      </el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="opentree = false">取 消</el-button>
        <el-button type="primary" @click="savetreenode()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- <el-dialog
      title="请选择被关联的参数"
      :visible.sync="opentree"
      :modal="false"
      width="50%"
    >
      <el-tree
        :data="treedata"
        :props="defaultProps"
        @node-click="treeNodeClick"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span class="table-icon" v-if="data.type == 'param'"></span>
          <span>{{ node.label }}</span>
        </span>
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="opentree = false">取 消</el-button>
        <el-button type="primary" @click="savetreenode()">确 定</el-button>
      </span>
    </el-dialog> -->
  </div>
</template>
<script>
import $ from "jquery";
import seeSqlData from "@/views/analysis/modelparam/paramManager/seesqldata";
import { getUuid } from "@/api/analysis/common";
import request from "@/utils/request";
export default {
  props: ["selectTreeNode", "operationObj"],
  components: { seeSqlData },
  data() {
    return {
      nownode: {},
      relationFiledoptions: [],
      relationLogicoptions: [
        { value: "=", label: "等于" },
        { value: "<>", label: "不等于" },
        { value: ">", label: "大于" },
        { value: ">=", label: "大于等于" },
        { value: "<", label: "小于" },
        { value: "<=", label: "小于等于" },
        { value: "charindex > 0", label: "包含" },
        { value: "charindex < 0", label: "不包含" },
        { value: "LLike", label: "起始于" },
        { value: "RLike", label: "结束于" },
        { value: "AllLike", label: "匹配" },
        { value: "not like", label: "不匹配" },
        { value: "in", label: "属于任一" },
        { value: "not in", label: "不属于任一" },
      ],
      relationParamUuidoptions: [],
      relevancetreedata: [
        {
          type: "relation",
          relation: "and",
          children: [],
        },
      ],
      treedata: [], //被关联参数名称树
      checktreenode: {},
      defaultProps: {
        children: "children",
        label: "label",
      },
      opentree: false,
      rvaluelist: [], //被关联参数值列表
      rules: {
        paramName: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
        dataType: [
          { required: true, message: "请输入数据类型", trigger: "blur" },
        ],
        inputType: [
          { required: true, message: "请输入输入方式", trigger: "blur" },
        ],
      },
      relevancerules: {
        slaveParamName: [
          {
            required: true,
            message: "请选择被关联参数名称",
            trigger: "change",
          },
        ],
        slaveParamCol: [
          { required: true, message: "请选择被关联参数值", trigger: "change" },
        ],
        relationMode: [
          { required: true, message: "请选择关联参数值", trigger: "change" },
        ],
      },
      //关联表单
      relevanceform: {
        slaveParamUuid: "",
        slaveParamName: "",
        slaveParamCol: "",
        relationMode: "",
      },
      //关联列表
      relevanceData: [],
      //表单属性
      form: {
        useQuotation: "1",
        paramName: "",
        dataType: "",
        inputType: "",
        allowedNull: 1,
        dataLength: "",
        maxIntervalVal: "",
        maxIntervalUnit: "",
        formalType: "",
        description: "",
        example: "",
        folderId: "",
        paramChoice: {
          optionsSql: "",
          optionsSqlLine: "",
        },
      },
      baseName: "base",
      //页签属性
      activeName: "custom",
      analysisUrl: "/analysis",
      setJsonSelectValueData: {},
      dataTypes: [],
      maxIntervalUnits: [],
      inputTypes: [],
      SQLRuleDialog: false,
      //查看数据时候的sql
      seeDataSql: "",
      //数据类型
      map_data_input: {
        num: {
          type: ["textinp", "lineinp", "treeinp"],
        },
        str: {
          type: ["textinp", "lineinp", "treeinp"],
        },
        date: {
          type: ["timeinp"],
        },
      },
      //输入类型
      initivalInputtype: "",
      //数据类型
      initivalDatatype: "",
      inputTypeValueStr: null,
      //是否显示div
      isShowElement: {
        timeIntervalShow: false,
        formalTypeShow: false,
        alternateValueShow: false,
        SQLdtreeShow: false,
        dataLengthInterValShow: false,
        //日期单位
        dateFormatTag: false,
        //新增自定义日期格式
        customizeFormatTag: false,
      },
      //是否存储sql的标志位
      tabsigns: 0,
      //自定义静态值绑定
      customStaticValues: [],
      defaultExistsCustomStaticValues: {
        names: "",
        values: "",
        uuid: "123456",
      },
      //查看数据dialog
      seeSqlDataDialog: false,
      SQLRuleText: "",
      updateParamObj: {},
      sqlRulesDesc: {
        list: "格式：SELECT A,B FROM 模式.C\nA:真实值，B:显示值，若字段过多,则默认只使用前两列进行真实值与显示值的匹配",
        tree: "格式：SELECT A,B,C FROM 模式.D\nA:子项真实值，B:子项显示值，C：父项真实值，将使用【A】字段与【C】字段进行父子节点关系匹配，若字段过多（或者存在【*】），则默认只使用前三列进行匹配",
      },
      sqlRuleVisible1: true, // 控制SQL规则Popover1显隐
      sqlRuleVisible2: true, // 控制SQL规则Popover2显隐
    };
  },
  watch: {
    baseName(val) {
      if ((val = "condition")) {
        let sql = this.form.paramChoice.optionsSqlLine
        if(this.isShowElement.SQLdtreeShow){
          sql = this.form.paramChoice.optionsSql
        }
        request({
          baseURL: "/analysis",
          url:
            "/paramController/getSqlCols",
          method: "post",
          params: {sql: sql}
        }).then((result) => {
          this.relationFiledoptions = result.data;
        });
      }
    },
  },
  created() {
    //初始化文件夹编号
    this.form.folderId = this.selectTreeNode.id;
    this.maxIntervalUnits = this.setJsonSelectValue(
      "maxIntervalUnit",
      "/paramController/loadDict?codeType=maxIntervalUnit"
    );
    this.dataTypes = this.setJsonSelectValue(
      "dataType",
      "/paramController/loadDict?codeType=dataType"
    );
    this.inputTypeValueStr = this.setJsonSelectValue(
      "inputType",
      "/paramController/loadDict?codeType=inputType",
      "",
      ""
    );
  },
  mounted() {
    if (this.operationObj.operationType == 2) {
      //反显参数数据
      this.displayParamData();
    }
  },
  methods: {
    loadNewData2(){
      this.$refs['seeSqlData'].loadNewData()
    },
    addrelevancetreenode(data, node) {
      const newChild = {
        type: "relation",
        relation: "and",
        children: [],
      };
      if (!data.children) {
        this.$set(data, "children", []);
      }
      data.children.push(newChild);
    },
    remrelevancetreenode(data, node) {
      if (node.parent.data.children != null) {
        const parent = node.parent;
        const children = parent.childNodes;
        const index = children.findIndex((d) => d.id === node.id);
        parent.data.children.splice(index, 1);
      } else {
        this.$message({ message: "请不要删除根节点" });
      }
    },
    addrelevancetreechild(data, node) {
      const newChild = {
        type: "logic",
        value: {
          relationFiled: "",
          relationLogic: "",
          relationParamUuid: "",
          relationParamName: "",
        },
      };
      if (!data.children) {
        this.$set(data, "children", []);
      }
      data.children.push(newChild);
    },
    treeNodeClick(data) {
      this.checktreenode = data;
    },
    savetreenode() {
      this.nownode.data.value.relationParamName = this.checktreenode.name;
      this.nownode.data.value.relationParamUuid = this.checktreenode.id;
      this.opentree = false;
    },
    getParamsTreeList() {
      request({
        baseURL: "/analysis",
        url: "/ParamFolderController/getParamsTree",
        method: "get",
      }).then((result) => {
        if (result.data) {
          this.treedata = result.data.paramNode;
        }
      });
    },
    getrvaluelist() {
      request({
        baseURL: "/analysis",
        url: "/paramController/getSqlCols",
        method: "post",
        params: {
          sql: this.checktreenode.extMap.OPTIONSSQL
        }
      }).then((result) => {
        this.rvaluelist = result.data;
      });
    },
    addrelevance(item) {
      this.$refs.relevance.validate((valid) => {
        if (valid) {
          this.relevanceData.push(JSON.parse(JSON.stringify(item)));
        } else {
          return false;
        }
      });
    },
    delrelevance(item, index) {
      this.relevanceData.splice(index, 1);
    },
    choosetree(data, node) {
      this.nownode = node;
      this.getParamsTreeList();
      this.opentree = true;
    },
    displayParamData() {
      let that = this;
      $.post(
        this.analysisUrl + "/paramController/findByUuid",
        { ammParamUuid: this.operationObj.paramUuid },
        function (e) {
          that.updateParamObj = e.data;
          var data = e.data; //参数基本信息
          if (data != null && data != "") {
            that.form.paramName = data.paramName;
            that.form.dataType = data.dataType;
            that.form.useQuotation = data.useQuotation;
            that.changeValue(data.dataType);
            that.form.inputType = data.inputType;
            that.changeInputType(data.inputType);
            if (data.paramCondition.length > 0) {
              // that.relevancetreedata = [
              //   that.arrangementtree(data.paramCondition[0]),
              // ];
              // 处理关联条件参数数据让其展示形式层级更明显
              that.relevancetreedata = that.arrangementtreeSort([that.arrangementtree(data.paramCondition[0]),]);
            }
            // if (data.paramRelationList) {
            //   that.relevanceData = data.paramRelationList;
            // } else {
            //   that.relevanceData = [];
            // }
            if (data.inputType == "textinp") {
              that.form.dataLength = data.dataLength;
            }
            that.form.example = data.example;
            if (data.paramChoice) {
              that.form.formalType = data.paramChoice.choiceType;
              that.form.allowedNull = data.paramChoice.allowedNull;
              $("#choiceUuid").val(data.paramChoice.ammParamChoiceUuid);
              if (data.paramChoice.ammParamChoiceUuid) {
                if (
                  data.paramChoice.ammParamOptionsList &&
                  data.paramChoice.ammParamOptionsList.length > 0
                ) {
                  that.tabsigns = 0;
                  for (
                    var i = 0;
                    i < data.paramChoice.ammParamOptionsList.length;
                    i++
                  ) {
                    if (i == 0) {
                      that.defaultExistsCustomStaticValues.names =
                        data.paramChoice.ammParamOptionsList[i].optionsName;
                      that.defaultExistsCustomStaticValues.values =
                        data.paramChoice.ammParamOptionsList[i].optionsVal;
                      that.defaultExistsCustomStaticValues.uuid =
                        data.paramChoice.ammParamOptionsList[
                          i
                        ].ammParamOptionsUuid;
                    } else {
                      //整理数据对象
                      that.customStaticValues.push({
                        names:
                          data.paramChoice.ammParamOptionsList[i].optionsName,
                        values:
                          data.paramChoice.ammParamOptionsList[i].optionsVal,
                        uuid: data.paramChoice.ammParamOptionsList[i]
                          .ammParamOptionsUuid,
                      });
                    }
                  }
                } else {
                  that.tabsigns = 1;
                  if (data.inputType == "treeinp") {
                    that.form.paramChoice.optionsSql =
                      data.paramChoice.optionsSql;
                  } else {
                    that.activeName = "SQL";
                    that.form.paramChoice.optionsSqlLine =
                      data.paramChoice.optionsSql;
                  }
                }
              }
            }

            that.form.description = data.description;
            if (data.paramTimes) {
              $("#timesUuid").val(data.paramTimes.ammParamTimesUuid);
              that.form.timeFormat = data.paramTimes.timeFormat;
              if (that.form.timeFormat == "other") {
                that.isShowElement.customizeFormatTag = true;
                that.form.customizeFormat = data.paramTimes.customizeFormat;
              }
              that.form.maxIntervalVal = data.paramTimes.maxIntervalVal;
              if (
                null != data.paramTimes.ammParamTimesUuid &&
                "" != data.paramTimes.ammParamTimesUuid
              ) {
                that.form.maxIntervalUnit = data.paramTimes.maxIntervalUnit;
              }
            }
          }
        },
        "json"
      );
      // $.post(
      //   this.analysisUrl + "/paramConditionController/ParamTreeByParamId",
      //   { paramUuid: this.operationObj.paramUuid },
      //   function (e) {
      //     console.log(e)
      //   },
      //   "json"
      // );
    },
    // 修改关联条件参数数据的顺序
    arrangementtreeSort (relevancetreedata) {
      const traverse = function(relevancetreedata) {
        relevancetreedata.map(i => {
          if (i.children) {
            let arr = [];
            i.children.map(j => {
              if (!j.children) { // 本层及数据优先push
                arr.unshift(j);
              }
              else { // 子集最后在push
                arr.push(j);
              }
            })
            i.children = arr;
            traverse(i.children)
          }
        })
      };
      traverse(relevancetreedata);
      return relevancetreedata

    },
    //整理参数条件树数据
    arrangementtree(obj) {
      let rep = {};
      if (obj.label == "and" || obj.label == "or") {
        rep.id = obj.id;
        rep.type = "relation";
        rep.relation = obj.label;
        rep.children = [];
      } else {
        rep.id = obj.id;
        rep.type = "logic";
        rep.value = {
          relationFiled: obj.extMap.relationFiled,
          relationLogic: obj.extMap.relationLogic,
          relationParamUuid: obj.extMap.relationParamUuid,
          relationParamName: obj.extMap.relationParamName,
        };
      }
      if (obj.children) {
        for (let i = 0; i < obj.children.length; i++) {
          rep.children.push(this.arrangementtree(obj.children[i]));
        }
      }
      return rep;
    },
    setJsonSelectValue(selectId, url) {
      let result;
      let that = this;
      var data;
      $.ajax({
        url: this.analysisUrl + url,
        cache: true,
        type: "POST",
        async: false,
        dataType: "json",
        success: function (redata, textStatus, jqXHR) {
          result = JSON.parse(redata.data);
        },
        error: function (data, textStatus, jqXHR) {
          alertMsg(
            "提示",
            "加载数据字典" +
              textStatus +
              ",selectId:" +
              selectId +
              ",url:" +
              url,
            "error"
          );
        },
      });
      return result;
    },
    // optionsSqllineplaceholders_1(){
    //   return "格式：SELECT A,B FROM 模式.C\n" +
    //           "A:真实值，B:显示值，若字段过多,则默认只使用前两列进行真实值与显示值的匹配";
    // },
    // optionsSqllineplaceholders_2(){
    //   return "格式：SELECT A,B,C FROM 模式.D\n" +
    //           "A:子项真实值，B:子项显示值，C：父项真实值，将使用【A】字段与【C】字段进行父子节点关系匹配，若字段过多（或者存在【*】），则默认只使用前三列进行匹配"
    // },
    changeInputType(inputTypeValue) {
      if (inputTypeValue != "") {
        if (inputTypeValue == "timeinp") {
          //日期选择器
          this.isShowElement.timeIntervalShow = true;
          this.isShowElement.formalTypeShow = false;
          this.isShowElement.alternateValueShow = false;
          this.isShowElement.dataLengthInterValShow = false;
          this.isShowElement.SQLdtreeShow = false;
          this.isShowElement.dateFormatTag = true;
        } else if (inputTypeValue == "lineinp") {
          //下拉列表
          this.isShowElement.timeIntervalShow = false;
          this.isShowElement.formalTypeShow = true;
          this.isShowElement.alternateValueShow = true;
          this.isShowElement.dataLengthInterValShow = false;
          this.isShowElement.SQLdtreeShow = false;
          this.isShowElement.dateFormatTag = false;
        } else if (inputTypeValue == "treeinp") {
          //下拉树
          this.isShowElement.timeIntervalShow = false;
          this.isShowElement.formalTypeShow = true;
          this.isShowElement.alternateValueShow = false;
          this.isShowElement.dataLengthInterValShow = false;
          this.isShowElement.SQLdtreeShow = true;
          this.tabsigns = 1;
          this.isShowElement.dateFormatTag = false;
        } else {
          //文本
          this.isShowElement.timeIntervalShow = false;
          this.isShowElement.formalTypeShow = false;
          this.isShowElement.alternateValueShow = false;
          this.isShowElement.dataLengthInterValShow = true;
          this.isShowElement.SQLdtreeShow = false;
          this.isShowElement.dateFormatTag = false;
        }
      }
    },
    changeValue(dataTypeValue) {
      this.inputTypes = [];
      this.form.inputType = "";
      for (var i = 0; i < this.inputTypeValueStr.length; i++) {
        if (dataTypeValue == "" || dataTypeValue == null) {
          this.inputTypes = [];
        } else {
          var typesz = this.map_data_input[dataTypeValue].type;
          if (typesz.indexOf(this.inputTypeValueStr[i].codeValue) > -1) {
            this.inputTypes.push(this.inputTypeValueStr[i]);
          }
        }
      }
    },
    //更改日期格式-其他
    changeTimeValue(dataTypeValue) {
      if (dataTypeValue == "other") {
        this.isShowElement.customizeFormatTag = true;
      } else {
        this.isShowElement.customizeFormatTag = false;
      }
    },
    tabsigntree() {
      if (this.activeName === "SQL") {
        this.tabsigns = 1;
      } else {
        this.tabsigns = 0;
      }
    },
    addStaticData() {
      this.customStaticValues.push({ names: "", values: "", uuid: getUuid() });
    },
    deleteStaticData(index) {
      this.customStaticValues.splice(index, 1);
    },
    okBtn() {
      this.baseName = "base";
      let _this = this;
      setTimeout(function () {
        _this.$refs["ruleForm"].validate((valid) => {
          if (valid) {
            if (_this.operationObj.operationType == 1) {
              _this.saveParam();
            } else {
              _this.updateParam();
            }
          } else {
            console.log("error submit!!");
            return false;
          }
        });
      }, 500);
    },
    /**
     * 保存参数
     */
    saveParam() {
      let that = this;
      var paramName = this.form.paramName;
      var dataType = this.form.dataType;
      var inputType = this.form.inputType;
      var example = (this.form.inputType!='lineinp'&&this.form.inputType!='treeinp')?this.form.example:'';
      var dataLength = this.form.dataLength;
      var ammParamTypeUuid = this.form.paramName;
      var description = this.form.description;
      var folderId = this.form.folderId;
      var allowedNull = this.form.allowedNull;
      var dataParam = {
        "param.paramName": paramName,
        "param.dataType": dataType,
        "param.inputType": inputType,
        "param.example": this.isShowElement.dataLengthInterValShow ? example : null,
        "param.dataLength": dataLength,
        "param.description": description,
        "param.ammParamTypeUuid": ammParamTypeUuid,
        "paramChoice.allowedNull": allowedNull,
        "param.signForSql": this.tabsigns,
        "param.paramFolderUuid": folderId,
        "param.useQuotation": this.form.useQuotation,
        paramConditionList: JSON.stringify(this.relevancetreedata),
        // paramRelationList: JSON.stringify(this.relevanceData),
      };
      if (inputType != "lineinp" && inputType != "treeinp") {
        delete dataParam.paramConditionList;
      }
      if (paramName === "") {
        this.$message({ type: "info", message: "参数名不能为空!" });
        return;
      } else if (dataType === "") {
        this.$message({ type: "info", message: "数据类型不能为空!" });
        return;
      } else if (inputType === "") {
        this.$message({ type: "info", message: "输入类型不能为空!" });
        return;
      }

      //时间间隔相关代码 注释掉，好像没用
      /*      if(this.isShowElement.timeIntervalShow){
        dataParam["paramTimes.maxIntervalUnit"] = $("#maxIntervalUnit").val();
        dataParam["paramTimes.maxIntervalVal"] = $("#maxIntervalVal").val();
      }*/
      //新增时间格式
      if (this.isShowElement.dateFormatTag) {
        dataParam["paramTimes.timeFormat"] = this.form.timeFormat;
        dataParam["paramTimes.customizeFormat"] = this.form.customizeFormat;
      }

      if (this.isShowElement.formalTypeShow) {
        dataParam["paramChoice.choiceType"] = this.form.formalType;
      }
      if (this.isShowElement.SQLdtreeShow) {
        dataParam["paramChoice.optionsSql"] = this.form.paramChoice.optionsSql;
      }
      if (this.isShowElement.alternateValueShow) {
        if (this.activeName === "SQL") {
          dataParam["paramChoice.optionsSql"] =
            this.form.paramChoice.optionsSqlLine;
        }
        if (this.activeName === "custom") {
          delete dataParam.paramConditionList;
          var names = [];
          var value = [];
          // this.customStaticValues.push(this.defaultExistsCustomStaticValues);
          // 新增参数顺序
          names.push(this.defaultExistsCustomStaticValues.names);
          value.push(this.defaultExistsCustomStaticValues.values);
          for (let i = 0; i < this.customStaticValues.length; i++) {
            names.push(this.customStaticValues[i].names);
            value.push(this.customStaticValues[i].values);
          }
          dataParam["paramOptions.optionsNames"] = names.join(",");
          dataParam["paramOptions.optionsVals"] = value.join(",");
        }
      }
      $.ajax({
        url: this.analysisUrl + "/paramController/addParam",
        method: "POST",
        cache: false,
        dataType: "json",
        data: dataParam,
        async: false,
        success: function (data, textStatus, jqXHR) {
          if (data.code == 0) {
            that.$notify({
              title: "成功",
              message: "新建成功！",
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
            that.$emit("refshParamList");
          } else {
            that.$message({
              type: "error",
              message: "程序发生异常，请联系管理员!",
            });
          }
        },
        error: function () {
          that.$message({
            type: "error",
            message: "程序发生异常，请联系管理员!",
          });
        },
      });
    },
    /**
     *修改参数
     */
    updateParam() {
      let that = this;
      var paramName = this.form.paramName;
      var dataType = this.form.dataType;
      var inputType = this.form.inputType;
      var example = (this.form.inputType!='lineinp'&&this.form.inputType!='treeinp')?this.form.example:'';
      var dataLength = this.form.dataLength;
      var ammParamTypeUuid = this.form.paramName;
      var description = this.form.description;
      var folderId = this.form.folderId;
      var allowedNull = this.form.allowedNull;
      var paramUuid = this.updateParamObj.ammParamUuid;
      var dataParam = {
        "param.ammParamUuid": paramUuid,
        "param.paramName": paramName,
        "param.dataType": dataType,
        "param.inputType": inputType,
        "param.example": this.isShowElement.dataLengthInterValShow ? example : null,
        "param.dataLength": dataLength,
        "param.description": description,
        "param.ammParamTypeUuid": ammParamTypeUuid,
        "paramChoice.allowedNull": allowedNull,
        "param.signForSql": this.tabsigns,
        "param.paramFolderUuid": folderId,
        "param.useQuotation": this.form.useQuotation,
        paramConditionList: JSON.stringify(this.relevancetreedata),
        // paramRelationList: JSON.stringify(this.relevanceData),
      };
      if (inputType != "lineinp" && inputType != "treeinp") {
        delete dataParam.paramConditionList;
      }
      if (paramName === "") {
        this.$message({ type: "info", message: "参数名不能为空!" });
        return;
      } else if (dataType === "") {
        this.$message({ type: "info", message: "数据类型不能为空!" });
        return;
      } else if (inputType === "") {
        this.$message({ type: "info", message: "输入类型不能为空!" });
        return;
      }

      if (this.isShowElement.timeIntervalShow) {
        dataParam["paramTimes.maxIntervalUnit"] = $("#maxIntervalUnit").val();
        dataParam["paramTimes.maxIntervalVal"] = $("#maxIntervalVal").val();
        dataParam["paramTimes.ammParamTimesUuid"] = $("#timesUuid").val();
      }
      //新增时间格式
      if (this.isShowElement.dateFormatTag) {
        dataParam["paramTimes.ammParamTimesUuid"] = $("#timesUuid").val();
        dataParam["paramTimes.timeFormat"] = this.form.timeFormat;
        dataParam["paramTimes.customizeFormat"] = this.form.customizeFormat;
      }

      if (this.isShowElement.formalTypeShow) {
        dataParam["paramChoice.choiceType"] = this.form.formalType;
      }
      if (this.isShowElement.SQLdtreeShow) {
        dataParam["paramChoice.optionsSql"] = this.form.paramChoice.optionsSql;
      }
      if (this.isShowElement.alternateValueShow) {
        if (this.activeName === "SQL") {
          dataParam["paramChoice.optionsSql"] =
            this.form.paramChoice.optionsSqlLine;
        }
        if (this.activeName === "custom") {
          delete dataParam.paramConditionList;
          var names = [];
          var value = [];
          var uuids = [];
          // this.customStaticValues.push(this.defaultExistsCustomStaticValues);
          // 修改参数顺序
          names.push(this.defaultExistsCustomStaticValues.names);
          value.push(this.defaultExistsCustomStaticValues.values);
          uuids.push(this.defaultExistsCustomStaticValues.uuid);
          for (let i = 0; i < this.customStaticValues.length; i++) {
            names.push(this.customStaticValues[i].names);
            value.push(this.customStaticValues[i].values);
            uuids.push(this.customStaticValues[i].uuid);
          }
          dataParam["paramOptions.optionsNames"] = names.join(",");
          dataParam["paramOptions.optionsVals"] = value.join(",");
          dataParam["paramOptions.optionsUuids"] = uuids.join(",");
        }
        dataParam["paramChoice.ammParamChoiceUuid"] = $("#choiceUuid").val();
      }
      $.ajax({
        url: this.analysisUrl + "/paramController/editParam",
        method: "POST",
        cache: false,
        dataType: "json",
        data: dataParam,
        async: false,
        success: function (data, textStatus, jqXHR) {
          if (data.code == 0) {
            that.$notify({
              title: "成功",
              message: "修改成功！",
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
            that.$emit("refshParamList");
          } else {
            that.$message({
              type: "error",
              message: "程序发生异常，请联系管理员!",
            });
          }
        },
        error: function () {
          that.$message({
            type: "error",
            message: "程序发生异常，请联系管理员!",
          });
        },
      });
    },
    /**
     * sql预览
     * @param type 1、SQL列表  2、树
     */
    sqlPreview(type) {
      var sql = "";
      if (type == 1) {
        sql = $("#optionsSqlline").val();
      } else {
        //type==2
        sql = $("#optionsSql").val();
      }
      this.seeDataSql = sql;
      this.seeSqlDataDialog = true;
    },
    /**
     * 查看sql规则
     * @param type 1列表 2树
     */
    viewSqlRule(type) {
      // this.SQLRuleDialog = true;
      this.SQLRuleText = this.getSqlRule(type);
      this.$nextTick(() => {
         if (type == 1) {
          this.sqlRuleVisible1 = !this.sqlRuleVisible1
          this.sqlRuleVisible2 = false
        } else {
          this.sqlRuleVisible2 = !this.sqlRuleVisible2
          this.sqlRuleVisible1 = false
        }
      })
    },
    /**
     * 获取sql规则
     * @param type 1列表 2树
     */
    getSqlRule(type) {
      let sqlRule = "";
      switch (type) {
        case 1:
          sqlRule = this.sqlRulesDesc.list;
          break;
        case 2:
          sqlRule = this.sqlRulesDesc.tree;
          break;
        default:
          break;
      }
      return sqlRule;
    },
  },
};
</script>
<style scoped>
.table-icon {
  display: inline-block;
  margin: 0 5px 0 0;
  width: 16px;
  height: 16px;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OUY3NkIwMTMzOTA3MTFFQjg3QjRGMTYwQ0VBMTUzOTkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OUY3NkIwMTQzOTA3MTFFQjg3QjRGMTYwQ0VBMTUzOTkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5Rjc2QjAxMTM5MDcxMUVCODdCNEYxNjBDRUExNTM5OSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5Rjc2QjAxMjM5MDcxMUVCODdCNEYxNjBDRUExNTM5OSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PuV6ScgAAAAGUExURbW1tf///x1VJNcAAAACdFJOU/8A5bcwSgAAABhJREFUeNpiYKAGYAQCJIIYgUFqBkCAAQAvrgBt23pN5QAAAABJRU5ErkJggg==);
}
.relationaddicon {
  color: #559ed4;
  font-size: 20px;
  margin-left: 5px;
}
.addparambox >>> .el-tree-node__content {
  height: 40px !important;
}
>>> .sqlRule-dia {
  min-height: 510px;
}
>>> .sqlRule-dia .el-textarea {
  margin-top: 35px;

}
.sqlRule-input {
  margin-bottom: 15px;

}
</style>
