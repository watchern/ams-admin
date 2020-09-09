<template>
  <div class="right-footer h100">
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
        <span class="close" @click.stop.prevent="close(item)">x</span>
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
  </div>
</template>

<script>
export default {
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
      ]
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
    //   type: "active",
    //   val: {
    //     name: "首页",
    //     path:'/ace/first'
    //   }
    // });
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
    }
  }
}
</script>

<style lang="scss" scoped>
.right-footer {
  background: #353a43;
  overflow: hidden;
  padding-right: 30px;
  max-width: calc(100vw - 64px);
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
    font-family: PingFangSC-Regular;
    font-size: 10px;
    color: #ffffff;
    letter-spacing: 0.3px;
    height: 24px;
    cursor: pointer;
    padding: 0 10px;
    border-right: 1px solid #4b5058;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &-active {
      background: #594545;
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
    position: fixed;
    background: #fff;
    border-radius: 4px;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    color: #333;
    font-size: 12px;
    font-weight: 400;
    list-style-type: none;
    margin: 0;
    padding: 5px 0;
    position: absolute;
    z-index: 100;
    width: 80px;
    height: 118px;
    .li {
      height: 27px;
      line-height: 27px;
      cursor: pointer;
      padding-left: 16px;
      &:hover {
        background: #cccccc;
      }
    }
  }
}
</style>
