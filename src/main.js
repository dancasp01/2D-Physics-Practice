import { createApp } from 'vue'
import App from './App.vue'
import '@aero-inc/aero-ui/themes/aero.css'
import '@aero-inc/aero-ui/styles.css'
import '@aero-inc/aero-ui/app.css'

import { useIcons } from '@aero-inc/aero-ui'

const { registerIcons } = useIcons()
registerIcons("aero") // "leaf"

createApp(App).mount('#app')
