// src/services/ai.service.js
// AI Service с GigaChat (Сбер) через Vite proxy

import { AI_CONFIG, checkAIConfig } from '../config/ai';

// Глобальный лог AI обмена для дебаггера
if (!window.aiLogs) window.aiLogs = [];

const logAI = (type, data) => {
  const entry = {
    type, // 'request' | 'response' | 'error'
    data,
    timestamp: new Date().toISOString(),
  };
  window.aiLogs.push(entry);
  console.log(`🤖 AI Log [${type}]:`, entry);
  // Ограничиваем размер лога
  if (window.aiLogs.length > 100) {
    window.aiLogs = window.aiLogs.slice(-100);
  }
};

class AIService {
  constructor() {
    this.imageProvider = AI_CONFIG.defaultImageProvider || 'puter';
    this.accessToken = null;
    this.tokenExpiry = null;
    
    this.initGigaChat();
    
    console.log('✅ AI Service: Image generation ready (Pollinations.ai)');
  }

  initGigaChat() {
    const config = AI_CONFIG.providers.gigachat;
    
    if (config.authKey || (config.clientId && config.clientSecret)) {
      console.log('✅ AI Service: GigaChat configured');
      this.gigachatConfig = config;
    } else {
      console.warn('⚠️ AI Service: No GigaChat credentials');
      this.gigachatConfig = null;
    }
  }

  // Получение токена доступа GigaChat
  async getGigaChatToken() {
    // Если токен ещё действителен (с запасом 5 минут)
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) {
      return this.accessToken;
    }

    const config = this.gigachatConfig;
    if (!config) {
      throw new Error('GigaChat не настроен');
    }

    try {
      // Формируем Authorization header
      let authHeader;
      if (config.authKey) {
        authHeader = `Basic ${config.authKey}`;
      } else {
        const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
        authHeader = `Basic ${credentials}`;
      }

      // Генерируем уникальный RqUID (uuid4)
      const rquid = crypto.randomUUID();

      // Используем прокси вместо прямого URL
      const response = await fetch('/gigachat-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Authorization': authHeader,
          'RqUID': rquid,
        },
        body: `scope=${config.scope || 'GIGACHAT_API_PERS'}`,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GigaChat auth failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      this.accessToken = data.access_token;
      // expires_at в миллисекундах (unix timestamp)
      this.tokenExpiry = data.expires_at;
      
      console.log('✅ GigaChat token obtained, expires:', new Date(this.tokenExpiry));
      return this.accessToken;
    } catch (error) {
      console.error('❌ GigaChat auth error:', error);
      throw error;
    }
  }

  // Отправка запроса в GigaChat
  async sendGigaChatRequest(messages, options = {}) {
    const token = await this.getGigaChatToken();
    const config = this.gigachatConfig;

    const requestBody = {
      model: config.model || 'GigaChat',
      messages,
      temperature: options.temperature ?? 0.7,
      top_p: options.top_p ?? 0.95,
      max_tokens: options.max_tokens ?? 4096,
      stream: false,
    };

    // Логируем запрос
    console.log('📤 GigaChat Request:', JSON.stringify(requestBody, null, 2));
    logAI('request', {
      model: requestBody.model,
      messages: messages.map(m => ({ role: m.role, content: m.content.substring(0, 500) + (m.content.length > 500 ? '...' : '') })),
      temperature: requestBody.temperature,
    });

    // Используем прокси вместо прямого URL
    const response = await fetch('/gigachat-api/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = `GigaChat request failed: ${response.status} ${errorText}`;
      logAI('error', { status: response.status, error: errorText });
      throw new Error(error);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Логируем ответ
    console.log('📥 GigaChat Response:', content);
    logAI('response', { content });
    
    return content;
  }

  isInitialized() {
    return this.gigachatConfig != null;
  }

  getProvidersStatus() {
    return checkAIConfig();
  }

  setImageProvider(provider) {
    this.imageProvider = provider;
  }

  // ========== ГЕНЕРАЦИЯ ИЗОБРАЖЕНИЙ ==========

  async generateImage(prompt, options = {}) {
    const provider = options.provider || this.imageProvider;
    
    switch (provider) {
      case 'puter':
        return this._puterImage(prompt, options);
      case 'banana':
        return this._bananaImage(prompt, options);
      case 'replicate':
        return this._replicateImage(prompt, options);
      case 'stability':
        return this._stabilityImage(prompt, options);
      case 'openai':
        return this._openaiImage(prompt, options);
      default:
        return this._puterImage(prompt, options);
    }
  }

  async _puterImage(prompt, options = {}) {
    try {
      console.log(`🎨 Generating image with Pollinations.ai...`);

      const transliterate = (text) => {
        const ru = 'а б в г д е ё ж з и й к л м н о п р с т у ф х ц ч ш щ ъ ы ь э ю я'.split(' ');
        const en = 'a b v g d e e zh z i y k l m n o p r s t u f h ts ch sh sch  y  e yu ya'.split(' ');
        const RU = 'А Б В Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я'.split(' ');
        const EN = 'A B V G D E E Zh Z I Y K L M N O P R S T U F H Ts Ch Sh Sch  Y  E Yu Ya'.split(' ');

        return text.split('').map(char => {
          const ruIdx = ru.indexOf(char);
          const RUIdx = RU.indexOf(char);
          if (ruIdx >= 0) return en[ruIdx];
          if (RUIdx >= 0) return EN[RUIdx];
          return char;
        }).join('');
      };

      const translitPrompt = transliterate(prompt);
      const enhancedPrompt = `${translitPrompt}, high quality, detailed, professional`;
      const seed = options.seed || Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?seed=${seed}&width=1024&height=1024&nologo=true`;

      console.log('✅ Image URL generated:', imageUrl);
      return { success: true, imageUrl, provider: 'pollinations', model: 'pollinations-ai' };
    } catch (error) {
      console.error('Pollinations error:', error);
      return { success: false, error: error.message || 'Ошибка генерации' };
    }
  }

  async _bananaImage(prompt, options = {}) {
    const config = AI_CONFIG.providers.banana;
    if (!config?.apiKey) return this._puterImage(prompt, options);

    try {
      const response = await fetch('https://api.banana.dev/v1/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
        body: JSON.stringify({
          modelKey: config.modelKey || 'sdxl',
          modelInputs: { prompt, negative_prompt: options.negativePrompt || 'blurry, low quality', width: options.width || 1024, height: options.height || 1024, num_inference_steps: 30, guidance_scale: 7.5 },
        }),
      });
      const data = await response.json();
      if (data.error || !data.modelOutputs) return { success: false, error: data.error || 'No output' };
      const imageBase64 = data.modelOutputs[0]?.image;
      if (!imageBase64) return { success: false, error: 'No image' };
      return { success: true, imageUrl: `data:image/png;base64,${imageBase64}`, provider: 'banana' };
    } catch (error) { return { success: false, error: error.message }; }
  }

  async _replicateImage(prompt, options = {}) {
    const config = AI_CONFIG.providers.replicate;
    if (!config?.apiKey) return this._puterImage(prompt, options);
    try {
      const startResponse = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${config.apiKey}` },
        body: JSON.stringify({ version: config.modelVersion, input: { prompt, width: 1024, height: 1024 } }),
      });
      const prediction = await startResponse.json();
      if (prediction.error) return { success: false, error: prediction.error };
      let result = prediction, attempts = 0;
      while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < 60) {
        await new Promise(r => setTimeout(r, 1000));
        result = await (await fetch(result.urls.get, { headers: { 'Authorization': `Token ${config.apiKey}` } })).json();
        attempts++;
      }
      if (result.status === 'failed') return { success: false, error: 'Failed' };
      return { success: true, imageUrl: result.output?.[0], provider: 'replicate' };
    } catch (error) { return { success: false, error: error.message }; }
  }

  async _stabilityImage(prompt, options = {}) {
    const config = AI_CONFIG.providers.stability;
    if (!config?.apiKey) return this._puterImage(prompt, options);
    try {
      const response = await fetch(`https://api.stability.ai/v1/generation/${config.engine || 'stable-diffusion-xl-1024-v1-0'}/text-to-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
        body: JSON.stringify({ text_prompts: [{ text: prompt, weight: 1 }], cfg_scale: 7, height: 1024, width: 1024, steps: 30, samples: 1 }),
      });
      const data = await response.json();
      if (!data.artifacts) return { success: false, error: data.message || 'No output' };
      return { success: true, imageUrl: `data:image/png;base64,${data.artifacts[0]?.base64}`, provider: 'stability' };
    } catch (error) { return { success: false, error: error.message }; }
  }

  async _openaiImage(prompt, options = {}) {
    const config = AI_CONFIG.providers.openai;
    if (!config?.apiKey) return this._puterImage(prompt, options);
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
        body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: '1024x1024', response_format: 'url' }),
      });
      const data = await response.json();
      if (data.error) return { success: false, error: data.error.message };
      return { success: true, imageUrl: data.data?.[0]?.url, provider: 'openai' };
    } catch (error) { return { success: false, error: error.message }; }
  }

  // ========== СПЕЦИАЛЬНЫЕ МЕТОДЫ ИЗОБРАЖЕНИЙ ==========

  async generateAvatar(description, options = {}) {
    const prompt = `Professional avatar portrait of ${description}, clean solid color background, high quality, centered face, friendly expression, modern style, suitable for business profile picture, digital art`;
    const avatarOptions = {
      ...options,
      seed: options.seed || Math.floor(Math.random() * 1000000),
    };
    return this.generateImage(prompt, avatarOptions);
  }

  async generateIllustration(idea, style = 'modern') {
    const stylePrompts = {
      modern: 'modern minimalist illustration, clean lines, vibrant colors',
      sketch: 'hand-drawn sketch style, pencil drawing, artistic',
      realistic: 'photorealistic, detailed, professional photography',
      cartoon: 'cartoon style, fun, colorful, playful',
      abstract: 'abstract art, geometric shapes, creative composition',
    };
    const prompt = `${idea}, ${stylePrompts[style] || stylePrompts.modern}`;
    return this.generateImage(prompt);
  }

  // ========== ТЕКСТОВЫЕ AI МЕТОДЫ (GigaChat) ==========

  async analyzeRecap(recapText, boards = [], tags = [], users = []) {
    if (!this.isInitialized()) {
      return { success: false, message: 'AI не инициализирован', tasks: [] };
    }

    try {
      const systemPrompt = this.buildSystemPrompt(boards, tags, users);
      const userPrompt = this.buildUserPrompt(recapText);

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];

      const result = await this.sendGigaChatRequest(messages);
      const tasks = this.parseAIResponse(result);

      return { success: true, tasks };
    } catch (error) {
      console.error('AI recap analysis error:', error);
      return { success: false, message: `Ошибка: ${error.message}`, tasks: [] };
    }
  }

  async sketchToTasks(sketchTitle, sketchContent, options = {}) {
    if (!this.isInitialized()) {
      return { success: false, error: 'AI не инициализирован', tasks: [] };
    }

    const { users = [], boards = [], author = null } = options;

    try {
      // Формируем контекст пользователей с их зонами ответственности
      let usersContext = '';
      if (users.length > 0) {
        usersContext = '\n\nСПИСОК ИСПОЛНИТЕЛЕЙ:\n' + users.map(u => {
          const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
          const parts = [`${name} [ID:${u.id}]`];
          if (u.position) parts.push(`должность: ${u.position}`);
          if (u.responsibility) parts.push(`зона: ${u.responsibility}`);
          return '- ' + parts.join(', ');
        }).join('\n');
      }

      // Контекст досок
      let boardsContext = '';
      if (boards.length > 0) {
        boardsContext = '\n\nДОСКИ:\n' + boards.map(b => `- ${b.title} [ID:${b.id}]`).join('\n');
      }

      // Текущая дата для расчёта сроков
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Завтра
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const systemPrompt = `Ты менеджер проектов. Извлекай задачи из текста.

Сегодня: ${todayStr}
Завтра: ${tomorrowStr}
${usersContext}${boardsContext}

ФОРМАТ ОТВЕТА - строго по шаблону, каждая задача отделяется строкой ===:

ЗАДАЧА: название задачи
ОПИСАНИЕ: описание задачи (если нет - пусто)
ПРИОРИТЕТ: low/normal/high/urgent
СРОК: YYYY-MM-DD (если указан срок) или NONE
ИСПОЛНИТЕЛЬ: ID исполнителя из списка (по зоне ответственности) или NONE
АВТОР: ID того кто предложил задачу или NONE
ДОСКА: ID доски или NONE
===

ПРАВИЛА:
- "срочно", "asap", "критично" → ПРИОРИТЕТ: urgent
- "важно" → ПРИОРИТЕТ: high  
- "можно", "хорошо бы" → ПРИОРИТЕТ: low
- "завтра" → СРОК: ${tomorrowStr}
- Подбирай ИСПОЛНИТЕЛЬ по зоне ответственности (дизайн→дизайнер, код→разработчик)
- Если в комментарии кто-то предлагает задачу - он АВТОР`;

      const userPrompt = `Извлеки задачи:

${sketchTitle}

${sketchContent}`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];

      const result = await this.sendGigaChatRequest(messages);
      
      // Парсим текстовый ответ
      const tasks = this.parseTasksFromText(result);
      
      console.log('📋 Parsed tasks:', tasks);
      
      return { success: true, tasks };
    } catch (error) {
      console.error('sketchToTasks error:', error);
      return { success: false, error: error.message, tasks: [] };
    }
  }

  // Парсер текстового ответа от GigaChat
  parseTasksFromText(text) {
    const tasks = [];
    
    // Разделяем по ===
    const blocks = text.split(/={3,}/).map(b => b.trim()).filter(b => b);
    
    for (const block of blocks) {
      const task = {
        title: '',
        description: '',
        priority: 'normal',
        dueDate: null,
        assigneeId: null,
        authorId: null,
        suggestedBoardId: null,
      };
      
      // Парсим каждую строку блока
      const lines = block.split('\n');
      for (const line of lines) {
        const match = line.match(/^([А-ЯA-Z]+):\s*(.*)$/i);
        if (!match) continue;
        
        const [, key, value] = match;
        const val = value.trim();
        
        switch (key.toUpperCase()) {
          case 'ЗАДАЧА':
          case 'TASK':
            task.title = val;
            break;
          case 'ОПИСАНИЕ':
          case 'DESCRIPTION':
            task.description = val;
            break;
          case 'ПРИОРИТЕТ':
          case 'PRIORITY':
            if (['low', 'normal', 'high', 'urgent'].includes(val.toLowerCase())) {
              task.priority = val.toLowerCase();
            }
            break;
          case 'СРОК':
          case 'DUE':
          case 'DUEDATE':
            if (val && val.toUpperCase() !== 'NONE' && val !== '-') {
              // Проверяем формат даты
              const dateMatch = val.match(/(\d{4}-\d{2}-\d{2})/);
              if (dateMatch) {
                task.dueDate = dateMatch[1];
              }
            }
            break;
          case 'ИСПОЛНИТЕЛЬ':
          case 'ASSIGNEE':
            if (val && val.toUpperCase() !== 'NONE' && val !== '-') {
              // Извлекаем только ID (до пробела или скобки)
              const idMatch = val.match(/^([^\s(]+)/);
              task.assigneeId = idMatch ? idMatch[1] : val;
            }
            break;
          case 'АВТОР':
          case 'AUTHOR':
            if (val && val.toUpperCase() !== 'NONE' && val !== '-') {
              // Извлекаем только ID (до пробела или скобки)
              const idMatch = val.match(/^([^\s(]+)/);
              task.authorId = idMatch ? idMatch[1] : val;
            }
            break;
          case 'ДОСКА':
          case 'BOARD':
            if (val && val.toUpperCase() !== 'NONE' && val !== '-') {
              // Извлекаем только ID (до пробела или скобки)
              const idMatch = val.match(/^([^\s(]+)/);
              task.suggestedBoardId = idMatch ? idMatch[1] : val;
            }
            break;
        }
      }
      
      // Добавляем только если есть название
      if (task.title) {
        tasks.push(task);
      }
    }
    
    return tasks;
  }

  async generateTasksFromSketch(sketch, boards = [], users = [], author = null) {
    return this.sketchToTasks(sketch?.title || '', sketch?.content || '', { users, boards, author });
  }

  async breakdownTask(task) {
    if (!this.isInitialized()) return { success: false, subtasks: [] };

    try {
      const messages = [
        { role: 'system', content: 'Ты помощник для управления проектами. Отвечай только валидным JSON.' },
        {
          role: 'user',
          content: `Разбей задачу на подзадачи:

Задача: ${task.title}
Описание: ${task.description || ''}

Верни JSON: [{"title": "Подзадача", "estimatedHours": 2}]
Только JSON.`,
        },
      ];

      const result = await this.sendGigaChatRequest(messages);
      let text = result.trim();
      if (text.startsWith('```')) text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      return { success: true, subtasks: JSON.parse(text) };
    } catch (error) {
      return { success: false, subtasks: [], error: error.message };
    }
  }

  async suggestTags(title, description, existingTags = []) {
    if (!this.isInitialized()) return { success: false, tags: [] };

    try {
      const messages = [
        { role: 'system', content: 'Отвечай только валидным JSON массивом строк.' },
        {
          role: 'user',
          content: `Предложи 3-5 тегов:
Название: ${title}
Описание: ${description || ''}
${existingTags.length > 0 ? `Существующие: ${existingTags.join(', ')}` : ''}
Верни JSON: ["тег1", "тег2"]`,
        },
      ];

      const result = await this.sendGigaChatRequest(messages);
      let text = result.trim();
      if (text.startsWith('```')) text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      return { success: true, tags: JSON.parse(text) };
    } catch (error) {
      return { success: false, tags: [] };
    }
  }

  async estimateTaskTime(task) {
    if (!this.isInitialized()) return { success: false };

    try {
      const messages = [
        { role: 'system', content: 'Отвечай только валидным JSON.' },
        {
          role: 'user',
          content: `Оцени время:
Задача: ${task.title}
Описание: ${task.description || ''}
Верни JSON: {"estimatedHours": число, "confidence": "low|medium|high", "reasoning": "причина"}`,
        },
      ];

      const result = await this.sendGigaChatRequest(messages);
      let text = result.trim();
      if (text.startsWith('```')) text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      return { success: true, ...JSON.parse(text) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async analyzeTeamPerformance(teamStats) {
    if (!this.isInitialized()) return { success: false };

    try {
      const messages = [
        { role: 'system', content: 'Ты аналитик команды. Отвечай только валидным JSON.' },
        {
          role: 'user',
          content: `Анализ команды:
Всего: ${teamStats.totalTasks}, Выполнено: ${teamStats.completedTasks}, В работе: ${teamStats.inProgressTasks}, Просрочено: ${teamStats.overdueTasks}, Участников: ${teamStats.membersCount}
Верни JSON: {"summary": "резюме", "healthScore": 1-100, "recommendations": [], "risks": []}`,
        },
      ];

      const result = await this.sendGigaChatRequest(messages);
      let text = result.trim();
      if (text.startsWith('```')) text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      return { success: true, ...JSON.parse(text) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async smartSearch(query, tasks) {
    if (!this.isInitialized() || !tasks?.length) return { success: false, taskIds: [] };

    try {
      const tasksContext = tasks.slice(0, 50).map(t => `ID:${t.id}|${t.title}|${t.status}`).join('\n');
      const messages = [
        { role: 'system', content: 'Отвечай только валидным JSON массивом ID.' },
        {
          role: 'user',
          content: `Найди задачи по запросу "${query}":\n${tasksContext}\nВерни JSON: ["id1", "id2"]`,
        },
      ];

      const result = await this.sendGigaChatRequest(messages);
      let text = result.trim();
      if (text.startsWith('```')) text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      return { success: true, taskIds: JSON.parse(text) };
    } catch (error) {
      return { success: false, taskIds: [] };
    }
  }

  async summarizeSketch(content) {
    if (!this.isInitialized()) return { success: false, summary: '' };

    try {
      const messages = [
        { role: 'user', content: `Кратко резюмируй (2-3 предложения):\n${content}` },
      ];

      const result = await this.sendGigaChatRequest(messages);
      return { success: true, summary: result.trim() };
    } catch (error) {
      return { success: false, summary: '' };
    }
  }

  async expandSketch(content) {
    if (!this.isInitialized()) return { success: false, expanded: '' };

    try {
      const messages = [
        { role: 'user', content: `Расширь и детализируй идею:\n${content}` },
      ];

      const result = await this.sendGigaChatRequest(messages);
      return { success: true, expanded: result.trim() };
    } catch (error) {
      return { success: false, expanded: '' };
    }
  }

  buildSystemPrompt(boards, tags, users) {
    let prompt = `Ты - менеджер проектов. Извлекай задачи из текста. Отвечай только валидным JSON.\n\nКОНТЕКСТ:`;
    if (boards?.length > 0) prompt += `\nДОСКИ: ${boards.map(b => `${b.title}(${b.id})`).join(', ')}`;
    if (tags?.length > 0) prompt += `\nТЕГИ: ${tags.join(', ')}`;
    if (users?.length > 0) prompt += `\nПОЛЬЗОВАТЕЛИ: ${users.map(u => `${u.firstName} ${u.lastName}`).join(', ')}`;
    prompt += `\n\nФОРМАТ JSON:\n[{"title":"","description":"","suggestedBoard":null,"suggestedAssignee":"TBD","suggestedPriority":"normal","suggestedTags":[],"suggestedDueDate":null}]\nТолько JSON!`;
    return prompt;
  }

  buildUserPrompt(recapText) {
    return `Извлеки задачи:\n${recapText}\nТолько JSON.`;
  }

  parseAIResponse(text) {
    try {
      let clean = text.trim();
      if (clean.startsWith('```')) clean = clean.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      const tasks = JSON.parse(clean);
      if (!Array.isArray(tasks)) throw new Error('Not array');
      return tasks.map(t => ({
        title: t.title || 'Без названия',
        description: t.description || '',
        suggestedBoard: t.suggestedBoard || null,
        suggestedAssignee: t.suggestedAssignee || 'TBD',
        suggestedPriority: ['normal', 'urgent', 'low', 'high'].includes(t.suggestedPriority) ? t.suggestedPriority : 'normal',
        suggestedTags: Array.isArray(t.suggestedTags) ? t.suggestedTags : [],
        suggestedDueDate: t.suggestedDueDate || null
      }));
    } catch (error) {
      console.error('Parse error:', error);
      throw new Error(`Ошибка парсинга: ${error.message}`);
    }
  }
}

export default new AIService();
