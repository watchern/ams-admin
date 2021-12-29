<template>
  <div class="left-menu relative"
       style="width: 100%"
       @mouseleave="menuLeave()">
    <template>
      <div style="float: left; width: 100%">
        <div class="left_menu_nav">
          <div class="change-btn-box"
               @click="changestyle">
            <i class="el-icon-s-fold"
               v-if="showMenu"></i>
            <i class="el-icon-s-unfold"
               v-else></i>
          </div>
          <div class="big-logo-box">
            <!-- ◇ 审计系统 -->
            <img src="../style/images/mobile.png"
                 class="logo-img"
                 style="width: 100%; height: 100%" />
          </div>

          <div class="top-open flex flex-row a-center">
            <div class="logo-wrap flex a-center j-center flex-row">
              <div class="logo-Words">
                {{ projectname }}
              </div>
              <!-- <img src="../style/images/color-n.png" class="logo-text" /> -->
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-open">
        <!-- <svg-icon icon-class="remind"
                  style="margin-right: 20px; height: 24px; width: 17px" /> -->

        <!-- <div class="bottom-open flex a-center j-end flex-row">
        <svg-icon icon-class="remind"
                  style="margin-right: 20px; height: 24px; width: 17px" /> -->
        <!-- <i class="el-icon-message-solid" style="margin-right: 20px; font-size:23px; color:#439bd8;"></i> -->
        <div class="footer-btns flex a-center j-end flex-row"
             @click="isShowSettingList = !isShowSettingList"
             style="padding-right: 15px">
          <!-- <i class="shrink-btn icon iconfont iconleft-1" @click="isShrink=false" /> -->
          <!--          <i class="setting-btn icon iconfont iconmenu-2 setting-btn-right" @click="widthChange" />-->
          <div class="label-wang">
            <svg-icon icon-class="user"
                      style="height: 100%; width: 100%" />
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
      <div v-if="isShowSettingList"
           class="setting-list absolute"
           @click="isShowSettingList = !isShowSettingList"
           @mouseleave="isShowSettingList = false">
        <div class="setting-list-content">
          <div v-for="(item, index) in settingList"
               :key="index"
               class="setting-list-line flex flex-row a-center j-start">
            <i v-if="index == 0"
               class="el-icon-info icon" />
            <i v-else-if="index == 1"
               class="el-icon-question icon" />
            <i v-else-if="index == 2"
               class="el-icon-s-tools icon" />
            <i v-else
               class="el-icon-error icon" />
            <div class="name-box"
                 @click="item.method">
              <span>{{ item.name }}</span>
              <!-- <span
                v-if="item.count"
                class="count"
                :class="[
                  index === 0 ? 'count-red' : index === 1 ? 'count-green' : '',
                ]"
                >{{ item.count }}</span
              > -->
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="showAnimation">
      <div v-if="isShowToolsList"
           class="tools-list">
        <tools-template-update @func="showWith" />
      </div>
    </transition>
    <div class="page-left"
         v-if="showHelpWidth">
      <el-collapse class="tools-menu-small"
                   v-model="activeName"
                   accordion>
        <el-collapse-item v-for="(item, index) in moremenugroupId"
                          :title="item.name"
                          :name="index">
          <el-tree :data="moremenugroup[index]"
                   node-key="id"
                   @node-click="handleNodeClick"
                   ref="tree"
                   highlight-current
                   v-if="activeName === index"
                   :props="defaultProps">
          </el-tree>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="page-close"
         v-if="showHelpWidth"
         @click="(showHelpWidth = false), (showHelpHeight = false)"></div>
    <div class="readonlyTo"
         v-if="showHelpWidth && showHelpHeight"
         v-loading="loading">
      <div @click="showHelpHeight = false"
           class="readonlyToX">X</div>
      <div class="readonlyChild"
           id="readonlyChild"></div>
    </div>
    <div class="menu-box"
         v-if="showMenu">
      <!-- flex a-center j-center flex-row -->
      <!-- :class="[currentIndex === index && 'box-active']" -->
      <!-- ref="navDom" -->
      <!-- <p class="tion">{{applications}}</p> -->
      <div v-for="(item, index) in applications"
           :key="index"
           class="box frist-box"
           @click="selectMenu(item, index)">
        <div class="name"
             :class="currentIndex === index ? 'active-box' : ''">
          <svg-icon :icon-class="
              'cd' + (index + 1) + (currentIndex === index ? 'x' : 'w')
            "
                    style="margin-right: 5px" />
          {{ item.name }}
          <span v-if="item.childrenlength != 0"><i class="el-icon-caret-right big-font"
               v-if="currentIndex === index ? false : true"></i>
            <i class="el-icon-caret-bottom big-font"
               v-else></i>
          </span>
        </div>
        <el-collapse-transition>
          <div v-if="isShowTreeList == index ? true : false"
               class="tree-list">
            <div :class="[currentIndex === index && 'tree-list-back']">
              <!-- 二级目录 -->
              <div class="ace-tree">
                <div v-for="(e, i) in moremenugroup[index]"
                     :key="'menugroup' + i"
                     v-if="e.type != 2"
                     :class="secchoose == i ? 'secondchoose' : ''"
                     @click.stop="openMenu2(e, i)">
                  <div class="innermenubox">
                    <span v-if="e.children && e.children.length">
                      <i v-if="secchoose != i"
                         class="el-icon-caret-right icon mid-font" />
                      <i v-else
                         class="el-icon-caret-bottom icon mid-font" />
                    </span>
                    <span class="name2"
                          :class="['text-black']">{{
                      e.name
                    }}</span>
                  </div>
                  <!-- 三级目录 -->
                  <div v-show="e.children && e.children.length && secchoose == i">
                    <div v-for="(c, ci) in e.children"
                         :key="'c' + ci"
                         @click.stop="openMenu3(c, ci)"
                         class="innermenubox innermenubox3"
                         :class="thichoose == ci ? 'thirdchoose' : ''">
                      <span class="name3">
                        {{ c.name }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-collapse-transition>
      </div>
      <div class="menu-box-content"
           @click="changestyle()">
        <i class="el-icon-caret-left"></i>
      </div>
    </div>
    <div class="menu-boxin"
         v-else
         @click="changestyle()">
      <div class="menu-boxin-content">
        <i class="el-icon-caret-right"></i>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { getUserRes } from "@/api/user";
import { cacheDict } from "@/api/base/sys-dict";
import { getUnReadRemind } from "@/api/base/base";
import { querySystemTask } from "@/api/base/systemtask";
import { getByMenuId, saveHelpDocument } from "@/api/base/helpdocument";
export default {
  data () {
    return {
      dqtoken: "",
      showMenu: true,
      currentIndex: -1,
      websocket: null,
      isShowTreeList: -1,
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
        // {
        //   icon: "",
        //   name: "提醒",
        //   count: 0,
        //   method: this.logoutRemind,
        // },
        // {
        //   icon: "",
        //   name: "帮助",
        //   method: this.showHelp,
        // },
        // {
        //   icon: "",
        //   name: "修改密码",
        //   method: this.goresetpassword,
        // },
        {
          icon: "",
          name: "退出",
          method: this.logout,
        },
      ],
      applications: [],
      workbenchImg: require("../style/images/icon0.png"),
      isThereReminder: false,
      drawer: false,
      loading: false,
      projectname: process.env.VUE_APP_BASE_NAME || "",
      secchoose: -1,
      thichoose: -1,
    };
  },
  computed: {
    leftWidth () {
      return this.isShrink ? 64 : 120;
    },
    currentMenuGroup () {
      if (this.applications.length === 0) {
        return [];
      }
      const appid = this.applications[this.currentIndex].id;
      console.log(this.menugroup[appid]);
      return this.menugroup[appid];
    },
    getPersonUuid () {
      return this.$store.getters.personuuid;
    },
    // isShowTreeList(){
    //   return this.$store.state.aceState.isShowTreeList
    // }
  },
  watch: {
    $route: {
      handler (val, oldval) {
        if (oldval.path == "/login") {
          this.initmounted();
        }
        // if (val.path == "/audit/auditItems/projectWorkbench") {
        //   this.changestyle("Workbench");
        // }
        if (
          oldval.path == "/audit/home" &&
          val.path == "/audit/auditItems/projectWorkbench" &&
          val.query
        ) {
          for (let i = 0; i < this.applications.length; i++) {
            if (this.applications[i].name == "审计项目") {
              this.selectMenu(this.applications[i], i, "home");
              for (let j = 0; j < this.moremenugroup[i].length; j++) {
                if ((this.moremenugroup[i][j].name = "审计工作台")) {
                  this.secchoose = j;
                  this.thichoose = -1;
                }
              }
            }
          }
        }
      },
      // 深度观察监听
      deep: true,
    },
    isShrink: {
      handler: function (newVal, oldVal) {
        this.$store.commit("aceState/setLeftMenuShrink", newVal);
      },
      immediate: true,
    },
    currentIndex () {
      this.currentIndexChange();
    },
    getPersonUuid (newv, oldv) {
      if (newv && newv != "") {
        this.webSocket = this.getWebSocket(newv);
      }
    },
  },
  created () {
    this.dqtoken = sessionStorage.getItem("TOKEN");
    // 页面刚进入时开启长连接
    this.init();
    if (this.getPersonUuid) {
      this.webSocket = this.getWebSocket(this.getPersonUuid);
    }
  },
  mounted () {
    this.initmounted();
  },
  methods: {
    //切换样式
    changestyle (bool) {
      if (bool == "Workbench") {
        this.showMenu = false;
        this.$emit("changestyle", "left:0;width:100vw;");
      } else {
        if (this.showMenu) {
          this.$emit("changestyle", "left:0;width:100vw;");
        } else {
          this.$emit("changestyle", "left:181px;width:calc(100vw - 181px);");
        }
        this.showMenu = !this.showMenu;
      }
    },
    initmounted () {
      getUserRes()
        .then((response) => {
          console.log(response.data)
          this.applications = [];
          response.data.forEach((app, index) => {
            // 设置左侧应用栏数据
            this.applications.push({
              img: require(`../style/images/icon0.png`),
              name: app.name,
              permissionId: app.permissionId,
              homepage: app.homepage || "",
              url: app.url || "",
              type: app.type || "",
              childrenlength: app.children.length,
            });
          });
          this.menugroup = [];
          // 设置引用栏弹出二级菜单数据
          response.data.forEach((grp) => {
            const menuList = [];
            grp.children.forEach((menu) => {
              menuList.push({
                permissionId: menu.permissionId,
                name: menu.name,
                url: this.getCleanSrc(menu.url || ""),
                children: menu.children,
                type: menu.type,
              });
            });
            if (!this.menugroup[grp.permissionId]) {
              this.menugroup[grp.permissionId] = [];
            }
            this.menugroup[grp.permissionId] = menuList;
            // this.menugroup[grp.permissionId].push({
            //   id: grp.permissionId,
            //   name: grp.name,
            //   path: grp.navurl || "",
            //   children: menuList,
            // });
          });
          let sSTree = [];
          for (let i = 0; i < this.applications.length; i++) {
            sSTree.push(this.menugroup[this.applications[i].permissionId]);
          }
          let sSLTree = { first: this.applications, second: sSTree };
          sessionStorage.setItem("shenjiMenuTree", JSON.stringify(sSLTree));
          let listTree = JSON.parse(sessionStorage.getItem("shenjiMenuTree"));
          this.moremenugroup = listTree.second;
          this.moremenugroupId = listTree.first;
          var sysDict = JSON.parse(sessionStorage.getItem("sysDict"));
          if (sysDict == null) {
            // 暂时注掉
            cacheDict().then((resp) => {
              sessionStorage.setItem("sysDict", JSON.stringify(resp.data));
            });
          }
        })
        .catch((error) => {
          this.applications = [];
          console.error(error);
        });
      //暂时注掉
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
    //暂时注掉
    init () {
      querySystemTask().then((resp) => { });
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
    getWebSocket (personuuid) {
      const wsuri =
        this.AmsWebsocket.getWSBaseUrl(this.AmsModules.BASE) +
        personuuid +
        "systemTask"; // 连接地址，可加参数
      // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
      this.webSocket = new WebSocket(wsuri); // 建立与服务端的连接
      // 当服务端打开连接
      this.webSocket.onopen = function (event) { };
      // 发送消息
      this.webSocket.onmessage = function (event) {
        func1(event);
      };
      const func2 = function func3 (val) {
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
            duration: 2000,
            position: "bottom-right",
          });
        }
      };
      const func1 = func2.bind(this);
      // this.webSocket.onclose = function(event) {
      // }
      // 通信失败
      this.webSocket.onerror = function (event) { };
    },
    currentIndexChange () {
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
    menuLeave () {
      // this.currentIndex = -1;
      // this.isShowTreeList = false;
      // this.isShowSettingList = false;
    },
    getStyle (img) {
      return {
        background: `url(${img}) no-repeat center center`,
        "background-size": "100% 100%",
      };
    },
    selectMenu (app, index, ifhome) {
      this.secchoose = -1;
      this.thichoose = -1;
      // window.open('http://10.19.206.196:8088/WebReport/decision/view/form?viewlet=vendor/zhuowang/test.cpt&ref_t=design&ref_c=d6740dbd-0279-40d0-b361-3cc1adb80d35');
      //审计概览个性化
      if (app.name == "审计概览") {
        axios({
          url:
            `/wisdomaudit/dataAuditApi/getSignature?userName=` +
            this.$store.state.user.datauserid,
          headers: {
            TOKEN: this.dqtoken,
          },
          method: "get",
          data: {},
        }).then((res) => {
          if (res.data.code == 0) {
            let reptoken = res.data.data.token;
            let url =
              "http://10.19.206.196:8088/WebReport/decision/third/auth/cross/login";
            $.ajax({
              url: url,
              dataType: "jsonp",
              data: { third_token: reptoken },
              success: function (res2) {
                if (res2.errorCode) {
                  console.log("帆软认证接口调用失败", res2);
                } else {
                  console.log("帆软认证接口调用成功", res2);
                  window.open(app.url);
                  return;
                }
              },
              error: function () {
                alert("超时或服务器其他错误"); // 登录失败（超时或服务器其他错误）
                return;
              },
            });
          } else {
            return;
          }
        });
        return;
      }
      this.isShowSettingList = false;
      this.isShowToolsList = false;
      if (this.currentIndex == index) {
        this.currentIndex = -1;
        this.isShowTreeList = -1;
        return;
      } else {
        this.currentIndex = index;
      }
      this.nowAppName = app.name;
      if (app.url) {
        this.$router.push({ path: app.url });
        this.isShowTreeList = -1;
        return;
      }
      this.isShowTreeList = index;
      if (ifhome != "home") {
        if (app.childrenlength > 0) {
          if (
            this.moremenugroup[index] &&
            this.moremenugroup[index][0].children.length > 0
          ) {
            console.log(this.moremenugroup[index][0]);
            this.openMenu2(this.moremenugroup[index][0], 0);
            this.openMenu3(this.moremenugroup[index][0].children[0], 0);
          } else {
            this.openMenu2(this.moremenugroup[index][0], 0);
          }
        }
      }
    },
    openMenu2 (item, index) {
      if (this.secchoose == index) {
        this.secchoose = -1;
      } else {
        this.secchoose = index;
      }
      this.thichoose = -1;
      if (item.url) {
        this.$router.push({ path: item.url });
        return;
      }
    },
    openMenu3 (item, index) {
      this.thichoose = index;
      if (item.url) {
        this.$router.push({ path: item.url });
        return;
      }
    },
    action (type) {
      if (type === "prev") {
        this.currentIndex = this.currentIndex === 0 ? 0 : this.currentIndex - 1;
      } else if (type === "next") {
        this.currentIndex =
          this.currentIndex === this.applications.length - 1
            ? this.applications.length - 1
            : this.currentIndex + 1;
      }
    },
    jumpHome () {
      this.$router.push({ path: "/ams/first" });
    },
    getCleanSrc (url) {
      if (url.indexOf("&resUUID") !== -1) {
        url = url.split("&resUUID")[0];
      } else if (url.indexOf("?resUUID") !== -1) {
        url = url.split("?resUUID")[0];
      }
      return url;
    },
    async logout () {
      this.$store.commit("aceState/setRightFooterTags", {
        type: "closeAll",
        val: "",
      });
      sessionStorage.clear();
      localStorage.clear();
      //退出登录接口
      // await this.$store.dispatch("user/logout");
      this.$router.push(`/login?redirect=${this.$route.fullPath}`);
    },
    goresetpassword () {
      this.$router.push({ path: "/repassword" });
    },
    logoutRemind () {
      this.$router.push({ path: "/base/remind" });
    },
    showWith (obj) {
      this.isShowToolsList = obj;
    },
    widthChange () {
      this.isShrink = !this.isShrink;
    },
    selectMenuIn () {
      this.$store.commit("aceState/setRightFooterTags", {
        type: "closeAll",
        val: "",
      });
      this.$router.push({
        path: this.applications[0].homepage || "/nopermission",
      });
    },
    showHelp () {
      this.showHelpWidth = !this.showHelpWidth;
    },
    // 父节点不可选中
    ifFather (data) {
      if (data.children) {
        return true;
      } else {
        return false;
      }
    },
    handleNodeClick (data) {
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
.left_menu_nav {
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
}
.item {
  .borderbottom {
    //border-bottom: 1px solid #363a43;
  }
  .item-title {
    font-family: PingFangSC-Regular;
    font-size: 13px;
    color: #4c4c4c;
    letter-spacing: 0.88px;
    line-height: 40px;
    height: 40px;
    padding-left: 30px;
    user-select: none;
    text-align: left;
    cursor: pointer;
    &:hover {
      color: #0070c6;
    }
    .icon {
      color: #64bef3;
      right: 25px;
      top: 50%;
      font-size: 16px;
      margin-top: -8px;
      &-open {
        transform: rotateZ(-180deg);
      }
    }
    .name {
      padding: 5px 15px;
      cursor: pointer;
    }
  }
  .ul-temp {
    margin-left: 10px;
    width: 170px;
    // background: rgba(110, 195, 255, 0.15);
  }
}
.innermenubox {
  height: 40px;
  padding: 10px 0 3px 30px;
  .name2 {
    cursor:pointer;
    padding: 6px 15px;
    font-size: 14px;
  }
  .name3 {
    cursor:pointer;
    padding: 6px 15px;
    font-size: 14px;
  }
}
.innermenubox3 {
  padding: 10px 0 3px 40px;
}
.secondchoose {
  .name2 {
    padding: 6px 15px;
    color: #fff;
    background-color: #0c87d6;
    cursor: pointer;
  }
}
.thirdchoose {
  .name3 {
    padding: 6px 15px;
    color: #fff;
    background-color: #0c87d6;
    cursor: pointer;
  }
}
.icon-open {
  transform: rotateZ(-270deg) !important;
}
.bottom-open {
  float: right;
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
  float: right;
  height: 100%;
}

.relative {
  position: relative;
}
.left-menu {
  height: 60px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-color: white;
  box-shadow: 0px 1px 5px rgb(187, 227, 253);

  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;

  .change-btn-box {
    cursor: pointer;
    height: 60px;
    width: 60px;
    background-color: #0084cf;
    color: white;
    font-size: 34px;
    text-align: center;
    line-height: 60px;
  }
  .menu-box {
    padding-top: 20px;
    position: absolute;
    top: 60px;
    left: 0;
    width: 181px;
    height: calc(100vh - 60px);
    background-color: #f2f6fc;
    overflow: auto;
    border-top: 1px solid #eee;
    border-right: 1px solid #eee;
    .name {
      height: 40px;
      line-height: 40px;
      padding-left: 20px;
      // text-align: center;
      font-size: 15px;
      cursor: pointer;
    }
    .active-box {
      color: #fff;
      background-color: rgb(12, 135, 214);
      .big-font {
        font-size: 20px;
        color: #64bef3 !important;
      }
    }
    .big-font {
      font-size: 20px;
      margin-right: 5px;
      color: #64bef3;
      float: right;
      margin: 10px 20px 0 0;
    }
    .mid-font {
      font-size: 20px;
      margin-right: 5px;
      color: #64bef3;
      float: right;
      margin: 0 20px 0 0;
    }
    .tree-list-content {
      width: 181px !important;
    }
    .menu-box-content {
      cursor: pointer;
      position: absolute; /*脱离文档流*/
      right: 0;
      top: 50%; /*偏移*/
    }
  }
  .menu-boxin {
    cursor: pointer;
    padding-top: 20px;
    position: absolute;
    top: 60px;
    left: 0;
    width: 15px;
    height: calc(100vh - 60px);
    background: linear-gradient(to right, #bdd9f7, #f2f6fc);
    border-top: 1px solid #eee;
    border-right: 1px solid #eee;
    .menu-boxin-content {
      position: relative; /*脱离文档流*/
      top: 50%; /*偏移*/
    }
  }
  .frist-box {
    min-height: 60px;
    width: 100%;
  }
  .big-logo-box {
    margin: 0 10px;
    width: 140px;
    height: 60px;
    font-size: 20px;
    line-height: 60px;
    text-align: center;
    color: #0c87d6;
  }
  .big-logo {
    height: 100%;
    width: 100%;
  }
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
      // font-weight: bold;
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
      margin-right: 10px;
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
    right: 30px;
    top: 40px;
    padding: 12px;
    z-index: 20201231;
    .setting-list-content {
      background: rgb(85, 158, 212);
      padding: 0 20px;
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
    backdrop-filter: blur(7px) brightness(100%);
    top: 65px;
    left: 0;
    z-index: 999;
    width: 100%;
    display: flex;
    border-top: none !important;
    box-shadow: 0 4px 10px 0 rgb(3 136 238 / 38%);
    background-image: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.7) 97%,
      rgba(219, 233, 252, 0.8)
    );
  }
  .tree-list {
    &-back {
      z-index: 1000;
    }
    &-content {
      // backdrop-filter: blur(8px);
      // background: hsla(0, 0%, 100%, 0.6);
      width: 200px;
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
    background: #fff;
    width: 30px;
    height: 30px;
    // background: url(../style/images/logo.png) 0 0;
    // background-size: 100% 100%;
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
