<template>
  <div
    class="clearfix dag-model"
    style=" z-index:100"
  >
    <div class="toolbar">
      <div class="title"><span>工具栏</span></div>
      <div class="toolbar-btn">
        <div
          v-for="(item,v) in tasksTypeList"
          :id="v"
          :key="v"
          class="bar-box roundedRect jtk-draggable jtk-droppable jtk-endpoint-anchor jtk-connected"
          :class="v === dagBarId ? 'active' : ''"
          @mousedown="_getDagId(v)"
        >
          <div
            data-toggle="tooltip"
            :title="item.desc"
          >
            <div
              class="icos"
              :class="'icos-' + v"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="dag-contect">
      <div class="dag-toolbar">
        <div class="assist-btn">
          <!--
            :disabled="$route.name !== 'projects-instance-details'" -->
          <x-button
            style="vertical-align: middle;"
            data-toggle="tooltip"
            title="查看变量"
            data-container="body"
            type="primary"
            size="xsmall"
            icon="ans-icon-code"
            :disabled="isDetails"
            @click="_toggleView"
          />
          <x-button
            style="vertical-align: middle;"
            data-toggle="tooltip"
            title="启动参数"
            data-container="body"
            type="primary"
            size="xsmall"
            :disabled="$route.name !== 'projects-instance-details'"
            icon="ans-icon-arrow-circle-right"
            @click="_toggleParam"
          />
          <span class="name">{{ name }}</span>
          &nbsp;
          <span
            v-if="name"
            class="copy-name"
            :data-clipboard-text="name"
            @click="_copyName"
          ><em
            class="ans-icon-copy"
            data-container="body"
            data-toggle="tooltip"
            title="复制名称"
          /></span>
        </div>
        <div class="save-btn">
          <div
            class="operation"
            style="vertical-align: middle;"
          >
            <a
              v-for="(item,$index) in toolOperList"
              :id="item.code"
              :key="$index"
              href="javascript:"
              :class="_operationClass(item)"
              @click="_ckOperation(item,$event)"
            >
              <x-button
                v-tooltip.light="item.desc"
                type="text"
                data-container="body"
                :icon="item.icon"
              />
            </a>
          </div>
          <!-- <x-button
            v-if="(type === 'instance' || 'definition') && urlParam.id !=undefined"
            v-tooltip.light="格式化DAG"
            type="primary"
            icon="ans-icon-triangle-solid-right"
            size="xsmall"
            data-container="body"
            style="vertical-align: middle;"
            @click="dagAutomaticLayout"
          /> -->
          <x-button
            v-if="type === 'instance'"
            v-tooltip.light="刷新DAG状态"
            data-container="body"
            style="vertical-align: middle;"
            icon="ans-icon-refresh"
            type="primary"
            :loading="isRefresh"
            size="xsmall"
            @click="!isRefresh && _refresh()"
          />
          <x-button
            v-if="isRtTasks"
            style="vertical-align: middle;"
            type="primary"
            size="xsmall"
            icon="ans-icon-play"
            @click="_rtNodesDag"
          >
            返回上一节点
          </x-button>
          <x-button
            style="vertical-align: middle;"
            type="primary"
            size="xsmall"
            :loading="spinnerLoading"
            icon="ans-icon-save"
            @click="_saveChart"
          >
            {{ spinnerLoading ? 'Loading...' : '保存' }}
          </x-button>
        </div>
      </div>
      <div class="scrollbar dag-container">
        <div
          id="jtk-demo"
          class="jtk-demo"
        >
          <div
            id="canvas"
            class="jtk-demo-canvas canvas-wide statemachine-demo jtk-surface jtk-surface-nopan jtk-draggable"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import dag0 from './dag'
import mUdp from './udp/udp'
import { jsPlumb } from 'jsplumb'
import Clipboard from 'clipboard'
import { allNodesId } from './plugIn/util'
import { toolOper, tasksType } from './config'
import mFormModel from './formModel/formModel'
import { formatDate } from '@/components/Dolphin/filter/filter'
import { findComponentDownward } from '@/components/Dolphin/util/'
import disabledState from '@/components/Dolphin/mixin/disabledState'
import { mapActions, mapState, mapMutations } from 'vuex'
import $ from 'jquery'

let eventModel

export default {
  name: 'DagChart',
  mixins: [disabledState],
  props: {
    type: String,
    releaseState: Number
  },
  data() {
    return {
      tasksTypeList: tasksType,
      toolOperList: toolOper(this),
      dagBarId: null,
      toolOperCode: '',
      spinnerLoading: false,
      urlParam: {
        id: this.$route.params.id || null
      },
      isRtTasks: false,
      isRefresh: false,
      isLoading: false,
      taskId: null,
      arg: false

    }
  },
  methods: {
    ...mapActions('dag', ['saveDAGchart', 'updateInstance', 'updateDefinition', 'getTaskState']),
    ...mapMutations('dag', ['addTasks', 'cacheTasks', 'resetParams', 'setIsEditDag', 'setName']),

    // DAG automatic layout
    dagAutomaticLayoutdagAutomaticLayout() {
      $('#canvas').html('')

      // Destroy round robin
      dag0.init({
        dag: this,
        instance: jsPlumb.getInstance({
          Endpoint: [
            'Dot', { radius: 1, cssClass: 'dot-style' }
          ],
          Connector: 'Bezier',
          PaintStyle: { lineWidth: 2, stroke: '#456' }, // Connection style
          HoverPaintStyle: { stroke: '#ccc', strokeWidth: 3 },
          ConnectionOverlays: [
            [
              'Arrow',
              {
                location: 1,
                id: 'arrow',
                length: 12,
                foldback: 0.8
              }
            ]
          ],
          Container: 'canvas'
        })
      })
      if (this.tasks.length) {
        dag0.backfill(true)
        if (this.type === 'instance') {
          this._getTaskState(false).then(res => { })
        }
      } else {
        dag0.create()
      }
    },

    init(args) {
      if (this.tasks.length) {
        dag0.backfill(args)
        // Process instances can view status
        if (this.type === 'instance') {
          this._getTaskState(false).then(res => { })
          // Round robin acquisition status
          this.setIntervalP = setInterval(() => {
            this._getTaskState(true).then(res => { })
          }, 90000)
        }
      } else {
        // dag0.init({
        //   dag: this,
        //   instance: jsPlumb.getInstance({
        //     Endpoint: [
        //       'Dot', { radius: 1, cssClass: 'dot-style' }
        //     ],
        //     Connector: 'Bezier',
        //     PaintStyle: { lineWidth: 2, stroke: '#456' }, // Connection style
        //     HoverPaintStyle: { stroke: '#ccc', strokeWidth: 3 },
        //     ConnectionOverlays: [
        //       [
        //         'Arrow',
        //         {
        //           location: 1,
        //           id: 'arrow',
        //           length: 12,
        //           foldback: 0.8
        //         }
        //       ]
        //     ],
        //     Container: 'canvas'
        //   })
        // })
        dag0.create()
      }
    },
    /**
     * copy name
     */
    _copyName() {
      const clipboard = new Clipboard(`.copy-name`)
      clipboard.on('success', e => {
        this.$message.success(`复制成功`)
        // Free memory
        clipboard.destroy()
      })
      clipboard.on('error', e => {
        // Copy is not supported
        this.$message.warning(`该浏览器不支持自动复制`)
        // Free memory
        clipboard.destroy()
      })
    },
    /**
     * Get state interface
     * @param isReset Whether to manually refresh
     */
    _getTaskState(isReset) {
      return new Promise((resolve, reject) => {
        this.getTaskState(this.urlParam.id).then(res => {
          const data = res.list
          const state = res.processInstanceState
          const taskList = res.taskList
          const idArr = allNodesId()
          const titleTpl = (item, desc) => {
            const $item = _.filter(taskList, v => v.name === item.name)[0]
            return `<div style="text-align: left">名称：${$item.name}</br>状态：${desc}</br>类型：${$item.taskType}</br>host：${$item.host || '-'}</br>重试次数：${$item.retryTimes}</br>提交时间：${formatDate($item.submitTime)}</br>开始时间：${formatDate($item.startTime)}</br>结束时间：${$item.endTime ? formatDate($item.endTime) : '-'}</br></div>`
          }

          // remove tip state dom
          $('.w').find('.state-p').html('')

          data.forEach(v1 => {
            idArr.forEach(v2 => {
              if (v2.name === v1.name) {
                const dom = $(`#${v2.id}`)
                const state = dom.find('.state-p')
                let depState = ''
                taskList.forEach(item => {
                  if (item.name === v1.name) {
                    depState = item.state
                  }
                })
                dom.attr('data-state-id', v1.stateId)
                dom.attr('data-dependent-result', v1.dependentResult || '')
                dom.attr('data-dependent-depState', depState)
                state.append(`<strong class="${v1.icoUnicode} ${v1.isSpin ? 'as as-spin' : ''}" style="color:${v1.color}" data-toggle="tooltip" data-html="true" data-container="body"></strong>`)
                state.find('strong').attr('title', titleTpl(v2, v1.desc))
              }
            })
          })
          if (state === 'PAUSE' || state === 'STOP' || state === 'FAILURE' || this.state === 'SUCCESS') {
            // Manual refresh does not regain large json
            if (isReset) {
              findComponentDownward(this.$root, `${this.type}-details`)._reset()
            }
          }
          resolve()
        })
      })
    },
    /**
     * Get the action bar id
     * @param item
     */
    _getDagId(v) {
      // if (this.isDetails) {
      //   return
      // }
      this.dagBarId = v
    },
    // _remove(v) {
    // },
    // _click(v) {
    // },
    // _mousedown(v) {

    // },
    _ckOperation(item) {
      let is = true
      let code = ''

      if (item.disable) {
        return
      }

      if (this.toolOperCode === item.code) {
        this.toolOperCode = ''
        code = item.code
        is = false
      } else {
        this.toolOperCode = item.code
        code = this.toolOperCode
        is = true
      }

      // event type
      dag0.toolbarEvent({
        item: item,
        code: code,
        is: is
      })
    },
    _operationClass(item) {
      return this.toolOperCode === item.code ? 'active' : ''
      // if (item.disable) {
      //   return this.toolOperCode === item.code ? 'active' : ''
      // } else {
      //   return 'disable'
      // }
    },
    /**
     * Storage interface
     */
    _save(sourceType) {
      return new Promise((resolve, reject) => {
        this.spinnerLoading = true
        // Storage store
        dag0.saveStore().then(res => {
          if (this._verifConditions(res.tasks)) {
            if (this.urlParam.id) {
              /**
               * Edit
               * @param saveInstanceEditDAGChart => Process instance editing
               * @param saveEditDAGChart => Process definition editing
               */
              this[this.type === 'instance' ? 'updateInstance' : 'updateDefinition'](this.urlParam.id).then(res => {
                this.$message.success(res.msg)
                this.spinnerLoading = false
                this.$router.push('/etlscheduler/processdefinition')
                resolve()
              }).catch(e => {
                this.$message.error(e.msg || '')
                this.spinnerLoading = false
                reject(e)
              })
            } else {
              // New
              this.saveDAGchart().then(res => {
                this.$message.success(res.msg)
                this.spinnerLoading = false
                if (sourceType !== 'affirm') {
                  this.$router.push('/etlscheduler/processdefinition')
                }
                resolve()
              }).catch(e => {
                this.$message.error(e.msg || '')
                this.setName('')
                this.spinnerLoading = false
                reject(e)
              })
            }
          }
        })
      })
    },
    _verifConditions(value) {
      const tasks = value
      let bool = true
      tasks.map(v => {
        if (v.type === 'CONDITIONS' && (v.conditionResult.successNode[0] === '' || v.conditionResult.successNode[0] == null || v.conditionResult.failedNode[0] === '' || v.conditionResult.failedNode[0] == null)) {
          bool = false
          return false
        }
      })
      if (!bool) {
        this.$message.warning(`conditions节点成功和失败分支流转必填`)
        this.spinnerLoading = false
        return false
      }
      return true
    },
    /**
     * Global parameter
     * @param Promise
     */
    _udpTopFloorPop() {
      return new Promise((resolve, reject) => {
        const modal = this.$modal.dialog({
          closable: false,
          showMask: true,
          escClose: true,
          className: 'v-modal-custom',
          transitionName: 'opacityp',
          render(h) {
            return h(mUdp, {
              on: {
                onUdp() {
                  modal.remove()
                  resolve()
                },
                close() {
                  modal.remove()
                }
              }
            })
          }
        })
      })
    },
    /**
     * Save chart
     */
    _saveChart() {
      // Verify node
      if (!this.tasks.length) {
        this.$message.warning(`未创建节点保存失败`)
        return
      }

      // Global parameters (optional)
      this._udpTopFloorPop().then(() => {
        return this._save()
      })
    },
    /**
     * Return to the previous child node
     */
    _rtNodesDag() {
      const getIds = this.$route.query.subProcessIds
      const idsArr = getIds.split(',')
      const ids = idsArr.slice(0, idsArr.length - 1)
      const id = idsArr[idsArr.length - 1]
      let query = {}

      if (id !== idsArr[0]) {
        query = { subProcessIds: ids.join(',') }
      }
      const $name = this.$route.name.split('-')
      this.$router.push({ path: `/${$name[0]}/${$name[1]}/list/${id}`, query: query })
    },
    /**
     * Subprocess processing
     * @param subProcessId Subprocess ID
     */
    _subProcessHandle(subProcessId) {
      let subProcessIds = []
      const getIds = this.$route.query.subProcessIds
      if (getIds) {
        const newId = getIds.split(',')
        newId.push(this.urlParam.id)
        subProcessIds = newId
      } else {
        subProcessIds.push(this.urlParam.id)
      }
      const $name = this.$route.name.split('-')
      this.$router.push({ path: `/${$name[0]}/${$name[1]}/list/${subProcessId}`, query: { subProcessIds: subProcessIds.join(',') }})
    },
    /**
     * Refresh data
     */
    _refresh() {
      this.isRefresh = true
      this._getTaskState(false).then(res => {
        setTimeout(() => {
          this.isRefresh = false
          this.$message.success(`刷新状态成功`)
        }, 2200)
      })
    },
    /**
     * View variables
     */
    _toggleView() {
      findComponentDownward(this.$root, `AssistDagIndex`)._toggleView()
    },

    /**
     * Starting parameters
     */
    _toggleParam() {
      findComponentDownward(this.$root, `StartingParamsDagIndex`)._toggleParam()
    },
    /**
     * Create a node popup layer
     * @param Object id
     */
    _createNodes({ id, type }) {
      const self = this
      let preNode = []
      const rearNode = []
      let rearList = []
      $('div[data-targetarr*="' + id + '"]').each(function() {
        rearNode.push($(this).attr('id'))
      })

      if (rearNode.length > 0) {
        rearNode.forEach(v => {
          const rearobj = {}
          rearobj.value = $(`#${v}`).find('.name-p').text()
          rearobj.label = $(`#${v}`).find('.name-p').text()
          rearList.push(rearobj)
        })
      } else {
        rearList = []
      }
      const targetarr = $(`#${id}`).attr('data-targetarr')
      if (targetarr) {
        const nodearr = targetarr.split(',')
        nodearr.forEach(v => {
          const nodeobj = {}
          nodeobj.value = $(`#${v}`).find('.name-p').text()
          nodeobj.label = $(`#${v}`).find('.name-p').text()
          preNode.push(nodeobj)
        })
      } else {
        preNode = []
      }
      if (eventModel) {
        eventModel.remove()
      }

      const removeNodesEvent = (fromThis) => {
        // Manually destroy events inside the component
        fromThis.$destroy()
        // Close the popup
        eventModel.remove()
      }

      this.taskId = id
      type = type || self.dagBarId

      eventModel = this.$drawer({
        closable: false,
        direction: 'right',
        escClose: true,
        render: h => h(mFormModel, {
          on: {
            addTaskInfo({ item, fromThis }) {
              self.addTasks(item)
              setTimeout(() => {
                removeNodesEvent(fromThis)
              }, 100)
            },
            /**
             * Cache the item
             * @param item
             * @param fromThis
             */
            cacheTaskInfo({ item, fromThis }) {
              self.cacheTasks(item)
            },
            close({ item, flag, fromThis }) {
              self.addTasks(item)
              // Edit status does not allow deletion of nodes
              if (flag) {
                jsPlumb.remove(id)
              }

              removeNodesEvent(fromThis)
            },
            onSubProcess({ subProcessId, fromThis }) {
              removeNodesEvent(fromThis)
              self._subProcessHandle(subProcessId)
            }
          },
          props: {
            id: id,
            taskType: type,
            self: self,
            preNode: preNode,
            rearList: rearList,
            instanceId: this.$route.params.id
          }
        })
      })
    },
    removeEventModelById($id) {
      if (eventModel && this.taskId === $id) {
        eventModel.remove()
      }
    }
    // ,
    // initApp () {
    //   $('.global-loading').hide()
    //   const bootstrapTooltip = $.fn.tooltip.noConflict()
    //   $.fn.tooltip = bootstrapTooltip
    //   $('body').tooltip({
    //     selector: '[data-toggle="tooltip"]',
    //     trigger: 'hover'
    //   })
    //   i18n.init()
    // }
  },
  watch: {
    'tasks': {
      deep: true,
      handler(o) {
        // Edit state does not allow deletion of node a...
        // 是否可以编辑
        this.setIsEditDag(!this.isDetails)
        // this.setIsEditDag(true)
      }
    }
  },
  created() {
    // Edit state does not allow deletion of node a...
    // this.setIsEditDag(true)
    // 是否可以编辑
    this.setIsEditDag(!this.isDetails)
    // this.initApp()

    if (this.$route.query.subProcessIds) {
      this.isRtTasks = true
    }

    dag0.init({
      dag: this,
      instance: jsPlumb.getInstance({
        Endpoint: [
          'Dot', { radius: 1, cssClass: 'dot-style' }
        ],
        Connector: 'Bezier',
        PaintStyle: { lineWidth: 2, stroke: '#456' }, // Connection style
        HoverPaintStyle: { stroke: '#ccc', strokeWidth: 3 },
        ConnectionOverlays: [
          [
            'Arrow',
            {
              location: 1,
              id: 'arrow',
              length: 12,
              foldback: 0.8
            }
          ]
        ],
        Container: 'canvas'
      })
    })
  },
  mounted() {
    this.init(this.arg)
  },
  beforeDestroy() {
    this.resetParams()

    // Destroy round robin
    clearInterval(this.setIntervalP)
  },
  destroyed() {
    if (eventModel) {
      eventModel.remove()
    }
  },
  // eslint-disable-next-line vue/order-in-components
  computed: {
    ...mapState('dag', ['tasks', 'locations', 'connects', 'isEditDag', 'name'])
  },
  // eslint-disable-next-line vue/order-in-components
  components: {}
}
</script>

<style lang="scss" rel="stylesheet/scss">
@import "./dag";
</style>
