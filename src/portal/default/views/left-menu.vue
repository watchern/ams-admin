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
              v-for="(item,index) in applications"
              ref="navDom"
              :key="index"
              class="box"
              :class="[currentIndex===index && 'box-active']"
              @mouseenter="selectMenu(item,index)"
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
        <span class="label-wang" @mouseover="isShowSettingList=true">{{ userInfo.name }}</span>
        <i class="el-icon-s-unfold unfold-icon" @click="isShrink=false" />
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
              v-for="(item,index) in applications"
              ref="navDom"
              :key="index"
              class="box flex a-center j-center flex-column"
              :class="[currentIndex===index && 'box-active']"
              @mouseenter="selectMenu(item,index)"
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
      <div class="bottom-open flex a-center j-end flex-column">
        <div class="search-box flex a-center j-start flex-row">
          <i class="el-icon-search" />
          <span>Search</span>
        </div>
        <div
          class="label-open flex a-center j-start flex-row"
          @click="isShowToolsList=!isShowToolsList"
        >
          <i class="el-icon-s-grid" />
          <span>More tools</span>
        </div>
        <div class="footer-btns flex a-center j-between flex-row">
          <span class="label-wang" @mouseover="isShowSettingList=true">{{ userInfo.name }}</span>
          <i class="el-icon-s-unfold unfold-icon text-white" />
        </div>
      </div>
    </template>
    <div v-if="isShowTreeList" class="tree-list absolute">
      <div class="tree-list-title">
        <i class="el-icon-platform-eleme" />
        审计作业
      </div>
      <div class="tree-list-content">
        <menu-tree :list="currentMenuGroup" @closetree="isShowTreeList=false;isShrink=true" />
      </div>
    </div>
    <div v-if="isShowSettingList" class="setting-list absolute" @mouseover="isShowSettingList=true" @mouseleave="isShowSettingList=false">
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
    <div v-if="isShowToolsList" class="tools-list" :style="{left:isShrink?'64px':'120px'}">
      <tools-template />
    </div>
  </div>
</template>

<script>
import { getUserRes } from '@/api/user'
import MenuTree from './menu-tree/index.vue'

export default {
  components: { MenuTree },
  data() {
    return {
      userInfo: {
        name: this.$store.getters.name
      },
      currentIndex: -1,
      isShowTreeList: false,
      scrollTop: false,
      isShowSettingList: false,
      isShowToolsList: false,
      isShrink: false,
      menugroup: {},
      settingList: [
        {
          icon: '',
          name: '提醒事项',
          count: 20
        },
        {
          icon: '',
          name: '后台跑批',
          count: 15
        },
        {
          icon: '',
          name: '退出登陆',
          method: this.logout
        }
      ],
      applications: []
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
    }
    // isShowTreeList(){
    //   return this.$store.state.aceState.isShowTreeList
    // }
  },
  watch: {
    isShrink: {
      handler: function(newVal, oldVal) {
        console.log('newVal', newVal)
        this.$store.commit('aceState/setLeftMenuShrink', newVal)
      },
      immediate: true
    },
    currentIndex() {
      this.currentIndexChange()
    }
  },
  mounted() {
    getUserRes()
      .then(response => {
        console.log(response)
        response.data.application.forEach(app => {
          // 设置左侧应用栏数据
          this.applications.push({
            img: require('../style/images/icon1.png'),
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
              path: menu.routepath
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
        })
      })
      .catch(error => {
        console.error(error)
      })
  },

  methods: {
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
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
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
        max-height: 320px;
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
      > i {
        font-size: 16px;
        margin-right: 2px;
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
  }
  .setting-list {
    bottom: 6px;
    width: 153px;
    background: #2a2e37;
    box-shadow: 0 40px 80px 0 rgba(0, 0, 0, 0.25);
    border-radius: 8px;
    right: -153px;
    padding: 12px;
    z-index: 20201231;
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
      color: #d70010;
      letter-spacing: 0.88px;
      line-height: 40px;
      height: 40px;
      padding: 0 10px;
      border-bottom: 1px solid #363a43;
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
  }
  .bottom {
    font-size: 20px;
    color: white;
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
    }
    .label-open {
      background: #aab5c8;
    }
    .label-search {
      border: 1px solid #585e65;
      margin-bottom: 12px;
    }
  }
}
</style>
