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
import mSpin from '@/components/Dolphin/spin/spin'
import { findComponentDownward } from '@/components/Dolphin/util/index'
import mNoData from '@/components/Dolphin/noData/noData'
import listUrlParamHandle from '@/components/Dolphin/mixin/listUrlParamHandle'
import mConditions from '@/components/Dolphin/conditions/conditions'
import mListConstruction from '@/components/Dolphin/listConstruction/listConstruction'

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
      isLeft: true
    }
  },
  methods: {
    ...mapActions('resource', ['getResourcesListP']),
    /**
       * File Upload
       */
    _uploading() {
      findComponentDownward(this.$root, 'roof-nav')._fileUpdate('FILE')
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
