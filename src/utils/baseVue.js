export default function (config) {
    let {
        targetel=""
    } = config;
    return {
        data () {
            return {
                autoHeight: 0,
                last: null
            }
        },
        created() {
            console.log(targetel);
        },
        mounted () {
            window.addEventListener('resize', () => {
                let timer = null
                let timeout = 2000
                return (() => {
                    let now = +new Date()
                    if (this.last && now - this.last <timeout) {
                        clearInterval(timeout)
                        timer = setTimeout(() => {
                            this.last = now
                            this.getAutoHeight()
                        }, timeout)
    
                    } else {
                        this.last = now;
                        this.getAutoHeight()
                    }
                })
            })
        },
        updated () {
            this.getAutoHeight()
        },
        methods: {
            getAutoHeight () {
                this.$nextTick(() => {
                    if (this.$refs[targetel] && this.$refs[targetel].$el) {
                        this.autoHeight = window.innerHeight - (this.$refs[targetel].$el.getBoundingClientRect().top +142)
                    }
                })
            }
        }
    }

}