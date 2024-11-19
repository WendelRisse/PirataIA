import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from './components/LoginPage.vue';  // Página de Login
import HelloWorld from './components/HelloWorld.vue';  // Chatbot (HelloWorld)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage,  // Página de login
  },
  {
    path: '/chatbot',
    name: 'Chatbot',
    component: HelloWorld,  // Página do chatbot
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
