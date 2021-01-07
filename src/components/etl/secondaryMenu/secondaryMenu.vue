<template>
  <div class="secondary-menu-model" :class="className">
    <div class="toogle-box">
      <a v-if="!isTogHide" href="javascript:" class="tog-close" @click="_toggleMenu" />
      <a v-if="isTogHide" href="javascript:" class="tog-open" @click="_toggleMenu" />
    </div>
    <div v-for="(item,$index) in menuList" :key="$index" class="leven-1">
      <div v-if="item.disabled">
        <template v-if="item.path">
          <router-link :to="{ name: item.path}">
            <div class="name" @click="_toggleSubMenu(item)">
              <a href="javascript:">
                <em class="fa icon" :class="item.icon" />
                <span>{{ item.name }}</span>
                <em v-if="item.children.length" class="fa angle" :class="item.isOpen ? 'ans-icon-arrow-down' : 'ans-icon-arrow-right'" />
              </a>
            </div>
          </router-link>
        </template>
        <template v-if="!item.path">
          <div class="name" @click="_toggleSubMenu(item)">
            <a href="javascript:">
              <em class="fa icon" :class="item.icon" />
              <span>{{ item.name }}</span>
              <em v-if="item.children.length" class="fa angle" :class="item.isOpen ? 'ans-icon-arrow-down' : 'ans-icon-arrow-right'" />
            </a>
          </div>
        </template>
        <ul v-if="item.isOpen && item.children.length">
          <template v-for="(el,index) in item.children">
            <router-link v-if="el.disabled" :key="index" :to="{ name: el.path}" tag="li" active-class="active">
              <span>{{ el.name }}</span>
            </router-link>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import menu from './_source/menu'
import $ from 'jquery'

export default {
  name: 'SecondaryMenu',
  props: {
    type: String,
    className: String
  },
  data() {
    return {
      menuList: menu(this.type),
      index: 0,
      id: this.$route.params.id,
      isTogHide: false,
      isLeft: true
    }
  },
  watch: {
    isTogHide(is) {
      const layoutBox = $('.main-layout-box')
      is ? layoutBox.addClass('toggle') : layoutBox.removeClass('toggle')
    }
  },
  mounted() {
  },
  methods: {
    _toggleSubMenu(item) {
      item.isOpen = !item.isOpen
    },
    _toggleMenu() {
      this.isTogHide = !this.isTogHide
      if (this.isTogHide) {
        sessionStorage.setItem('isLeft', 0)
      } else {
        sessionStorage.setItem('isLeft', 1)
      }
    }
  }
}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  .main-layout-box {
    &.toggle {
      padding-left: 0;
      >.secondary-menu-model {
        left:-200px;
      }
    }
  }
  .secondary-menu-model {
    position: fixed;
    left: 0;
    top: 0;
    width: 200px;
    background: #41444C;
    height: calc(100%);
    padding-top: 80px;
    .toogle-box {
      position: absolute;
      right: -1px;
      top: calc(50% - 50px);
      .tog-close {
        width: 12px;
        height: 102px;
        background: url("./_source/close.png") no-repeat;
        display: inline-block;
      }
      .tog-open {
        width: 12px;
        height: 102px;
        background: url("./_source/open.png") no-repeat;
        display: inline-block;
        position: absolute;
        right: -12px;
        top: 0;
      }
    }
    .leven-1 {
      .name {
        a {
          height: 40px;
          line-height: 40px;
          display: block;
          position: relative;
          padding-left: 10px;
          >.icon {
            vertical-align: middle;
            font-size: 15px;
            width: 20px;
            text-align: center;
            color: #fff;
          }
          >span {
            vertical-align: middle;
            padding-left: 2px;
            font-size: 14px;
            color: #fff;
          }
          >.angle {
            position: absolute;
            right: 12px;
            top: 3px;
          }

        }
      }
      ul {
        li {
          height: 36px;
          line-height: 36px;
          cursor: pointer;
          padding-left: 39px;
          color: #fff;
          a {
            font-size: 14px;
          }
          &.active {
            border-right: 2px solid #2d8cf0;
            background: #2C2F39;
            span {
              font-weight: bold;
              color: #2d8cf0;
            }
          }
        }
      }
      >.router-link-exact-active,.router-link-active {
        background: #f0f6fb;
        .name {
          border-right: 2px solid #2d8cf0;
          background: #2B2E38;
          a {
            span {
              color: #2d8cf0;
              font-weight: bold;
            }
            .fa {
              color: #2d8cf0;
            }
          }
        }
      }
    }
  }
</style>
