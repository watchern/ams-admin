<template>
  <div class="home flex a-start flex-row j-start h100">
    <div class="home-left flex-shrink h100">
      <LeftMenu />
    </div>
    <div class="home-right flex1 h100 flex a-start j-start flex-column">
      <div class="home-right-content flex1 w100">
        <router-view />
      </div>
      <div v-if="isShowRightFooter" class="home-right-footer flex-shrink w100">
        <RightFooter />
      </div>
    </div>
  </div>
</template>

<script>
import LeftMenu from './views/left-menu'
import RightFooter from './views/right-footer'
export default {
  components: {
    LeftMenu,
    RightFooter
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
  }
}
</script>

<style lang="scss" scoped>
.home{
  height: 100vh;
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
  z-index:1999;
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
  background: #edf1f5;
}
</style>
