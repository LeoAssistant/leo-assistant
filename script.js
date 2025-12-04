// script.js - общие функции для всех страниц

// Сохранение данных в localStorage
const Storage = {
    save: function(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },
    
    load: function(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
};

// Навигация
function navigateTo(page) {
    window.location.href = page;
}

// Показать/скрыть элементы
function show(elementId) {
    document.getElementById(elementId).style.display = 'block';
}

function hide(elementId) {
    document.getElementById(elementId).style.display = 'none';
}

// Форматирование времени
function formatTime(date = new Date()) {
    return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div>${message}</div>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Установка текущей даты
    const dateElements = document.querySelectorAll('.current-date');
    dateElements.forEach(el => {
        el.textContent = new Date().toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    });
    
    // Активация текущей страницы в навигации
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
});
