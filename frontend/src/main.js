import { createApp } from 'vue'
import './assets/style.css'
import App from './App.vue'
import { createAppRouter } from './router.js'

const app = createApp(App)
const router = createAppRouter()

app.use(router)
router.isReady().then(() => app.mount('#app'))
