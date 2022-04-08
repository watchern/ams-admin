<template>
  <div class="home flex a-start flex-column j-start w100">
    <div class="home-top flex-shrink w100">
      <LeftMenu @changestyle="changestyle" />
    </div>
    <!-- 内容盒子 -->
    <div
      class="home-right flex1 flex a-start j-start flex-column change-box"
      :style="stylestring"
    >
      <div
        class="breadcrumboutbox"
        v-if="
          breadcrumblist != '' &&
          breadcrumblist != [] &&
          breadcrumblist[0] != '首页' &&
          breadcrumblist[0] != '审计概览'
        "
      >
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="(item, i) in breadcrumblist"
            :key="'breadcrumb' + i"
            >{{ item }}</el-breadcrumb-item
          >
        </el-breadcrumb>
      </div>
      <div class="home-right-content flex1 w100 skin-home-rc">
        <!-- <keep-alive> -->
        <router-view />
        <!-- </keep-alive> -->
        <!-- 暂时注掉 -->
        <!-- <el-tooltip
          content="系统帮助"
          placement="top"
          effect="light"
          v-if="false"
        >
          <i
            class="el-icon-question seat"
            @click="getHelp()"
            style="color: rgb(90, 195, 235)"
          ></i>
        </el-tooltip> -->
      </div>
      <div
        v-if="isShowRightFooter"
        class="home-right-footer flex-shrink w100"
        style="height: 0"
      >
        <RightFooter />
      </div>
    </div>
    <div class="readonlyTo" v-if="showHelpHeight" v-loading="loading">
      <div class="readonlyChild" id="readonlyChild"></div>
      <div @click="showHelpHeight = false" class="readonlyToX">X</div>
      <div class="readonlyClose" @click="showHelpHeight = false"></div>
    </div>
  </div>
</template>

<script>
import Watermark from "@/utils/watermark.js";
// import { get_userInfo } from "@WISDOMAUDIT/api/shandong/ls";
import LeftMenu from "./views/left-menu";
import RightFooter from "./views/right-footer";
import { getHelpByMenuPath } from "@/api/base/helpdocument";
export default {
  components: {
    LeftMenu,
    RightFooter,
  },
  data() {
    return {
      showHelpHeight: false,
      loading: false,
      stylestring: "left:181px;width:calc(100vw - 181px);",
      breadcrumblist: [],
      timer: "",
    };
  },
  computed: {
    isShowRightFooter() {
      // const result = this.$route.meta && this.$route.meta.isShowRightFooter
      // return result || false
      if (this.$store.state.aceState.rightFooterTags.length > 0) {
        return true;
      } else {
        return false;
      }
    },
  },
  created() {
    // let cache = [];
    // let rep = JSON.parse(
    //   JSON.stringify(mainstore.state, function (key, value) {
    //     if (typeof value === "object" && value !== null) {
    //       if (cache.indexOf(value) !== -1) {
    //         // 移除
    //         return;
    //       }
    //       // 收集所有的值
    //       cache.push(value);
    //     }
    //     return value;
    //   })
    // );
    // cache = null;
    if (sessionStorage.getItem("store")) {
      this.$store.replaceState(
        Object.assign(
          {},
          this.$store.state,
          JSON.parse(sessionStorage.getItem("store"))
        )
      );
    }
    //  else {
    //   console.log("信息存储g");
    //   sessionStorage.setItem('store', JSON.stringify({user:this.$store.state.user}))
    // }
    window.addEventListener("beforeunload", () => {
      sessionStorage.setItem("store", JSON.stringify(this.$store.state));
    });

    this.$store.dispatch("user/login", {}).then(() => {});
    if (this.$route.meta) {
      this.breadcrumblist = this.$route.meta.title
        ? this.$route.meta.title.split("-")
        : [];
    }
    this.getWatermark();
  },
  watch: {
    $route: {
      handler(val, oldval) {
        console.log(val.meta.title); //新路由信息
        if (val.meta) {
          this.breadcrumblist = val.meta.title ? val.meta.title.split("-") : [];
        }
        console.log(this.breadcrumblist);
      },
      // 深度观察监听
      deep: true,
    },
  },
  methods: {
    transformTimestamp(timestamp) {
      let a = new Date(timestamp).getTime();
      const date = new Date(a);
      const Y = date.getFullYear() + "-";
      const M =
        (date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1) + "-";
      const D =
        (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + "  ";
      const h =
        (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":";
      const m =
        date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      // const s = date.getSeconds(); // 秒
      const dateString = Y + M + D + h + m;
      // console.log('dateString', dateString); // > dateString 2021-07-06 14:23
      return dateString;
    },
    //获取当前登录人信息
    getWatermark() {
      //获取当前登录人信息
      // get_userInfo().then((resp) => {
      //   this.userInfo = resp.data;
      //   let time = this.transformTimestamp(this.userInfo.user.lastLoginTime);

      //   console.log(this.userInfo);
      //   // 水印
      //   Watermark.set(
      //     this.userInfo.user.realName,
      //     this.userInfo.user.mobile,
      //     time
      //   );
      // });
    },
    getHelp() {
      let saveData = [];
      saveData.push({
        menuPath: this.$route.fullPath,
      });
      this.loading = true;
      this.showHelpHeight = true;
      getHelpByMenuPath(saveData[0]).then((resp) => {
        if (resp.code === 0 && resp.data !== null) {
          if (resp.data.helpDocument !== "") {
            document.getElementById("readonlyChild").innerHTML =
              resp.data.helpDocument;
          } else {
            document.getElementById("readonlyChild").innerHTML =
              "<p>暂无新手引导</p>";
          }
          this.loading = false;
        } else if (resp.code === 0 && resp.data === null) {
          document.getElementById("readonlyChild").innerHTML =
            "<p>暂无新手引导</p>";
          this.loading = false;
        }
      });
    },
    changestyle(stylestring) {
      this.stylestring = stylestring;
    },
  },
};
</script>

<style lang="scss" scoped >
.home {
  height: 100vh;
  background: #fff url("style/images/bg.png") no-repeat left center fixed;
  background-size: 100% 100%;
  &-left {
    height: 100vh;
  }
  &-right {
    height: calc(100vh - 62px);
    &-content {
      height: calc(100% - 95px);
    }
    &-footer {
      height: 30px;
    }
  }
  .homezz {
    height: 100% !important;
  }
}
.home-top {
  //z-index:20201111;
  z-index: 1999;
}
.home-right {
  //#eaeaea url('style/images/bg.png') no-repeat left center fixed
  background: #fff;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  width: 100vw;
}
.home-right-content {
  overflow: auto;
  width: calc(100% - 24px);
  height: calc(100% - 32px);
  // border-radius: 30px;
  margin: 16px 10px;
  background: #ffffff !important;
}
.seat {
  position: absolute;
  right: 4px;
  bottom: 4px;
  font-size: 24px;
  background: #fff;
  border-radius: 100%;
  cursor: pointer;
}
.readonlyTo {
  width: 100%;
  height: 100%;
  top: 0;
  right: 0;
  position: fixed;
  z-index: 10001;
  animation: whiteIn 0.8s forwards;
}
.readonlyChild {
  position: absolute;
  top: 0;
  right: 0;
  width: 50vw;
  height: 100%;
  background-color: #fff;
  padding: 15px;
  animation: whiteIn 0.8s forwards;
  overflow: auto;
  z-index: 100;
}
@keyframes whiteIn {
  0% {
    width: 0;
  }
  100% {
    width: 50vw;
  }
}
.readonlyClose {
  position: fixed;
  top: 0;
  right: 0;
  width: 100vw;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
.readonlyToX {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  border-radius: 100%;
  background-color: #333;
  color: #fff;
  line-height: 20px;
  text-align: center;
  z-index: 1001;
  cursor: pointer;
}
.change-box {
  position: absolute;
  top: 60px;
}
.breadcrumboutbox {
  padding: 15px 30px 0 30px;
  font-size: 20px;
  font-weight: bold;
}
</style>
