<template>
  <div class="assembly">
    <div class="line">
      <h5 class="title">全局弹窗</h5>
      <button @click="alertHandle">全局弹窗</button>
    </div>
    <div class="line">
      <h5 class="title">对话框</h5>
      <button @click="isShowDialog=true">全局对话框</button>
      <ace-dialog :is-show.sync="isShowDialog">
        <span>删除后不可恢复</span>
      </ace-dialog>
    </div>
    <div class="line">
      <h5 class="title">搜索下拉框</h5>
      <ace-select :value.sync="selectVal" />
    </div>
    <div class="line">
      <h5 class="title">下拉选择日历</h5>
      <ace-select-calender :value.sync="calenderVal" :current-date="calenderVal" />
    </div>
  </div>

</template>

<script>
export default {
  data() {
    return {
      isShowDialog: false,
      selectVal: '12',
      calenderVal: ''
    }
  },
  methods: {
    alertHandle() {
      this.$create('ace-alert', {
        msg: '全局提示',
        type: 'success'
      }).show()
    }
  }
}
</script>

<style lang="scss" scoped>
.assembly{
  font-size: 20px;
  .line{
    padding: 20px;
    border-bottom: 1px solid #cccccc;
    .title{
      margin-bottom: 20px;
    }
  }
}
</style>
