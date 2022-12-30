<template>
  <div class="_width  resources">
    <!-- 基本信息详情 -->
    <div class="top_tag">
      <ul>
        <li class="navgatorLi"
            :class="{'isActive': index===navgatorIndex}"
            @click="handleLeft(index)"
            v-for="(item,index) in tag"
            :key="item">{{item}}</li>
      </ul>
    </div>
    <div class="right_details"
         id="right_details"
         ref="element">

      <div class="rightList">
        <!-- 基本信息 -->
        <div class="information rightList_child"
             id="id0">
          <h2 :class="{'isActive': navgatorIndex == 0}">基本信息</h2>
          <div class="information_form padding10"
               :class="isDisable_input == true ?'is_disabled':'yes_disabled'">
            <el-form ref="form"
                     :model="form"
                     label-width="80px">
              <el-form-item label="表名称："
                            prop="tbName">
                <el-input v-model="form.tbName"
                          :disabled="disabled"></el-input>
              </el-form-item>
              <el-form-item label="表中文名："
                            prop="chnName">
                <el-input v-model="form.chnName"
                          @input="change($event)"
                          :disabled="isDisable_input"></el-input>
              </el-form-item>
              <el-form-item label="表说明：">
                <el-input v-model="form.tableRemarks"
                          style="resize:none;"
                          @input="change($event)"
                          :disabled="isDisable_input"
                          type="textarea"></el-input>
              </el-form-item>

              <div class="son">
                <el-form-item label="资源编码："
                              prop="tableCode">
                  <el-input type="text"
                            :disabled="isDisable_input"
                            @input="change($event)"
                            v-model="form.tableCode"
                            :rows="4">
                  </el-input>
                </el-form-item>
                <el-form-item label="资源类型：">
                  <el-select v-model="form.tableType"
                             @input="change($event)"
                             :disabled="isDisable_input">
                    <el-option v-for="item in data_type"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value" />
                  </el-select>
                </el-form-item>
              </div>

              <div class="son">
                <el-form-item label="资产主题：">
                  <el-select v-model="form.tableThemeId"
                             @input="change($event)"
                             @change="tableThemeName_change"
                             :disabled="isDisable_input">
                    <el-option v-for="item in next_data.themeList"
                               :key="item.codeUuid"
                               :label="item.codeName"
                               :value="item.codeUuid" />
                  </el-select>
                </el-form-item>
                <el-form-item label="资源分层：">
                  <el-select v-model="form.tableLayeredId"
                             @input="change($event)"
                             :disabled="isDisable_input">
                    <el-option v-for="item in next_data.layeredList"
                               :key="item.codeUuid"
                               :label="item.codeName"
                               :value="item.codeUuid" />
                  </el-select>
                </el-form-item>
              </div>

              <div class="son">
                <el-form-item label="所属系统：">
                  <el-select v-model="form.businessSystemId"
                             @input="change($event)"
                             :disabled="isDisable_input"
                             :rows="4">
                    <el-option v-for="item in next_data.businessSystemList"
                               :key="item.businessSystemUuid"
                               :label="item.businessSystemName"
                               :value="item.businessSystemUuid" />
                  </el-select>
                </el-form-item>
                <el-form-item label="文件名：">
                  <el-input :disabled="isDisable_input"
                            @input="change($event)"
                            v-model="form.fileName"
                            :rows="4"></el-input>
                </el-form-item>
              </div>

              <div class="son">
                <el-form-item label="数据日期：">
                  <el-date-picker format="yyyy-MM-dd"
                                  @input="change($event)"
                                  :disabled="isDisable_input"
                                  type="date"
                                  value-format="yyyy-MM-dd"
                                  @change="changeRelationParam"
                                  :rows="4"
                                  v-model="form.dataDate" />
                </el-form-item>
                <el-form-item label="表大小：">
                  <el-input placeholder="请输入表大小"
                            @input="change($event)"
                            :disabled="disabled"
                            v-model="form.tableSize"></el-input>
                </el-form-item>
              </div>

              <div class="son">
                <el-form-item label="数据数量：">
                  <el-input type="text"
                            :disabled="disabled"
                            @input="change($event)"
                            v-model="form.rowNum"
                            :rows="4">
                  </el-input>
                </el-form-item>
                <div class="son_people">
                  <el-form-item label="负责人：">
                    <el-input :disabled="disabled"
                              v-model="form.personLiables"></el-input>

                  </el-form-item>
                  <el-button type="primary"
                             :disabled="isDisable_input"
                             class="oper-btn"
                             @click="check_people()">选择</el-button>
                </div>
              </div>

              <div class="son">
                <el-form-item label="表分区:"
                              :disabled="disabled"
                              prop="partitions">
                  <div class="table">
                    <div class="head">
                      分区名称
                    </div>

                    <div v-if="form.partitions==null"> -- </div>
                    <div v-else>
                      <div v-for="
                         (item,index_partitions)
                         in
                         form.partitions"
                           :key="index_partitions"
                           class="li_son">
                        {{item}}
                        <div>{{item}}</div>
                      </div>
                    </div>

                  </div>
                </el-form-item>

                <el-form-item label="增全量：">
                  <el-select v-model="form.isSpike"
                             @input="change($event)"
                             :disabled="isDisable_input">
                    <el-option v-for="item in option_isSpike"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value" />
                  </el-select>
                </el-form-item>
              </div>

              <el-form-item label="数据标签：">
                <div class="input_blue"
                     @click="onclick_infotion_tag()">
                  <div v-for="(item,index) in TagsAll"
                       :key="index"
                       class="spanbox">
                    <span class="tagspan">{{item}}</span>
                    <i class="span_close"
                       @click="removeTag_infotion_tag(index,item)"></i>
                  </div>
                  <input v-model="search_name_infotion"
                         :disabled="isDisable_input"
                         @keyup.enter="addTags_infotion_tag"
                         @keyup.delete="deleteTags_infotion_tag"
                         :style="inputStyle"
                         class="inputTag"
                         ref="inputTag"
                         type="text" />
                </div>

              </el-form-item>

              <el-form-item label="表热度：">
                <ul class="Heat_ul _width">
                  <li v-for="(it,i) in Heat"
                      :key="i">
                    <p>{{it.name}}</p><span>{{it.num}}</span>
                  </li>
                </ul>
              </el-form-item>
              <div class="son">
                <el-button type="primary"
                           @click="previewSql()">查看SQL语句</el-button>
              </div>

            </el-form>
          </div>

        </div>
        <!-- 列信息 -->
        <div class="rightList_child"
             id="id1">
          <h2 :class="{'isActive': navgatorIndex == 1}">列信息</h2>
          <div class="padding10">
            <el-table :data="Column_tableData.colMetas"
                      style="width: 100%">
              <el-table-column prop="colName"
                               align="center"
                               label="字段名称">
              </el-table-column>
              <el-table-column prop="chnName"
                               align="center"
                               label="字段中文名">
              </el-table-column>
              <el-table-column prop="dataType"
                               align="center"
                               label="字段类型">
              </el-table-column>
              <el-table-column prop="dataLength"
                               align="center"
                               label="字段长度">
              </el-table-column>

              <!-- <el-table-column prop="address"
                               align="center"
                               label="字段说明">
              </el-table-column> -->

            </el-table>
          </div>
        </div>
        <!-- 索引信息 -->
        <div class="rightList_child"
             id="id2">
          <h2 :class="{'isActive': navgatorIndex == 2}">索引信息</h2>
          <div class="padding10">
            <el-table :data="Column_tableData_index"
                      style="width: 100%">
              <el-table-column prop="date"
                               label="名称">
              </el-table-column>
              <el-table-column prop="name"
                               label="类型">
              </el-table-column>
              <el-table-column prop="address"
                               label="列">
              </el-table-column>
              <el-table-column prop="address"
                               label="是否唯一">
              </el-table-column>

            </el-table>
          </div>
        </div>
        <!-- 数据表关联关系 -->
        <div class="rightList_child"
             id="id3">
          <h2 :class="{'isActive': navgatorIndex == 3}">数据表关联关系</h2>
          <div class="padding20"
               style="text-align: right;">
            <el-button type="primary"
                       :disabled="isDisable_input"
                       @click="add_table()">新增</el-button>
          </div>
          <div style="padding: 0 20px;"
               class="mose">

            <!-- 数据表关联关系 -->
            <ProcessTree :tableMetaUuid="tableMetaUuid"></ProcessTree>
            <div class="mose_bag"
                 v-if="isDisable_input== true"></div>
          </div>
        </div>
        <!-- 数据表关联关系 -->
        <div class="rightList_child"
             id="id4">
          <h2 :class="{'isActive': navgatorIndex == 4}">数据表字典信息</h2>
          数据表字典信息
          <div class="padding20">
            <!-- <LineMap></LineMap> -->
            <!-- <EditMap></EditMap> -->
          </div>

        </div>

        <div class="rightList_child"
             style="text-align: right;">
          <el-button type="primary"
                     @click="update_save()"
                     :disabled="isDisable_input">保存</el-button>
        </div>
      </div>
    </div>

    <!-- 查看sql -->
    <el-dialog title="查看sql"
               :close-on-click-modal="false"
               class="dlag_width"
               :visible.sync="visible_sql"
               width="40%">
      <div class="preview_sql">
        <el-input type="textarea"
                  style="resize:none;"
                  v-model="sql">
        </el-input>
      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="visible_sql = false">取 消</el-button>
        <el-button type="primary"
                   @click="visible_sql = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 新增关联关系 -->
    <el-dialog title="新增关联关系"
               class="dlag_width"
               :close-on-click-modal="false"
               :visible.sync="visibleTable"
               width="60%">
      <div>
        <div class="padding10">
          <el-button type="primary"
                     @click="addTable()">新增一行</el-button>
        </div>
        <el-table :data="tableData_relationship"
                  style="width: 100%">
          <el-table-column prop="date"
                           label="主表">
          </el-table-column>
          <el-table-column prop="name"
                           label="关联表">
          </el-table-column>
          <el-table-column prop="name"
                           label="表关联方式">
          </el-table-column>

          <el-table-column prop="address"
                           label="主表字段">
          </el-table-column>

          <el-table-column prop="address"
                           label="字段关联条件">
          </el-table-column>

          <el-table-column prop="address"
                           label="关联字段">
          </el-table-column>

          <el-table-column prop="address"
                           label="连接条件">
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="visibleTable = false">取 消</el-button>
        <el-button type="primary"
                   @click="save_table_go()">保存</el-button>
      </span>
    </el-dialog>

    <!-- 新增表关系 弹窗-->
    <el-dialog title="新增"
               :close-on-click-modal="false"
               class="dlag_width add_table_class"
               :visible.sync="add_table_visible"
               @close="handleClose_table('table_visible_form')"
               width="60%">
      <div class="information_form padding10">
        <el-form ref="table_visible_form"
                 :rules="rules_table"
                 :inline="false"
                 :model="table_visible_form"
                 label-width="90px">
          <el-form-item label="表名称："
                        prop="tbName">
            <el-input v-model="table_visible_form.tbName"></el-input>
          </el-form-item>
          <el-form-item label="字段名称："
                        prop="colName">
            <el-input v-model="table_visible_form.colName"></el-input>
          </el-form-item>
          <el-form-item label="从表名称："
                        prop="relationTableName">
            <el-input v-model="table_visible_form.relationTableName"></el-input>
          </el-form-item>

          <el-form-item label="从表字段："
                        prop="relationCol">
            <el-input v-model="table_visible_form.relationCol"></el-input>
          </el-form-item>

          <el-form-item label="关联关系："
                        prop="selectType">
            <el-select v-model="table_visible_form.selectType"
                       style="width:100%">
              <el-option v-for="item in relationship_option"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value" />
            </el-select>
          </el-form-item>

        </el-form>

      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="add_table_visible = false">取 消</el-button>
        <el-button type="primary"
                   @click="add_table_save('table_visible_form')">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 选择责任人 -->
    <el-dialog title="选择责任人"
               :close-on-click-modal="false"
               :visible.sync="resultShareDialogIsSee"
               width="50%">
      <personTree ref="orgPeopleTree"></personTree>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="close_people()">取 消</el-button>
        <el-button type="primary"
                   @click="modelResultShare()">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import ProcessTree from "@/components/directory/process_tree.vue"
import LineMap from "@/components/directory/lineMap.vue"
import EditMap from "@/components/directory/edit_map.vue"
import personTree from "@/components/publicpersontree/index";
import {
  relationship_save,//新增表关系
  getById//表关系列表
} from '@/api/data/dict'



import {
  getBasicInfo,//列表点击详情
  getColsInfo,//列信息
  updateTableInfo,//修改保存
  createSql,//查看sql
} from "@/api/data/table-info";
import {
  getListTree,//注册资产下一步
} from "@/api/lhg/register.js";
import { Query } from "leancloud-storage";
export default {
  components: {
    ProcessTree, LineMap, EditMap,
    personTree: () => import('@/components/publicpersontree/index')
  },
  props: {
    parentArr: {
      type: Array,
      default () {
        return []
      }
    },
    limit: {
      // 最多生成标签数量
      type: Number,
    },
    tableMetaUuid: {
      type: String,
      default () {
        return ''
      }
    },
    // isDisable_input: Boolean,

    isDisable_input: {
      type: Boolean,
      default () {
        return ''
      }
    },
    is_Edit_list: {
      type: Number,
      default () {
        return ''
      }
    }
    // tableRelationQueryUuid: {
    //   type: String,
    //   default () {
    //     return []
    //   }
    // },


  },
  data () {
    return {
      disabled: true,
      navgatorIndex: 0,
      listBoxState: true,//点击导航栏时，暂时停止监听页面滚动
      dom_scrollTop: 0,//元素滚动距离
      tag: ['基本信息', '列信息', '索引信息', '数据表关联关系', '数据表字典信息'],
      list_details: {},//基本信息
      // 基本信息
      form: {
        tableRelationQueryUuid: '',//id
        name: '',
        tbName: '',//表名称
        chnName: '',//中文名
        tableRemarks: '',//表说明
        tableCode: '',// 资产编码
        tableType: '',// 资产类型
        tableThemeName: '',//所属主题name
        tableThemeId: '',// 资产主题 id
        tableLayeredName: '',//资产分层
        tableLayeredId: '',//资产分层 id
        businessSystemName: '',//所属系统
        businessSystemId: '',//所属系统 id
        fileName: '',//文件名
        dataDate: '',//数据日期
        tableSize: '',//表大小:
        rowNum: '',//表数据量
        personName_str: [],//责任人
        personLiables: '',//负责人
        personUuid: '',//资产责任人
        partitions: '',//表分区
        isSpike: 1,//是否增量
      },
      tableData: [],

      Column_tableData_index: [],//索引信息
      TagsAll: ['aa'],
      inputLength: '',
      search_name_infotion: '',//标签

      next_data: [],// 点击下一步的数据
      // 增量全量
      option_isSpike: [
        {
          value: 0,
          label: '全量'
        },
        {
          value: 1,
          label: '增量'
        },
      ],
      // 是否推送
      // option_isSentFile: [
      //   {
      //     value: 0,
      //     label: '不推送'
      //   },
      //   {
      //     value: 1,
      //     label: '推送'
      //   },
      // ],
      data_type: [
        {
          value: 1,
          label: '表'
        }
      ],


      Heat: [
        { name: 'python工具引用次数', num: '99' },
        { name: 'python工具引用次数python工具引用次数', num: '99' },
        { name: 'python工具引用次数', num: '22' },
        { name: 'python工具引用次数', num: '99' },
        { name: 'python工具引用次数', num: '99' },
        { name: 'python工具引用次数', num: '99' },

      ],//表热度

      // 列信息
      Column_tableData: [],
      // 查看sql
      sql: '',
      visible_sql: false,//查看sql

      // 表关系
      visibleTable: false,//新增表关系
      tableData_relationship: [],//表关系列表
      add_table_visible: false,//新增一行表
      //新增的表关系信息
      table_visible_form: {
        tableMetaUuid: "ods>ods_xdhtb",
        tbName: "ods_xdhtb",// 表名称
        colName: "nbjgh",// 字段名称
        colMetaUuid: "ods>ods_xdhtb>6",
        relColMetaUuid: "ods>a01_atme>3",
        tableRelationUuid: "",
        relationTableName: "a01_atme",// 从表名称
        selectType: 1,//关联关系
        sqlGenJoinType: 2,
        relationCol: "eod_date",// 从表字段
        relTableMetaUuid: "ods>ods_xdhtb"
      },
      // 选择表关系
      relationship_option: [
        {
          value: 1,
          label: ' left join '
        },
        {
          value: 2,
          label: 'right join'
        },
        {
          value: 3,
          label: 'full join'
        },
        {
          value: 4,
          label: 'inner join'
        },

      ],
      rules_table: {
        tbName: [
          { required: true, message: '请输入字段名称', trigger: 'blur' },
        ],
        relationTableName: [
          { required: true, message: '请输入从表名称', trigger: 'blur' },
        ],
        relationCol: [
          { required: true, message: '请输入从表字段', trigger: 'blur' },
        ],
        selectType: [
          { required: true, message: '请选择关联关系', trigger: 'change' },
        ],
      },
      relationship: [
        {
          value: 1,
          label: '表'
        }
      ],
      resultShareDialogIsSee: false,//选择责任人

    };
  },
  computed: {
    inputStyle () {
      let style = {};
      style.width = `${this.inputLength}px`;
      return style;
    },
    finall () {
      return this.TagsAll.join(',')
    }
  },
  watch: {
    TagsAll () {
      this.$emit('on-change', this.TagsAll)
    },
    search_name_infotion (val) {
      this.inputLength = this.$refs.inputTag.value.length * 12 + 50;
    },
    parentArr () {
      this.TagsAll = this.parentArr.length ? this.parentArr : []
    }
  },
  mounted () {
    // let timeId;
    window.addEventListener('scroll', () => {
      // 页面滚动停止100毫秒后才会执行下面的函数。
      // clearTimeout(timeId);
      // timeId = setTimeout(() => {
      // this.scrollToTop();
      this.handleScroll()
      //   }, 100);
    }, true);


    // 查看||编辑
    // if (this.is_Edit_list == 1) {
    //   this.isDisable_input = false
    // }

  },
  created () {
    // this.$nextTick(function () {
    //   let height_conter = this.$refs.element.offsetHeight;  //100
    // })
    this.details(this.tableMetaUuid)
    this.table_list(this.tableMetaUuid)
    this.getListTree_data();//下拉框默认值
  },
  methods: {

    // 数据日期:
    changeRelationParam (value) {
      this.form.dataDate = value
    },
    // 更新视图
    change (e) {
      this.$forceUpdate()
    },
    // 资产主题
    tableThemeName_change (val) {
      this.form.tableThemeId = val
      this.next_data.themeList.forEach(item => {
        if (val == item.codeUuid) {
          this.form.tableThemeName = item.codeName
        }
      })
    },

    // 基本信息
    details (tableId) {
      this.form = JSON.parse(JSON.stringify(this.form));
      this.$forceUpdate()
      getBasicInfo(tableId).then(resp => {
        this.form = resp.data
        var _data = resp.data
        this.form.tbName = resp.data.tbName//表名称
        this.form.chnName = resp.data.chnName//中文名
        this.form.tableRemarks = resp.data.tableRelationQuery.tableRemarks//表说明
        this.form.tableSize = resp.data.tableSize//表大小
        this.form.rowNum = resp.data.rowNum//表数据量
        let tableCode = resp.data.tableRelationQuery.tableCode.substring(0, resp.data.tableRelationQuery.tableCode.lastIndexOf(">"))


        this.form.fileName = resp.data.tableRelationQuery.fileName//文件名
        this.form.tableCode = tableCode//资源编码
        //资源类型
        if (resp.data.tableRelationQuery.tableType == '1') {
          this.form.tableType = '表'
        } else {
          this.form.tableType = '视图'
        }
        this.form.tableRelationQueryUuid = resp.data.tableRelationQuery.tableRelationQueryUuid
        this.form.tableThemeId = resp.data.tableRelationQuery.tableThemeId//资源主题
        this.form.tableThemeName = resp.data.tableRelationQuery.tableThemeName//资源主题 name
        this.form.tableLayeredId = resp.data.tableRelationQuery.tableLayeredId//资源分层
        this.form.tableLayeredName = resp.data.tableRelationQuery.tableLayeredName//资源分层 name
        this.form.businessSystemId = resp.data.tableRelationQuery.businessSystemId//所属主题
        this.form.businessSystemName = resp.data.tableRelationQuery.businessSystemName//所属主题
        this.form.dataDate = resp.data.tableRelationQuery.dataDate//数据日期
        this.form.tableSize = resp.data.tableSize//数据数量：
        this.form.personName_str = resp.data.personLiables
        if (resp.data.personLiables.length !== 0) {
          let personName = []
          resp.data.personLiables.forEach(item => {
            personName.push(item.personName)
            // personUuid.push(item.personUuid)

            this.form.personLiables = personName.join(",");//负责人
            // this.form.personUuid = personUuid.join(",")
            // 

            // let objs = {
            //   personUuid: item.personUuid,
            //   personName: item.personName
            // }
            // 
            // this.form.personName_str.push(objs)
          })
          // this.form.personLiables = personName.join(",");//负责人

          // var personLiables = resp.data.personLiables.toString();//负责人
        } else {
          this.form.personLiables = '';
        }
        this.form.partitions = resp.data.partitions//表分区
        this.form.isSpike = resp.data.tableRelationQuery.isSpike//增量全量
      })
    },

    // 修改保存
    update_save () {
      var selectedNodes = this.$refs.orgPeopleTree.getSelectValue();
      var personLiables = [];
      // 
      // 如果修改了责任人
      if (selectedNodes) {
        selectedNodes.forEach(item => {
          let objs = {
            personUuid: item.personuuid,
            personName: item.cnname
          }
          personLiables.push(objs)
        })
      } else {
        this.form.personName_str.forEach(item => {
          let objs = {
            personUuid: item.personUuid,
            personName: item.personName
          }
          personLiables.push(objs)
        })
      }

      let params = {
        tableMetaUuid: this.tableMetaUuid,
        chnName: this.form.chnName,
        tableRelationQuery: {
          tableRelationQueryUuid: this.form.tableRelationQueryUuid,
          tableMetaUuid: this.tableMetaUuid,
          tableCode: this.form.tableCode,
          tableType: this.form.tableType,
          businessSystemId: this.form.businessSystemId,
          tableThemeId: this.form.tableThemeId,
          tableLayeredId: this.form.tableLayeredId,
          tableRemarks: this.form.tableRemarks,
          fileName: this.form.fileName,
          isSpike: this.form.isSpike,
          dataDate: this.form.dataDate
        },
        personLiables: personLiables,
      }

      updateTableInfo(params).then(resp => {
        if (resp.code == 0) {
          this.$message({
            type: "success",
            message: "修改成功!",
          });
          this.$emit("update_list");
        } else {
          this.$message({
            type: "error",
            message: resp.msg,
          });
        }
      })
    },



    //  列信息
    table_list (tableId) {
      getColsInfo(tableId).then((resp) => {
        // 
        this.Column_tableData = resp.data
        // 返回两个新的数组
        // this.oldName = resp.data.displayTbName;
        // this.tempTable.displayTbName = resp.data.displayTbName;
        // this.temp = resp.data.colMetas;
        // this.temp.forEach((row) => {
        //   this.$set(row, "tempIndex", ++this.tempIndex);
        //   this.changeDataType(row);
        // })
      });
    },

    // 下拉框默认值
    getListTree_data () {
      getListTree().then((res) => {
        this.next_data = res.data

        // if (res.data.contentsList.children) {
        //   this.next_contentsList = res.data.contentsList.children
        // }


        // this.next_contentsList.forEach(item => {
        //   // 所属目录三级联动判断
        //   if (item.children.length == 0) {
        //     item.children = undefined
        //   } else {
        //     this.formatCascaderData(item.children)
        //   }
        // })
        // businessSystemList//系统
        // contentsList//目录
        // layeredList//分层
        // themeList//主题

      })
    },
    // 选择责任人
    check_people () {
      this.resultShareDialogIsSee = true;
      // this.form.personLiables = '';
    },
    // 关闭 选择责任人
    close_people () {
      this.resultShareDialogIsSee = false
      this.$refs.orgPeopleTree.$emit('clear')//清空组件 值
    },


    // 确定责任人
    modelResultShare () {
      // this.listLoading = true;
      // var runTaskRelUuids = [];
      var personUuids = [];
      var personNames = [];
      var selectedNode = this.$refs.orgPeopleTree.getSelectValue();
      for (var i = 0; i < selectedNode.length; i++) {
        personUuids.push(selectedNode[i].personuuid);
        personNames.push(selectedNode[i].cnname);
        this.form.personLiables = personNames.join(",");
      }

      this.resultShareDialogIsSee = false;
    },




    // 点击导航菜单，页面滚动到指定位置
    handleLeft (index) {
      this.navgatorIndex = index;
      this.$el.querySelector(`#id${index}`).scrollIntoView({
        behavior: "smooth",  // 平滑过渡
        block: "start"  // 上边框与视窗顶部平齐。默认值
      });
      this.listBoxState = false;

      // let timeId;
      // clearTimeout(timeId);
      // timeId = setTimeout(() => {
      this.listBoxState = true;
      // }, 200);
    },
    handleScroll () {
      var dom_scrollTop = document.querySelector('#right_details').scrollTop;//获取监听指定区域滚动位置的值
      // let offsetTop = document.querySelector("#right_details").offsetTop; //获取固定元素初始滚动位置
      if (this.listBoxState) {//作用是点击导航栏时，延迟这里执行。
        this.tag.map((v, i) => {
          // 获取监听元素距离视窗顶部距离
          var offsetTop = document.getElementById(`id${i}`).offsetTop;
          // 获取监听元素本身高度
          var scrollHeight = document.getElementById(`id${i}`).scrollHeight;
          // 如果 dom滚动位置 >= 元素距离视窗距离 && dom滚动位置 <= 元素距离视窗距离+元素本身高度
          // 则表示页面已经滚动到可视区了。

          if (dom_scrollTop >= offsetTop && dom_scrollTop <= (offsetTop + scrollHeight)) {

            // 导航栏背景色选中
            this.navgatorIndex = i;
          }
        })
      }

    },
    // 删除标签
    removeTag_infotion_tag (index, item) {
      this.TagsAll.splice(index, 1)
    },

    //生成标签
    addTags_infotion_tag () {
      if (this.search_name_infotion) {
        this.TagsAll.push(this.search_name_infotion);
        this.search_name_infotion = '';
      }
    },
    //键盘删除键删除tag
    deleteTags_infotion_tag () {
      this.TagsAll.pop()
    },
    onclick_infotion_tag () {
      this.$nextTick(() => {
        this.$refs.inputTag.focus();
      })
    },
    // 查看sql
    previewSql () {
      this.visible_sql = true
      let params = {
        tableMetaUuid: this.tableMetaUuid
      }
      createSql(params).then(resp => {

        this.sql = resp.data
      })
    },


    // 新增 数据表关系列表
    add_table () {
      this.visibleTable = true;//数据表关系列表
      let tableId = this.tableMetaUuid
      getById(tableId).then(resp => {
        // this.tableData_relationship = resp.data


      })
    },
    // 新增一行表关系
    addTable () {
      this.add_table_visible = true;
      // 清空值
      // this.table_visible_form.tbName = '';
      // this.table_visible_form.colName = '';
      // this.table_visible_form.relationTableName = '';
      // this.table_visible_form.relationCol = '';
      // this.table_visible_form.selectType = '';
      // this.table_visible_form.sqlGenJoinType = '';
      // this.table_visible_form.relationCol = '';
      // this.table_visible_form.relTableMetaUuid = '';
    },

    // 保存新增的数据表
    add_table_save (table_visible_form) {
      this.$refs[table_visible_form].validate((valid) => {
        if (valid) {
          // let params = {
          //   arr: [
          //     {
          //       tableMetaUuid: this.table_visible_form.tableMetaUuid,
          //       tbName: this.table_visible_form.tbName,
          //       colName: this.table_visible_form.colName,
          //       colMetaUuid: this.table_visible_form.colMetaUuid,
          //       relColMetaUuid: this.table_visible_form.relColMetaUuid,
          //       tableRelationUuid: this.table_visible_form.tableRelationUuid,
          //       relationTableName: this.table_visible_form.relationTableName,
          //       selectType: this.table_visible_form.selectType,
          //       sqlGenJoinType: this.table_visible_form.sqlGenJoinType,
          //       relationCol: this.table_visible_form.relationCol,
          //       relTableMetaUuid: this.table_visible_form.relTableMetaUuid,
          //     },
          //   ]
          // }

          // 添加到外层列表

          // this.tableData_relationship.push(this.table_visible_form)
          // 



        } else {
          this.btnLoading = false;//保存loadnin
          this.$message({
            message: '请填写信息',
            type: 'info',
            showClose: true,
          })
          return false
        }
      })
    },


    // 关闭弹窗
    handleClose_table (table_visible_form) {
      this.$refs[table_visible_form].resetFields() //清空添加的值
    },
    // 保存新增表关系至列表
    save_table_go () {
      this.add_table_visible = false;

      relationship_save(params).then(resp => {

      })
    },


    beforeDestroy () {
      window.removeEventListener("scroll", this.scrollTop)
    },
  },

}
</script>

<style scoped >
.dlag_width >>> .el-dialog {
  min-width: 600px !important;
}
.resources {
  display: flex;
  /* overflow-y: auto; */
  /* height: 700px; */
  position: relative;
  height: calc(100vh - 180px);
}
.top_tag {
  width: 160px;
}
.navgatorLi {
  width: 100%;
  display: flex;
  border-top: none;
  font-size: 16px;
  height: 20px;
  cursor: pointer;
  text-align: left;
  margin-bottom: 20px;
  transition: 0.3s;
}
.isActive {
  color: #0271be;
  font-weight: 600;
  font-size: 18px;
}

.right_details {
  width: calc(100% - 160px);
  /* height: 900px; */
  overflow-y: auto;
}
.rightList {
}
.rightList .rightList_child {
  min-height: 600px;
  /* border: 1px solid red; */
  overflow-y: auto;
  margin-bottom: 30px;
}
.rightList .rightList_child h2 {
  font-size: 20px;
}
/* 基本信息 */
.information {
}
.information_form {
  box-sizing: border-box;
}
.information_form >>> .el-form-item {
  display: flex;
  margin-bottom: 20px !important;
}
.information_form >>> .el-form-item__content {
  flex: 1;
  margin-left: 0 !important;
}
.son {
  display: flex;
  justify-content: space-between;
}
.son >>> .el-form-item__content,
.son >>> .el-date-editor {
  /* width: 100%; */
  width: 300px;
}
.is_disabled >>> .el-textarea__inner {
  cursor: not-allowed !important;
}
.is_disabled >>> .el-textarea__inner {
  background-color: rgba(0, 0, 0, 0.05) !important;
}
.yes_disabled >>> .el-select,
.yes_disabled >>> .el-input__inner {
  background-color: #fff !important;
}
.son >>> .el-select {
  width: 100%;
}
/* 表热度 */
.Heat_ul {
  /* border: 1px solid; */
  float: left;
}

.Heat_ul li {
  float: left;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-right: 20px;
  margin-bottom: 20px;
  transition: all 0.3s;
  box-sizing: border-box;
  /* border-bottom: 1px solid #fff; */
  /* padding: 0 10px; */
  height: 40px;
  line-height: 40px;
  width: 20%;
}
.Heat_ul li p {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  color: #5f9fcb;
  transition: color 0.3s;
}
/* .Heat_ul div .null_click:hover p {
  color: #115f94 !important;
  cursor: pointer;
  text-decoration: underline;
  /* border-bottom: 1px solid #0271be; */
/* }  */
.Heat_ul li:nth-child(4n) {
  padding-right: 0 !important;
}
.Heat_ul li span {
  padding: 0 5px;
  color: #fff;
  background-color: #0271be;
  border-radius: 27em;
  margin-left: 3px;
  font-size: 14px;
  height: 25px;
  line-height: 25px;
}
/* 基本信息标签 */

.input_blue {
  /* width: 300px; */
  margin-right: 20px;
  flex: 1;
  box-sizing: border-box;
  background-color: white;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  font-size: 12px;
  text-align: left;
  /* padding-left: 5px; */
  word-wrap: break-word;
  overflow: hidden;
}
.spanbox {
  display: inline-block;
  font-size: 14px;
  margin: 3px 4px;
  background-color: rgb(229, 229, 229);
  border: 1px solid #e8eaec;
  border-radius: 3px;
}
.tagspan {
  height: 24px;
  line-height: 22px;
  max-width: 99%;
  position: relative;
  display: inline-block;
  padding-left: 8px;
  color: #495060;
  font-size: 14px;
  cursor: pointer;
  opacity: 1;
  vertical-align: middle;
  overflow: hidden;
  transition: 0.25s linear;
  color: rgb(26, 26, 26, 0.5);
}
.span_close {
  padding: 0 4px 0 4px;
  opacity: 1;
  -webkit-filter: none;
  filter: none;
  color: rgb(26, 26, 26, 0.5);
  font-weight: 200;
}
.span_close:after {
  content: "\00D7";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* line-height: 27px; */
  transition: 0.3s, color 0s;
}
.inputTag {
  font-size: 16px;
  border: none;
  box-shadow: none;
  outline: none;
  background-color: transparent;
  padding: 0;
  width: auto;
  min-width: 250px;
  vertical-align: top;
  height: 32px;
  color: #495060;
  line-height: 32px;
}
/* 基本信息 标签 :end */

.son_people {
  display: flex;
}
.son_people >>> .el-form-item__content {
  width: 237px;
}
.son_people >>> .el-button {
  margin-top: 5px;
  margin-left: 3px;
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
  padding: 10px;
  box-sizing: border-box;
}
.is_click:hover {
}

.add_table_class >>> .el-form-item__label {
  text-align: right !important;
}

.mose {
  position: relative;
}
.mose_bag {
  background: rgba(0, 0, 0, 0.2);
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 99;
}
.preview_sql >>> .el-textarea__inner {
  height: 300px;
}
</style>
