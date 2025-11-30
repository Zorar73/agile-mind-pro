import { GoogleGenerativeAI } from '@google/generative-ai';
import { logError, logInfo } from '../components/DebugConsole';

const GEMINI_API_KEY = 'AIzaSyB8zF91xZeGD4vz92T6_0dEilbrmQieiJs';

class AIService {
  constructor() {
    try {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      // ИСПРАВЛЕНИЕ: Используем gemini-1.5-flash, так как он наиболее стабилен в v1beta
      // Если вам нужно качество Pro, попробуйте 'gemini-1.5-pro-002'
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.5-pro', 
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });
      logInfo('AI Service initialized successfully with gemini-1.5-flash model');
    } catch (error) {
      logError('AI Service initialization failed', error);
    }
  }

  async analyzeRecap(recapText, context = {}) {
    try {
      logInfo('Starting AI analysis', { textLength: recapText.length });

      const { boards = [], tags = [], users = [] } = context;

      const systemPrompt = this.buildSystemPrompt(boards, tags, users);
      const userPrompt = this.buildUserPrompt(recapText);

      logInfo('Sending request to Gemini API');

      const result = await this.model.generateContent([systemPrompt, userPrompt]);
      const response = await result.response;
      const text = response.text();

      logInfo('Received response from Gemini', { responseLength: text.length });

      const tasks = this.parseAIResponse(text);

      logInfo('Successfully parsed tasks', { count: tasks.length });

      return {
        success: true,
        tasks
      };
    } catch (error) {
      logError('AI Analysis failed', {
        message: error.message,
        stack: error.stack
      });

      return {
        success: false,
        message: `Ошибка AI: ${error.message}`,
        error: error.message
      };
    }
  }

  async splitTask(task, context = {}) {
    try {
      logInfo('Starting task split', { taskTitle: task.title });

      const { boards = [], tags = [], users = [] } = context;

      const systemPrompt = this.buildSystemPrompt(boards, tags, users);
      const userPrompt = `
Проанализируй следующую задачу и разбей ее на несколько более мелких подзадач:

ЗАДАЧА:
Название: ${task.title}
Описание: ${task.description}

Верни ТОЛЬКО валидный JSON-массив подзадач в формате:
[
  {
    "title": "Краткое название подзадачи",
    "description": "Подробное описание",
    "suggestedBoard": "ID доски или null",
    "suggestedAssignee": "Имя исполнителя или TBD",
    "suggestedPriority": "normal|urgent|recurring",
    "suggestedTags": ["тег1", "тег2"],
    "suggestedDueDate": "YYYY-MM-DD или null"
  }
]

Разбей на 2-5 подзадач в зависимости от сложности.`;

      const result = await this.model.generateContent([systemPrompt, userPrompt]);
      const response = await result.response;
      const text = response.text();

      const subtasks = this.parseAIResponse(text);

      logInfo('Successfully split task', { subtasksCount: subtasks.length });

      return {
        success: true,
        tasks: subtasks
      };
    } catch (error) {
      logError('Task split failed', {
        message: error.message,
        taskTitle: task.title
      });

      return {
        success: false,
        message: `Ошибка разделения: ${error.message}`,
        error: error.message
      };
    }
  }

  buildSystemPrompt(boards, tags, users) {
    let prompt = `Ты - опытный менеджер проектов с экспертизой в Agile-методологиях.

Твоя задача - проанализировать протокол встречи или текстовый рекап и извлечь из него ТОЛЬКО четкие, исполняемые задачи.

КОНТЕКСТ СИСТЕМЫ:`;

    if (boards.length > 0) {
      prompt += `\n\nДОСКИ В СИСТЕМЕ:`;
      boards.forEach((board, index) => {
        prompt += `\n${index + 1}. ${board.title} (ID: ${board.id})`;
      });
    }

    if (tags.length > 0) {
      prompt += `\n\nДОСТУПНЫЕ ТЕГИ:`;
      tags.forEach((tag, index) => {
        prompt += `\n${index + 1}. ${tag.name}`;
      });
    }

    if (users.length > 0) {
      prompt += `\n\nПОЛЬЗОВАТЕЛИ СИСТЕМЫ:`;
      users.forEach((user, index) => {
        prompt += `\n${index + 1}. ${user.firstName} ${user.lastName}`;
        if (user.position) prompt += ` - ${user.position}`;
        if (user.responsibility) prompt += ` (Отвечает за: ${user.responsibility})`;
      });
    }

    prompt += `

ПРАВИЛА ИЗВЛЕЧЕНИЯ ЗАДАЧ:
1. Извлекай ТОЛЬКО четкие, исполняемые задачи с конкретными действиями
2. Не создавай задачи из общих обсуждений или информационных блоков
3. Каждая задача должна иметь понятный результат
4. Если упоминается исполнитель - постарайся сопоставить с пользователями системы
5. Если указан срок - конвертируй в формат YYYY-MM-DD
6. Определи приоритет исходя из формулировок ("срочно", "важно", "критично" и т.д.)
7. Подбирай теги на основе контекста задачи
8. Если явно упоминается доска/проект - используй ее ID, иначе оставь null

ФОРМАТ ОТВЕТА - СТРОГО JSON-МАССИВ:
[
  {
    "title": "Краткое название задачи (до 100 символов)",
    "description": "Подробное описание с контекстом и требуемым результатом",
    "suggestedBoard": "ID доски или null",
    "suggestedAssignee": "Имя исполнителя или TBD",
    "suggestedPriority": "normal|urgent|recurring",
    "suggestedTags": ["тег1", "тег2"],
    "suggestedDueDate": "YYYY-MM-DD или null"
  }
]

Верни ТОЛЬКО валидный JSON без дополнительного текста, обертки в markdown или пояснений!`;

    return prompt;
  }

  buildUserPrompt(recapText) {
    return `
Проанализируй следующий протокол встречи и извлеки задачи:

ПРОТОКОЛ:
${recapText}

Верни ТОЛЬКО JSON-массив задач без дополнительного текста.`;
  }

  parseAIResponse(text) {
    try {
      logInfo('Parsing AI response', { textLength: text.length });

      let cleanText = text.trim();
      
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/g, '');
      }

      const tasks = JSON.parse(cleanText);

      if (!Array.isArray(tasks)) {
        throw new Error('Response is not an array');
      }

      const validatedTasks = tasks.map(task => ({
        title: task.title || 'Без названия',
        description: task.description || '',
        suggestedBoard: task.suggestedBoard || null,
        suggestedAssignee: task.suggestedAssignee || 'TBD',
        suggestedPriority: ['normal', 'urgent', 'recurring'].includes(task.suggestedPriority) 
          ? task.suggestedPriority 
          : 'normal',
        suggestedTags: Array.isArray(task.suggestedTags) ? task.suggestedTags : [],
        suggestedDueDate: task.suggestedDueDate || null
      }));

      return validatedTasks;
    } catch (error) {
      logError('Failed to parse AI response', {
        error: error.message,
        responseText: text.substring(0, 500)
      });

      throw new Error(`Не удалось распарсить ответ AI: ${error.message}`);
    }
  }
}

export default new AIService();