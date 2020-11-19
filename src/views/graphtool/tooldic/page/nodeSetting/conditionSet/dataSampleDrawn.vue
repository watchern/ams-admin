<template>
  <div>
    <form class="layui-form" action="">
      <div class="layui-form-item">
        <div class="layui-input-block radioDiv">
          <div>
            <input type="radio" name="samCounts" value="samCount" checked><span>样本量（个）抽样</span>
            <input id="samCount_samCount" type="number" name="username" autocomplete="off" placeholder="请输入样本数量" class="layui-input" min="1" step="10">
          </div>
          <div>
            <input type="radio" name="samCounts" value="proportion"><span>比例（%）抽样</span>
            <input id="proportion_samCount" type="number" autocomplete="off" placeholder="请输入样本数量比例" class="layui-input" min="1" max="100" step="5">
          </div>
          <div>
            <input type="radio" name="samCounts" value="preN"><span>前N个抽样</span>
            <input id="preN_samCount" type="number" autocomplete="off" placeholder="请输入数量" class="layui-input" min="1">
          </div>
          <div>
            <input type="radio" name="samCounts" value="eqCountSample"><span>等距抽样</span>
            <input id="eqCountSample_samCount" type="number" autocomplete="off" placeholder="请输入样本步长" class="layui-input" min="1">
          </div>
          <!--<div>-->
          <!--<input type="radio" name="samCounts" value="simpleRom" checked><span>简单随机抽样</span>-->
          <!--</div>-->
        </div>
      </div>
    </form>
  </div>
</template>

<script>
var nodeData
export default {
  name: 'DataSampleDrawnSet',
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const graph = this.$parent.graph
      nodeData = graph.nodeData[graph.curCell.id]
      if (nodeData.isSet) {
        var obj = nodeData.setting
        if (obj.radioValue && obj.radioValue !== '') {
          $("input[type='radio'][name='samCounts'][value=" + obj.radioValue + ']').attr('checked', true)
          $('#' + obj.radioValue + '_samCount').val(obj.samCountVal)
        }
      }
    }
  }
}

var obj = {}
/**
     * 设置位置
     **/
$('.radioDiv').css({ 'margin-left': function() {
  var set_width = ($(document).width() - 500) / 2 + 'px'
  return set_width
}, 'margin-top': '20px' })

/**
     * 反显
     */

/**
     *  保存数据
     */
function saveSetting() {
  var radioValue = $("input[name='samCounts']:checked").val()// 获得当前选中的radio
  var samCountVal = ''
  if (radioValue !== '') {
    samCountVal = $('#' + radioValue + '_samCount').val()
  }
  obj.radioValue = radioValue // 样本类型
  obj.samCountVal = samCountVal// 样本值
  nodeData.setting = obj
}

/**
     * 转化整形
     */
$("input[id$='_samCount']").blur(function() {
  var samCountVal = $(this).val()
  if (typeof samCountVal !== 'undefined' && samCountVal !== '') {
    $(this).val(Math.round(samCountVal))
  }
  if (this.id === 'proportion_samCount' && samCountVal > 100) { // 比例框
    $(this).val(100)
  }
})

// 页面输入项的校验(或空配置校验)
function inputVerify() {
  $("input[type='number']").css('border', '1px solid #e6e6e6')
  var verify = true
  $("input[name='samCounts']").each(function(i, v) {
    if ($(this).is(':checked')) {
      var nextVal = $("input[type='number']:eq(" + i + ')').val()
      if (nextVal === '') {
        $("input[type='number']:eq(" + i + ')').css('border', '1px solid red')
        verify = false
        return false
      }
    }
  })
  if (!verify) {
    alertMsg('提示', '未输入需抽样的数值！', 'info')
  }
  return verify
}
</script>

<style scoped type="text/css">
    .layui-input{
        display: inline;
        width: 300px;
        padding-left: 10px;
        margin-left: 10px;
        height: 28px;
        float:right;
        margin-right:50px;
    }
    .radioDiv{
        width:520px;
    }
    .radioDiv span{
        line-height: 35px;
        margin-left: 9px;
    }
    form{
        background: none;
    }
</style>
