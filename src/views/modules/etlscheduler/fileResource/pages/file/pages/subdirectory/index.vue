
<template>
  <div class="home-main list-construction-model">
    <div class="content-title">
      <a class="bread" style="padding-left: 15px;" @click="() => $router.push({path: `/resource/file`})">文件管理</a>
      <a v-for="(item,$index) in breadList" :key="$index" class="bread" @click="_ckOperation($index)">{{ '>'+item }}</a>
    </div>
    <div class="conditions-box">
      <m-conditions @on-conditions="_onConditions">
        <template slot="button-group">
          <x-button-group size="small">
            <x-button type="ghost" @click="() => $router.push({path: `/resource/file/subFileFolder/${searchParams.id}`})">创建文件夹</x-button>
            <x-button type="ghost" @click="() => $router.push({path: `/resource/file/subFile/${searchParams.id}`})">创建文件</x-button>
            <x-button type="ghost" @click="_uploading">上传文件</x-button>
          </x-button-group>
        </template>
      </m-conditions>
    </div>
    <div class="list-box">
      <template v-if="fileResourcesList.length || total>0">
        <m-list :file-resources-list="fileResourcesList" :page-no="searchParams.pageNo" :page-size="searchParams.pageSize" @on-update="_onUpdate" @on-updateList="_updateList" />
        <div class="page-box">
          <x-page :current="parseInt(searchParams.pageNo)" :total="total" :page-size="searchParams.pageSize" show-elevator show-sizer :page-size-options="[10,30,50]" @on-change="_page" @on-size-change="_pageSize" />
        </div>
      </template>
      <template v-if="!fileResourcesList.length && total<=0">
        <m-no-data />
      </template>
      <m-spin :is-spin="isLoading" :is-left="isLeft" />
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import { mapActions } from 'vuex'
import mList from './_source/list'
import localStore from '@/components/Dolphin/util/localStorage'
import mSpin from '@/components/Dolphin/spin/spin'
import { findComponentDownward } from '@/components/Dolphin/util/'
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
        id: this.$route.params.id,
        pageSize: 10,
        pageNo: 1,
        searchVal: '',
        type: 'FILE'
      },
      isLeft: true,
      breadList: []
    }
  },
  methods: {
    ...mapActions('resource', ['getResourcesListP', 'getResourceId']),
    /**
       * File Upload
       */
    _uploading() {
      findComponentDownward(this.$root, 'roof-nav')._fileChildUpdate('FILE', this.searchParams.id)
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
      if (sessionStorage.getItem('isLeft') == 0) {
        this.isLeft = false
      } else {
        this.isLeft = true
      }
      this.isLoading = !flag
      this.getResourcesListP(this.searchParams).then(res => {
        if (this.searchParams.pageNo > 1 && res.totalList.length == 0) {
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
    _updateList(data) {
      this.searchParams.id = data
      this.searchParams.pageNo = 1
      this.searchParams.searchVal = ''
      this._debounceGET()
    },
    _onUpdate() {
      this.searchParams.id = this.$route.params.id
      this._debounceGET()
    },
    _ckOperation(index) {
      let breadName = ''
      this.breadList.forEach((item, i) => {
        if (i <= index) {
          breadName = breadName + '/' + item
        }
      })
      this.transferApi(breadName)
    },
    transferApi(api) {
      this.getResourceId({
        type: 'FILE',
        fullName: api
      }).then(res => {
        localStore.setItem('currentDir', `${res.fullName}`)
        this.$router.push({ path: `/resource/file/subdirectory/${res.id}` })
      }).catch(e => {
        this.$message.error(e.msg || '')
      })
    }
  },
  watch: {
    // router
    '$route'(a) {
      // url no params get instance list
      this.searchParams.pageNo = _.isEmpty(a.query) ? 1 : a.query.pageNo
      this.searchParams.id = a.params.id
      const dir = localStore.getItem('currentDir').split('/')
      dir.shift()
      this.breadList = dir
    }
  },
  created() {},
  mounted() {
    const dir = localStore.getItem('currentDir').split('/')
    dir.shift()
    this.breadList = dir
    this.$modal.destroy()
  },
  beforeDestroy() {
    sessionStorage.setItem('isLeft', 1)
  },
  components: { mListConstruction, mConditions, mList, mSpin, mNoData }
}
</script>
<style lang="scss" rel="stylesheet/scss">
  .bread {
    font-size: 22px;
    padding-top: 10px;
    color: #2a455b;
    display: inline-block;
    cursor: pointer;
  }
</style>
