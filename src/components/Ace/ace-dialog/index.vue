<template>
  <div v-if="isShow" class="dialog flex a-center j-center">
    <div class="content">
      <div class="title flex a-center j-between flex-row">
        <span class="text">{{ title }}</span>
        <img src="./提示-关闭@2x.png" class="img-icon" @click="close">
      </div>
      <div class="main">
        <slot />
      </div>
      <div class="footer flex a-center j-end flex-row">
        <div class="btn-cancel btn" @click="close">{{ cancelName }}</div>
        <div class="btn-sure btn" @click="sure">{{ sureName }}</div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * props参数：title:对话框标题
 *           sureName：确定按钮名称
 *           cancelName：取消按钮名称
 *           isShow：是否显示
 * 事件方法：sure：向外抛出事件
 */
export default {
  props: {
    title: {
      type: String,
      default: '提示'
    },
    sureName: {
      type: String,
      default: '删除'
    },
    cancelName: {
      type: String,
      default: '取消'
    },
    isShow: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    sure() {
      this.$emit('sure')
    },
    close() {
      this.$emit('update:isShow', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  .content {
    width: 460px;
    background: #ffffff;
    box-shadow: 0 9px 9px 0 rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    padding: 24px;
    min-height: 187px;
    position: relative;
    border-top: 1px solid #EEEEEE;
    .title {
      font-family: PingFangSC-Regular;
      font-size: 20px;
      color: #102033;
      line-height: 24px;
      margin-bottom: 16px;
      .img-icon {
        width: 17px;
        height: 17px;
        &:hover {
          opacity: 0.6;
        }
      }
    }
    .main {
      font-family: PingFangSC-Regular;
      font-size: 14px;
      color: #172b4d;
      text-align: left;
      line-height: 20px;
    }
    .footer {
      position: absolute;
      bottom: 20px;
      right: 24px;
      font-family: PingFangSC-Semibold;
      font-size: 14px;
      color: #c8ff8c;
      line-height: 14px;
      margin-left: 20px;
    }
    .btn {
      padding: 11px 30px;
      border-radius: 8px;
      cursor: pointer;
      &-cancel {
        color: #353a43;
      }
      &-sure {
        background: #353a43;
      }
    }
  }
}
</style>
