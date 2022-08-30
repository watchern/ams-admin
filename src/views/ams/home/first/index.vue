<template>
  <div class="home w100 h100 flex a-center j-start flex-column">
    <div class="top flex j-between">
      <div class="index-title">
        <p class="hi">Hi！</p>
        <p class="welcome"><span class="bold">欢迎进入</span>智慧审计系统</p>
      </div>
      <div class="time">
        <!--<p class="date1">2020年4月18日</p>
        <p class="date2">10：55<span class="week">周一</span></p>-->
        <p class="date1" >{{currDateText}}</p>
        <p class="date2" >{{currTimeText}}<span class="week" >{{currWeekText}}</span></p>
      </div>
    </div>
    <div class="content-box flex j-between">
      <div class="index-content flex">
        <div class="index-item">
          <el-card class="box-card project-card card-style">
            <!-- 项目统计 -->
            <div class="project-statistics project-item"> 
              <div class="leftArrow">
                <img src="../../../../assets/img/leftArrow.png" @click="arrowClick('right')" />
              </div>
              <el-carousel :interval="2000" arrow="never" :autoplay="false" indicator-position="none" ref="cardShow">
                <!-- <el-carousel-item v-for="item in 4" :key="item">
                </el-carousel-item> -->
                <el-carousel-item>
                  <div class="statistics-box">
                    <p class="title">
                      <span class="name">项目统计</span>
                      <!-- <span class="more"><i class="el-icon-more"></i></span> -->
                      <!-- <img src="../../../../assets/img/more.png" alt=""> -->
                    </p>
                    <div class="content flex j-center a-center">
                      <div class="project-num-style">
                       
                        <div class="project-middle-bj">
                          <!-- <div class="project-Vertical-style">
                            <span class="project-circle-style"></span>
                          </div> -->
                         
                          <div class="inner-circle">
                            <div class="project-num-box">
                              <!-- 项目数最多显示三位数 -->
                              <p class="project-num" v-if="projectList.length < 999">{{projectList.length }}</p>
                              <p class="project-num" v-else>999</p>
                              <p class="project-text">项目总数</p>
                            </div>
                          </div>
                        </div>
                       
                       
                      </div>
                    </div>
                  </div>
                </el-carousel-item>

              </el-carousel>
              <div class="rightArrow">
                <img src="../../../../assets/img/rightArrow.png" @click="arrowClick('right')" />
              </div>
            </div>
            <!-- 我的项目 -->
            <div class="my-project project-item">
              <p class="title">
                <span class="name">我的项目{{projectList.length>0 && `/${projectList.length}` || ''}}</span>
                <!-- <span class="more" @click="jumptTo('allProject')"><i class="el-icon-more"></i></span> -->
                <span class="more" @click="jumptTo('allProject')"><img src="../../../../assets/img/more.png" alt="" class="more-icon"></span>
              </p>
              <div class="project-content-box" v-loading="projectLoading">
                <div class="content flex">
                  <div class="project-list" v-for="(item, key) in projectList" :key="key">
                    <div class="project-list-style">
                      <div class="project-top">
                        <p class="project-name m-ellipsis" @click="jumptTo('singleProject', item)">{{item.projectName}}</p>
                        <!-- <p class="project-time">{{item.createTime}}</p> -->
                      </div>
                      <div class="cost-box flex j-between">
                        <div class="circle-dot" :class="{'project-status-0': item.exeStatus == 0,'project-status-1': item.exeStatus == 1,'project-status-2': item.exeStatus == 2,'project-status-3': item.exeStatus == 3,'project-status-4': item.exeStatus == 4,'project-status-5': item.exeStatus == 5,'project-status-5': !item.exeStatus || item.projectExt1 == '归档结项' }"></div>
                        <!-- <div class="cost-num">
                          <p class="people-num cost-style">23<span>人</span></p>
                          <p class="cost-text cost-style">84.23<span>万</span></p>
                        </div> -->
                        <div class="project-status"  :class="{'project-status-0': item.exeStatus == 0,'project-status-1': item.exeStatus == 1,'project-status-2': item.exeStatus == 2,'project-status-3': item.exeStatus == 3,'project-status-4': item.exeStatus == 4,'project-status-5': item.exeStatus == 5,'project-status-5': !item.exeStatus || item.projectExt1 == '归档结项'  }">
                          <p class="project-time">{{item.createTime}}</p>
                          <p class=" m-ellipsis" >{{item.dealExeStatus}}</p>
                        </div>
                      
                      </div>

                    </div>
                   
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
        <div class="index-item">
          <!-- 监控预警 -->
          <div class="monitor-warning func-item">
            <el-card class="box-card func-card card-style">
              <p class="title">
                <span class="name">监控预警</span>
                <span class="more" @click="jumpWarningresult"><img src="../../../../assets/img/more.png" alt="" class="more-icon"></span>
              </p>
              <div class="warning-box " v-loading="auditEarlyWarningLoading">
                <div class="warning-item flex j-between a-center" v-for="(item, index) in auditEarlyWarningList" :key="index">
                  <div class="warning-left">
                    <p class="warning-text s-ellipsis c-pointer" @click="jumpToWarningresult(item)">{{item.model.modelName}}</p>
                    <p class="warning-date">{{item.dealRunStartTime}}</p>
                  </div>
                  <div :class="['warning-right', (item.runStatus == 1|| item.runStatus == 2||item.runStatus == 3)? 'warning-success':'warning-error']">
                    <!-- <i class="el-icon-caret-bottom"></i> -->
                    <span class="warning-num" v-if="item.runStatus == 3">{{item.runResultTables[0].dataCount}}</span>
                    <span class="warning-num" v-else-if="item.runStatus == 1|| item.runStatus == 2">{{0}}</span>
                    <span class="warning-num" v-else>失败</span>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
          <!-- 常用功能 -->
          <div class="Common-func func-item">
            <el-card class="box-card func-card card-style">
              <p class="title">
                <span class="name">常用功能</span>
                <!-- <span class="more"><i class="el-icon-edit"></i></span> -->
                <img src="../../../../assets/img/edit-icon.png" alt="" class="function-icon" @click="editFuncClick">
              </p>
              <toolsTemplateAdd ref="toolsTemplateAdd" :editFuncFlag="editFuncFlag"></toolsTemplateAdd>
            </el-card>
          </div>
        </div>
        <div class="index-item my-agency" >
          <!-- 我的代办 -->
          <el-card class="box-card  card-style" v-if="activeName == 0">
            <p class="title">
              <span class="name">我的待办<span v-if="toDoList.length>0">/{{toDoList.length}}</span></span>
              <span class="more" @click="tabMoreClick"><img src="../../../../assets/img/more.png" alt="" class="more-icon"></span>
            </p>
            <div class="agency-box" v-loading="toDoLoading">
              <!-- <div class="axis-box">
                <img src="" alt="">
              </div>
              <div class="axiscontent-box"></div> -->
              <div class="axis-item flex " v-for="(item, key) in  toDoList" :key="key">
                <div class="axis-left">
                  <!-- <el-avatar :size="50" shape="square" :src="userLogo"></el-avatar> -->
                  <img class="user-logo" src="../../../../assets/img/user.png" alt="">
                  <p class="agency-name">{{item.createPersonName}}</p>
                  <p class="agency-stage">上一办理人</p>
                  <p class="axis-line" v-if="toDoList.length>1  && key != toDoList.length-1"></p>
                </div>
                <div class="axis-right">
                  <p class="agency-brief">
                    <span class="agency-date">{{item.dealApplydate}}</span>
                    <span class="agency-type s-ellipsis">{{item.TEMP4}}</span>
                  </p>
                  <p class="agency-name m-ellipsis">{{item.applyTitle}}</p>
                  <div class="agencydeal-btn" @click="toHandleClick(item)">前去处理<i class="el-icon-right"></i></div>
                </div>
              </div>


            </div>

          </el-card>
          <!-- 我的已办 -->
          <el-card class="card-style" v-if="activeName == 1">
            <p class="title">
              <span class="name">我的已办<span v-if="doneList.length>0">/{{doneList.length}}</span></span>
              <span class="more" @click="tabMoreClick"><img src="../../../../assets/img/more.png" alt="" class="more-icon"></span>
            </p>
            <div class="agency-box" v-loading="doneLoading">
              <div class="axis-item flex " v-for="(item, key) in  doneList" :key="key">
                <div class="axis-left">
                  <img class="user-logo" src="../../../../assets/img/user.png" alt="">
                  <p class="agency-name">{{item.createPersonName}}</p>
                  <p class="agency-stage">上一办理人</p>
                  <p class="axis-line" v-if="doneList.length>1 && key != doneList.length-1 "></p>
                </div>
                <div class="axis-right">
                  <p class="agency-brief">
                    <span class="agency-date">{{item.dealApplydate}}</span>
                    <span class="agency-type s-ellipsis">{{item.TEMP4}}</span>
                  </p>
                  <p class="agency-name m-ellipsis">{{item.applyTitle}}</p>
                  <div class="agencydeal-btn" @click="toHandleClick(item)">前去处理<i class="el-icon-right"></i></div>
                </div>
              </div>
            </div>
          </el-card>
          <!-- 消息列表 -->
          <el-card class="card-style" v-if="activeName == 2">
            <p class="title">
              <span class="name">消息列表<span v-if="LatestNewsList.length>0">/{{LatestNewsList.length}}</span></span>
              <span class="more" @click="tabMoreClick"><img src="../../../../assets/img/more.png" alt="" class="more-icon"></span>
            </p>
            <div class="agency-box" v-loading="LatestNewsLoading">
                <div class="axis-item flex" v-for="(item, key) in LatestNewsList" :key="key">
                  <div class="axis-left">
                    <img class="user-logo" src="../../../../assets/img/user.png" alt="">
                    <p class="agency-name">{{item.remindedUserName}}</p>
                    <!-- <p class="agency-stage">上一办理人</p> -->
                    <p class="axis-line" v-if="LatestNewsList.length>1 && key != LatestNewsList.length-1"></p>
                  </div>
                  <div class="axis-right">
                    <p class="agency-brief" >
                      <span class="agency-date">{{item.dealRemindTime}}</span>
                      <span class="agency-type s-ellipsis">{{item.moduleName}}</span>
                    </p>
                    <p class="agency-name m-ellipsis c-pointer" @click="openNewsListDia(item)">{{item.remindTitle}}</p>
                    <div class="agencydeal-btn c-pointer" v-if="item.modeUrl" @click="toHandleClick(item, 'newsList')">前去处理<i class="el-icon-right"></i></div>
                  </div>
                </div>
            </div>
          </el-card>
        </div>
      </div>
      <div class="tabs">
        <div class="tabs-item" :class="[activeName === 0 && 'tabs-item-active']" @click="handleyTabClick(0)">
          <p><img src="../../../../assets/img/my-agent.png" alt=""></p>
          <span>我的待办</span>
        </div>
        <div class="tabs-item" :class="[activeName === 1 && 'tabs-item-active']" @click="handleyTabClick(1)">
          <p><img src="../../../../assets/img/my-alreadydone.png" alt=""></p>
          <span>我的已办</span>
        </div>
        <div class="tabs-item" :class="[activeName === 2 && 'tabs-item-active']" @click="handleyTabClick(2)">
          <p><img src="../../../../assets/img/message-list.png" alt=""></p>
          <span>消息列表</span>
        </div>
      </div>

    </div>
    <el-dialog
      v-model="temp"
      :append-to-body="true"
      :visible.sync="dialogFormVisible"
      top="10vh"
      title="消息详情"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-row>
        <el-col :span="24"><div class="visible-p1">
          {{ this.temp.remindTitle }}
        </div></el-col>
      </el-row>
      <el-divider />
      <el-row>
        <el-col :span="12"><div class="visible-p2">
          提醒时间: {{ this.temp.remindTime }}
        </div></el-col>
        <el-col :span="12" v-if="temp.remindUserName" ><div class="visible-p4">
          发送人：{{ this.temp.remindUserName }}
        </div></el-col>
      </el-row>
      <el-row>
        <el-col :span="24"><div class="visible-p3">
          {{ this.temp.remindContent }}
        </div></el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { getRemindByDescTime, updateRemind } from "@/api/base/base";
import { getprojectPage, getapplyMesList } from '@/api/project/project.js'
import { getRunTaskRelByPage } from "@/api/analysis/auditmodelresult";
import dayjs from 'dayjs'
import toolsTemplateAdd from "@/components/public/base/tools-template-add.vue"
import { getQuickMenuList } from "@/api/base/quickmenu";
// import userLogo from '@/assets/img/user.png'
export default {
  components: {
    toolsTemplateAdd
  },
  data() {
    return {
      currDateText:'2020年4月18日',
      currTimeText:'10 : 55',
      currWeekText:'周一',
      resultSpiltObjects: {},
      pageQuery: {
        condition: {},
        pageNo: 1,
        pageSize: 5,
      },
      dialogFormVisible: false,
      activeName: 0, // 代办、已办、消息列表显示标识
      auditEarlyWarningList:[], // 审计预警列表
      auditEarlyWarningLoading: false,
      addFuncClick:false,
      LatestNewsList: [], // 最新消息列表
      toDoList: [], // 待办列表
      doneList: [], // 已办列表
      projectList: [], // 我的项目列表
      projectLoading: false, // 我的项目加载状态
      toDoLoading: false, // 待办加载状态
      doneLoading: false, //已办加载状态
      LatestNewsLoading: false,// 消息列表加载状态
      editFuncFlag: false, // 是否编辑常用功能
      timer: null, // 定时更新待办列表
      temp: {
        remindUuid: '',
        remindTitle: '',
        remindContent: '',
        modeUrl: '',
        moduleName: '',
        remindUserUuid: '',
        remindUserName: '',
        remindTime: '',
        readStatus: '',
        remindedUserUuid: '',
        remindedUserName: '',
        remindedType: ''
      },

    };
  },
  created() {
    // 刷新当前时间
    this.refreshTime();
    // 定时刷新待办列表
    this.refreshTodoList();
  },
  mounted() {
    // 获取项目列表
    this.getMyProjectPage();
    // 获取最新创建消息列表
    this.getRemindByDescTime();
    // 获取待办列表
    this.getToDoList();
    // 获取已办列表
    this.getDoneList();
    let query1 = { runTaskUuid: null };
    query1.runTaskUuid = "1";
    this.pageQuery.condition = query1;
    this.auditEarlyWarningLoading = true
    getRunTaskRelByPage(this.pageQuery, this.resultSpiltObjects).then(
      (resp) => {
        this.auditEarlyWarningLoading = false
        this.auditEarlyWarningList = resp.data.records
        this.auditEarlyWarningList.map(i => {
          i.dealRunStartTime = dayjs(i.runStartTime).format('YYYY/MM/DD')
          i.url = `/analysis/warningresult/${i.runTaskUuid}`;
          i.Uuid = i.runTaskUuid;
          if (i.runStatus == 1) {
            i.iconStatus = "el-icon-video-play"
            i.iconColor = "blue"
          } else if (i.runStatus == 2) {
            i.iconStatus = "el-icon-loading"
            i.iconColor = "#666666"
          } else if (i.runStatus == 3) {
            i.iconStatus = "el-icon-success"
            i.iconColor = "green"
          } else if (i.runStatus == 5) {
            i.iconStatus = "el-icon-circle-close"
            i.iconColor = "#ff0000"
          } else {
            i.iconStatus = "el-icon-error"
            i.iconColor = "red"
          }
        })
        // 监控预警截取前两条数据
        this.auditEarlyWarningList = this.auditEarlyWarningList.slice(0, 2);
      }
    );
    // this.gettodowork()
    // 获取功能列表
    
  },
  destroyed () {
    clearInterval(this.timer);
  },
  methods: {
    // 刷新当前时间
    refreshTime() {
      this.getNowTime()
      var _this = this;
      setInterval(function () {
        _this.getNowTime()
      },100)
    },
    getNowTime(){
      var currTime = new Date()
      this.currDateText = dayjs(currTime).format('YYYY年MM月DD日')
      this.currTimeText = dayjs(currTime).format('HH : mm')
      this.currWeekText = dayjs(currTime).day()
      switch (this.currWeekText) {
        case 1:this.currWeekText="周一"; break;
        case 2:this.currWeekText="周二"; break;
        case 3:this.currWeekText="周三"; break;
        case 4:this.currWeekText="周四"; break;
        case 5:this.currWeekText="周五"; break;
        case 6:this.currWeekText="周六"; break;
        case 7:this.currWeekText="周日"; break;
        default:this.currWeekText="--"; break;
      }
    },
    handleyTabClick (ind) {
      // 0 我的代办 1 我的已办  2 消息列表
      this.activeName = ind;
    },
    // 监控预警更多点击跳转事件
    jumpWarningresult () {
      this.$router.push({ path: "/analysis/auditwarning" });
      this.$store.commit("aceState/setRightFooterTags", {
        type: "active",
        val: {
          name: "预警结果",
          path: "/analysis/warningresult",
        },
      });
    },
    jumptTo (type, item) {
      if (type == 'allProject') {
        this.$router.push({ path: "/base/frameto?url=/amis/workBench/toProjectList" });
      } else if (type == 'singleProject') {
        this.$router.push({ path: `/base/frameto?url=/amis/projectWorkBench/projectWorkBench?projectuuid=${item.projectuuid}`});
      }
     
    },
    // 新增功能
    addFunction () {
      this.addFuncClick = true;
      this.$refs.toolsTemplateAdd.showTools()
    },
    // 转换项目阶段字段
    dealExeStatus (exeStatus) {
      if (exeStatus == 0) {
        return '立项阶段'
      } else if (exeStatus == 1) {
        return '审前准备'
      } else if (exeStatus == 2) {
        return '现场审计'
      } else if (exeStatus == 3) {
        return '报告阶段'
      } else if (exeStatus == 4) {
        return '意见出具'
      } else if (exeStatus == 5) {
        return '档案管理'
      } else if (exeStatus == 6) {
        return '项目结束'
      } else {
        return '';
      }

    },
    // 获取项目列表
    getMyProjectPage () {
      this.projectLoading = true;
      let ProjectQueryData = new FormData();
      ProjectQueryData.append('pageSize', 15);
      getprojectPage(ProjectQueryData).then((res) => {
        this.projectLoading = false;
        this.projectList = res.body.result;
        this.projectList.map(i => {
          i.createTime = dayjs(i.createTime).format('YYYY-MM-DD');
          i.dealExeStatus = this.dealExeStatus(i.exeStatus);
          i.dealExeStatus = this.CommonUtil.isBlank(i.dealExeStatus) ? i.projectExt1 : i.dealExeStatus;
        })
      })
    },
    // 获取最新消息列表
    getRemindByDescTime () {
      this.LatestNewsLoading = true;
      getRemindByDescTime().then((resp) => {
        this.LatestNewsLoading = false;
        this.LatestNewsList = resp.data.records;
        this.LatestNewsList.map(i => {
          i.dealRemindTime = dayjs(i.remindTime).format('YYYY-MM-DD hh:mm:ss')
        })
      });
    },
    // 获取待办列表
    getToDoList(isLoading) {
      if (!isLoading) {
        this.toDoLoading = true;
      }
      let toDoQueryData = new FormData();
      toDoQueryData.append('pageSize', 999)
      getapplyMesList(toDoQueryData).then((res) => {
        this.toDoLoading = false;
        this.toDoList = res.body.result;
        this.$store.commit("aceState/changeToDoNum", this.toDoList.length);
        this.toDoList.map(i => {
          i.dealApplydate = dayjs(i.applydate).format('YYYY-MM-DD hh:mm:ss')
        })
      })
    },
    getDoneList () {
      this.doneLoading = true;
      let toDoQueryData = new FormData();
      toDoQueryData.append('pageSize', 999)
      getapplyMesList(toDoQueryData, 'done').then((res) => {
        this.doneLoading = false;
        this.doneList = res.body.result;
        this.doneList.map(i => {
          i.dealApplydate = dayjs(i.applydate).format('YYYY-MM-DD hh:mm:ss')
        })
      })
    },
    // 我的待办、已办、消息列表 更多页面跳转
    tabMoreClick () {
      if (this.activeName == 2) { // 消息列表
        this.$router.push({ path: '/base/remind' });
      } else { // 已办、待办
        this.$router.push({ path: "/base/frameto?url=%2Famis%2FworkBench%2FtoApplyMes" });
      }
    },
    // 前去办理
    toHandleClick (item, type) {
      if (type) {
        this.$router.push({ path: item.modeUrl });
        return;
      }
      var isOA='';
      var ctx = '/base/frameto?url=/amis/';
      var ApplyFuns = {

        //跳到用印申请界面(审计通知书)
        toSeapplyApplyState: function (obj) {
          return ctx + "auditnotice/index?projectuuid=" + obj["TEMP2"] + "&isOA=" + isOA;
        },
        //审计报告
        toSeapplyReport: function (obj) {
          return ctx + "seApply/addSeApplyForOther?dataUuid=" + obj["TEMP5"] + "&addType=5&projectuuid=" + obj["TEMP2"] + "&isOA=" + isOA;
        },
        //整改认定
        toAddRectifyCognizance: function (obj) {
          return ctx + "pmRectifyCognizance/toCognizace?pmProblemUuid=&pmRectifyUuid=" + obj["TEMP5"] + "&isOA=" + isOA;
        },
        //处分执行
        toAddExePunishment: function (obj) {
          return ctx + "exePunishment/toAdd?acPunishmentUuid=" + obj["TEMP5"] + "&isFromProject=" + "&isOA=" + isOA;
        },
        //跳到用印页面
        toSeapplyLoad: function (obj) {
          return ctx + "seApply" + '/toSealManager?id=' + obj["TEMP5"] + "&isOA=" + isOA;
        },
        //跳到整改信息页面
        toRectifyInfo: function (obj) {
          var projectUuid = obj["TEMP2"];
          var problemUuid = obj["TEMP5"];
          return ctx + "pmRectify/toList?projectUuid=" + projectUuid + "&problemUuid=" + problemUuid + "&isOA=" + isOA;
        },
        //跳到整改信息页面
        toRectifyInfoff: function (obj) {
          var problemUuid = obj["TEMP5"];
          problemUuid = problemUuid.substring(0, problemUuid.length - 1);
          return ctx + "pmRectify/toAdd?pmProblemUuid=" + problemUuid + "&isOA=" + isOA;
        },
        // 跳到分析录入信息页面
        toAddAnalysisInfo: function (obj) {
          var pmWorkDivideUuid = obj["TEMP5"];
          return ctx + "analysisResult/toAddAnalysisInfo?pmWorkDivideUuid=" + pmWorkDivideUuid + "&isOA=" + isOA;
        },
        toAuditedInfo: function (obj) {
          var pmAnalysisResultUuid = obj["TEMP5"];
          return ctx + "doubtAnalysisVerify/toAdd?id=" + pmAnalysisResultUuid + "&isOA=" + isOA;
        },
        //跳到监印页面
        toSeapplyLoadJY: function (obj) {
          var seApplyUuid = obj["TEMP5"];
          return ctx + "seApply" + '/toKeepSealManager?id=' + seApplyUuid + "&isOA=" + isOA;
        },
        //跳到分析列表
        toAnaLysisList: function (obj){
          return ctx + "analysisResult/index?projectuuid="+obj["TEMP2"]+"&isOA="+isOA;
        },
        //跳到核实列表
        toVerifyList:function (obj){
          return ctx + "verifyResult/index?projectuuid="+obj["TEMP2"]+"&isOA="+isOA;
        },
        //跳到被审计机构列表
        toDoubetVerifyList: function (obj){
          return ctx + "doubtAnalysisVerify/toList?projectuuid="+obj["TEMP2"]+"&isOA="+isOA;
        },
        //跳转到疑点认定列表页
        toVerifyConfirmList: function (obj){
          return ctx + "PmVerifyResultConfirm/index?projectuuid="+obj["TEMP2"]+"&isOA="+isOA;
        },
        //审批页面
        toApplyState: function (obj){

          var applyUuid = obj["applyUuid"];
          //$('#applyUuid').val(applyUuid);
          var workEffortId = obj["workEffortId"];
          //$('#workEffortId').val(workEffortId);
          var workflowActivityId = obj["workflowActivityId"];
          //$('#workflowActivityId').val(workflowActivityId);
          var workflowActivityName = obj["workflowActivityName"];
          //$('#workflowActivityName').val(workflowActivityName);
          var projectUuid = obj["projectUuid"];
          //$('#projectUuid').val(projectUuid);
          var stringEx6 = obj["stringEx6"];
          //$('#stringEx6').val(stringEx6);
          var comments = obj["comments"];
          //$('#comments').val(comments);
          var applyType = obj["applyType"];
          //$('#applyType').val(applyType);
          var applyTitle = obj["applyTitle"];

          var workflowProcessId = obj["workflowProcessId"];
          //$('#processId').val(workflowProcessId);
          ApplyFuns.processAccept(workEffortId);
          return ctx +"workBench/auditApplyMes?applyUuid="+applyUuid+"&workEffortId="+workEffortId+"&workflowActivityId="+workflowActivityId+"&workflowActivityName="+workflowActivityName+"&projectUuid="+projectUuid+"&stringEx6="+stringEx6+"&comments="+comments+"&applyType="+applyType+"&applyTitle="+applyTitle+"&processId="+workflowProcessId+"&isOA="+isOA;
        },
        /**
         *接收待办事项
         */
        processAccept: function (workEffortId){
          // $.ajax({
          //   type: 'post',
          //   url: contextPath+"/applyMes/processAccept",
          //   dataType: "text",
          //   data:{workEffortId:workEffortId},
          //   success: function(data) { // data 保存提交后返回的数据，一般为 json 数据
          //   },
          //   error: function(data) {
          //   }
          // });
        }
      }

      var url = '';
      // var d = item.applyUuid+','+item.workEffortId+','+item.workflowActivityId+','+item.workflowActivityName+','+item.projectUuid+','+item.stringEx6+','+item.comments+','+item.applyType+','+item.workflowProcessId;
      // var d = "'"+d+"'";
      var state = item.newApplyState;
      switch (state) {
        case '99': // 审计通知书
            url = ApplyFuns.toSeapplyApplyState(item);
            break;
          case '98': // 审计报告
            url = ApplyFuns.toSeapplyReport(item);
            break;
          case '97': //用印审批
            url = ApplyFuns.toSeapplyLoad(item);
            break;
          case '96': //监印审批
            url = ApplyFuns.toSeapplyLoadJY(item);
            break;
          case '88': // 整改认定
            url = ApplyFuns.toAddRectifyCognizance(item);
            break;
          case '87': // 整改认定
            url = ApplyFuns.toAddExePunishment(item);
            break;
          case '50': // 整改代办提醒
            url = ApplyFuns.toRectifyInfo(item);
            break;
          case '51': // 整改分发提醒
            url = ApplyFuns.toRectifyInfoff(item);
            break;
          case '60':  //分析分发提醒
            url = ApplyFuns.toAddAnalysisInfo(item);
            break;
          case '61':  // 提交被审机构提醒
            url = ApplyFuns.toAuditedInfo(item);
            break;
          case '20':   // 分析汇总提醒
          case '21':   // 分析分工汇总提醒
            url = ApplyFuns.toAnaLysisList(item);
            break;
          case '22': // 核实的代办汇总
            url = ApplyFuns.toVerifyList(item);
            break;
          case '23': // 提交被审计机构核实的提醒汇总
            url = ApplyFuns.toDoubetVerifyList(item);
            break;
          case '24': // 提交被审计机构核实的代办汇总
            url = ApplyFuns.toDoubetVerifyList(item);
            break;
          case '25': // 疑点认定的汇总待办
            url = ApplyFuns.toVerifyConfirmList(item);
            break;
          default:
            url = ApplyFuns.toApplyState(item);
            break;
      }
      this.$router.push({ path:url});
      // this.$router.push({ path: `/base/frameto?url=/amis/workBench/auditApplyMes?applyUuid=${item.applyUuid}&workEffortId=${item.workEffortId}&workflowActivityId=${item.workflowActivityId}&workflowActivityName=${item.workflowActivityName}&projectUuid=${item.projectUuid}&stringEx6=${item.stringEx6}&comments=${item.comments}&applyType=${item.applyType}&applyTitle=${item.applyTitle}&processId=${item.processId}` });
    },



    openNewsListDia (item) {
      // console.log(item, '消息列表打开弹框')
      // this.temp = item
      // this.dialogFormVisible = true
      // 点击提醒事项会直接刷新页面
      // location.reload();
      if (item.modeUrl == null || item.modeUrl == '') {
        this.temp = item
        this.dialogFormVisible = true
      } else {
        this.selectDetail(item)
      }
    },
    selectDetail(data) {
      var remindedType = data.remindedType
      var url = data.modeUrl
      this.$router.push({
        path: url
      })
    },
    //  单个预警监控跳转
    jumpToWarningresult (item) {
      this.$router.push({ path: `/analysis/warningresult/${item.runTaskUuid}` });
    },
    // 走马灯左右切换
    arrowClick (type) {
      console.log(type)
    },
    // 常用功能编辑
    editFuncClick () {
      this.editFuncFlag = !this.editFuncFlag;
    },
    // 定时刷新待办列表
    refreshTodoList () {
      this.timer = setInterval(() => {
        this.getToDoList(true);
      }, 60 * 1000);
    }
  },
};
</script>
<style lang="scss" scoped>
.homezz {
  height: calc(100vh) !important;
  background: #fff url("../../../../styles/image/bg.png") left center no-repeat !important;
  background-size: 100% 100% !important;
}
.home {
  //background: #FFFFFF;
  // background-size: 82%;
  // background-position-x: -130px;
  // background-position-y: 2px;
  // padding-bottom: 12px;
  height: 100% !important;
  padding-left: 35px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
 
  .top {
    width: 100%;
    height: 110px;
    align-items: flex-end;
    .index-title {
      text-align: left;
      margin-bottom: 30px;
    }
    .hi {
      font-family: Arial-BoldMT;
      font-size: 18px;
      color: #529ED4;
      letter-spacing: 0.39px;
      line-height: 14px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .welcome {
      font-family: PingFangHK-Semibold;
      font-size: 30px;
      color: #304469;
      letter-spacing: 0.25px;
      text-align: right;
      line-height: 32px;
      font-weight: 400;
     
      .bold {
        font-weight: 600;
      }
    }
    .time{
      padding-right: 160px;
      .date1 {
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: #4C4F51;
        letter-spacing: 9px;
        line-height: 43px;
        font-weight: 400;
        padding-left: 2px;
      }
      .date2 {
        font-family: PingFangHK-Semibold;
        font-size: 48px;
        color: #31456A;
        letter-spacing: 1.03px;
        line-height: 30px;
        font-weight: 600;
        .week {
          font-family: PingFang-SC-Bold;
          font-size: 12px;
          color: #4C4F51;
          letter-spacing: 1.71px;
          line-height: 43px;
          font-weight: 700;
          margin-left: 5px;
        }
      }
    }


  }
  .content-box {
    width: 100%;
    max-height: calc(100% - 170px);
    flex: 1;
    .index-content {
      flex: 1;
      flex-flow: row;
      .index-item {
        display: flex;
        flex-direction: column;
        margin-left: 40px;
        box-sizing: border-box;
        // flex-grow: 1;
        flex: 1;
        width: 0;
        height: 530px;
        margin-bottom: 20px;
        // height: calc(100% - 12px);
        &:first-child {
          margin-left: 0;
        }
        .project-card {
          ::v-deep .el-card__body {
            padding: 0;
            .project-item {
              height: 50%;
              width: 100%;
            }
            .project-statistics {
              height: 50% !important;
              position: relative;
              // background: #E3EDF7;
              box-shadow: -7px -5px 15px 0px rgba(255,255,255,1),7px 5px 14px 0px rgba(211,224,236,1);
              // border-radius: 10px 10px 0px 0px;
              .leftArrow,.rightArrow {
                position: absolute;
                bottom: 45px;
                cursor: pointer;
                z-index: 999;
              }
              .leftArrow {
                left: 40px;
              }
              .rightArrow {
                right: 40px;
              }
             
              // 跑马灯高度
              .el-carousel,.el-carousel__container {
                height: 100%;
              }
              // 跑马灯左右切换按钮
              .el-carousel__arrow {
                background: unset;
                border: none;
                font-size: 16px;
                color: #7da0c6;
                bottom: 45px;
                top: unset;
                .el-icon-arrow-left,.el-icon-arrow-right {
                  font-weight: 900;
                  // box-shadow: 2px -2px 2px #ccc;
                }
              }
              // 跑马灯索引
              .el-carousel__indicators {
                display: none;
              }
              .statistics-box {
                width: 100%;
                .content {
                  width: 100%;
                  text-align: center;
                  position: absolute;
                  bottom: 25px;
                  .project-num-style {
                    width: 185px;
                    height: 185px;
                    border-radius: 50%;
                    background: #e3edf7;
                    position: relative; 
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    // box-shadow: 0px 2px 40px 0px rgba(0,0,0,0.1);
                    // box-shadow: 0px 2px 40px 0px rgba(0,0,0,0.1),0 -2px 40px 0px rgba(0,0,0,0.1),2px 0 40px 0 rgba(0,0,0,0.1),-2px 0 40px 0 rgba(0,0,0,0.1);
                    box-shadow: 0px 2px 40px 3px rgba(0,0,0,0.1);
                    background: #e7c8d0;
                    //  background: radial-gradient( #fff 5%, #e9e1e8 30%, #e7c8d0 60%);
                    background: linear-gradient(to right,#f07e82 10%, #e3edf7 80%);
                    background: linear-gradient(to right bottom, #f07e82 30%, #e3edf7 50%);
                    transform: rotate(-40deg);
                    .project-middle-bj {
                      width: 170px;
                      height: 170px;
                      border-radius: 50%;
                      background: #e3edf7;
                      position: relative; 
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      background: #e7c8d0;
                      background: linear-gradient(to right bottom,#e7c8d0 16%, #e4e2eb 30%, #e3edf7 50%);
                      transform: rotate(40deg);
                      // background: linear-gradient(to right bottom, #e7c8d0 42%, #e4e2eb, #e3edf7 50%);
                      // transform: rotate(2deg);
                        background: linear-gradient(to right bottom, #e7c8d0 32%, #e3edf7 50%);
                        transform: rotate(2deg);
                    }
                    .project-Vertical-style {
                      width: 1px;
                      height: 26px;
                      position: absolute;
                      top: 0;
                      background: #e5dce5;
                      background: linear-gradient(to bottom,#e3edf7, #f2f2f5);
                      // transform: rotate(32deg);
                      // position: relative;
                      .project-circle-style {
                        width: 10px;
                        height: 10px;
                        background: #fff;
                        border-radius: 50%;
                        display: inline-block;
                        margin-top: 7px;
                        margin-left: -4.5px;

                      }

                    }
                    .inner-circle {
                      width: 120px;
                      height: 120px;
                      border-radius: 50%;
                      background: #E0EAF3;
                      box-shadow: 7px 5px 12px 0px rgba(211,224,236,1),-7px -5px 12px 0px rgba(255,255,255,1);
                      // box-shadow: 7px 5px 12px 0px rgba(211,224,236,1),-7px -1px 22px 0px rgba(255,255,255,1);
                      transform: rotate(36deg);
                    }
                    .project-num-box {
                      width: 120px;
                      height: 120px;
                    } 
                  }
                  // .project-num-style::after {
                  //   position: absolute; 
                  //   content: '';
                  //   background: linear-gradient(red, yellow);
                  //   background-image: linear-gradient(180deg, #F07E82 0%, #E3EDF7 100%);
                  //   background-image: linear-gradient(to right, #F07E82, #e0eaf3); 
                  //   bottom: 0; 
                  //   right: 0;
                  //   left: 0;
                  //   top: 0;                              //定义伪元素出现的位置
                  //   z-index: -1;
                  //   transform: scale(1.11);               //伪元素放大1.1倍
                  //   border-radius: 50%;
                  // }
                  .project-num {
                    font-family: DINCondensed-Bold;
                    font-size: 60px;
                    color: #D4000F;
                    letter-spacing: 2.4px;
                    line-height: 54px;
                    text-shadow: -1px 1px 4px #9BBBD8;
                    font-weight: 700;
                    margin-top: 28px;
                  }
                  .project-text {
                    font-family: PingFangSC-Regular;
                    font-size: 12px;
                    color: #8B94A6;
                    letter-spacing: 0.48px;
                    font-weight: 400;
                    margin-top: 7px;
                  }
                }
              }
            }
            .my-project {
              // overflow: auto;
              position: relative;
              .title {
                // padding-bottom: 10px !important;
              }
              .project-content-box {
                width: 100%;
                margin: 0 auto;
                box-sizing: border-box;
                position: absolute;
                bottom: 10px;
                height: calc(100% - 68px);
                .el-loading-mask {
                  background: #E3EDF7 !important
                }

              }
              .content {
                width: calc(100% - 15px);
                box-sizing: border-box;
                overflow-x: auto;
                padding: 10px;
                box-sizing: border-box;
              }

              .project-list {
                width: 150px;
                min-width: 150px;
                // max-width: 130px;
                height: 170px;
                // margin-bottom: 10px;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                // z-index: 100;
                &:first-child {
                  margin-left: 0;
                }
                .project-top {

                }
                .project-name {
                  font-family: PingFang-SC-Bold;
                  font-size: 14px;
                  color: #31456A;
                  letter-spacing: 0.34px;
                  line-height: 22px;
                  font-weight: 600;
                  -webkit-line-clamp: 2;
                  cursor: pointer;
                }
                .project-time {
                  font-family: PingFang-SC-Bold;
                  font-size: 10px;
                  // color: #31456A;
                  letter-spacing: 0.34px;
                  font-weight: 600;
                  // margin-top: 5px;
                  text-align: right;
                }
                .cost-box {
                  align-items: center;
                  .circle-dot {
                    width: 4px;
                    height: 4px;
                    color: #1FB57F;
                    background: #1FB57F;
                    // background-image: linear-gradient(180deg, #5ADB71 0%, #12AF7E 100%);
                    box-shadow: 2px 0px 3px 0px rgba(255,255,255,1),0px 1px 4px 0px rgba(155,187,216,1);
                    // margin-bottom: 10px;
                    border-radius: 50%;
                    margin-top: 18px;
                  }
                  .project-status {
                    font-family: PingFang-SC-Bold;
                    font-size: 18px;
                    /*color: #31456A;*/
                    color: #D4000F;
                    letter-spacing: 0.34px;
                    // line-height: 22px;
                    font-weight: 600;
                    -webkit-line-clamp: 1;
                    background: unset !important;
                    text-shadow: -1px 1px 2px #9BBBD8;
                  }
                  .project-status-0 {
                    color: #8d8d8d;
                    background: #8d8d8d;
                  }
                  .project-status-1 {
                    color: #f4707a;
                    background: #f4707a;
                  }
                  .project-status-2 {
                    color: #7388e6;
                    background: #7388e6;
                  }
                  .project-status-3 {
                    color: #d7e673;
                    background: #d7e673;
                  }
                  .project-status-4 {
                    color: #e69373;
                    background: #e69373;
                  }
                  .project-status-5 {
                    color: #1FB57F;
                    background: #1FB57F;
                  }
                 
                  .cost-num {
                    .cost-style {
                      font-family: DINCondensed-Bold;
                      font-size: 24px;
                      color: #1FB57F;
                      letter-spacing: 1.2px;
                      text-align: right;
                      line-height: 16px;
                      text-shadow: -1px 1px 4px #9BBBD8;
                      font-weight: 700;
                      span{
                        font-family: SourceHanSansCN-Heavy;
                        font-size: 14px;
                        color: #1FB57F;
                        letter-spacing: 0.56px;
                        text-align: right;
                        line-height: 16px;
                        text-shadow: -1px 1px 4px #9BBBD8;
                        font-weight: 800;
                      }
                    }
                    .people-num {
                      margin-bottom: 5px;
                    }
                    .cost-text {
                    }
                  }
                }
              }
              .project-list:last-child {
                min-width: 155px;
                width: 155px;
              }
              .project-list-style {
                height: 165px;
                width: 130px;
                border-radius: 12px;
                background: #E3EDF7;
                padding: 15px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-sizing: border-box;
                box-shadow: -7px -5px 15px 0px rgba(255,255,255,1),7px 5px 14px 0px rgba(211,224,236,1);
              }
            }
          }
        }
        .func-item {
          width: 100%;
          height: 50%;
        }
        .monitor-warning {
          height: 48%;
          .warning-box {
            margin: 0 15px 0 15px;
            .warning-item {
              background: #E3EDF7;
              box-shadow: -7px -5px 15px 0px rgba(255,255,255,1),7px 5px 14px 0px rgba(211,224,236,1);
              border-radius: 20px;
              padding: 7px 15px;
              margin-bottom: 15px;
              width: 100%;
              .warning-left {
                // flex: 1;
                width:calc(100% - 60px);
                .warning-text {
                  // width: 300px;
                  font-family: PingFang-SC-Bold;
                  font-size: 16px;
                  color: #31456A;
                  letter-spacing: 0.34px;
                  line-height: 22px;
                  font-weight: 700;
                  width:100%;
                }
                .warning-date {
                  font-family: PingFang-SC-Bold;
                  font-size: 11px;
                  color: #7B8499;
                  letter-spacing: 0.44px;
                  line-height: 16px;
                  font-weight: 700;
                  margin-top: 5px;
                }
              }
              .warning-right {
                background-image: linear-gradient(180deg, #FB9696 0%, #EA3A52 100%);
                box-shadow: inset 2px 2px 3px 0px rgba(0,0,0,0.2),-8px -6px 17px 0px rgba(255,255,255,1)8px 6px 15px 0px rgba(211,224,236,1);
                border-radius: 15px;
                width: 50px;
                height: 50px;
                text-align: center;
                line-height: 50px;
                .warning-num {
                  font-family: DINCondensed-Bold;
                  font-size: 18px;
                  color: #FFFFFF;
                  // letter-spacing: 1.2px;
                  // font-weight: 700;
                }
                i {
                  color: #FFFFFF;
                }
              }
              .warning-success {
               background-image: linear-gradient(180deg, #6cd98b 0%, #1db57f 100%);
              }
              .warning-error {
                background-image: linear-gradient(180deg, #FB9696 0%, #EA3A52 100%);
              }
            }

          }

        }
        .Common-func {
          padding-top: 40px;
          height: 52%;
        }
      }
      .my-agency {
        box-sizing: border-box;
        .agency-box {
          padding-left:25px;
          width: calc(100% - 25px);
          height: calc(100% - 85px);
          overflow-y: auto;
          ::v-deep .el-loading-mask {
            background: #E3EDF7 !important;
          }
          .axis-item {
            margin-bottom: 10px;
            width: 100%;
            .axis-left {
              margin-right: 30px;
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 50px;
              ::v-deep .el-avatar {
                border-radius: 12px;
              }
              .agency-name {
                font-family: PingFangSC-Regular;
                font-size: 10px;
                color: #31456A;
                letter-spacing: -0.73px;
                font-weight: 400;
                margin-top: 5px;
              }
              .agency-stage {
                font-family: PingFangSC-Regular;
                font-size: 10px;
                color: #AEC5DF;
                letter-spacing: -0.73px;
                font-weight: 400;
                white-space: nowrap;
              }
              .axis-line {
                background: #D1E2F3;
                box-shadow: inset 1px 1px 4px 0px rgba(198,218,239,1);
                border-radius: 6.5px;
                height: 60px;
                width: 5px;
              }
              .user-logo{
                width: 42px;
              }
            }
            .axis-right {
              padding-right: 5px;
              // width: 100%;
              flex: 1;
              overflow: hidden;
              .agency-brief {
                font-family: PingFang-SC-Bold;
                font-size: 10px;
                color: #999999;
                letter-spacing: 1px;
                line-height: 14px;
                font-weight: 700;
                display: flex;
                width: 100%;
                .agency-date {
                  
                  // width: 100px;
                  // overflow: hidden;
                  width: 50%;
                  min-width: 125px;
                }
                .agency-type {
                  flex: 1;
                  // width: 50%;
                  height: 14px;
                  margin-left: 20px;
                  display: inline-block;
                  // -webkit-line-clamp: 1;
                }
              }
              .agency-name {
                font-family: PingFangSC-Medium;
                font-size: 14px;
                color: #3F99D4;
                letter-spacing: 0.5px;
                line-height: 24px;
                font-weight: 500;
                margin-top: 10px;
                max-height: 100px;
                -webkit-line-clamp: 3;
              }
              .agencydeal-btn {
                cursor: pointer;
                background: #ABC4DF;
                box-shadow: -1px -4px 7px 0px rgba(255,255,255,1),6px 5px 7px 0px rgba(209,223,235,1);
                border-radius: 10px;
                height: 25px;
                width: 70px;
                border-radius: 10px;
                text-align: center;
                line-height: 25px;
                font-family: PingFangSC-Medium;
                font-size: 10px;
                color: #FFFFFF;
                letter-spacing: 0.36px;
                font-weight: 500;
                margin-top: 18px;
                margin-left: 50%;
                // float: right;
                // margin-right: 50px;
              }
              
              
            }
            
          }
        }

      }
      
    }
    .tabs {
      margin: 0 20px 0 50px;
      .tabs-item {
        margin-bottom: 20px;
        width: 60px;
        text-align: center;
        cursor: pointer;
        p {
          background: #E3EDF7;
          box-shadow: -7px -5px 15px 0px rgba(255,255,255,1),7px 5px 14px 0px rgba(211,224,236,1);
          border-radius: 15px;
          width: 60px;
          height: 60px;
          text-align: center;
          line-height: 60px;
          margin-bottom: 5px;
          img{
            // padding: 15px 20px;
          }
        }
        span{
          font-family: PingFangSC-Regular;
          font-size: 12px;
          color: #7B8499;
          letter-spacing: 0.26px;
          text-align: right;
          line-height: 14px;
          font-weight: 400;
        }
        &-active {
          p {
            // box-shadow: -7px -5px 15px 0px #B5D0E9,7px 5px 14px 0px #B5D0E9;
            box-shadow: 8px 8px 20px 0 rgba(55,99,170,.2), -8px -8px 20px 0 #fff;
          }
          // span {
          //   color: #0052d9;
          // }

        }

      }
    }

  }
  // 自定义card 样式
  .card-style {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    box-shadow: -7px -5px 15px 0px rgba(255,255,255,1),7px 5px 14px 0px rgba(211,224,236,1);
    border: none;
    ::v-deep .el-card__body {
      width: 100%;
      height: 100%;
      background: #E3EDF7;
      padding: 0;
    }
  } 
  // 模块头部标题样式
  .title {
    width: 100%;
    display: flex;
    justify-content: space-between;
    height: 68px;
    align-items: center;
    // padding: 20px 25px;
    .name {
      font-family: PingFang-SC-Bold;
      font-size: 16px;
      color: #31456A;
      letter-spacing: 0.34px;
      text-align: right;
      line-height: 68px;
      font-weight: 700;
      padding-left: 25px;
    }
    .list-num {
      font-size: 12px;
      font-weight: 700;
    }
    .more { 
      cursor: pointer;
      // background: #e0eaf3;
      // border-radius: 50%;
      // display: inline-block;
      // width: 33px;
      // height: 30px;
      // line-height: 30px;
      // text-align: center;
      // border-radius: 35%;
      // box-shadow: -7px -5px 15px 0px rgba(255,255,255,1);
      i {
        color: #7da0c6;
      }
    }
    .function-icon {
      height: 53px;
      width: 57px;
      margin-right: 11px;
      cursor: pointer;
    }
    .more-icon {
      width: 70px;
      height: 68px;
    }
  }
}
.card-more {
  position: absolute;
  right: 20px;
  bottom: 5px;
  font-family: PingFangSC-Regular;
  font-size: 13.5px;
  color: #559ed4 !important;
  letter-spacing: 0;
  text-align: justify;
  line-height: 22px;
  cursor: pointer;
}
.visible-span {
  width: 95%;
  margin: 2.5% 2.5% 0.5%;
  display: inline-block;
  font-size: 24px;
}
.visible-p1 {
  width: 95%;
  margin: 0.5% 2.5% 2.5%;
  padding: 10px;
  border: 1px solid #ddfdff;
  font-size: 16px;
  border-radius: 6px;
  display: inline-block;
  height: 40px;
  overflow: auto;
}
.visible-p2 {
  width: 95%;
  margin: 0.5% 2.5% 2.5%;
  padding: 10px;
  border: 1px solid #ddfdff;
  font-size: 16px;
  border-radius: 6px;
  display: inline-block;
  line-height: 27px;
  height: 400px;
  overflow: auto;
}
.notes-text {
  line-height: 25px;
  cursor: pointer;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: calc(100% - 40px);
  display: inline-block;
}
.title-bottom {
  font-size: 18px;
  font-family: PingFangSC-Semibold;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  line-height: 24px;
}
.title-bottom-top {
  font-size: 18px;
  font-family: PingFangSC-Semibold;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  line-height: 24px;
}
.date {
  font-family: BebasNeue;
  font-size: 30px;
  color: #fff;
  height: 60px;
  line-height: 70px;
}
.right {
  height: 60px;
}
.bottom-father {
  height: 124px;
  width: 100%;
  position: relative;
  margin-top: 20px;
}
.top-card-right {
  table-layout: fixed;
  width: 80%;
}
.bottom-after {
  content: "";
  display: block;
  width: 86%;
  height: 18px;
  border-bottom-left-radius: 100px;
  border-bottom-right-radius: 100px;
  position: absolute;
  bottom: 0;
  left: 7%;
  color: #fff;
  text-align: center;
}
.bottom-animate {
  animation: booani 0.6s linear forwards;
}
@keyframes booani {
  0% {
    width: 0;
    height: 0;
    bottom: 18px;
    left: 50%;
  }
  30% {
    height: 80px;
    width: 85%;
    bottom: 18px;
    left: 7.5%;
  }
  80% {
    height: 130px;
    width: 100%;
    bottom: 18px;
    left: 0;
  }
  100% {
    height: 106px;
    width: 90%;
    bottom: 18px;
    left: 5%;
  }
}
.showDetailedIn {
  width: 40%;
  height: 20%;
  margin-top: 30%;
  display: inline-block;
  font-size: 24px;
  margin-right: 2.5%;
  text-align: left;
  margin-left: 2.5%;
}
.showDetailedOut {
  width: 40%;
  height: 20%;
  margin-bottom: 20%;
  display: inline-block;
  font-size: 24px;
  margin-right: 2.5%;
  text-align: left;
  margin-left: 2.5%;
}
.showDetailedIn span {
  display: inline-block;
  width: 60px;
  height: 60px;
  border-radius: 100%;
  background-color: #888;
  float: left;
  line-height: 60px;
  margin-top: -12px;
  text-align: center;
  margin-right: 10px;
  font-size: 24px;
  font-weight: bold;
  color: #fff;
}
.showDetailedOut span {
  display: inline-block;
  width: 60px;
  height: 60px;
  border-radius: 100%;
  background-color: #888;
  float: left;
  line-height: 60px;
  margin-top: -12px;
  text-align: center;
  margin-right: 10px;
  font-size: 24px;
  font-weight: bold;
  color: #fff;
}
.s-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  -o-text-overflow:ellipsis;
  -webkit-line-clamp: 1;//显示1行
  white-space: nowrap;//允许换行
  text-overflow: ellipsis;//省略号显示超出部分
}
.m-ellipsis {
  overflow: hidden;
  // -webkit-line-clamp: 3;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
.c-pointer {
  cursor: pointer;
}
.visible-p1{
  text-align: center;
  width: 95%;
  margin:.5% 2.5% 0%;
  padding: 10px 0px;
  font-size: 25px;
  /* border-radius: 6px;  */
  display: inline-block;
  font-weight: bold;
  overflow: unset;
}
.visible-p2{
  text-align: right;
  width: 95%;
  margin:.5% 2.5% .5%;
  padding: 5px;
  font-size: 16px;
  border-radius: 6px;
  display: inline-block;
  height: unset;
  overflow: unset;
}
.visible-p3{
  text-indent: 2em;
  width: 95%;
  margin:.5% 2.5% 2.5%;
  padding: 10px;
  font-size: 16px;
  border-radius: 6px;
  display: inline-block;
  line-height: 27px;
  height: 400px;
  overflow: auto;
}

</style>
