import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import initFacebookSdk from '@/_helpers/init-facebook-sdk'
import vue3GoogleLogin from 'vue3-google-login'

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import "css-ripple-effect/dist/ripple.min.css"

import mdiVue from 'mdi-vue/v3'
import * as mdijs from '@mdi/js'

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VUE_APP_GOOGLE_CLIENT_ID || ''

initFacebookSdk().then(createApp)

createApp(App)
    .use(mdiVue, {icons: mdijs})
    .use(vue3GoogleLogin, {
        clientId: googleClientId
    })
    .use(router)
    .mount('#app')
