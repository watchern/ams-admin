
<template>
  <div class="list-model">
    <div class="table-box">
      <table class="fixed">
        <tr>
          <th scope="col">
            <span>#</span>
          </th>
          <th scope="col">
            <span>名称</span>
          </th>
          <th scope="col">
            <span>是否文件夹</span>
          </th>
          <th scope="col">
            <span>文件名称</span>
          </th>
          <th scope="col">
            <span>描述</span>
          </th>
          <th scope="col" width="100">
            <span>大小</span>
          </th>
          <th scope="col" width="140">
            <span>更新时间</span>
          </th>
          <th scope="col" width="140">
            <span>操作</span>
          </th>
        </tr>
        <tr v-for="(item, $index) in list" :key="item.id">
          <td>
            <span>{{ parseInt(pageNo === 1 ? ($index + 1) : (($index + 1) + (pageSize * (pageNo - 1)))) }}</span>
          </td>
          <td>
            <span v-tooltip.large.top.start.light="{text: item.alias, maxWidth: '500px'}" class="ellipsis">
              <a href="javascript:" class="links" @click="_go(item)">{{ item.alias }}</a>
            </span>
          </td>
          <td>
            <span>{{ item.directory? '是' : '否' }}</span>
          </td>
          <td><span v-tooltip.large.top.start.light="{text: item.fileName, maxWidth: '500px'}" class="ellipsis">{{ item.fileName }}</span></td>
          <td>
            <span v-if="item.description" v-tooltip.large.top.start.light="{text: item.description, maxWidth: '500px'}" class="ellipsis">{{ item.description }}</span>
            <span v-else>-</span>
          </td>
          <td>
            <span>{{ _rtSize(item.size) }}</span>
          </td>
          <td>
            <span v-if="item.updateTime">{{ item.updateTime | formatDate }}</span>
            <span v-else>-</span>
          </td>
          <td>
            <x-button
              type="info"
              shape="circle"
              size="xsmall"
              data-toggle="tooltip"
              title="编辑"
              :disabled="_rtDisb(item)"
              icon="ans-icon-edit"
              @click="_edit(item,$index)"
            />
            <x-button
              type="info"
              shape="circle"
              size="xsmall"
              icon="ans-icon-play"
              data-toggle="tooltip"
              title="重命名"
              @click="_rename(item,$index)"
            />

            <x-button
              type="info"
              shape="circle"
              size="xsmall"
              data-toggle="tooltip"
              title="下载"
              :disabled="item.directory? true: false"
              icon="ans-icon-download"
              @click="_downloadFile(item)"
            />

            <x-poptip
              :ref="'poptip-' + $index"
              placement="bottom-end"
              width="90"
            >
              <p>确定删除吗?</p>
              <div style="text-align: right; margin: 0;padding-top: 4px;">
                <x-button type="text" size="xsmall" shape="circle" @click="_closeDelete($index)">取消</x-button>
                <x-button type="primary" size="xsmall" shape="circle" @click="_delete(item,$index)">确定</x-button>
              </div>
              <template slot="reference">
                <x-button
                  icon="ans-icon-trash"
                  type="error"
                  shape="circle"
                  size="xsmall"
                  data-toggle="tooltip"
                  title="删除"
                />
              </template>
            </x-poptip>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import mRename from './rename'
import { mapActions } from 'vuex'
import { filtTypeArr } from '../../_source/common'
import { bytesToSize } from '@/components/etl/util/util'
import { downloadFile } from '@/components/etl/download'
import localStore from '@/components/etl/util/localStorage'

export default {
  name: 'FileManageList',
  props: {
    fileResourcesList: Array,
    pageNo: Number,
    pageSize: Number
  },
  data() {
    return {
      list: []
    }
  },
  methods: {
    ...mapActions('resource', ['deleteResource']),
    _edit(item) {
      localStore.setItem('file', `${item.alias}|${item.size}`)
      this.$router.push({ path: `/resource/file/edit/${item.id}` })
    },
    _go(item) {
      localStore.setItem('file', `${item.alias}|${item.size}`)
      if (item.directory) {
        localStore.setItem('currentDir', `${item.fullName}`)
        this.$router.push({ path: `/resource/file/subdirectory/${item.id}` })
      } else {
        this.$router.push({ path: `/resource/file/list/${item.id}` })
      }
    },
    _downloadFile(item) {
      downloadFile('/dolphinscheduler/resources/download', {
        id: item.id
      })
    },
    _rtSize(val) {
      return bytesToSize(parseInt(val))
    },
    _closeDelete(i) {
      this.$refs[`poptip-${i}`][0].doClose()
    },
    _delete(item, i) {
      this.deleteResource({
        id: item.id
      }).then(res => {
        this.$refs[`poptip-${i}`][0].doClose()
        this.$emit('on-update')
        this.$message.success(res.msg)
      }).catch(e => {
        this.$refs[`poptip-${i}`][0].doClose()
        this.$message.error(e.msg || '')
      })
    },
    _rename(item, i) {
      const self = this
      const modal = this.$modal.dialog({
        closable: false,
        showMask: true,
        escClose: true,
        className: 'v-modal-custom',
        transitionName: 'opacityp',
        render(h) {
          return h(mRename, {
            on: {
              onUpDate(item) {
                self.$set(self.list, i, item)
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
    _rtDisb({ alias, size }) {
      const i = alias.lastIndexOf('.')
      const a = alias.substring(i, alias.length)
      let flag = _.includes(filtTypeArr, _.trimStart(a, '.'))
      if (flag && (size < 1000000)) {
        flag = true
      } else {
        flag = false
      }
      return !flag
    }
  },
  watch: {
    fileResourcesList(a) {
      this.list = []
      setTimeout(() => {
        this.list = a
      })
    }
    // Listening for routing changes
    // '$route': {
    //   deep: false,
    //   handler () {
    //     this.$emit('on-update',this.$route.params.id)
    //   }
    // }
  },
  beforeRouteUpdate(to, from, next) {
    next() // 一定要有next
  },
  created() {
  },
  mounted() {
    this.list = this.fileResourcesList
  },
  components: { }
}
</script>
