<template>
  <div class="home flex a-start flex-row j-start h100">
    <div class="home-left flex-shrink h100">
      <LeftMenu />
    </div>
    <div class="home-right flex1 h100 flex a-start j-start flex-column">
      <div class="home-right-content flex1 w100">
        <router-view />
        <i class="el-icon-question seat" @click="getHelp()"></i>
      </div>
      <div v-if="isShowRightFooter" class="home-right-footer flex-shrink w100">
        <RightFooter />
      </div>
    </div>
    <div class="readonlyTo" v-if="showHelpHeight">
      <div @click="showHelpHeight = false" class="readonlyToX">X</div>
      <div class="readonlyChild" id="readonlyChild"></div>
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
      showHelpHeight: false
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
    }
  },
  created() {
    if (sessionStorage.getItem('store')) {
      this.$store.replaceState(Object.assign({}, this.$store.state, JSON.parse(sessionStorage.getItem('store'))))
    }
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('store', JSON.stringify(this.$store.state))
    })
  },
  methods: {
    getHelp () {
      let saveData = []
      saveData.push({
        menuPath: this.$route.fullPath
      })
      getHelpByMenuPath(saveData[0]).then(resp => {
        if(resp.code === 0 && resp.data !== null){
          document.getElementById('readonlyChild').innerHTML = resp.data.helpDocument
        } else if (resp.code === 0 && resp.data === null){
          document.getElementById('readonlyChild').innerHTML = '<p>暂无新手引导</p>'
        }
      })
      this.showHelpHeight = !this.showHelpHeight
    },
  }
}
</script>

<style lang="scss" scoped >
.home{
  height: 98vh;
  background: #fff url('style/images/bg.png') no-repeat left center fixed;
  background-size: 82%;
  background-position-x: -130px;
  background-position-y: 2px;
  &-left{
    height: 100vh;
  }
  &-right{
    height: 100vh;
    &-content{
      height: calc(100% - 30px);
    }
    &-footer{
      height: 30px;
    }
  }
}
.home-left{
  //z-index:20201111;
  z-index: 1999
}
.home-right{
  background: #eaeaea url('style/images/bg.png') no-repeat left center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
}
.home-right-content{
  overflow: hidden;
  width: calc(100% - 24px);
  height: calc(100% - 32px);
  border-radius: 30px;
  -webkit-box-shadow: 3px 0 17px 0 rgba(0,0,0,.1);
  box-shadow: 3px 0 17px 0 rgba(0,0,0,.1);
  margin: 16px 10px;
  background: #ffffff;
}
.seat{
  position: fixed;
  right: 2vw;
  bottom: 6vh;
  font-size: 24px;
  cursor: pointer;
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
  z-index: 1000;
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
