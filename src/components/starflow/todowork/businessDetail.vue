<template>
    <div>
        <div>
            <!-- <busDatas
                    ref="busDatas"
                    :versionUuid="versionUuid"
                    :appDataUuid="appDataUuid"
                    :applyType="applyType"
                    :flowSetup="flowSetup"
            ></busDatas> -->
            <component :is="bottomPanel"
            ref="busDatas"
            :versionUuid="this.versionUuid"
            />
            <button @click="qihuan()">切换页面</button>
        </div>
    </div>
</template>
<script>
// import busDatas from "ams-clue-vue/src/components/todowork/busDatas";// import InnerTab from "component/inner-tab";
const loadComponent = (value) => {
    return import(`./${value}`);
}

export default {
    components: {
        // busDatas,
    },// 监控某个变量的变化，来调用引入组件的函数
    watch: {
        activePage: {
            handler(value) {
                loadComponent(value).then(component => {
                    this.bottomPanel = component.default;
                });
            },
            immediate: true
        }
    },

    data() {
        return {
            versionUuid: "11",
            // appDataUuid: "",
            // applyType: "",
            activePage: 'index1', // 变量
            bottomPanel: null  // 定义组件
        };
    },
    props: ["versionUuid", "appDataUuid", "applyType", "flowSetup"],
    // mounted: function () {
    //   alert("ss")
    //   alert(this.appDataUuid)
    // },

    methods: {
        // 通过定义一个函数的方式来引入，传入一个参数，返回组件。
        // const loadComponent = value => import(`./components/${value}`),
        // 上面的简写如果有看不懂的，就看下面这个，就是定义一个函数！

        qihuan(){
            this.activePage= 'index'; // 变量
        },
        updateSave() {
            setTimeout(() => {
                this.$refs["busDatas"].updateSave();
            }, 20);
        }
    }
};
</script>