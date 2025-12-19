// src/utils/soundNotifications.js
// Звуковые уведомления с использованием Web Audio API

class SoundNotifications {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.3; // 30% громкости по умолчанию

    // Загружаем настройки из localStorage
    this.loadSettings();
  }

  // Инициализация AudioContext (ленивая загрузка)
  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Загрузка настроек из localStorage
  loadSettings() {
    const settings = localStorage.getItem('app_settings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        this.enabled = parsed.soundNotifications !== false; // По умолчанию включено
        this.volume = parsed.soundVolume || 0.3;
      } catch (e) {
        console.error('Error loading sound settings:', e);
      }
    }
  }

  // Сохранение настроек
  saveSettings() {
    const currentSettings = localStorage.getItem('app_settings');
    let settings = {};

    if (currentSettings) {
      try {
        settings = JSON.parse(currentSettings);
      } catch (e) {
        console.error('Error parsing settings:', e);
      }
    }

    settings.soundNotifications = this.enabled;
    settings.soundVolume = this.volume;

    localStorage.setItem('app_settings', JSON.stringify(settings));
  }

  // Включить/выключить звуки
  setEnabled(enabled) {
    this.enabled = enabled;
    this.saveSettings();
  }

  // Установить громкость (0.0 - 1.0)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  // Воспроизвести звук с заданными параметрами
  playSound(frequency, duration, type = 'sine') {
    if (!this.enabled) return;

    try {
      const ctx = this.initAudioContext();

      // Создаём осциллятор
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      // Настраиваем громкость с плавным затуханием
      gainNode.gain.setValueAtTime(this.volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  // Воспроизвести последовательность нот
  playSequence(notes) {
    if (!this.enabled) return;

    try {
      const ctx = this.initAudioContext();
      let time = ctx.currentTime;

      notes.forEach(note => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = note.type || 'sine';
        oscillator.frequency.value = note.frequency;

        gainNode.gain.setValueAtTime(this.volume * (note.volume || 1), time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + note.duration);

        oscillator.start(time);
        oscillator.stop(time + note.duration);

        time += note.duration + (note.gap || 0);
      });
    } catch (error) {
      console.error('Error playing sound sequence:', error);
    }
  }

  // =====================
  // ПРЕДУСТАНОВЛЕННЫЕ ЗВУКИ
  // =====================

  // Успешное действие (мягкий, приятный звук)
  success() {
    this.playSequence([
      { frequency: 523.25, duration: 0.1, type: 'sine' },  // C5
      { frequency: 659.25, duration: 0.15, type: 'sine' }, // E5
    ]);
  }

  // Ошибка (низкий, предупреждающий звук)
  error() {
    this.playSequence([
      { frequency: 200, duration: 0.15, type: 'sawtooth', volume: 0.8 },
      { frequency: 150, duration: 0.2, type: 'sawtooth', volume: 0.8 },
    ]);
  }

  // Предупреждение (средний тон)
  warning() {
    this.playSequence([
      { frequency: 400, duration: 0.1, type: 'square', volume: 0.7 },
      { frequency: 400, duration: 0.1, type: 'square', volume: 0.7, gap: 0.05 },
    ]);
  }

  // Информация (нейтральный звук)
  info() {
    this.playSound(600, 0.12, 'sine');
  }

  // Новое уведомление (приятный двойной звук)
  notification() {
    this.playSequence([
      { frequency: 800, duration: 0.08, type: 'sine', volume: 0.8 },
      { frequency: 1000, duration: 0.12, type: 'sine', gap: 0.02 },
    ]);
  }

  // Новое сообщение (короткий звук)
  message() {
    this.playSound(880, 0.1, 'triangle');
  }

  // Клик/нажатие (очень короткий звук)
  click() {
    this.playSound(1200, 0.05, 'square');
  }

  // Упоминание (@mention)
  mention() {
    this.playSequence([
      { frequency: 1000, duration: 0.08, type: 'sine', volume: 0.9 },
      { frequency: 1200, duration: 0.08, type: 'sine', volume: 0.9, gap: 0.03 },
      { frequency: 1400, duration: 0.1, type: 'sine', volume: 0.9, gap: 0.03 },
    ]);
  }

  // Завершение задачи (восходящая мелодия)
  taskComplete() {
    this.playSequence([
      { frequency: 523.25, duration: 0.1, type: 'sine' },  // C5
      { frequency: 659.25, duration: 0.1, type: 'sine' },  // E5
      { frequency: 783.99, duration: 0.15, type: 'sine' }, // G5
    ]);
  }

  // Новая задача назначена
  taskAssigned() {
    this.playSequence([
      { frequency: 700, duration: 0.1, type: 'sine', volume: 0.8 },
      { frequency: 900, duration: 0.12, type: 'sine', gap: 0.02 },
    ]);
  }

  // Комментарий
  comment() {
    this.playSequence([
      { frequency: 600, duration: 0.08, type: 'triangle', volume: 0.7 },
      { frequency: 750, duration: 0.1, type: 'triangle', gap: 0.02 },
    ]);
  }

  // Дедлайн приближается
  deadline() {
    this.playSequence([
      { frequency: 450, duration: 0.12, type: 'square', volume: 0.8 },
      { frequency: 450, duration: 0.12, type: 'square', volume: 0.8, gap: 0.08 },
      { frequency: 450, duration: 0.15, type: 'square', volume: 0.8, gap: 0.08 },
    ]);
  }

  // Приглашение
  invitation() {
    this.playSequence([
      { frequency: 800, duration: 0.1, type: 'sine', volume: 0.8 },
      { frequency: 1000, duration: 0.1, type: 'sine', gap: 0.03 },
      { frequency: 1200, duration: 0.12, type: 'sine', gap: 0.03 },
    ]);
  }

  // Универсальный метод для воспроизведения по типу
  play(soundType) {
    switch (soundType) {
      case 'task_assigned':
        this.taskAssigned();
        break;
      case 'comment':
        this.comment();
        break;
      case 'mention':
        this.mention();
        break;
      case 'deadline':
        this.deadline();
        break;
      case 'success':
        this.success();
        break;
      case 'invitation':
        this.invitation();
        break;
      case 'task_complete':
        this.taskComplete();
        break;
      case 'default':
      default:
        this.notification();
    }
  }
}

// Экспортируем синглтон
export default new SoundNotifications();
