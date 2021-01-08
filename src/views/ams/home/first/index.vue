<template>
  <div class="home w100 h100 flex a-center j-start flex-column">
    <div class="top flex a-center j-between flex-row flex1 flex-shrink ">
      <div class="left flex-shrink flex a-center j-center flex-column">
        <div class="day-wrap flex a-center j-center relative">
          <animate-number from="01" to="9" :formatter="formatter" class="num" />
          <span class="text absolute">我的项目</span>
        </div>
<!--        <div class="calendar-wrap flex a-center j-center flex-row relative">-->
<!--          <div v-for="(item,index) in boxList" :key="index" class="box flex a-center j-center flex-column" :class="[index===3 && 'box-active']">-->
<!--            <div class="label">{{ item.label }}</div>-->
<!--            <div class="value">{{ item.value }}</div>-->
<!--          </div>-->
<!--          <img src="../../../../assets/Ace/image/enlarge.png" class="enlarge absolute">-->
<!--        </div>-->
      </div>
      <div class="right flex a-end j-center flex-column">
        <div class="top-card flex a-start j-start flex-row">
          <div class="top-card-left flex-shrink  flex a-center j-center">
            <img src="../../../../assets/Ace/image/c2.png" class="img">
          </div>
          <div class="top-card-right">
            <div class="title">待办事项</div>
            <div class="des" v-for="(item,index) in TopTodo">
              <span>{{item.text}}</span>
              <span v-if="item.icon" :style="{color:item.iconColor}" class="icon">{{ item.icon }}</span>
            </div>
          </div>
          <span class="card-more" @click="toDoSomeJump">更多</span>
        </div>
        <div class="bottom-card flex a-center j-between flex-row">
          <div v-for="(item,index) in cardList" :key="index" class="top-card flex a-start j-start flex-row" :style="{background:item.bg}">
            <div class="top-card-left flex-shrink  flex a-center j-center" :style="{background:item.cardBg}">
              <img :src="item.img" class="img">
            </div>
            <div class="top-card-right">
              <div class="title">{{ item.title }}</div>
              <div v-for="(text,index) in item.des" :key="index" class="line">
                <span @click="toDoJump(text.index)" class="notes-text">{{ text.text }}</span>
                <span v-if="text.icon" :style="{color:text.iconColor,width:text.width}" class="icon">{{ text.icon }}</span>
              </div>
              <span class="card-more" @click="moreJump">更多</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom flex a-center j-start flex-row">
      <div class="line1 line flex a-start j-center flex-column" style="flex-basis:80px">
        <div class="count-font">
          <animate-number from="1" to="1" class="count-font" />/<animate-number from="1" to="9" class="count-font" />
        </div>
      </div>
      <div class="line1 line flex a-center j-center flex-column" style="flex-basis:530px">
        <div class="title-bottom-top">我的项目</div>
        <div class="des flex a-center j-start flex-row">
          <div class="right-name right">
            <div class="p1">#2020公司信贷业务专项审计</div>
          </div>
        </div>
      </div>
      <div class="line2 line flex a-center j-center flex-column">
        <div class="title-bottom">项目状态</div>
        <div class="date">执行中</div>
      </div>
      <div class="line3 line flex a-center j-center flex-column">
        <div class="title-bottom">立项日期</div>
        <div class="date">2020-04-06</div>
      </div>
      <div class="line4 line flex a-center j-center flex1">
        <div class="btn" @click="projectDetails">查看此项目的详情</div>
      </div>
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
export default {
  data() {
    return {
      cardList: [
        {
          img: require('../../../../assets/Ace/image/c1.png'),
          title: '提醒事项',
          bg: '#EDF1F5',
          cardBg: '#353A43',
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
      dialogFormVisible: false,
      PopUpContent:[{
        text:'',
        content:''
      }]
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
    // executionProjectAgent().then(resp => {
    //   console.log(resp)
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
    moreJump(){
      // this.activeTags({
      //   type: 'active',
      //   val: {val:this.cardList[1].path , name:'提醒'}
      // })
      this.$router.push({ path: '/base/remind'})
    },
    toDoSomeJump(){
      this.$router.push({ path: '/base/frameto?url=/psbcaudit/homepage/todoInfoTabList'})
    },
    projectDetails(){
      this.$router.push({ path: '/base/frameto?url=/psbcaudit_pmrs/plPrj/prjProjectToEnd'})
    }
  }
}
</script>
<style lang="scss" scoped>
.home{
  background: #FFFFFF;
  padding-bottom: 12px;
  .top{
    // background: grey;
    width: 90%;
    margin-left: 5%;
    margin-right: 5%;
    .left{
      flex: 1;
      height: 100%;
      .day-wrap{
        width: 470px;
        height: 450px;
        background: url("../../../../assets/Ace/image/bg-home@2x.png") no-repeat center center;
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
      .top-card{
        background: #FFFFFF;
        box-shadow: 17px 17px 34px 0 rgba(0,0,0,0.10);
        border-radius: 25.2px;
        padding: 27px;
        width: 479px;
        position: relative;
        //height: 188px;
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
    position: relative;
    margin-bottom: 12px;
    margin-top: 20px;
    .line3,.line2{
      width: 20%;
    }
    .line4{
      .btn{
        background: #C8FF8C;
        border-radius: 24px;
        width: 213px;
        height: 36px;
        text-align: center;
        line-height: 36px;
        font-family: PingFangSC-Medium;
        font-size: 16px;
        color: #333333;
        letter-spacing: 2.8px;
        cursor: pointer;
      }
    }
    .line1{
      padding-left: 30px;
      width: 40%;
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
    &::after{
      content: '';
      display: block;
      width: 90%;
      height: 12px;
      background: #0F1F32;
      position: absolute;
      bottom: -12px;
      left: 5%;
      border-bottom-left-radius: 100px;
      border-bottom-right-radius: 100px;
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
</style>
