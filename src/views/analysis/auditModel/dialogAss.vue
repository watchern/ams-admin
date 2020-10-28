<template>
  <!-- 弹框 -->
  <div id="popupBox1" :style="{'top':top,'left':left,'width':width}" v-if="show" ref="movediv">
    <div class="poput_contant1" >
      <!--   关闭背景图  可替换成自己的背景图  -->
      <span @click="closePopu()" class="pop_close1"></span>
      <h3  class="pop_title1"  @mousedown="move">
        <span class="pop_name1">{{title}}</span>
      </h3>
      <div class="pop_main1 scrollbar_box" :style="{'maxHeight':maxHeight}" id="tableShow">
        <div class="pop_m_box1 scrollbar_box1">
          <!-- 载入动画 -->
          <div class="loadEffect1 scrollbar_box1">
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DialogAss',
  props: {
    title: {
      type: String,
      default: '明细' // 弹窗标题
    },
    top: { // 弹窗上边边可视窗口距离
      type: String,
      default: '30%' // 220% 50px
    },
    left: { // 弹窗左边可视窗口距离
      type: String,
      default: '30%' // 220% 50px
    },
    width: String, // 弹窗宽度 220% 50px
    maxHeight: { // 弹窗最小高度
      type: String,
      default: '400px' // 220% 50px
    },
    show: Boolean // 弹窗显示隐藏

  },
  data(){},
  // computed:{
  //   show(){
  //     console.log(this.show,'组件')
  //   }
  // },
  methods: {
    // 关闭弹窗
    closePopu () {
      this.$emit('update:show', false)
      // this.$emit('closePopu')
    },
    // 弹窗拖拽事件
    move (e) {
      let odiv = this.$refs.movediv // 获取当前元素
      // 算出鼠标相对元素的位置
      let disX = e.clientX - odiv.offsetLeft
      let disY = e.clientY - odiv.offsetTop
      console.log('disX', disX, 'disY', 0 - disY)
      document.onmousemove = (e) => {
        // 用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
        let left = e.clientX - disX
        let top = e.clientY - disY
        let clH = document.documentElement.clientHeight - odiv.clientHeight
        let clW = document.documentElement.clientWidth - odiv.clientWidth
        if (left <= 0) left = 0
        if (left >= clW) left = clW
        if (top <= 0) top = 0
        if (top >= clH)top = clH
        // 移动当前元素
        odiv.style.left = left + 'px'
        odiv.style.top = top + 'px'
      }
      document.onmouseup = (e) => {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  }
}
</script>

<style>
/* 弹框样式 */
#popupBox1 {
  position: fixed;
  z-index: 99999;
  border-radius: 4px;
}
.poput_contant1 {
  width: 100%;
  height: 100%;
  position: relative;
}

.poput_contant1 .pop_title1 {
  height: 45px;
  cursor: default;
  line-height: 45px;
  background: linear-gradient(120deg, rgba(34, 84, 127, 1) 0%, rgba(34, 84, 127, 1) 0%, rgba(91, 255, 255, 1) 100%, rgba(91, 255, 255, 1) 100%);
}

.pop_name1 {
  font-size: 30px;
  font-weight: bold;
  color: #5BFFFF;
  padding-left: 40px;
}

.pop_close1 {
  display: inline-block;
  float: right;
  height: 45px;
  width: 45px;
  z-index: 1000000;

  background-size: 50% 50%;
  margin-right: 0;
  margin-top: 0;
  cursor: pointer;
}

.pop_main1 {
  /*height: calc(100% - 45px);*/
  background: linear-gradient(140deg, rgba(34, 84, 127, 1) 0%, rgba(34, 84, 127, 1) 58%, rgba(91, 255, 255, 1) 100%, rgba(91, 255, 255, 1) 100%);
  /*overflow: hidden;*/
  overflow-y: auto;
  box-sizing: border-box;
  padding: 8px;
}

.pop_m_box1 {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  background: #f1f1f1;
}
/* 滚动条样式 */
.scrollbar_box1 {
  overflow: hidden;
  overflow-y: auto
}

.scrollbar_box1::-webkit-scrollbar {
  width: 10px;
  background: #295a86;
  border-radius: 2px;
}
.scrollbar_box1::-webkit-scrollbar-thumb {
  width: 4px;
  background: #548bb7;
  border-radius: 10px;
}
</style>
