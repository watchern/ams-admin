import Vue from 'vue';
import { handleDataManyValue } from "@/api/analysis/thresholdvalue";
export const AgCell =  Vue.extend({
    template: `
        <span v-if="flag === 1" :style="{color:fontColor, 'background-color': backgroundColor}" :title='title'>{{params.value}}</span>
        <span v-else-if="flag === 2" @mouseover="openModelDetailNew(params.rowIndex)" style='text-decoration:underline;color:blue;cursor:pointer'>{{params.value}}</span>
        <span v-else >{{params.value}}</span>
    `,
    data: function () {
        return {
            flag: 0,
            parent: null,
            fontColor: '',
            backgroundColor: '',
            title: ''
        };
    },
    mounted() {
        this.parent = this.params.context.componentParent
        // thresholdValueRel, modelResultDetailCol
        this.changeCellColor(this.params, this.params.colDef.params.thresholdValueRel, this.params.colDef.params.modelResultDetailCol, )
    },
    methods: {
        openModelDetailNew(param) {
            this.parent.rowIndex = parseInt(param);
            let e = event || window.event;
            this.parent.globalDropDownBox = true;
            this.parent.globalDropLeft = e.clientX + "px";
            this.parent.globalDropTop = e.clientY + "px";
            clearTimeout(this.parent.timeOut); //清除计时器
            this.parent.timeOut = setTimeout(() => {
                this.parent.globalDropDownBox = false;
            }, 1000);
        },
        changeCellColor(params, thresholdValueRel, modelResultDetailCol) {
            if (thresholdValueRel) {
                let returnValue = handleDataManyValue(params, thresholdValueRel);
                //如果当该列是关联详细列又是阈值展现改变颜色列的时候做特殊处理
                //如果两种都存在则优先判断阈值，如果阈值成立则显示阈值颜色，阈值不成立则显示超链接颜色
                if (returnValue.toString().indexOf("<span") != -1) {
                    this.flag = 1;
                    this.backgroundColor = thresholdValueRel.colorInfo.backgroundColor;
                    this.fontColor = thresholdValueRel.colorInfo.fontColor;
                    this.title = thresholdValueRel.thresholdValue.thresholdValueMemo;
                    return returnValue;
                } else {
                    let dom = params.value;
                    if (modelResultDetailCol.indexOf(params.column.colId.toUpperCase()) != -1) {
                        this.flag = 2;
                    }
                    return dom;
                }
            } else {
                let dom = params.value;
                if (modelResultDetailCol.indexOf(params.column.colId.toUpperCase()) != -1) {
                    this.flag = 2;
                }
                return dom;
            }
        },
    }
});
