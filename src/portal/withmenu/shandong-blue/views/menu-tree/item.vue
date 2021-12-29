<template>
  <li class="item">
    <template>
      <!-- :class="[item.children && item.children.length && 'borderbottom']" -->
      <div
        class="item-title relative"
        :class="isOpen ? 'secondchoose' : 'nochoose'"
        @click.stop="close(item)"
      >
        <span class="name big-font" :class="[isOpen && 'text-black']">{{
          item.name
        }}</span>
        <!-- && item.children.length!=1 -->
        <i
          v-if="item.children && item.children.length"
          class="el-icon-arrow-right icon absolute"
          :class="[isOpen && 'icon-open text-black']"
        />
      </div>
      <ul
        v-show="item.children && item.children.length && isOpen"
        class="ul-temp"
      >
        <Item
          v-for="(val, index) in item.children"
          :key="index"
          :item="val"
          :class="thirdId==val.id?'thirdchoose':''"
          @close="close(val)"
        />
      </ul>
    </template>
  </li>
</template>

<script>
export default {
  name: "Item",
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
    index: [Number],
  },
  data() {
    return {
      isOpen: false,
      theIndex: 1,
      thirdId:''
    };
  },
  methods: {
    openHandle(bool) {
      this.isOpen = bool;
    },
    close(item) {
      this.thirdId = item.id
      let isCloseTree = false;
      if (!item.children) {
        isCloseTree = true;
      }
      if (item.path && item.path !== "" && this.item.path !== "") {
        console.log("二级有路径");
        this.$router.push({ path: this.item.path });
        this.$store.commit("aceState/setRightFooterTags", {
          type: "active",
          val: {
            name: item.name,
            path: item.path,
          },
        });
      }
      // 原本给盐城做个个性化
      // if (item.children && item.children.length==1) {
      //   console.log("三级路径唯一")
      //   isCloseTree = true
      //   this.$router.push({ path: this.item.children[0].path })
      //   this.$store.commit('aceState/setRightFooterTags', {
      //     type: 'active',
      //     val: {
      //       name: item.children[0].name,
      //       path: item.children[0].path
      //     }
      //   })
      // }
      let arry = [];
      let lstimeIn = [];
      // console.log(item.path)
      if (localStorage.getItem("userid")) {
        arry = JSON.parse(localStorage.getItem("userid"));
      }
      if (arry.length == 0 && item.path !== "") {
        arry.push({ id: item.name, v: this.theIndex, p: item.path });
      }
      for (let i = 0; i < arry.length - 1; i++) {
        if (item.name == arry[i].id) {
          arry[i].v = arry[i].v + 1;
        }
        lstimeIn.push(arry[i].id);
      }
      if (lstimeIn.indexOf(item.name) && item.path !== "") {
        arry.push({ id: item.name, v: this.theIndex, p: item.path });
      }
      localStorage.setItem("userid", JSON.stringify(arry));

      this.$emit("close", {
        isOpen: this.isOpen,
        index: this.index,
        isCloseTree: isCloseTree,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.item {
  .borderbottom {
    //border-bottom: 1px solid #363a43;
  }
  .item-title {
    font-family: PingFangSC-Regular;
    font-size: 13px;
    color: #4c4c4c;
    letter-spacing: 0.88px;
    line-height: 50px;
    height: 50px;
    padding: 0 15px;
    user-select: none;
    text-align: center;
    cursor: pointer;
    &:hover {
      color: #0070c6;
    }
    .icon {
      right: 10px;
      top: 50%;
      font-size: 12px;
      margin-top: -8px;
      &-open {
        transform: rotateZ(-180deg);
      }
    }
  }
  .big-font {
    font-size: 14px;
  }
  .ul-temp {
    padding-left: 15px;
    // background: rgba(110, 195, 255, 0.15);
  }
}
.secondchoose {
  .name {
    background-color: #0c87d6;
    color: white !important;
    padding: 5px 10px;
  }
}
.thirdchoose{
  .name {
    background-color: #0c87d6;
    color: white !important;
    padding: 5px 10px;
  }
}
.icon-open{
  transform: rotateZ(-270deg) !important;
  }
</style>
