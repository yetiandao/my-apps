/**
 * 记账本Pro - 前端逻辑
 * 极简记账，月光族省钱建议
 */

const API_BASE = '/api';

// ========== 全局变量 ==========
let categories = [];
let records = [];
let selectedCategory = null;
let budget = { monthly: 3000, spent: 0 };

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', async () => {
    await loadCategories();
    await loadBudget();
    await loadRecentRecords();
    
    // 绑定快速记账按钮
    document.getElementById('quickAddBtn').addEventListener('click', showAddModal);
    
    // 绑定金额输入自动聚焦
    document.getElementById('quickAddBtn').addEventListener('click', () => {
        setTimeout(() => {
            document.getElementById('amountInput').focus();
        }, 100);
    });
});

// ========== API调用 ==========
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const result = await response.json();
        
        return result;
    } catch (error) {
        console.error('API调用失败:', error);
        showToast('网络错误，请稍后重试', 'error');
        return null;
    }
}

// ========== 加载分类 ==========
async function loadCategories() {
    const result = await apiCall('/categories');
    if (result && result.code === 200) {
        categories = result.data;
        renderCategoryGrid();
    }
}

// ========== 渲染分类选择 ==========
function renderCategoryGrid() {
    const grid = document.getElementById('categoryGrid');
    grid.innerHTML = categories.map(cat => `
        <div class="category-item ${selectedCategory === cat.id ? 'selected' : ''}" 
             data-id="${cat.id}" 
             onclick="selectCategory('${cat.id}')">
            <span class="icon">${cat.icon}</span>
            <span class="name">${cat.name}</span>
        </div>
    `).join('');
}

// ========== 选择分类 ==========
function selectCategory(categoryId) {
    selectedCategory = categoryId;
    renderCategoryGrid();
}

// ========== 加载预算 ==========
async function loadBudget() {
    const result = await apiCall('/budget');
    if (result && result.code === 200) {
        budget = result.data;
        renderBudget();
    }
}

// ========== 渲染预算 ==========
function renderBudget() {
    const remaining = budget.monthly - budget.spent;
    const percentage = (budget.spent / budget.monthly * 100).toFixed(1);
    
    document.getElementById('remainingBudget').textContent = `¥${remaining.toFixed(2)}`;
    document.getElementById('spentAmount').textContent = budget.spent.toFixed(0);
    document.getElementById('totalBudget').textContent = budget.monthly.toFixed(0);
    
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = `${Math.min(percentage, 100)}%`;
    
    // 根据消费比例改变颜色
    if (percentage > 90) {
        progressFill.style.background = '#EF4444';
    } else if (percentage > 70) {
        progressFill.style.background = '#F59E0B';
    } else {
        progressFill.style.background = 'linear-gradient(90deg, #10B981 0%, #F59E0B 70%, #EF4444 100%)';
    }
}

// ========== 加载最近记录 ==========
async function loadRecentRecords() {
    const result = await apiCall('/records');
    if (result && result.code === 200) {
        records = result.data;
        renderRecentRecords();
    }
}

// ========== 渲染最近记录 ==========
function renderRecentRecords() {
    const container = document.getElementById('recentRecords');
    const recent = records.slice(-5).reverse();
    
    if (recent.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>还没有记账记录<br>点击下方按钮开始记账吧</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recent.map(record => {
        const category = categories.find(c => c.id === record.category) || categories[0];
        const date = new Date(record.date);
        const timeStr = date.toLocaleString('zh-CN', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="record-item">
                <div class="record-icon" style="background: ${category.color}20;">
                    ${category.icon}
                </div>
                <div class="record-info">
                    <div class="record-category">${category.name}</div>
                    <div class="record-note">${record.note || timeStr}</div>
                </div>
                <div class="record-right">
                    <div class="record-amount">-¥${record.amount.toFixed(2)}</div>
                    <div class="record-date">${timeStr}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ========== 显示记账模态框 ==========
function showAddModal() {
    document.getElementById('addModal').classList.add('active');
    selectedCategory = null;
    renderCategoryGrid();
    document.getElementById('amountInput').value = '';
    document.getElementById('noteInput').value = '';
}

// ========== 关闭记账模态框 ==========
function closeAddModal() {
    document.getElementById('addModal').classList.remove('active');
}

// ========== 提交记账 ==========
async function submitRecord() {
    const amount = document.getElementById('amountInput').value;
    const note = document.getElementById('noteInput').value;
    
    if (!amount || parseFloat(amount) <= 0) {
        showToast('请输入有效的金额', 'error');
        return;
    }
    
    if (!selectedCategory) {
        showToast('请选择分类', 'error');
        return;
    }
    
    const result = await apiCall('/records', 'POST', {
        amount: parseFloat(amount),
        category: selectedCategory,
        note: note
    });
    
    if (result && result.code === 200) {
        showToast('记账成功！', 'success');
        closeAddModal();
        
        // 重新加载数据
        await Promise.all([
            loadRecentRecords(),
            loadBudget()
        ]);
    } else {
        showToast(result?.message || '记账失败', 'error');
    }
}

// ========== 页面切换 ==========
function switchTab(tab) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    if (tab === 'home') {
        // 回到首页，刷新数据
        Promise.all([
            loadRecentRecords(),
            loadBudget()
        ]);
    } else if (tab === 'stats') {
        document.getElementById('statsPage').classList.add('active');
        loadStats();
    } else if (tab === 'ai') {
        document.getElementById('aiPage').classList.add('active');
        loadAISuggestions();
    } else if (tab === 'reminders') {
        document.getElementById('remindersPage').classList.add('active');
        loadReminders();
    }
}

// ========== 加载统计数据 ==========
async function loadStats() {
    const result = await apiCall('/stats/monthly');
    if (result && result.code === 200) {
        const data = result.data;
        
        // 更新总支出
        document.getElementById('monthTotal').textContent = `¥${data.total.toFixed(2)}`;
        
        // 计算日均消费
        const daysInMonth = new Date().getDate();
        const dailyAvg = data.total / daysInMonth;
        document.getElementById('dailyAvg').textContent = `¥${dailyAvg.toFixed(2)}`;
        
        // 渲染饼图
        renderPieChart(data.category_stats);
        
        // 渲染分类明细
        renderCategoryBreakdown(data.category_stats, data.total);
    }
}

// ========== 渲染饼图 ==========
function renderPieChart(stats) {
    const container = document.getElementById('pieChart');
    
    const total = stats.reduce((sum, item) => sum + item.amount, 0);
    
    container.innerHTML = stats.filter(item => item.amount > 0).map(item => `
        <div class="pie-item">
            <div class="pie-color" style="background: ${item.color};"></div>
            <span class="pie-label">${item.icon} ${item.name} ${item.percentage}%</span>
            <span class="pie-value">¥${item.amount.toFixed(0)}</span>
        </div>
    `).join('') || '<p style="text-align: center; color: #999;">暂无数据</p>';
}

// ========== 渲染分类明细 ==========
function renderCategoryBreakdown(stats, total) {
    const container = document.getElementById('categoryBreakdown');
    
    container.innerHTML = stats.filter(item => item.amount > 0).map(item => {
        const category = categories.find(c => c.id === item.category);
        return `
            <div class="breakdown-item">
                <div class="breakdown-icon" style="background: ${item.color}20;">
                    ${item.icon}
                </div>
                <div class="breakdown-info">
                    <div class="breakdown-name">${item.name}</div>
                    <div class="breakdown-bar">
                        <div class="breakdown-fill" style="width: ${item.percentage}%; background: ${item.color};"></div>
                    </div>
                </div>
                <div class="breakdown-amount">¥${item.amount.toFixed(0)}</div>
            </div>
        `;
    }).join('') || '<div class="empty-state"><p>暂无数据</p></div>';
}

// ========== 显示统计详情 ==========
function showStatsDetail() {
    switchTab('stats');
}

// ========== 加载AI建议 ==========
async function loadAISuggestions() {
    const result = await apiCall('/ai/suggestions');
    if (result && result.code === 200) {
        const data = result.data;
        
        document.getElementById('potentialSaving').textContent = `¥${data.potential_saving}`;
        
        renderSuggestions(data.suggestions);
    }
}

// ========== 渲染建议 ==========
function renderSuggestions(suggestions) {
    const container = document.getElementById('suggestionsList');
    
    container.innerHTML = suggestions.map(suggestion => `
        <div class="suggestion-card">
            <div class="suggestion-header">
                <span class="suggestion-title">${suggestion.title}</span>
                <span class="suggestion-saving">可省¥${suggestion.saving}</span>
            </div>
            <div class="suggestion-content">${suggestion.content}</div>
        </div>
    `).join('');
}

// ========== 加载提醒 ==========
async function loadReminders() {
    const result = await apiCall('/reminders');
    if (result && result.code === 200) {
        renderReminders(result.data);
    }
}

// ========== 渲染提醒 ==========
function renderReminders(reminders) {
    const container = document.getElementById('remindersList');
    
    if (reminders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <p>还没有设置账单提醒<br>点击右上角"+"添加</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = reminders.map(reminder => {
        const dueDate = new Date(reminder.due_date);
        const dateStr = dueDate.toLocaleDateString('zh-CN', { 
            month: 'long',
            day: 'numeric'
        });
        
        const icon = reminder.type === 'credit_card' ? '💳' : '🌸';
        
        return `
            <div class="reminder-card">
                <div class="reminder-icon ${reminder.type}">
                    ${icon}
                </div>
                <div class="reminder-info">
                    <div class="reminder-name">${reminder.name}</div>
                    <div class="reminder-date">${dateStr} 还款</div>
                </div>
                <div class="reminder-amount">¥${reminder.amount.toFixed(0)}</div>
            </div>
        `;
    }).join('');
}

// ========== 显示提醒模态框 ==========
function showReminderModal() {
    document.getElementById('reminderModal').classList.add('active');
    document.getElementById('reminderName').value = '';
    document.getElementById('reminderAmount').value = '';
    document.getElementById('reminderDate').value = '';
}

// ========== 关闭提醒模态框 ==========
function closeReminderModal() {
    document.getElementById('reminderModal').classList.remove('active');
}

// ========== 提交提醒 ==========
async function submitReminder() {
    const name = document.getElementById('reminderName').value;
    const amount = document.getElementById('reminderAmount').value;
    const dueDate = document.getElementById('reminderDate').value;
    
    if (!name || !amount || !dueDate) {
        showToast('请填写完整信息', 'error');
        return;
    }
    
    const result = await apiCall('/reminders', 'POST', {
        name,
        amount: parseFloat(amount),
        due_date: dueDate,
        type: 'credit_card'
    });
    
    if (result && result.code === 200) {
        showToast('提醒添加成功', 'success');
        closeReminderModal();
        loadReminders();
    } else {
        showToast('添加失败', 'error');
    }
}

// ========== 显示预算设置模态框 ==========
function showBudgetModal() {
    document.getElementById('budgetModal').classList.add('active');
    document.getElementById('budgetInput').value = budget.monthly;
}

// ========== 关闭预算设置模态框 ==========
function closeBudgetModal() {
    document.getElementById('budgetModal').classList.remove('active');
}

// ========== 提交预算设置 ==========
async function submitBudget() {
    const monthly = document.getElementById('budgetInput').value;
    
    if (!monthly || parseFloat(monthly) <= 0) {
        showToast('请输入有效的预算金额', 'error');
        return;
    }
    
    const result = await apiCall('/budget', 'PUT', {
        monthly: parseFloat(monthly)
    });
    
    if (result && result.code === 200) {
        showToast('预算设置成功', 'success');
        closeBudgetModal();
        loadBudget();
    } else {
        showToast('设置失败', 'error');
    }
}

// ========== Toast提示 ==========
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========== 本地存储辅助（可选） ==========
const LocalStorageHelper = {
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('本地存储失败:', e);
            return false;
        }
    },
    
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('读取本地存储失败:', e);
            return defaultValue;
        }
    },
    
    remove(key) {
        localStorage.removeItem(key);
    }
};

// ========== 数据持久化建议 ==========
// 定期将重要数据备份到localStorage
async function backupToLocalStorage() {
    const [categoriesData, recordsData, budgetData] = await Promise.all([
        apiCall('/categories'),
        apiCall('/records'),
        apiCall('/budget')
    ]);
    
    if (categoriesData?.code === 200) {
        LocalStorageHelper.save('categories', categoriesData.data);
    }
    if (recordsData?.code === 200) {
        LocalStorageHelper.save('records', recordsData.data);
    }
    if (budgetData?.code === 200) {
        LocalStorageHelper.save('budget', budgetData.data);
    }
}

// 页面关闭时自动备份
window.addEventListener('beforeunload', backupToLocalStorage);
