<template>
  <li class="item">
    <template>
      <div
        class="item-title relative"
        :class="[item.children && item.children.length && 'borderbottom']"
        @click.stop.prevent="close(item)"
      >
        <span class="name" :class="[isOpen && 'text-white']">{{ item.name }}</span>
        <i
          v-if="item.children && item.children.length"
          class="el-icon-s-unfold icon absolute"
          :class="[isOpen && 'icon-open text-white']"
        />
      </div>
      <ul v-show="item.children && item.children.length && isOpen" class="ul-temp">
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
    close(item) {
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
      let arry = []
      let lstimeIn = []
      // console.log(item.path)
      if(localStorage.getItem('userid')){
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
    border-bottom: 1px solid #363a43;
  }
  .item-title {
    font-family: PingFangSC-Regular;
    font-size: 13px;
    color: #cbcbcb;
    letter-spacing: 0.88px;
    line-height: 40px;
    height: 40px;
    padding: 0 10px;
    user-select: none;
    cursor:pointer;
    &:hover {
      color: #ffffff;
    }
    .icon {
      right: 10px;
      top: 50%;
      font-size: 16px;
      margin-top: -8px;
      &-open {
        transform: rotateZ(90deg);
      }
    }
  }
  .ul-temp {
    padding-left: 15px;
    background: #1d2128;
  }
}
</style>
