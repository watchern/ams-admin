<template>
    <div id="transfer_div_column">
        <div id="del_repeat" class="demo-transfer"></div>
    </div>
</template>

<script>
    var nodeData
    export default {
        name: 'DistinctColumnSet',
        data(){
            return {
                transfer1:null
            }
        },
        mounted() {
            this.init()
            window.saveSetting = this.saveSetting
            window.inputVerify = this.inputVerify
        },
        methods: {
            init() {
                let graph = this.$parent.graph
                nodeData = graph.nodeData[graph.curCell.id]
                let columnsInfoPre = this.$parent.columnsInfoPre
                let $this = this
                layui.use(['transfer'], function() {
                    var transfer = layui.transfer
                    var dg_data = []
                    $(columnsInfoPre).each(function(index) {
                        dg_data.push({
                            'value': this.newColumnName,
                            'title': this.newColumnName
                        })
                    })

                    // 显示搜索框
                    var height = 360
                    var width = 300
                    var move_left = ($(document).width() - 680) / 2

                    $this.transfer1 = transfer.render({
                        elem: '#del_repeat',
                        data: dg_data,
                        title: ['可选字段', '去重字段'],
                        showSearch: true,
                        height: height,
                        width: width,
                        id: 'delRepeat',
                        onchange: function(data, index) {
                            $this.$parent.is_filter_column = $this.transfer1.getData('delRepeat')
                            $this.$parent.$refs.outputColumnVueRef.re_checkbox($this.$parent.is_filter_column)
                        }
                    })
                    // 是否反显
                    if (nodeData.isSet) {
                        var re_value = []
                        $(nodeData.setting.delRepeatData).each(function() {
                            re_value.push(this.value)
                        })
                        transfer.reload('delRepeat', {
                            title: ['可选字段', '去重字段'],
                            value: re_value,
                            showSearch: true
                        })
                        $this.$parent.$refs.outputColumnVueRef.re_checkbox(nodeData.setting.delRepeatData)// 反显
                    }
                    $('ul.layui-transfer-data').css('height', height - 93)
                    $('#del_repeat').css({ 'margin-left': move_left + 'px', 'margin-top': '30px' })
                })
            },
            saveSetting() {
                nodeData.setting.delRepeatData = this.transfer1.getData('delRepeat')
            },
            inputVerify() {
                var verify = true
                if (this.transfer1.getData().length === 0) {
                    this.$message({ type: 'info', message: '已选择去重字段列表不能为空' })
                    verify = false
                }
                return verify
            }
        }
    }

</script>
