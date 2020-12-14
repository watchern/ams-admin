<template>
  <div class="tools-template w100 h100 relative">
    <div class="tools-content h100 relative">
      <div class="title text-white">
        <i class="el-icon-s-grid" />
        <span class="label">More tools</span>
      </div>
      <div class="lately-use">
        <div class="title-label">最近使用</div>
        <div class="lately-use-box flex a-center j-start flex-row">
          <div
            v-for="(item,index) in latelyInImgList"
            :key="index"
            class="use-box flex a-center j-center"
            id="use-zy"
            @click="theRouting"
          >
            <img :src="item" />
          </div>

        </div>
        <div class="lately-use-box flex a-center j-start flex-row">
          <div v-for="(item,index) in latelyUseList"
               :key="index"
               class="use-box flex a-center j-center"
               id="use-zyt"
          >
            <span style="font-size:14px"> {{ item }} </span>
          </div>
        </div>

      </div>
      <div class="other-tools">
        <div class="title-label">其他工具</div>
        <div class="other-tools-box flex flex-row a-center j-start">
          <div
            v-for="(item,index) in otherToolsList"
            :key="index"
            class="tools-box flex a-start j-center flex-column"
          >
            <i class="el-icon-s-home tools-box-icon" />
            <div class="tools-box-name">{{ item.name }}</div>
          </div>
        </div>
      </div>
      <div class="newest-item">
        <div class="title-label">最新项目</div>
        <div class="newest-item-box">
          <div class="newest-item-box-title">我的项目</div>
          <div class="newest-item-box-content flex a-center j-start flex-row">
            <div class="content-left">
              <animate-number from="1" to="1" class="num" />/
              <animate-number from="1" to="9" class="num" />
            </div>
            <div class="content-right">
              <div class="right-p1">#公司信贷业务专项审计</div>
              <div class="right-p2">2020-04-06</div>
            </div>
          </div>
        </div>
      </div>
<!--      <div class="btns-wrap absolute">-->
<!--        <div class="btn-box flex a-center j-center">-->
<!--          <i class="el-icon-close" />-->
<!--        </div>-->
<!--        <div class="btn-box1 flex a-center  flex-column">-->
<!--          <i class="el-icon-close" />-->
<!--          <i class="el-icon-close" />-->
<!--        </div>-->
<!--      </div>-->
    </div>
    <div class="new-time-wrap absolute">
      <ace-progress />
    </div>
    <div v-if="isShowInfoBox" class="info-box absolute flex a-center j-start flex-row">
      <img src="../../../assets/Ace/image/提示icon2@2x.png" class="info-icon">
      <span class="msg">Helpful and short message.</span>
      <i class="el-icon-close icon-close" @click="isShowInfoBox=false" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isShowInfoBox: true,
      otherToolsList: [
        {
          name: '工具名称',
          color: ''
        },
        {
          name: '工具名称',
          color: ''
        },
        {
          name: '工具名称',
          color: ''
        },
        {
          name: '工具名称',
          color: ''
        },
        {
          name: '工具名称',
          color: ''
        },
        {
          name: '工具名称',
          color: ''
        },
        {
          name: '工具名称',
          color: ''
        }
      ],
      latelyUseList: [],
      latelyPathList: [],
      latelyImgList:[
        {
          name: '审计计划',
          image: require("../../Ace/base/accessIcon/shenji.png")
        },
        {
          name: '备选计划',
          image: require("../../Ace/base/accessIcon/shenji.png")
        },
        {
          name: '快速通道授权',
          image: require("../../Ace/base/accessIcon/shouquan.png")
        },
        {
          name: '立项申请',
          image: require("../../Ace/base/accessIcon/xiangmu.png")
        },
        {
          name: '项目执行',
          image: require("../../Ace/base/accessIcon/zhixing.png")
        },
        {
          name: '作废申请',
          image: require("../../Ace/base/accessIcon/zuofei.png")
        },
        {
          name: '整改管理',
          image: require("../../Ace/base/accessIcon/zhenggai.png")
        },
        {
          name: '问责管理',
          image: require("../../Ace/base/accessIcon/zhenggai.png")
        },
        {
          name: '档案下载申请',
          image: require("../../Ace/base/accessIcon/dangan.png")
        },
        {
          name: '档案下载列表',
          image: require("../../Ace/base/accessIcon/dangan.png")
        },
        {
          name: '调度流程',
          image: require("../../Ace/base/accessIcon/diaodu.png")
        },
        {
          name: '调度管理',
          image: require("../../Ace/base/accessIcon/diaodu.png")
        },
        {
          name: '调度任务监控',
          image: require("../../Ace/base/accessIcon/diaodu.png")
        },
        {
          name: '调度配置',
          image: require("../../Ace/base/accessIcon/diaodu.png")
        },
        {
          name: '业务场景维护',
          image: require("../../Ace/base/accessIcon/yewu.png")
        },
        {
          name: '业务属性维护',
          image: require("../../Ace/base/accessIcon/yewu.png")
        },
        {
          name: '数据表注册',
          image: require("../../Ace/base/accessIcon/shuju.png")
        },
        {
          name: '数据角色',
          image: require("../../Ace/base/accessIcon/shuju.png")
        },
        {
          name: '用户资源查询',
          image: require("../../Ace/base/accessIcon/yonghu.png")
        },
        {
          name: '数据字典维护',
          image: require("../../Ace/base/accessIcon/shuju.png")
        },
        {
          name: '表关系管理',
          image: require("../../Ace/base/accessIcon/guanxi.png")
        },
        {
          name: '数据资源目录',
          image: require("../../Ace/base/accessIcon/shuju.png")
        },
        {
          name: '审计模型',
          image: require("../../Ace/base/accessIcon/moxing.png")
        },
        {
          name: '模型参数',
          image: require("../../Ace/base/accessIcon/moxing.png")
        },
        {
          name: '模型结果',
          image: require("../../Ace/base/accessIcon/moxing.png")
        },
        {
          name: '图形化工具',
          image: require("../../Ace/base/accessIcon/gongju.png")
        },
        {
          name: 'SQL编辑器',
          image: require("../../Ace/base/accessIcon/gongju.png")
        },
        {
          name: '审计分析',
          image: require("../../Ace/base/accessIcon/shenji.png")
        },
        {
          name: '审计预警',
          image: require("../../Ace/base/accessIcon/yujing.png")
        },
        {
          name: '预警结果',
          image: require("../../Ace/base/accessIcon/yujing.png")
        },
        {
          name: '被审计机构',
          image: require("../../Ace/base/accessIcon/jigou.png")
        },
        {
          name: '被审计机构统计',
          image: require("../../Ace/base/accessIcon/jigou.png")
        },
        {
          name: '领导干部',
          image: require("../../Ace/base/accessIcon/lingdao.png")
        },
        {
          name: '领导干部查询',
          image: require("../../Ace/base/accessIcon/lingdao.png")
        },
        {
          name: '领导干部统计',
          image: require("../../Ace/base/accessIcon/lingdao.png")
        },
        {
          name: '工程项目',
          image: require("../../Ace/base/accessIcon/gongcheng.png")
        },
        {
          name: '工程项目查询',
          image: require("../../Ace/base/accessIcon/gongcheng.png")
        },
        {
          name: '业务产品',
          image: require("../../Ace/base/accessIcon/yewu.png")
        },
        {
          name: '业务产品查询',
          image: require("../../Ace/base/accessIcon/yewu.png")
        },
        {
          name: '业务产品统计',
          image: require("../../Ace/base/accessIcon/yewu.png")
        },
        {
          name: '审计手册',
          image: require("../../Ace/base/accessIcon/shenji.png")
        },
        {
          name: '审计手册查询',
          image: require("../../Ace/base/accessIcon/shenji.png")
        },
        {
          name: '临时审计手册',
          image: require("../../Ace/base/accessIcon/shenji.png")
        },
        {
          name: '业务分类',
          image: require("../../Ace/base/accessIcon/yewu.png")
        },
        {
          name: '问题词条',
          image: require("../../Ace/base/accessIcon/yujing.png")
        },
        {
          name: '问题词条查询',
          image: require("../../Ace/base/accessIcon/yujing.png")
        },
        {
          name: '培训管理',
          image: require("../../Ace/base/accessIcon/peixun.png")
        },
        {
          name: '培训查询',
          image: require("../../Ace/base/accessIcon/peixun.png")
        },
        {
          name: '法律法规',
          image: require("../../Ace/base/accessIcon/falv.png")
        },
        {
          name: '制度依据',
          image: require("../../Ace/base/accessIcon/falv.png")
        },
        {
          name: '基础代码管理',
          image: require("../../Ace/base/accessIcon/jichu.png")
        },
        {
          name: '基础数据管理',
          image: require("../../Ace/base/accessIcon/jichu.png")
        },
        {
          name: '假期管理',
          image: require("../../Ace/base/accessIcon/jiaqi.png")
        },
        {
          name: '公告管理',
          image: require("../../Ace/base/accessIcon/gonggao.png")
        },
        {
          name: '公告查阅',
          image: require("../../Ace/base/accessIcon/gonggao.png")
        },
        {
          name: '审计机构管理',
          image: require("../../Ace/base/accessIcon/jigou.png")
        },
        {
          name: '审计人员管理',
          image: require("../../Ace/base/accessIcon/yonghu.png")
        },
        {
          name: '审计机构辖区管理',
          image: require("../../Ace/base/accessIcon/jigou.png")
        },
        {
          name: '被审计机构查询',
          image: require("../../Ace/base/accessIcon/jigou.png")
        },
        {
          name: '被审计部门查询',
          image: require("../../Ace/base/accessIcon/jigou.png")
        },
        {
          name: '被审计人员查询',
          image: require("../../Ace/base/accessIcon/yonghu.png")
        },
        {
          name: '项目阶段管理',
          image: require("../../Ace/base/accessIcon/xiangmu.png")
        },
        {
          name: '项目阶段结束条件管理',
          image: require("../../Ace/base/accessIcon/xiangmu.png")
        },
        {
          name: '项目查询权限',
          image: require("../../Ace/base/accessIcon/xiangmu.png")
        },
        {
          name: '监管常规项目管理',
          image: require("../../Ace/base/accessIcon/xiangmu.png")
        },
        {
          name: '服务监控',
          image: require("../../Ace/base/accessIcon/jiankong.png")
        },
        {
          name: '数据源监控',
          image: require("../../Ace/base/accessIcon/jiankong.png")
        }
      ],
      latelyInImgList:[]
    }
  },
  mounted(){
    //最近使用 功能
    let arry = []
    let arryV = []
    arry = JSON.parse(localStorage.getItem('userid'))
    for(let i = 0 ; i < arry.length ; i++){
      arryV.push(arry[i].v)
    }
    arryV.sort(function(num1,num2){
      return num1-num2;
    })
    for(let x=1;x<50;x++){
      let Num= eval(arryV[arryV.length-x]);
      for(let i=0; i<arry.length; i++){
        if(arry[i].v == Num && arry[i].p != ''){
          if(this.latelyUseList.indexOf(arry[i].k) == -1) {
            this.latelyPathList.push(arry[i].p)
            this.latelyUseList.push(arry[i].k)
            for(let c=0;c<this.latelyImgList.length;c++){
              if(arry[i].k == this.latelyImgList[c].name){
                this.latelyInImgList.push(this.latelyImgList[c].image)
              }
            }
            break
          }

        }
      }
      console.log(this.latelyInImgList)
      if(this.latelyUseList.length>=5){
        break
      }
    }
  },
  methods: {
    // theRouting(){
    //   this.$router.push({ path: this.latelyPathList })
    //   this.$store.commit('aceState/setRightFooterTags', {
    //     type: 'active',
    //     val: {
    //       name: item.name,
    //       path: item.path
    //     }
    //   })
    // }
    theRouting() {
      console.log(this.latelyPathList)
      console.log(this.item)
    }
  }
}
</script>

<style lang="scss" scoped>
#use-zy{
  width:20%;
  margin:8px 0 2px 2px;
  padding:25px;
}
#use-zyt{
  width:20%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  margin:0 2px;
  height:24px;
}
.tools-template {
  background: rgba(0, 0, 0, 0.5);

  .info-box {
    background: #fcf4f1;
    border-radius: 6px;
    width: 288px;
    height: 64px;
    top: 17px;
    right: 14px;
    padding: 8px 12px 28px 12px;
    .info-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: grey;
      margin-right: 12px;
    }
    .msg {
      font-family: Helvetica;
      font-size: 15px;
      color: #212b36;
      letter-spacing: 0;
      line-height: 20px;
    }
    .icon-close {
      width: 36px;
      height: 36px;
      font-size: 20px;
      color: #637381;
      text-align: center;
      line-height: 36px;
      &:hover {
        opacity: 0.6;
      }
    }
  }
  .new-time-wrap {
    right: 167px;
    top: 50%;
    margin-top: -40px;
    height: 80px;
  }
  .tools-content {
    background: #2a2e37;
    box-shadow: 0 40px 80px 0 rgba(0, 0, 0, 0.25);
    border-radius: 1px 46px 1px 1px;
    width: 510px;
    padding: 25px 20px;
    .btns-wrap {
      right: 9px;
      top: 186px;
      color: #8691A2;
      font-size: 16px;
      .btn-box {
        background: #353a43;
        border-radius: 3px;
        margin-bottom: 10px;
        width: 30px;
        height: 30px;
      }
      .btn-box1{
        background: #353a43;
        border-radius: 3px;
        width: 30px;
        height: 60px;
        justify-content: space-around;
      }
    }
    .title-label {
      font-family: PingFangSC-Semibold;
      font-size: 12px;
      color: #ffffff;
      letter-spacing: 0;
    }
    .title {
      font-family: BebasNeue;
      font-size: 16px;
      color: #ffffff;
      letter-spacing: 0;
      .label {
        margin-left: 6px;
        display: inline-block;
      }
    }
    .lately-use {
      margin-top: 23px;
      &-box {
        margin-top: 11px;
        .use-box {
          box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.1);
          border-radius: 12.6px;
          width: 67.2px;
          height: 67.2px;
          font-size: 30px;
          margin-right: 15.8px;
          color: white;
          &-add {
            border: 1px solid #454c58;
            color: #454c58;
          }
        }
      }
    }
    .other-tools {
      margin-top: 24px;
      margin-bottom: 21px;
      &-box {
        margin-top: 11px;
        padding-top: 9px;
        flex-wrap: wrap;
        .tools-box {
          border: 1px solid #454c58;
          box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          width: 136px;
          height: 90px;
          padding: 0 14px;
          margin-top: 11px;
          &:not(:nth-child(3n)) {
            margin-right: 9px;
          }
          &-icon {
            font-size: 29px;
            color: #eaeaea;
          }
          &-name {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: #eaeaea;
            line-height: 12px;
            display: inline-block;
            margin-top: 14.5px;
          }
        }
      }
    }
    .newest-item {
      width: 426px;
      &-box {
        margin-top: 20px;
        border: 1px solid #454c58;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        padding: 13px 40px;
        &-title {
          font-family: PingFangSC-Regular;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 24px;
        }
        &-content {
          .content-left {
            font-family: BebasNeue;
            font-size: 56px;
            color: #ffffff;
            line-height: 64px;
            margin-right: 26px;
          }
          .content-right {
            .right-p1 {
              font-family: PingFangSC-Regular;
              font-size: 18px;
              color: white;
              line-height: 32px;
            }
            .right-p2 {
              font-family: PingFangSC-Semibold;
              font-size: 14px;
              color: rgba(255, 255, 255, 0.5);
              line-height: 24px;
            }
          }
        }
      }
    }
  }
}
</style>
