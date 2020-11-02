<template>
  <m-list-construction :title="文件管理">
    <template slot="conditions">
      <m-conditions @on-conditions="_onConditions">
        <template slot="button-group">
          <x-button-group size="small">
            <x-button type="ghost" @click="() => $router.push({name: 'resource-file-createFolder'})">创建文件夹</x-button>
            <x-button type="ghost" @click="() => $router.push({name: 'resource-file-create'})">创建文件</x-button>
            <x-button type="ghost" @click="_uploading">上传文件</x-button>
          </x-button-group>
        </template>
      </m-conditions>
    </template>
    <template slot="content">
      <template v-if="fileResourcesList.length || total>0">
        <m-list :file-resources-list="fileResourcesList" :page-no="searchParams.pageNo" :page-size="searchParams.pageSize" @on-update="_onUpdate" />
        <div class="page-box">
          <x-page :current="parseInt(searchParams.pageNo)" :total="total" :page-size="searchParams.pageSize" show-elevator show-sizer :page-size-options="[10,30,50]" @on-change="_page" @on-size-change="_pageSize" />
        </div>
      </template>
      <template v-if="!fileResourcesList.length && total<=0">
        <m-no-data />
      </template>
      <m-spin :is-spin="isLoading" :is-left="isLeft" />
    </template>
  </m-list-construction>
</template>
<script>
import _ from 'lodash'
import { mapActions } from 'vuex'
import mList from './_source/list'
import mSpin from '@/components/etl/spin/spin'
import { findComponentDownward } from '@/components/etl/util/index'
import mNoData from '@/components/etl/noData/noData'
import listUrlParamHandle from '@/components/etl/mixin/listUrlParamHandle'
import mConditions from '@/components/etl/conditions/conditions'
import mListConstruction from '@/components/etl/listConstruction/listConstruction'
import mFileUpdate from '@/components/etl/fileUpdate/fileUpdate'
import mDefinitionUpdate from '@/components/etl/fileUpdate/definitionUpdate'
import $ from 'jquery'

export default {
  name: 'ResourceListIndexFILE',
  mixins: [listUrlParamHandle],
  props: {},
  data() {
    return {
      total: null,
      isLoading: false,
      fileResourcesList: [],
      searchParams: {
        id: -1,
        pageSize: 10,
        pageNo: 1,
        searchVal: '',
        type: 'FILE'
      },
      progress: 0,
      isLeft: true
    }
  },
  methods: {
    ...mapActions('resource', ['getResourcesListP']),
    /**
       * File Upload
       */
    _uploading() {
      // findComponentDownward(this.$root, 'roof-nav')._fileUpdate('FILE')
      this._fileUpdate('FILE')
    },
    _toggleArchive() {
      $('.update-file-modal').show()
    },
    _fileUpdate(type) {
      if (this.progress) {
        this._toggleArchive()
        return
      }
      const self = this
      const modal = this.$modal.dialog({
        closable: false,
        showMask: true,
        escClose: true,
        className: 'update-file-modal',
        transitionName: 'opacityp',
        render(h) {
          if (type === 'DEFINITION') {
            return h(mDefinitionUpdate, {
              on: {
                onProgress(val) {
                  self.progress = val
                },
                onUpdate() {
                  findComponentDownward(self.$root, `definition-list-index`)._updateList()
                  self.isUpdate = false
                  self.progress = 0
                  modal.remove()
                },
                onArchive() {
                  self.isUpdate = true
                },
                close() {
                  self.progress = 0
                  modal.remove()
                }
              },
              props: {
                type: type
              }
            })
          } else {
            return h(mFileUpdate, {
              on: {
                onProgress(val) {
                  self.progress = val
                },
                onUpdate() {
                  findComponentDownward(self.$root, `resource-list-index-${type}`)._updateList()
                  self.isUpdate = false
                  self.progress = 0
                  modal.remove()
                },
                onArchive() {
                  self.isUpdate = true
                },
                close() {
                  self.progress = 0
                  modal.remove()
                }
              },
              props: {
                type: type
              }
            })
          }
        }
      })
    },
    _onConditions(o) {
      this.searchParams = _.assign(this.searchParams, o)
      this.searchParams.pageNo = 1
    },
    _page(val) {
      this.searchParams.pageNo = val
    },
    _pageSize(val) {
      this.searchParams.pageSize = val
    },
    _getList(flag) {
      if (sessionStorage.getItem('isLeft') === 0) {
        this.isLeft = false
      } else {
        this.isLeft = true
      }
      this.isLoading = !flag
      this.getResourcesListP(this.searchParams).then(res => {
        if (this.searchParams.pageNo > 1 && res.totalList.length === 0) {
          this.searchParams.pageNo = this.searchParams.pageNo - 1
        } else {
          this.fileResourcesList = res.totalList
          this.total = res.total
          this.isLoading = false
        }
      }).catch(e => {
        this.isLoading = false
      })
    },
    _updateList() {
      this.searchParams.pageNo = 1
      this.searchParams.searchVal = ''
      this._debounceGET()
    },
    _onUpdate() {
      this._debounceGET()
    }
  },
  watch: {
    // router
    '$route'(a) {
      // url no params get instance list
      this.searchParams.pageNo = _.isEmpty(a.query) ? 1 : a.query.pageNo
    }
  },
  created() {
  },
  mounted() {
    this.$modal.destroy()
  },
  beforeDestroy() {
    sessionStorage.setItem('isLeft', 1)
  },
  components: { mListConstruction, mConditions, mList, mSpin, mNoData }
}
</script>
