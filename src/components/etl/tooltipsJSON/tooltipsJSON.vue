<template>
  <div class="tooltips-model">
    <x-poptip trigger="click"
              placement="bottom-start">
      <pre :id="'result-' + id"
           class="result"></pre>
      <em class="iconfont"
          slot="reference">
        <slot name="reference"></slot>
      </em>
    </x-poptip>
  </div>
</template>
<script>
import { syntaxHighlight } from '@/components/etl/util/util'

export default {
  name: 'tooltips',
  data () {
    return {}
  },
  props: {
    JSON: String,
    id: Number
  },
  mounted () {
    $(`#result-${this.id}`).html(syntaxHighlight(this.JSON))
  }
}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
.tooltips-model {
  .result {
    border: 0;
    padding: 5px;
    background: #fff;
    font-size: 12px;
  }
  .string {
    color: green;
  }
  .number {
    color: darkorange;
  }
  .boolean {
    color: blue;
  }
  .null {
    color: magenta;
  }
  .key {
    color: red;
  }
}
</style>
