<template>
  <li class="item">
    <template>
      <div
          class="item-title relative"
          :class="[item.children && item.children.length && 'borderbottom']"
          @click.stop.prevent="close(item)"
      >
        <span v-if="!item.children||(item.children&&item.children.length!=1)" class="name" :class="[isOpen && 'text-black']">{{ item.name }}</span>
        <span v-if="item.children && item.children.length==1" class="name" :class="[isOpen && 'text-black']"   @click.stop.prevent="close(item,'one')">{{ item.name }}</span>
        <!-- && item.children.length!=1 -->
        <i
            v-if="item.children && item.children.length && item.children.length>1"
            class="el-icon-arrow-down icon absolute"
            :class="[isOpen && 'icon-open text-black']"
        />
      </div>
      <ul v-show="item.children && item.children.length && isOpen && item.children.length > 1" class="ul-temp">
        <Item v-for="(val,index) in item.children" :key="index" :item="val" @close="close(val)" />
      </ul>
    </template>
  </li>
</template>

<script>
export default {
  name: 'Item',
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    index: [Number]
  },
  data() {
    return {
      isOpen: false,
      theIndex:1
    }
  },
  methods: {
    openHandle(bool) {
      this.isOpen = bool
    },
    close(item,menuLevel) {
      if(menuLevel=='one'){
        while(item.path===''){
          item=item.children[0];
          this.item=item;
        }
      }
      let isCloseTree = false
      if (!item.children) {
        isCloseTree = true
      }
      if (item.path && item.path !== '' && this.item.path!=='') {
        this.$router.push({ path: this.item.path })
        this.$store.commit('aceState/setRightFooterTags', {
          type: 'active',
          val: {
            name: item.name,
            path: item.path
          }
        })
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
      let arry = []
      let lstimeIn = []
      // console.log(item.path)
      if(localStorage.getItem('userid') && (localStorage.getItem('userid').startsWith("{") || localStorage.getItem('userid').startsWith("["))){
        arry = JSON.parse(localStorage.getItem('userid'))
      }
      if(arry.length == 0 && item.path !== ''){
        arry.push({id:item.name,v:this.theIndex,p:item.path})
      }
      for(let i = 0 ; i < arry.length-1 ; i++){
        if(item.name == arry[i].id){
          arry[i].v = arry[i].v+1
        }
        lstimeIn.push(arry[i].id)
      }
      if(lstimeIn.indexOf(item.name) && item.path !== ''){
        arry.push({id:item.name,v:this.theIndex,p:item.path})
      }
      localStorage.setItem('userid',JSON.stringify(arry))


      this.$emit('close', {
        isOpen: this.isOpen,
        index: this.index,
        isCloseTree: isCloseTree
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.item {
  .borderbottom {
    //border-bottom: 1px solid #363a43;
  }
  .item-title {
    padding-left: 35px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #3D424A;
    letter-spacing: 1.03px;
    line-height: 30px;
    text-shadow: -1px 1px 3px #9BBBD8;
    font-weight: 400;
    user-select: none;
    cursor:pointer;
    &:hover {
      color: #1384D4;
      text-shadow: -1px 1px 3px #9BBBD8;
      font-weight: 400;
    }
    .icon {
      // right: 10px;
      top: 50%;
      font-size: 12px;
      margin-top: -8px;
      margin-left: 7px;
      font-weight: 700;
      &-open {
        transform: rotateZ(90deg);
      }
    }
  }
  .ul-temp {
    padding-left: 15px;
    // background: rgba(110,195,255,.15);
  }
}
</style>
