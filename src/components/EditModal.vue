<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="$emit('close')">Отмена</ion-button>
        </ion-buttons>
        
        <ion-title>
          {{ isCreationMode ? 'Добавить' : 'Редактировать' }} {{ itemType === 'habit' ? 'Привычку' : 'Задачу' }}
        </ion-title>
        
        <ion-buttons slot="end">
          <ion-button :strong="true" @click="saveChanges" :disabled="!editedText">
            Сохранить
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      
      <ion-list lines="full"> 
        <ion-item>
          <ion-input
            label="Текст"
            label-placement="floating"
            placeholder="Введите описание"
            v-model="editedText"
          ></ion-input>
        </ion-item>

        <template v-if="itemType === 'habit'"> 
          <ion-item>
            <ion-select label="Частота" label-placement="floating" v-model="editedFrequency">
              <ion-select-option value="daily">Ежедневно</ion-select-option>
              <ion-select-option value="weekly">Еженедельно</ion-select-option>
              <ion-select-option value="monthly">Ежемесячно</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item v-if="editedFrequency === 'weekly'">
            <ion-select label="День недели" label-placement="floating" v-model="editedRequiredDay">
              <ion-select-option value="MO">Понедельник</ion-select-option>
              <ion-select-option value="TU">Вторник</ion-select-option>
              <ion-select-option value="WE">Среда</ion-select-option>
              <ion-select-option value="TH">Четверг</ion-select-option>
              <ion-select-option value="FR">Пятница</ion-select-option>
              <ion-select-option value="SA">Суббота</ion-select-option>
              <ion-select-option value="SU">Воскресенье</ion-select-option>
            </ion-select>
          </ion-item>
          </template>
      </ion-list>

    </ion-content>
  </ion-modal>
</template>

<script setup>
import { 
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonContent, IonItem, IonInput, IonList, IonSelect, IonSelectOption 
} from '@ionic/vue';
import { ref, watch, computed } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  item: Object, // Текущий элемент для редактирования (будет null в режиме создания)
  itemType: { // 'todo' или 'habit'
    type: String,
    required: true
  }
});

const emit = defineEmits(['close', 'save', 'create']); 

const editedText = ref('');
const editedFrequency = ref('daily');
const editedRequiredDay = ref(null);
// 🟢 НОВОЕ СОСТОЯНИЕ: для сохранения флага срочности при редактировании
const editedIsUrgent = ref(false); 


const isCreationMode = computed(() => !props.item || !props.item.id);
const isHabit = computed(() => props.itemType === 'habit'); 

// Сброс и синхронизация при изменении item
watch([() => props.item, () => props.itemType, () => props.isOpen], ([newItem]) => {
  if (props.isOpen) {
    if (!isCreationMode.value) {
      // РЕЖИМ РЕДАКТИРОВАНИЯ
      editedText.value = newItem.text || '';
      if (props.itemType === 'habit') {
        editedFrequency.value = newItem.frequency || 'daily';
        editedRequiredDay.value = newItem.requiredDay || 'SU';
      } else {
        // 🟢 СИНХРОНИЗАЦИЯ: сохраняем текущий флаг срочности для передачи обратно
        editedIsUrgent.value = newItem.isUrgent || false;
      }
    } else {
      // РЕЖИМ СОЗДАНИЯ: Сброс к дефолтным значениям
      editedText.value = '';
      editedFrequency.value = 'daily';
      editedIsUrgent.value = false; // Сброс для создания
    }
  }
}, { immediate: true });

const saveChanges = () => {
  if (!editedText.value.trim()) return;

  const payload = {
    text: editedText.value.trim(),
  };

  if (isHabit.value) {
    payload.frequency = editedFrequency.value;
    
    if (payload.frequency === 'weekly') {
      payload.requiredDay = editedRequiredDay.value; 
    } else {
      payload.requiredDay = null;
    }
  } else {
     // 🟢 ДЛЯ ЗАДАЧ: возвращаем флаг в payload, чтобы не потерять его
    payload.isUrgent = editedIsUrgent.value;
  }
  
  if (isCreationMode.value) {
    emit('create', payload);
  } else {
    emit('save', {
      ...payload,
      id: props.item.id,
    });
  }
  emit('close');
};

</script>
