import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#00ACC1', // Teal (fishing theme)
            secondary: '#00897B', // Darker teal
            accent: '#FF6F61', // Coral accent for playfulness
            background: '#F5F9FA', // Very soft blue-grey
            surface: '#FFFFFF',
            error: '#EF5350', // Bright red, better contrast
            info: '#29B6F6', // Bright blue
            success: '#66BB6A', // Vibrant green
            warning: '#FFA726' // Bright orange
          }
        },
        dark: {
          colors: {
            primary: '#4DD0E1', // Brighter teal for dark mode
            secondary: '#26A69A',
            accent: '#FF8A80', // Bright coral for dark mode
            background: '#0D1B2A',
            surface: '#1B2838',
            error: '#EF5350',
            info: '#29B6F6',
            success: '#66BB6A',
            warning: '#FFA726'
          }
        }
      }
    },
    defaults: {
      VBtn: {
        style: 'text-transform: none;',
        rounded: 'xl', // More rounded for playful feel
        elevation: 0,
      },
      VCard: {
        rounded: 'xl', // More rounded corners
        elevation: 0,
        border: true,
        class: 'card-playful',
      },
      VTextField: {
        rounded: 'lg',
        variant: 'outlined',
      },
      VSelect: {
        rounded: 'lg',
        variant: 'outlined',
      },
      VAppBar: {
        elevation: 0,
      },
      VChip: {
        rounded: 'lg',
      },
      VProgressLinear: {
        rounded: 'pill',
      },
    }
  })

  nuxtApp.vueApp.use(vuetify)
})
