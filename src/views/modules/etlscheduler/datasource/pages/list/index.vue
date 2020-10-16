<template>
  <m-list-construction title="Datasource">
    <template slot="conditions">
      <m-conditions @on-conditions="_onConditions">
        <template slot="button-group">
          <x-button
            type="ghost"
            size="small"
            @click="_create('')"
          >'Create Datasource'</x-button>
        </template>
      </m-conditions>
    </template>
    <template slot="content">
      <template v-if="datasourcesList.length || total>0">
        <m-list
          :datasources-list="datasourcesList"
          :page-no="searchParams.pageNo"
          :page-size="searchParams.pageSize"
          @on-update="_onUpdate"
        />
        <div class="page-box">
          <x-page
            :current="parseInt(searchParams.pageNo)"
            :total="total"
            :page-size="searchParams.pageSize"
            show-elevator
            show-sizer
            :page-size-options="[10,30,50]"
            @on-change="_page"
            @on-size-change="_pageSize"
          />
        </div>
      </template>
      <template v-if="!datasourcesList.length && total<=0">
        <m-no-data />
      </template>
      <m-spin
        :is-spin="isLoading"
        :is-left="false"
      />
    </template>
  </m-list-construction>
</template>
<script>
import _ from 'lodash'
import { mapActions } from 'vuex'
import mList from './_source/list'
import mSpin from '@/components/Dolphin/spin/spin'
import mNoData from '@/components/Dolphin/noData/noData'
import mCreateDataSource from './_source/createDataSource'
import listUrlParamHandle from '@/components/Dolphin/mixin/listUrlParamHandle'
import mConditions from '@/components/Dolphin/conditions/conditions'
import mListConstruction from '@/components/Dolphin/listConstruction/listConstruction'

export default {
  name: 'DatasourceIndexP',
  mixins: [listUrlParamHandle],
  props: {},
  data() {
    return {
      // loading
      isLoading: true,
      // Total number of articles
      total: 20,
      // data sources(List)
      datasourcesList: [],
      searchParams: {
        // Number of pages per page
        pageSize: 10,
        // Number of pages
        pageNo: 1,
        // Search value
        searchVal: ''
      }
    }
  },
  methods: {
    ...mapActions('datasource', ['getDatasourcesListP']),
    /**
     * create data source
     */
    _create(item) {
      const self = this
      const modal = this.$modal.dialog({
        closable: false,
        showMask: true,
        escClose: true,
        className: 'v-modal-custom',
        transitionName: 'opacityp',
        render(h) {
          return h(mCreateDataSource, {
            on: {
              onUpdate() {
                self._debounceGET('false')
                modal.remove()
              },
              close() {
                modal.remove()
              }
            },
            props: {
              item: item
            }
          })
        }
      })
    },
    /**
     * page
     */
    _page(val) {
      this.searchParams.pageNo = val
    },
    _pageSize(val) {
      this.searchParams.pageSize = val
    },
    /**
     * conditions event
     */
    _onConditions(o) {
      this.searchParams = _.assign(this.searchParams, o)
      this.searchParams.pageNo = 1
    },
    /**
     * get data(List)
     */
    _getList(flag) {
      this.isLoading = !flag
      this.getDatasourcesListP(this.searchParams).then(res => {
        if (this.searchParams.pageNo > 1 && res.totalList.length == 0) {
          this.searchParams.pageNo = this.searchParams.pageNo - 1
        } else {
          this.datasourcesList = []
          this.datasourcesList = res.totalList
          this.total = res.total
          this.isLoading = false
        }
      }).catch(e => {
        this.isLoading = false
      })
    },
    _onUpdate() {
      this._debounceGET('false')
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
  },
  components: { mList, mConditions, mSpin, mListConstruction, mNoData }
}
</script>
