<template>
  <div class="query-field">
    <el-form :inline="true" :model="query" label-position="bottom">
      <div class="switch-btn">
        <img :src="this.switchImg" @click="onSwitchWith">
      </div>

      <el-form-item v-for="fd in formData" v-if="searchBar == '0'" :label="fd.label">
        <el-input v-if="fd.type==='text'" v-model="query[fd.name]" />
        <el-input v-if="fd.type==='fuzzyText'" v-model="query[fd.name]" placeholder="模糊查询" />
        <el-select v-if="fd.type==='select'" v-model="query[fd.name]">
          <el-option label="全部" value="" />
          <el-option v-for="opt in fd.data" :label="opt.name" :value="opt.value" />
        </el-select>
        <template v-if="fd.type==='timePeriod'">
          <el-date-picker v-model="query[fd.name+'Start']" type="date" placeholder="开始时间" />-
          <el-date-picker v-model="query[fd.name+'End']" type="date" placeholder="结束时间" />
        </template>
      </el-form-item>

      <el-form-item v-if="searchBar == '0'">
<!--        <el-button type="primary" @click="onSubmit">查询</el-button>-->
<!--        <el-button type="primary" @click="clearAll">清空</el-button>-->
        <img :src="searchFor" @click="onSubmit" class="someimgin"/>
        <img :src="resetFor" @click="clearAll" class="someimgin"/>
      </el-form-item>

      <el-form-item v-if="searchBar == '1'" class="full-search">
        <el-input v-model="query['keyword']" placeholder="查询">
          <img slot="suffix" src="./input.png" class="img-icon" @click="onSubmit">
        </el-input>
      </el-form-item>

    </el-form>
  </div>
</template>

<script>
import { objectMerge } from '@/utils'
export default {
  props: {

    formData: {
      //
      type: Array,
      default: []
    }
  },
  data() {
    return {
      query: {},
      searchBar: '0',
      switchImg: '',
      searchFor: require('../../Ace/query-field/搜索.png'),
      resetFor: require('../../Ace/query-field/重置.png')
      /*      inquire:[
        {
          text: 'test',
          fuzzyText: 'asd',
          startTime:'2020-12-02',
          endTime:'2020-12-04',
          select:'002002001'
        }
      ],*/

    }
  },
  computed: {
  },
  watch: {
    formData: {
      deep: true,
      immediate: true,
      handler(o) {
        // console.log(o)
        o.forEach(fd => {
          if (fd.type === 'timePeriod') {
            this.$set(this.query, fd.name + 'Start', null)
            this.$set(this.query, fd.name + 'End', null)
            // 示例fd.value = '2020-12-02,2020-12-04'
            if (fd.value && fd.value !== null && fd.value !== '') {
              const valueTime = fd.value.split(',')
              if (valueTime.length === 2) {
                this.query[fd.name + 'Start'] = valueTime[0]
                this.query[fd.name + 'End'] = valueTime[1]
              }
            }
          } else if (fd.type === 'text' || fd.type === 'fuzzyText') {
            this.$set(this.query, fd.name, '')
            // 示例fd.value = 'asd'
            if (fd.value && fd.value !== null && fd.value !== '') { this.query[fd.name] = fd.value }
          } else if (fd.type === 'select') {
            // 示例fd.value = '002002001'
            if (fd.value && fd.value !== null && fd.value !== '') {
              this.$set(this.query, fd.name, [])
              this.query[fd.name] = fd.value
            }
          }
        })
      }
    }
  },
  created() {
    this.formData.forEach(fd => {
      if (fd.type === 'timePeriod') {
        this.$set(this.query, fd.name + 'Start', null)
        this.$set(this.query, fd.name + 'End', null)
        // 示例fd.value = '2020-12-02,2020-12-04'
        if (fd.value && fd.value !== null && fd.value !== '') {
          const valueTime = fd.value.split(',')
          if (valueTime.length === 2) {
            this.query[fd.name + 'Start'] = valueTime[0]
            this.query[fd.name + 'End'] = valueTime[1]
          }
        }
      } else if (fd.type === 'text' || fd.type === 'fuzzyText') {
        this.$set(this.query, fd.name, '')
        // 示例fd.value = 'asd'
        if (fd.value && fd.value !== null && fd.value !== '') { this.query[fd.name] = fd.value }
      } else if (fd.type === 'select') {
        this.$set(this.query, fd.name, [])
        // 示例fd.value = '002002001'
        if (fd.value && fd.value !== null && fd.value !== '') { this.query[fd.name] = fd.value }
      }
    })
  },
  mounted() {
    this.cSearch()
  },
  methods: {
    getData() {
      return this.query
    },
    onSubmit() {

      // return
      this.$emit('submit', this.query)
    },
    clearAll() {
      Object.keys(this.query).forEach(o => {
        this.query[o] = null
      })
    },
    onSwitchWith() {
      if (this.searchBar === '0') {
        this.searchBar = '1'
      } else {
        this.searchBar = '0'
      }
      const url = window.location.href
      const urls = url.split('/')
      this.searchBar === '0' ? this.switchImg = require('../../Ace/query-field/filter.png') : this.switchImg = require('../../Ace/query-field/filter-in.png')
      localStorage.setItem(urls, this.searchBar)
    },
    cSearch() {
      const url = window.location.href
      const urls = url.split('/')
      if (localStorage.getItem(urls)) {
        this.searchBar = localStorage.getItem(urls)
      }
      this.searchBar === '0' ? this.switchImg = require('../../Ace/query-field/filter.png') : this.switchImg = require('../../Ace/query-field/filter-in.png')
    }
  }

}
</script>
<style lang="scss" scoped>
  .query-field{
    height: 45px;
    float: left;
    position: relative;
    z-index:1000;
  }
  /*.el-form--inline .el-form-item {*/
    /*margin-right: 30px;*/
    /*vertical-align: top;*/
  /*}*/
  /*.el-form-item__label{*/
    /*vertical-align: top;*/
  /*}*/
  .el-form-item__label {
    text-align: right;
    vertical-align: top;
  }
  .full-search{
    float: right;
  }
  .switch-btn{
    margin-top:3px;
    float: left;
    margin-right:10px;
  }
  .img-icon{
    margin-right:5px;
  }
  .someimgin{
    height: 35px;
    padding: 4px;
    border-radius: 100%;
    border: 1px solid #000;
    margin-right: 8px;
    cursor: pointer;
  }
  .someimgin:hover{
    background: #ececec;
  }
</style>
