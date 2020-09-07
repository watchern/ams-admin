<template>
  <div class="new-select flex a-center j-start">
    <el-select v-model="selectVal" placeholder="请选择">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  props:{
    value:[String,Number],
    options:{
      type:Array,
      default:()=>([
        {
          value: '选项1',
          label: '黄金糕'
        }, {
          value: '选项2',
          label: '双皮奶'
        }, {
          value: '选项3',
          label: '蚵仔煎'
        }, {
          value: '选项4',
          label: '龙须面'
        }, {
          value: '选项5',
          label: '北京烤鸭'
        }
      ])
    }
  },
  watch:{
    value:{
      handler:function(newV,oldV){
        this.selectVal=newV
      },
      deep:true,
      immediate:true,
    }
  },
  data(){
    return{
      selectVal:''
    }
  }
}
</script>
<style lang="scss" scoped>
.new-select{
  height: 36px;
  >>> .el-select.el-select--medium{
    width: 100%;
  }
  >>> .el-input__inner{
    background: transparent;
    border-top:none;
    border-left:none;
    border-right:none;
    border-radius: 0;
    border-bottom-color:#454C58;
    padding-left: 0;
  }
}
</style>
