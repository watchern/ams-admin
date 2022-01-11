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
          class="el-icon-caret-right icon absolute"
          :class="[isOpen && 'icon-open text-black']"
        />
      </div>
      <ul
        v-show="item.children && item.children.length && isOpen"
        class="ul-temp"
      >
        <Item
          v-for="(val, index) in item.children"
          v-if="val.type != 2"
          :key="index"
          :item="val"
          :class="thirdId == val.appuuid ? 'thirdchoose' : ''"
          @close="close3(val)"
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
      thirdId: "",
    };
  },
  methods: {
    changechooseId(val) {
      this.$emit("changechooseId", val);
    },
    openHandle(bool) {
      this.isOpen = bool;
    },
    // openworkbench() {
    //   console.log("-----------");
    //   let newitem = {
    //     children: [],
    //     name: "项目工作台",
    //     appuuid: 42,
    //     type: 1,
    //     url: "/audit/auditItems/projectWorkbench",
    //   };
    //   if (this.isOpen) {
    //     this.isOpen = false;
    //   } else {
    //     this.isOpen = false;
    //     this.thirdId = newitem.appuuid;
    //     let isCloseTree = false;
    //     if (!newitem.children) {
    //       isCloseTree = true;
    //     }
    //     this.changechooseId(newitem.appuuid);
    //     let arry = [];
    //     let lstimeIn = [];
    //     // console.log(item.path)
    //     if (localStorage.getItem("userid")) {
    //       arry = JSON.parse(localStorage.getItem("userid"));
    //     }
    //     if (arry.length == 0 && newitem.url !== "") {
    //       arry.push({ id: newitem.name, v: this.theIndex, p: newitem.url });
    //     }
    //     for (let i = 0; i < arry.length - 1; i++) {
    //       if (newitem.name == arry[i].id) {
    //         arry[i].v = arry[i].v + 1;
    //       }
    //       lstimeIn.push(arry[i].id);
    //     }
    //     if (lstimeIn.indexOf(newitem.name) && newitem.url !== "") {
    //       arry.push({ id: newitem.name, v: this.theIndex, p: newitem.url });
    //     }
    //     localStorage.setItem("userid", JSON.stringify(arry));

    //     this.$emit("close", {
    //       isOpen: this.isOpen,
    //       index: this.index,
    //       isCloseTree: isCloseTree,
    //     });
    //   }
    // },
    close(newitem) {
      if (this.isOpen) {
        this.isOpen = false;
      } else {
        this.isOpen = false;
        this.thirdId = newitem.appuuid;
        let isCloseTree = false;
        if (!newitem.children) {
          isCloseTree = true;
        }
        if (newitem.url && newitem.url !== "" && this.item.url !== "") {
          console.log("二级有路径");
          this.changechooseId(newitem.appuuid);
          this.$router.push({ path: newitem.url });
          this.$store.commit("aceState/setRightFooterTags", {
            type: "active",
            val: {
              name: newitem.name,
              path: newitem.url,
            },
          });
        } else {
          this.changechooseId(-1);
        }
        let arry = [];
        let lstimeIn = [];
        if (localStorage.getItem("userid")) {
          arry = JSON.parse(localStorage.getItem("userid"));
        }
        if (arry.length == 0 && newitem.url !== "") {
          arry.push({ id: newitem.name, v: this.theIndex, p: newitem.url });
        }
        for (let i = 0; i < arry.length - 1; i++) {
          if (newitem.name == arry[i].id) {
            arry[i].v = arry[i].v + 1;
          }
          lstimeIn.push(arry[i].id);
        }
        if (lstimeIn.indexOf(newitem.name) && newitem.url !== "") {
          arry.push({ id: newitem.name, v: this.theIndex, p: newitem.url });
        }
        localStorage.setItem("userid", JSON.stringify(arry));

        this.$emit("close", {
          isOpen: this.isOpen,
          index: this.index,
          isCloseTree: isCloseTree,
        });
      }
    },
    close3(newitem) {
      this.isOpen = false;
      this.thirdId = newitem.appuuid;
      let isCloseTree = false;
      if (!newitem.children) {
        isCloseTree = true;
      }
      if (newitem.url && newitem.url !== "" && this.item.url !== "") {
        console.log("三级有路径");
        this.changechooseId(newitem.appuuid);
        this.$router.push({ path: newitem.url });
        this.$store.commit("aceState/setRightFooterTags", {
          type: "active",
          val: {
            name: newitem.name,
            path: newitem.url,
          },
        });
      } else {
        this.changechooseId(-1);
      }
      let arry = [];
      let lstimeIn = [];
      // console.log(item.path)
      if (localStorage.getItem("userid")) {
        arry = JSON.parse(localStorage.getItem("userid"));
      }
      if (arry.length == 0 && newitem.url !== "") {
        arry.push({ id: newitem.name, v: this.theIndex, p: newitem.url });
      }
      for (let i = 0; i < arry.length - 1; i++) {
        if (newitem.name == arry[i].id) {
          arry[i].v = arry[i].v + 1;
        }
        lstimeIn.push(arry[i].id);
      }
      if (lstimeIn.indexOf(newitem.name) && newitem.url !== "") {
        arry.push({ id: newitem.name, v: this.theIndex, p: newitem.url });
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
    line-height: 40px;
    height: 40px;
    padding-left: 30px;
    user-select: none;
    text-align: left;
    cursor: pointer;
    &:hover {
      color: #0070c6;
    }
    .icon {
      color: #64bef3;
      right: 25px;
      top: 50%;
      font-size: 16px;
      margin-top: -8px;
      &-open {
        transform: rotateZ(-180deg);
      }
    }
    .name {
      padding: 5px 15px;
      cursor: pointer;
    }
  }
  .big-font {
    font-size: 14px;
  }
  .ul-temp {
    margin-left: 10px;
    width: 170px;
    // background: rgba(110, 195, 255, 0.15);
  }
}
.secondchoose {
  .name {
    padding: 5px 15px;
    color: #fff;
    background-color: #0c87d6;
    cursor: pointer;
  }
}
.thirdchoose {
  .name {
    padding: 5px 15px;
    color: #fff;
    background-color: #0c87d6;
    cursor: pointer;
  }
}
.icon-open {
  transform: rotateZ(-270deg) !important;
}
</style>
