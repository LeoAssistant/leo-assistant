// ========== УЛУЧШЕННОЕ УПРАВЛЕНИЕ МЕНЮ ==========

// Инициализация меню
function initMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navContainer = document.querySelector('.nav-container');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (menuToggle && navContainer) {
        // Создаём оверлей если его нет
        if (!menuOverlay) {
            const overlay = document.createElement('div');
            overlay.className = 'menu-overlay';
            document.body.appendChild(overlay);
        }
        
        const overlay = document.querySelector('.menu-overlay');
        
        // Функция переключения меню
        function toggleMenu() {
            navContainer.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = navContainer.classList.contains('active') ? 'hidden' : '';
        }
        
        // Обработчики событий
        menuToggle.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
        
        // Закрытие меню при клике на ссылку
        const navLinks = document.querySelectorAll('.nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    toggleMenu();
                }
            });
        });
        
        // Адаптивное поведение при изменении размера окна
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navContainer.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Активное состояние меню
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.includes(href.replace('.html', ''))) {
            item.classList.add('active');
        }
    });
}

// ========== УЛУЧШЕННАЯ СИСТЕМА УВЕДОМЛЕНИЙ ==========

function showNotification(message, type = 'success', duration = 5000) {
    // Удаляем старые уведомления
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(notif => {
        if (notif.dataset.timestamp && Date.now() - parseInt(notif.dataset.timestamp) > 5000) {
            notif.remove();
        }
    });
    
    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.dataset.timestamp = Date.now();
    
    document.body.appendChild(notification);
    
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

// ========== УЛУЧШЕННАЯ ФОРМА ВАЛИДАЦИИ ==========

function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const inputs = this.querySelectorAll('[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#ef4444';
                    
                    setTimeout(() => {
                        input.style.borderColor = '';
                    }, 2000);
                }
            });
            
            if (isValid) {
                // Эффект загрузки
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn) {
                    const originalText = submitBtn.innerHTML;
                    submitBtn.innerHTML = '<span class="loading"></span> Обработка...';
                    submitBtn.disabled = true;
                    
                    // Имитация отправки
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        showNotification('Успешно сохранено!', 'success');
                    }, 1500);
                }
            } else {
                showNotification('Заполните все обязательные поля', 'error');
            }
        });
    });
}

// ========== УЛУЧШЕННЫЙ СКРОЛЛ ДЛЯ ТАБЛИЦ ==========

function initTableScroll() {
    const tables = document.querySelectorAll('.admin-table');
    
    tables.forEach(table => {
        const container = table.closest('.admin-table-container') || table.parentElement;
        
        if (container.scrollWidth > container.clientWidth) {
            container.style.overflowX = 'auto';
            container.style.position = 'relative';
            
            // Добавляем индикатор прокрутки
            const scrollIndicator = document.createElement('div');
            scrollIndicator.className = 'scroll-indicator';
            scrollIndicator.innerHTML = '<i class="fas fa-chevron-left"></i> Прокрутите в сторону <i class="fas fa-chevron-right"></i>';
            scrollIndicator.style.cssText = `
                position: absolute;
                bottom: 10px;
                right: 10px;
                background: rgba(59, 130, 246, 0.2);
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 0.8rem;
                color: #60a5fa;
                display: flex;
                align-items: center;
                gap: 5px;
            `;
            
            container.style.position = 'relative';
            container.appendChild(scrollIndicator);
            
            // Убираем индикатор после прокрутки
            container.addEventListener('scroll', () => {
                if (container.scrollLeft > 10) {
                    scrollIndicator.style.opacity = '0';
                    setTimeout(() => scrollIndicator.remove(), 300);
                }
            });
        }
    });
}

// ========== АДАПТИВНОЕ ОТОБРАЖЕНИЕ ДАННЫХ ==========

function formatDate(dateString) {
    if (!dateString) return 'Нет данных';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
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
    if (!num) return '0';
    
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    
    return num.toString();
}

// ========== ОБНОВЛЕНИЕ СТАТУСА ONLINE ==========

function updateOnlineStatus() {
    const statusElements = document.querySelectorAll('.user-status');
    
    statusElements.forEach(element => {
        // Имитация статуса (в реальном проекте будет WebSocket)
        const isOnline = Math.random() > 0.3; // 70% шанс быть онлайн
        
        if (isOnline) {
            element.innerHTML = '<span class="status-online"></span> Онлайн';
            element.style.color = '#10b981';
        } else {
            const lastSeen = Math.floor(Math.random() * 60); // минут назад
            element.innerHTML = `<span class="status-offline"></span> Был(а) ${lastSeen} мин назад`;
            element.style.color = '#64748b';
        }
    });
    
    // Обновляем каждые 30 секунд
    setTimeout(updateOnlineStatus, 30000);
}

// ========== ИНИЦИАЛИЗАЦИЯ ЧАТА ==========

function initChat() {
    const chatInput = document.querySelector('.chat-input');
    const chatSendBtn = document.querySelector('.chat-send-btn');
    const chatMessages = document.querySelector('.chat-messages');
    
    if (chatInput && chatSendBtn && chatMessages) {
        function sendMessage() {
            const message = chatInput.value.trim();
            if (!message) return;
            
            // Добавляем сообщение пользователя
            const userMessage = document.createElement('div');
            userMessage.className = 'message user';
            userMessage.innerHTML = `
                <div class="message-content">${message}</div>
                <div class="message-time">${new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}</div>
            `;
            chatMessages.appendChild(userMessage);
            
            // Очищаем поле ввода
            chatInput.value = '';
            
            // Прокручиваем вниз
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Имитируем ответ бота
            setTimeout(() => {
                const botMessage = document.createElement('div');
                botMessage.className = 'message bot';
                botMessage.innerHTML = `
                    <div class="message-content">Я получил ваше сообщение: "${message}". Как виртуальный помощник, я здесь, чтобы помочь с учебой!</div>
                    <div class="message-time">${new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}</div>
                `;
                chatMessages.appendChild(botMessage);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
        }
        
        // Обработчики событий
        chatSendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

// ========== ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('Leo Assistant v1.5 загружен');
    
    // Инициализируем все компоненты
    initMenu();
    initFormValidation();
    initTableScroll();
    initChat();
    updateOnlineStatus();
    
    // Добавляем текущую дату в футер
    const footerDate = document.querySelector('.current-date');
    if (footerDate) {
        footerDate.textContent = new Date().toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
    
    // Показываем приветственное уведомление
    setTimeout(() => {
        showNotification('Добро пожаловать в Leo Assistant v1.5!', 'success', 3000);
    }, 1000);
});

// ========== ХЕЛПЕР ФУНКЦИИ ДЛЯ АДМИН-ПАНЕЛИ ==========

// Фильтрация таблиц
function initTableFilters() {
    const filterInputs = document.querySelectorAll('.table-filter');
    
    filterInputs.forEach(input => {
        input.addEventListener('input', function() {
            const filterValue = this.value.toLowerCase();
            const tableId = this.dataset.table;
            const table = document.getElementById(tableId);
            
            if (table) {
                const rows = table.querySelectorAll('tbody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(filterValue) ? '' : 'none';
                });
            }
        });
    });
}

// Сортировка таблиц
function initTableSorting() {
    const sortableHeaders = document.querySelectorAll('.sortable');
    
    sortableHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        
        header.addEventListener('click', function() {
            const table = this.closest('table');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const columnIndex = Array.from(this.parentNode.children).indexOf(this);
            
            // Определяем направление сортировки
            const isAscending = !this.classList.contains('asc');
            this.classList.toggle('asc', isAscending);
            this.classList.toggle('desc', !isAscending);
            
            // Сортируем строки
            rows.sort((a, b) => {
                const aText = a.children[columnIndex].textContent;
                const bText = b.children[columnIndex].textContent;
                
                if (isAscending) {
                    return aText.localeCompare(bText, 'ru', {numeric: true});
                } else {
                    return bText.localeCompare(aText, 'ru', {numeric: true});
                }
            });
            
            // Переставляем строки
            rows.forEach(row => tbody.appendChild(row));
        });
    });
}

// Экспорт данных
function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const rows = table.querySelectorAll('tr');
    const csv = [];
    
    rows.forEach(row => {
        const rowData = [];
        const cells = row.querySelectorAll('th, td');
        
        cells.forEach(cell => {
            rowData.push(`"${cell.textContent.replace(/"/g, '""')}"`);
        });
        
        csv.push(rowData.join(','));
    });
    
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'export.csv';
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('Данные экспортированы в CSV', 'success');
}

// ========== ГЛОБАЛЬНЫЕ ФУНКЦИИ ==========

// Делаем функции доступными глобально
window.showNotification = showNotification;
window.formatDate = formatDate;
window.formatNumber = formatNumber;
window.exportTableToCSV = exportTableToCSV;

// Автоматическое обновление каждые 5 минут
setInterval(() => {
    if (document.hidden) return; // Не обновляем если вкладка неактивна
    
    // Здесь можно добавить обновление данных
    console.log('Автообновление данных...');
}, 300000); // 5 минут
