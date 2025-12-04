// api.js - интеграция с DeepSeek API
// Version: 1.0.0

class LeoAssistant {
    constructor() {
        this.apiKey = localStorage.getItem('deepseek_api_key') || '';
        this.baseURL = 'https://api.deepseek.com/v1';
        this.conversationHistory = this.loadHistory();
        this.maxHistory = 20;
        this.isTyping = false;
        
        // Статистика
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalTokens: 0,
            lastRequest: null
        };
        
        this.loadStats();
    }
    
    // ====================
    // ИСТОРИЯ СООБЩЕНИЙ
    // ====================
    
    loadHistory() {
        try {
            const saved = localStorage.getItem('leo_conversation_history');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Ошибка загрузки истории:', e);
            return [];
        }
    }
    
    saveHistory() {
        try {
            localStorage.setItem(
                'leo_conversation_history', 
                JSON.stringify(this.conversationHistory.slice(-this.maxHistory))
            );
        } catch (e) {
            console.error('Ошибка сохранения истории:', e);
        }
    }
    
    addToHistory(role, content) {
        this.conversationHistory.push({
            role: role,
            content: content,
            timestamp: new Date().toISOString()
        });
        
        // Ограничиваем размер истории
        if (this.conversationHistory.length > this.maxHistory * 2) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistory);
        }
        
        this.saveHistory();
    }
    
    clearHistory() {
        this.conversationHistory = [];
        localStorage.removeItem('leo_conversation_history');
        return true;
    }
    
    getHistory() {
        return [...this.conversationHistory];
    }
    
    // ====================
    // СТАТИСТИКА
    // ====================
    
    loadStats() {
        try {
            const saved = localStorage.getItem('leo_api_stats');
            if (saved) {
                this.stats = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Ошибка загрузки статистики:', e);
        }
    }
    
    saveStats() {
        try {
            localStorage.setItem('leo_api_stats', JSON.stringify(this.stats));
        } catch (e) {
            console.error('Ошибка сохранения статистики:', e);
        }
    }
    
    updateStats(success, tokens = 0) {
        this.stats.totalRequests++;
        
        if (success) {
            this.stats.successfulRequests++;
            this.stats.totalTokens += tokens;
        } else {
            this.stats.failedRequests++;
        }
        
        this.stats.lastRequest = new Date().toISOString();
        this.saveStats();
    }
    
    getStats() {
        return { ...this.stats };
    }
    
    // ====================
    // API КЛЮЧ
    // ====================
    
    setApiKey(key) {
        if (!key || !key.startsWith('sk-')) {
            throw new Error('Неверный формат API ключа. Ключ должен начинаться с "sk-"');
        }
        
        this.apiKey = key;
        localStorage.setItem('deepseek_api_key', key);
        return true;
    }
    
    getApiKey() {
        return this.apiKey;
    }
    
    hasApiKey() {
        return !!this.apiKey && this.apiKey.startsWith('sk-');
    }
    
    // ====================
    // ПРОВЕРКА ПОДКЛЮЧЕНИЯ
    // ====================
    
    async testConnection() {
        if (!this.hasApiKey()) {
            return {
                success: false,
                error: 'API ключ не установлен',
                message: 'Пожалуйста, установите API ключ в настройках'
            };
        }
        
        try {
            const response = await fetch(`${this.baseURL}/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const result = {
                success: response.ok,
                status: response.status,
                error: response.ok ? null : 'Неверный API ключ или проблемы с сетью'
            };
            
            this.updateStats(response.ok);
            return result;
            
        } catch (error) {
            this.updateStats(false);
            return {
                success: false,
                error: 'Ошибка сети',
                message: 'Проверьте подключение к интернету'
            };
        }
    }
    
    // ====================
    // ОСНОВНОЙ МЕТОД ОТПРАВКИ
    // ====================
    
    async sendMessage(message, options = {}) {
        // Проверка API ключа
        if (!this.hasApiKey()) {
            this.updateStats(false);
            throw new Error('API ключ не установлен. Зайдите в настройки → API ключ');
        }
        
        // Проверка на дублирование
        if (this.isTyping) {
            throw new Error('Пожалуйста, дождитесь ответа на предыдущее сообщение');
        }
        
        this.isTyping = true;
        
        try {
            // Добавляем сообщение пользователя в историю
            this.addToHistory('user', message);
            
            // Подготавливаем системный промпт
            const systemPrompt = {
                role: 'system',
                content: `Ты Лео - дружелюбный AI-помощник для учеников 7Б класса.
                
                Твоя роль:
                1. Помощь с учебой по всем предметам
                2. Объяснение сложных тем простым языком
                3. Поддержка и мотивация учеников
                4. Помощь с домашними заданиями
                5. Объяснение материала из школьной программы
                
                Правила:
                - Отвечай на русском языке
                - Будь вежливым и дружелюбным
                - Объясняй пошагово
                - Если не знаешь ответа - так и скажи
                - Предлагай дополнительные материалы
                - Поддерживай учеников
                
                Сейчас: ${new Date().toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}`
            };
            
            // Формируем сообщения для отправки
            const messages = [
                systemPrompt,
                ...this.conversationHistory.slice(-10) // Последние 10 сообщений
            ];
            
            // Отправляем запрос к API
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: options.model || 'deepseek-chat',
                    messages: messages,
                    max_tokens: options.max_tokens || 2000,
                    temperature: options.temperature || 0.7,
                    stream: false
                })
            });
            
            if (!response.ok) {
                throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Извлекаем ответ
            const assistantMessage = data.choices[0].message.content;
            
            // Добавляем ответ в историю
            this.addToHistory('assistant', assistantMessage);
            
            // Обновляем статистику
            this.updateStats(true, data.usage?.total_tokens || 0);
            
            return {
                success: true,
                message: assistantMessage,
                usage: data.usage,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            // Обновляем статистику об ошибке
            this.updateStats(false);
            
            // Fallback ответы
            const fallbackResponses = [
                "Я немного задумался над твоим вопросом. Попробуй переформулировать его или задать по-другому.",
                "Сейчас у меня небольшие технические трудности. Попробуй спросить что-то другое!",
                "Давай попробуем разобраться вместе. Опиши свою проблему подробнее.",
                "Интересный вопрос! Давай я помогу тебе найти ответ в учебнике или других материалах.",
                "Похоже, мне нужно немного времени на размышление. А пока можешь попробовать решить задачу самостоятельно, я верю в тебя!"
            ];
            
            const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
            
            // Добавляем fallback ответ в историю
            this.addToHistory('assistant', randomResponse);
            
            return {
                success: false,
                message: randomResponse,
                error: error.message,
                isFallback: true,
                timestamp: new Date().toISOString()
            };
            
        } finally {
            this.isTyping = false;
        }
    }
    
    // ====================
    // СПЕЦИАЛИЗИРОВАННЫЕ МЕТОДЫ
    // ====================
    
    async helpWithHomework(subject, task) {
        const prompt = `Помоги с домашним заданием по предмету "${subject}".

Задание: ${task}

Пожалуйста:
1. Объясни тему, если нужно
2. Разбери решение по шагам
3. Дай подсказки, но не полное решение
4. Проверь, правильный ли ответ
5. Предложи похожие задачи для закрепления

Ответь на русском языке, будь дружелюбным и поддерживающим.`;
        
        return await this.sendMessage(prompt, { temperature: 0.3 });
    }
    
    async explainTopic(topic, grade = 7) {
        const prompt = `Объясни тему "${topic}" для ученика ${grade} класса.

Пожалуйста:
1. Объясни простыми словами
2. Приведи примеры из жизни
3. Используй аналогии, если нужно
4. Сделай это интересно и понятно
5. Дай основные формулы/правила, если есть

Ответь на русском языке, будь дружелюбным и вдохновляющим.`;
        
        return await this.sendMessage(prompt, { temperature: 0.5 });
    }
    
    async solveMathProblem(problem) {
        const prompt = `Реши математическую задачу: ${problem}

Пожалуйста:
1. Покажи пошаговое решение
2. Объясни каждый шаг
3. Проверь ответ
4. Предложи альтернативные методы решения, если есть
5. Дай похожие задачи для практики

Ответь на русском языке, используй математические обозначения.`;
        
        return await this.sendMessage(prompt, { temperature: 0.1 });
    }
    
    async checkGrammar(text) {
        const prompt = `Проверь грамматику и орфографию в тексте:

"${text}"

Пожалуйста:
1. Найди и исправь ошибки
2. Объясни правила
3. Предложи улучшения стиля
4. Дай советы по написанию

Ответь на русском языке, будь конструктивным.`;
        
        return await this.sendMessage(prompt, { temperature: 0.2 });
    }
    
    // ====================
    // УПРАВЛЕНИЕ
    // ====================
    
    reset() {
        this.clearHistory();
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalTokens: 0,
            lastRequest: null
        };
        this.saveStats();
        return true;
    }
    
    exportData() {
        return {
            history: this.conversationHistory,
            stats: this.stats,
            settings: {
                maxHistory: this.maxHistory,
                hasApiKey: this.hasApiKey()
            },
            exportedAt: new Date().toISOString()
        };
    }
    
    // ====================
    // УТИЛИТЫ
    // ====================
    
    getEstimatedCost() {
        // Примерная стоимость: $0.00014 за 1K токенов для DeepSeek Chat
        const costPerToken = 0.00014 / 1000;
        return (this.stats.totalTokens * costPerToken).toFixed(4);
    }
    
    getSuccessRate() {
        if (this.stats.totalRequests === 0) return 100;
        return Math.round((this.stats.successfulRequests / this.stats.totalRequests) * 100);
    }
    
    getAverageTokens() {
        if (this.stats.successfulRequests === 0) return 0;
        return Math.round(this.stats.totalTokens / this.stats.successfulRequests);
    }
}

// Создаем глобальный экземпляр
try {
    window.leoAssistant = new LeoAssistant();
    console.log('✅ Leo Assistant API initialized');
} catch (error) {
    console.error('❌ Failed to initialize Leo Assistant:', error);
    window.leoAssistant = {
        sendMessage: async () => ({ 
            success: false, 
            message: 'Система временно недоступна. Пожалуйста, обновите страницу.' 
        }),
        setApiKey: () => false,
        hasApiKey: () => false
    };
}

// Глобальные хелперы
window.testApiConnection = async function() {
    if (!window.leoAssistant.hasApiKey()) {
        alert('⚠️ API ключ не установлен. Зайдите в настройки → API ключ');
        return;
    }
    
    const result = await window.leoAssistant.testConnection();
    
    if (result.success) {
        alert('✅ Соединение с DeepSeek API успешно установлено!');
    } else {
        alert(`❌ Ошибка соединения: ${result.error || 'Неизвестная ошибка'}`);
    }
    
    return result;
};

window.clearChatHistory = function() {
    if (confirm('Очистить всю историю чата?')) {
        window.leoAssistant.clearHistory();
        alert('✅ История чата очищена');
        
        // Обновляем страницу если нужно
        if (window.location.pathname.includes('chat.html')) {
            window.location.reload();
        }
    }
};

window.exportChatData = function() {
    const data = window.leoAssistant.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
   
