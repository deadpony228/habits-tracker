import { createRouter, createWebHistory } from '@ionic/vue-router';
import TabsLayout from '@/views/TabsLayout.vue'; // Создадим этот файл на следующем шаге

import TodoListPage from '@/views/TodoListPage.vue';
import HabitTrackerPage from '@/views/HabitTrackerPage.vue';

const routes = [
  {
    path: '/',
    component: TabsLayout, // Используем общий макет с вкладками
    children: [
      {
        path: '', // Редирект на первую вкладку
        redirect: '/todo',
      },
      {
        path: 'todo', // Список дел
        name: 'Todo',
        component: () => import('@/views/TodoListPage.vue'),
      },
      {
        path: 'habits', // Трекер привычек
        name: 'Habits',
        component: () => import('@/views/HabitTrackerPage.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
