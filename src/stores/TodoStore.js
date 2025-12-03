import { defineStore } from 'pinia';

export const useTodoStore = defineStore('todo', {
  state: () => ({
    tasks: [],
  }),

  getters: {
    totalTasks: (state) => state.tasks.length,
    undoneTasks: (state) => state.tasks.filter((task) => !task.done).length,
    
    sortedTasks: (state) => {
      return [...state.tasks].sort((a, b) => {
        // 1. Сортировка по статусу: Незавершенные идут первыми
        const doneA = a.done ? 1 : 0;
        const doneB = b.done ? 1 : 0;
        if (doneA !== doneB) {
            return doneA - doneB;
        }

        // 2. Сортировка по срочности: Срочные идут первыми
        const urgentA = a.isUrgent ? 1 : 0;
        const urgentB = b.isUrgent ? 1 : 0;
        if (urgentA !== urgentB) {
            return urgentB - urgentA;
        }

        // 3. Сортировка по ID (по времени создания)
        return a.id > b.id ? 1 : -1;
      });
    },
  },

  actions: {
    addTask(text, isUrgent = false) {
      if (!text.trim()) return;
      const newTask = {
        id: Date.now(),
        text: text.trim(),
        done: false,
        type: 'todo',
        isUrgent,
      };
      this.tasks.push(newTask);
    },

    toggleDone(id) {
      const task = this.tasks.find((t) => t.id === id);
      if (task) {
        task.done = !task.done;
        
        if (task.done) {
            task.doneAt = Date.now();
        } else {
            delete task.doneAt; 
        }
      }
    },

    removeTask(id) {
      this.tasks = this.tasks.filter((t) => t.id !== id);
    },

    editTask(updatedItem) {
      const index = this.tasks.findIndex((t) => t.id === updatedItem.id);
      if (index !== -1) {
        this.tasks[index].text = updatedItem.text;
        if (updatedItem.isUrgent !== undefined) {
             this.tasks[index].isUrgent = updatedItem.isUrgent; 
        }
      }
    },
    
    toggleUrgent(id) {
        const task = this.tasks.find((t) => t.id === id);
        if (task && task.type === 'todo') {
            task.isUrgent = !task.isUrgent;
        }
    },

    // 🧹 Action для очистки задач, выполненных более 1 минуты назад
    cleanupTimedTasks() {
        const oneMinuteAgo = Date.now() - (60 * 1 * 1000); // 1 минута
        
        this.tasks = this.tasks.filter(task => {
            if (task.type !== 'todo') { return true; }
            if (!task.done) { return true; }
            if (!task.doneAt) { 
                return true; 
            }
            if (task.doneAt > oneMinuteAgo) { return true; }
            return false;
        });
    },
  },

  persist: {
    key: 'todo_tasks-clean',
    storage: localStorage,
  },
});
