// script.js - общие функции для всех страниц
// Version: 1.0.0

console.log('✅ Leo Assistant loaded');

// Глобальные переменные
let currentUser = {
    id: 30683,
    name: 'Усков Максим',
    level: 11,
    points: 500,
    online: true
};

// ====================
// СИСТЕМА ХРАНЕНИЯ
// ====================
const Storage = {
    // Сохранить данные
    save: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Ошибка сохранения:', e);
            return false;
        }
    },
    
    // Загрузить данные
    load: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Ошибка загрузки:', e);
            return null;
        }
    },
    
    // Удалить данные
    remove: function(key) {
        localStorage.removeItem(key);
    },
    
    // Очистить все (осторожно!)
    clear: function() {
        if (confirm('Очистить все данные приложения?')) {
            localStorage.clear();
            location.reload();
        }
    }
};

// ====================
// НАВИГАЦИЯ И UI
// ====================
const UI = {
    // Показать уведомление
    showNotification: function(message, type = 'info', duration = 3000) {
        // Удаляем старые уведомления
        const oldNotifications = document.querySelectorAll('.notification');
        oldNotifications.forEach(n => n.remove());
        
        // Создаем новое уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Добавляем стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Добавляем в DOM
        document.body.appendChild(notification);
        
        // Автоматическое скрытие
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.animation = 'slideOut 0.3s ease-out';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }
        
        return notification;
    },
    
    // Показать модальное окно
    showModal: function(title, content, buttons = []) {
        // Удаляем старые модалки
        const oldModal = document.querySelector('.modal-overlay');
        if (oldModal) oldModal.remove();
        
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="UI.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
                ${buttons.length > 0 ? `
                <div class="modal-footer">
                    ${buttons.map(btn => `
                        <button class="btn ${btn.type || ''}" onclick="${btn.onclick}">
                            ${btn.icon ? `<i class="fas fa-${btn.icon}"></i>` : ''}
                            ${btn.text}
                        </button>
                    `).join('')}
                </div>` : ''}
            </div>
        `;
        
        // Добавляем стили
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
            padding: 20px;
        `;
        
        document.body.appendChild(modal);
        
        // Блокируем прокрутку body
        document.body.style.overflow = 'hidden';
        
        return modal;
    },
    
    // Закрыть модальное окно
    closeModal: function() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => modal.remove(), 300);
            document.body.style.overflow = '';
        }
    },
    
    // Показать индикатор загрузки
    showLoader: function(text = 'Загрузка...') {
        // Удаляем старые лоадеры
        const oldLoader = document.querySelector('.loader-overlay');
        if (oldLoader) oldLoader.remove();
        
        const loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.innerHTML = `
            <div class="loader">
                <div class="spinner"></div>
                <div class="loader-text">${text}</div>
            </div>
        `;
        
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9998;
            backdrop-filter: blur(4px);
        `;
        
        document.body.appendChild(loader);
        return loader;
    },
    
    // Скрыть индикатор загрузки
    hideLoader: function() {
        const loader = document.querySelector('.loader-overlay');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    },
    
    // Анимированное появление элемента
    fadeIn: function(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let opacity = 0;
        const timer = setInterval(() => {
            opacity += 16.7 / duration;
            element.style.opacity = opacity;
            
            if (opacity >= 1) {
                clearInterval(timer);
            }
        }, 16.7);
    },
    
    // Анимированное исчезновение элемента
    fadeOut: function(element, duration = 300) {
        let opacity = 1;
        const timer = setInterval(() => {
            opacity -= 16.7 / duration;
            element.style.opacity = opacity;
            
            if (opacity <= 0) {
                clearInterval(timer);
                element.style.display = 'none';
            }
        }, 16.7);
    }
};

// ====================
// ФОРМАТИРОВАНИЕ
// ====================
const Format = {
    // Форматирование времени
    time: function(date = new Date()) {
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Форматирование даты
    date: function(date = new Date()) {
        return date.toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Относительное время (2 часа назад)
    relativeTime: function(timestamp) {
        const now = new Date();
        const diff = now - new Date(timestamp);
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (minutes < 1) return 'только что';
        if (minutes < 60) return `${minutes} мин назад`;
        if (hours < 24) return `${hours} ч назад`;
        if (days < 7) return `${days} дн назад`;
        
        return this.date(new Date(timestamp));
    },
    
    // Сокращение больших чисел
    compactNumber: function(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
};

// ====================
// ВАЛИДАЦИЯ
// ====================
const Validate = {
    // Валидация email
    email: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Валидация пароля
    password: function(password) {
        return password.length >= 6;
    },
    
    // Валидация ID пользователя
    userId: function(id) {
        return /^\d{5,}$/.test(id);
    },
    
    // Валидация API ключа
    apiKey: function(key) {
        return key.startsWith('sk-') && key.length > 30;
    }
};

// ====================
// API HELPERS
// ====================
const Api = {
    // Обертка для fetch с обработкой ошибок
    fetch: async function(url, options = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeout);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return { success: true, data };
            
        } catch (error) {
            clearTimeout(timeout);
            
            if (error.name === 'AbortError') {
                return { success: false, error: 'Таймаут запроса' };
            }
            
            return { success: false, error: error.message };
        }
    },
    
    // Запрос к DeepSeek API
    deepseek: async function(messages, options = {}) {
        const apiKey = localStorage.getItem('deepseek_api_key');
        
        if (!apiKey) {
            return {
                success: false,
                error: 'API ключ не установлен',
                message: 'Пожалуйста, установите API ключ в настройках'
            };
        }
        
        const response = await this.fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: messages,
                max_tokens: options.max_tokens || 2000,
                temperature: options.temperature || 0.7,
                stream: false
            })
        });
        
        if (response.success) {
            return {
                success: true,
                message: response.data.choices[0].message.content,
                usage: response.data.usage
            };
        }
        
        return response;
    }
};

// ====================
// ИНИЦИАЛИЗАЦИЯ
// ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Leo Assistant initialized');
    
    // Устанавливаем текущую дату
    const dateElements = document.querySelectorAll('.current-date');
    dateElements.forEach(el => {
        if (!el.textContent.trim()) {
            el.textContent = Format.date();
        }
    });
    
    // Устанавливаем текущее время
    const timeElements = document.querySelectorAll('.current-time');
    timeElements.forEach(el => {
        if (!el.textContent.trim()) {
            el.textContent = Format.time();
            // Обновляем время каждую минуту
            setInterval(() => {
                el.textContent = Format.time();
            }, 60000);
        }
    });
    
    // Подсветка активной навигации
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Загрузка данных пользователя
    const savedUser = Storage.load('current_user');
    if (savedUser) {
        currentUser = { ...currentUser, ...savedUser };
    }
    
    // Обновляем имя пользователя на страницах
    const userElements = document.querySelectorAll('.user-name, .username');
    userElements.forEach(el => {
        if (el.textContent.includes('Максим') || el.textContent.includes('Усков')) {
            el.textContent = currentUser.name;
        }
    });
    
    // Обновляем аватар
    const avatarElements = document.querySelectorAll('.avatar:not([data-static])');
    avatarElements.forEach(el => {
        if (el.textContent === 'МУ' || el.textContent === 'УМ') {
            const initials = currentUser.name.split(' ').map(n => n[0]).join('');
            el.textContent = initials.toUpperCase();
        }
    });
    
    // Инициализация темной темы
    const isDarkMode = localStorage.getItem('dark_mode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark');
    }
    
    // Добавляем стили для уведомлений и модалок
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        .modal {
            background: white;
            border-radius: 20px;
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: modalIn 0.3s ease-out;
        }
        
        @keyframes modalIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        
        .modal-header {
            padding: 20px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .modal-content {
            padding: 20px;
        }
        
        .modal-footer {
            padding: 20px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 20px;
            color: #64748b;
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        }
        
        .modal-close:hover {
            background: #f1f5f9;
            color: #1e293b;
        }
        
        .loader {
            text-align: center;
        }
        
        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loader-text {
            color: #64748b;
            font-size: 16px;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            opacity: 0.7;
            cursor: pointer;
            transition: opacity 0.3s;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notification-close:hover {
            opacity: 1;
            background: rgba(255,255,255,0.1);
        }
    `;
    document.head.appendChild(style);
    
    // Инициализация горячих клавиш
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S - сохранить
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            const saveBtns = document.querySelectorAll('button[onclick*="save"], .save-btn');
            if (saveBtns.length > 0) {
                saveBtns[0].click();
            }
        }
        
        // Escape - закрыть модалки
        if (e.key === 'Escape') {
            UI.closeModal();
        }
        
        // F1 - помощь
        if (e.key === 'F1') {
            e.preventDefault();
            UI.showModal('Помощь', `
                <h4>Горячие клавиши:</h4>
                <ul>
                    <li><strong>Ctrl/Cmd + S</strong> - Сохранить</li>
                    <li><strong>Escape</strong> - Закрыть модальное окно</li>
                    <li><strong>F1</strong> - Эта справка</li>
                </ul>
                
                <h4>Поддержка:</h4>
                <p>Если у вас возникли проблемы, обратитесь в поддержку.</p>
            `);
        }
    });
});

// ====================
// ЭКСПОРТ ГЛОБАЛЬНЫХ ФУНКЦИЙ
// ====================
window.Storage = Storage;
window.UI = UI;
window.Format = Format;
window.Validate = Validate;
window.Api = Api;
window.currentUser = currentUser;

// Глобальные вспомогательные функции
window.navigateTo = function(page) {
    window.location.href = page;
};

window.goBack = function() {
    window.history.back();
};

window.refreshPage = function() {
    window.location.reload();
};

window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text)
        .then(() => UI.showNotification('Скопировано в буфер обмена', 'success'))
        .catch(() => UI.showNotification('Не удалось скопировать', 'error'));
};

window.toggleDarkMode = function() {
    document.body.classList.toggle('dark');
    localStorage.setItem('dark_mode', document.body.classList.contains('dark'));
    UI.showNotification('Тема изменена', 'success');
};

// Автосохранение при закрытии страницы
window.addEventListener('beforeunload', function(e) {
    // Можно добавить подтверждение закрытия, если есть несохраненные данные
    // const hasUnsavedChanges = false;
    // if (hasUnsavedChanges) {
    //     e.preventDefault();
    //     e.returnValue = 'У вас есть несохраненные изменения. Вы уверены?';
    // }
});

console.log('✨ script.js loaded successfully');
