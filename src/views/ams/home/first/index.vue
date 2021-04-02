<template>
  <div class="home w100 h100 flex a-center j-start flex-column">
    <div class="top flex a-center j-between flex-row flex1 flex-shrink ">
      <div class="right flex a-end j-center flex-column">
        <div class="top-card flex a-start j-start flex-row skin-wbgColor-3 skin-shadow">
          <div class="top-card-left flex-shrink  flex a-center j-center">
            <img src="../../../../styles/image/c2.png" class="img">
          </div>
          <div class="top-card-right">
            <div class="title skin-wordColor">待办事项</div>
            <div class="des" v-for="(item,index) in TopTodo">
              <span class="skin-wordColor">{{item.name}}</span>
              <span v-if="item.icon" :style="{color:item.iconColor}" class="icon">{{ item.icon }}</span>
            </div>
          </div>
          <span class="card-more skin-wordmoreColor" @click="toDoSomeJump">更多</span>
        </div>
        <div class="bottom-card flex a-center j-between flex-row">
          <div v-for="(item,index) in cardList" :key="index" class="top-card flex j-start flex-row skin-shadow" :class="{backgroundColor:index === 0?'skin-wbgColor-1':'skin-wbgColor-2'}">
            <div class="top-card-left flex-shrink skin-bgColor flex a-center j-center">
              <img :src="item.img" class="img">
            </div>
            <div class="top-card-right">
              <div class="title">{{ item.title }}</div>
              <div v-for="(text,index) in item.des" :key="index" class="line">
                <span @click="toDoJump(text.index)" class="notes-text">{{ text.text }}</span>
                <span v-if="text.icon" :style="{color:text.iconColor,width:text.width}" class="icon">{{ text.icon }}</span>
              </div>
              <span class="card-more" @click="moreJump(item)">更多</span>
            </div>
          </div>
        </div>
      </div>
      <div class="left flex-shrink flex a-center j-center flex-column">
        <swiper :options="swiperOption" ref="mySwiper" :autoplay="5000">
          <swiper-slide>
            <div class="day-wrap relative">
<!--              <animate-number from="00" :to="this.myProjectIn[0].lengthIn" :formatter="formatter" class="num" />-->
<!--              <span class="text absolute">我的项目</span>-->
              <div class="showDetailedIn">
                <span style="background-color:rgb(81,69,89)">{{showDetailedData.TAKEPROJECTCOUNT}}</span>
                参与项目数
              </div>
              <div class="showDetailedIn">
                <span style="background-color:rgb(81,69,89)">{{showDetailedData.FINDPROBLEMCOUNT}}</span>
                发现问题数量
              </div>
              <div class="showDetailedOut">
                <span style="background-color:rgb(131,132,158)">{{showDetailedData.TAKECHIEFJUDGECOUNT}}</span>
                担任主审次数
              </div>
              <div class="showDetailedOut">
                <span style="background-color:rgb(69,86,89)">{{showDetailedData.WORKCOUNT}}</span>
                项目工作天数
              </div>
            </div>
          </swiper-slide>
          <swiper-slide>
            <img :src="linshiImg1" style="width: 100%;margin-top: 40px"/>
          </swiper-slide>
          <swiper-slide>
            <img :src="linshiImg2" style="width: 100%;margin-top: 40px" />
          </swiper-slide >
          <div class="swiper-pagination" slot="pagination"></div>
        </swiper>

        <!--        <div class="calendar-wrap flex a-center j-center flex-row relative">-->
        <!--          <div v-for="(item,index) in boxList" :key="index" class="box flex a-center j-center flex-column" :class="[index===3 && 'box-active']">-->
        <!--            <div class="label">{{ item.label }}</div>-->
        <!--            <div class="value">{{ item.value }}</div>-->
        <!--          </div>-->
        <!--          <img src="../../../../assets/styles/image/enlarge.png" class="enlarge absolute">-->
        <!--        </div>-->
      </div>
    </div>
    <div class="bottom-father" v-for="(item, index) in myProjectIn">
      <div class="bottom bottom-animate flex a-center j-start flex-row skin-bgColor" :key="projectAnimation">
        <div class="line1 line flex a-start j-center flex-column skin-border-right" style="flex-basis:80px;">
          <div class="count-font" style="cursor:pointer;">
            <span class="count-font">{{ item.theIndex + 1 }}</span>/<animate-number :from="0" :to="item.lengthIn" class="count-font" />
          </div>
        </div>
        <div class="line1 line flex a-center j-center flex-column skin-border-right">
          <div class="title-bottom-top">我的项目</div>
          <div class="des flex a-center j-start flex-row">
            <div class="right-name right">
              <div class="p1">{{ item.name }}</div>
            </div>
          </div>
        </div>
        <div class="line2 line flex a-center j-center flex-column skin-border-right">
          <div class="title-bottom">项目状态</div>
          <div class="date">执行中</div>
        </div>
        <div class="line3 line flex a-center j-center flex-column skin-border-right">
          <div class="title-bottom">立项时间</div>
          <div class="date">{{ item.time }}</div>
        </div>
        <div class="line4 line flex a-center j-center flex1">
          <div class="btn" @click="projectDetailsIn(item.idProject)">查看此项目的详情</div>
        </div>
      </div>
      <div class="bottom-after skin-bttom-a" @click="toTheNext(item.theIndex)"><i class="el-icon-arrow-down"></i></div>
    </div>
    <el-dialog
      :visible.sync="dialogFormVisible"
      top = "10vh"
      title="消息详情"
      width="50%"
      v-model="this.PopUpContent"
      >
      <span class="visible-span">消息标题</span>
      <p class="visible-p1">{{this.PopUpContent[0].text}}</p >
      <span class="visible-span">消息内容</span>
      <p class="visible-p2">{{this.PopUpContent[0].content}}</p >
    </el-dialog>
  </div>
</template>

<script>
import { getRemindByDescTime, updateRemind } from '@/api/base/base'
import { getRunTaskRelByPage } from "@/api/analysis/auditmodelresult"
import { swiper, swiperSlide } from "vue-awesome-swiper";
import "swiper/dist/css/swiper.css";
import axios from 'axios'
import mtEditor from "ams-datamax";
export default {
  components: {
    mtEditor,swiper, swiperSlide
  },
  data() {
    return {
      resultSpiltObjects:{},
      cardList: [
        {
          img: require('../../../../styles/image/提醒.png'),
          title: '提醒事项',
          path:'',
          des: []
        },
        {
          img: require('../../../../styles/image/c1.png'),
          title: '审计预警',
          path:'',
          des: []
        },
      ],
      // boxList: [
      //   {
      //     label: 'Mon',
      //     value: 2
      //   }, {
      //     label: 'Tue',
      //     value: 3
      //   }, {
      //     label: 'Wed',
      //     value: 4
      //   }, {
      //     label: 'Thu',
      //     value: 5
      //   }, {
      //     label: 'Fri',
      //     value: 6
      //   }, {
      //     label: 'Sat',
      //     value: 7
      //   }, {
      //     label: 'Sun',
      //     value: 8
      //   }
      // ],
      TopTodo: [
        {
          text: '暂无待办事项',
          iconColor: '#D81020',
          icon: '',
          url:'',
          title:'',
          content:''
        }
      ],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 5,
      },
      warningMatters: [
        {
          text: '暂无预警事项',
          iconColor: '#D81020',
          icon: '',
          url:'',
          title:'',
          content:''
        }
      ],
      projectDetails: [],
      myProjectIn: [],
      dialogFormVisible: false,
      PopUpContent:[{
        text:'',
        content:''
      }],
      projectAnimation: true,
      swiperOption: {
        loop: true,
        autoplay :{
          delay: 2000,
          stopOnLastSlide: true,
          /* 触摸滑动后是否继续轮播 */
          disableOnInteraction: false
        },
        stopOnLastSlide: true,
        pagination: {
          el: ".swiper-pagination",
          clickable: true //允许分页点击跳转
        }
      },
      linshiImg1:require('../../../../styles/image/firstcercle.png'),
      linshiImg2:require('../../../../styles/image/firsttable.png'),
      showDetailedData: {
        FINDPROBLEMCOUNT:12,
        WORKCOUNT:0,
        TAKECHIEFJUDGECOUNT:14,
        TAKEPROJECTCOUNT:15
      }
    }
  },
  mounted() {
    getRemindByDescTime().then(resp => {
      this.cardList[0].des = []
      for(let i=0;i<5;i++){
        this.cardList[0].des.push({
          text:resp.data.records[i].remindTitle,
          iconColor: '#D81020',
          icon: '',
          url:resp.data.records[i].modeUrl,
          content:resp.data.records[i].remindContent,
          index:i,
          Uuid:resp.data.records[i].remindUuid
        })
        if(resp.data.records[i].readStatus === 0){
          this.cardList[0].des[i].icon = ' NEW'
        }
      }
    })
    let query1 = {runTaskUuid:null}
    query1.runTaskUuid = '1'
    this.pageQuery.condition = query1;
    getRunTaskRelByPage(this.pageQuery,this.resultSpiltObjects).then((resp) => {
      this.warningMatters = resp.data.records;
      // if (resp.data.records.length > 0) {
      //   for(let i=0;i<5;i++){
      //     this.cardList[1].des.push({
      //       text:resp.data.records[i].remindTitle,
      //       iconColor: '#D81020',
      //       icon: '',
      //       url:resp.data.records[i].modeUrl,
      //       content:resp.data.records[i].remindContent,
      //       index:i,
      //       Uuid:resp.data.records[i].remindUuid
      //     })
      //   }
      // }
    })
    axios.get('/psbcaudit/homepage/loadTodoInfo').then(resp =>{
      if (resp.data !== '') {
        this.TopTodo = resp.data
      }
    })
    axios.get('/psbcaudit/homepage/loadPrjInfo').then(resp =>{
      if (resp.data.prjList.length > 0) {
        this.projectDetails = []
          for (let i = 0;i < resp.data.prjList.length; i++) {
            this.projectDetails.push({
              name: resp.data.prjList[i].prjName,
              time: resp.data.prjList[i].createTime,
              lengthIn: resp.data.prjList.length,
              idProject: resp.data.prjList[i].projectUUID,
              idPlan: resp.data.prjList[i].planUUID
            })
          }
        this.myProject(0)
      }
    })
    // axios.get('/psbcaudit/homepage/hasCount').then(resp =>{
    //   // console.log(resp)
    // })
  },
  methods: {
    formatter(num) {
      return num < 10 ? '0' + num.toFixed(0) : num.toFixed(0)
    },
    formatter1(num) {
      return num.toFixed(1)
    },
    activeTags(item) {
      this.$store.commit('aceState/setRightFooterTags', {
        type: item.type,
        val: item.val
      })
    },
    toDoJump(data){
      if(this.cardList[0].des[data].url == null){
        this.dialogFormVisible = true
        this.PopUpContent=[]
        this.PopUpContent.push({
          text: this.cardList[0].des[data].text,
          content:this.cardList[0].des[data].content
        })
        location.reload()
      }else{
        this.$router.push({ path:this.cardList[0].des[data].url})
      }
      updateRemind(this.cardList[0].des[data].Uuid)
    },
    moreJump(data){
      if (data.title === '提醒事项') {
        this.$router.push({ path: '/base/remind'})
        this.$store.commit('aceState/setRightFooterTags', {
          type: 'active',
          val: {
            name: '系统提醒',
            path: '/base/remind'
          }
        })
      } else {
        this.$router.push({ path: '/analysis/auditwarning'})
        this.$store.commit('aceState/setRightFooterTags', {
          type: 'active',
          val: {
            name: '审计预警',
            path: '/analysis/auditwarning'
          }
        })
      }
    },
    toDoSomeJump(){
      this.$router.push({ path: '/base/frameto?url=psbcaudit/todoInfo/todoInfoList'})
    },
    projectDetailsIn(){
      this.$router.push({ path: '/base/frameto?url=/psbcaudit_pmrs/plPrj/prjProjectToEnd'})
    },
    displayItem(data){
      let thisItem = document.getElementsByClassName('bottom')
      for (let i = 0; i < thisItem.length; i++) {
        thisItem[i].style.zIndex = 1
      }
      thisItem[data].style.zIndex = 10
    },
    action(data, index){
      if (data === 'before') {
        if ((index + 1) === 4) {
          index = -1
        }
        this.displayItem(index + 1)
      } else if (data === 'next') {
        if ((index - 1) === -1) {
          index = 4
        }
        this.displayItem(index - 1)
      }
    },
    myProject (data) {
      this.myProjectIn = []
      let somedata
      if (data === this.projectDetails.length-1) {
        somedata = 0
      } else {
        somedata = data + 1
      }
      this.myProjectIn.push({
        name: this.projectDetails[data].name,
        time: this.projectDetails[data].time,
        lengthIn: this.projectDetails.length,
        idProject: this.projectDetails[data].idProject,
        idPlan: this.projectDetails[data].idPlan,
        next: this.projectDetails[somedata].name,
        theIndex: data
      })
    },
    toTheNext (data) {
      let tt = data + 1
      if (tt === this.projectDetails.length) {
        tt = 0
      }
      this.myProject(tt)
      this.projectAnimation = !this.projectAnimation
    }
  }
}
</script>
<style lang="scss" scoped>
.home{
  //background: #FFFFFF;
  padding-bottom: 12px;
  .top{
    // background: grey;
    width: 90%;
    margin-left: 5%;
    margin-right: 5%;
    .left{
      flex: 1;
      height: 100%;
      position: relative;
      top: -57px;
      .day-wrap{
        width: 100%;
        height: 450px;
        background: url("../../../../styles/image/bg-home@2x.png") no-repeat center center;
        background-size:465px 443px;
        .num{
          font-family: BebasNeue;
          font-size: 236px;
          color: #D70010;
          letter-spacing: 7px;
          text-align: center;
          text-shadow: 0 15px 12px rgba(138,0,11,0.25);
        }
        .text{
          font-family: PingFangSC-Medium;
          font-size: 34px;
          color: #070707;
          letter-spacing: 0.85px;
          text-align: center;
          top: 50%;
          margin-top: 110px;
        }
      }
      .calendar-wrap{
        border-radius: 13px;
        width: 386px;
        height: 90px;
        border: 1px solid #EB3A52;
        margin-top: 20px;
        .enlarge{
          top: 10px;
          right:  10px;
          height: 12px;
          width: 12px;
          cursor: pointer;
        }
        .box{
          width: 37px;
          height: 56px;
          font-size: 12px;
          color: #6B6E76;
          text-align: center;
          line-height: 14px;
          &:not(:last-child){
            margin-right: 14px;
          }
          &-active{
            border: 1px solid #FF6599;
            box-shadow: 0 4px 16px -4px #1A1C1F, inset 1px 1px 3px 0 rgba(0,0,0,0.50);
            border-radius: 8px;
            color: #D70010;
          }
          .label{
            font-family: PingFangSC-Light;
            margin-bottom: 8px;
          }
          .value{
            font-family: Helvetica;
          }
        }
      }
    }
    .right{
      width: 500px;
      position: relative;
      top: -30px;
      .top-card{
        background: #FFFFFF;
        box-shadow: 17px 17px 34px 0 rgba(0,0,0,0.10);
        border-radius: 25.2px;
        padding: 27px;
        width: 479px;
        position: relative;
        margin:5px;
        height: 218px;
        &-left{
          background: #FFFFFF;
          border: 1px solid #D8D8D8;
          border-radius: 12.6px;
          width: 67px;
          height: 67px;
          margin-right: 27px;
          .img{
            width: 36px;
          }
        }
        &-right{
          // width: calc(100% - 67px -27px - 27px);
          .title{
            font-family: PingFangSC-Regular;
            font-size: 20.16px;
            color: #333333;
            line-height: 26.88px;
            margin-bottom: 14px;
          }
          .des{
            font-family: PingFangSC-Regular;
            font-size: 14.7px;
            color: rgba(51,51,51,0.50);
            text-align: justify;
            line-height: 29.57px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;

          }
        }
      }
      .bottom-card{
        width: 479px;
        margin-top: 33px;
        position: relative;
        //.left-card{
        //  background: #EDF1F5;
        //}
        //.right-card{
        //  background: #FFFFFF;
        //}
        //.card{
        //  position: relative;
        //  box-shadow: 17px 17px 34px 0 rgba(0,0,0,0.10);
        //  border-radius: 25.2px;
        //  width: 479px;
        //  //height: 242px;
        //  padding: 27px 20px 27px 27px;
        //  .img-box{
        //    background: #FFFFFF;
        //    border: 1px solid #D8D8D8;
        //    border-radius: 12.6px;
        //    width: 67px;
        //    height: 67px;
        //    .img{
        //      width: 30px;
        //      height: 30px;
        //      object-fit: cover;
        //    }
        //  }
        //  .title{
        //    font-family: PingFangSC-Regular;
        //    font-size: 20.16px;
        //    color: #333333;
        //    line-height: 26.88px;
        //    margin: 18px 0;
        //  }
        //  .line{
        //    font-family: PingFangSC-Regular;
        //    font-size: 13.5px;
        //    color: rgba(21,21,21,0.50);
        //    letter-spacing: 0;
        //    text-align: justify;
        //    line-height: 22px;
        //    .icon{
        //      display: inline-block;
        //      margin-left: 4px;
        //    }
        //  }
        //}
      }
    }
  }
  .bottom{
    height: 106px;
    width: 90%;
    background: #353A43;
    box-shadow: 10px 10px 20px 0 rgba(0,0,0,0.10);
    border-radius: 15px;
    position: absolute;
    user-select:none;
    .line3,.line2{
      width: 20%;
    }
    .line4{
      .btn{
        background: #C8FF8C;
        border-radius: 24px;
        width: 213px;
        height: 36px;
        line-height: 36px;
        text-align: center;
        font-family: PingFangSC-Medium;
        font-size: 16px;
        color: #333333;
        letter-spacing: 2.8px;
        cursor: pointer;
      }
    }
    .line1{
      padding-left: 30px;
      width: 30%;
      .right{
        .p1{
          font-family: PingFangSC-Regular;
          font-size: 24px;
          color: #ffffff;
          line-height: 70px;
          width: 520px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align:center;
        }
        .p2{
          font-family: PingFangSC-Semibold;
          font-size: 14px;
          color: rgba(255,255,255,0.50);
          line-height: 20px;
        }
      }
    }
    .line{
      text-align: left;
      height: 100%;
      &:not(:last-child){
        border-right: 1px solid #21364E;
      }
      .title{
        font-family: PingFangSC-Semibold;
        font-size: 14px;
        color: rgba(255,255,255,0.50);
        text-align: center;
        line-height: 24px;
      }
        .count-font{
          font-family: BebasNeue;
          font-size: 56px;
          color: #FFFFFF;
          height: 60px;
          line-height: 60px;
        }
    }
  }
}
.card-more{
  position: absolute;
  right:20px;
  bottom:5px;
  font-family: PingFangSC-Regular;
  font-size: 13.5px;
  color: #1890ff;
  letter-spacing: 0;
  text-align: justify;
  line-height: 22px;
  cursor:pointer;
}
.visible-span{
    width: 95%;
    margin: 2.5% 2.5% .5%;
    display: inline-block;
    font-size: 24px;
}
.visible-p1{
    width: 95%;
    margin:.5% 2.5% 2.5%;
  padding: 10px;
  border: 1px solid #ddfdff;
  font-size: 16px;border-radius: 6px;
  display: inline-block;
  height: 40px;
  overflow: auto;
}
.visible-p2{
    width: 95%;
    margin:.5% 2.5% 2.5%;
  padding: 10px;
  border: 1px solid #ddfdff;
  font-size: 16px;border-radius: 6px;
  display: inline-block;
  line-height: 27px;
  height: 400px;
  overflow: auto;
}
.notes-text{
  line-height:25px;
  cursor: pointer;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.title-bottom{
  font-size:18px;
  font-family: PingFangSC-Semibold;
  color: rgba(255,255,255,0.50);
  text-align: center;
  line-height: 24px;
}
.title-bottom-top{
  font-size:18px;
  font-family: PingFangSC-Semibold;
  color: rgba(255,255,255,0.50);
  text-align: center;
  line-height: 24px;
}
.date{
  font-family: BebasNeue;
  font-size: 30px;
  color: #fff;
  height: 60px;
  line-height: 70px;
}
.right{
  height:60px;
}
.bottom-father{
  height: 124px;
  width: 100%;
  position: relative;
  margin-top: 20px;
}
.top-card-right{
  table-layout: fixed;
  width: 81px;
}
.bottom-after{
  content: '';
  display: block;
  width: 86%;
  height: 18px;
  border-bottom-left-radius: 100px;
  border-bottom-right-radius: 100px;
  position:absolute;
  bottom:0;
  left:7%;
  color: #fff;
  text-align:center;
}
.bottom-animate{
  animation: booani 0.6s linear forwards;
}
@keyframes booani {
  0%{
    width:0;
    height:0;
    bottom: 18px;
    left:50%;
  }
  30%{
    height: 80px;
    width: 85%;
    bottom: 18px;
    left:7.5%;
  }
  80%{
    height: 130px;
    width: 100%;
    bottom: 18px;
    left:0;
  }
  100%{
    height: 106px;
    width: 90%;
    bottom: 18px;
    left:5%;
  }
}
.swiper-container{
  position: relative;
  width: 30vw;
  height: 75vh;
  padding-top: 15vh;
}
.swiper-container .swiper-slide{
  width: 100%;
  font-size: 16px;
  text-align: center;
}
.showDetailedIn{
  width:40%;
  height:20%;
  margin-top:30%;
  display:inline-block;
  font-size: 24px;
  margin-right: 2.5%;
  text-align: left;
  margin-left: 2.5%;
}
.showDetailedOut{
  width:40%;
  height:20%;
  margin-bottom:20%;
  display:inline-block;
  font-size: 24px;
  margin-right: 2.5%;
  text-align: left;
  margin-left: 2.5%;
}
.showDetailedIn span{
  display: inline-block;
  width:60px;
  height:60px;
  border-radius:100%;
  background-color:#888;
  float: left;
  line-height: 60px;
  margin-top: -12px;
  text-align: center;
  margin-right:10px;
  font-size: 24px;
  font-weight: bold;
  color: #fff;
}
.showDetailedOut span{
  display: inline-block;
  width:60px;
  height:60px;
  border-radius:100%;
  background-color:#888;
  float: left;
  line-height: 60px;
  margin-top: -12px;
  text-align: center;
  margin-right:10px;
  font-size: 24px;
  font-weight: bold;
  color: #fff;
}
</style>
