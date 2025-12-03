<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Мои дела</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true"> 
      
        <ion-list>
          <ItemComponent
            v-for="task in todoList" 
            :key="task.id"
            :item="task"
          >
          </ItemComponent>
        </ion-list>
      
      <div v-if="todoStore.totalTasks === 0" class="empty-state">
        <p>Список задач пуст. Добавьте первую задачу!</p>
      </div>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="openCreationModal('todo')"> 
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>

      <EditModal 
        :is-open="isModalOpen" 
        :item="itemToEdit" 
        item-type="todo"
        @close="closeModal" 
        @create="handleCreate"
      />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, 
  IonFab, IonFabButton, IonIcon, 
} from '@ionic/vue';
import { add } from 'ionicons/icons';
import { computed, ref, onMounted, onUnmounted } from 'vue'; 
import ItemComponent from '@/components/ItemComponent.vue';
import EditModal from '@/components/EditModal.vue';
import { useTodoStore } from '@/stores/TodoStore';

import { Capacitor } from '@capacitor/core';

const todoStore = useTodoStore();

const todoList = computed(() => {
    return todoStore.sortedTasks; 
});

const isModalOpen = ref(false); 
const itemToEdit = ref(null);

// 🟢 ФУНКЦИЯ: Запуск очистки в TodoStore
const runCleanup = () => {
    todoStore.cleanupTimedTasks(); 
};


// 🟢 ФУНКЦИЯ: Инкапсулируем логику и импорты Capacitor
const setupCapacitorHooks = async () => {
    
    if (!Capacitor.isNative) {
        return;
    }
    
    // 🚀 ДИНАМИЧЕСКИЙ ИМПОРТ
    const { App } = await import('@capacitor/app');
    const { BackgroundTask } = await import('@capawesome/capacitor-background-task');

    // 🟢 ФУНКЦИЯ: Регистрация фоновой задачи Capacitor
    const registerBackgroundTask = () => {
        runCleanup();
        BackgroundTask.beforeExit(async () => {
            runCleanup();
            BackgroundTask.finish(); 
        });
    };

    // 2. Подписываемся на события приложения
    App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
            runCleanup(); 
        } else {
            registerBackgroundTask();
        }
    });
};

let cleanupInterval = null;

onMounted(() => {
    // 1. Устанавливаем интервал для обновления списка
    runCleanup(); 
    cleanupInterval = setInterval(() => {
        runCleanup(); // <-- ИСПРАВЛЕНО: вызов runCleanup() для единообразия
    }, 10 * 1000); 

    // 2. Устанавливаем хуки Capacitor (для очистки при выходе)
    setupCapacitorHooks();
});


// 🚀 Очищаем таймер, когда пользователь покидает страницу
onUnmounted(() => {
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
    }
});

const openCreationModal = (type) => {
    itemToEdit.value = null;
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

const handleCreate = (payload) => {
    todoStore.addTask(payload.text, payload.isUrgent); 
};

</script>

<style scoped>
.empty-state {
  text-align: center;
  margin-top: 50px;
  color: #666;
}
</style>
