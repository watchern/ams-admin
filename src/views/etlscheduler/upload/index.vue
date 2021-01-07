<template>
  <div>
    <uploader
      :key="uploader_key"
      :options="options"
      class="uploader-example"
      :auto-start="false"
      @file-success="onFileSuccess"
      @file-added="filesAdded"
      @file-progress="onFileProgress"
      @file-error="onFileError"
    >
      <uploader-unsupport />
      <uploader-drop>
        <uploader-btn :attrs="attrs">选择文件或者拖拽文件至此处</uploader-btn>
      </uploader-drop>
      <!-- <uploader-btn :attrs="attrs"><el-button title="上传" icon="el-icon-upload" class="oper-btn" type="primary" /></uploader-btn> -->
      <!-- <uploader-btn :attrs="attrs" title="上传" icon="el-icon-upload" class="oper-btn el-button el-button--primary el-button--medium" /> -->
      <!-- <uploader-btn :attrs="attrs" title="上传" icon="el-icon-upload" class="oper-btn" type="primary" /> -->

      <!-- <uploader-btn :attrs="attrs" title="上传" icon="el-icon-upload" class="oper-btn" type="primary" /> -->
      <uploader-list />
    </uploader>
  </div>
</template>

<script>
import SparkMD5 from 'spark-md5'

export default {
  data() {
    return {
      // chunkSize: 10 * 1024 * 1024,
      uploader_key: new Date().getTime(),
      options: {
        target: '/etlscheduler/chunk/chunkUpload',
        testChunks: false,
        query: { path: 'E:\\0' }
      },
      // TODO
      attrs: {
        accept: '.txt'
      }
    }
  },
  methods: {
    onFileSuccess: function(rootFile, file, response, chunk) {
      if (JSON.parse(response).code !== 0) {
        this.$message.error(this.$t(JSON.parse(response).msg))
        file.cancel()
      } else {
        this.$notify({
          title: this.$t('message.title'),
          message: this.$t(JSON.parse(response).data + '上传成功'),
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      }
    },
    onFileProgress(rootFile, file, chunk) {
      console.log(`上传中 ${file.name}，chunk：${chunk.startByte / 1024 / 1024} ~ ${chunk.endByte / 1024 / 1024}`)
    },
    onFileError(rootFile, file, response, chunk) {
      this.$message.error(this.$t(JSON.parse(response).msg))
      file.error()
    },
    computeMD5(file) {
      const loading = this.$loading({
        lock: true,
        text: '正在计算MD5',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const fileReader = new FileReader()
      const time = new Date().getTime()
      const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
      let currentChunk = 0
      // const chunkSize = this.chunkSize
      const chunkSize = 10 * 1024 * 1024
      const chunks = Math.ceil(file.size / chunkSize)
      const spark = new SparkMD5.ArrayBuffer()
      file.pause()

      loadNext()

      fileReader.onload = e => {
        spark.append(e.target.result)
        if (currentChunk < chunks) {
          currentChunk++
          loadNext()
          this.$nextTick(() => {
            console.log('校验MD5 ' + ((currentChunk / chunks) * 100).toFixed(0) + '%')
          })
        } else {
          const md5 = spark.end()
          loading.close()
          this.computeMD5Success(md5, file)
          console.log(`MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${file.size} 用时：${new Date().getTime() - time} ms`)
        }
      }
      fileReader.onerror = function() {
        this.error(`文件${file.name}读取出错，请检查该文件`)
        loading.close()
        file.cancel()
      }

      function loadNext() {
        const start = currentChunk * chunkSize
        const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize
        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end))
      }
    },
    computeMD5Success(md5, file) {
      file.uniqueIdentifier = md5// 把md5值作为文件的识别码
      file.resume()// 开始上传
    },
    filesAdded(file, event) {
      // 大小判断
      // const isLt100M = file.size / 1024 / 1024 < 10
      const isLt100M = true
      if (!isLt100M) {
        this.$message.error(this.$t('error.error_upload_file_max'))
      } else {
        this.computeMD5(file)
      }
    }
  }
}
</script>

<style scoped>
  .uploader-example {
    /* width: 90%; */
    /* padding: 15px; */
    /* margin: 40px auto 0; */
    /* font-size: 12px; */
    /* box-shadow: 0 0 10px rgba(0, 0, 0, .4); */
  }

  .uploader-btn {
    /* margin-right: 4px; */
    /* display: inline-block;
    position: relative;
    padding: 4px 8px;
    font-size: 100%;
    line-height: 1.4;
    color: #666;
    border: 1px solid #666;
    cursor: pointer;
    border-radius: 2px;
    outline: none; */
  }

  .uploader-example .uploader-list {
    max-height: 440px;
    overflow: auto;
    overflow-x: hidden;
    overflow-y: auto;
  }
</style>
