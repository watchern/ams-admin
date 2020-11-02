<template>
  <m-popup
    ref="popup"
    ok-text="上传"
    name-text="文件上传"
    :disabled="progress === 0 ? false : true"
    @ok="_ok"
  >
    <template slot="content">
      <form name="files" enctype="multipart/form-data" method="post">
        <div
          id="file-update-model"
          class="file-update-model"
          @drop.prevent="_onDrop"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
        >
          <div class="tooltip-info">
            <em class="ans ans-icon-warn-solid" />
            <span>请将文件拖拽到当前上传窗口内！</span>
          </div>
          <!--<div class="hide-archive" v-if="progress !== 0" @click="_ckArchive">
            <em class="fa fa-minus" data-toggle="tooltip" title="关闭窗口 继续上传" data-container="body" ></em>
          </div>-->
          <div v-if="dragOver" class="update-popup">
            <div class="icon-box">
              <em class="ans ans-icon-upload" />
            </div>
            <p class="p1">
              <span>拖动区域上传</span>
            </p>
          </div>
          <m-list-box-f>
            <template slot="name"><strong>*</strong>文件名称</template>
            <template slot="content">
              <x-input
                v-model="name"
                type="input"
                :disabled="progress !== 0"
                placeholder="请输入名称"
                autocomplete="off"
              />
            </template>
          </m-list-box-f>
          <m-list-box-f>
            <template slot="name">描述</template>
            <template slot="content">
              <x-input
                v-model="description"
                type="textarea"
                :disabled="progress !== 0"
                placeholder="请输入描述"
                autocomplete="off"
              />
            </template>
          </m-list-box-f>
          <m-list-box-f><template slot="name"><strong>*</strong>上传文件</template>
            <template slot="content">
              <div class="file-update-box">
                <template v-if="progress === 0">
                  <input id="file" name="file" type="file" class="file-update">
                  <x-button type="dashed" size="xsmall"> 上传 </x-button>
                </template>
                <div v-if="progress !== 0" class="progress-box">
                  <m-progress-bar :value="progress" text-placement="left-right" />
                </div>
              </div>
            </template>
          </m-list-box-f>
        </div>
      </form>
    </template>
  </m-popup>
</template>
<script>
import io from '@/components/Dolphin/io'
import store from '@/store'
import localStore from '@/components/Dolphin/util/localStorage'
import mPopup from '@/components/Dolphin/popup/popup'
import mListBoxF from '@/components/Dolphin/listBoxF/listBoxF'
import mProgressBar from '@/components/Dolphin/progressBar/progressBar'
import $ from 'jquery'

export default {
  name: 'FileUpdate',
  components: { mPopup, mListBoxF, mProgressBar },
  props: {
    type: String,
    id: Number
  },
  data() {
    return {
      store,
      // name
      name: '',
      // description
      description: '',
      // progress
      progress: 0,
      // file
      file: '',
      currentDir: localStore.getItem('currentDir'),
      pid: this.id,
      // Whether to drag upload
      dragOver: false
    }
  },
  watch: {
  },
  mounted() {
    $('#file').change(() => {
      const file = $('#file')[0].files[0]
      this.file = file
      this.name = file.name
    })
  },
  methods: {
    /**
       * submit
       */
    _ok() {
      this.$refs['popup'].spinnerLoading = true
      if (this._validation()) {
        this.store.dispatch('resource/resourceVerifyName', {
          fullName: this.currentDir + '/' + this.name,
          type: this.type
        }).then(res => {
          const isLt1024M = this.file.size / 1024 / 1024 < 1024
          if (isLt1024M) {
            this._formDataUpdate().then(res => {
              setTimeout(() => {
                this.$refs['popup'].spinnerLoading = false
              }, 800)
            }).catch(e => {
              this.$refs['popup'].spinnerLoading = false
            })
          } else {
            this.$message.warning(`文件大小不能超过1G`)
            this.$refs['popup'].spinnerLoading = false
          }
        }).catch(e => {
          this.$message.error(e.msg || '')
          this.$refs['popup'].spinnerLoading = false
        })
      } else {
        this.$refs['popup'].spinnerLoading = false
      }
    },
    /**
       * validation
       */
    _validation() {
      if (!this.name) {
        this.$message.warning(`请输入文件名`)
        return false
      }
      if (!this.file) {
        this.$message.warning(`请选择要上传的文件`)
        return false
      }
      return true
    },
    /**
       * update file
       */
    _formDataUpdate() {
      return new Promise((resolve, reject) => {
        const self = this
        const formData = new FormData()
        formData.append('file', this.file)
        formData.append('type', this.type)
        formData.append('name', this.name)
        formData.append('pid', this.pid)
        formData.append('currentDir', this.currentDir)
        formData.append('description', this.description)
        io.post(`resources/create`, res => {
          this.$message.success(res.msg)
          resolve()
          self.$emit('onUpdate')
        }, e => {
          reject(e)
          self.$emit('close')
          this.$message.error(e.msg || '')
        }, {
          data: formData,
          emulateJSON: false,
          onUploadProgress(progressEvent) {
            // Size has been uploaded
            const loaded = progressEvent.loaded
            // Total attachment size
            const total = progressEvent.total
            self.progress = Math.floor(100 * loaded / total)
            self.$emit('onProgress', self.progress)
          }
        })
      })
    },
    /**
       * Archive to the top right corner Continue uploading
       */
    _ckArchive() {
      $('.update-file-modal').hide()
      this.$emit('onArchive')
    },
    /**
       * Drag and drop upload
       */
    _onDrop(e) {
      const file = e.dataTransfer.files[0]
      this.file = file
      this.name = file.name
      this.dragOver = false
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
  .file-update-model {
    .tooltip-info {
      position: absolute;
      left: 20px;
      bottom: 26px;
      span {
        font-size: 12px;
        color: #666;
        vertical-align: middle;
      }
      .fa,.ans {
        color: #0097e0;
        font-size: 14px;
        vertical-align: middle;
      }
    }
    .hide-archive {
      position: absolute;
      right: 22px;
      top: 17px;
      .fa,.ans{
        font-size: 16px;
        color: #333;
        font-weight: normal;
        cursor: pointer;
        &:hover {
          color: #0097e0;
        }
      }
    }
    .file-update-box {
      padding-top: 4px;
      position: relative;
      .file-update {
        width: 70px;
        height: 40px;
        position: absolute;
        left: 0;
        top: 0;
        cursor: pointer;
        filter: alpha(opacity=0);
        -moz-opacity: 0;
        opacity: 0;
      }
      &:hover {
        .v-btn-dashed {
          background-color: transparent;
          border-color: #47c3ff;
          color: #47c3ff;
          cursor: pointer;
        }
      }
      .progress-box {
        width: 200px;
        position: absolute;
        left: 70px;
        top: 14px;
      }
    }
    .update-popup {
      width: calc(100% - 20px);
      height: calc(100% - 20px);
      background: rgba(255,253,239,.7);
      position: absolute;
      top: 10px;
      left: 10px;
      border-radius: 3px;
      z-index: 1;
      border: .18rem dashed #cccccc;
      .icon-box {
        text-align: center;
        margin-top: 96px;
        .fa,.ans {
          font-size: 50px;
          color: #2d8cf0;
        }
      }
      .p1 {
        text-align: center;
        font-size: 16px;
        color: #333;
        padding-top: 8px;
      }
    }
  }
</style>
