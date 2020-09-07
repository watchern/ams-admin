<template>
  <div class="left-menu relative flex a-center j-between flex-column">
    <div class="top flex a-center j-between flex-column">
        <img
          src="../../../assets/Ace/image/logo.png"
          class="logo"
        >
      <div class="menu flex a-center j-between flex-column">
        <i
          class="el-icon-arrow-up text-white icon"
          @click="action('prev')"
          :class="[currentIndex===0 && 'icon-disable']"
        />
        <div class="list flex a-center j-between flex-column">
          <div
            class="box"
            v-for="(item,index) in menuList"
            :key="index"
            @click="select(item,index)"
            :class="[currentIndex===index && 'box-active']"
          >
            <div
              class="img"
              :style="[getStyle(item.img)]"
            />
          </div>
        </div>
        <i
          class="el-icon-arrow-down text-white icon"
          @click="action('next')"
          :class="[currentIndex===menuList.length-1 && 'icon-disable']"
        />
      </div>
    </div>
    <div class="bottom">
      <i class="el-icon-s-unfold"></i>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      currentIndex: 0,
      menuList: [
        {
          img: require('../../../assets/Ace/image/icon1@2x.png'),
          path:"/ace/main"
        }, {
          img: require('../../../assets/Ace/image/icon2@2x.png'),
          path:"/nav"
        }, {
          img: require('../../../assets/Ace/image/icon3@2x.png'),
          path:"/"
        }, {
          img: require('../../../assets/Ace/image/icon4@2x.png'),
          path:"/"
        }, {
          img: require('../../../assets/Ace/image/icon52@2x.png'),
          path:"/"
        }
      ]
    }
  },
  methods: {
    getStyle (img) {
      return {
        background: `url(${img}) no-repeat center center`,
        'background-size': '100% 100%'
      }
    },
    select (item, index) {
      if (this.currentIndex === index) return
      this.currentIndex = index
      this.$router.push({
        path:item.path
      })
    },
    action (type) {
      if (type === 'prev') {
        this.currentIndex = this.currentIndex === 0 ? 0 : this.currentIndex - 1
      } else if (type === 'next') {
        this.currentIndex = this.currentIndex === this.menuList.length - 1 ? this.menuList.length - 1 : this.currentIndex + 1
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.left-menu{
  width: 64px;
  background: #353A43;
  box-shadow: -5px 0 20px 0 rgba(17,35,56,0.48);
  height: 100%;
  padding: 20px 0;
  .top{
    margin-top: 0;
    .logo{
      width: 30px;
      height: 30px;
      margin-bottom: 20px;
    }
    .menu{
      .icon{
       font-size: 20px;
       &:active{
         opacity: 0.6;
       }
       &-disable{
         cursor: not-allowed;
         color: grey;
       }
      }
      .list{
        margin: 15px 0 15px 0;
        .box{
          padding: 4px;
          &:not(:last-child){
            margin-bottom: 20px;
          }
          cursor: pointer;
          &-active{
            background: #D70010;
            border-radius: 4px;
          }
          .img{
            width: 31px;
            height: 31px;
            outline: none;
          }
        }
      }
    }
  }
  .bottom{
    font-size: 20px;
    color: white;
  }
}
</style>
