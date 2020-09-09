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
      /* list: [
        {
          id: 'id'
          name: '二级导航名称',
          children: [
            {
              id: '',
              name: '三级导航名称',
              path: ''
            }, {
              name: '三级导航名称'
            }, {
              name: '三级导航名称'
            }, {
              name: '三级导航名称'
            }
          ]
        }, {
          name: '二级导航名称',
          children: [
            {
              name: '三级导航名称'
            }, {
              name: '三级导航名称'
            }, {
              name: '三级导航名称'
            }, {
              name: '三级导航名称'
            }
          ]
        }
      ]*/
    }
  },
  methods: {
    close(index, item) {
      const itemDoms = this.$refs.itemDom
      for (const i in itemDoms) {
        if (parseInt(i) === index) {
          this.$refs.itemDom[i].openHandle(true)
        } else {
          this.$refs.itemDom[i].openHandle(false)
        }
      }
      // 路由跳转
      /* if (item.path && item.path !== '') {
        this.$router.push({
          path: item.path
        })
      }*/
    }
  }
}
</script>

