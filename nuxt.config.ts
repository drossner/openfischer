import vuetify from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false, // Client-side only (SPA mode)

  compatibilityDate: '2024-01-01',

  app: {
    baseURL: '/',
    head: {
      title: 'OpenFischer',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Freie Übungsplattform für die bayerische Fischereiprüfung. Kostenlos üben und vorbereiten.'
        }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  modules: [
    '@nuxt/content',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins = config.plugins || []
        config.plugins.push(vuetify({ autoImport: true }))
      })
    }
  ],

  css: [
    '@mdi/font/css/materialdesignicons.css',
    '~/assets/css/main.css'
  ],

  build: {
    transpile: ['vuetify']
  },

  nitro: {
    preset: 'node-server',
    routeRules: {
      '/**': {
        headers: {
          // Prevent clickjacking
          'X-Frame-Options': 'DENY',

          // Prevent MIME type sniffing
          'X-Content-Type-Options': 'nosniff',

          // Enable XSS protection (legacy browsers)
          'X-XSS-Protection': '1; mode=block',

          // Enforce HTTPS in production
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

          // Content Security Policy
          'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'", // Nuxt requires unsafe-inline (waiting for native CSP support)
            "style-src 'self' 'unsafe-inline'", // Vuetify requires inline styles
            "font-src 'self' data:", // Only our fonts (MDI) + data URIs
            "img-src 'self' data:", // Only our images + data URIs (Base64)
            "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'"
          ].join('; '),

          // Permissions Policy - disable unnecessary browser features
          'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
        }
      }
    }
  },

  runtimeConfig: {
    // Server-side only (never exposed to client, available at runtime from env vars)
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',

    // Exposed to client (note: in SPA mode, this is baked in at build time, not runtime)
    public: {
      googleClientId: process.env.GOOGLE_CLIENT_ID || ''
    }
  },

  content: {
    // @nuxt/content configuration
    documentDriven: false,
    markdown: {
      anchorLinks: false
    }
  },

  pwa: {
    registerType: 'autoUpdate', // Auto-update when new version available
    manifest: {
      name: 'OpenFischer',
      short_name: 'OpenFischer',
      description: 'Freie Übungsplattform für die bayerische Fischereiprüfung',
      lang: 'de',
      theme_color: '#1976D2',
      background_color: '#ffffff',
      display: 'standalone', // Looks like native app when installed
      start_url: '/',
      icons: [
        {
          src: '/icon.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable' // Better mobile icon display
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,ico,json}'], // Added .json for catalog
      runtimeCaching: [
        {
          // Cache API calls with network-first strategy
          urlPattern: /\/api\/.*/i,
          handler: 'NetworkFirst', // Try network first, fall back to cache
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 // 1 hour
            }
          }
        }
      ]
    },
    devOptions: {
      enabled: false // Service worker disabled in dev (less confusing)
    }
  }
})
