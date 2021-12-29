<!--
 * @Author: your name
 * @Date: 2021-12-18 01:26:12
 * @LastEditTime: 2021-12-20 13:32:05
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /ams-admin/src/portal/withmenu/grail-blue/views/menu-tree/index.vue
-->
<template>
  <div>
    <ul class="ace-tree">
      <Item v-for="(item, index) in list"
            v-if="item.type != 2"
            ref="itemDom"
            :item="item"
            :index="index"
            @close="close"
            :class="chooseId == item.permissionId ? 'thirdchoose' : ''"
            @changechooseId="changechooseId" />
      <!--      <Item v-for="(item,index) in menu" ref="itemDom" :item="item" :index="index" @close="close" />-->
    </ul>
  </div>
</template>

<script>
import Item from "./item";
export default {
  components: {
    Item,
  },
  props: {
    list: Array,
    workb: Boolean,
  },
  data () {
    return {
      chooseId: "",
    };
  },
  mounted () {
    this.$nextTick(() => {
      this.close({
        isOpen: true,
        index: 0,
        isCloseTree: false,
      });
    });
    // if (this.workb) {
    //   this.openworkbench();
    //   this.$emit("changeworkb");
    // }
  },
  methods: {
    // openworkbench () {
    //   let Doms = this.$refs.itemDom;
    //   for (let i = 0; i < Doms.length; i++) {
    //     if (Doms[i].item.name == "项目工作台") {
    //       this.$refs.itemDom[i].openworkbench();
    //     }
    //   }
    // },
    changechooseId (val) {
      this.chooseId = val;
    },
    close (item) {
      if (item.isCloseTree) {
        this.$emit("closetree");
        return;
      }
      const itemDoms = this.$refs.itemDom;
      for (const i in itemDoms) {
        if (parseInt(i) === item.index) {
          if (this.$refs.itemDom[i]) {
            this.$refs.itemDom[i].openHandle(!item.isOpen);
          }
        } else {
          if (this.$refs.itemDom[i]) {
            this.$refs.itemDom[i].openHandle(false);
          }
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.thirdchoose {
  .name {
    padding: 5px 15px;
    color: #fff;
    background-color: #0c87d6;
  }
}
</style>
<style lang="scss">
.el-button--text {
  border: none !important;
  background-color: transparent !important;
}
</style>

