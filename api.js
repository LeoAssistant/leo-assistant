// api.js - работа с DeepSeek API

class LeoAssistant {
    constructor() {
        this.apiKey = localStorage.getItem('deepseek_api_key') || '';
        this.baseURL = 'https://api.deepseek.com/v1';
        this.conversationHistory = [];
        this.maxHistory = 10;
    }

    // Установка API ключа
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('deepseek_api_key', key);
    }

    // Проверка ключа
    async testConnection() {
        if (!this.apiKey) {
            return { success: false, error: 'API ключ не установлен' };
        }

        try {
            const response = await fetch(`${this.baseURL}/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return {
                success: response.ok,
                error: response.ok ? null : 'Неверный API ключ'
            };
        } catch (error) {
            return { success: false, error: 'Ошибка сети' };
        }
    }

    // Отправка сообщения
    async sendMessage(message) {
        if (!this.apiKey) {
            throw new Error('API ключ не установлен. Зайдите в настройки.');
        }

        // Добавляем сообщение в историю
        this.conversationHistory.push({
            role: 'user',
            content: message
        });

        // Ограничиваем историю
        if (this.conversationHistory.length > this.maxHistory * 2) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistory * 2);
        }

        try {
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: `Ты Лео - дружелюбный помощник для учеников 7Б класса. 
                            Помогай с учебой по математике, физике, русскому языку и другим предметам.
                            Объясняй сложные темы простым языком.
                            Будь вежливым, поддерживающим и полезным.
                            Отвечай на русском языке.`
                        },
                        ...this.conversationHistory
                    ],
                    max_tokens: 2000,
                    temperature: 0.7,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Ошибка API: ${response.status}`);
            }

            const data = await response.json();
            const assistantMessage = data.choices[0].message.content;

            // Добавляем ответ в историю
            this.conversationHistory.push({
                role: 'assistant',
                content: assistantMessage
            });

            return {
                success: true,
                message: assistantMessage,
                usage: data.usage
            };

        } catch (error) {
            console.error('Ошибка:', error);
            
            // Fallback ответы если API не работает
            const fallbackResponses = [
                "Попробуй решить так: перенеси известные числа в одну сторону, неизвестные в другую.",
                "Для решения этой задачи нужно вспомнить формулу из учебника на странице 45.",
                "Давай разберем по шагам: 1) ... 2) ... 3) ...",
                "Этот материал мы проходили на прошлом уроке. Проверь свои записи.",
                "Попробуй использовать метод, который мы разбирали вчера."
            ];
            
            const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
            
            return {
                success: false,
                message: `⚠️ Ошибка соединения. Совет: ${randomResponse}`,
                error: error.message
            };
        }
    }

    // Очистить историю
    clearHistory() {
        this.conversationHistory = [];
    }

    // Получить историю
    getHistory() {
        return this.conversationHistory;
    }
}

// Создаем глобальный экземпляр
window.leoAssistant = new LeoAssistant();
