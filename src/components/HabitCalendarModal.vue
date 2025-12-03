<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="$emit('close')">Закрыть</ion-button>
        </ion-buttons>
        <ion-title>Прогресс: {{ habit?.text }}</ion-title>
        <ion-buttons slot="end">
            <ion-button @click="changeMonth(-1)">
                <ion-icon :icon="chevronBack"></ion-icon>
            </ion-button>
            <ion-button @click="changeMonth(1)">
                <ion-icon :icon="chevronForward"></ion-icon>
            </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h2 class="ion-text-center">{{ monthName }} {{ currentYear }}</h2>

      <div class="calendar-grid">
        <div v-for="day in weekDays" :key="day" class="day-header">{{ day }}</div>
        
        <div v-for="n in firstDayOffset" :key="`offset-${n}`" class="day-cell empty"></div>
        
        <div 
            v-for="day in daysInMonth" 
            :key="day" 
            class="day-cell"
            :class="{ 'completed': isDayCompleted(day) }"
            @click="toggleCompletion(day)"
        >
          {{ day }}
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup>
import { 
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonContent, IonIcon 
} from '@ionic/vue';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { ref, computed } from 'vue';
import { useHabitStore } from '@/stores/HabitStore';

const props = defineProps({
  isOpen: Boolean,
  habit: Object, // Привычка, которую мы отслеживаем
});

const emit = defineEmits(['close']);
const habitStore = useHabitStore();

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const monthName = computed(() => monthNames[currentMonth.value]);

// 1. Вычисляемые дни в месяце и смещение
const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

const firstDayOffset = computed(() => {
  // Получаем день недели (0=Вс, 1=Пн, ..., 6=Сб)
  const dayIndex = new Date(currentYear.value, currentMonth.value, 1).getDay();
  // Преобразуем 0 (Вс) в 6, чтобы понедельник был 0
  const offset = (dayIndex === 0 ? 6 : dayIndex - 1); 
  return offset; 
});

// 2. Логика для отображения статуса
const completionHistory = computed(() => {
    if (!props.habit) return {};
    return habitStore.getCompletionHistory(props.habit.id);
});

const getISODate = (day) => {
    const month = String(currentMonth.value + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${currentYear.value}-${month}-${d}`;
}

const isDayCompleted = (day) => {
    const dateKey = getISODate(day);
    // Привычка считается выполненной, если счетчик > 0
    return completionHistory.value[dateKey] > 0;
}

// 3. Логика для переключения месяца
const changeMonth = (delta) => {
    const newDate = new Date(currentYear.value, currentMonth.value + delta, 1);
    currentMonth.value = newDate.getMonth();
    currentYear.value = newDate.getFullYear();
};

// 4. Логика для ручного переключения (нужно реализовать в Store)
const toggleCompletion = (day) => {
    if (!props.habit) return;
    const dateKey = getISODate(day);
    
    // ❗️ Здесь нам нужен action в HabitStore для переключения по дате!
    // Пока что просто выводим в консоль
    console.log(`Запланированное переключение ${props.habit.text} на дату ${dateKey}`);
};
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}

.day-header {
  font-weight: bold;
  padding: 5px 0;
  color: var(--ion-color-medium);
}

.day-cell {
  padding: 8px;
  border-radius: 50%;
  aspect-ratio: 1 / 1;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid var(--ion-color-light-shade);
  font-size: 0.9em;
  transition: background-color 0.2s;
}

.day-cell.empty {
  visibility: hidden;
  border: none;
}

.day-cell.completed {
  background-color: var(--ion-color-success);
  color: var(--ion-color-light);
  border-color: var(--ion-color-success);
}
</style>
