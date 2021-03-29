<template>
  <div class="new-tree w100 h100 relative" :class="[isSearch && 'tree-bg']">
    <template v-if="!isSearch">
      <div class="tree-header flex a-center j-between flex-row">
        <div
          class="nav-wrap h100 flex a-center j-center flex-row relative"
          :class="[currentNavIndex===-1 ? 'nav-wrap-open' :'nav-wrap-radius']"
        >
          <div
            v-if="currentNavIndex===-1"
            class="open-temp absolute flex a-center flex-start flex-row"
          >
            <div class="open-temp-tar" />
            <div v-for="(item,index) in navList" class="open-temp-tag">{{ item.name }}</div>
          </div>
          <div
            v-for="(item,index) in navList.slice(0,tagCount)"
            :key="index"
            class="nav flex-shrink"
            :class="[currentNavIndex===index && 'nav-active radius-circle']"
            @click="select(index)"
          >{{ item.name }}</div>
          <div
            class="nav-more flex1 text-center"
            :class="[currentNavIndex===-1 && 'nav-more-active']"
            @click="select(-1)"
          >
            <i class="el-icon-more icon-more" />
          </div>
        </div>
        <div
          v-if="currentNavIndex!==-1"
          class="search-wrap h100 flex a-center j-center radius-circle"
        >
          <i class="el-icon-search icon" />
        </div>
      </div>
      <div class="tree-content">
        <div class="content-title text-center">财务审计-财务收支审计</div>
        <Tree key="1" :tree-data="treeData" @node-click="nodeClick" />
      </div>
      <div class="btn-tree-box absolute flex a-center j-center flex-column">
        <div v-if="isBtnSearch" class="absolute btn-box-search flex a-center j-center" @click="isSearch=true">
          <div class="btn-box flex a-center j-center"><i class="el-icon-search" /></div>
        </div>
        <div v-for="(item,index) in 4" :key="index" class="btn-box flex a-center j-center">
          <i class="el-icon-edit" />
        </div>
      </div>
      <div v-if="isChildrenRender" class="children-render" :style="[renderStyle]">
        <Tree key="2" :tree-data="treeDataChildRender" />
      </div>
    </template>
    <template v-else>
      <div class="search-wrap relative w100 h100">
        <new-input v-model="searchVal" width="100%" size="big" icon-around="prefix" input-color="#929498" />
        <div class="form-item">
          <div class="form-item-title">其他选择</div>
          <new-select v-model="selectVal" />
        </div>
        <div class="form-item">
          <div class="form-item-title">模型库选择</div>
          <div class="form-item-tags flex a-center j-start flex-row">
            <div v-for="(item,index) in navList" :key="index" class="tag" :class="[index>0 && index<5 &&'tag-active']">{{ item.name }}</div>
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-title">最近更新时间</div>
          <div class="form-item-checkboxs">
            <new-checkbox-group v-model="checkboxVal" />
          </div>
        </div>
        <div class="btn-wrap-box tree-bg flex a-center j-between flex-row">
          <div class="btn sure">
            <span>查询结果</span>
          </div>
          <div class="btn close" @click="isSearch=false">
            <span>关闭</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import Tree from './tree'
export default {
  components: {
    Tree
  },
  data() {
    return {
      currentNavIndex: 0,
      checkList: [],
      searchVal: '',
      selectVal: '',
      checkboxVal: '1',
      isBtnSearch: true,
      isSearch: false,
      isChildrenRender: false,
      treeDataChildRender: [
        {
          label: '财务审计 - 其他',
          children: [
            {
              label: '财务审计 - 其他A'
            },
            {
              label: '财务审计 - 其他B'
            },
            {
              label: '财务审计 - 其他C'
            },
            {
              label: '财务审计 - 其他D'
            },
            {
              label: '财务审计 - 其他E'
            }
          ]
        }
      ],
      navList: [
        {
          name: '全行模型'
        },
        {
          name: '机构模型'
        },
        {
          name: '个人模型'
        },
        {
          name: '其他模型'
        },
        {
          name: '全行模型1'
        },
        {
          name: '机构模型1'
        },
        {
          name: '个人模型1'
        },
        {
          name: '其他模型1'
        },
        {
          name: '全行模型2'
        },
        {
          name: '机构模型2'
        }
      ],
      treeData: [
        {
          label: '财务审计 - 其他',
          children: [
            {
              label: '财务审计 - 其他A'
            },
            {
              label: '财务审计 - 其他B'
            },
            {
              label: '财务审计 - 其他C'
            },
            {
              label: '财务审计 - 其他D'
            },
            {
              label: '财务审计 - 其他E'
            }
          ]
        },
        {
          label: '财务审计 - 财务管理审计',
          childrenRender: [
            {
              label: '财务审计 - 财务管理审计A'
            },
            {
              label: '财务审计 - 财务管理审计B'
            }
          ]
        },
        {
          label: '财务审计 - 经济效益审计',
          isBtn: false
        },
        {
          label: '财务审计 - 经济效益审计',
          isBtn: false
        },
        {
          label: '财务审计 - 经济效益审计'
        },
        {
          label: '财务审计 - 经济效益审计'
        },
        {
          label: '财务审计 - 经济效益审计'
        },
        {
          label: '财务审计 - 经济效益审计'
        },
        {
          label: '财务审计 - 经济效益审计'
        },
        {
          label: '财务审计 - 经济效益审计'
        },
        {
          label: '财务审计 - 经济效益审计'
        },
        {
          label: '财务审计 - 经济效益审计'
        },
        {
          label: '财务审计 - 经济效益审计'
        },
        {
          label: '财务审计 - 经济效益审计'
        },
        {
          label: '财务审计 - 经济效益审计'
        },
        {
          label: '财务审计 - 经济效益审计'
        },
        {
          label: '财务审计 - 经济效益审计'
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  computed: {
    tagCount() {
      return this.currentNavIndex === -1 ? 4 : 3
    },
    renderStyle() {
      const leftMenuShrink = this.$store.state.aceState.leftMenuShrink
      if (!leftMenuShrink) {
        return {
          left: '480px'
        }
      }
    }
  },
  methods: {
    select(index) {
      this.currentNavIndex = index
    },
    nodeClick(data) {
      if (data.childrenRender && data.childrenRender.length) this.isChildrenRender = true
      else this.isChildrenRender = false
    }
  }
}
</script>
<style lang="scss" scoped>
.tree-bg{
  background: #2A2E37;
}
.new-tree {
  overflow: hidden;
  height: calc(100%);
  padding: 14px 0px;
  border-radius: 30px 1px 1px 30px;
  box-shadow: 3px 0 17px 0 rgba(0,0,0,0.10);
  z-index: 100;
  .search-wrap{
    padding: 0 20px;
    .btn-wrap-box{
      position: absolute;
      bottom: -14px;
      left: 20px;
      right: 20px;
      padding-bottom: 20px;
      .btn{
        height: 43px;
        padding: 0px 47.7px;
        border: 1px solid #C4FF85;
        box-shadow: 0 9px 9px 0 rgba(162,204,117,0.53);
        border-radius: 21.6px;
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: #16243F;
        letter-spacing: 0.88px;
        text-align: center;
        line-height: 41px;
      }
      .sure{
        background: #C8FF8C;
        color: #16243F;
      }
      .close{
        color: #C8FF8C;
      }
    }
    .form-item{
      &-title{
        font-family: PingFangSC-Regular;
        font-size: 12.6px;
        color: rgba(255,255,255,0.50);
        line-height: 21.6px;
      }
      &-tags{
        flex-wrap: wrap;
        padding-bottom: 20px;
        .tag{
          padding: 9px;
          font-family: PingFangSC-Regular;
          font-size: 12px;
          color: #FFFFFF;
          letter-spacing: 0;
          line-height: 12px;
          border: 1px solid #454C58;
          box-shadow: 0 5px 15px 0 rgba(0,0,0,0.10);
          border-radius: 15.5px;
          margin-top: 10px;
          margin-right: 4px;
          &-active{
            background: #455659;
          }
        }
      }
      &:not(:last-child){
        margin-top: 30px;
      }
    }
  }
  .children-render {
    position: fixed;
    width: 350px;
    top: 12px;
    bottom: 41px;
    left: 424px;
    background: white;
    box-shadow: 3px 0 17px 0 rgba(0, 0, 0, 0.1);
    z-index: 100;
  }
  .btn-tree-box {
    right: 20px;
    bottom: 30px;
    background: #8691a2;
    border-radius: 3px;
    width: 20px;
    padding: 6px 0;
    .btn-box-search{
      top: -26px;
      background: #8691a2;
      width: 20px;
      height: 20px;
      border-radius: 3px;
    }
    // height: 86px;
    .btn-box {
      font-size: 14px;
      width: 14px;
      height: 14px;
      background: #dfe2e6;
      border-radius: 3px;
      text-align: center;
      line-height: 14px;
      font-size: 6px;
      color: #8691a2;
      &:hover {
        opacity: 0.6;
      }
      &:active {
        opacity: 0.6;
      }
      &:not(:last-child) {
        margin-bottom: 8.5px;
      }
    }
  }
  .tree-header {
    padding: 0px 16px;
    height: 32px;
    margin-bottom: 10px;
    .nav-wrap {
      width: 254px;
      background: #353a43;
      padding: 1px 0;
      font-size: 12px;
      color: #ffffff;
      cursor: pointer;
      border-top-left-radius: 19px;
      border-top-right-radius: 19px;
      &-radius {
        border-bottom-left-radius: 19px;
        border-bottom-right-radius: 19px;
      }
      &-open {
        width: 100%;
        z-index: 2;
        .open-temp {
          position: absolute;
          flex-wrap: wrap;
          left: 0;
          right: 0;
          padding: 20px 20px 10px 20px;
          background: #353a43;
          bottom: -122px;
          border-bottom-left-radius: 19px;
          border-bottom-right-radius: 19px;
          &-radius {
            border-top-left-radius: 19px;
            border-top-right-radius: 19px;
          }
          &-tar {
            position: absolute;
            width: 300px;
            height: 1px;
            background: #2d3139;
            top: 5px;
            left: 50%;
            margin-left: -150px;
          }
          &-tag {
            border: 1px solid #454c58;
            border-radius: 12px;
            padding: 6px;
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: #ffffff;
            letter-spacing: 0;
            line-height: 12px;
            margin: 0 4px 5px 0;
          }
        }
      }
      .nav-more {
        height: 30px;
        line-height: 30px;
        font-size: 18px;
        &-active {
          color: #c8ff8c;
        }
        .icon-more {
          &:active {
            color: #c8ff8c;
          }

          &:hover {
            color: #c8ff8c;
          }
        }
      }
      .nav {
        width: 70px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: #ffffff;
        letter-spacing: 0;
        user-select: none;
        &-active {
          background: #c8ff8c;
          color: #2a2e37;
        }
      }
    }
    .search-wrap {
      border: 1px solid #343942;
      font-size: 16px;
      width: 54px;
    }
  }
  .tree-content {
    padding: 0px 16px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #353a43;
    letter-spacing: 0.32px;
    line-height: 29px;
    height: calc(100% - 42px);
    overflow-y: auto;
    .content-title {
      font-family: PingFangSC-Regular;
      font-size: 14px;
      color: #3f444d;
      letter-spacing: 0.32px;
      line-height: 34px;
    }
  }
}
</style>
