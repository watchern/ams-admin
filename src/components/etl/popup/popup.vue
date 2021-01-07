<template>
  <div class="popup-model">
    <div class="top-p">
      <span>{{ nameText }}</span>
    </div>
    <div class="content-p">
      <slot name="content" />
    </div>
    <div class="bottom-p">
      <x-button
        type="text"
        :disabled="disabled"
        @click="close()"
      > 退出 </x-button>
      <x-button
        type="primary"
        class="btnclass"
        :loading="spinnerLoading"
        :disabled="disabled || apDisabled"
        @click="ok()"
      >{{ spinnerLoading ? 'Loading...' : okText }} </x-button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Popup',
  components: {},
  props: {
    nameText: {
      type: String,
      default: `创建`
    },
    okText: {
      type: String,
      default: `确定`
    },
    disabled: {
      type: Boolean,
      default: false
    },
    asynLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      spinnerLoading: false,
      apDisabled: false
    }
  },
  methods: {
    close() {
      this.$emit('close')
      this.$modal.destroy()
    },
    ok() {
      if (this.asynLoading) {
        this.spinnerLoading = true
        this.$emit('ok', () => {
          this.spinnerLoading = false
        })
      } else {
        this.$emit('ok')
      }
    }
  }
}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
.btnclass ,.btnclass:hover{
  background: #353a43;
  border-color: hsl(219, 12%, 24%);
  font-weight: bold;
  color: #c8ff8c;
  margin-right: 10px;
}
.ans-btn-text:hover {
	color: #252d39;
}
.popup-model {
  background: #fff;
  border-radius: 3px;

  .top-p {
    height: 70px;
    line-height: 70px;
    border-radius: 3px 3px 0 0;
    padding: 0 20px;
    > span {
      font-size: 20px;
    }
  }
  .bottom-p {
    text-align: right;
    height: 72px;
    line-height: 72px;
    border-radius: 0 0 3px 3px;
    padding: 0 20px;
  }
  .content-p {
    min-width: 520px;
    min-height: 100px;
  }
}
</style>
