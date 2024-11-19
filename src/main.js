import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Importa o roteador

createApp(App).use(router).mount('#app'); // Usa o roteador no app
