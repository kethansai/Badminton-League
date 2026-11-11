import { createApp } from 'vue'
import '@fontsource/anton/latin-400.css'
import '@fontsource/barlow/latin-400.css'
import '@fontsource/barlow/latin-500.css'
import '@fontsource/barlow/latin-600.css'
import '@fontsource/barlow/latin-700.css'
import '@fontsource/barlow-condensed/latin-500.css'
import '@fontsource/barlow-condensed/latin-600.css'
import '@fontsource/barlow-condensed/latin-700.css'
import './assets/style.css'
import App from './App.vue'
import { createAppRouter } from './router.js'

const app = createApp(App)
const router = createAppRouter()

app.use(router)
router.isReady().then(() => app.mount('#app'))
