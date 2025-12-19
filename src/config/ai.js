// src/config/ai.js
// Конфигурация AI провайдеров
//
// БЕСПЛАТНЫЕ ВАРИАНТЫ:
// 1. Gemini - бесплатный tier (15 запросов/мин)
// 2. Puter.js - полностью бесплатная генерация изображений (без API ключей!)
//
// ПЛАТНЫЕ ВАРИАНТЫ (если нужно больше):
// - OpenAI, Stability AI, Replicate, Banana

export const AI_CONFIG = {
  // Провайдер по умолчанию для текста
  defaultTextProvider: 'gemini',
  
  // Провайдер по умолчанию для изображений
  // 'puter' - бесплатно, без API ключей!
  defaultImageProvider: 'puter',
  
  providers: {
    // Google Gemini - основной для текста
    // Бесплатный tier: 15 RPM, 1M tokens/day
    gemini: {
      apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
      // Актуальные модели:
      // - gemini-1.5-flash-latest (стабильная, рекомендуется)
      // - gemini-1.5-pro-latest (мощнее)
      model: 'gemini-2.5-flash',
    },
    
    // Pollinations.ai - бесплатная генерация изображений (заменяет Puter.js)
    // API без регистрации и логина, работает напрямую
    puter: {
      enabled: true,
      defaultModel: 'pollinations-ai', // Stable Diffusion через Pollinations
      // Полностью бесплатно, без лимитов, без всплывающих окон
    },
    
    // OpenAI (платный)
    openai: {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      model: 'gpt-4-turbo-preview',
    },
    
    // Anthropic Claude (платный)
    anthropic: {
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
      model: 'claude-3-sonnet-20240229',
    },
    
    // Banana (платный, но дешёвый)
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
  const status = {
    text: {
      gemini: !!AI_CONFIG.providers.gemini.apiKey,
      openai: !!AI_CONFIG.providers.openai.apiKey,
      anthropic: !!AI_CONFIG.providers.anthropic.apiKey,
    },
    image: {
      puter: AI_CONFIG.providers.puter.enabled, // Всегда доступен!
      banana: !!AI_CONFIG.providers.banana.apiKey,
      replicate: !!AI_CONFIG.providers.replicate.apiKey,
      stability: !!AI_CONFIG.providers.stability.apiKey,
      openai: !!AI_CONFIG.providers.openai.apiKey,
    },
    hasTextProvider: false,
    hasImageProvider: true, // Puter всегда доступен
  };
  
  status.hasTextProvider = Object.values(status.text).some(v => v);
  status.hasImageProvider = Object.values(status.image).some(v => v);
  
  return status;
};

export default AI_CONFIG;
