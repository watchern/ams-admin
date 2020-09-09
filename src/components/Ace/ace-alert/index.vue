<template>
  <div v-if="isShow" class="alert" :class="[JSON.stringify(styleClass) === '{}' && 'flex a-center j-center']">
    <div
      ref="contentDom"
      class="content flex a-center j-start flex-row"
      :style="{background:styleBg}"
      :class="[JSON.stringify(styleClass) !== '{}' && 'absolute']"
    >
      <img :src="imgUrl" class="img">
      <div class="name flex1">{{ msg }}</div>
      <div class="close flex a-center j-center" @click="close">
        <img src="./提示-关闭@2x.png" class="close-img">
      </div>
    </div>
  </div>
</template>

<script>
/**
 *  props参数：msg：提示文本内容
 *            type：文本类型，包括success,info,error,warning四种
 *            styleClass：提示框位置，不传递，默认时窗口据中，自定义时是style对象，相对于窗口的absolute位置
 */
export default {
  props: {
    msg: {
      type: String,
      default: '提示'
    },
    type: {
      type: String,
      default: 'info'
    },
    styleClass: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      isShow: true,
      infoUrl: require('./提示icon3@2x.png'),
      successUrl: require('./提示icon4@2x.png'),
      warningUrl: require('./提示icon1@2x.png'),
      errorUrl: require('./提示icon2@2x.png'),
      styleBg: ''
    }
  },
  computed: {
    imgUrl() {
      switch (this.type) {
        case 'info':
          this.styleBg = '#EFF9F9'
          return this.infoUrl
          break
        case 'success':
          this.styleBg = '#F0F7EE'
          return this.successUrl
          break
        case 'warning':
          this.styleBg = '#FDF7E5'
          return this.warningUrl
          break
        case 'error':
          this.styleBg = '#FCF4F1'
          return this.errorUrl
          break
        default:
          this.styleBg = '#EFF9F9'
          return this.infoUrl
          break
      }
    }
  },
  methods: {
    show() {
      this.isShow = true
    },
    close() {
      this.isShow = false
      this.remove()
    }
  }
}
</script>

<style lang="scss" scoped>
.alert {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  .content {
    background: #e0f5f5;
    border-radius: 6px;
    max-width: 460px;
    height: 44px;
    padding: 0 12px;
    .close {
      width: 24px;
      height: 24px;
      margin-left: 30px;
      .close-img {
        width: 12px;
        height: 12px;
      }
    }
    .img {
      width: 28px;
      height: 28px;
      margin-right: 12px;
    }
    .name {
      font-family: Helvetica;
      font-size: 15px;
      color: #212b36;
      letter-spacing: 0;
      line-height: 20px;
    }
  }
}
</style>
