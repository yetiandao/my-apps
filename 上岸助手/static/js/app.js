/**
 * 上岸助手 - 前端应用逻辑
 * 考公考编智能备考，一站式上岸规划
 */

// API基础URL
const API_BASE = '';

// 全局状态
let currentPage = 'dashboard';
let selectedPlan = null;

// ========================================
// 页面初始化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initEventListeners();
    loadDashboard();
});

// ========================================
// 导航功能
// ========================================

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    // 更新页面显示
    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.id === `page-${page}`);
    });
    
    currentPage = page;
    
    // 加载对应页面数据
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'calendar':
            loadExamCalendar();
            break;
        case 'posts':
            loadPosts();
            break;
        case 'study':
            // 学习打卡页面无需额外加载
            break;
        case 'wrong':
            loadWrongQuestions();
            break;
    }
}

// ========================================
// 事件监听
// ========================================

function initEventListeners() {
    // 快捷功能卡片
    document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('click', () => {
            const action = card.dataset.action;
            handleQuickAction(action);
        });
    });
    
    // 打卡表单提交
    document.getElementById('checkin-form').addEventListener('submit', handleCheckin);
    
    // 点击模态框外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// ========================================
// 快捷功能处理
// ========================================

function handleQuickAction(action) {
    switch(action) {
        case 'plan':
            openModal('modal-plan');
            break;
        case 'checkin':
            navigateTo('study');
            break;
        case 'vip':
            openModal('modal-vip');
            loadVipPlans();
            break;
        case 'analysis':
            navigateTo('posts');
            break;
    }
}

// ========================================
// 仪表盘数据加载
// ========================================

async function loadDashboard() {
    try {
        const res = await fetch(`${API_BASE}/api/dashboard`);
        const data = await res.json();
        
        // 更新统计卡片
        document.getElementById('stat-exams').textContent = data.stats.total_exams;
        document.getElementById('stat-upcoming').textContent = data.stats.upcoming_exams;
        document.getElementById('stat-posts').textContent = data.stats.total_posts;
        document.getElementById('stat-days').textContent = data.stats.study_days;
        
        // 更新倒计时
        updateCountdown(data.upcoming_exams[0]);
        
        // 更新学习趋势图
        renderWeeklyChart(data.daily_progress);
        
    } catch (error) {
        console.error('加载仪表盘数据失败:', error);
        showToast('数据加载失败，请刷新重试', 'error');
    }
}

// ========================================
// 倒计时更新
// ========================================

function updateCountdown(exam) {
    if (!exam) return;
    
    const examDate = new Date(exam.exam_date);
    const now = new Date();
    const diff = examDate - now;
    
    if (diff <= 0) {
        document.getElementById('countdown-days').textContent = '00';
        document.getElementById('countdown-hours').textContent = '00';
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    document.getElementById('countdown-days').textContent = String(days).padStart(2, '0');
    document.getElementById('countdown-hours').textContent = String(hours).padStart(2, '0');
    
    // 更新考试名称
    const nextExamEl = document.getElementById('next-exam');
    nextExamEl.querySelector('.exam-name').textContent = exam.name;
    nextExamEl.querySelector('.exam-date').textContent = `考试日期: ${exam.exam_date}`;
}

// 每分钟更新倒计时
setInterval(() => {
    if (currentPage === 'dashboard') {
        const exam = { exam_date: '2025-11-24' };
        updateCountdown({ exam_date: '2025-11-24' });
    }
}, 60000);

// ========================================
// 每周趋势图
// ========================================

function renderWeeklyChart(data) {
    const container = document.getElementById('weekly-chart');
    if (!container) return;
    
    const maxHours = Math.max(...data.map(d => d.hours));
    
    container.innerHTML = data.map(day => `
        <div class="chart-bar">
            <div class="bar-value">${day.hours}h</div>
            <div class="bar" style="height: ${(day.hours / maxHours) * 120}px"></div>
            <div class="bar-label">${day.weekday}</div>
        </div>
    `).join('');
}

// ========================================
// 考试日历
// ========================================

async function loadExamCalendar() {
    try {
        const res = await fetch(`${API_BASE}/api/exam-calendar`);
        const data = await res.json();
        
        const container = document.getElementById('calendar-list');
        if (!container) return;
        
        container.innerHTML = data.exams.map(exam => {
            const typeClass = getTypeClass(exam.type);
            const statusClass = getStatusClass(exam.status);
            
            return `
                <div class="calendar-item">
                    <div class="calendar-type ${typeClass}">
                        <span class="calendar-type-name">${exam.type}</span>
                    </div>
                    <div class="calendar-info">
                        <div class="calendar-name">${exam.name}</div>
                        <div class="calendar-dates">
                            <div class="calendar-date-item">
                                <span>📝</span>
                                <span>报名: ${exam.registration_start} ~ ${exam.registration_end}</span>
                            </div>
                            <div class="calendar-date-item">
                                <span>📅</span>
                                <span>笔试: ${exam.exam_date}</span>
                            </div>
                        </div>
                        <div class="calendar-desc">${exam.description}</div>
                    </div>
                    <span class="calendar-status ${statusClass}">${exam.status}</span>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('加载考试日历失败:', error);
    }
}

function getTypeClass(type) {
    const typeMap = {
        '国考': 'guokao',
        '省考': 'shengkao',
        '事业编': 'shiyebian',
        '教资': 'jiaozi'
    };
    return typeMap[type] || 'shengkao';
}

function getStatusClass(status) {
    const statusMap = {
        '报名中': 'baomingzhong',
        '即将报名': 'jiangbaoming',
        '备考中': 'beikaozhong',
        '考试中': 'kaoshizhong',
        '规划中': 'guihua'
    };
    return statusMap[status] || 'guihua';
}

// ========================================
// 岗位分析
// ========================================

async function loadPosts() {
    try {
        // 加载岗位列表
        const res = await fetch(`${API_BASE}/api/posts`);
        const data = await res.json();
        
        renderPostsList(data.posts);
        
        // 加载分析统计
        const analysisRes = await fetch(`${API_BASE}/api/posts/analysis`);
        const analysisData = await analysisRes.json();
        
        document.getElementById('posts-total').textContent = analysisData.total_posts;
        document.getElementById('posts-avg-ratio').textContent = `${analysisData.avg_competition_ratio}:1`;
        document.getElementById('posts-min-ratio').textContent = `${analysisData.min_competition_ratio}:1`;
        document.getElementById('posts-avg-score').textContent = `${analysisData.avg_pass_score}分`;
        
    } catch (error) {
        console.error('加载岗位数据失败:', error);
    }
}

function filterPosts() {
    const examId = document.getElementById('filter-exam').value;
    const location = document.getElementById('filter-location').value;
    const maxRatio = document.getElementById('filter-ratio').value;
    const minScore = document.getElementById('filter-score').value;
    
    let url = `${API_BASE}/api/posts?`;
    if (examId) url += `exam_id=${examId}&`;
    if (location) url += `location=${location}&`;
    if (maxRatio) url += `max_ratio=${maxRatio}&`;
    if (minScore) url += `min_score=${minScore}&`;
    
    fetch(url)
        .then(res => res.json())
        .then(data => renderPostsList(data.posts))
        .catch(err => console.error('筛选失败:', err));
}

function renderPostsList(posts) {
    const container = document.getElementById('posts-list');
    if (!container) return;
    
    if (posts.length === 0) {
        container.innerHTML = '<div class="no-data">暂无符合条件的岗位</div>';
        return;
    }
    
    container.innerHTML = posts.map(post => {
        const ratioClass = post.competition_ratio > 100 ? 'high-ratio' : 
                           post.competition_ratio < 50 ? 'low-ratio' : '';
        
        return `
            <div class="post-item">
                <div class="post-header">
                    <div class="post-info">
                        <div class="post-department">${post.department}</div>
                        <div class="post-position">${post.position}</div>
                    </div>
                    <div class="post-badges">
                        <span class="post-badge location">📍 ${post.location}</span>
                        <span class="post-badge edu">🎓 ${post.education}</span>
                    </div>
                </div>
                <div class="post-stats-row">
                    <div class="post-stat">
                        <div class="post-stat-value">${post.recruit_number}</div>
                        <div class="post-stat-label">招录人数</div>
                    </div>
                    <div class="post-stat">
                        <div class="post-stat-value ${ratioClass}">${post.competition_ratio}:1</div>
                        <div class="post-stat-label">竞争比</div>
                    </div>
                    <div class="post-stat">
                        <div class="post-stat-value">${post.register_number}</div>
                        <div class="post-stat-label">报名人数</div>
                    </div>
                    <div class="post-stat">
                        <div class="post-stat-value">${post.pass_score}</div>
                        <div class="post-stat-label">进面分数</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// 学习打卡
// ========================================

async function handleCheckin(e) {
    e.preventDefault();
    
    const hours = parseFloat(document.getElementById('study-hours').value);
    const tasks = parseInt(document.getElementById('tasks-done').value);
    const note = document.getElementById('study-note').value;
    
    try {
        const res = await fetch(`${API_BASE}/api/study/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hours, tasks_done: tasks, note })
        });
        
        const data = await res.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            
            // 清空表单
            document.getElementById('checkin-form').reset();
            
            // 更新打卡记录
            updateCheckinHistory(data.record);
        }
    } catch (error) {
        console.error('打卡失败:', error);
        showToast('打卡失败，请重试', 'error');
    }
}

function updateCheckinHistory(record) {
    const historyList = document.getElementById('history-list');
    
    const newItem = document.createElement('div');
    newItem.className = 'history-item';
    newItem.innerHTML = `
        <div class="history-date">今天</div>
        <div class="history-content">
            <span class="history-hours">${record.hours} 小时</span>
            <span class="history-tasks">${record.tasks_done} 道题</span>
        </div>
        <div class="history-note">${record.note || '暂无备注'}</div>
    `;
    
    historyList.insertBefore(newItem, historyList.firstChild);
}

// ========================================
// 错题本
// ========================================

async function loadWrongQuestions() {
    try {
        const res = await fetch(`${API_BASE}/api/wrong-questions`);
        const data = await res.json();
        
        renderWrongQuestions(data.questions);
    } catch (error) {
        console.error('加载错题失败:', error);
    }
}

function renderWrongQuestions(questions) {
    const container = document.getElementById('wrong-list');
    if (!container) return;
    
    container.innerHTML = questions.map(q => `
        <div class="wrong-item">
            <div class="wrong-header">
                <span class="wrong-category">${q.category}</span>
                <span class="wrong-difficulty">难度: ${q.difficulty}</span>
            </div>
            <div class="wrong-question">${q.question}</div>
            <div class="wrong-options">
                ${q.options.map(opt => {
                    let cls = '';
                    if (opt.startsWith(q.correct_answer + '.')) cls = 'correct';
                    if (opt.startsWith(q.user_answer + '.')) cls = 'user-wrong';
                    return `<div class="wrong-option ${cls}">${opt}</div>`;
                }).join('')}
            </div>
            <div class="wrong-analysis">
                <div class="wrong-analysis-title">💡 正确答案解析</div>
                <div>${q.analysis}</div>
            </div>
        </div>
    `).join('');
}

// ========================================
// 智能规划
// ========================================

async function generatePlan() {
    const examDate = document.getElementById('plan-exam').value;
    const dailyHours = parseInt(document.getElementById('plan-hours').value);
    
    try {
        const res = await fetch(`${API_BASE}/api/plan/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exam_date: examDate, daily_hours: dailyHours })
        });
        
        const data = await res.json();
        
        if (data.success) {
            renderPlanResult(data.plan);
        }
    } catch (error) {
        console.error('生成规划失败:', error);
        showToast('生成失败，请重试', 'error');
    }
}

function renderPlanResult(plan) {
    const container = document.getElementById('plan-content');
    
    container.innerHTML = `
        <div class="plan-result">
            <div class="plan-info" style="background: #EEF2FF; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <p>📅 目标考试: ${plan.exam_date}</p>
                <p>⏱️ 剩余天数: <strong style="color: #4F46E5">${plan.days_left}</strong> 天</p>
                <p>📚 可用时长: <strong>${plan.total_hours}</strong> 小时</p>
            </div>
            
            ${plan.phases.map(phase => `
                <div class="plan-phase">
                    <div class="plan-phase-title">📌 ${phase.name}</div>
                    <div class="plan-phase-duration">⏰ ${phase.duration}</div>
                    <div class="plan-phase-tips">${phase.focus.join(' · ')}</div>
                </div>
            `).join('')}
            
            <div style="margin-top: 20px;">
                <h4 style="margin-bottom: 12px;">💡 备考建议</h4>
                <ul style="font-size: 14px; color: #64748B; padding-left: 20px;">
                    ${plan.tips.map(tip => `<li style="margin-bottom: 8px;">${tip}</li>`).join('')}
                </ul>
            </div>
            
            <button class="btn btn-primary btn-block" style="margin-top: 20px;" onclick="closeModal('modal-plan')">
                开始执行计划 🚀
            </button>
        </div>
    `;
}

// ========================================
// VIP套餐
// ========================================

async function loadVipPlans() {
    try {
        const res = await fetch(`${API_BASE}/api/vip/plans`);
        const data = await res.json();
        
        const container = document.getElementById('vip-plans');
        
        container.innerHTML = data.plans.map(plan => `
            <div class="vip-plan" data-plan-id="${plan.id}" onclick="selectPlan(${plan.id}, ${plan.price})">
                <div class="vip-plan-name">${plan.name}</div>
                <div class="vip-plan-price">${plan.price}<span>元</span></div>
                <div class="vip-plan-duration">有效期 ${plan.duration} 天</div>
                <button class="vip-plan-btn">选择套餐</button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('加载VIP套餐失败:', error);
    }
}

function selectPlan(planId, price) {
    selectedPlan = { id: planId, price };
    
    // 更新选中状态
    document.querySelectorAll('.vip-plan').forEach(el => {
        el.classList.toggle('selected', parseInt(el.dataset.planId) === planId);
    });
    
    // 确认购买
    if (confirm(`确认购买此套餐？价格: ¥${price}`)) {
        purchaseVip(planId);
    }
}

async function purchaseVip(planId) {
    try {
        const res = await fetch(`${API_BASE}/api/vip/purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan_id: planId })
        });
        
        const data = await res.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            closeModal('modal-vip');
            
            // 更新VIP状态显示
            document.querySelector('.vip-badge').innerHTML = `
                <span class="vip-icon">👑</span>
                <span class="vip-text">年卡会员</span>
            `;
        }
    } catch (error) {
        console.error('购买失败:', error);
        showToast('购买失败，请重试', 'error');
    }
}

// ========================================
// 模态框
// ========================================

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ========================================
// 提示消息
// ========================================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
