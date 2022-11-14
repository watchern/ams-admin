<template>
  <div style="display:flex;width:100%;background:rgba(245, 245, 245, 0.5)"
       class="conter_center padding10">

    <!-- right_conter -->
    <div class="right_conter ">
      <!-- 搜索header -->
      <div class="search">
        <div class="searchwrap">

          <!--logo部分-->
          <div class="logo">
            <img src="../../../assets/img/search_logo.png"
                 alt=""
                 class="logo_img">
          </div>

          <!--查询输入框-->
          <div class="sear_input">
            <el-input type="text"
                      v-model="search.val"></el-input>
            <div class="search_btn">
              <i class="el-icon-search"></i>
            </div>
          </div>
        </div>

      </div>
      <!-- 搜索header end-->

      <!-- menu_search -->

      <!-- 条件筛选 -->
      <div class="list_type padding20">

        <div class="menu_search padding10 _width">
          <p class="label_menu">业务主题</p>
          <ul class="menu_search_ul">
            <li v-for="(item1,index1) in menu1"
                :key="index1">{{item1.type}}</li>
          </ul>
        </div>

        <div class="menu_search padding10 _width">
          <p class="label_menu">业务系统</p>
          <ul class="menu_search_ul">
            <li v-for="(item1,index1) in menu1"
                :key="index1">{{item1.type}}</li>
          </ul>
        </div>

        <div class="menu_search padding10 _width">
          <p class="label_menu">分 层</p>
          <ul class="menu_search_ul">
            <li v-for="(item1,index1) in menu1"
                :key="index1">{{item1.type}}</li>
          </ul>
        </div>

        <div class="menu_search padding10 _width">
          <p class="label_menu">接入时间</p>
          <ul class="menu_search_ul">
            <li v-for="(item1,index1) in menu1"
                :key="index1">{{item1.type}}</li>
          </ul>
        </div>

      </div>

      <!-- 搜索内容 -->
      <div class="search_data_list ">
        <p class="search_num">为您找到相关结果约<span>120312321</span>个</p>

        <div class="box_ard">
          <div class="box_ard_header _width">
            <p class="new_num">GIUDUDION</p>
            <p class="new_title">这是标题</p>
            <span class="new_type">存款业务主题</span>
          </div>

          <div class="new_left padding10">
            <i><img src="../../../assets/img/search_logo.png"
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

    </div>

    <!-- right_conter end-->

    <!-- left_conter -->
    <div class="left_conter">

      <!-- 右侧新闻热搜排行 -->
      <el-card class="box-card">
        <div slot="header"
             class="clearfix">
          <el-link href="https://element.eleme.io"
                   target="_blank">大家都在查询>></el-link>

          <el-button style="float: right; padding: 3px 0"
                     type="text"><i class="el-icon-refresh
"></i>换一换</el-button>
        </div>
        <div v-for="(item,index) in list_top"
             class="top_list"
             :key="index+1">
          <i :class="{top1:(index===0),top2:(index===1),top3:(index===2)}">{{index+1}}</i>
          <el-link href="https://element.eleme.io"
                   target="_blank">{{item.title}}</el-link>
        </div>
      </el-card>
    </div>
    <!-- left_conter end-->
  </div>
</template>

<script>
export default {
  components: {},
  data () {
    return {
      // 筛选
      search: {
        val: '',
      },

      // 分类菜单
      menu1: [
        { type: '基金主题' },
        { type: '理财主题' },
        { type: '客户主题' },
        { type: '电子渠道' },
        { type: '财务主题' },
      ],
      menu1: [
        { type: '基金主题' },
        { type: '理财主题' },
        { type: '客户主题' },
        { type: '电子渠道' },
        { type: '财务主题' },
      ],
      list_top: [
        { title: '这是热搜这是热搜这是热搜这是热搜这是热搜这是热搜' },
        { title: '这是热搜这是热搜这是热搜' },
        { title: '这是热搜这是热搜这是热搜' },
        { title: '这是热搜这是热搜这是热搜' },
        { title: '这是热搜这是热搜这是热搜' },
      ]

    };
  },
  computed: {},
  watch: {
  },
  mounted () { },
  created () {

  },
  methods: {

  }
};
</script>

<style scoped >
@import url("./../../../assets/css/common.css");
.right_conter {
  /* background: #fff; */
  padding: 0 20px;
}

/* 左侧搜索 */
.search {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.search .searchwrap {
  width: 600px;
}
.search .logo {
  width: 100%;
  height: 70px;
  text-align: center;
  margin: 30px 0;
}
.logo .logo_img {
  height: 100%;
}
.search .sear_input {
  display: flex;
  width: 500px;
  height: 40px;
  border: 1px solid rgba(0, 0, 0, 0.3);

  border-radius: 6px 0 0 6px;
  border-right: 0;
  position: relative;
  background: #fff;
  transition: border 0.3s;
}
.search .sear_input >>> .el-input__inner {
  outline: 0;
  height: 40px;
  font: 16px/18px arial;
  padding: 10px 0 10px 14px;
  margin: 0;
  width: 484px;
  border: 0;
}
.search .sear_input:hover {
  border-color: rgba(0, 0, 0, 0.5);
}
.search .search_btn {
  position: absolute;
  right: -100px;
  top: -1px;
  width: 100px;
  cursor: pointer;
  height: 40px;
  line-height: 41px;
  line-height: 40px\9;
  background-color: #4e6ef2;
  border-radius: 0 6px 6px 0;
  font-size: 17px;
  box-shadow: none;
  font-weight: 400;
  color: #fff;
  text-align: center;
  /* transition: all 0.3s; */
}
.search .search_btn:hover {
  opacity: 0.9;
}

.list_type {
  background-color: #fff;
  margin-top: 20px;
}
/* 分类筛选 */
.menu_search {
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  width: 100%;
  display: flex;
}
.label_menu {
  width: 80px;
  color: rgba(0, 0, 0, 0.7);
  font-size: 14px;
  font-weight: 700;
}
.menu_search_ul {
  flex: 1;
}
.menu_search_ul li {
  float: left;
  padding: 3px 6px;
  border: 1px rgba(186, 215, 251, 1);
  margin-right: 20px !important;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 4px;
  color: rgba(0, 0, 0, 0.8);
}
.menu_search_ul li:hover {
  background-color: #409eff;
  color: #fff !important;
}

/* 搜索的列表 */
.search_data_list {
  padding: 0 20px;
  box-sizing: border-box;
}
.search_num {
  color: rgba(170, 170, 170, 1);
  margin: 10px 0;
}

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

/* 右侧热点新闻 */
.preview_right {
  width: 300px;
}
.top1 {
  color: red;
}

.top2 {
  color: yellow;
}

.top3 {
  color: blue;
}
.top_list {
  display: flex;
  margin-bottom: 10px;
}
.left_conter >>> .el-card__header {
  padding: 10px;
  box-sizing: border-box;
}
.top_list i {
  padding: 0 10px;
}
.top_list .el-link {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}
</style>
