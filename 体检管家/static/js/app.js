/**
 * 体检管家 APP - 前端逻辑
 * MVP版本
 */

// API基础路径
const API_BASE = '';

// 当前用户
const CURRENT_USER = 'user001';

// 全局状态
let currentPage = 'home';
let currentReport = null;
let memberStatus = null;
let reportsCache = [];

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
});

async function initApp() {
    try {
        // 检查API健康状态
        const health = await apiGet('/api/health');
        console.log('API状态:', health);
        
        // 加载会员状态
        await loadMemberStatus();
        
        // 加载报告列表
        await loadReportsList();
        
        // 加载健康概览
        updateHealthOverview();
        
        // 随机健康小贴士
        updateDailyTip();
        
    } catch (error) {
        console.error('初始化失败:', error);
        showToast('加载失败，请刷新重试');
    }
}

// ==================== API请求 ====================

async function apiGet(url) {
    const response = await fetch(API_BASE + url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

async function apiPost(url, data) {
    const response = await fetch(API_BASE + url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || '请求失败');
    return result;
}

// ==================== 页面导航 ====================

function switchTab(tab) {
    currentPage = tab;
    
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // 显示目标页面
    const targetPage = document.getElementById(getPageId(tab));
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });
    
    // 页面特定初始化
    if (tab === 'history') {
        renderHistoryPage();
    } else if (tab === 'trend') {
        initTrendPage();
    } else if (tab === 'member') {
        renderMemberPage();
    }
}

function getPageId(tab) {
    const pageMap = {
        'home': 'homePage',
        'history': 'historyPage',
        'trend': 'trendPage',
        'member': 'memberPage',
        'report-detail': 'reportDetailPage',
        'trend-detail': 'trendDetailPage'
    };
    return pageMap[tab] || tab + 'Page';
}

function goBack() {
    switchTab('home');
}

// ==================== 首页功能 ====================

function triggerUpload() {
    document.getElementById('fileInput').click();
}

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 显示加载状态
    showLoading(true);
    
    try {
        // 模拟将图片转为base64
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
        
        // 模拟OCR处理延迟
        showToast('正在识别体检报告...');
        await sleep(1500);
        
        // 调用API上传
        const result = await apiPost('/api/report/upload', {
            image_base64: base64,
            user_id: CURRENT_USER
        });
        
        if (result.success) {
            // 跳转到报告详情
            currentReport = result.report;
            showReportDetail(result.report);
            showToast('报告解读完成！');
        }
        
    } catch (error) {
        console.error('上传失败:', error);
        showToast('上传失败，请重试');
    } finally {
        showLoading(false);
        event.target.value = '';
    }
}

function showReportDetail(report) {
    currentReport = report;
    
    // 更新页面标题
    document.getElementById('reportDate').textContent = report.check_date;
    
    // 更新摘要
    const summary = report.summary;
    const total = summary.normal + summary.attention + summary.abnormal + summary.severe;
    const normalPercent = total > 0 ? Math.round((summary.normal / total) * 100) : 0;
    
    document.getElementById('normalPercent').textContent = normalPercent + '%';
    document.getElementById('summaryChart').querySelector('.chart-ring').style.setProperty('--percent', normalPercent);
    
    document.getElementById('normalCount').textContent = summary.normal;
    document.getElementById('attentionCount').textContent = summary.attention;
    document.getElementById('abnormalCount').textContent = summary.abnormal + summary.severe;
    
    // 渲染指标分类
    renderMetrics(report);
    
    // 渲染建议
    renderRecommendations(report.recommendations);
    
    // 切换到详情页
    switchTab('report-detail');
}

function renderMetrics(report) {
    const container = document.getElementById('metricsContainer');
    container.innerHTML = '';
    
    // 按分类组织指标
    const categories = {};
    report.metrics.forEach(metric => {
        if (!categories[metric.category]) {
            categories[metric.category] = [];
        }
        categories[metric.category].push(metric);
    });
    
    // 渲染每个分类
    Object.entries(categories).forEach(([category, metrics]) => {
        const section = document.createElement('div');
        section.className = 'category-section';
        section.innerHTML = `
            <h4 class="category-title">${category}</h4>
            ${metrics.map(m => createMetricItem(m)).join('')}
        `;
        container.appendChild(section);
    });
}

function createMetricItem(metric) {
    const levelClass = metric.level;
    const levelText = {
        'normal': '正常',
        'attention': '关注',
        'abnormal': '异常',
        'severe': '严重'
    }[metric.level];
    
    const position = ((metric.value - metric.ref_min) / (metric.ref_max - metric.ref_min)) * 100;
    const clampedPosition = Math.min(Math.max(position, 5), 95);
    
    return `
        <div class="metric-item" onclick="toggleMetricExpand(this)">
            <div class="metric-main">
                <div class="metric-info">
                    <div class="metric-name">${metric.name}</div>
                    <div class="metric-simple">${metric.name_simple}</div>
                </div>
                <div class="metric-value-box">
                    <div class="metric-value">${metric.value}</div>
                    <div class="metric-unit">${metric.unit}</div>
                </div>
                <span class="metric-level ${levelClass}">${levelText}</span>
            </div>
            <div class="metric-expand">
                <p>${metric.description || ''}</p>
                <p>${metric.interpretation || ''}</p>
                <div class="metric-range">
                    <span>参考: ${metric.ref_min} - ${metric.ref_max}</span>
                    <div class="range-bar">
                        <span style="left: 5%; font-size: 9px; position: absolute; color: var(--text-light);">低</span>
                        <span style="right: 5%; font-size: 9px; position: absolute; color: var(--text-light);">高</span>
                        <div class="range-indicator" style="left: ${clampedPosition}%"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function toggleMetricExpand(element) {
    element.classList.toggle('expanded');
}

function renderRecommendations(recommendations) {
    const container = document.getElementById('recommendationsList');
    container.innerHTML = '';
    
    const allRecommendations = [
        ...(recommendations.general || []).map(r => ({ icon: '📌', text: r })),
        ...(recommendations.specific || []).map(r => ({ icon: '💡', text: r }))
    ];
    
    if (allRecommendations.length === 0) {
        container.innerHTML = '<div class="recommendation-item"><span>继续保持良好的生活习惯！</span></div>';
        return;
    }
    
    allRecommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        item.innerHTML = `
            <span class="recommendation-icon">${rec.icon}</span>
            <span>${rec.text}</span>
        `;
        container.appendChild(item);
    });
}

// ==================== 历史报告 ====================

async function loadReportsList() {
    try {
        const result = await apiGet(`/api/reports?user_id=${CURRENT_USER}`);
        reportsCache = result.reports || [];
        renderRecentReports();
    } catch (error) {
        console.error('加载报告列表失败:', error);
    }
}

function renderRecentReports() {
    const container = document.getElementById('reportList');
    
    if (reportsCache.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <p>暂无报告</p>
                <span>上传第一份体检报告开始健康管理</span>
            </div>
        `;
        return;
    }
    
    // 显示最近3份
    const recent = reportsCache.slice(0, 3);
    container.innerHTML = recent.map(report => createReportCard(report)).join('');
}

function createReportCard(report) {
    const summary = report.summary;
    const abnormalCount = summary.attention + summary.abnormal + summary.severe;
    const statusClass = abnormalCount === 0 ? 'normal' : abnormalCount <= 2 ? 'attention' : 'abnormal';
    const statusText = abnormalCount === 0 ? '全部正常' : `${abnormalCount}项需关注`;
    
    const date = new Date(report.check_date);
    const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
    
    return `
        <div class="report-card" onclick="viewReport('${report.report_id}')">
            <div class="report-card-header">
                <span class="report-date">${dateStr}</span>
                <span class="report-status ${statusClass}">${statusText}</span>
            </div>
            <div class="report-hospital">${report.hospital}</div>
            <div class="report-summary-mini">
                <span>✅ ${summary.normal}项正常</span>
                <span>⚠️ ${summary.attention}项关注</span>
                <span>🔴 ${summary.abnormal}项异常</span>
            </div>
        </div>
    `;
}

async function viewReport(reportId) {
    showLoading(true);
    
    try {
        const result = await apiGet(`/api/report/${reportId}`);
        if (result.success) {
            showReportDetail(result.report);
        }
    } catch (error) {
        console.error('加载报告失败:', error);
        showToast('加载报告失败');
    } finally {
        showLoading(false);
    }
}

function showAllReports() {
    switchTab('history');
}

function renderHistoryPage() {
    const container = document.getElementById('historyList');
    
    if (reportsCache.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <p>暂无历史报告</p>
                <span>上传体检报告后将显示在这里</span>
            </div>
        `;
        return;
    }
    
    container.innerHTML = reportsCache.map(report => {
        const summary = report.summary;
        const date = new Date(report.check_date);
        const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        
        return `
            <div class="history-card" onclick="viewReport('${report.report_id}')">
                <div class="history-card-header">
                    <span class="history-date">${dateStr}</span>
                    <span class="report-status ${summary.abnormal > 0 ? 'abnormal' : 'normal'}">
                        ${summary.abnormal > 0 ? '有异常' : '正常'}
                    </span>
                </div>
                <div class="history-source">${report.hospital}</div>
                <div class="history-stats">
                    <div>
                        <div class="history-stat-value" style="color: var(--primary)">${summary.normal}</div>
                        <div class="history-stat-label">正常</div>
                    </div>
                    <div>
                        <div class="history-stat-value" style="color: #D68910">${summary.attention}</div>
                        <div class="history-stat-label">关注</div>
                    </div>
                    <div>
                        <div class="history-stat-value" style="color: var(--danger)">${summary.abnormal}</div>
                        <div class="history-stat-label">异常</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== 健康趋势 ====================

let allMetrics = [];

async function initTrendPage() {
    // 填充指标选择器
    const selector = document.getElementById('metricSelector');
    if (selector.options.length <= 1) {
        // 获取所有报告的指标
        const metricsSet = new Set();
        for (const report of reportsCache) {
            const result = await apiGet(`/api/report/${report.report_id}`);
            if (result.success) {
                result.report.metrics.forEach(m => metricsSet.add(m.id));
            }
        }
        
        // 添加常用指标
        const commonMetrics = ['HGB', 'GLU', 'TC', 'TG', 'ALT', 'BP_S', 'BMI'];
        commonMetrics.forEach(id => metricsSet.add(id));
        
        allMetrics = Array.from(metricsSet);
        
        // 填充选择器
        const metricNames = {
            'WBC': '白细胞计数',
            'RBC': '红细胞计数',
            'HGB': '血红蛋白',
            'PLT': '血小板',
            'ALT': '谷丙转氨酶',
            'AST': '谷草转氨酶',
            'GLU': '空腹血糖',
            'TC': '总胆固醇',
            'TG': '甘油三酯',
            'HDL': '高密度脂蛋白',
            'LDL': '低密度脂蛋白',
            'CREA': '肌酐',
            'BUN': '尿素氮',
            'UA': '尿酸',
            'BP_S': '收缩压',
            'BP_D': '舒张压',
            'BMI': '体质指数'
        };
        
        allMetrics.forEach(id => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = metricNames[id] || id;
            selector.appendChild(option);
        });
    }
}

async function loadTrend() {
    const selector = document.getElementById('metricSelector');
    const metricId = selector.value;
    
    if (!metricId) {
        document.getElementById('trendChartContainer').innerHTML = `
            <div class="trend-placeholder">
                <p>📈 选择上方指标查看趋势变化</p>
            </div>
        `;
        document.getElementById('trendHistory').innerHTML = '';
        return;
    }
    
    showLoading(true);
    
    try {
        const result = await apiGet(`/api/trend/${metricId}?user_id=${CURRENT_USER}`);
        renderTrendChart(result);
    } catch (error) {
        console.error('加载趋势失败:', error);
        showToast('加载趋势失败');
    } finally {
        showLoading(false);
    }
}

function renderTrendChart(data) {
    const container = document.getElementById('trendChartContainer');
    const historyContainer = document.getElementById('trendHistory');
    
    if (!data.history || data.history.length === 0) {
        container.innerHTML = `
            <div class="trend-placeholder">
                <p>暂无历史数据</p>
            </div>
        `;
        return;
    }
    
    const metric = data.metric;
    const history = data.history;
    
    // 渲染趋势图
    container.innerHTML = `
        <div class="trend-chart">
            <canvas id="trendCanvas" class="chart-canvas"></canvas>
        </div>
    `;
    
    // 绘制图表
    setTimeout(() => drawTrendChart('trendCanvas', history, metric), 100);
    
    // 渲染历史记录
    historyContainer.innerHTML = history.map((item, index) => {
        let change = '';
        if (index > 0) {
            const diff = item.value - history[index - 1].value;
            if (Math.abs(diff) > 0.1) {
                change = diff > 0 ? 'up' : 'down';
            } else {
                change = 'stable';
            }
        }
        
        const date = new Date(item.date);
        const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
        
        return `
            <div class="trend-history-item">
                <div>
                    <div class="trend-date">${dateStr}</div>
                </div>
                <div class="trend-value">${item.value} ${metric.unit || ''}</div>
                ${change ? `<span class="trend-change ${change}">${diff > 0 ? '↑' : '↓'}${Math.abs(diff).toFixed(1)}</span>` : ''}
            </div>
        `;
    }).join('');
}

function drawTrendChart(canvasId, history, metric) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    
    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // 计算范围
    const values = history.map(h => h.value);
    const minVal = Math.min(...values, metric.ref_min);
    const maxVal = Math.max(...values, metric.ref_max);
    const range = maxVal - minVal || 1;
    const yMin = minVal - range * 0.1;
    const yMax = maxVal + range * 0.1;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制参考范围
    const refMinY = padding.top + chartHeight * (1 - (metric.ref_min - yMin) / (yMax - yMin));
    const refMaxY = padding.top + chartHeight * (1 - (metric.ref_max - yMin) / (yMax - yMin));
    ctx.fillStyle = 'rgba(0, 184, 148, 0.1)';
    ctx.fillRect(padding.left, refMaxY, chartWidth, refMinY - refMaxY);
    
    // 绘制网格线
    ctx.strokeStyle = '#E9ECEF';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
    }
    
    // 绘制Y轴标签
    ctx.fillStyle = '#B2BEC3';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const value = yMax - ((yMax - yMin) / 4) * i;
        const y = padding.top + (chartHeight / 4) * i;
        ctx.fillText(value.toFixed(1), padding.left - 5, y + 3);
    }
    
    // 绘制折线
    const stepX = chartWidth / Math.max(history.length - 1, 1);
    
    // 渐变填充
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(0, 184, 148, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 184, 148, 0)');
    
    ctx.beginPath();
    history.forEach((item, i) => {
        const x = padding.left + stepX * i;
        const y = padding.top + chartHeight * (1 - (item.value - yMin) / (yMax - yMin));
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    // 填充渐变
    const lastX = padding.left + stepX * (history.length - 1);
    ctx.lineTo(lastX, height - padding.bottom);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 绘制折线
    ctx.beginPath();
    history.forEach((item, i) => {
        const x = padding.left + stepX * i;
        const y = padding.top + chartHeight * (1 - (item.value - yMin) / (yMax - yMin));
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.strokeStyle = '#00B894';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 绘制数据点
    history.forEach((item, i) => {
        const x = padding.left + stepX * i;
        const y = padding.top + chartHeight * (1 - (item.value - yMin) / (yMax - yMin));
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = item.level === 'normal' ? '#00B894' : item.level === 'attention' ? '#FDCB6E' : '#E17055';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

// ==================== 会员中心 ====================

async function loadMemberStatus() {
    try {
        const result = await apiGet(`/api/member/status?user_id=${CURRENT_USER}`);
        memberStatus = result.member;
    } catch (error) {
        console.error('加载会员状态失败:', error);
        memberStatus = { is_active: false };
    }
}

function renderMemberPage() {
    const container = document.getElementById('memberStatus');
    const subscribeSection = document.getElementById('subscribeSection');
    
    if (memberStatus && memberStatus.is_active) {
        const expireDate = new Date(memberStatus.expire_date);
        const dateStr = `${expireDate.getFullYear()}年${expireDate.getMonth() + 1}月${expireDate.getDate()}日`;
        
        container.innerHTML = `
            <div class="member-status">
                <div class="member-avatar">👤</div>
                <div class="member-name">健康达人</div>
                <div class="member-expire">
                    会员有效期至<br>
                    <strong>${dateStr}</strong>
                </div>
            </div>
        `;
        
        subscribeSection.innerHTML = `
            <div style="text-align: center; padding: var(--space-lg); color: var(--text-secondary);">
                <p>您已是尊贵的会员</p>
                <p style="font-size: 12px; margin-top: var(--space-sm);">感谢您的支持，祝您健康！</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="member-status guest">
                <div class="member-avatar">👤</div>
                <div class="member-name">健康达人</div>
                <div class="member-expire">
                    开通会员解锁全部功能
                </div>
            </div>
        `;
        
        subscribeSection.innerHTML = `
            <button class="subscribe-btn guest" onclick="showSubscribe()">
                <span class="price">¥15</span>
                <span class="period">/月</span>
                <span class="btn-text">立即开通</span>
            </button>
        `;
    }
}

function showMember() {
    switchTab('member');
}

function showSubscribe() {
    showConfirm(
        '开通月卡会员',
        '确认开通体检管家月卡会员？\n\n• 费用：¥15/月\n• 支付后不支持退款\n• 会员权益即刻生效',
        async () => {
            showLoading(true);
            try {
                const result = await apiPost('/api/member/subscribe', {
                    user_id: CURRENT_USER,
                    plan: 'monthly'
                });
                
                if (result.success) {
                    memberStatus = {
                        is_active: true,
                        expire_date: result.expire_date,
                        plan: result.plan
                    };
                    renderMemberPage();
                    showToast('开通成功！');
                }
            } catch (error) {
                console.error('订阅失败:', error);
                showToast('订阅失败，请重试');
            } finally {
                showLoading(false);
            }
        }
    );
}

// ==================== 健康概览 ====================

function updateHealthOverview() {
    document.getElementById('reportCount').textContent = reportsCache.length;
    
    // 计算健康评分
    if (reportsCache.length > 0) {
        // 取最新报告的正常率作为健康评分
        const latestReport = reportsCache[0];
        const summary = latestReport.summary;
        const total = summary.normal + summary.attention + summary.abnormal + summary.severe;
        const score = total > 0 ? Math.round((summary.normal / total) * 100) : 0;
        document.getElementById('healthScore').textContent = score;
        
        // 上次体检日期
        const date = new Date(latestReport.check_date);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 7) {
            document.getElementById('lastCheck').textContent = '本周';
        } else if (diffDays < 30) {
            document.getElementById('lastCheck').textContent = diffDays + '天';
        } else {
            document.getElementById('lastCheck').textContent = Math.floor(diffDays / 30) + '月';
        }
    } else {
        document.getElementById('healthScore').textContent = '--';
        document.getElementById('lastCheck').textContent = '--';
    }
}

const tips = [
    '建议每年进行一次全面体检，及时发现健康隐患。',
    '保持规律作息，每晚7-8小时睡眠有助于身体恢复。',
    '每天饮用1500-2000ml水，促进新陈代谢。',
    '久坐办公时，每小时起身活动5-10分钟。',
    '均衡饮食，多吃蔬菜水果，少吃加工食品。',
    '适度运动，每周保持150分钟中等强度运动。',
    '体检前一天清淡饮食，避免剧烈运动。',
    '体检当天记得空腹8-12小时，适量饮水。'
];

function updateDailyTip() {
    const tip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('dailyTip').textContent = tip;
}

// ==================== UI辅助 ====================

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

let modalCallback = null;

function showConfirm(title, message, onConfirm) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('confirmModal').classList.add('active');
    modalCallback = onConfirm;
}

function closeModal() {
    document.getElementById('confirmModal').classList.remove('active');
    modalCallback = null;
}

function confirmModal() {
    if (modalCallback) {
        modalCallback();
    }
    closeModal();
}

// ==================== 工具函数 ====================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 格式化日期
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}
