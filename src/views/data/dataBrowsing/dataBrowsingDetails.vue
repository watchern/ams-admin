<template>
  <div class="preview_conter padding10_l">
    <el-skeleton
      style="width: 100%; height: calc(100vh - 480px)"
      animated
      :loading="list_loading"
      :count="4"
    >
      <template slot="template">
        <div class="box_ard">
          <div class="conter_list">
            <div class="box_ard_header">
              <el-skeleton-item variant="h3" style="width: 30%" />
            </div>
            <div class="new_left">
              <el-skeleton-item
                variant="image"
                style="width: 130px; height: 130px"
              />
            </div>
            <div class="new_right">
              <div class="table_type">
                <el-skeleton-item
                  variant="h3"
                  style="width: 10%; margin-right: 60px"
                />
                <el-skeleton-item variant="h3" style="width: 10%" />
              </div>
              <div class="text">
                <el-skeleton-item variant="h3" style="width: 30%" />
                <el-skeleton-item variant="text" style="margin-right: 16px" />
                <el-skeleton-item variant="text" style="width: 30%" />
              </div>
              <div class="data_list">
                <el-skeleton-item
                  variant="text"
                  style="width: 10%; margin-right: 20px"
                />
                <el-skeleton-item variant="text" style="width: 10%" />
              </div>
            </div>
          </div>
        </div>
      </template>
      为您找到相关结果约{{ list_data.total }}个
      <div
        class="list_table"
        style="height: calc(100vh - 480px); overflow: auto"
      >
        <el-table
          ref="multipleTable"
          :data="dataList"
          style="width: 100%"
          :show-overflow-tooltip="true"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="30"> </el-table-column>
          <el-table-column>
            <template slot-scope="scope">
              <div class="box_ard">
                <div class="conter_list">
                  <div
                    class="box_ard_header _width"
                    @click="on_deails(scope.row)"
                  >
                    <p class="new_num">{{ scope.row.tbName }}</p>
                    <p class="new_title">{{ scope.row.chnName }}</p>
                    <span
                      class="new_type"
                      v-if="scope.row.tableRelationQuery"
                      >{{ scope.row.tableRelationQuery.tableThemeName }}</span
                    >
                  </div>

                  <div class="new_left padding7">
                    <div class="cover">
                      <!-- <img src="../../assets/img/msq.png"
                           alt=""> -->
                      <h2>
                        {{ scope.row.tableRelationQuery.tableLayeredName }}
                      </h2>
                      <span class="_title">{{
                        scope.row.tableRelationQuery.businessSystemName
                      }}</span>
                    </div>
                  </div>

                  <div class="new_right">
                    <div class="table_type">
                      <div class="one tt">
                        表关联数量：<span v-if="scope.row.relations">{{
                          scope.row.relations.length
                        }}</span>
                        <el-card
                          class="show_tips"
                          v-if="scope.row.relations.length !== 0"
                        >
                          <p
                            v-for="(its, index_relations) in scope.row
                              .relations"
                            :key="index_relations"
                          >
                            {{ its.relationTableName }}
                          </p>
                        </el-card>
                      </div>
                      <div class="two tt">
                        使用此表模型数：<span>{{
                          scope.row.models.length
                        }}</span>
                        <el-card
                          class="show_tips"
                          v-if="scope.row.models.length !== 0"
                        >
                          <p
                            v-for="(it, index_model) in scope.row.models"
                            :key="index_model"
                          >
                            {{ it.MODEL_NAME }}
                          </p>
                        </el-card>
                      </div>
                    </div>
                    <p class="text" v-if="scope.row.tableRelationQuery">
                      描述：{{ scope.row.tableRelationQuery.tableRemarks }}
                    </p>
                    <p class="text" v-else>描述：暂无</p>
                    <p class="text" v-if="scope.row.colMeta">
                      字段：{{ scope.row.colMeta }}
                    </p>
                    <p class="text" v-else>字段：暂无</p>

                    <div class="data_list">
                      <!-- {{scope.row.tableRelationQuery}} -->
                      <span
                        class="data_time"
                        v-if="scope.row.tableRelationQuery.dataDate != null"
                        >数据日期：{{
                          scope.row.tableRelationQuery.dataDate
                        }}</span
                      >
                      <span class="data_time" v-else>数据日期：暂无</span>
                      <span class="data_number"
                        >数据量 {{ scope.row.rowNum }} 条</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-skeleton>
    <el-pagination
      style="margin-top: 40px"
      background
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :total="list_data.total"
    ></el-pagination>
  </div>
</template>

<script>
import {
  listByTreePage, //列表
} from "@/api/data/table-info";
export default {
  name: "dataBrowsingDetails",
  components: {},
  props: [],
  data() {
    return {
      dataList: [],
      checkList: [],
      list_data: {
        pageNo: 1,
        pageSize: 10,
        total: 0,
      },
      list_loading: false,
    };
  },
  computed: {},
  watch: {},
  mounted() {
    this.query_list();
  },
  methods: {
    on_deails(data) {
      console.log(data);
    },
    // 全选
    handleSelectionChange(val) {
      this.checkList = val;
    },
    // 列表 接口
    query_list() {
      this.list_loading = true;
      let params = {
        businessSystemId: "", //id主键
        tableThemeId: "", //主题
        tableLayeredId: "", //分层
        folderUuid: "", //目录
        dataSource: "Postgre", //数据源
        pageNo: this.list_data.pageNo,
        pageSize: this.list_data.pageSize,
        tbName: "",
      };
      listByTreePage(params).then((resp) => {
        this.list_loading = false; //子组件loading
        this.dataList = resp.data.records;
        this.list_data.total = resp.data.total;
      });
    },
    // 分页
    handleCurrentChange(val) {
      this.list_data.pageNo = val;
      this.query_list();
    },
    // 每页多少条
    handleSizeChange(val) {
      this.list_data.pageSize = val;
      this.query_list();
    },
  },
};
</script>

<style lang="scss" scoped>
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
  margin-bottom: 7px;
  font-size: 14px;
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

.preview_conter ::v-deep .el-table {
  // height: 100%;
  background: transparent !important;
}

.preview_conter ::v-deep .el-table tbody tr:hover > td,
.preview_conter ::v-deep table tr:nth-child(odd) {
  background-color: transparent !important;
}

.preview_conter ::v-deep .el-table .el-table__cell {
  padding: 0 !important;
}

.preview_conter ::v-deep .el-table__header {
  border-top: none !important;
  margin-top: 0 !important;
  background-color: #fff;
}

// .preview_conter
//   ::v-deep
//   .el-table__header
//   .el-table-column--selection
//   .cell
//   .el-checkbox:after {
//   color: #333;
//   content: "全选";
//   font-size: 14px;
//   margin-left: 12px;
// }

.list_table >>> .el-table {
  height: calc(100vh - 255px);
  /* background: #fff; */
  /* border: 1px solid; */
  overflow: auto;
}

.list_table >>> .el-table__empty-block {
  min-height: 400px !important;
}
/* 隐藏列表的多选框 */
::v-deep .el-table__header-wrapper {
  display: none;
}
</style>
