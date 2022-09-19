<template>
  <div class="home flex a-start flex-column j-start w100">
    <div class="home-top flex-shrink w100">
      <LeftMenu />
    </div>
    <div class="home-right flex1 flex a-start j-start flex-column">
      <div class="home-right-content flex1 w100 skin-home-rc">
        <!-- <keep-alive> -->
        <router-view />
        <!-- </keep-alive> -->
        <!-- <el-tooltip content="系统帮助" placement="top" effect="light">
          <i class="el-icon-question seat" @click="getHelp()" style="color:rgb(90,195,235)"></i>
        </el-tooltip> -->
      </div>
      <div class="home-right-footer flex-shrink w100">
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
import LeftMenu from './views/left-menu'
import RightFooter from './views/right-footer'
import { getHelpByMenuPath } from '@/api/base/helpdocument'
export default {
  components: {
    LeftMenu,
    RightFooter
  },
  data () {
    return {
      showHelpHeight: false,
      loading: false
    }
  },
  computed: {
    isShowRightFooter() {
      // const result = this.$route.meta && this.$route.meta.isShowRightFooter
      // return result || false
      if (this.$store.state.aceState.rightFooterTags.length > 0) {
        return true
      } else {
        return false
      }
    },
    documentClientHeight: {
      get () { return this.$store.state.app.documentHeight },
      set (val) { this.$store.dispatch('app/setDocumentHeight', val) }
    },
  },
  created() {
    if (sessionStorage.getItem('store')) {
      this.$store.replaceState(Object.assign({}, this.$store.state, JSON.parse(sessionStorage.getItem('store'))))
    }
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('store', JSON.stringify(this.$store.state))
    })
  },
  // 底部标签默认显示首页
  activated () {
    this.$store.commit('aceState/setRightFooterTags', {
      type: 'active',
      val: {
        name: '首页',
        path: '/ams/first'
      }
    })

  },
  mounted() {
    this.resetDocumentClientHeight();
  },
  methods: {
    // 重置窗口可视高度
    resetDocumentClientHeight () {
      this.documentClientHeight = document.documentElement['clientHeight']
      window.addEventListener('resize', () => {
        this.documentClientHeight = document.documentElement['clientHeight'];
      }, true);
    },
    getHelp () {
      let saveData = []
      saveData.push({
        menuPath: this.$route.fullPath
      })
      this.loading = true
      this.showHelpHeight = true
      getHelpByMenuPath(saveData[0]).then(resp => {
        if(resp.code === 0 && resp.data !== null){
          if (resp.data.helpDocument !== '') {
            document.getElementById('readonlyChild').innerHTML = resp.data.helpDocument
          } else {
            document.getElementById('readonlyChild').innerHTML = '<p>暂无新手引导</p>'
          }
          this.loading = false
        } else if (resp.code === 0 && resp.data === null){
          document.getElementById('readonlyChild').innerHTML = '<p>暂无新手引导</p>'
          this.loading = false
        }
      })
    },
  }
}
</script>

<style lang="scss" scoped >
.home{
  height: 100vh;
  background: #fff url('style/images/bg.png') no-repeat left center fixed;
  background-size: 100% 100%;
  background-image: linear-gradient(to right, #fefeff , #eaf3fa, #dbeaf6, #d5e5f4);
  &-left{
    height: 100vh;
  }
  &-right{
    height: calc(100vh - 62px);
    &-content{
      height: calc(100% - 95px);
    }
    &-footer{
      height: 60px;
    }
  }
  .homezz{
    height: 100% !important;
  }
}
.home-top{
  //z-index:20201111;
  z-index: 1999;
  height: 70px;
}
.home-right{
  /*background: #eaeaea url('style/images/bg.png') no-repeat left center fixed;*/
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  width: 100vw;
  min-height: calc(100% - 75px);
  height: calc(100% - 75px);
  display: flex;
  flex-direction: column;
}
.home-right-content{
  overflow-y: auto;
  overflow-x: hidden;
  flex:1;
  height: unset !important;
  // overflow: auto;
  // height: 100%;
  width: 100%;
  // border-radius: 30px;
  // margin: 16px 10px; /* 首页改版时修改 */
  background: #ffffff;
  background-image: linear-gradient(to right, #fefeff , #eaf3fa, #dbeaf6, #d5e5f4);
  box-sizing: border-box;
  padding-top: 20px;
}
.seat{
  position: absolute;
  right: 4px;
  bottom: 4px;
  font-size: 24px;
  background: #fff;
  border-radius: 100%;
  cursor: pointer;
}
.readonlyTo{
  width: 100%;
  height: 100%;
  top: 0;
  right: 0;
  position: fixed;
  z-index: 10001;
  animation: whiteIn 0.8s forwards;
}
.readonlyChild{
  position: absolute;
  top: 0;
  right:0;
  width: 50vw;
  height: 100%;
  background-color: #fff;
  padding: 15px;
  animation: whiteIn 0.8s forwards;
  overflow: auto;
  z-index: 100;
}
@keyframes whiteIn {
  0%{width:0}
  100%{width:50vw}
}
.readonlyClose{
  position: fixed;
  top: 0;
  right: 0;
  width: 100vw;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
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
