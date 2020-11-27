<template>
  <m-popup ok-text="重命名" name-text="重命名" :asyn-loading="true" @ok="_ok">
    <template slot="content">
      <div class="resource-rename-model">
        <m-list-box-f>
          <template slot="name"><strong>*</strong>名称</template>
          <template slot="content">
            <x-input
              v-model="name"
              type="input"
              :placeholder="请输入名称"
              autocomplete="off"
            />
          </template>
        </m-list-box-f>
        <m-list-box-f>
          <template slot="name">描述</template>
          <template slot="content">
            <x-input
              v-model="description"
              type="textarea"
              placeholder="请输入描述"
              autocomplete="off"
            />
          </template>
        </m-list-box-f>
      </div>
    </template>
  </m-popup>
</template>
<script>
import store from '@/store'
import mPopup from '@/components/etl/popup/popup'
import mListBoxF from '@/components/etl/listBoxF/listBoxF'
export default {
  name: 'ResourceFileRename',
  components: { mPopup, mListBoxF },
  props: {
    item: Object
  },
  data() {
    return {
      store,
      description: '',
      name: ''
    }
  },
  watch: {},
  created() {
    const item = this.item || {}
    if (item) {
      this.name = item.alias
      this.description = item.description
    }
  },
  mounted() {
  },
  methods: {
    _ok(fn) {
      this._verification().then(res => {
        if (this.name === this.item.alias) {
          return new Promise((resolve, reject) => {
            this.description === this.item.description ? reject({ msg: '内容未修改' }) : resolve()
          })
        } else {
          return this.store.dispatch('resource/resourceVerifyName', {
            fullName: '/' + this.name,
            type: 'FILE'
          })
        }
      }).then(res => {
        return this.store.dispatch('resource/resourceRename', {
          name: this.name,
          description: this.description,
          id: this.item.id,
          type: 'FILE'
        })
      }).then(res => {
        this.$notify({
          title: '提示',
          message: res.msg,
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
        this.$emit('onUpDate', res.data)
        fn()
      }).catch(e => {
        fn()
        this.$message.error(e.msg || '')
      })
    },
    _verification() {
      return new Promise((resolve, reject) => {
        if (!this.name) {
            reject({ // eslint-disable-line
            msg: `请输入资源名称`
          })
        } else {
          resolve()
        }
      })
    }
  }
}
</script>
