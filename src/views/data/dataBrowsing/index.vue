<template>
  <div>
    <query-tags :dropDownData="dropDownData" @change="onChange"></query-tags>
  </div>
</template>

<script>
import queryTags from "@/components/queryTags";
export default {
  name: "dataBrowsing",
  components: {
    queryTags,
  },
  props: [],
  data() {
    return {
      dropDownData: ["测试","测试11111"],
    };
  },
  computed: {},
  watch: {},
  mounted() {},
  methods: {
    onChange(data) {
      console.log(data, "data");
    },
  },
};
</script>

<style lang="scss" scoped></style>
