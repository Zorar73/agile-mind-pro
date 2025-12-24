// src/config/ai.js
// Конфигурация AI провайдеров
//
// ОСНОВНОЙ ПРОВАЙДЕР:
// GigaChat - Сбер, российский AI
//
// БЕСПЛАТНЫЕ ВАРИАНТЫ ДЛЯ ИЗОБРАЖЕНИЙ:
// Pollinations.ai - полностью бесплатная генерация изображений

export const AI_CONFIG = {
  // Провайдер по умолчанию для текста
  defaultTextProvider: 'gigachat',
  
  // Провайдер по умолчанию для изображений
  defaultImageProvider: 'puter',
  
  providers: {
    // GigaChat (Сбер) - основной для текста
    // Документация: https://developers.sber.ru/docs/ru/gigachat/api/overview
    gigachat: {
      // Client ID и Client Secret из личного кабинета
      clientId: import.meta.env.VITE_GIGACHAT_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_GIGACHAT_CLIENT_SECRET || '',
      // Или Authorization Key (base64 от clientId:clientSecret)
      authKey: import.meta.env.VITE_GIGACHAT_AUTH_KEY || '',
      // Scope: GIGACHAT_API_PERS (физлица) или GIGACHAT_API_CORP (юрлица)
      scope: import.meta.env.VITE_GIGACHAT_SCOPE || 'GIGACHAT_API_PERS',
      // Модель: GigaChat, GigaChat-Plus, GigaChat-Pro
      model: import.meta.env.VITE_GIGACHAT_MODEL || 'GigaChat',
    },
    
    // Pollinations.ai - бесплатная генерация изображений
    puter: {
      enabled: true,
      defaultModel: 'pollinations-ai',
    },
    
    // OpenAI (резервный, платный)
    openai: {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      model: 'gpt-4-turbo-preview',
    },
    
    // Anthropic Claude (резервный, платный)
    anthropic: {
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
      model: 'claude-3-sonnet-20240229',
    },
    
    // Banana (платный)
    banana: {
      apiKey: import.meta.env.VITE_BANANA_API_KEY || '',
      modelKey: import.meta.env.VITE_BANANA_MODEL_KEY || 'sdxl',
    },
    
    // Replicate (платный)
    replicate: {
      apiKey: import.meta.env.VITE_REPLICATE_API_KEY || '',
      modelVersion: 'stability-ai/sdxl:latest',
    },
    
    // Stability AI (платный)
    stability: {
      apiKey: import.meta.env.VITE_STABILITY_API_KEY || '',
      engine: 'stable-diffusion-xl-1024-v1-0',
    },
  },
};

// Проверка наличия ключей
export const checkAIConfig = () => {
  const gigachatReady = !!(
    AI_CONFIG.providers.gigachat.authKey || 
    (AI_CONFIG.providers.gigachat.clientId && AI_CONFIG.providers.gigachat.clientSecret)
  );
  
  const status = {
    text: {
      gigachat: gigachatReady,
      openai: !!AI_CONFIG.providers.openai.apiKey,
      anthropic: !!AI_CONFIG.providers.anthropic.apiKey,
    },
    image: {
      puter: AI_CONFIG.providers.puter.enabled,
      banana: !!AI_CONFIG.providers.banana.apiKey,
      replicate: !!AI_CONFIG.providers.replicate.apiKey,
      stability: !!AI_CONFIG.providers.stability.apiKey,
      openai: !!AI_CONFIG.providers.openai.apiKey,
    },
    hasTextProvider: false,
    hasImageProvider: true,
  };
  
  status.hasTextProvider = Object.values(status.text).some(v => v);
  status.hasImageProvider = Object.values(status.image).some(v => v);
  
  return status;
};

export default AI_CONFIG;
