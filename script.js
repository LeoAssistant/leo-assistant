// ===========================================
// LEO ASSISTANT v1.5 - ОСНОВНОЙ JAVASCRIPT
// Полностью функциональная система
// ===========================================

// Глобальные переменные
let currentUser = {
    id: '12345',
    name: 'Иван Иванов',
    surname: 'Иванов',
    username: 'ivan_student',
    class: '7Б',
    level: 7,
    points: 1250,
    status: 'online'
};

let friendsList = [
    { id: '12345', name: 'Алексей Петров', status: 'online', level: 12, points: 2450 },
    { id: '23456', name: 'Мария Сидорова', status: 'online', level: 11, points: 2300 },
    { id: '34567', name: 'Дмитрий Иванов', status: 'offline', level: 10, points: 2100 },
    { id: '45678', name: 'Анна Кузнецова', status: 'online', level: 9, points: 1950 },
    { id: '56789', name: 'Сергей Смирнов', status: 'offline', level: 8, points: 1800 }
];

let homeworkList = [
    { id: 1, subject: 'Математика', title: 'Дроби и их сокращение', deadline: '2024-01-15', priority: 'high', completed: false },
    { id: 2, subject: 'Химия', title: 'Периодическая таблица', deadline: '2024-01-16', priority: 'medium', completed: false },
    { id: 3, subject: 'История', title: 'Древний Рим', deadline: '2024-01-17', priority: 'low', completed: true }
];

let chatHistory = [];

// ========== ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('Leo Assistant v1.5 инициализирован');
    
    // Инициализируем все модули
    initNavigation();
    initNotifications();
    initForms();
    initButtons();
    initTheme();
    initTimeUpdater();
    
    // Загружаем данные пользователя
    loadUserData();
    
    // Показываем приветствие
    setTimeout(() => {
        showNotification('Добро пожаловать в Leo Assistant v1.5!', 'success', 3000);
    }, 1000);
});

// ========== СИСТЕМА НАВИГАЦИИ ==========

function initNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navContainer = document.getElementById('navContainer');
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (menuToggle && navContainer) {
        // Функция переключения меню
        function toggleMenu() {
            navContainer.classList.toggle('active');
            if (menuOverlay) menuOverlay.classList.toggle('active');
            document.body.style.overflow = navContainer.classList.contains('active') ? 'hidden' : '';
            
            // Анимация кнопки меню
            if (navContainer.classList.contains('active')) {
                menuToggle.innerHTML = '<i class="fas fa-times"></i>';
                menuToggle.setAttribute('aria-label', 'Закрыть меню');
            } else {
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                menuToggle.setAttribute('aria-label', 'Открыть меню');
            }
        }
        
        // Обработчики событий
        menuToggle.addEventListener('click', toggleMenu);
        
        if (menuOverlay) {
            menuOverlay.addEventListener('click', toggleMenu);
        }
        
        // Закрытие меню при клике на ссылку (для мобильных)
        const navLinks = document.querySelectorAll('.nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    toggleMenu();
                }
            });
        });
        
        // Кнопка выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logoutUser();
            });
        }
        
        // Адаптивное поведение при изменении размера окна
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navContainer.classList.remove('active');
                if (menuOverlay) menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                menuToggle.setAttribute('aria-label', 'Открыть меню');
            }
        });
    }
    
    // Устанавливаем активный пункт меню
    setActiveNavItem();
}

function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        
        if (href && (currentPath.endsWith(href) || 
            (href === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('/index.html'))))) {
            item.classList.add('active');
        }
    });
}

// ========== СИСТЕМА УВЕДОМЛЕНИЙ ==========

function initNotifications() {
    // Создаем контейнер для уведомлений если его нет
    if (!document.getElementById('notificationsContainer')) {
        const container = document.createElement('div');
        container.id = 'notificationsContainer';
        document.body.appendChild(container);
    }
}

function showNotification(message, type = 'info', duration = 5000) {
    // Удаляем старые уведомления
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(notif => {
        if (Date.now() - parseInt(notif.dataset.timestamp) > 5000) {
            notif.remove();
        }
    });
    
    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.dataset.timestamp = Date.now();
    
    // Иконка в зависимости от типа
    let icon = 'info-circle';
    switch(type) {
        case 'success': icon = 'check-circle'; break;
        case 'error': icon = 'exclamation-circle'; break;
        case 'warning': icon = 'exclamation-triangle'; break;
    }
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    document.getElementById('notificationsContainer').appendChild(notification);
    
    // Автоматическое удаление
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, duration);
    
    // Ручное закрытие
    notification.addEventListener('click', () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
}

// ========== ФОРМЫ И ВАЛИДАЦИЯ ==========

function initForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Собираем данные формы
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Валидация
            if (validateForm(this)) {
                processForm(this, formObject);
            }
        });
        
        // Валидация в реальном времени
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Проверка на обязательность
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Это поле обязательно для заполнения';
    }
    
    // Проверка email
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Введите корректный email адрес';
        }
    }
    
    // Проверка пароля
    if (field.type === 'password' && value) {
        if (value.length < 6) {
            isValid = false;
            errorMessage = 'Пароль должен содержать минимум 6 символов';
        }
    }
    
    // Проверка чисел
    if (field.type === 'number' && value) {
        if (field.hasAttribute('min') && parseInt(value) < parseInt(field.getAttribute('min'))) {
            isValid = false;
            errorMessage = `Минимальное значение: ${field.getAttribute('min')}`;
        }
        
        if (field.hasAttribute('max') && parseInt(value) > parseInt(field.getAttribute('max'))) {
            isValid = false;
            errorMessage = `Максимальное значение: ${field.getAttribute('max')}`;
        }
    }
    
    // Отображение ошибки
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
        showFieldSuccess(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.5rem;
    `;
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#ef4444';
}

function showFieldSuccess(field) {
    field.style.borderColor = '#10b981';
    
    // Через 2 секунды убираем зеленую обводку
    setTimeout(() => {
        field.style.borderColor = '';
    }, 2000);
}

function clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
    field.style.borderColor = '';
}

// ========== ОБРАБОТКА ФОРМ ==========

function processForm(form, data) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : '';
    
    // Показываем состояние загрузки
    if (submitBtn) {
        submitBtn.innerHTML = '<div class="loading" style="width: 20px; height: 20px;"></div> Обработка...';
        submitBtn.disabled = true;
    }
    
    // Имитация отправки на сервер
    setTimeout(() => {
        // В зависимости от формы выполняем разные действия
        const formId = form.id || form.getAttribute('name') || '';
        
        switch(formId) {
            case 'loginForm':
                handleLogin(data);
                break;
            case 'registerForm':
                handleRegistration(data);
                break;
            case 'profileForm':
                updateProfile(data);
                break;
            case 'homeworkForm':
                createHomework(data);
                break;
            default:
                // Общая обработка
                showNotification('Данные успешно сохранены!', 'success');
                form.reset();
        }
        
        // Восстанавливаем кнопку
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }, 1500);
}

// ========== ОБРАБОТЧИКИ КНОПОК ==========

function initButtons() {
    // Обработчики для кнопок с data-action атрибутом
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleButtonAction(action, this);
        });
    });
    
    // Быстрая помощь
    const quickHelpBtn = document.getElementById('quickHelpBtn');
    if (quickHelpBtn) {
        quickHelpBtn.addEventListener('click', () => {
            window.location.href = 'chat.html';
        });
    }
    
    // Кнопки подтверждения
    document.querySelectorAll('[data-confirm]').forEach(button => {
        button.addEventListener('click', function(e) {
            const message = this.getAttribute('data-confirm');
            if (!confirm(message)) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });
}

function handleButtonAction(action, button) {
    switch(action) {
        case 'add-friend':
            showAddFriendModal();
            break;
        case 'complete-task':
            completeTask(button.dataset.taskId);
            break;
        case 'delete-item':
            deleteItem(button.dataset.itemType, button.dataset.itemId);
            break;
        case 'toggle-theme':
            toggleTheme();
            break;
        case 'refresh-data':
            refreshPageData();
            break;
        case 'export-data':
            exportData(button.dataset.exportType);
            break;
        case 'print-page':
            window.print();
            break;
        case 'share-profile':
            shareProfile();
            break;
        default:
            console.log(`Действие "${action}" не распознано`);
    }
}

// ========== ТЕМА И НАСТРОЙКИ ==========

function initTheme() {
    // Загружаем сохраненную тему
    const savedTheme = localStorage.getItem('leo-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Кнопка переключения темы
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        
        // Устанавливаем иконку
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Применяем новую тему
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('leo-theme', newTheme);
    
    // Обновляем иконку
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    showNotification(`Тема изменена на ${newTheme === 'dark' ? 'тёмную' : 'светлую'}`, 'success');
}

// ========== ОБНОВЛЕНИЕ ВРЕМЕНИ ==========

function initTimeUpdater() {
    function updateTime() {
        const now = new Date();
        const timeElements = document.querySelectorAll('.current-time');
        
        timeElements.forEach(element => {
            const timeSpan = element.querySelector('span');
            if (timeSpan) {
                timeSpan.textContent = now.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        });
        
        const dateElements = document.querySelectorAll('.current-date');
        dateElements.forEach(element => {
            element.textContent = now.toLocaleDateString('ru-RU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        });
    }
    
    updateTime();
    setInterval(updateTime, 60000); // Обновляем каждую минуту
}

// ========== ЗАГРУЗКА ДАННЫХ ПОЛЬЗОВАТЕЛЯ ==========

function loadUserData() {
    // Загружаем из localStorage или используем демо-данные
    const savedUser = localStorage.getItem('leo-user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    
    // Обновляем UI
    updateUserUI();
    updateFriendsBadge();
    updateHomeworkBadge();
}

function updateUserUI() {
    // Обновляем информацию в навигации
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
        const nameElement = userInfo.querySelector('.user-name');
        const statusElement = userInfo.querySelector('.user-status');
        
        if (nameElement) {
            nameElement.textContent = currentUser.name;
        }
        
        if (statusElement) {
            statusElement.innerHTML = `
                <span class="status-${currentUser.status}"></span>
                ${currentUser.status === 'online' ? 'Онлайн' : 'Офлайн'}
            `;
        }
    }
    
    // Обновляем статистику на главной
    const levelElement = document.getElementById('userLevel');
    const pointsElement = document.getElementById('userPoints');
    const tasksElement = document.getElementById('completedTasks');
    const daysElement = document.getElementById('activeDays');
    
    if (levelElement) levelElement.textContent = currentUser.level;
    if (pointsElement) pointsElement.textContent = currentUser.points.toLocaleString();
    if (tasksElement) tasksElement.textContent = homeworkList.filter(h => h.completed).length;
    if (daysElement) daysElement.textContent = Math.floor(Math.random() * 30) + 1; // Демо-данные
}

function updateFriendsBadge() {
    const badge = document.querySelector('.nav-item[href="friends.html"] .badge');
    if (badge) {
        badge.textContent = friendsList.length;
    }
}

function updateHomeworkBadge() {
    const badge = document.querySelector('.nav-item[href="homework.html"] .badge');
    if (badge) {
        const urgentCount = homeworkList.filter(h => !h.completed && h.priority === 'high').length;
        badge.textContent = urgentCount;
        
        // Если есть срочные задания - делаем красным
        if (urgentCount > 0) {
            badge.style.background = '#ef4444';
        }
    }
}

// ========== РАБОТА С ДРУЗЬЯМИ ==========

function showAddFriendModal() {
    // Здесь будет код модального окна добавления друга
    // (уже реализовано в index.html)
    const modal = document.getElementById('addFriendModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('friendId').focus();
    } else {
        showNotification('Функция добавления друга в разработке', 'info');
    }
}

function searchFriend(id) {
    const resultContainer = document.getElementById('friendSearchResult');
    if (!resultContainer) return;
    
    // Ищем в демо-данных
    const foundFriend = friendsList.find(friend => friend.id === id);
    
    if (foundFriend) {
        resultContainer.innerHTML = `
            <div class="friend-found">
                <div class="friend-info">
                    <div class="friend-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="friend-details">
                        <div class="friend-name">${foundFriend.name}</div>
                        <div class="friend-meta">7Б класс • Уровень ${foundFriend.level}</div>
                    </div>
                </div>
            </div>
        `;
    } else {
        resultContainer.innerHTML = `
            <div class="friend-not-found">
                <i class="fas fa-user-slash"></i>
                <p>Пользователь с ID ${id} не найден</p>
            </div>
        `;
    }
}

function sendFriendRequest() {
    const friendId = document.getElementById('friendId').value.trim();
    
    if (!friendId || friendId.length < 5) {
        showNotification('Введите корректный ID друга (минимум 5 цифр)', 'error');
        return;
    }
    
    // Имитация отправки запроса
    showNotification('Запрос в друзья отправлен!', 'success');
    
    // Закрываем модальное окно
    closeAddFriendModal();
    
    // Обновляем список друзей
    friendsList.push({
        id: friendId,
        name: `Пользователь ${friendId}`,
        status: 'offline',
        level: Math.floor(Math.random() * 10) + 1,
        points: Math.floor(Math.random() * 2000) + 500
    });
    
    updateFriendsBadge();
}

function closeAddFriendModal() {
    const modal = document.getElementById('addFriendModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('friendId').value = '';
        document.getElementById('friendSearchResult').innerHTML = '';
    }
}

// ========== РАБОТА С ДОМАШНИМИ ЗАДАНИЯМИ ==========

function completeTask(taskId) {
    const task = homeworkList.find(t => t.id == taskId);
    if (task) {
        task.completed = true;
        
        // Начисляем очки
        currentUser.points += 50;
        updateUserUI();
        
        showNotification('Задание выполнено! +50 очков', 'success');
        updateHomeworkBadge();
    }
}

// ========== АВТОРИЗАЦИЯ И ПРОФИЛЬ ==========

function handleLogin(data) {
    // Демо-авторизация
    if (data.username && data.password) {
        currentUser.name = 'Иван Иванов'; // Демо-пользователь
        localStorage.setItem('leo-user', JSON.stringify(currentUser));
        
        showNotification('Успешный вход!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        showNotification('Ошибка входа. Проверьте данные.', 'error');
    }
}

function handleRegistration(data) {
    // Демо-регистрация
    if (data.surname && data.name && data.password) {
        const newUser = {
            ...currentUser,
            surname: data.surname,
            name: data.name,
            id: Math.floor(10000 + Math.random() * 90000).toString()
        };
        
        localStorage.setItem('leo-user', JSON.stringify(newUser));
        currentUser = newUser;
        
        showNotification('Аккаунт создан! Ваш ID: ' + newUser.id, 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

function updateProfile(data) {
    // Обновление профиля
    if (data.username) {
        currentUser.username = data.username;
    }
    
    if (data.description) {
        // Сохраняем описание
    }
    
    localStorage.setItem('leo-user', JSON.stringify(currentUser));
    updateUserUI();
    showNotification('Профиль обновлен!', 'success');
}

function logoutUser() {
    if (confirm('Вы уверены, что хотите выйти из системы?')) {
        showNotification('Выход из системы...', 'warning');
        
        // Очищаем данные сессии
        localStorage.removeItem('leo-user');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// ========== УТИЛИТЫ ==========

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (isNaN(date.getTime())) {
        return 'Нет даты';
    }
    
    if (diffDays === 0) {
        return 'Сегодня в ' + date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'});
    } else if (diffDays === 1) {
        return 'Вчера в ' + date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'});
    } else if (diffDays < 7) {
        return `${diffDays} дней назад`;
    } else {
        return date.toLocaleDateString('ru-RU');
    }
}

function formatNumber(num) {
    if (!num && num !== 0) return '0';
    
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    
    return num.toLocaleString();
}

function exportData(type) {
    let data, filename, contentType;
    
    switch(type) {
        case 'friends':
            data = JSON.stringify(friendsList, null, 2);
            filename = 'friends.json';
            contentType = 'application/json';
            break;
        case 'homework':
            data = JSON.stringify(homeworkList, null, 2);
            filename = 'homework.json';
            contentType = 'application/json';
            break;
        case 'profile':
            data = JSON.stringify(currentUser, null, 2);
            filename = 'profile.json';
            contentType = 'application/json';
            break;
        default:
            showNotification('Тип экспорта не поддерживается', 'error');
            return;
    }
    
    const blob = new Blob([data], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    showNotification('Данные экспортированы в ' + filename, 'success');
}

function shareProfile() {
    if (navigator.share) {
        navigator.share({
            title: 'Мой профиль Leo Assistant',
            text: `Привет! Я использую Leo Assistant. Мой ID профиля: ${currentUser.id}`,
            url: window.location.href
        })
        .then(() => showNotification('Профиль успешно отправлен!', 'success'))
        .catch(error => console.log('Ошибка sharing:', error));
    } else {
        // Fallback для браузеров без поддержки Web Share API
        const shareUrl = `https://leo-assistant.ru/profile/${currentUser.id}`;
        navigator.clipboard.writeText(shareUrl)
            .then(() => showNotification('Ссылка скопирована в буфер обмена!', 'success'))
            .catch(err => showNotification('Ошибка копирования', 'error'));
    }
}

// ========== ГЛОБАЛЬНЫЕ ФУНКЦИИ ==========

// Делаем функции доступными из HTML
window.showNotification = showNotification;
window.formatDate = formatDate;
window.formatNumber = formatNumber;
window.exportData = exportData;
window.showAddFriendModal = showAddFriendModal;
window.closeAddFriendModal = closeAddFriendModal;
window.searchFriend = searchFriend;
window.sendFriendRequest = sendFriendRequest;
window.completeTask = completeTask;

// Автосохранение каждые 30 секунд
setInterval(() => {
    if (document.hidden) return;
    
    localStorage.setItem('leo-user', JSON.stringify(currentUser));
    console.log('Данные автосохранены');
}, 30000);
