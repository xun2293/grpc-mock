var webpack = require('webpack');

module.exports = {
    configureWebpack: {
        plugins: [
            new webpack.IgnorePlugin(/^hiredis$/)
        ]
    },
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      var externals = {
        vue: 'Vue',
        axios: 'axios',
        'element-ui': 'ELEMENT',
        'vue-router': 'VueRouter',
        vuex: 'Vuex',
        jsoneditor: 'jsoneditor'
      };
      config.externals(externals);
      const cdn = {
        css: [
          // element-ui css
          'https://cdn.bootcdn.net/ajax/libs/element-ui/2.15.1/theme-chalk/index.css',
          // jsoneditor css
          'https://cdn.bootcdn.net/ajax/libs/jsoneditor/6.4.1/jsoneditor.min.css'
        ],
        js: [
          // vue
          'https://cdn.bootcdn.net/ajax/libs/vue/2.6.10/vue.min.js',
          // vue-router
          'https://cdn.bootcdn.net/ajax/libs/vue-router/3.5.1/vue-router.min.js',
          // vuex
          'https://cdn.bootcdn.net/ajax/libs/vuex/3.6.2/vuex.min.js',
          // axios
          'https://cdn.bootcdn.net/ajax/libs/axios/0.19.2/axios.min.js',
          // element-ui js
          'https://cdn.bootcdn.net/ajax/libs/element-ui/2.15.1/index.js',
          // jsoneditor js
          'https://cdn.bootcdn.net/ajax/libs/jsoneditor/6.4.1/jsoneditor.min.js'
        ]
      };
      // 通过 html-webpack-plugin 将 cdn 注入到 index.html 之中
      config.plugin('html')
        .tap(args => {
          args[0].cdn = cdn;
          return args
        })
    }
  }
};
