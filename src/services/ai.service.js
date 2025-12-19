// src/services/ai.service.js
// AI Service с бесплатной генерацией изображений через Puter.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG, checkAIConfig } from '../config/ai';

const GEMINI_API_KEY = AI_CONFIG.providers.gemini.apiKey;

class AIService {
  constructor() {
    this.imageProvider = AI_CONFIG.defaultImageProvider || 'puter';

    // Инициализация Gemini
    if (GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        // Используем стабильную модель
        this.model = this.genAI.getGenerativeModel({
          model: AI_CONFIG.providers.gemini.model || 'gemini-2.5-flash',
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        });
        console.log('✅ AI Service: Gemini initialized');
      } catch (error) {
        console.error('❌ AI Service: Gemini init failed:', error);
      }
    } else {
      console.warn('⚠️ AI Service: No Gemini API key');
    }

    console.log('✅ AI Service: Image generation ready (Pollinations.ai)');
  }

  isInitialized() {
    return this.model != null;
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
    // Используем Pollinations.ai - бесплатный API без логина
    try {
      console.log(`🎨 Generating image with Pollinations.ai...`);

      // Переводим кириллицу в латиницу (транслитерация)
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

      // Переводим prompt на латиницу и улучшаем для качества
      const translitPrompt = transliterate(prompt);
      const enhancedPrompt = `${translitPrompt}, high quality, detailed, professional`;

      // Генерируем уникальный seed для разных результатов
      const seed = options.seed || Math.floor(Math.random() * 1000000);

      // URL Pollinations.ai API (изображение генерируется на лету при первом запросе)
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?seed=${seed}&width=1024&height=1024&nologo=true`;

      console.log('✅ Image URL generated:', imageUrl);

      // Возвращаем URL напрямую - Pollinations генерирует изображение при первой загрузке
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

    // Для аватаров используем квадратный формат
    const avatarOptions = {
      ...options,
      seed: options.seed || Math.floor(Math.random() * 1000000),
    };

    return this.generateImage(prompt, avatarOptions);
  }

  async generateAttachmentImage(prompt, options = {}) {
    return this.generateImage(prompt, options);
  }

  // ========== ТЕКСТОВЫЕ AI ФУНКЦИИ ==========

  async analyzeRecap(recapText, context = {}) {
    if (!this.isInitialized()) {
      return { success: false, message: 'AI не настроен. Добавьте GEMINI_API_KEY.', tasks: [] };
    }

    try {
      // Безопасное извлечение контекста
      const boards = Array.isArray(context?.boards) ? context.boards : (Array.isArray(context) ? [] : []);
      const tags = Array.isArray(context?.tags) ? context.tags : [];
      const users = Array.isArray(context?.users) ? context.users : [];

      const systemPrompt = this.buildSystemPrompt(boards, tags, users);
      const userPrompt = this.buildUserPrompt(recapText);

      const result = await this.model.generateContent([systemPrompt, userPrompt]);
      const response = await result.response;
      const text = response.text();
      const tasks = this.parseAIResponse(text);

      return { success: true, tasks };
    } catch (error) {
      console.error('AI recap analysis error:', error);
      return { success: false, message: `Ошибка: ${error.message}`, tasks: [] };
    }
  }

  async sketchToTasks(sketchTitle, sketchContent) {
    if (!this.isInitialized()) {
      return { success: false, error: 'AI не инициализирован', tasks: [] };
    }

    try {
      const prompt = `Преобразуй набросок в список задач:

НАБРОСОК:
Название: ${sketchTitle}
Содержание: ${sketchContent}

Верни JSON массив:
[{"title": "Задача", "description": "Описание", "priority": "normal"}]

priority: low, normal, high, urgent
Только JSON.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      if (text.startsWith('```')) text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      const tasks = JSON.parse(text);
      return { success: true, tasks };
    } catch (error) {
      return { success: false, error: error.message, tasks: [] };
    }
  }

  async generateTasksFromSketch(sketch, boards = [], users = []) {
    // Алиас для совместимости
    return this.sketchToTasks(sketch?.title || '', sketch?.content || '');
  }

  async breakdownTask(task) {
    if (!this.isInitialized()) return { success: false, subtasks: [] };

    try {
      const prompt = `Разбей задачу на подзадачи:

Задача: ${task.title}
Описание: ${task.description || ''}

Верни JSON: [{"title": "Подзадача", "estimatedHours": 2}]
Только JSON.`;

      const result = await this.model.generateContent(prompt);
      let text = (await result.response).text().trim();
      if (text.startsWith('```')) text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      return { success: true, subtasks: JSON.parse(text) };
    } catch (error) {
      return { success: false, subtasks: [], error: error.message };
    }
  }

  async suggestTags(title, description, existingTags = []) {
    if (!this.isInitialized()) return { success: false, tags: [] };

    try {
      const prompt = `Предложи 3-5 тегов:
Название: ${title}
Описание: ${description || ''}
${existingTags.length > 0 ? `Существующие: ${existingTags.join(', ')}` : ''}
Верни JSON: ["тег1", "тег2"]`;

      const result = await this.model.generateContent(prompt);
      let text = (await result.response).text().trim();
      if (text.startsWith('```')) text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      return { success: true, tags: JSON.parse(text) };
    } catch (error) {
      return { success: false, tags: [] };
    }
  }

  async estimateTaskTime(task) {
    if (!this.isInitialized()) return { success: false };

    try {
      const prompt = `Оцени время:
Задача: ${task.title}
Описание: ${task.description || ''}
Верни JSON: {"estimatedHours": число, "confidence": "low|medium|high", "reasoning": "причина"}`;

      const result = await this.model.generateContent(prompt);
      let text = (await result.response).text().trim();
      if (text.startsWith('```')) text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      return { success: true, ...JSON.parse(text) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async analyzeTeamPerformance(teamStats) {
    if (!this.isInitialized()) return { success: false };

    try {
      const prompt = `Анализ команды:
Всего: ${teamStats.totalTasks}, Выполнено: ${teamStats.completedTasks}, В работе: ${teamStats.inProgressTasks}, Просрочено: ${teamStats.overdueTasks}, Участников: ${teamStats.membersCount}
Верни JSON: {"summary": "резюме", "healthScore": 1-100, "recommendations": [], "risks": []}`;

      const result = await this.model.generateContent(prompt);
      let text = (await result.response).text().trim();
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
      const prompt = `Найди задачи по запросу "${query}":\n${tasksContext}\nВерни JSON: ["id1", "id2"]`;

      const result = await this.model.generateContent(prompt);
      let text = (await result.response).text().trim();
      if (text.startsWith('```')) text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      return { success: true, taskIds: JSON.parse(text) };
    } catch (error) {
      return { success: false, taskIds: [] };
    }
  }

  async summarizeSketch(content) {
    if (!this.isInitialized()) return { success: false, summary: '' };

    try {
      const prompt = `Кратко резюмируй (2-3 предложения):\n${content}`;
      const result = await this.model.generateContent(prompt);
      return { success: true, summary: (await result.response).text().trim() };
    } catch (error) {
      return { success: false, summary: '' };
    }
  }

  async expandSketch(content) {
    if (!this.isInitialized()) return { success: false, expanded: '' };

    try {
      const prompt = `Расширь и детализируй идею:\n${content}`;
      const result = await this.model.generateContent(prompt);
      return { success: true, expanded: (await result.response).text().trim() };
    } catch (error) {
      return { success: false, expanded: '' };
    }
  }

  buildSystemPrompt(boards, tags, users) {
    let prompt = `Ты - менеджер проектов. Извлекай задачи из текста.\n\nКОНТЕКСТ:`;
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
