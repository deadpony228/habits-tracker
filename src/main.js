import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Импортируем Pinia */
import { createPinia } from 'pinia';

/* Создаем экземпляр Pinia */
const pinia = createPinia();

const app = createApp(App)
  .use(IonicVue)
  .use(router)
  /* Используем Pinia */
  .use(pinia);
  
router.isReady().then(() => {
  app.mount('#app');
});
