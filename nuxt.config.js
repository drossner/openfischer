export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'OpenFischer',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
      { mobileAppIOS: true },
      { name: 'google-site-verification', content: '-1lN2-ycnPkWFcVeIJbR_MleKm3Q-cT8T9F-e6uoKvA'}
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // With options
    ['@nuxtjs/localforage', { /* module options */ }],
    '@nuxt/image',
    ['@nuxtjs/fontawesome', {
      icons: {
        solid: ['faShare', 'faGear', 'faShareNodes', 'faTrashCan', 'faDownload', 'faCheck', 'faX', 'faSun', 'faMoon', 'faRotate', 'faCircleCheck', 'faHourglass']
      },
    }]
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxt/content',
  ],

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      name: 'OpenFischer',
      description: 'Freie Übungsplattform für die bayerische Fischereiprüfung.',
      lang: 'de'
    }
  },

  generate: {
    fallback: '404.html'
  },

  localforage: {
    instances: [{
      name: 'nuxtJS',
      storeName: 'nuxtLocalForage'
    }, {
      name: 'meta',
      storeName: 'meta'
    }]
  },

  router: {
    base: '/openfischer/'
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
