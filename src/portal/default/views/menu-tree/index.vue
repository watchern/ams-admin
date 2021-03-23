<template>
  <ul class="ace-tree">
    <Item v-for="(item,index) in list" ref="itemDom" :item="item" :index="index" @close="close" />
  </ul>
</template>

<script>
import Item from './item'
export default {
  components: {
    Item
  },
  props: {
    list: Array
  },
  data() {
    return {
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.close({
        isOpen: false,
        index: 0,
        isCloseTree: false
      })
    })
  },
  methods: {
    close(item) {
      if (item.isCloseTree) {
        this.$emit('closetree')
        return
      }
      const itemDoms = this.$refs.itemDom
      for (const i in itemDoms) {
        if (parseInt(i) === item.index) {
          this.$refs.itemDom[i].openHandle(!item.isOpen)
        } else {
          this.$refs.itemDom[i].openHandle(false)
        }
      }
    }

  }
}
</script>

