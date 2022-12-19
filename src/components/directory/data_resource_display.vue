<template>
  <div class="preview_conter padding10_l">
    <!-- 查询 -->
    <div class="header_search">
      <p>查询条件：</p>
      <div class="input_blue"
           @click="onclick()">
        <div v-for="(item,index) in TagsAll"
             :key="index"
             class="spanbox">
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
    <div class="common_btn "
         v-if="isBtn == true">
      <div class="click_btn">
        <el-button type="primary">数据字典导入导出</el-button>
        <div class="show_btn">
          <el-button type="primary">模版下载</el-button>
          <el-button type="primary"
                     @click="Importdata_dictionary()">导入数据资源</el-button>
        </div>
      </div>

      <div class="click_btn">
        <el-button type="primary">汉化信息导入导出</el-button>
        <div class="show_btn">
          <el-button type="primary">模版下载</el-button>
          <el-button type="primary"
                     @click="Important_cn()">导入汉化信息</el-button>
        </div>
      </div>

      <div class="click_btn">
        <el-button type="primary">表关系导入导出</el-button>
        <div class="show_btn">
          <el-button type="primary">模版下载</el-button>
          <el-button type="primary"
                     @click="Important_table()">导入表关系</el-button>
        </div>
      </div>

      <el-button type="primary">同步数据结构</el-button>

      <el-button type="primary"
                 @click="Recognition()">任权管理</el-button>

      <el-button type="primary"
                 @click="on_register()">注册资产</el-button>
      <el-button type="primary"
                 @click="edit_list()">修改</el-button>

    </div>
    <el-table ref="multipleTable"
              :data="list"
              style="width: 100%"
              :header-cell-class-name="headerCellClass"
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
                   @click="on_deails('1111')">
                <p class="new_num">{{scope.row.name}}</p>
                <p class="new_title">{{scope.row.title}}</p>
                <span class="new_type">{{scope.row.title1}}</span>
              </div>

              <div class="new_left padding10">
                <i><img src="../../assets/img/activity.png"
                       alt=""></i>
              </div>

              <div class="new_right">
                <div class="table_type">
                  <p class="one">表关联数量：<span>1</span>
                    <el-card class="show_tips">
                      <p>BIBIUU</p>
                      <p>BIBIUU</p>
                      <p>BIBIUU</p>
                    </el-card>

                  </p>
                  <p class="two">使用此表模型数：<span>1</span>
                    <el-card class="show_tips">
                      <p>BIBIUU</p>
                      <p>BIBIUU</p>
                      <p>BIBIUU</p>
                    </el-card>
                  </p>
                </div>
                <p class="text">描述：213123213123</p>
                <p class="text">字段：12321321313213</p>
                <div class="data_list">
                  <span class="data_time">数据日期 2022-11-06</span>
                  <span class="data_number">数据量 2,530,000 条</span>
                </div>
              </div>
            </div>

          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="title"
               :visible.sync="common_dialog"
               width="30%">

      <!-- 模版下载 -->

      <!-- 认权管理 -->
      <div>

      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="common_dialog = false">取 消</el-button>
        <el-button type="primary"
                   @click="common_dialog = false">确 定</el-button>
      </span>
    </el-dialog>

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
    isBtn: {
      type: Boolean,
      default () {
        return []
      }
    }
  },

  data () {
    return {
      form: {
        title: '',
      },
      search_name: '',
      TagsAll: [],
      inputLength: '',
      list: [
        { name: 'GIUDUDION', title: '这是标题', title1: '存款业务主体', title2: '描述描述描述', title4: '字段21321313123', isCheck: 'false' },
        { name: 'GIUDUDION', title: '这是标题', title1: '存款业务主体', title2: '描述描述描述', title4: '字段21321313123', isCheck: 'true' },
        { name: 'GIUDUDION', title: '这是标题', title1: '存款业务主体', title2: '描述描述描述', title4: '字段21321313123', isCheck: 'true' },
        { name: 'GIUDUDION', title: '这是标题', title1: '存款业务主体', title2: '描述描述描述', title4: '字段21321313123', isCheck: 'true' },
      ],

      common_dialog: false,//导入数据源
      title: '',//弹窗共用标题
      check_list: [],//多选批量的数量
    };
  },
  watch: {
    TagsAll () {
      this.$emit('on-change', this.TagsAll)
    },
    search_name (val) {
      console.log(val)
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
    // 删除标签
    removeTag (index, item) {
      console.log(item)
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
      console.log(this.TagsAll);
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

    // 导入数据字典
    Importdata_dictionary () {
      // this.common_dialog = true;
      this.$emit("Importdata_dictionary", '导入数据字典')

    },

    // 导入汉化信息
    Important_cn () {
      this.$emit("Important_cn", '导入汉化信息')
    },
    // 表关系
    Important_table () {
      this.$emit("Important_table", '表关系')
    },
    // 注册资产
    on_register () {
      this.$emit("on_register", '11');
    },
    // 认权
    Recognition () {
      this.$emit("Recognition", '11');

    },
    // 修改
    edit_list () {
      if (this.check_list.length !== 0) {

      }
    },
    // 设置条件隐藏多选
    headerCellClass (row) {
      if (row.columnIndex === 0) {
        return 'DisableSelection'
      }
    },

    // 查看基本信息详情
    on_deails (data) {
      this.$emit("on_deails", data);

    },
    // // 全选
    // handleCheckAllChange () {
    //   if (this.list && this.list.length > 0) {
    //     for (var i = 0; i < this.list.length; i++) {
    //       this.list[i].isCheck = this.checkAll;
    //     }
    //   }
    // },
    // // 单选
    // handleCheckChange (val) {

    //   // val.isCheck = val.children.every(item => item.isCheck)
    //   for (let i = 0, l = this.list.length; i < l; i++) {
    //     if (this.list[i].isCheck !== val.isCheck) {
    //       this.checkAll = false;
    //     } else {
    //       this.checkAll = val.isCheck;
    //     }
    //   }
    //   console.log(this.list);
    //   // return false

    // },
    // 全选
    handleSelectionChange (val) {
      console.log(val);
      this.check_list = val
    },




  }
}
</script>
 
<style scoped>
/* 操作btn */
.click_btn {
  display: table-caption;
  position: relative;
}
.show_btn {
  border-radius: 10px;
  padding: 10px;
  box-sizing: border-box;
  position: absolute;
  top: 40px;
  left: 50%;
  opacity: 0;
  /* height: 0; */
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
  top: 70px;
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
.spanbox {
  display: inline-block;
  font-size: 14px;
  margin: 3px 4px 3px 0;
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
  border: 1px solid #fff;
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
  width: calc(100% - 40px);
  box-sizing: border-box;
}
.box_ard_header {
  display: flex;
  padding: 10px 0;
  box-sizing: border-box;
  align-items: center;
}

.new_num {
  font-weight: 800;
  font-size: 18px;
  cursor: pointer;
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
.new_left i {
  width: 130px;
  height: 130px;
  float: left;
  border-radius: 15px;
  overflow: hidden;
}
.new_left img {
  width: 100%;
  height: 100%;
}

.new_right {
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
  line-height: 30px;
  height: 30px;
  margin-bottom: 15px;
}
.table_type p {
  margin-right: 10px;
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
  width: 100px;
  box-sizing: border-box;
  /* height: 50px; */
  transition: 0.35s;
  /* opacity: 0.5; */
  /* zoom: 0.4; */
  -moz-transform: scale(0);
  -webkit-transform: scale(0);
  transform-origin: left top;
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
}
/* 显示更多数量，模型数 */
.table_type p:hover .show_tips {
  zoom: 1;
  -moz-transform: scale(1);
  -webkit-transform: scale(1);
  opacity: 1 !important;
  padding: 10px !important;
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

.common_btn {
  padding: 10px 0 20px;
  box-sizing: border-box;
  display: flex;
}
.common_btn >>> .el-button {
  margin: 0 10px;
}
.chellAll {
  background-color: #ffff;
  padding: 10px;
  margin-bottom: 10px;
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
</style>