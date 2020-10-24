<template>
  <div class="query-field">
    <el-form :inline="true" :model="query" label-position="bottom">
      <el-form-item v-for="fd in formData" :label="fd.label">
        <el-input v-if="fd.type==='text'" v-model="query[fd.name]" />
        <el-input v-if="fd.type==='fuzzyText'" v-model="query[fd.name]" placeholder="模糊查询" />
        <el-select v-if="fd.type==='select'" v-model="query[fd.name]">
          <el-option v-for="opt in fd.data" :label="opt.name" :value="opt.value" />
        </el-select>
        <template v-if="fd.type==='timePeriod'">
          <el-date-picker v-model="query[fd.name+'Start']" type="date" placeholder="开始时间" />-
          <el-date-picker v-model="query[fd.name+'End']" type="date" placeholder="结束时间" />
        </template>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
        <el-button type="primary" @click="clearAll">清空</el-button>
      </el-form-item>

    </el-form>
  </div>
</template>

<script>
import { objectMerge } from '@/utils'
export default {
  props: {
    formData: {
      type: Array,
      default: []
    },
    queryDefault: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      query: {}
    }
  },
  computed: {
  },
  created() {
    this.formData.forEach(fd => {
      if (fd.type === 'timePeriod') {
        this.$set(this.query, fd.name + 'Start', null)
        this.$set(this.query, fd.name + 'End', null)
      } else if (fd.type === 'text' || fd.type === 'fuzzyText') {
        this.$set(this.query, fd.name, '')
      } else if (fd.type === 'select') {
        this.$set(this.query, fd.name, [])
      }
    })
    if (this.queryDefault !== {}) { this.query = this.queryDefault }
  },
  methods: {
    getData() {
      return this.query
    },
    onSubmit() {
      this.$emit('submit', this.query)
    },
    clearAll() {
      Object.keys(this.query).forEach(o => {
        this.query[o] = null
      })
    }
  }
}
</script>
<style lang="scss" scoped>

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
</style>
