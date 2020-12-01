<template>
  <m-list-construction title="创建文件夹">
    <template slot="content">
      <div class="resource-create-model">
        <m-list-box-f>
          <template slot="name"><strong>*</strong>文件夹名称</template>
          <template slot="content">
            <x-input
              v-model="name"
              type="input"
              maxlength="60"
              style="width: 300px;"
              placeholder="请输入名称"
              autocomplete="off"
            />
          </template>
        </m-list-box-f>
        <!-- <m-list-box-f>
          <template slot="name"><strong>*</strong>{{$t('Folder Format')}}</template>
          <template slot="content">
            <x-select v-model="type" style="width: 100px;">
              <x-option
                      v-for="item in folderList"
                      :key="item.value"
                      :value="item.value"
                      :label="item.label">
              </x-option>
            </x-select>
          </template>
        </m-list-box-f> -->
        <m-list-box-f>
          <template slot="name">描述</template>
          <template slot="content">
            <x-input
              v-model="description"
              type="textarea"
              style="width: 430px;"
              placeholder="请输入描述"
              autocomplete="off"
            />
          </template>
        </m-list-box-f>
        <m-list-box-f>
          <template slot="name">&nbsp;</template>
          <template slot="content">
            <div class="submit">
              <x-button type="primary" shape="circle" :loading="spinnerLoading" @click="ok()">{{ spinnerLoading ? 'Loading...' : '创建' }} </x-button>
              <x-button type="text" @click="() => $router.push({name: 'fileResource'})"> 取消 </x-button>
            </div>
          </template>
        </m-list-box-f>
      </div>
    </template>
  </m-list-construction>
</template>
<script>
import { mapActions } from 'vuex'
import { folderList } from '../_source/common'
import mListBoxF from '@/components/etl/listBoxF/listBoxF'
import mListConstruction from '@/components/etl/listConstruction/listConstruction'

export default {
  name: 'ResourceListCreateFILE',
  props: {},
  data() {
    return {
      type: '',
      name: '',
      description: '',
      folderList: folderList,
      spinnerLoading: false
    }
  },
  methods: {
    ...mapActions('resource', ['createResourceFolder']),
    ok() {
      if (this._validation()) {
        this.spinnerLoading = true
        this.createResourceFolder({
          type: 'FILE',
          name: this.name,
          currentDir: '/',
          pid: -1,
          description: this.description
        }).then(res => {
          this.$notify({
            title: '提示',
            message: res.msg,
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
          setTimeout(() => {
            this.spinnerLoading = false
            this.$router.push({ path: `/resource/file` })
          }, 800)
        }).catch(e => {
          this.$message.error(e.msg || '')
          this.spinnerLoading = false
        })
      }
    },
    _validation() {
      if (!this.name) {
        this.$message.warning(`请输入资源文件夹名称`)
        return false
      }

      return true
    }
  },
  computed: {},
  watch: {},
  created() {
  },
  mounted() {
    this.$modal.destroy()
  },
  destroyed() {
  },
  components: { mListConstruction, mListBoxF }
}
</script>

<style lang="scss" rel="stylesheet/scss">
  .resource-create-model {
    padding: 30px;
  }
</style>
