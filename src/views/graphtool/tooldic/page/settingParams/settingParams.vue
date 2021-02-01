<template>
    <div ref="settingParamDiv" style="overflow-y: auto;height: 600px;" v-loading="settingLoading" :element-loading-text="loadText">
        <el-tabs v-model="activeTabName" @tab-click="initSetting">
            <el-tab-pane label="参数编辑" name="editParam">
                <el-col :span="6">
                    <el-collapse v-model="activeName" accordion >
                        <el-collapse-item name="nodeColumn" title="节点信息">
                            <el-input v-model="searchColumnContent" placeholder="搜索关键字"/>
                            <ul id="nodeZtree" class="ztree" style="height:415px;margin-top: 10px;margin-bottom: 0;"/>
                        </el-collapse-item>
                        <el-collapse-item name="paramList" title="参数">
                            <ul id="paramZtree" class="ztree" style="height:460px;margin: 0 !important;"/>
                        </el-collapse-item>
                    </el-collapse>
                </el-col>
                <el-col :span="18">
                    <textarea id="settingParamsSql" ref="settingParamsSql"></textarea>
                    <el-row>
                        <el-tag style="height: 35px;line-height: 35px;"><div v-for="sign in signArr" class="signSpan" @click="operatorsFun(sign.value)">{{sign.name}}</div></el-tag>
                    </el-row>
                    <el-row>
                        <p>注：1、多值参数一般只应用于【in】条件</p>
                        <p style="text-indent: 2em;">2、【in】条件中的参数不需要编写单引号，非【in】条件的参数需编写单引号，</p>
                        <p style="text-indent: 4em;">例：客户名称='<button class="paramBtn">单值参数X</button>' and 客户号 in(<button class="paramBtn">多值参数Y</button>)</p>
                        <p style="text-indent: 2em;">3、编写含有参数的SQL条件语句同时符合以下条件时，需做特殊处理：</p>
                        <p style="text-indent: 4em;">① 【in】条件语句，括号内不能出现空格，例：客户号 in(<button class="paramBtn">多值参数X</button>)</p>
                        <p style="text-indent: 4em;">② 存在于括号内的语句，条件应与括号之间存在空格，</p>
                        <p style="text-indent: 4em;">例：code='<button class="paramBtn">单值参数X</button>' or ( code='<button class="paramBtn">单值参数Y</button>' and name='<button class="paramBtn">单值参数Z</button>' )</p>
                    </el-row>
                </el-col>
            </el-tab-pane>
            <el-tab-pane label="参数配置" name="setParam">
                <el-row style="color: red;line-height: 35px;height: 30px;">注：可通过上下拖动行对参数进行排序设置</el-row>
                <el-table :data="setParamArr" height="520" fit ref="setParamTable" style="width:100%;">
                    <el-table-column type="index" label="编号" width="60" align="center" :resizable="false"/>
                    <el-table-column prop="name" label="参数名称" width="260" header-align="center" :resizable="false"/>
                    <el-table-column label="默认值设置" width="300" header-align="center" :resizable="false">
                        <template slot-scope="scope">
                            <el-col v-if="scope.row.inputType === 'lineinp'" ref="selectParam" :index="scope.$index">
                                <div :id="scope.row.id" :title="scope.row.title" class='xm-select-demo'></div>
                            </el-col>
                            <el-col v-if="scope.row.inputType === 'textinp'" :index="scope.$index">
                                <el-input :title="scope.row.title" class='paramOption' v-model="scope.row.value"></el-input>
                            </el-col>
                            <el-col v-if="scope.row.inputType === 'timeinp'" :index="scope.$index">
                                <el-date-picker style="width: 100%;" :title="scope.row.title" class='paramOption' type="date" placeholder="选择日期" v-model="scope.row.value"></el-date-picker>
                            </el-col>
                            <el-col v-if="scope.row.inputType === 'treeinp'" ref="selectTreeParam" :index="scope.$index">
                                <div :id="scope.row.id" :title="scope.row.title" class='xm-select-demo'></div>
                            </el-col>
                        </template>
                    </el-table-column>
                    <el-table-column prop="description" label="参数说明" header-align="center" :resizable="false"/>
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
    require('@/components/ams-codemirror/mode/sql/sql.js')
    require('@/components/ams-codemirror/addon/hint/sql-hint.js')
    require('@/components/ams-codemirror/addon/hint/show-hint.js')
    require('@/components/ams-codemirror/addon/wrap/hardwrap.js')
    import * as settingParams from '@/api/graphtool/js/settingParams'
    export default {
        name: 'SettingParams',
        data(){
            return{
                activeTabName:'editParam',
                activeName:'nodeColumn',
                nodeZtreeObj:null,
                paramZtreeObj:null,
                nodeZtreeSetting:null,
                searchColumnContent:'',
                nodeZtreeRoot:null,
                settingLoading:true,
                loadText:"正在初始化数据，请稍后……",
                setParamArr :[],
                paramDivArr:[],// 用来记录参数按钮（因反显时不能全部渲染参数的div元素，因此只能用变量记录）
                isAdd:Object.keys(this.paramsSetting).length === 0,// 此次操作是新增还是修改
                editor:null,//编辑器对象
                cursor:null,//鼠标位置对象
                arr:this.paramsSetting.arr ? this.paramsSetting.arr : [],
                sql:this.paramsSetting.sql ? this.paramsSetting.sql : '',
                initTreeSuccess:false,//左侧树是否成功加载
                paramIdsdArr:[],// 用来记录已经替换过的参数ID集合（不可去除）
                isFirstPaste:true,// 本次改变内容是否是执行第一次粘贴操作
                checkSqlText:'',// 当前光标所在行从第0列到光标所在列之间的文本内容
                signArr:[{"name":"''","value":"''"},
                    {"name":",","value":","},
                    {"name":"=","value":"="},
                    {"name":"!=","value":"!="},
                    {"name":">","value":">"},
                    {"name":">=","value":">="},
                    {"name":"<","value":"<"},
                    {"name":"<=","value":"<="},
                    {"name":"(","value":"("},
                    {"name":")","value":")"},
                    {"name":"与","value":"AND"},
                    {"name":"或","value":"OR"},
                    {"name":"空值","value":"IS NULL"},
                    {"name":"非空","value":"IS NOT NULL"},
                    {"name":"匹配","value":"LIKE"},
                    {"name":"介于","value":"BETWEEN AND"},
                    {"name":"包含","value":"IN"}],
            }
        },
        props:["graph","nodeId","paramsSetting"],
        mounted(){
            settingParams.sendSettingVue(this)
            this.initSqlEditor(347)//初始化文本编辑器
            this.initSetting()
            this.$nextTick( () => {
                this.$parent.$parent.initNodeSettingVue = true
            })
        },
        watch: {
            searchColumnContent() {
                this.searchColumnZtree()
            }
        },
        methods:{
            initSqlEditor(heightPx){
                let sqlDom = document.getElementById('settingParamsSql')
                this.editor = settingParams.initSqlEditor(sqlDom,heightPx)
                if (this.arr.length > 0) { // 如果有设置参数
                    // 反显参数的设置
                    this.editor.setValue(this.sql)
                    // 替换参数
                    settingParams.replaceParam(this.paramsSetting)
                }
                settingParams.init(this.nodeId)
            },
            initSetting(event){
                if(typeof event === 'undefined' || event.name === 'setParam'){
                    settingParams.initSetting()
                }
            },
            operatorsFun(val){
                // 获取文本域的光标位置
                this.editor.replaceRange(val, this.editor.getCursor(), this.editor.getCursor())
            },
            getOptMessage(){
                return settingParams.getOptMessage()
            },
            getParamsSetting(){
                return settingParams.getParamsSetting()
            },
            searchColumnZtree(){
                let searchColumnContent = $.trim(this.searchColumnContent)
                if(searchColumnContent.length === 0){
                    this.nodeZtreeObj = $.fn.zTree.init($("#nodeZtree"), this.nodeZtreeSetting, [this.nodeZtreeRoot])
                }else{
                    let curRootNode = { ...{},...this.nodeZtreeRoot}
                    let childrens = []
                    curRootNode.children.forEach( item => {
                        if(item.name.indexOf(searchColumnContent) > -1){
                            childrens.push(item)
                        }
                    })
                    curRootNode.children = childrens
                    this.nodeZtreeObj = $.fn.zTree.init($("#nodeZtree"), this.nodeZtreeSetting, [curRootNode])
                }
            }
        }
    }
</script>
<style scoped src="@/components/ams-codemirror/lib/codemirror.css"></style>
<style scoped src="@/components/ams-codemirror/theme/idea.css"></style>
<style scoped src="@/components/ams-codemirror/addon/hint/show-hint.css"></style>
<style scoped type="text/css">
    .signSpan {
        line-height: 36px;
        padding: 0 10px;
        cursor: pointer;
        float: left;
    }
    .signSpan:hover {
        color: #FFFFFF;
        background-color: #409EFF;
        box-shadow: 3px 3px 5px #409EFF;
    }
    .paramBtn{
        background-color: #C9C5C5;
        padding:3px;
        border: 1px solid #C9C5C5;
        color: #1D7030;
        font-weight: 500;
    }
    p{
        color: red;
        word-wrap: break-word;
    }
    >>> .el-table .cell {
        padding: 0;
        display: inline;
    }
    >>> .el-tabs__header {
        margin: 0;
    }
    >>> .el-collapse-item__content{
        padding-bottom: 0;
    }
</style>
