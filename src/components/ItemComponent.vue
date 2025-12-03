<template>
  <ion-item button @click="toggleItem"> 
    
    <ion-checkbox
      v-if="item.type === 'todo'"
      :checked="isDone"  
      slot="start"
      aria-label="Завершено"
      class="custom-checkbox" 
    ></ion-checkbox>

    <ion-icon
      v-else-if="isDone"
      :icon="checkmarkCircle"
      slot="start"
      color="success"
      class="custom-icon"
    ></ion-icon>
    <ion-icon
      v-else
      :icon="ellipseOutline"
      slot="start"
      color="medium"
      class="custom-icon"
    ></ion-icon>
    
    <ion-label @contextmenu.prevent="openOptions($event)">
      <h2 :class="{ 'task-done': isDone }">{{ item.text }}</h2>
      <p v-if="item.type === 'habit'" class="habit-info">
        {{ item.frequency }} | Серия: {{ currentStreak.value }} {{ currentStreak.unit }}
      </p>
      <p v-else class="task-info">
        Задача ({{ isDone ? 'Завершено' : 'Активно' }})
      </p>
    </ion-label>
    
    <ion-icon
      v-if="item.type === 'todo'"
      :icon="item.isUrgent ? flag : flagOutline"
      :color="item.isUrgent ? 'danger' : 'medium'"
      @click.stop="todoStore.toggleUrgent(item.id)"
      class="urgent-flag"
    ></ion-icon>

    <slot />
         
  </ion-item>
  
  <EditModal 
    :is-open="isModalOpen" 
    :item="itemToEdit"
    :item-type="item.type" 
    @close="isModalOpen = false"
    @save="handleSave"
  />

  <HabitCalendarModal
      :is-open="isCalendarOpen"
      :habit="habitToView"
      @close="isCalendarOpen = false"
  />

</template>

<script setup>
import { 
  IonItem, IonLabel, IonCheckbox, IonIcon, actionSheetController
} from '@ionic/vue';
import { 
  checkmarkCircle, ellipseOutline, createOutline, trash, close, calendarOutline,
  flag, flagOutline // 🟢 НОВЫЕ ИКОНКИ ДЛЯ ФЛАГА
} from 'ionicons/icons';
import { computed, ref } from 'vue';
import { useTodoStore } from '@/stores/TodoStore'; 
import { useHabitStore } from '@/stores/HabitStore';
import EditModal from '@/components/EditModal.vue'; 
import HabitCalendarModal from '@/components/HabitCalendarModal.vue'; // 📅 Календарь

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const todoStore = useTodoStore();
const habitStore = useHabitStore();

const isModalOpen = ref(false);
const itemToEdit = ref(null);
const isCalendarOpen = ref(false); // 📅 Состояние модального окна календаря
const habitToView = ref(null); // 📅 Привычка для просмотра в календаре

// 🟢 ГЕТТЕРЫ
const currentStreak = computed(() => {
    if (props.item.type === 'habit') {
        // Вызываем новый геттер, который возвращает { value, unit }
        return habitStore.getCurrentStreak(props.item.id);
    }
    // Значение по умолчанию для задач
    return { value: 0, unit: 'дней' }; 
});

const isDone = computed(() => {
  if (props.item.type === 'habit') {
    // Используем геттер isCompletedToday
    return habitStore.isCompletedToday(props.item.id);
  }
  return props.item.done;
});

// 🟢 ЛОГИКА
const toggleItem = () => {
  if (props.item.type === 'habit') {
    // Переключение булевого состояния
    habitStore.toggleHabitToday(props.item.id);
  } else {
    // Переключение булевого состояния
    todoStore.toggleDone(props.item.id);
  }
};

const handleSave = (updatedItem) => {
  if (props.item.type === 'habit') {
    habitStore.editHabit(updatedItem);
  } else {
    // 💡 При редактировании задачи, updatedItem может содержать флаг isUrgent (из EditModal)
    todoStore.editTask(updatedItem); 
  }
};

const openOptions = async (e) => {
  e.stopPropagation();

  const isHabit = props.item.type === 'habit';
  
  const buttons = [
      {
        text: 'Редактировать',
        icon: createOutline, 
        handler: () => {
          itemToEdit.value = props.item; 
          isModalOpen.value = true;     
        },
      },
  ];

  if (isHabit) { // 📅 ДОБАВЛЯЕМ КНОПКУ КАЛЕНДАРЯ ТОЛЬКО ДЛЯ ПРИВЫЧЕК
      buttons.push({
          text: 'Календарь прогресса',
          icon: calendarOutline, 
          handler: () => {
              habitToView.value = props.item;
              isCalendarOpen.value = true;
          },
      });
  }

  buttons.push(
      {
        text: 'Удалить',
        role: 'destructive',
        icon: trash, 
        handler: () => {
          if (isHabit) {
            habitStore.removeHabit(props.item.id);
          } else {
            todoStore.removeTask(props.item.id);
          }
        },
      },
      {
        text: 'Отмена',
        icon: close,
        role: 'cancel',
      }
  );

  const actionSheet = await actionSheetController.create({
    header: props.item.text,
    buttons: buttons,
  });
  await actionSheet.present();
};
</script>

<style scoped>
.task-done {
  text-decoration: line-through;
  color: var(--ion-color-medium);
}
.habit-info, .task-info {
  font-size: 0.8em;
  color: var(--ion-color-medium);
}

/* 🟢 СТИЛИ ДЛЯ УНИФИКАЦИИ (РАЗМЕР КРУЖКА) */
.custom-checkbox {
  --border-radius: 50%; /* Круглая форма */
  --checkbox-background: var(--ion-color-medium); 
  --checkbox-background-checked: var(--ion-color-success); 
  --border-color: var(--ion-color-medium);
  --border-color-checked: var(--ion-color-success);
  --checkmark-color: var(--ion-color-light); /* Светлая галка, как на иконке */
  margin-right: 10px; 
  /* Фиксированный размер для унификации */
  width: 24px; 
  height: 24px;
}
.custom-checkbox:not([aria-checked="true"]) {
    --checkbox-background: transparent;
    border-width: 2px;
}

/* 🟢 Приводим размер иконок Привычек к размеру Чекбокса */
.custom-icon {
    font-size: 24px; /* Размер иконки */
    min-width: 24px; /* Минимальный размер */
    margin-inline-end: 10px; /* Отступ справа */
}

/* 🟢 СТИЛЬ ФЛАГА (чтобы он был в конце строки) */
.urgent-flag {
    margin-inline-start: 10px;
}
</style>
