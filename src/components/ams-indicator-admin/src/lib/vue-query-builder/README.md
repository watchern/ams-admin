Vue版的query builder.

源地址：https://github.com/dabernathy89/vue-query-builder

由于作者比较纠结是否应该在前端进行sql转化而没有加这个功能/😂，所把它搬过来简单的加上了将json条件转化为sql的功能。

插件本身似乎还是有些bug或者不完善的地方，如若使用还是得拿下来改巴改巴。

``` 
 <vue-query-builder :rules="rules" v-model="output" :labels="labels" @sql="getSql"></vue-query-builder>

... 省略其他
methods: {
    getSql(sql){
      console.log(sql)
    }
... 省略其他
```

![输入图片说明](https://images.gitee.com/uploads/images/2020/0728/001538_789cc538_1537128.png "屏幕截图.png")

以下是源内容：

------


Vue Query Builder
======


#### A UI component for building complex queries with nested conditionals.

Vue Query Builder is a user interface that makes it easy for your users to create queries of any kind. It's useful if you need an interface for generating reports, filtering data, and more.


[Demo and documentation](https://dabernathy89.github.io/vue-query-builder/)

![Demo Screenshot](https://raw.githubusercontent.com/dabernathy89/vue-query-builder/master/public/demo-screenshot.png "Demo screenshot")