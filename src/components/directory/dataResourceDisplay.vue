<template>
  <div class="preview_conter padding10_l">
    <!-- 查询 -->
    <div class="header_search">
      <p>查询条件：</p>
      <div class="input_blue"
           @click="onclick()">
        <div v-for="(item,index) in TagsAll"
             :key="index"
             class="spanbox22">
          <span class="tagspan">{{item}}</span>
          <i class="span_close"
             @click="removeTag(index,item)"></i>
        </div>
        <!-- 输入框 -->
        <input placeholder="请输入，按<回车>以分隔"
               v-model="search_name"
               @keyup.enter="addTags"
               @keyup.delete="deleteTags"
               :style="inputStyle"
               class="inputTag"
               ref="inputTag"
               type="text" />
      </div>
      <el-button size="mini"
                 type="primary"
                 @click="search()">查询</el-button>
      <el-button size="mini"
                 type="info"
                 @click="clear_search()">重置</el-button>
    </div>
    <!-- 查询 end-->

    <!-- 是否显示按钮 数据注册显示 -->
    <div class="common_btn " v-if="isBtn == true">
      <div class="click_btn">
        <el-button type="primary">数据资源导入导出</el-button>
        <div class="show_btn">
          <el-button type="primary"
                     @click="down_template_dictionary()">模版下载</el-button>
          <el-button type="primary"
                     @click="Importdata_dictionary()">导入数据资源</el-button>
        </div>
      </div>

      <div class="click_btn">
        <el-button type="primary">汉化信息导入导出</el-button>
        <div class="show_btn">
          <el-button type="primary"
                     @click="down_template_cn()">模版下载</el-button>
          <el-button type="primary"
                     @click="Important_cn()">导入汉化信息</el-button>
        </div>
      </div>

      <div class="click_btn">
        <el-button type="primary">表关系导入导出</el-button>
        <div class="show_btn">
          <el-button type="primary"
                     @click="down_template_table()">模版下载</el-button>
          <el-button type="primary"
                     @click="Important_table()">导入表关系</el-button>
        </div>
      </div>

      <div class="click_btn">
        <el-button type="primary"
                   @click="sync_data()">同步数据结构</el-button>
      </div>

      <div class="click_btn">
        <el-button type="primary"
                   @click="Recognition()">认权管理</el-button>
      </div>

      <div class="click_btn">
        <el-button type="primary"
                   @click="on_register()">注册资产</el-button>
      </div>

      <div class="click_btn">
        <el-button type="primary"
                   @click="edit_list()">修改</el-button>
      </div>

    </div>

    <el-skeleton style="width:100%;float: left;height: calc(100vh - 280px)"
                 animated
                 :loading="list_loading"
                 :count="4">
      <template slot="template">
        <div class="box_ard">
          <div class="conter_list">

            <div class="box_ard_header">
              <el-skeleton-item variant="h3"
                                style="width: 30%;" />
            </div>
            <div class="new_left">
              <el-skeleton-item variant="image"
                                style="width: 130px; height: 130px;" />
            </div>
            <div class="new_right">
              <div class="table_type">
                <el-skeleton-item variant="h3"
                                  style="width: 10%;margin-right: 60px;" />
                <el-skeleton-item variant="h3"
                                  style="width: 10%;" />
              </div>
              <div class="text">
                <el-skeleton-item variant="h3"
                                  style="width: 30%;" />
                <el-skeleton-item variant="text"
                                  style="margin-right: 16px;" />
                <el-skeleton-item variant="text"
                                  style="width: 30%;" />
              </div>
              <div class="data_list">
                <el-skeleton-item variant="text"
                                  style="width: 10%;margin-right:20px" />
                <el-skeleton-item variant="text"
                                  style="width: 10%;" />
              </div>

            </div>
          </div>
        </div>
      </template>
      <div class="list_table"
           style="height: calc(100vh - 280px);overflow: auto;">
        <el-table ref="multipleTable"
                  :data="list"
                  style="width: 100%"
                  :show-overflow-tooltip='true'
                  :header-cell-class-name="headerCellClass"
                  :header-cell-style="tableHeaderColor"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection"
                           v-if="isBtn == true"
                           width="30">
          </el-table-column>
          <el-table-column>
            <template slot-scope="scope">
              <div class="box_ard">
                <div class="conter_list">
                  <div class="box_ard_header _width"
                       @click="on_deails(scope.row)">
                    <p class="new_num">{{scope.row.tbName}}</p>
                    <p class="new_title">{{scope.row.chnName}}</p>
                    <span class="new_type"
                          v-if="scope.row.tableRelationQuery">{{scope.row.tableRelationQuery.tableThemeName}}</span>
                  </div>

                  <div class="new_left padding10">
                    <div class="cover">
                      <!-- <img src="../../assets/img/msq.png"
                           alt=""> -->
                      <h2>{{scope.row.tableRelationQuery.tableLayeredName}}</h2>
                      <span class="_title">{{scope.row.tableRelationQuery.businessSystemName}}</span>
                    </div>

                  </div>

                  <div class="new_right">
                    <div class="table_type">
                      <div class="one tt">表关联数量：<span v-if="scope.row.relations">{{scope.row.relations.length}}</span>
                        <el-card class="show_tips"
                                 v-if="scope.row.relations.length!==0">
                          <p v-for="(its,index_relations) in scope.row.relations"
                             :key="index_relations">{{its.relationTableName}}</p>
                        </el-card>

                      </div>
                      <div class="two tt">使用此表模型数：<span>{{scope.row.models.length}}</span>
                        <el-card class="show_tips"
                                 v-if="scope.row.models.length!==0">
                          <p v-for="(it,index_model) in scope.row.models"
                             :key="index_model">{{it.MODEL_NAME}}</p>
                        </el-card>
                      </div>
                    </div>
                    <p class="text"
                       v-if="scope.row.tableRelationQuery">描述：{{scope.row.tableRelationQuery.tableRemarks}}</p>
                    <p class="text"
                       v-else>描述：暂无</p>
                    <p class="text"
                       v-if="scope.row.colMeta">字段：{{scope.row.colMeta}}</p>
                    <p class="text"
                       v-else>字段：暂无</p>

                    <div class="data_list">
                      <!-- {{scope.row.tableRelationQuery}} -->
                      <span class="data_time"
                            v-if="scope.row.tableRelationQuery.dataDate!=null">数据日期：{{scope.row.tableRelationQuery.dataDate}}</span>
                      <span class="data_time"
                            v-else>数据日期：暂无</span>
                      <span class="data_number">数据量 {{scope.row.rowNum}} 条</span>
                    </div>
                  </div>
                </div>

              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="padding10">
        <el-pagination @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"
                       :page-size="this.list_data.size"
                       background
                       :current-page-sync="this.list_data.current"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="this.list_data.total"></el-pagination>
      </div>

    </el-skeleton>
  </div>
</template>

<script>
// import { title } from 'process';

export default {
  components: {},
  props: {
    itemsArr: {
      type: Array,
      default () {
        return []
      }
    },
    limit: {
      // 最多生成标签数量
      type: Number,
    },
    list: {
      type: Array,
      default () {
        return []
      }
    },
    list_data: {
      type: Object,
      default: () => ({})
    },
    isBtn: Boolean,
    list_loading: Boolean,
  },
  data () {
    return {
      // list_loading: false,
      form: {
        title: '',
      },
      search_name: '',
      TagsAll: [],
      inputLength: '',
      // common_dialog: false,//导入数据源
      title: '',//弹窗共用标题
      check_list: [],//多选批量的数量
    };
  },
  created () {
    // if (this.list && this.list.length == 0) {
    //   this.list_loading = true;
    // } else {
    //   this.list_loading = false;

    // }
    // this.setLoading();
  },
  watch: {
    TagsAll () {
      this.$emit('on-change', this.TagsAll)
    },
    search_name (val) {
      this.inputLength = this.$refs.inputTag.value.length * 12 + 50;
    },
    itemsArr () {
      this.TagsAll = this.itemsArr.length ? this.itemsArr : []
    }
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
  mounted () {
    this.TagsAll = this.itemsArr;
  },
  methods: {
    // setLoading () {
    //   this.list_loading = true
    //   setTimeout(() => (this.list_loading = false), 2000)
    // },
    // 删除标签
    removeTag (index, item) {

      this.TagsAll.splice(index, 1)
    },
    //生成标签
    addTags () {
      if (this.search_name) {
        this.TagsAll.push(this.search_name);
        this.search_name = '';
      }
    },
    // 重置
    clear_search () {
      this.TagsAll = []
    },
    // 查询
    search () {

    },
    //键盘删除键删除tag
    deleteTags () {
      this.TagsAll.pop()
    },
    onclick () {
      this.$nextTick(() => {
        this.$refs.inputTag.focus();
      })
    },
    // 数据字典下载模版
    down_template_dictionary () {
      // if (this.check_list.length !== 0) {
      this.$emit("down_template_dictionary", this.check_list)
      // } else {
      //   this.$message({ type: "warning", message: "请选择一条数据进行下载" });
      // }
    },
    // 汉化模版下载
    down_template_cn () {
      if (this.check_list.length !== 0) {
        this.$emit("down_template_cn", this.check_list)
      } else {
        this.$message({ type: "warning", message: "请选择一条数据进行下载" });
      }
    },
    // 表关系下载模版
    down_template_table () {
      //  if (this.check_list.length !== 0) {
      this.$emit("down_template_table", this.check_list)
      // } else {
      //   this.$message({ type: "warning", message: "请选择一条数据进行下载" });
      // }
    },
    // 导入数据字典
    Importdata_dictionary () {
      // this.common_dialog = true;
      this.$emit("Importdata_dictionary", '导入数据字典')
    },
    // 导入汉化信息
    Important_cn () {
      this.$emit("Important_cn", '导入汉化信息')
    },
    //导入 表关系
    Important_table () {
      this.$emit("Important_table", '导入表关系')
    },
    // 同步数据机构
    sync_data () {
      if (this.check_list.length !== 0) {
        this.$emit("sync_data", this.check_list);
      } else {
        this.$message({ type: "warning", message: "请至少一条数据进行同步" });
      }
    },
    // 认权
    Recognition () {
      if (this.check_list.length !== 0) {
        this.$emit("Recognition", this.check_list);
      } else {
        this.$message({ type: "warning", message: "请至少选择一条数据进行认权" });
      }
    },
    // 注册资产
    on_register () {
      this.$emit("on_register", this.check_list);
    },
    // 修改
    edit_list () {
      if (this.check_list.length == 1) {
        this.$emit("edit_list", this.check_list);
      } else {
        this.$message({ type: "warning", message: "请选择一条数据进行修改" });
      }
    },
    // 设置条件隐藏多选
    headerCellClass (row) {
      if (row.columnIndex === 0) {
        return 'DisableSelection'
      }
    },
    // 如果list 没数据就隐藏全选
    tableHeaderColor ({ row, column, rowIndex, columnIndex }) {
      // 
      // if (row.length === 0) {
      // return 'display:none'
      // return 'border:1px solid red'
      // }
    },
    // 查看基本信息详情
    on_deails (data) {
      this.$emit("on_deails", data);
    },
    // 分页
    handleCurrentChange (val) {
      this.$emit("handleCurrentChange", val);
    },
    // 每页多少条
    handleSizeChange (val) {
      this.$emit("handleSizeChange", val);
    },
    // 全选
    handleSelectionChange (val) {
      this.check_list = val
    },
  }
}
</script>
<style scoped>
/* 操作btn */
.common_btn {
  box-sizing: border-box;
  float: left;
  display: block;
  width: 100%;
}
.common_btn >>> .el-button--medium {
  padding: 10px !important;
}
.click_btn {
  margin: 0 10px 10px;
  float: left;
}

.click_btn {
  position: relative;
}
.show_btn {
  border-radius: 10px;
  padding: 10px;
  box-sizing: border-box;
  position: absolute;
  top: 36px;
  left: 50%;
  opacity: 0;
  display: flex;
  justify-content: space-around;
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  -moz-transform: scale(0);
  -webkit-transform: scale(0);
  transform-origin: left top;
  z-index: 99;
  transition: all 0.35s;
}
.click_btn:hover .show_btn {
  top: 65px;
  zoom: 1;
  -moz-transform: scale(1);
  -webkit-transform: scale(1);
  opacity: 1 !important;
  transform: translate(-50%, -50%);
}

.preview_conter {
}
/* 搜索  */
.header_search {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
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
  padding-left: 5px;
  word-wrap: break-word;
  overflow: hidden;
}
.spanbox22 {
  display: inline-block;
  font-size: 14px;
  margin: 3px 0px 3px 4px;
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
  background-color: transitems;
  padding: 0;
  width: auto;
  min-width: 250px;
  vertical-align: top;
  height: 32px;
  color: #495060;
  line-height: 32px;
}
/* 搜索  end*/

/* 结果列表 */

.box_ard {
  display: flex;
  flex-wrap: wrap;
  background-color: #fff;
  /* margin-bottom: 20px; */
  border-radius: 15px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: 0.3s;
  margin: 10px 0;
}
.box_ard:hover {
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 5px 12px 0 rgb(0 0 0 / 10%);
}

.check {
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}
.conter_list {
  /* width: calc(100% - 40px); */
  width: 100%;
  box-sizing: border-box;
}
.box_ard_header {
  display: flex;
  /* padding: 10px 0; */
  margin-bottom: 10px;
  box-sizing: border-box;
  align-items: center;
}

.new_num {
  font-weight: 800;
  font-size: 18px;
  cursor: pointer;
}
.new_num:hover,
.new_title:hover {
  text-decoration: underline;
}

.new_title {
  margin: 0 10px;
  font-size: 18px;
  font-weight: 700;
  transition: color 0.3s;
  cursor: pointer;
}
.new_title:hover {
  color: rgba(0, 0, 0, 1);
}

.new_type {
  font-size: 16px;
  background: #e7ecff;
  color: #677ccd;
  margin: 0 10px;
  padding: 4px 10px;
}

.new_left {
  float: left;
}
.new_left .cover {
  width: 110px;
  height: 110px;
  float: left;
  border-radius: 15px;
  overflow: hidden;
  background: #04cd6f;
  position: relative;
  color: #fff;
}
/* .new_left img {
  width: 100%;
  height: 100%;
} */
.new_left h2 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  text-align: center;
  justify-content: center;
  padding: 30px 5px 0;
  font-weight: bold;
  font-size: 40px;
}
.new_left ._title {
  font-size: 16px;
  position: absolute;
  bottom: 0;
  width: 100%;
  background: #01ea7e;
  color: #fff;
  text-align: center;
  padding: 0 5px;
  height: 40px;
  line-height: 40px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  transition: all 0.3s;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  color: rgba(0, 0, 0, 0.5);
}
.new_left ._title:hover {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  line-height: 20px;
  height: 100%;
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: blur(10px);
  /* background-color: rgba(255, 255, 255, 0.7); */
  box-sizing: border-box;
}
.new_right {
  width: calc(100% - 150px);
  min-height: 130px;
  float: left;
  padding: 0 20px;
  box-sizing: border-box;
}
.new_right .text {
  color: #7f7f7f;
  margin-bottom: 10px;
  font-size: 16px;
}
.table_type {
  display: flex;
  /* line-height: 30px;
  height: 30px; */
  margin-bottom: 10px;
}
.table_type .tt {
  margin-right: 60px;
  position: relative;
  color: #7f7f7f;
  font-size: 16px;
}
.table_type span {
  color: #727273;
  font-weight: 700;
}
.show_tips {
  position: absolute;
  /* top: 25px; */
  z-index: 9;
  width: 150px;
  box-sizing: border-box;
  transition: 0.35s;
  /* opacity: 0.5; */
  /* zoom: 0.4; */
  -moz-transform: scale(0);
  -webkit-transform: scale(0);
  transform-origin: left top;
  overflow: auto;
  height: 140px;
  padding: 10px !important;
}
.one .show_tips {
  left: 90px;
}
.two .show_tips {
  left: 120px;
}
.show_tips >>> .el-card__body {
  padding: 0 !important;
}
.show_tips >>> .el-card__body p {
  margin-bottom: 5px;
  color: #7f7f7f;
  font-size: 16px;
}
/* 显示更多数量，模型数 */
.table_type .tt:hover .show_tips {
  zoom: 1;
  -moz-transform: scale(1);
  -webkit-transform: scale(1);
  opacity: 1 !important;
  /* height: 100px !important; */
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.5);
}
.table_type .show_tips p {
  transition: 0.3s;
}
.table_type .show_tips p:hover {
  color: rgba(0, 0, 0, 0.9);
  cursor: pointer;
  /* border-bottom: 1px solid #333; */
  text-decoration: underline;
}
.data_list {
}
.data_list span {
  height: 30px;
  line-height: 30px;
  padding: 4px 7px;
  box-sizing: border-box;
  margin-right: 10px;
  font-size: 16px;
}
.data_list .data_time {
  background: #d6f2ff;
  color: #63b4da;
}
.data_list .data_number {
  background: #e9ebef;
  color: #727273;
}

.chellAll {
  background-color: #ffff;
  padding: 10px;
  margin-bottom: 10px;
}
.preview_conter >>> .el-table {
  height: 100%;
  background: transparent !important;
}
.preview_conter >>> .el-table tbody tr:hover > td,
.preview_conter >>> table tr:nth-child(odd) {
  background-color: transparent !important;
}
.preview_conter >>> .el-table .el-table__cell {
  padding: 0 !important;
}
.preview_conter >>> .el-table__header {
  border-top: none !important;
  margin-top: 0 !important;
  background-color: #fff;
}
.preview_conter
  >>> .el-table__header
  .el-table-column--selection
  .cell
  .el-checkbox:after {
  color: #333;
  content: "全选";
  font-size: 14px;
  margin-left: 12px;
}
/* 隐藏全选 */
.DisableSelection {
  display: none !important;
}
.list_table {
  height: calc(100vh - 300px);
  /* background: #fff; */
}

.list_table >>> .el-table__empty-block {
  min-height: 400px !important;
}
</style>