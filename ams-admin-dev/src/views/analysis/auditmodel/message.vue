<template>
  <div class="pop-up" :class=this.bacColor>
    <img :src="this.theSomeImg"/>
    <span> {{ this.message }} </span>
  </div>
</template>

<script>
export default {
  name: "message",
  props: ['type','message'],
  data(){
    return{
      info:require("@/views/analysis/auditmodel/imgs/prompt.png"),
      warning:require("@/views/analysis/auditmodel/imgs/warning.png"),
      success:require("@/views/analysis/auditmodel/imgs/carryout.png"),
      error:require("@/views/analysis/auditmodel/imgs/prohibit.png"),
      theSomeImg:"",
      bacColor:""
    }
  },
  methods: {

  },
  mounted() {
    if(this.type == "success"){
      this.theSomeImg = this.success
      this.bacColor = 'pop-success'
    }
    else if(this.type == "info"){
      this.theSomeImg = this.info
      this.bacColor = 'pop-info'
    }
    else if(this.type == "warning"){
      this.theSomeImg = this.warning
      this.bacColor = 'pop-warning'
    }
    else if(this.type == "error"){
      this.theSomeImg = this.error
      this.bacColor = 'pop-error'
    }
  }
}
</script>

<style scoped>
  .pop-up{
    height:44px;
    border-radius: 6px;
    margin-top: 10px;
  }
  .pop-up img{
    width:28px;
    height:28px;
    margin:8px 10px 0 10px;
    float:left;
  }
  .pop-up span{
    color: #212B36 ;
    font-size:15px;
    font-family: Helvetica;
    line-height:44px;
    float: left;
  }
  .pop-success{
    background-color:rgb(240,237,238)
  }
  .pop-info{
    background-color:rgb(239,249,249)
  }
  .pop-warning{
    background-color:rgb(253,247,229)
  }
  .pop-error{
    background-color: rgb(252, 230, 222)
  }
</style>
