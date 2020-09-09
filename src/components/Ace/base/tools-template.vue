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
            v-for="(item,index) in latelyUseList"
            :key="index"
            class="use-box flex a-center j-center"
            :style="{background:item.bg}"
          >
            <i class="el-icon-s-home" />
          </div>
          <div class="use-box flex a-center j-center use-box-add">
            <i class="el-icon-plus" />
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
      <div class="btns-wrap absolute">
        <div class="btn-box flex a-center j-center">
          <i class="el-icon-close" />
        </div>
        <div class="btn-box1 flex a-center  flex-column">
          <i class="el-icon-close" />
          <i class="el-icon-close" />
        </div>
      </div>
    </div>
    <div class="new-time-wrap absolute">
      <new-time />
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
      latelyUseList: [
        {
          bg: '#514559'
        },
        {
          bg: '#594545'
        },
        {
          bg: '#454659'
        },
        {
          bg: '#455659'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
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
