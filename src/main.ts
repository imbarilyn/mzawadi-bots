import {createApp} from 'vue'
import {createPinia} from "pinia";
import './styles.css'
import './assets/material-icons/material-icons.css'
import App from './App.vue'
import router from './router'
import vue3GoogleLogin from 'vue3-google-login'

createApp(App)
  .use(router)
  .use(createPinia())
  .use(vue3GoogleLogin, {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID as string
    // clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET as string,
  })
  .mount('#app')
