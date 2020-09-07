<template>
  <div class="home flex a-start flex-row j-start h100">
    <div class="home-left flex-shrink h100">
      <LeftMenu></LeftMenu>
    </div>
    <div class="home-right flex1 h100 flex a-start j-start flex-column">
      <div class="home-right-content flex1 w100">
        <router-view></router-view>
      </div>
      <div class="home-right-footer flex-shrink w100">
        <RightFooter></RightFooter>
      </div>
    </div>
  </div>
</template>

<script>
import LeftMenu from "@/components/Ace/base/left-menu.vue"
import RightFooter from "@/components/Ace/base/right-footer.vue"
export default {
  components:{
    LeftMenu,
    RightFooter
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
</style>
