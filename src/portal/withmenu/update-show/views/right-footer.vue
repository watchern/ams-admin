<template>
<div class="right-footer flex">
  <div class="kjcz-left">
     <div class="shortcut-operation tag" >
        <el-popover
          v-model="popoverVisible"
          popper-class="popover-option"
          placement="top"
          width="430"
          trigger="click">
          <div class="common-functions">
            <el-card class="box-card func-card card-style">
              <p class="title">
                <span class="name">常用功能</span>
                <span class="more" @click="popoverVisible = false,isShowKjcz = false"><img class="close-icon" src="../../../../assets/img/close-icon.png" alt=""></span>
              </p>
              <toolsTemplateAdd ref="toolsTemplateAdd"></toolsTemplateAdd>
            </el-card>
          </div>
          <div class="kjcz-bj" @click="toggleKjcz" slot="reference">
            <div class="kjcz-shadow">
              <p>
                <i v-if="isShowKjcz" class="el-icon-arrow-down"></i>
                <i v-else class="el-icon-arrow-up"></i>
              </p>
            </div>
          </div>
        </el-popover>
        <p class="kjcz-text">快捷操作</p>
      </div>
  </div>
  <div class="kjcz-right flex a-center j-between  h100">
    <div class="h100 flex a-center j-start flex-row">
      <div
        v-for="(item,index) in tagList"
        :key="index"
        ref="tagDom"
        class="tag flex a-center j-center flex-row animated slideInLeft"
        :class="[item.isActive && 'tag-active']"
        @click="select(item)"
        @contextmenu.prevent="contextmenu(item,$event,index)"
      >
        <span class="name">{{ item.name }}</span>
        <span class="close" @click.stop.prevent="close(item)" v-if="item.name != '首页'">x</span>
      </div>
      <div v-if="isShowPopover" class="popover" :style="computedStyle">
        <div
          v-for="(item,index) in popoverList"
          :key="index"
          class="li"
          @click="sure(item)"
        >{{ item.name }}</div>
      </div>
    </div>
    <div class="footer-system-name">
      <span>中软国际</span>
      <span>Corporation版权所有</span>
    </div>
  </div>
</div>
</template>

<script>
import toolsTemplateAdd from "@/components/public/base/tools-template-add.vue"
export default {
  components: {
    toolsTemplateAdd
  },
  data() {
    return {
      isShowPopover: false,
      popoverLeft: 0,
      popoverTop: 0,
      selectItem: null,
      popoverList: [
        {
          name: '刷新',
          prop: 'reset'
        },
        {
          name: '关闭',
          prop: 'close'
        },
        {
          name: '关闭其他',
          prop: 'closeOther'
        },
        {
          name: '关闭所有',
          prop: 'closeAll'
        }
      ],
      isShowKjcz: false, // 是否展开快捷操作
      popoverVisible: false, // 常用功能显影状态
    }
  },
  computed: {
    computedStyle() {
      return {
        left: `${this.popoverLeft}px`,
        top: `${this.popoverTop - 118}px`
      }
    },
    tagList() {
      return this.$store.state.aceState.rightFooterTags
    }
  },
  mounted() {
    // this.activeTags({
    //   type: 'active',
    //   val: {
    //     name: '首页',
    //     path: '/ams/first'
    //   }
    // })
    window.addEventListener("click", this.clickOther)
    },
  methods: {
    close(item) {
      this.selectItem = item
      this.sure({
        prop: 'close'
      })
    },
    select(item) {
      this.activeTags({
        type: 'active',
        val: item
      })
    },
    activeTags(item) {
      //2021.6.4 太仓需求sql编辑页保留编辑内容
      // if(item.val.path=='/analysis/sqleditor' && item.type == 'active'){
      //   item.type = 'reset'
      // }
      this.$store.commit('aceState/setRightFooterTags', {
        type: item.type,
        val: item.val
      })
    },
    contextmenu(item, e, index) {
      this.selectItem = item
      this.isShowPopover = true
      this.popoverLeft = e.clientX
      this.popoverTop = e.clientY
    },
    sure(item) {
      this.isShowPopover = false
      this.activeTags({
        type: item.prop,
        val: this.selectItem
      })
    },
    clickOther: function () {
      this.isShowPopover = false
    },
    toggleKjcz () {
      this.isShowKjcz = !this.isShowKjcz
    }
  },
  watch:{
    // 监听url到first页面时关闭下方页签
    $route(to,from){
      if (to.name === "amsFirst") {
        this.$store.commit('aceState/setRightFooterTags', {
          type: 'closeOther',
          val: {
            name: '首页',
            path: '/ams/first'
          }
        })
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.right-footer {
  position: relative;
  
  // background:url('../../../../assets/img/kjcz.png');
  overflow: hidden;
  width: 100vw;
  height: 60px;
  align-items: flex-end;
  background: transparent;
  .kjcz-left {
    width: 119px;
    // background:url('../../../../assets/img/kjcz.png');
    // background: rgb(85,158,212);
  }
  .shortcut-operation {
    // width: 70px;
    // line-height: 35px;
    // margin-left: 25px;
    // background: #529ED4;
    // border: 1px solid rgba(82,158,212,1);
    // box-shadow: 7px 5px 12px 0px rgba(0,0,0,0.16),-2px -3px 9px 0px rgba(255,255,255,0.29);
    height: 60px !important;
    display: flex;
    flex-direction: column;
    padding: 0 !important;
    border: none !important;
    position: relative;
    >span {
      display: inline-block;
      flex: 1;
      background:url('../../../../assets/img/kjcz.png');
      display: flex;
      justify-content: center;
    }
    
    .kjcz-text {
      height: 28px;
      background: rgb(85,158,212);
      text-align: center;
      // padding-top: 3px;
      font-size: 10px;
      line-height: 28px;
    }
    .popover-option {
      // display: inline-block;
      // flex: 1;
      // background:url('../../../../assets/img/kjcz.png');
      // display: flex;
      // justify-content: center;
    }
    .kjcz-bj {
      flex: 1;
      // background:url('../../../../assets/img/kjcz.png');
      display: flex;
      justify-content: center;
      .kjcz-shadow {
        position: absolute;
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
      }
      p {
        height: 23px;
        width: 23px;
        border-radius: 100%;
        background: #529ED4;
        border: 1px solid rgba(82,158,212,1);
        box-shadow: 7px 5px 12px 0px rgba(0,0,0,0.16),-2px -3px 9px 0px rgba(255,255,255,0.29);
        text-align: center;
        line-height: 23px;
        margin: 5px 0 0 4px;
      }
    }
  }
  .kjcz-right {
    height: 35px;
    background: rgb(85,158,212);
    flex: 1;
  }
  .animat-enter-active,
  .animat-leave-active {
    transition: all 1s;
  }
  .list-enter,
  .list-leave-to {
    width: 0;
    height: 0;
  }
  .tag { 
    height: 35px;
    cursor: pointer;
    padding: 0 10px;
    border-right: 1px solid rgba(143,207,252,1);
    // border: 1px solid rgba(143,207,252,1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: PingFangHK-Semibold;
    font-size: 12px;
    color: #FFFFFF;
    letter-spacing: 0.26px;
    text-align: right;
    line-height: 14px;
    font-weight: 600;
    &-active {
      background: rgb(95,190,235);
    }
    .name {
      display: inline-block;
      margin-right: 6px;
    }
    .close{
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      text-align: center;
      line-height: 9px;
      font-size: 8px;
      position: relative;
      top: 1px;
      color: #FFFFFF;
      font-weight: 600;
      font-size: 12px;
      opacity: unset;
      &:hover{
        background: white;
        color: #000000;
      }
      &:active{
        background: white;
        color: #000000;
      }
    }

  }
  .popover {
    position: fixed !important;
    background: #fff;
    list-style-type: none;
    display: inline-block;
    z-index: 9999;
    width: 100px;
    background: #E3EDF7;
    border: none;
    border-radius: 6px !important;
    box-shadow: -7px -5px 25px 2px rgba(255,255,255,1),7px 5px 25px 2px rgba(211,224,236,1);
    .li {
      cursor: pointer;
      padding-left: 16px;
      line-height: 32px;
      height: 32px;
      font-family: PingFangHK-Regular;
      font-size: 10px;
      color: #31456A;
      letter-spacing: 0.21px;
      font-weight: 400;
      width: 100%;
      &:hover {
        box-shadow: 0px -5px 15px 0px rgba(255,255,255,1),0px 5px 15px 0px rgba(255,255,255,1),0px 0px 0px 0px rgba(255,255,255,1),0px 0px 0px 0px rgba(255,255,255,1);
        transform:translate3d(0, 0, 0);
        z-index:100;
      }
    }
  }
 
  .footer-system-name {
    margin-right: 26px;
    font-family: PingFangSC-Medium;
    font-size: 12px;
    color: #FFFFFF;
    letter-spacing: 0.26px;
    // text-align: right;
    font-weight: 500;
    span {
      margin-left: 18px;
    }
  }
}
.popover-option {
  width: 100%;
  height: 100%;
  padding: 0 !important;
  .common-functions {
    width: 430px;
    // min-height: 250px;
    // height: 100;
    box-shadow: -7px -5px 15px 0px rgba(255,255,255,1),7px 5px 14px 0px rgba(211,224,236,1);
    border-radius: 12px;
    transition: all .5s ease;
    .title {
      width: 100%;
      display: flex;
      justify-content: space-between;
      // padding: 20px 25px;
      height: 68px;
      align-items: center;
      .name {
        font-family: PingFang-SC-Bold;
        font-size: 16px;
        color: #31456A;
        letter-spacing: 0.34px;
        text-align: right;
        // line-height: 14px;
        font-weight: 700;
        padding-left: 20px;
      }
      .more { 
        // margin-right: 10px;
        cursor: pointer;
      }
      .close-icon {
        width: 58px;
        height: 54px;
        margin-right: 10px;
      }
    }
    
    .card-style {
      width: 100%;
      height: 100%;
      border-radius: 10px;
      box-shadow: -7px -5px 15px 0px rgba(255,255,255,1),7px 5px 14px 0px rgba(211,224,236,1);
      border: none;
      ::v-deep .el-card__body {
        width: 100%;
        height: 100%;
        background: #E3EDF7;
        padding: 0;
      }
    }
        

  }

}
</style>
