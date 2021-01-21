<template>
  <div
    class="left-menu relative flex a-center j-between flex-column"
    :style="{width:leftWidth+'px'}"
    @mouseleave="menuLeave();"
  >
    <template v-if="isShrink">
      <div class="top flex a-center j-between flex-column">
        <img src="../style/images/logo.png" class="logo">
        <div class="menu flex a-center j-between flex-column">
          <i
            class="el-icon-arrow-up text-white icon"
            :class="[currentIndex===0 && 'icon-disable']"
            @click="action('prev')"
          />
          <div
            ref="domTopList"
            v-scroll-top="scrollTop"
            class="list flex a-center j-between flex-column"
          >
            <div
              ref="navDom"
              class="box"
              @click="selectMenuIn()"
            >
              <img class="img" :src="workbenchImg" />
            </div>
            <div
              v-for="(item,index) in applications"
              ref="navDom"
              :key="index"
              class="box"
              :class="[currentIndex===index && 'box-active']"
              @click="selectMenu(item,index)"
            >
              <div class="img" :style="[getStyle(item.img)]" />
            </div>
          </div>
          <i
            class="el-icon-arrow-down text-white icon"
            :class="[currentIndex===applications.length-1 && 'icon-disable']"
            @click="action('next')"
          />
        </div>
      </div>
      <div class="bottom flex a-center j-end flex-column">
        <span class="label-search" @click="isShowToolsList=!isShowToolsList">
          <i class="el-icon-search" />
        </span>
        <span class="label-open" @click="isShowToolsList=!isShowToolsList">
          <i class="el-icon-s-grid" />
        </span>
        <span class="label-wang" @click="isShowSettingList=!isShowSettingList" >{{ userInfo.name }}<i class="label-wang-in" v-if="isThereReminder"></i></span>
        <!-- <i class="shrink-btn icon iconfont iconright-1" @click="isShrink=false" /> -->
        <i class="setting-btn icon iconfont iconmenu-2 setting-btn-Upright"  @click="widthChange" />
      </div>
    </template>
    <template v-else>
      <div class="top-open">
        <div class="logo-wrap flex a-center j-center flex-row" style="cursor: pointer">
          <img src="../style/images/logo.png" class="logo" @click="jumpHome()">
          <img src="../style/images/title.png" class="logo-text">
        </div>
        <div class="menu flex a-center j-between flex-column">
          <i
            class="el-icon-arrow-up text-white icon"
            :class="[currentIndex===0 && 'icon-disable']"
            @click="action('prev')"
          />
          <div v-scroll-top="scrollTop" class="list flex a-center j-between flex-column">
            <div
              ref="navDom"
              class="box flex a-center j-center flex-column"
              @click="selectMenuIn()"
            >
              <img class="img" :src="workbenchImg" />
              <div class="name">工作台</div>
            </div>
            <div
              v-for="(item,index) in applications"
              ref="navDom"
              :key="index"
              class="box flex a-center j-center flex-column"
              :class="[currentIndex===index && 'box-active']"
              @click="selectMenu(item,index)"
            >
              <div class="img" :style="[getStyle(item.img)]" />
              <div class="name">{{ item.name }}</div>
            </div>
          </div>
          <i
            class="el-icon-arrow-down text-white icon"
            :class="[currentIndex===applications.length-1 && 'icon-disable']"
            @click="action('next')"
          />
        </div>
      </div>
      <span class="somehelp" @click="showHelp">?</span>
      <div class="bottom-open flex a-center j-end flex-column">
        <div class="search-box flex a-center j-start flex-row">
          <input type="text" name="search" class="search-input" placeholder="Search">
          <i class="el-icon-search" />
        </div>
        <div
          class="label-open flex a-center j-start flex-row"
          @click="isShowToolsList=!isShowToolsList"

        >
          <i class="el-icon-s-grid" />
          <span>More tools</span>
        </div>
        <div class="footer-btns flex a-center j-between flex-row">
          <!-- <i class="shrink-btn icon iconfont iconleft-1" @click="isShrink=false" /> -->
          <i class="setting-btn icon iconfont iconmenu-2 setting-btn-right" @click="widthChange" />
          <span class="label-wang"  @click="isShowSettingList=!isShowSettingList">{{ userInfo.name }}<i class="label-wang-in" v-if="isThereReminder"></i></span>
        </div>
      </div>
    </template>
    <transition name="slide-fade">
      <div v-if="isShowTreeList" class="tree-list absolute">
        <div class="tree-list-title">
          <!-- <i class="el-icon-platform-eleme" /> -->
          {{ nowAppName }}
        </div>
        <div class="tree-list-content">
          <menu-tree :list="currentMenuGroup" @closetree="isShowTreeList=false;isShrink=true" />
        </div>
      </div>
    </transition>
    <transition name="setting-fade">
      <div v-if="isShowSettingList" class="setting-list absolute" @click="isShowSettingList=!isShowSettingList" @mouseleave="isShowSettingList=false">
        <div class="setting-list-content">
          <div
            v-for="(item,index) in settingList"
            :key="index"
            class="setting-list-line flex flex-row a-center j-start"
          >
            <i class="el-icon-delete icon" />
            <div class="name-box" @click="item.method">
              <span>{{ item.name }}</span>
              <span
                v-if="item.count"
                class="count"
                :class="[index===0?'count-red':index===1?'count-green':'']"
              >{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="showAnimation">
      <div v-if="isShowToolsList" class="tools-list" :style="{left:isShrink?'64px':'120px'}">
        <tools-template @func="showWith"/>
      </div>
    </transition>
    <el-drawer
      title="我是标题"
      :visible.sync="drawer"
      modal="false"
      :with-header="false">
      <span>我来啦!</span>
    </el-drawer>
    <div class="page-left" v-if="showHelpWidth">
      <el-collapse class="tools-menu-small" v-model="activeName" accordion>
        <el-collapse-item title="审计作业" name="1">
          <el-tree
            :data="moremenugroup['402883817586fc2a017586fd9e1a0001']"
            node-key="id"
            show-checkbox
            :check-strictly="defaultProps.checkStrictly"
            @check-change="handleCheckChange"
            ref="tree"
            highlight-current
            v-if="activeName === '1'"
            :props="defaultProps">
          </el-tree>
        </el-collapse-item>
        <el-collapse-item title="审计分析" name="2">
          <el-tree
            :data="moremenugroup['4028838175880ded01758835b393006b']"
            node-key="id"
            show-checkbox
            :check-strictly="defaultProps.checkStrictly"
            @check-change="handleCheckChange"
            ref="tree"
            highlight-current
            v-if="activeName === '2'"
            :props="defaultProps">
          </el-tree>
        </el-collapse-item>
        <el-collapse-item title="审计资源" name="3">
          <el-tree
            :data="moremenugroup['4028838175880ded01758816610b001a']"
            node-key="id"
            show-checkbox
            :check-strictly="defaultProps.checkStrictly"
            @check-change="handleCheckChange"
            ref="tree"
            highlight-current
            v-if="activeName === '3'"
            :props="defaultProps">
          </el-tree>
        </el-collapse-item>
        <el-collapse-item title="系统配置" name="4">
          <el-tree
            :data="moremenugroup['4028838175880ded01758828366f0046']"
            node-key="id"
            show-checkbox
            :check-strictly="defaultProps.checkStrictly"
            @check-change="handleCheckChange"
            ref="tree"
            highlight-current
            v-if="activeName === '4'"
            :props="defaultProps">
          </el-tree>
        </el-collapse-item>
      </el-collapse>
      <el-button @click="showHelpOut">阅读</el-button>
    </div>
    <div class="readonlyTo" v-if="showHelpWidth && showHelpHeight">
      <div @click="showHelpHeight = false" class="readonlyToX">X</div>
      <div class="readonlyChild" id="readonlyChild"></div>
    </div>
  </div>
</template>

<script>
import { getUserRes } from '@/api/user'
import MenuTree from './menu-tree/index.vue'
import { cacheDict } from '@/api/base/sys-dict'
import { getUnReadRemind } from '@/api/base/base'
import { querySystemTask } from '@/api/base/systemtask'
import {getByMenuId, saveHelpDocument} from '@/api/base/helpdocument'
export default {
  components: { MenuTree },
  data() {
    return {
      userInfo: {
        name: this.$store.getters.name
      },
      currentIndex: -1,
      websocket: null,
      isShowTreeList: false,
      scrollTop: false,
      isShowSettingList: false,
      isShowToolsList: false,
      isShrink: false,
      nowAppName: '',
      menugroup: {},
      moremenugroup: [],
      defaultProps: {
        children: 'children',
        label: 'name',
        checkStrictly: true,
        disabled: this.ifFather,
      },
      // 激活菜单
      activeName: '1',
      showHelpWidth: false,
      showHelpHeight: false,
      settingList: [
        {
          icon: '',
          name: '提醒事项',
          count: 0,
          method: this.logoutRemind
        },
        // {
        //   icon: '',
        //   name: '后台跑批',
        //   count: 15,
        //   method: this.logout
        // },
        {
          icon: '',
          name: '退出登陆',
          method: this.logout
        }
      ],
      applications: [],
      workbenchImg: require('../style/images/icon0.png'),
      isThereReminder: false,
      drawer: false
    }
  },
  computed: {
    leftWidth() {
      return this.isShrink ? 64 : 120
    },
    currentMenuGroup() {
      if (this.applications.length === 0) {
        return []
      }
      const appid = this.applications[this.currentIndex].id
      return this.menugroup[appid]
    },
    getPersonUuid(){
      return this.$store.getters.personuuid;
    }
    // isShowTreeList(){
    //   return this.$store.state.aceState.isShowTreeList
    // }
  },
  watch: {
    isShrink: {
      handler: function(newVal, oldVal) {
        this.$store.commit('aceState/setLeftMenuShrink', newVal)
      },
      immediate: true
    },
    currentIndex() {
      this.currentIndexChange()
    },
    getPersonUuid(newv, oldv){
      if(newv && newv!=''){
        this.webSocket = this.getWebSocket(newv)
      }

    }
  },
  created() {
    // 页面刚进入时开启长连接
    this.init();
    if(this.getPersonUuid){
      this.webSocket = this.getWebSocket(this.getPersonUuid)
    }
  },
  mounted() {
    getUserRes()
      .then(response => {
        response.data.application.forEach((app, index) => {
          // 设置左侧应用栏数据
          this.applications.push({
            img: require(`../style/images/icon${index + 1}.png`),
            name: app.name,
            id: app.id
          })
        })
        // 设置引用栏弹出二级菜单数据
        response.data.menugroup.forEach(grp => {
          const menuList = []
          grp.menuList.forEach(menu => {
            menuList.push({
              id: menu.id,
              name: menu.name,
              path: this.getCleanSrc(menu.src)
            })
          })
          if (!this.menugroup[grp.appuuid]) {
            this.menugroup[grp.appuuid] = []
          }
          this.menugroup[grp.appuuid].push({
            id: grp.id,
            name: grp.name,
            path: grp.navurl,
            children: menuList
          })
          this.moremenugroup = this.menugroup
        })
        var sysDict = JSON.parse(sessionStorage.getItem('sysDict'))
        if (sysDict == null) {
          cacheDict().then(resp => {
            sessionStorage.setItem('sysDict', JSON.stringify(resp.data))
          })
        }
      })
      .catch(error => {
        console.error(error)
      })
    getUnReadRemind().then(resp => {
      if(resp.data <= 99 ) {
        this.settingList[0].count = resp.data
      }else{
        this.settingList[0].count = '···'
      }
      if (resp.data !== 0) {
        this.isThereReminder = true
      }
    })
  },
  methods: {
    init() {
      querySystemTask().then(resp => {
      })
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
      const wsuri = process.env.VUE_APP_BASE_WEB_SOCKET + personuuid + 'systemTask'// 连接地址，可加参数
      // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
      this.webSocket = new WebSocket(wsuri) // 建立与服务端的连接
      // 当服务端打开连接
      this.webSocket.onopen = function(event) {
      }
      // 发送消息
      this.webSocket.onmessage = function(event) {
        func1(event)
      }
      const func2 = function func3(val) {
        var dataObj = JSON.parse(val.data)
        if (dataObj.taskStatus === '2' || dataObj.taskStatus === 2) {
          let html = ''
          if (dataObj.taskUrl !== undefined && dataObj.taskUrl !== '') {
            html = '<a style="font-style: normal;color: #17e1e1;text-decoration: underline;cursor: pointer;" href="/#' + dataObj.taskUrl + '" id="messageTrack">' + dataObj.taskName + '</a>'
          } else {
            html = '<span style="font-style: normal;color: #17e1e1;text-decoration: underline;cursor: pointer;" id="messageTrack">' + dataObj.taskName + '</span>'
          }
          this.$notify({
            dangerouslyUseHTMLString: true,
            title: '已完成',
            message: html,
            type: 'success',
            duration: 15000,
            position: 'bottom-right'
          })
        }
      }
      const func1 = func2.bind(this)
      // this.webSocket.onclose = function(event) {
      // }
      // 通信失败
      this.webSocket.onerror = function(event) {
      }
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
      this.currentIndex = -1
      this.isShowTreeList = false
      this.isShowSettingList = false
    },
    getStyle(img) {
      return {
        background: `url(${img}) no-repeat center center`,
        'background-size': '100% 100%'
      }
    },
    selectMenu(app, index) {
      this.currentIndex = index
      this.isShowTreeList = true
      this.isShowSettingList = false
      this.nowAppName = app.name
    },
    action(type) {
      if (type === 'prev') {
        this.currentIndex = this.currentIndex === 0 ? 0 : this.currentIndex - 1
      } else if (type === 'next') {
        this.currentIndex =
          this.currentIndex === this.applications.length - 1
            ? this.applications.length - 1
            : this.currentIndex + 1
      }
    },
    jumpHome() {
      this.$router.push({ path: '/ams/first' })
    },
    getCleanSrc(src) {
      if (src.indexOf('&resUUID') !== -1) {
        src = src.split('&resUUID')[0]
      } else if (src.indexOf('?resUUID') !== -1) {
        src = src.split('?resUUID')[0]
      }
      return src
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
      this.selectMenuIn()
    },
    logoutRemind(){
      this.$router.push({ path:'/base/remind'})
    },
    showWith(obj){
      this.isShowToolsList = obj
    },
    widthChange(){
      this.isShrink = !this.isShrink
    },
    selectMenuIn(){
      this.$store.commit('aceState/setRightFooterTags', {
        type: 'closeAll',
        val: ''
      })
    },
    showHelp() {
      this.showHelpWidth = !this.showHelpWidth
    },
    // 父节点不可选中
    ifFather(data) {
      if (data.children) {
        return true
      }else{
        return false
      }
    },
    handleCheckChange (data, checked, indeterminate) {
      if (checked) {
        this.$refs.tree.setCheckedNodes([data]);
      }
    },
    showHelpOut () {
      let id = this.$refs.tree.getCheckedNodes()[0].id
      getByMenuId(id).then(resp => {
        if(resp.code === 0 && resp.data !== null){
          document.getElementById('readonlyChild').innerHTML = resp.data.helpDocument
        } else if (resp.code === 0 && resp.data === null){
          document.getElementById('readonlyChild').innerHTML = '<p>暂无新手引导</p>'
        }
      })
      this.showHelpHeight = !this.showHelpHeight
    }
  }
}
</script>

<style lang="scss" scoped>
.left-menu {
  width: 64px;
  background: #353a43;
  box-shadow: -5px 0 20px 0 rgba(17, 35, 56, 0.48);
  height: 100%;
  padding: 20px 0;
  -webkit-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none;
  .top-open {
    .logo {
      width: 30px;
      height: 30px;
      margin-right: 5px;
    }
    .logo-text {
      width: 62px;
      height: 24px;
    }
    .menu {
      margin-top: 10px;
      .icon {
        font-size: 26px;
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
        overflow-y: auto;
        &::-webkit-scrollbar {
          width: 0;
        }
        .box {
          width: 90px;
          height: 67px;
          padding: 5px 0;
          color: white;
          border-radius: 5px;
          cursor: pointer;
          .img {
            width: 26px;
            height: 26px;
            margin-bottom: 8px;
          }
          .name {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: #ffffff;
            letter-spacing: 0.3px;
            text-align: center;
          }
          &-active {
            background: #d70010;
            box-shadow: 0 0 13px 0 rgba(215, 0, 16, 0.57);
          }
          &:not(:first-child) {
            margin-top: 27px;
          }
        }
      }
    }
  }
  .bottom-open {
    .search-box {
      .search-input{
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
      width: 90px;
      height: 28px;
      background: #aab5c8;
      border: 0 solid rgba(168, 172, 178, 0.3);
      box-shadow: inset 0 1px 4px 0 #353a43;
      border-radius: 1.75px;
      font-family: BebasNeue;
      font-size: 8px;
      color: #525a65;
      letter-spacing: 0;
      padding-left: 4px;
      margin-bottom: 44px;
      cursor: pointer;
      i {
        font-size: 16px;
        margin-right: 2px;
      }
    }
  }
  .tools-list {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 64px;
    z-index: 1000;
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 10;
  }
  .setting-list {
    bottom: 6px;
    width: 177px;
    right: -177px;
    padding: 12px;
    z-index: 20201231;
    .setting-list-content{
      background: #2a2e37;
      padding: 20px;
      box-shadow: 0 40px 80px 0 rgba(0, 0, 0, 0.25);
      border-radius: 8px;
    }
    &-line {
      font-family: PingFangSC-Regular;
      font-size: 14px;
      color: #ececed;
      letter-spacing: 0.88px;
      line-height: 40px;
      height: 40px;
      &:hover {
        color: white;
      }
      &:not(:last-child) .name-box {
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      }
      .icon {
        color: #575a61;
      }
      .name-box {
        margin-left: 10px;
        height: 100%;
        cursor:pointer;
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
  .tree-list {
    width: 165px;
    top: 0;
    bottom: 0;
    background: #2a2e37;
    right: -165px;
    z-index: 999;
    &-title {
      font-family: PingFangSC-Regular;
      font-size: 15px;
      color: #fff;
      letter-spacing: 0.88px;
      line-height: 40px;
      height: 40px;
      padding: 0 10px;
      border-bottom: 1px solid #363a43;
      font-weight: bolder;
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
        overflow-y: auto;
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
    font-family: PingFangSC-Semibold;
    font-size: 18px;
    color: rgba(255, 255, 255, 0.8);
    display: inline-block;
    border-radius: 10px;
    border: 3px solid #552e38;
    text-align: center;
    line-height: 34px;
    background: #484f5c;
    padding: 5px;
    cursor: pointer;
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
    color:#ffffff;
    cursor:pointer;
  }
}
.shrink-btn-div-open{
  margin-right: -40px;
  background: #353a43;
  border-radius: 100%;
  padding: 0px 3px 0px 10px;
  float: right;
  height: 38px;
  line-height: 38px;
}
.shrink-btn-div-close{
  margin-right: -40px;
  background: #353a43;
  border-radius: 100%;
  padding: 0px 3px 0px 10px;
  float: right;
  height: 38px;
  line-height: 38px;
}
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.6s
}
.slide-fade-enter,.slide-fade-leave-to {
  opacity: 0;
}
.setting-btn{
  font-size: 20px;
  color:#ffffff;
  cursor:pointer;
}
.showAnimation-enter-active, .showAnimation-leave-active {
  transition: all .5s;
}
.showAnimation-enter, .showAnimation-leave-to {
  opacity: 0;
}

.setting-fade-enter-active, .setting-fade-leave-active {
  transition: all .5s;
}
.setting-fade-enter, .setting-fade-leave-to {
  opacity: 0;
}
.setting-btn-right{
  margin-left:16px;
  margin-right:15px;
}
.setting-btn-Upright{
  transform:rotate(90deg) ;
}
.label-wang-in{
  position:absolute;
  top: -5px;
  right: -5px;
  width:10px;
  height:10px;
  border-radius:100%;
  background-color:red;
}
.somehelp{
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
}
.page-left{
  position: absolute;
  top: 200px;
  right: -250px;
  width: 240px;
  height: 600px;
  background: #fff;
  padding: 5px;
  box-shadow: 0 0 10px 0 #000;
  border-radius: 10px;
  z-index:1002;
}
.tools-menu-small{
  height: 550px;
  width: 100%;
  overflow: auto;
}
.readonlyTo{
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  position: fixed;
  background-color: rgba(0,0,0,.5);
  z-index: 1001;
}
.readonlyChild{
  position: absolute;
  top: 0;
  right:0;
  width: 1438px;
  height: 100%;
  background-color: #fff;
  border: 1px solid #000;
  padding: 15px;
}
.readonlyToX{
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
</style>
