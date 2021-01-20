<template>
  <div>
    <div id="wangeditor"></div>
    <textarea id="textarea" readonly="readonly"></textarea>
  </div>
</template>

<script src="https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js"></script>
<script>
import E from 'wangeditor'
export default {
  name: "wangeditor",
  props: {
    content: String,
    value: String
  },
  data() {
    return {
      something: 111
    }
  },
  mounted() {
    const editor = new E('#wangeditor')
    const $textarea = $('#textarea')
    const _that = this
    // 设置高度
    editor.config.height = 500
    editor.config.onchange = function (html) {
      // 监控变化，同步更新到 textarea
      $textarea.val(html)
      _that.something = html
    }
    // 设置本地上传图片
    editor.config.uploadImgShowBase64 = true
    editor.create()
    // 初始化 textarea 的值
    editor.txt.html(this.content)
    $textarea.val(editor.txt.html())
  },
  methods: {
    displayIn(){
      this.$emit('retrieveData', this.something)
    }
  }
}
</script>

<style scoped>
  #textarea{
    width:100%;
    height:200px;
    resize: none;
    margin-top: 10px;
    cursor: pointer;
  }
</style>
