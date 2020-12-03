<template>
  <div class="shell-model">
    <m-list-box>
      <div slot="text">脚本</div>
      <div slot="content" class="propwidth">
        <div class="from-mirror">
          <textarea
            id="code-shell-mirror"
            name="code-shell-mirror"
            style="opacity: 0"
          />
          <a class="ans-modal-box-max">
            <em class="ans-icon-max" @click="setEditorVal" />
          </a>
        </div>
      </div>
    </m-list-box>
    <m-list-box>
      <div slot="text">资源</div>
      <div slot="content" class="propwidth">
        <treeselect v-model="resourceList" :multiple="true" :options="options" :normalizer="normalizer" :disabled="isDetails" :value-consists-of="valueConsistsOf" placeholder="请选择资源">
          <div slot="value-label" slot-scope="{ node }">{{ node.raw.fullName }}</div>
        </treeselect>
      </div>
    </m-list-box>
    <!-- <m-list-box>
      <div slot="text">{{$t('Resources')}}</div>
      <div slot="content">
        <m-resources
                ref="refResources"
                @on-resourcesData="_onResourcesData"
                @on-cache-resourcesData="_onCacheResourcesData"
                :resource-list="resourceList">
        </m-resources>
      </div>
    </m-list-box> -->
    <m-list-box>
      <div slot="text">自定义参数</div>
      <div slot="content">
        <m-local-params
          ref="refLocalParams"
          :udp-list="localParams"
          @on-local-params="_onLocalParams"
        />
      </div>
    </m-list-box>
  </div>
</template>
<script>
import _ from 'lodash'
import mListBox from './_source/listBox'
import mScriptBox from './_source/scriptBox'
// import mResources from './_source/resources'
import mLocalParams from './_source/localParams'
import disabledState from '@/components/etl/mixin/disabledState'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import codemirror from '@/components/etl/file/codemirror'
import $ from 'jquery'

let editor

export default {
  name: 'Shell',
  // components: { mLocalParams, mListBox, mResources, mScriptBox, Treeselect },
  components: { mLocalParams, mListBox, Treeselect },

  mixins: [disabledState],
  props: {
    backfillItem: Object
  },
  data() {
    return {
      valueConsistsOf: 'LEAF_PRIORITY',
      // script
      rawScript: '',
      // Custom parameter
      localParams: [],
      // resource(list)
      resourceList: [],
      // Cache ResourceList
      cacheResourceList: [],
      // define options
      options: [],
      normalizer(node) {
        return {
          label: node.name
        }
      },
      allNoResources: [],
      noRes: []
    }
  },
  computed: {
    cacheParams() {
      const isResourceId = []
      let resourceIdArr = []
      if (this.resourceList.length > 0) {
        this.resourceList.forEach(v => {
          this.options.forEach(v1 => {
            if (this.searchTree(v1, v)) {
              isResourceId.push(this.searchTree(v1, v))
            }
          })
        })
        resourceIdArr = isResourceId.map(item => {
          return { id: item.id, name: item.name, res: item.fullName }
        })
      }
      const result = []
      resourceIdArr.forEach(item => {
        this.allNoResources.forEach(item1 => {
          if (item.id === item1.id) {
            // resultBool = true
            result.push(item1)
          }
        })
      })
      this.noRes = result
      return {
        resourceList: resourceIdArr,
        localParams: this.localParams
      }
    }
  },
  watch: {
    // Watch the cacheParams
    cacheParams(val) {
      this.$emit('on-cache-params', val)
    }
  },
  created() {
    const item = this.store.state.dag.resourcesListS
    this.diGuiTree(item)
    this.options = item
    const o = this.backfillItem

    // Non-null objects represent backfill
    if (!_.isEmpty(o)) {
      this.rawScript = o.params.rawScript || ''

      // backfill resourceList
      const backResource = o.params.resourceList || []
      const resourceList = o.params.resourceList || []
      if (resourceList.length) {
        _.map(resourceList, v => {
          if (!v.id) {
            this.store.dispatch('dag/getResourceId', {
              type: 'FILE',
              fullName: '/' + v.res
            }).then(res => {
              this.resourceList.push(res.id)
              this.dataProcess(backResource)
            }).catch(e => {
              this.resourceList.push(v.res)
              this.dataProcess(backResource)
            })
          } else {
            this.resourceList.push(v.id)
            this.dataProcess(backResource)
          }
        })
        this.cacheResourceList = resourceList
      }

      // backfill localParams
      const localParams = o.params.localParams || []
      if (localParams.length) {
        this.localParams = localParams
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this._handlerEditor()
    }, 200)
  },
  destroyed() {
    if (editor) {
      editor.toTextArea() // Uninstall
      editor.off($('.code-shell-mirror'), 'keypress', this.keypress)
    }
  },
  methods: {
    /**
       * return localParams
       */
    _onLocalParams(a) {
      this.localParams = a
    },
    setEditorVal() {
      const self = this
      const modal = self.$modal.dialog({
        className: 'scriptModal',
        closable: false,
        showMask: true,
        maskClosable: true,
        onClose: function() {

        },
        render(h) {
          return h(mScriptBox, {
            on: {
              getSriptBoxValue(val) {
                editor.setValue(val)
              },
              closeAble() {
                // this.$modal.destroy()
                modal.remove()
              }
            },
            props: {
              item: editor.getValue()
            }
          })
        }
      })
    },
    /**
       * return resourceList
       *
       */
    _onResourcesData(a) {
      this.resourceList = a
    },
    /**
       * cache resourceList
       */
    _onCacheResourcesData(a) {
      this.cacheResourceList = a
    },
    /**
       * verification
       */
    _verification() {
      // rawScript verification
      if (!editor.getValue()) {
        this.$message.warning(`请输入脚本(必填)`)
        return false
      }

      // localParams Subcomponent verification
      if (!this.$refs.refLocalParams._verifProp()) {
        return false
      }
      // noRes
      if (this.noRes.length > 0) {
        this.$message.warning(`请删除所有未授权或已删除资源`)
        return false
      }
      // Process resourcelist
      const dataProcessing = _.map(this.resourceList, v => {
        return {
          id: v
        }
      })
      // storage
      this.$emit('on-params', {
        resourceList: dataProcessing,
        localParams: this.localParams,
        rawScript: editor.getValue()
      })
      console.log('localParams===' + JSON.stringify(this.localParams))
      console.log('rawScript===' + JSON.stringify(editor.getValue()))

      return true
    },
    /**
       * Processing code highlighting
       */
    _handlerEditor() {
      // editor
      editor = codemirror('code-shell-mirror', {
        mode: 'shell',
        readOnly: this.isDetails
      })

      this.keypress = () => {
        if (!editor.getOption('readOnly')) {
          editor.showHint({
            completeSingle: false
          })
        }
      }

      // Monitor keyboard
      editor.on('keypress', this.keypress)
      editor.setValue(this.rawScript)

      return editor
    },
    diGuiTree(item) { // Recursive convenience tree structure
      try {
        item.forEach(item => {
          item.children === '' || item.children === undefined || item.children === null || item.children.length === 0
            ? this.operationTree(item) : this.diGuiTree(item.children)
        })
      } catch (e) {
        console.log(e)
      }
    },
    operationTree(item) {
      if (item.dirctory) {
        item.isDisabled = true
      }
      delete item.children
    },
    searchTree(element, id) {
      // 根据id查找节点
      if (element.id === id) {
        return element
      } else if (element.children != null) {
        var i
        var result = null
        for (i = 0; result == null && i < element.children.length; i++) {
          result = this.searchTree(element.children[i], id)
        }
        return result
      }
      return null
    },
    dataProcess(backResource) {
      const isResourceId = []
      let resourceIdArr = []
      if (this.resourceList.length > 0) {
        this.resourceList.forEach(v => {
          this.options.forEach(v1 => {
            if (this.searchTree(v1, v)) {
              isResourceId.push(this.searchTree(v1, v))
            }
          })
        })
        resourceIdArr = isResourceId.map(item => {
          return item.id
        })
        Array.prototype.diff = function(a) {
          return this.filter(function(i) { return a.indexOf(i) < 0 })
        }
        const diffSet = this.resourceList.diff(resourceIdArr)
        let optionsCmp = []
        if (diffSet.length > 0) {
          diffSet.forEach(item => {
            backResource.forEach(item1 => {
              if (item === item1.id || item === item1.res) {
                optionsCmp.push(item1)
              }
            })
          })
        }
        const noResources = [{
          id: -1,
          name: '未授权或已删除资源',
          fullName: '/' + '未授权或已删除资源',
          children: []
        }]
        if (optionsCmp.length > 0) {
          this.allNoResources = optionsCmp
          optionsCmp = optionsCmp.map(item => {
            return { id: item.id, name: item.name, fullName: item.res }
          })
          optionsCmp.forEach(item => {
            item.isNew = true
          })
          noResources[0].children = optionsCmp
          this.options = this.options.concat(noResources)
        }
      }
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss" scope>
.propwidth{
  width:500px
}
  .scriptModal {
    .ans-modal-box-content-wrapper {
      width: 90%;
      .ans-modal-box-close {
        right: -12px;
        top: -16px;
        color: #fff;
      }
    }
  }
  .ans-modal-box-close {
    z-index: 100;
  }
  .ans-modal-box-max {
    position: absolute;
    right: -12px;
    top: -16px;
  }
  .vue-treeselect--disabled {
    .vue-treeselect__control {
      background-color: #ecf3f8;
      .vue-treeselect__single-value {
        color: #6d859e;
      }
    }
  }
</style>
