<template>
  <div class="new-card relative">
    <div class="title">项目名称</div>
    <div class="text nowrap">#2020年公司信贷业务专项问题审计</div>
    <div class="card-box">
      <div class="line flex a-center j-start flex-row line-top">
        <div class="line-left" @click="isSelectCalender=!isSelectCalender">
          <div
            class="dropdown-link flex a-center j-start flex-row"
            :class="[isSelectCalender && 'select-font']"
          >
            <span class="label">立项时间</span>
            <i class="el-icon-arrow-down"></i>
          </div>
          <div class="info-text1">{{currentDate}}</div>
        </div>
        <div class="line-right relative">
          <div
            class="dropdown-link flex a-center j-start flex-row"
            @click="isShowDropdown=!isShowDropdown"
          >
            <span class="label">立项人</span>
            <i class="el-icon-arrow-down"></i>
          </div>
          <div class="info-text2">{{selectedName.trim().substr(0, 1)}}</div>
          <div class="dropdown-list-name dropdown-list" v-if="isShowDropdown">
            <div
              class="dropdown-list-line flex a-center j-start flex-row"
              v-for="(item,index) in nameList"
              :key="index"
              @click="selectName(item)"
            >
              <span class="line-icon">{{item.name.trim().substr(0, 1)}}</span>
              <span class="line-name">{{item.name}}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="line flex a-center j-start flex-row">
        <div class="line-left relative">
          <div
            class="dropdown-link flex a-center j-start flex-row"
            @click="isShowOrganDropdown=!isShowOrganDropdown"
          >
            <span class="label">立项机构</span>
            <i class="el-icon-arrow-down"></i>
          </div>
          <div class="info-text3">#{{selectedOrgan}}</div>
          <div class="dropdown-list-organ dropdown-list" v-if="isShowOrganDropdown">
            <div
              class="dropdown-list-line"
              v-for="(item,index) in organList"
              :key="index"
              @click="selectOrgan(item)"
            >
              <span class="line-name">{{item.name}}</span>
            </div>
          </div>
        </div>
        <div class="line-right relative">
          <div class="dropdown-link flex a-center j-start flex-row" @click="isShowStatusDropdown=!isShowStatusDropdown">
            <span class="label">项目相同</span>
            <i class="el-icon-arrow-down"></i>
          </div>
          <div class="info-text3">{{selectedStatus}}</div>
          <div class="dropdown-list-status dropdown-list" v-if="isShowStatusDropdown">
            <div
              class="dropdown-list-line"
              v-for="(item,index) in statusList"
              :key="index"
              @click="selectStatus(item)"
            >
              <span class="line-name">{{item.name}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="btn-detail flex a-center j-center flex-row" @click.stop.prevent="searchDetail">
      <span>查询结果</span>
      <i class="el-icon-search"></i>
    </div>
    <div class="new-calender-wrap" v-if="isSelectCalender">
      <new-calender @selectDate="selectDate" :currentDate="currentDate"></new-calender>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentDate: "2020/08/31",
      isSelectCalender: false,
      isShowDropdown: false,
      selectedName: "王",
      selectedOrgan: "北京分行",
      isShowOrganDropdown: false,
      isShowStatusDropdown:false,
      selectedStatus: "执行中",
      statusList:[
         {
          name: "执行中"
        },
        {
          name: "已结束"
        }
      ],
      organList: [
        {
          name: "北京分行"
        },
        {
          name: "深圳分行"
        }
      ],
      nameList: [
        {
          name: "王经理"
        },
        {
          name: "付经理"
        },
        {
          name: "夏经理"
        },
        {
          name: "夏经理"
        }
      ]
    };
  },
  methods: {
    searchDetail() {
      console.log(120);
    },
    selectDate(val) {
      this.currentDate = val;
      this.isSelectCalender = false;
    },
    selectName(item) {
      this.isShowDropdown = false;
      this.selectedName = item.name;
    },
    selectOrgan(item) {
      this.isShowOrganDropdown = false;
      this.selectedOrgan = item.name;
    },
    selectStatus(item){
      this.isShowStatusDropdown = false;
      this.selectedStatus = item.name;
    }
  }
};
</script>
<style lang="scss" scoped>
.new-card {
  background: #353a43;
  box-shadow: 0 9px 9px 0 rgba(0, 0, 0, 0.15);
  border-radius: 13.5px;
  width: 312px;
  padding: 21px 0 47px 0;
  user-select: none;
  .dropdown-list-status{
     top: 65px;
    width: 136px;
  }
  .dropdown-list-organ {
    top: 65px;
    width: 155px;
  }
  .dropdown-list-name {
    top: 90px;
    width: 136px;
  }
  .dropdown-list {
    position: absolute;
    left: -9px;

    background: #282c35;
    box-shadow: 0 9px 9px 0 rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    z-index: 400;
    padding: 4px 0;
    max-height: 220px;
    overflow-y: auto;
    &-line {
      font-family: PingFangSC-Regular;
      font-size: 14px;
      color: #ffffff;
      letter-spacing: 0;
      line-height: 36px;
      height: 36px;
      padding: 0 20px;
      &:hover {
        background: #353a43;
      }
      .line-icon {
        display: inline-block;
        width: 25px;
        height: 25px;
        border-radius: 4px;
        border: 2px solid #552e38;
        text-align: center;
        line-height: 21px;
        font-family: PingFangSC-Semibold;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        margin-right: 16px;
      }
    }
  }
  .select-font {
    color: #c8ff8c !important;
  }
  .new-calender {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 200;
    top: 195px;
    background: #282c35;
  }
  .btn-detail {
    position: absolute;
    width: 203px;
    height: 44px;
    background: #c8ff8c;
    box-shadow: 0 9px 9px 0 rgba(162, 204, 117, 0.53);
    border-radius: 21.6px;
    font-family: PingFangSC-Regular;
    font-size: 14.4px;
    color: #16243f;
    letter-spacing: 0.9px;
    text-align: center;
    line-height: 21.6px;
    bottom: -22px;
    left: 50%;
    margin-left: -101px;
  }
  .title {
    font-family: PingFangSC-Regular;
    font-size: 12.6px;
    color: #93a2b8;
    line-height: 21.6px;
    margin-bottom: 6px;
    padding: 0 29px;
  }
  .text {
    font-family: PingFangSC-Regular;
    font-size: 16px;
    color: #ffffff;
    line-height: 29px;
    height: 29px;
    margin-bottom: 16px;
    padding: 0 20px 0 29px;
  }
  .card-box {
    border-top: 1px solid #31353d;
    border-bottom: 1px solid #31353d;
    .line {
      padding: 20px 29px;
      &:first-child {
        border-bottom: 1px solid #31353d;
      }
      .dropdown-link {
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: #93a2b8;
        line-height: 12px;
        margin-bottom: 12.6px;
        cursor: pointer;
        .label {
          display: inline-block;
          margin-right: 7px;
        }
      }
      .info-text3 {
        font-family: PingFangSC-Semibold;
        font-size: 16px;
        color: #ffffff;
        line-height: 16px;
        margin-top: 16px;
      }
      .line-left {
        width: 156px;
        position: relative;
        &::before {
          content: "";
          display: inline-block;
          position: absolute;
          right: 10px;
          top: -26px;
          bottom: -20px;
          width: 1px;
          background: #31353d;
        }
        .info-text1 {
          font-family: BebasNeue;
          font-size: 22px;
          color: #ffffff;
          letter-spacing: 0;
          line-height: 36px;
          font-weight: 600;
        }
      }
      .line-right {
        width: 98px;
        padding-left: 16px;
        .info-text2 {
          width: 45px;
          height: 45px;
          border-radius: 8px;
          border: 2px solid #552e38;
          background: #484f5c;
          text-align: center;
          line-height: 40px;
          font-family: PingFangSC-Semibold;
          font-size: 22px;
          color: rgba(255, 255, 255, 0.8);
          margin-left: 4px;
        }
      }
    }
  }
}
</style>
