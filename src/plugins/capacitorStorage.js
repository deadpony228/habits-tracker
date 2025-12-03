import { Preferences } from '@capacitor/preferences';

// Проверка доступности Capacitor (для корректной работы в браузере и на эмуляторе)
const isCapacitorAvailable = typeof Preferences.get === 'function';
const fallbackStorage = isCapacitorAvailable ? null : window.localStorage; 

export const capacitorStorage = {
  // 1. ПОЛУЧЕНИЕ ДАННЫХ (Критически важно для загрузки)
  async getItem(key) {
    if (isCapacitorAvailable) {
      try {
        // !!! ДОБАВЛЕНА ОБРАБОТКА ОШИБОК !!!
        const { value } = await Preferences.get({ key });
        return value;
      } catch (e) {
        console.error(`Ошибка загрузки данных Pinia Persist для ключа ${key}:`, e);
        // Если ошибка, возвращаем null. Pinia Persist не сбрасывает состояние, 
        // если получает null/undefined, но в этом случае мы не получим данные.
        // Поэтому лучше использовать запасной вариант, если он есть, или 
        // просто возвращать null, чтобы не сбрасывать состояние, если Preferences не готовы.
        return null;
      }
    }
    // Запасной вариант для браузера
    return fallbackStorage?.getItem(key) || null;
  },

  // 2. СОХРАНЕНИЕ ДАННЫХ (обновление при изменении)
  async setItem(key, value) {
    if (isCapacitorAvailable) {
      try {
        // !!! ДОБАВЛЕНА ОБРАБОТКА ОШИБОК !!!
        await Preferences.set({ key, value });
      } catch (e) {
        console.error(`Ошибка сохранения данных Pinia Persist для ключа ${key}:`, e);
      }
    } else {
      fallbackStorage?.setItem(key, value);
    }
  },

  // 3. УДАЛЕНИЕ ДАННЫХ
  async removeItem(key) {
    if (isCapacitorAvailable) {
      try {
        await Preferences.remove({ key });
      } catch (e) {
        console.error(`Ошибка удаления данных Pinia Persist для ключа ${key}:`, e);
      }
    } else {
      fallbackStorage?.removeItem(key);
    }
  },
};
