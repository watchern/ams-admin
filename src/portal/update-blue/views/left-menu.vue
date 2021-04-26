<template>
  <div
    class="left-menu relative flex a-center flex-cow j-between"
    @mouseleave="menuLeave()"
  >
    <template>
      <div class="top-open flex flex-row a-center">
        <div
          class="logo-wrap flex a-center j-center flex-row"
          style="cursor: pointer"
        >
          <div class="logo-Words" @click="selectMenuIn()">
            {{ projectname }}
          </div>
          <img src="../style/images/color-n.png" class="logo-text" />
        </div>
        <div
          class="menu flex a-center j-between flex-row"
          style="position: relative"
        >
          <div class="list flex a-center j-between flex-row">
            <!-- <div
              ref="navDom"
              class="box flex a-center j-center flex-row"
              @click="selectMenuIn()"
            >
              <div class="name">首页</div>
            </div> -->
            <div
              v-for="(item, index) in applications"
              ref="navDom"
              :key="index"
              class="box flex a-center j-center flex-row"
              :class="[currentIndex === index && 'box-active']"
              @click="selectMenu(item, index)"
            >
              <div class="name">{{ item.name }}</div>
            </div>
          </div>
          <div
            class="tree-out-box absolute"
          >
            <transition
              name="slide-fade"
              v-for="(item, index) in applications"
              :key="index"
            >
              <div
                v-if="isShowTreeList"
                class="tree-list"
                @mouseover="selectMenu(item, index)"
              >
                <!-- :style="{
                    borderLeft:
                      index == '0' ? '1px solid rgb(85,158,212)' : 'none',
                    borderRight:
                      index + 1 == applications.length
                        ? '1px solid rgb(85,158,212)'
                        : 'none',
                  }" -->
                <div
                  class="tree-list-content"
                  :class="[currentIndex === index && 'tree-list-back']"
                >
                  <menu-tree
                    :list="moremenugroup[index]"
                    @closetree="isShrink = true"
                    @click="selectMenu(item, index)"
                  />
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <div class="bottom-open flex a-center j-end flex-row">
        <div
          class="footer-btns flex a-center j-end flex-row"
          @click="isShowSettingList = !isShowSettingList"
          style="padding-right: 15px"
        >
          <!-- <i class="shrink-btn icon iconfont iconleft-1" @click="isShrink=false" /> -->
          <!--          <i class="setting-btn icon iconfont iconmenu-2 setting-btn-right" @click="widthChange" />-->
          <div class="label-wang">
            <i class="label-wang-in" v-if="isThereReminder"></i>
          </div>
          <span class="label-word">{{ $store.getters.name }}</span>
        </div>
        <!--        <div-->
        <!--            class="label-open flex a-center j-end flex-row"-->
        <!--            @click="isShowToolsList=!isShowToolsList, isShowTreeList=false, currentIndex=-1"-->
        <!--        >-->
        <!--          <span class="oper-btn menu-21" style="color: #303030;background: transparent"/>-->
        <!--        </div>-->
      </div>
    </template>

    <transition name="setting-fade">
      <div
        v-if="isShowSettingList"
        class="setting-list absolute"
        @click="isShowSettingList = !isShowSettingList"
        @mouseleave="isShowSettingList = false"
      >
        <div class="setting-list-content">
          <div
            v-for="(item, index) in settingList"
            :key="index"
            class="setting-list-line flex flex-row a-center j-start"
          >
            <i class="el-icon-delete icon" />
            <div class="name-box" @click="item.method">
              <span>{{ item.name }}</span>
              <span
                v-if="item.count"
                class="count"
                :class="[
                  index === 0 ? 'count-red' : index === 1 ? 'count-green' : '',
                ]"
                >{{ item.count }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="showAnimation">
      <div v-if="isShowToolsList" class="tools-list">
        <tools-template-update @func="showWith" />
      </div>
    </transition>
    <div class="page-left" v-if="showHelpWidth">
      <el-collapse class="tools-menu-small" v-model="activeName" accordion>
        <el-collapse-item
          v-for="(item, index) in moremenugroupId"
          :title="item.name"
          :name="index"
        >
          <el-tree
            :data="moremenugroup[index]"
            node-key="id"
            @node-click="handleNodeClick"
            ref="tree"
            highlight-current
            v-if="activeName === index"
            :props="defaultProps"
          >
          </el-tree>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div
      class="page-close"
      v-if="showHelpWidth"
      @click="(showHelpWidth = false), (showHelpHeight = false)"
    ></div>
    <div
      class="readonlyTo"
      v-if="showHelpWidth && showHelpHeight"
      v-loading="loading"
    >
      <div @click="showHelpHeight = false" class="readonlyToX">X</div>
      <div class="readonlyChild" id="readonlyChild"></div>
    </div>
  </div>
</template>

<script>
import { getUserRes } from "@/api/user";
import MenuTree from "./menu-tree/index.vue";
import { cacheDict } from "@/api/base/sys-dict";
import { getUnReadRemind } from "@/api/base/base";
import { querySystemTask } from "@/api/base/systemtask";
import { getByMenuId, saveHelpDocument } from "@/api/base/helpdocument";
export default {
  components: { MenuTree },
  data() {
    return {
      currentIndex: -1,
      websocket: null,
      isShowTreeList: false,
      scrollTop: false,
      isShowSettingList: false,
      isShowToolsList: false,
      isShrink: false,
      nowAppName: "",
      menugroup: {},
      moremenugroup: [],
      moremenugroupId: [],
      defaultProps: {
        children: "children",
        label: "name",
      },
      // 激活菜单
      activeName: "1",
      showHelpWidth: false,
      showHelpHeight: false,
      settingList: [
        {
          icon: "",
          name: "提醒事项",
          count: 0,
          method: this.logoutRemind,
        },
        {
          icon: "",
          name: "系统帮助",
          method: this.showHelp,
        },
        {
          icon: "",
          name: "退出登陆",
          method: this.logout,
        },
      ],
      applications: [],
      workbenchImg: require("../style/images/icon0.png"),
      isThereReminder: false,
      drawer: false,
      loading: false,
      projectname: process.env.VUE_APP_BASE_NAME || "",
    };
  },
  computed: {
    leftWidth() {
      return this.isShrink ? 64 : 120;
    },
    currentMenuGroup() {
      if (this.applications.length === 0) {
        return [];
      }
      const appid = this.applications[this.currentIndex].id;
      console.log(this.menugroup[appid]);
      return this.menugroup[appid];
    },
    getPersonUuid() {
      return this.$store.getters.personuuid;
    },
    // isShowTreeList(){
    //   return this.$store.state.aceState.isShowTreeList
    // }
  },
  watch: {
    isShrink: {
      handler: function (newVal, oldVal) {
        this.$store.commit("aceState/setLeftMenuShrink", newVal);
      },
      immediate: true,
    },
    currentIndex() {
      this.currentIndexChange();
    },
    getPersonUuid(newv, oldv) {
      if (newv && newv != "") {
        this.webSocket = this.getWebSocket(newv);
      }
    },
  },
  created() {
    // 页面刚进入时开启长连接
    this.init();
    if (this.getPersonUuid) {
      this.webSocket = this.getWebSocket(this.getPersonUuid);
    }
  },
  mounted() {
    getUserRes()
      .then((response) => {
        response.data.application.forEach((app, index) => {
          // 设置左侧应用栏数据
          this.applications.push({
            img: require(`../style/images/icon${index + 1}.png`),
            name: app.name,
            id: app.id,
          });
        });
        // 设置引用栏弹出二级菜单数据
        response.data.menugroup.forEach((grp) => {
          const menuList = [];
          grp.menuList.forEach((menu) => {
            menuList.push({
              id: menu.id,
              name: menu.name,
              path: this.getCleanSrc(menu.src),
            });
          });
          if (!this.menugroup[grp.appuuid]) {
            this.menugroup[grp.appuuid] = [];
          }
          this.menugroup[grp.appuuid].push({
            id: grp.id,
            name: grp.name,
            path: grp.navurl,
            children: menuList,
          });
        });
        let sSTree = [];
        for (let i = 0; i < this.applications.length; i++) {
          sSTree.push(this.menugroup[this.applications[i].id]);
        }
        let sSLTree = { first: this.applications, second: sSTree };
        sessionStorage.setItem("shenjiMenuTree", JSON.stringify(sSLTree));
        let listTree = JSON.parse(sessionStorage.getItem("shenjiMenuTree"));
        this.moremenugroup = listTree.second;
        this.moremenugroupId = listTree.first;
        var sysDict = JSON.parse(sessionStorage.getItem("sysDict"));
        if (sysDict == null) {
          cacheDict().then((resp) => {
            sessionStorage.setItem("sysDict", JSON.stringify(resp.data));
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });
    getUnReadRemind().then((resp) => {
      if (resp.data <= 99) {
        this.settingList[0].count = resp.data;
      } else {
        this.settingList[0].count = "···";
      }
      if (resp.data !== 0) {
        this.isThereReminder = true;
      }
    });
  },
  methods: {
    init() {
      querySystemTask().then((resp) => {});
    },
    /* initWebSocket() {
      this.webSocket = this.getWebSocket()
    },*/
    /**
     *
     * 使用说明：
     * 1、WebSocket客户端通过回调函数来接收服务端消息。例如：webSocket.onmessage
     * 2、WebSocket客户端通过send方法来发送消息给服务端。例如：webSocket.send();
     */
    getWebSocket(personuuid) {
      const wsuri =
        this.AmsWebsocket.getWSBaseUrl(this.AmsModules.BASE) +
        personuuid +
        "systemTask"; // 连接地址，可加参数
      // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
      this.webSocket = new WebSocket(wsuri); // 建立与服务端的连接
      // 当服务端打开连接
      this.webSocket.onopen = function (event) {};
      // 发送消息
      this.webSocket.onmessage = function (event) {
        func1(event);
      };
      const func2 = function func3(val) {
        var dataObj = JSON.parse(val.data);
        if (dataObj.taskStatus === "2" || dataObj.taskStatus === 2) {
          let html = "";
          if (dataObj.taskUrl !== undefined && dataObj.taskUrl !== "") {
            html =
              '<a style="font-style: normal;color: #17e1e1;text-decoration: underline;cursor: pointer;" href="/#' +
              dataObj.taskUrl +
              '" id="messageTrack">' +
              dataObj.taskName +
              "</a>";
          } else {
            html =
              '<span style="font-style: normal;color: #17e1e1;text-decoration: underline;cursor: pointer;" id="messageTrack">' +
              dataObj.taskName +
              "</span>";
          }
          this.$notify({
            dangerouslyUseHTMLString: true,
            title: "已完成",
            message: html,
            type: "success",
            duration: 15000,
            position: "bottom-right",
          });
        }
      };
      const func1 = func2.bind(this);
      // this.webSocket.onclose = function(event) {
      // }
      // 通信失败
      this.webSocket.onerror = function (event) {};
    },
    currentIndexChange() {
      // const dis = this.isShrink ? 110 : 120
      // this.$nextTick(() => {
      //   const offset = this.$refs.navDom[this.currentIndex].offsetTop - dis
      //   console.log(offset)
      //   this.scrollTop = {
      //     allowScroll: true,
      //     offset: offset,
      //     complete: () => {
      //       this.scrollTop = false
      //     }
      //   }
      // })
    },
    // menuEnter() {
    //   //this.isShrink = false
    //   this.isShowTreeList = true
    // },
    menuLeave() {
      this.currentIndex = -1;
      this.isShowTreeList = false;
      this.isShowSettingList = false;
    },
    getStyle(img) {
      return {
        background: `url(${img}) no-repeat center center`,
        "background-size": "100% 100%",
      };
    },
    selectMenu(app, index) {
      this.currentIndex = index;
      this.isShowTreeList = true;
      this.isShowSettingList = false;
      this.nowAppName = app.name;
      this.isShowToolsList = false;
    },
    action(type) {
      if (type === "prev") {
        this.currentIndex = this.currentIndex === 0 ? 0 : this.currentIndex - 1;
      } else if (type === "next") {
        this.currentIndex =
          this.currentIndex === this.applications.length - 1
            ? this.applications.length - 1
            : this.currentIndex + 1;
      }
    },
    jumpHome() {
      this.$router.push({ path: "/ams/first" });
    },
    getCleanSrc(src) {
      if (src.indexOf("&resUUID") !== -1) {
        src = src.split("&resUUID")[0];
      } else if (src.indexOf("?resUUID") !== -1) {
        src = src.split("?resUUID")[0];
      }
      return src;
    },
    async logout() {
      this.selectMenuIn();
      sessionStorage.clear();
      await this.$store.dispatch("user/logout");
      this.$router.push(`/login?redirect=${this.$route.fullPath}`);
    },
    logoutRemind() {
      this.$router.push({ path: "/base/remind" });
    },
    showWith(obj) {
      this.isShowToolsList = obj;
    },
    widthChange() {
      this.isShrink = !this.isShrink;
    },
    selectMenuIn() {
      this.$store.commit("aceState/setRightFooterTags", {
        type: "closeAll",
        val: "",
      });
      this.$router.push({ path: "/ams/first" });
    },
    showHelp() {
      this.showHelpWidth = !this.showHelpWidth;
    },
    // 父节点不可选中
    ifFather(data) {
      if (data.children) {
        return true;
      } else {
        return false;
      }
    },
    handleNodeClick(data) {
      if (data.id <= 1000) {
      } else {
        this.loading = true;
        this.showHelpHeight = true;
        let id = data.id;
        getByMenuId(id).then((resp) => {
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
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.left-menu {
  height: 60px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  .top-open {
    float: left;
    .logo-text {
      width: 65px;
      height: 11px;
      position: absolute;
      top: 36px;
      left: 20px;
    }
    .logo-Words {
      color: #303030;
      font-size: 24px;
      margin-left: 30px;
      font-weight: bold;
      width: 300px;
      margin-right: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .logo-wrap {
      // margin-right: 200px;
    }
    .menu {
      margin-top: 0px;
      .icon {
        font-size: 16px;
        cursor: pointer;
        &:active {
          opacity: 0.6;
        }
        &-disable {
          cursor: not-allowed;
          color: grey;
        }
      }
      .list {
        margin: 10px 0;
        max-height: 415px;
        //overflow-y: auto;
        &::-webkit-scrollbar {
          width: 0;
        }
        .box {
          width: 90px;
          height: 50px;
          padding: 5px 0;
          cursor: pointer;
          margin: 0 30px 0 30px;
          position: relative;
          color: #303030;
          .img {
            width: 26px;
            height: 26px;
            margin-bottom: 8px;
          }
          .name {
            font-family: PingFangSC-Regular;
            font-size: 16px;
            letter-spacing: 0.3px;
            text-align: center;
            font-weight: bold;
          }
          &-active {
            background: transparent;
            color: #3dabdf;
          }
        }
      }
    }
  }
  .bottom-open {
    .search-box {
      .search-input {
        background: #3d424b;
        border: 1px solid rgba(168, 172, 178, 0.3);
        font-family: BebasNeue;
        font-size: 11.38px;
        color: #8691a2;
        letter-spacing: 0;
        width: 90px;
        height: 28px;
        padding-left: 4px;
        margin-bottom: 9px;
        position: relative;
      }
      > i {
        font-size: 16px;
        margin-right: 2px;
        color: #8691a2;
        margin-left: -20px;
        z-index: 10;
        margin-bottom: 9px;
        cursor: pointer;
      }
      &::before {
        content: "";
        position: absolute;
        top: -10px;
        left: 0;
        right: 0;
        height: 1px;
        background: #505866;
      }
    }
    .label-wang {
      position: relative;
      margin-right: 14px;
    }
    .label-open {
      color: #303030;
      letter-spacing: 0;
      padding-left: 10px;
      cursor: pointer;
      span {
        font-size: 20px;
        line-height: 20px;
        color: #303030;
        background: transparent;
        width: 26px;
        height: 26px;
        margin-right: 30px;
      }
    }
  }
  .tools-list {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 1000;
    width: 100%;
    height: 100%;
  }
  .setting-list {
    width: 177px;
    right: 30px;
    top: 60px;
    padding: 12px;
    z-index: 20201231;
    .setting-list-content {
      background: rgb(85, 158, 212);
      padding: 20px;
      box-shadow: -5px 5px 10px 0 rgb(90, 195, 235);
      border-radius: 8px;
    }
    &-line {
      font-family: PingFangSC-Regular;
      font-size: 16px;
      color: #fff;
      letter-spacing: 0.88px;
      line-height: 40px;
      height: 40px;
      &:hover {
        color: white;
      }
      &:not(:last-child) .name-box {
        //border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      }
      .icon {
        color: #fff;
      }
      .name-box {
        margin-left: 10px;
        height: 100%;
        cursor: pointer;
        .count {
          display: inline-block;
          margin-left: 8px;
          height: 14px;
          line-height: 14px;
          padding: 0 2px;
          font-family: DINCondensed-Bold;
          font-size: 10px;
          color: #ffffff;
          letter-spacing: 0.75px;
          border-radius: 7px;
          &-red {
            background: red;
          }
          &-green {
            background: #006320;
          }
        }
      }
    }
  }
  .tree-out-box {
    backdrop-filter: blur(4px) brightness(110%);
    top: 65px;
    left: 0;
    z-index: 999;
    width: 100%;
    display: flex;
    border-top: none !important;
    box-shadow: 0 4px 10px 0 rgb(3 136 238 / 38%);
    background-image: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.2) 97%,
      rgba(219, 233, 252, 0.3)
    );
  }
  .tree-list {
    &-back {
      box-shadow: 0 4px 10px 0 rgb(3 136 238 / 38%);
      border-top: 2px solid;
      z-index: 1000;
    }
    &-content {
      // backdrop-filter: blur(8px);
      // background: hsla(0, 0%, 100%, 0.6);
      width: 150px;
      height: 100%;
    }
  }
  .top {
    margin-top: 0;
    .logo {
      width: 30px;
      height: 30px;
      margin-bottom: 20px;
    }
    .menu {
      .icon {
        font-size: 20px;
        &:active {
          opacity: 0.6;
        }
        &-disable {
          cursor: not-allowed;
          color: grey;
        }
      }
      .list {
        margin: 15px 0 15px 0;
        max-height: 300px;
        &::-webkit-scrollbar {
          width: 0;
        }
        .box {
          padding: 4px;
          &:not(:last-child) {
            margin-bottom: 20px;
          }
          cursor: pointer;
          &-active {
            background: #d70010;
            border-radius: 4px;
          }
          .img {
            width: 31px;
            height: 31px;
            outline: none;
          }
        }
      }
    }
  }
  .unfold-icon {
    font-size: 26px;
  }
  .label-wang {
    border-radius: 100%;
    border: 1px solid #ccc;
    background: #fff;
    width: 40px;
    height: 40px;
    background: url(../style/images/logo.png) 0 0;
    background-size: 100% 100%;
  }
  .label-word {
    font-family: PingFangSC-Semibold;
    font-size: 16px;
    color: #303030;
    display: inline-block;
    text-align: center;
    line-height: 34px;
    padding: 5px;
    cursor: pointer;
    overflow: hidden;
    font-weight: bold;
    white-space: nowrap;
    position: relative;
  }
  .bottom {
    font-size: 20px;
    color: #ffffff;
    .label-wang {
      margin-bottom: 10px;
    }
    .label-open,
    .label-search {
      display: inline-block;
      width: 28px;
      height: 28px;
      border-radius: 4px;
      text-align: center;
      line-height: 28px;
      margin-bottom: 61px;
      color: #525a65;
      cursor: pointer;
    }
    .label-open {
      background: #aab5c8;
    }
    .label-search {
      border: 1px solid #585e65;
      margin-bottom: 12px;
    }
  }
  .shrink-btn {
    color: #ffffff;
    cursor: pointer;
  }
}
.shrink-btn-div-open {
  margin-right: -40px;
  background: #353a43;
  border-radius: 100%;
  padding: 0px 3px 0px 10px;
  float: right;
  height: 38px;
  line-height: 38px;
}
.shrink-btn-div-close {
  margin-right: -40px;
  background: #353a43;
  border-radius: 100%;
  padding: 0px 3px 0px 10px;
  float: right;
  height: 38px;
  line-height: 38px;
}
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.6s;
}
.slide-fade-enter,
.slide-fade-leave-to {
  opacity: 0;
}
.setting-btn {
  font-size: 20px;
  color: #ffffff;
  cursor: pointer;
}
.showAnimation-enter-active,
.showAnimation-leave-active {
  transition: all 0.5s;
}
.showAnimation-enter,
.showAnimation-leave-to {
  opacity: 0;
}

.setting-fade-enter-active,
.setting-fade-leave-active {
  transition: all 0.5s;
}
.setting-fade-enter,
.setting-fade-leave-to {
  opacity: 0;
}
.setting-btn-right {
  margin-left: 16px;
  margin-right: 15px;
}
.setting-btn-Upright {
  transform: rotate(90deg);
}
.label-wang-in {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 10px;
  height: 10px;
  border-radius: 100%;
  background-color: red;
}
.somehelp {
  position: absolute;
  top: 588px;
  right: 25px;
  background-color: #aab5c8;
  display: inline-block;
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  border-radius: 100%;
  font-weight: bolder;
  cursor: pointer;
  display: none;
}
.page-left {
  position: absolute;
  top: 200px;
  right: 30px;
  width: 260px;
  height: 620px;
  background: #fff;
  padding: 15px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  z-index: 1002;
}
.page-close {
  position: fixed;
  top: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  background-color: rgba(0, 0, 0, 0.5);
}
.tools-menu-small {
  height: 590px;
  width: 100%;
  overflow: auto;
}
.readonlyTo {
  width: 50vw;
  height: 100%;
  top: 0;
  left: 0;
  position: fixed;
  z-index: 1001;
  animation: whiteIn 0.8s forwards;
}
.readonlyChild {
  position: absolute;
  top: 0;
  right: 0;
  width: 50vw;
  height: 100vh;
  background-color: #fff;
  padding: 15px;
  animation: whiteIn 0.8s forwards;
  overflow: auto;
}
@keyframes whiteIn {
  0% {
    width: 0;
  }
  100% {
    width: 50vw;
  }
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
>>> .el-tree {
  // 不可全选样式
  .el-tree-node {
    .is-leaf + .el-checkbox .el-checkbox__inner {
      display: inline-block;
    }
    .el-checkbox .el-checkbox__inner {
      display: none;
    }
  }
}
</style>
