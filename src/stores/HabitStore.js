import { defineStore } from 'pinia';
// УДАЛЕНО: import { capacitorStorage } from '@/plugins/capacitorStorage';

// Вспомогательная функция для получения даты в формате YYYY-MM-DD
const getISODate = (date) => date.toISOString().split('T')[0];

export const useHabitStore = defineStore('habit', {
  state: () => ({
    habits:[],
  }),

  getters: {
    allHabits: (state) => state.habits,
    
    getCompletionStatus: (state) => (habitId, date = new Date()) => {
      const dateKey = getISODate(date);
      const habit = state.habits.find(h => h.id === habitId);
      return habit?.completionHistory[dateKey] || false; 
    },
    
    isCompletedToday() {
      return (habitId) => this.getCompletionStatus(habitId);
    },

    getCompletionHistory: (state) => (habitId) => {
        const habit = state.habits.find(h => h.id === habitId);
        return habit?.completionHistory || {};
    },
    
    // ... getCurrentStreak без изменений
    getCurrentStreak(state) {
        return (habitId) => {
            const habit = state.habits.find(h => h.id === habitId);
            if (!habit) return { value: 0, unit: 'дней' };

            let streakCount = 0;
            let checkDate = new Date();
            const dayInMillis = 24 * 60 * 60 * 1000;
            const requiredDaysArr = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
            const requiredDayIndex = requiredDaysArr.indexOf(habit.requiredDay);
            
            const isDailyLike = habit.frequency === 'daily' || !habit.requiredDay;

            const todayIndex = checkDate.getDay();
            const isRequiredToday = isDailyLike || (requiredDayIndex === todayIndex);

            if (isRequiredToday && this.getCompletionStatus(habitId, checkDate)) {
                streakCount = 1;
            } else if (isRequiredToday && !this.getCompletionStatus(habitId, checkDate)) {
                return { value: 0, unit: 'дней' };
            }
            
            checkDate = new Date(checkDate.getTime() - dayInMillis);
            
            while(true) {
                const dayIndex = checkDate.getDay(); 
                const isRequiredDay = isDailyLike || (requiredDayIndex === dayIndex);

                if (isRequiredDay) {
                    if (this.getCompletionStatus(habitId, checkDate)) {
                        streakCount++;
                    } else {
                        break;
                    }
                }
                
                if (streakCount > 365 * 10) break;
                
                checkDate = new Date(checkDate.getTime() - dayInMillis);
            }

            let streakDisplayValue = streakCount;
            let streakDisplayUnit = 'дней';
            
            if (habit.frequency === 'weekly' && streakDisplayValue >= 7 && habit.requiredDay) {
                 streakDisplayValue = Math.floor(streakDisplayValue / 7);
                 streakDisplayUnit = (streakDisplayValue === 1) ? 'неделя' : 'недель';
            } else if (habit.frequency === 'monthly' && streakDisplayValue >= 28) {
                 streakDisplayValue = Math.floor(streakDisplayValue / 30);
                 streakDisplayUnit = (streakDisplayValue === 1) ? 'месяц' : 'месяцев';
            }

            return { value: streakDisplayValue, unit: streakDisplayUnit };
        }
    }
  },

  actions: {
    // 1. Отметка выполнения привычки на сегодня (булево переключение)
    toggleHabitToday(id) {
      const habit = this.habits.find((h) => h.id === id);
      if (habit) {
        const today = getISODate(new Date());
        
        if (habit.requiredDay) {
          const currentDayIndex = new Date().getDay();
          const requiredDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
          const requiredDayIndex = requiredDays.indexOf(habit.requiredDay);
          if (currentDayIndex !== requiredDayIndex) {
            return; 
          }
        }
        
        const isCurrentlyCompleted = habit.completionHistory[today] || false;
        
        if (isCurrentlyCompleted) {
          delete habit.completionHistory[today];
        } else {
          habit.completionHistory[today] = true;
        }
      }
    },
    
    // 2. Добавление новой привычки
    addHabit(text, frequency = 'daily', requiredDay = null) { 
      if (!text.trim()) return;
      const newHabit = {
        id: Date.now(),
        text: text.trim(),
        type: 'habit',
        frequency,
        completionHistory: {},
        requiredDay,
      };
      this.habits.push(newHabit);
    },

    // 3. Удаление привычки
    removeHabit(id) {
      this.habits = this.habits.filter((h) => h.id !== id);
    },

    // 4. Редактирование привычки
    editHabit(updatedItem) {
      const index = this.habits.findIndex((h) => h.id === updatedItem.id);
      if (index !== -1) {
        this.habits[index].text = updatedItem.text;
        this.habits[index].frequency = updatedItem.frequency;
        this.habits[index].requiredDay = updatedItem.requiredDay;
      }
    },
  },

  persist: {
    key: 'habit_tracker',
    // ИЗМЕНЕНИЕ: Использование localStorage для синхронной записи
    storage: localStorage,
  },
});
