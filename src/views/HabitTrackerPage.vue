<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Трекер привычек</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-list>
        <ItemComponent
          v-for="habit in habitStore.allHabits"
          :key="habit.id"
          :item="habit"
        />
      </ion-list>

      <div v-if="habitStore.allHabits.length === 0" class="empty-state">
        <p>Список привычек пуст. Добавьте первую привычку!</p>
      </div>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="openCreationModal('habit')"> 
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>

      <EditModal 
        :is-open="isModalOpen" 
        :item="itemToEdit" 
        item-type="habit"
        @close="closeModal" 
        @create="handleCreate"
        @save="habitStore.editHabit"
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
import { ref } from 'vue';
import ItemComponent from '@/components/ItemComponent.vue';
import EditModal from '@/components/EditModal.vue';
import { useHabitStore } from '@/stores/HabitStore'; 

const habitStore = useHabitStore(); 

// 🟢 ПРАВИЛЬНОЕ ОБЪЯВЛЕНИЕ ПЕРЕМЕННЫХ
const isModalOpen = ref(false); 
const itemToEdit = ref(null);

const openCreationModal = () => {
  // itemToEdit.value = null; гарантирует, что модальное окно откроется в режиме "Создать"
  itemToEdit.value = null;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

// 🟢 Обработчик события 'create'
const handleCreate = (payload) => {
  habitStore.addHabit(payload.text, payload.frequency, payload.target); 
};
</script>

<style scoped>
.empty-state {
  text-align: center;
  margin-top: 50px;
  color: #666;
}
</style>
