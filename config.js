// config.js
const DEEPSEEK_CONFIG = {
    // ⚠️ ВСТАВЬТЕ ВАШ КЛЮЧ СЮДА:
    API_KEY: "sk-7a79e5877b294b9a9de1d1145f1f4b7f",
    
    // Настройки модели
    MODEL: "deepseek-chat",
    BASE_URL: "https://api.deepseek.com",
    
    // Настройки запросов
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.7,
    
    // Системный промпт для Лео
    SYSTEM_PROMPT: `Ты Лео - дружелюбный помощник для учеников 7Б класса. 
    Помогай с учебой, объясняй сложные темы простым языком.
    Будь вежливым и поддерживающим.`
};

// Экспорт конфигурации
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DEEPSEEK_CONFIG;
}
