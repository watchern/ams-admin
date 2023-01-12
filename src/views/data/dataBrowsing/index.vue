<template>
  <div class="page-container">
    <div class="top-container">
      <!--      查询-->
      <div class="query-top-img">
        <img :src="dataSearchImg"/>
      </div>
      <div style="width: 600px; margin: 0 auto; padding: 5px">
        <query-tags :dropDownData="dropDownData" @change="onChange"></query-tags>
      </div>
    </div>
    <div class="under-container">
      <div class="left-container">
        <div class="categorical-index" >
          <div>
            <span style="font-weight: bold; font-size: 16px;padding: 15px 15px 0 20px">业务主题</span>
            <div style="display: inline-block" v-for="(topic,index) in topics" :key="index">{{topic.title}}</div>
          </div>
          <span style="font-weight: bold; font-size: 16px;padding: 0 15px 0 20px">业务系统</span><hr/>
          <span style="font-weight: bold; font-size: 16px;padding: 0 15px 0 20px">分    层</span><hr/>
          <span style="font-weight: bold; font-size: 16px;padding: 0 15px 0 20px">接入时间</span><hr/>
        </div>
        <div class="data-list">
        </div>
      </div>
      <div class="right-container">
        <el-card class="query-card">
          <div slot="header" class="card-clearfix">
            <span style="font-weight:bold">大家都在查></span>
            <el-button style="float: right; padding: 1px; color: gray; font-weight: normal" type="text" icon="el-icon-refresh-right">
              换一换
            </el-button>
          </div>
          <div v-for="o in 10" :key="o" class="query-card-text">
            <li>{{'列表内容 ' + o }}
              <i icon="icon-hot-fire"></i>
            </li>
          </div>
  <!--        <div class="query-card-text">-->
  <!--          <ul v-for="(item,index) in ">{{index+1}}.{{items.message}}-->
  <!--            <i icon="el-icon-hot-fire"></i>-->
  <!--          </ul>-->
  <!--        </div>-->
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import queryTags from "@/components/queryTags";
export default {
  name: "dataBrowsing",
  components: {
    queryTags,
  },
  props: [],
  data() {
    return {
      dataSearchImg: require("@/assets/img/search_logo.png"),
      dropDownData: ["测试","测试11111"],
      //业务主题
      topics:[{
        title:"基金主题"
      },{
        title:"理财主题"
        },{
        title:"客户主题"
        },{
        title:"电子渠道"
        },{
        title:"财务主题"
        }],
      //业务系统
      //分层
      //接入时间

      // items:[{
      //   message:"标题1"
      // },{
      //   message:"标题2"
      // },{
      //   message:"标题3"
      // },{
      //   message:"标题4"
      // },{
      //   message:"标题5"
      // },{
      //   message:"标题6"
      // },{
      //   message:"标题7"
      // },{
      //   message:"标题8"
      // },{
      //   message:"标题9"
      // },{
      //   message:"标题10"
      // }]
    };
  },
  computed: {},
  watch: {},
  mounted() {
    console.log(this.dataSearchImg)
  },
  methods: {
    onChange(data) {
      console.log(data, "data");
    },
  },
};
</script>

<style lang="scss" scoped>

.page-container {
  display: flex;
  padding: 0px !important;
  flex-direction:column
}
.top-container {
  width: 100%;
}
/*下部页面*/
.under-container {
  display: flex;
  justify-content:space-evenly;
}


/*左侧容器*/
.left-container{
  width: 85%;
  height: 100%;
}
/**/
.categorical-index{
  width: 100%;
  height:40%;
  background: white;
}
/*数据*/
.data-list{
  padding-top: 15px;
  flex-direction:column;
  background: white;
  width: 100%;
  height:60%;
}

/*右侧*/
.right-container{
  flex: 1;
  padding-left: 20px;
  padding-right: 20px;
}

/*查询*/
.query-top-img{
  background: white;
  text-align: center
}

/*右侧查询卡片*/
.query-card{
    width: 300px;
    max-height: 400px;
  }

/*右侧查询信息文本样式*/
.query-card-text li{
  font-size: 14px;
  color:blue;
  height: 30px;
  cursor: pointer;
}
/*鼠标滑过加下划线*/
.query-card-text li:hover{
  text-decoration: underline;
}

.card-clearfix:before, .card-clearfix:after {
  display: table;
  content: "";
}

.card-clearfix:after {
  clear: both
}
  /*查询卡片结束*/

</style>
