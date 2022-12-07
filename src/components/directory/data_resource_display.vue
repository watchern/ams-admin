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
                 type="primary"
                 @click="clear_search()">重置</el-button>
    </div>
    <!-- 查询 end-->

    <!-- 是否显示按钮 数据注册显示 -->
    <div class="common_btn padding10"
         v-if="is_btn == true">
      <el-button type="primary">数据字典导入导出</el-button>

      <el-button type="primary">汉化信息导入导出</el-button>

      <el-button type="primary">表关系导入导出</el-button>

      <el-button type="primary">同步数据结构</el-button>

      <el-button type="primary">任权管理</el-button>

      <el-button type="primary">注册资产</el-button>
      <el-button type="primary">修改</el-button>

    </div>

    <!-- 内容 -->
    <div class="box_ard">
      <div class="box_ard_header _width"
           @click="on_deails('1111')">
        <p class="new_num">GIUDUDION</p>
        <p class="new_title">这是标题</p>
        <span class="new_type">存款业务主题</span>
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

<script>
// import { title } from 'process';

export default {
  components: {},
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
    is_btn: {
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
    parentArr () {
      this.TagsAll = this.parentArr.length ? this.parentArr : []
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
    this.TagsAll = this.parentArr;
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



    // 查看基本信息详情
    on_deails (data) {
      this.$emit("on_deails", data);

    },

  }
}
</script>
 
<style scoped>
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
  background-color: transparent;
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
  margin-bottom: 20px;
  border-radius: 15px;
  padding: 10px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
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
  top: 30px;
  z-index: 9;
  /* transform: translate(-50%, -50%); */
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.5);
  padding: 10px;
  box-sizing: border-box;
  opacity: 0;
  transition: 0.35s;
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
  margin-bottom: 10px;
}
.table_type p:hover .show_tips {
  opacity: 1 !important;
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
  margin-bottom: 10px;
}
</style>