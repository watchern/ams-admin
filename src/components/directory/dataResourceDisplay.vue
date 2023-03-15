<template>
  <div class="preview_conter padding10_l">
    <!-- 查询 -->
    <div class="header_search">
      <!-- <query-tags ref="tags"
                  @search="search"
                  @clearSearch="clear"
                  :dropDown="dropDown"
                  @change="onChange"></query-tags> -->
      <SearchCommon ref="tags"
                    @search="search"
                    @clearSearch="clear"
                    :dropDown="dropDown"
                    :key="serachKey"
                    @change="onChange"></SearchCommon>
    </div>
    <!-- 查询 end-->

    <!-- 是否显示按钮 数据注册显示 -->
    <div class="common_btn"
         v-if="isBtn == true">
      <div class="click_btn">
        <el-button type="primary"
                   class="oper-btn"
                   size="small">数据资源导入导出</el-button>
        <div class="show_btn">
          <el-button type="primary"
                     class="oper-btn"
                     size="small"
                     @click="down_template_dictionary()">模版下载</el-button>
          <el-button type="primary"
                     size="small"
                     class="oper-btn"
                     @click="Importdata_dictionary()">导入数据资源</el-button>
        </div>
      </div>
      <div class="click_btn">
        <el-button type="primary"
                   class="oper-btn"
                   size="small">汉化信息导入导出</el-button>
        <div class="show_btn">
          <el-button type="primary"
                     size="small"
                     class="oper-btn"
                     @click="down_template_cn()">模版下载</el-button>
          <el-button type="primary"
                     size="small"
                     class="oper-btn"
                     @click="Important_cn()">导入汉化信息</el-button>
        </div>
      </div>
      <div class="click_btn">
        <el-button type="primary"
                   class="oper-btn"
                   size="small">表关系导入导出</el-button>
        <div class="show_btn">
          <el-button type="primary"
                     size="small"
                     class="oper-btn"
                     @click="down_template_table()">模版下载</el-button>
          <el-button type="primary"
                     size="small"
                     class="oper-btn"
                     @click="Important_table()">导入表关系</el-button>
        </div>
      </div>
      <div class="click_btn">
        <el-button type="primary"
                   class="oper-btn"
                   size="small"
                   @click="sync_data()">同步数据结构</el-button>
      </div>
      <div class="click_btn">
        <el-button type="primary"
                   class="oper-btn"
                   size="small"
                   @click="Recognition()">认权管理</el-button>
      </div>
      <div class="click_btn">
        <el-button type="primary"
                   size="small"
                   class="oper-btn"
                   @click="on_register()">注册资源</el-button>
      </div>
      <div class="click_btn">
        <el-button type="primary"
                   size="small"
                   class="oper-btn dr-eidt"
                   @click="edit_list()">修改</el-button>
      </div>
    </div>

    <el-skeleton style="width:100%;float: left;overflow: auto;"
                 :class="isBtn == true ?'is_min_heihgt':'is_heihgt'"
                 animated
                 class="skeleton"
                 :loading="list_loading"
                 :count="4">
      <template slot="template">
<!--        <div class="box_ard">-->
<!--          <div class="conter_list">-->
<!--            <div class="box_ard_header">-->
<!--              <el-skeleton-item variant="h3"-->
<!--                                style="width: 30%;" />-->
<!--            </div>-->
<!--            <div class="new_left">-->
<!--              <el-skeleton-item variant="image"-->
<!--                                style="width: 130px; height: 130px;" />-->
<!--            </div>-->
<!--            <div class="new_right">-->
<!--              <div class="table_type">-->
<!--                <el-skeleton-item variant="h3"-->
<!--                                  style="width: 10%;margin-right: 60px;" />-->
<!--                <el-skeleton-item variant="h3"-->
<!--                                  style="width: 10%;" />-->
<!--              </div>-->
<!--              <div class="text">-->
<!--                <el-skeleton-item variant="h3"-->
<!--                                  style="width: 30%;" />-->
<!--                <el-skeleton-item variant="text"-->
<!--                                  style="margin-right: 16px;" />-->
<!--                <el-skeleton-item variant="text"-->
<!--                                  style="width: 30%;" />-->
<!--              </div>-->
<!--              <div class="data_list">-->
<!--                <el-skeleton-item variant="text"-->
<!--                                  style="width: 10%;margin-right:20px" />-->
<!--                <el-skeleton-item variant="text"-->
<!--                                  style="width: 10%;" />-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
        <div class="table-list-new">
          <div class="tln-header">
            <div class="tlnh-type">
              <el-skeleton-item
                  variant="image"
                  style="width: 40px; height: 40px;"
              />
            </div>
            <div class="tlnh-title">
              <el-skeleton-item variant="h3" style="width: 150px" />
            </div>
          </div>
          <div class="tln-msg">
            <div class="tlnh-type"></div>
            <div  class="tlnm-right">
              <div class="tln-top">
                <p class="new_num">
                    <el-skeleton-item variant="h3"
                                      style="width: 130px;margin-right: 10px;" />
                </p>
                <p class="new_title">
                  <el-skeleton-item variant="h3"
                                    style="width: 130px;margin-right: 10px;" />
                </p>
                <el-skeleton-item variant="h3"
                                  style="width: 40px;" />
              </div>
              <div class="tln-middle">
                <div class="text">
                  <el-skeleton-item variant="p"
                                    style="width: 100%" />
                </div>
                <div class="text">
                  <el-skeleton-item variant="p"
                                    style="width: 100%" />
                </div>
                <div class="text">
                  <el-skeleton-item variant="p"
                                    style="width: 100%" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div class="list_table"
           :class="isBtn == true ?'is_min_heihgt':'is_heihgt'">
        <div class="table-list-new" v-for="item in list">
          <div class="tln-header">
            <div class="tlnh-type">{{ item.tableRelationQuery.tableLayeredName}}</div>
            <div class="tlnh-title" @click="on_deails(item)">{{ item.tableRelationQuery.businessSystemName }}</div>
            <div class="inline-block tlnh-checkbox" >
              <el-checkbox v-model="item.checked" @change="checkItem"></el-checkbox>
            </div>

          </div>
          <div class="tln-msg" @click="on_deails(item)">
            <div class="tlnh-type"></div>
            <div class="tlnm-right">
              <div class="tln-top">
                <el-tooltip class="item" effect="light" :content="item.tbName" placement="top">
                  <p class="new_num">{{ item.tbName }}</p>
                </el-tooltip>
                <el-tooltip class="item" effect="light" :content="item.chnName" placement="top">
                  <p class="new_title">{{ item.chnName }}</p>
                </el-tooltip>

                <span class="new_type"
                      v-if="item.tableRelationQuery.tableThemeName">{{ item.tableRelationQuery.tableThemeName }}</span>
              </div>
              <div class="tln-middle">
<!--                <div class="table_type">-->
<!--                  <div class="one tt"><div class="gray-name-n">表关联数量：</div><span v-if="item.relations">{{ item.relations.length }}</span>-->
<!--                    <el-card class="show_tips"-->
<!--                             v-if="item.relations.length !== 0">-->
<!--                      <p v-for="(its, index_relations) in item.relations"-->
<!--                         :key="index_relations">-->
<!--                        {{ its.relationTableName == item.tbName ? its.tbName : its.relationTableName }}</p>-->
<!--                    </el-card>-->
<!--                  </div>-->
<!--                  <div class="two tt"><div class="gray-name-n">使用此表模型数：</div><span>{{ item.models.length }}</span>-->
<!--                    <el-card class="show_tips"-->
<!--                             v-if="item.models.length !== 0">-->
<!--                      <p v-for="(it, index_model) in item.models"-->
<!--                         :key="index_model">{{ it.MODEL_NAME }}</p>-->
<!--                    </el-card>-->
<!--                  </div>-->
<!--                </div>-->
                <div class="text vertical"
                   :title="item.tableRelationQuery.tableRemarks"
                   v-if="item.tableRelationQuery.tableRemarks">
                <div class="gray-name-n">描述：</div>
                  <span class="inline-block">{{ item.tableRelationQuery.tableRemarks }}</span>
                </div>
                <div class="text "
                   v-else><div class="gray-name-n">描述：</div>暂无</div>
                <div class="text vertical"
                   :title="item.colMeta"
                   v-if="item.colMeta"><div class="gray-name-n">字段：</div>
                  <span class="inline-block"> {{ item.colMeta }}</span>
                </div>
                <div class="text"
                   v-else><div class="gray-name-n">字段：</div>暂无</div>
              </div>
              <div class="tln-footer">
                <div class="inline-block" v-if="item.tableRelationQuery.dataDate != null"><div class="blue-name">数据日期：</div>{{ item.tableRelationQuery.dataDate }}</div>
                <div class="inline-block" v-else><div class="blue-name">数据日期：</div>暂无</div>
                <div class="inline-block"><div class="blue-name">数据量：</div> {{ item.rowNum }} 条</div>
                <div class="inline-block tlnf-num one tt">
                  <img src="../../assets/img/relationTabel.png" alt="">
                  <span v-if="item.relations">{{ item.relations.length }}</span>
                  <el-card class="show_tips"
                           >
<!--                    v-if="item.relations.length !== 0"-->
                    <div>表关联列表：</div>
                    <p v-for="(its, index_relations) in item.relations"
                       :key="index_relations">
                      {{ its.relationTableName == item.tbName ? its.tbName : its.relationTableName }}</p>
                  </el-card>
                </div>
                <div class="inline-block tlnf-num two tt">
                  <img src="../../assets/img/useModel.png" style="width: 15px;" alt="">
                  <span v-if="item.models">{{ item.models.length }}</span>
                  <el-card class="show_tips"
                           >
<!--                    v-if="item.models.length !== 0"-->
                    <div>使用此表模型列表：</div>
                    <p v-for="(it, index_model) in item.models"
                       :key="index_model">{{ it.MODEL_NAME }}</p>
                  </el-card>
                </div>
              </div>
            </div>

          </div>
        </div>
<!--        <el-table ref="multipleTable"-->
<!--                  :data="list"-->
<!--                  style="width: 100%;overflow:auto"-->
<!--                  :show-overflow-tooltip='true'-->
<!--                  :header-cell-class-name="headerCellClass"-->
<!--                  :header-cell-style="tableHeaderColor"-->
<!--                  @selection-change="handleSelectionChange">-->
<!--          <el-table-column type="selection"-->
<!--                           v-if="isBtn == true"-->
<!--                           width="30">-->
<!--          </el-table-column>-->
<!--          <el-table-column>-->
<!--            <template slot-scope="scope">-->
<!--              <div class="box_ard">-->
<!--                <div class="conter_list">-->
<!--                  <div class="box_ard_header _width"-->
<!--                       @click="on_deails(scope.row)">-->
<!--                    <p class="new_num">{{ scope.row.tbName }}</p>-->
<!--                    <p class="new_title">{{ scope.row.chnName }}</p>-->
<!--                    <span class="new_type"-->
<!--                          v-if="scope.row.tableRelationQuery.tableThemeName">{{ scope.row.tableRelationQuery.tableThemeName }}</span>-->
<!--                  </div>-->
<!--                  <div class="new_left padding7">-->
<!--                    <div class="cover">-->
<!--                      <h2 :class="scope.row.tableRelationQuery.businessSystemName ? 'is_title':''">-->
<!--                        {{ scope.row.tableRelationQuery.tableLayeredName }}</h2>-->
<!--                      <span class="_title"-->
<!--                            v-if="scope.row.tableRelationQuery.businessSystemName">{{ scope.row.tableRelationQuery.businessSystemName }}</span>-->
<!--                    </div>-->
<!--                  </div>-->
<!--                  <div class="new_right">-->
<!--                    <div class="table_type">-->
<!--                      <div class="one tt">表关联数量：<span v-if="scope.row.relations">{{ scope.row.relations.length }}</span>-->
<!--                        <el-card class="show_tips"-->
<!--                                 v-if="scope.row.relations.length !== 0">-->
<!--                          <p v-for="(its, index_relations) in scope.row.relations"-->
<!--                             :key="index_relations">-->
<!--                            {{ its.relationTableName == scope.row.tbName ? its.tbName : its.relationTableName }}</p>-->
<!--                        </el-card>-->
<!--                      </div>-->
<!--                      <div class="two tt">使用此表模型数：<span>{{ scope.row.models.length }}</span>-->
<!--                        <el-card class="show_tips"-->
<!--                                 v-if="scope.row.models.length !== 0">-->
<!--                          <p v-for="(it, index_model) in scope.row.models"-->
<!--                             :key="index_model">{{ it.MODEL_NAME }}</p>-->
<!--                        </el-card>-->
<!--                      </div>-->
<!--                    </div>-->
<!--                    <p class="text vertical"-->
<!--                       :title="scope.row.tableRelationQuery.tableRemarks"-->
<!--                       v-if="scope.row.tableRelationQuery.tableRemarks">-->
<!--                      描述：{{ scope.row.tableRelationQuery.tableRemarks }}-->
<!--                    </p>-->
<!--                    <p class="text "-->
<!--                       v-else>描述：暂无</p>-->
<!--                    <p class="text vertical"-->
<!--                       :title="scope.row.colMeta"-->
<!--                       v-if="scope.row.colMeta">字段：{{ scope.row.colMeta }}</p>-->
<!--                    <p class="text"-->
<!--                       v-else>字段：暂无</p>-->
<!--                    <div class="data_list">-->
<!--                      &lt;!&ndash; {{scope.row.tableRelationQuery}} &ndash;&gt;-->
<!--                      <span class="data_time"-->
<!--                            v-if="scope.row.tableRelationQuery.dataDate != null">数据日期：{{ scope.row.tableRelationQuery.dataDate }}</span>-->
<!--                      <span class="data_time"-->
<!--                            v-else>数据日期：暂无</span>-->
<!--                      <span class="data_number">数据量 {{ scope.row.rowNum }} 条</span>-->
<!--                    </div>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--        </el-table>-->
      </div>
    </el-skeleton>
    <div class="padding10_l fl _width">
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :page-size="list_data.size"
                     :current-page-sync="list_data.current"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="list_data.total"></el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default () {
        return [];
      },
    },
    list_data: {
      type: Object,
      default () {
        return {};
      },
    },
    dropDown: {
      type: Array,
      default () {
        return [];
      },
    },
    isBtn: Boolean,
    list_loading: Boolean,
  },
  data () {
    return {
      serachKey:1,
      check_list: [], //多选批量的数量
      serachParams: [],
    };
  },
  created () { },
  watch: {},
  computed: {},
  mounted () { },
  methods: {
    refreshSearchKey(){
      this.serachKey=Math.random();
    },
    onChange (serachParams) {
      this.serachParams = serachParams;
    },
    // 查询
    search () {
      this.$emit("search", this.serachParams);
    },
    // 重置
    clear (data) {
      this.serachParams = data
    },
    // 数据字典下载模版
    down_template_dictionary () {
      this.$emit("down_template_dictionary", this.check_list);
    },
    // 汉化模版下载
    down_template_cn () {
      if (this.check_list.length !== 0) {
        this.$emit("down_template_cn", this.check_list);
      } else {
        this.$message({ type: "warning", message: "请选择一条数据进行下载" });
      }
    },
    // 表关系下载模版
    down_template_table () {
      this.$emit("down_template_table", this.check_list);
    },
    // 导入数据资源
    Importdata_dictionary () {
      this.$emit("Importdata_dictionary", "导入数据资源");
    },
    // 导入汉化信息
    Important_cn () {
      this.$emit("Important_cn", "导入汉化信息");
    },
    //导入 表关系
    Important_table () {
      this.$emit("Important_table", "导入表关系");
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
        this.$message({
          type: "warning",
          message: "请至少选择一条数据进行认权",
        });
      }
    },
    // 注册资源
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
        return "DisableSelection";
      }
    },
    // 如果list 没数据就隐藏全选
    tableHeaderColor ({ row, column, rowIndex, columnIndex }) { },
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
      this.check_list = val;
    },
    checkItem(){
      this.$nextTick(()=>{
        let _ls=[];
        this.list.forEach((item)=>{
          if(item.checked===true){
            _ls.push(item);
          }
        });
        this.check_list=_ls;
      })

    },
  },
};
</script>
<style scoped>
/* 有按钮 */
.is_min_heihgt {
  height: calc(100vh - 290px);
}
/* 没有按钮 */
.is_heihgt {
  height: calc(100vh - 260px);
}
/* 操作btn */
.common_btn {
  box-sizing: border-box;
  float: left;
  display: flex;
  justify-content: flex-end;
  width: 100%;
  width: 100%;
  padding-right: 20px;
  box-sizing: border-box;
}

.common_btn >>> .el-button--medium {
  padding: 10px !important;
}

.click_btn {
  margin: 0 10px 0 0;
  float: left;
}
.common_btn .click_btn:last-child {
  margin: 0 !important;
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

/* 搜索  */
.header_search {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
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
  margin: 7px 0;
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
  margin-bottom: 7px;
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
  width: 100px;
  height: 100px;
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
  text-align: center;
  align-items: center;
  padding: 0 5px 0;
  justify-content: center;
  font-weight: bold;
  font-size: 40px;
}
.is_title {
  padding: 10px 5px 0 !important;
  align-items: flex-start !important;
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
  margin-bottom: 7px;
  font-size: 14px;
}
.vertical {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.table_type {
  display: flex;
  /* line-height: 30px;
  height: 30px; */
  margin-bottom: 7px;
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
  height: 115px;
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
.table_type .tt:hover .show_tips,.tln-footer .tt:hover .show_tips{
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
  font-size: 14px;
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

.list_table >>> .el-table {
  /* height: calc(100vh - 255px); */
  /* background: #fff; */
  /* border: 1px solid; */
  /* overflow: auto; */
}

/* table 暂无数据 */
.list_table >>> .el-table__empty-block {
  /* min-height: 400px !important; */
  height: calc(100vh - 300px) !important;
  box-sizing: border-box;
}
/* 隐藏列表的多选框 */
.list_table >>> .el-table__header-wrapper {
  display: none;
}

.list_table >>> .el-table tr {
  background: transparent !important;
}

/* .list_table >>> .el-table th.el-table__cell.is-leaf,
.list_table >>> .el-table td.el-table__cell {
  border: none !important;
} */

.skeleton >>> .el-table th.el-table__cell.is-leaf,
.skeleton >>> .el-table td.el-table__cell {
  border: none !important;
}
>>>.dr-eidt span{
  display: inline-block!important;
}
</style>
<style scoped lang="scss">
.table-list-new{
  display: inline-block;
  width: 48%;
  height: 180px;
  border: 1px solid rgba(0,0,0,.09);
  margin: 1%;
  border-radius: 2px;
  //cursor: pointer;
  box-sizing: border-box;
  vertical-align: top;
  padding: 20px;
  .tlnh-checkbox{
    float: right;
  }
  .tlnh-type{
    display: inline-block;
    width: 40px;
    height: 40px;
    font-size:18px;
    font-weight: bold;
    line-height: 40px;
    text-align: center;
    vertical-align: middle;
    border-radius: 10px;
    background-color: rgb(65,202,254);
    border-color: rgb(65,202,254);
    color: #fff;
  }
  .tlnh-title{
    font-size: 16px;
    display: inline-block;
    margin-left: 5px;
  }
  .tln-msg{
    .tlnh-type{
      opacity: 0;
      margin-right: 5px;
    }
    .tlnm-right{
      display: inline-block;
      width: 85%;
    }
  }
  .tln-top{
    .new_num,.new_title{
      display: inline-block;
      font-size: 16px;
      font-weight: normal;
      max-width:30%;
      overflow:hidden;
      white-space:nowrap;
      text-overflow: ellipsis;
    }
    .new_type{
      font-size: 13px;
      padding:3px 8px;
      vertical-align: top;
      max-width:30%;
      overflow:hidden;
      white-space:nowrap;
      text-overflow: ellipsis;
    }
  }
  .tln-middle{
    font-size: 13px;
    margin-top:10px;
    .tt{
      font-size: 13px;
      font-weight: 400;
      color:inherit;
    }
    .text>span{
      width:88%;
      overflow:hidden;
      white-space:nowrap;
      text-overflow: ellipsis;
      vertical-align: top;
    }
  }
  .gray-name-n{
    display: inline-block;
    color: rgba(0,0,0,.45);
  }
  .tln-middle>div{
    margin-bottom: 5px;
  }
  .tln-footer{
    width: 80%;
    font-size: 13px;
    display: flex;
    justify-content: space-between;
    .blue-name{
      display: inline-block;
      color: #63b4da;
    }
    .tlnf-num{
      position: relative;
      cursor: pointer;
      .show_tips{
        left: 0;
      }
    }
    .tlnf-num>img{
      width:18px;
      height: auto;
      margin-right: 3px;
      vertical-align: middle;
    }
  }
}
.table-list-new:hover{
  box-shadow:4px 4px 7px #999;
}

</style>
