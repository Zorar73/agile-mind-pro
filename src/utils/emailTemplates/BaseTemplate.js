// src/utils/emailTemplates/BaseTemplate.js
// Базовый шаблон для всех email уведомлений

const APP_NAME = 'Agile Mind Pro';
const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://agile-mind-pro.com';

/**
 * Базовый HTML шаблон для email
 * @param {Object} params
 * @param {string} params.title - Заголовок письма
 * @param {string} params.content - HTML контент письма
 * @param {string} params.footer - Дополнительный футер (опционально)
 * @returns {string} - HTML письма
 */
export function BaseTemplate({ title, content, footer = '' }) {
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #1976d2;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #1976d2;
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #1976d2;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 12px;
    }
    .info-box {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
    }
    .info-box strong {
      display: block;
      margin-bottom: 5px;
      color: #1976d2;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-urgent {
      background-color: #f44336;
      color: white;
    }
    .badge-normal {
      background-color: #2196f3;
      color: white;
    }
    .badge-low {
      background-color: #4caf50;
      color: white;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${APP_NAME}</h1>
    </div>

    <div class="content">
      ${content}
    </div>

    <div class="footer">
      <p>Это автоматическое уведомление от ${APP_NAME}</p>
      <p>Если у вас есть вопросы, свяжитесь с администратором</p>
      ${footer}
    </div>
  </div>
</body>
</html>
  `.trim();
}

export default BaseTemplate;
