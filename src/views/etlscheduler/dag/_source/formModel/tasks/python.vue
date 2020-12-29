<template>
  <div class="shell-model">
    <m-list-box>
      <div slot="text">{{ $t('Script') }}</div>
      <div slot="content">
        <div class="from-mirror">
          <textarea id="code-python-mirror" name="code-python-mirror" style="opacity: 0;" />
        </div>
      </div>
    </m-list-box>
    <m-list-box>
      <div slot="text">{{ $t('Resources') }}</div>
      <div slot="content">
        <treeselect v-model="resourceList" :multiple="true" :options="resourceOptions" :normalizer="normalizer" :value-consists-of="valueConsistsOf" :disabled="isDetails" :placeholder="$t('Please select resources')">
          <div slot="value-label" slot-scope="{ node }">{{ node.raw.fullName }}</div>
        </treeselect>
        <!-- <m-resources
            ref="refResources"
            @on-resourcesData="_onResourcesData"
            @on-cache-resourcesData="_onCacheResourcesData"
            :resource-list="resourceList">
        </m-resources> -->
      </div>
    </m-list-box>

    <m-list-box>
      <div slot="text">{{ $t('Custom Parameters') }}</div>
      <div slot="content">
        <m-local-params
          ref="refLocalParams"
          :udp-list="localParams"
          :hide="false"
          @on-local-params="_onLocalParams"
        />
      </div>
    </m-list-box>
  </div>
</template>
<script>
import _ from 'lodash'
import i18n from '@/module/i18n'
import mListBox from './_source/listBox'
import mResources from './_source/resources'
import mLocalParams from './_source/localParams'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import disabledState from '@/module/mixin/disabledState'
import codemirror from '@/components/etl/file/codemirror'
import $ from 'jquery'

let editor

export default {
  name: 'Python',
  components: { mLocalParams, mListBox, mResources, Treeselect },
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
      resourceOptions: [],
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
          this.resourceOptions.forEach(v1 => {
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
    this.resourceOptions = item
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
    editor.toTextArea() // Uninstall
    editor.off($('.code-python-mirror'), 'keypress', this.keypress)
  },
  methods: {
    /**
       * return localParams
       */
    _onLocalParams(a) {
      this.localParams = a
    },
    /**
       * return resourceList
       */
    // _onResourcesData (a) {
    //   this.resourceList = a
    // },
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
      // rawScript 验证
      if (!editor.getValue()) {
        this.$message.warning(`${i18n.$t('Please enter script(required)')}`)
        return false
      }

      // localParams Subcomponent verification
      if (!this.$refs.refLocalParams._verifProp()) {
        return false
      }

      // noRes
      if (this.noRes.length > 0) {
        this.$message.warning(`${i18n.$t('Please delete all non-existent resources')}`)
        return false
      }

      // storage
      this.$emit('on-params', {
        resourceList: _.map(this.resourceList, v => {
          return { id: v }
        }),
        localParams: this.localParams,
        rawScript: editor.getValue()
      })
      return true
    },
    /**
       * Processing code highlighting
       */
    _handlerEditor() {
      // editor
      editor = codemirror('code-python-mirror', {
        mode: 'python',
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
      item.forEach(item => {
        item.children === '' || item.children === undefined || item.children === null || item.children.length === 0
          ? this.operationTree(item) : this.diGuiTree(item.children)
      })
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
          this.resourceOptions.forEach(v1 => {
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
              if (item == item1.id || item == item1.res) {
                optionsCmp.push(item1)
              }
            })
          })
        }
        const noResources = [{
          id: -1,
          name: $t('Unauthorized or deleted resources'),
          fullName: '/' + $t('Unauthorized or deleted resources'),
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
          this.resourceOptions = this.resourceOptions.concat(noResources)
        }
      }
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss" scope>
  .vue-treeselect--disabled {
    .vue-treeselect__control {
      background-color: #ecf3f8;
      .vue-treeselect__single-value {
        color: #6d859e;
      }
    }
  }
</style>
