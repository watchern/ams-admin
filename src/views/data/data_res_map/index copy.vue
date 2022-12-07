<template>
  <div class="page-container ">
    <dv-full-screen-container class="container nav-tabs-scroll">
      <!-- <dv-border-box-4 class="border-box"
                       :color="['#0271BE', 'white']">
      </dv-border-box-4> -->
      <div class="map_data center">
        <!-- 标题 -->
        <div class="title_header flex">
          <dv-decoration-8 style="height:50px;"
                           :color="['#0271BE']" />
          <h2 class="font_light">数据资源地图</h2>
          <dv-decoration-8 :reverse="true"
                           style="height:50px;"
                           :color="['#0271BE']" />
        </div>
        <!-- 中间数量 -->
        <div class="data_num flex">

          <div class="son">
            <dv-decoration-9 style="width:150px;height:150px;color: #fff;font-size: 20px;"
                             class="font_light">66%</dv-decoration-9>

            <p class="font_light">数据资产总数</p>
          </div>
          <div class="son">
            <dv-decoration-9 style="width:150px;height:150px;color: #fff;font-size: 20px;"
                             class="font_light">66%</dv-decoration-9>

            <p class="font_light">数据目录总数</p>
          </div>
          <div class="son">
            <dv-decoration-9 style="width:150px;height:150px;color: #fff;font-size: 20px;"
                             class="font_light">66%</dv-decoration-9>

            <p class="font_light">业务部门总数</p>
          </div>

        </div>
        <!-- 蜂窝效果 -->
        <div class="list flex">
          <div :class="'content-center c'+classTag">
            <div class="honeycomb-div">
              <div class="wrap">
                <ul>
                  <li v-for="(item,index) in honeycombArr"
                      :class="'a'+index"
                      @mouseout="outBack"
                      @mouseover="overBack(index)">
                    <span class="hex"><span :class="['hexIn',classTag==index ? 'active' : '']"></span></span>
                    <img :src="item"
                         alt="">
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="bottom_list flex _width">
          <dv-capsule-chart :config="config3"
                            style="width:300px;height:300px" />
          <dv-scroll-ranking-board :config="config3"
                                   style="width:600px;height:300px" />
          <dv-scroll-ranking-board :config="config3"
                                   style="width:300px;height:300px" />

        </div>

      </div>
      <!-- <dv-border-box-4 :reverse="true"
                       :color="['#0271BE', 'white']"
                       class="border-box">
      </dv-border-box-4> -->
    </dv-full-screen-container>
  </div>

</template>

<script>
var timer;

import { config1, config2, config3, config4, config5, config6, config7, config8 } from "../data_res_map/config.js"

export default {

  components: {},
  data () {
    return {
      config1,
      config2,
      config3,
      config4,
      config5,
      config6,
      config7,
      config8,
      honeycombArr: [
        require('../../../assets/img/delete.png'),
        require('../../../assets/img/delete.png'),
        require('../../../assets/img/delete.png'),
        require('../../../assets/img/delete.png'),
        require('../../../assets/img/delete.png'),
        require('../../../assets/img/delete.png'),
        require('../../../assets/img/delete.png'),
        require('../../../assets/img/delete.png'),
        require('../../../assets/img/delete.png'),
        require('../../../assets/img/delete.png'),
        require('../../../assets/img/delete.png'),
        require('../../../assets/img/delete.png'),
        require('../../../assets/img/delete.png'),
        require('../../../assets/img/delete.png'),
        require('../../../assets/img/delete.png'),

      ],
      classTag: '',

    };
  },
  computed: {},
  watch: {},
  mounted () {
    this.$nextTick(function () {
      // 代码保证 this.$el 在 document 中
      this.timingSwitch();
    });

  },
  created () {

  },
  methods: {
    outBack () {
      this.timingSwitch();
    },
    overBack (i) {
      console.log(1)
      clearInterval(timer);
      this.classTag = i;
    },
    timingSwitch () {
      let self = this;
      timer = setInterval(function () {
        if (self.classTag == 14) {
          self.classTag = -1;
        }
        self.classTag++;
      }, 5000)
    },
  }
};
</script>
<style scoped>
@import url("./../../../assets/css/common.css");

.page-container {
  padding: 0 !important;
}
.page-container >>> #dv-full-screen-container {
  position: inherit;
  width: 100% !important;
  height: calc(100vh - 123px) !important;
  transform-origin: inherit !important;
  transform: scale(1) !important;
  background-color: #01132c;

  overflow: auto;
}
.container {
  display: flex;
  flex-direction: row;
  padding: 20px;
  box-sizing: border-box;
  float: left;
}
.map_data {
  /* border: 1px solid red; */
}
.center {
  width: 100%;
  text-align: center;
  min-width: 1390px;
}
.title_header {
  margin-top: 23px;
}
.font_light {
  text-shadow: 0 0 5px #1957c3, 0 0 15px #15b2c7, 0 0 25px #babbbd;
}
.title_header >>> .dv-decoration-8 {
  width: 100%;
}
.title_header h2 {
  min-width: 200px;
  width: 100%;
  text-align: center;
  line-height: 50px;
  color: #fff;
  font-size: 30px;
  text-shadow: 0 0 5px #1957c3, 0 0 15px #15b2c7, 0 0 25px #babbbd;
}

.data_num {
  justify-content: space-around;
  margin-top: 20px;
}
.son {
}
.son p {
  width: 100%;
  text-align: center;
  font-weight: 700;
  font-size: 22px;
  line-height: 50px;
  color: #fff;
}

.bottom_list {
  border: 1px solid;
  padding-bottom: 20px;
  /* height: 400px; */
  justify-content: space-around;
}

/*中间数据  */
.content-center {
  width: 100%;
  padding: 20px 0;
  box-sizing: border-box;
}

.content-center.c0 {
  /* background: url(../../../assets/img/bg-contend.png) no-repeat center center; */
}
.content-center.c1 {
  /* background: url(../../../assets/img/mxjg.png) no-repeat center center; */
}
.content-center.c2 {
  /* background: url(../../../assets/img/mxjg.png) no-repeat center center; */
}
.content-center.c3 {
  /* background: url(../../../assets/img/my-alreadydone.png) no-repeat center 
    center;*/
}
.content-center.c4 {
  /* background: url(../../../assets/img/bg-contend.png) no-repeat center center; */
}
.content-center.c5 {
  /* background: url(../../../assets/img/bg-contend.png) no-repeat center center; */
}
.content-center.c6 {
  background: url(../../../assets/img/bg-contend.png) no-repeat center center;
}
.content-center.c7 {
  background: url(../../../assets/img/bg-contend.png) no-repeat center center;
}
.content-center.c8 {
  background: url(../../../assets/img/bg-contend.png) no-repeat center center;
}
.content-center.c9 {
  background: url(../../../assets/img/bg-contend.png) no-repeat center center;
}
.content-center.c10 {
  background: url(../../../assets/img/bg-contend.png) no-repeat center center;
}
.content-center.c11 {
  background: url(../../../assets/img/bg-contend.png) no-repeat center center;
}
.content-center,
.content-center.c0,
.content-center.c1,
.content-center.c2,
.content-center.c3,
.content-center.c4,
.content-center.c5,
.content-center.c6,
.content-center.c7,
.content-center.c8,
.content-center.c9,
.content-center.c10,
.content-center.c11,
.content-center.c12,
.content-center.c13,
.content-center.c14 {
  background-size: cover;
  position: relative;
  background-attachment: fixed;
  background-position: center 0;
  background-repeat: no-repeat;
}
.list {
  /* border: 1px solid; */
  width: 1390px;
  position: relative;
  padding: 17px 0;
  margin: 0 auto;
}

.honeycomb-div {
  width: 100%;
  margin: auto;
}
.wrap {
  width: 100%;
}
.wrap ul {
  margin: 0;
  padding: 0;
}
.wrap ul {
  list-style: none;
  width: 100%;
}
.wrap li {
  float: left;
  margin: -17px 7px;
  position: relative;
  cursor: pointer;
}
.wrap .hex {
  overflow: hidden;
  display: block;
  width: 160px;
  height: 181px;
  transform: rotate(-60deg) skewY(30deg);
}
.wrap .hexIn {
  background: hsla(0, 0%, 100%, 0.8);
  display: block;
  width: 160px;
  height: 181px;
  line-height: 181px;
  text-align: center;
  transform: skewY(-30deg) rotate(60deg);
  z-index: 2;
}
.wrap .hexIn.active {
  background: #fff;
}
.wrap li > img {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -35px;
  margin-left: -35px;
  display: inline-block;
  width: 70px;
  height: 70px;
  z-index: 1;
}
.wrap li.a0 {
  margin-left: 352px;
}
.wrap li.a3 {
  margin-right: 352px;
}
.wrap li.a4 {
  margin-left: 263px;
}
.wrap li.a8 {
  margin-right: 263px;
}
.wrap li.a9 {
  margin-left: 175px;
}
.wrap li.a14 {
  margin-right: 175px;
}
/* 修改滚动条样式 */
.nav-tabs-scroll {
  /* overflow-x: auto; */
}
.container {
  /* border: 1px solid red; */
}
.nav-item-scroll {
  /* background: red; */
  color: #24252e;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  padding: 8px 8px 180px;
  text-align: center;
  display: inline;
  margin: 0 4px 0;
  border-radius: 16px;
}
.nav-tabs-scroll::-webkit-scrollbar {
  width: 15px;
  height: 10px;
}
.nav-tabs-scroll::-webkit-scrollbar-thumb {
  border-radius: 5px;
  /* background: red; */
  background-color: hsl(215, 46%, 64%);
}
.nav-tabs-scroll::-webkit-scrollbar-button {
  width: 10px;
  border-radius: 50%;
  background: #01132c;
}
.nav-tabs-scroll::-webkit-scrollbar-track {
  box-shadow: inset 0 0 2px #333;
  border-radius: 5px;
  background: #01132c;
}
.nav-tabs-scroll::-webkit-scrollbar-corner {
  background: #01132c;
}
/* 修改滚动条样式 end*/
</style>
