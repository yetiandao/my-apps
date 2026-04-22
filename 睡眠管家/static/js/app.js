/**
 * 睡眠管家 APP - 前端交互逻辑
 */

// API基础路径
const API_BASE = '';

// 全局状态
let currentRating = 3;
let records = [];
let meditationData = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initDate();
    loadRecords();
    loadAnalysis();
    initRating();
});

// 初始化日期显示
function initDate() {
    const now = new Date();
    const options = { month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('zh-CN', options);
    
    // 设置默认时间
    const today = now.toISOString().split('T')[0];
    document.getElementById('bedTime').value = `${today}T22:00`;
    document.getElementById('wakeTime').value = `${new Date(now.getTime() + 86400000).toISOString().split('T')[0]}T07:00`;
}

// 评分初始化
function initRating() {
    const stars = document.querySelectorAll('#selfRating .star');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            currentRating = index + 1;
            updateStars();
        });
    });
    updateStars();
}

// 更新星星显示
function updateStars() {
    const stars = document.querySelectorAll('#selfRating .star');
    stars.forEach((star, index) => {
        star.textContent = index < currentRating ? '★' : '☆';
        star.classList.toggle('active', index < currentRating);
    });
}

// 加载睡眠记录
async function loadRecords() {
    try {
        const res = await fetch(`${API_BASE}/api/records`);
        const data = await res.json();
        if (data.success && data.records.length > 0) {
            records = data.records;
            updateTodayScore();
            updateStats();
        }
    } catch (err) {
        console.log('加载记录失败', err);
    }
}

// 更新今日评分显示
function updateTodayScore() {
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = records.find(r => r.bed_time.startsWith(today));
    
    if (todayRecord) {
        const score = todayRecord.score;
        document.getElementById('scoreValue').textContent = getScoreLabel(score);
        document.getElementById('scoreNumber').textContent = score;
        
        // 更新环形图
        const circle = document.getElementById('scoreCircle');
        const circumference = 283;
        const offset = circumference - (score / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        
        // 更新建议
        updateSuggestions(todayRecord.suggestions);
    } else {
        document.getElementById('scoreValue').textContent = '未记录';
        document.getElementById('scoreNumber').textContent = '--';
    }
}

// 获取评分标签
function getScoreLabel(score) {
    if (score >= 85) return '优秀 🌟';
    if (score >= 70) return '良好 👍';
    if (score >= 60) return '一般 ⚠️';
    return '较差 💤';
}

// 更新统计数据
function updateStats() {
    if (records.length === 0) return;
    
    // 计算平均睡眠时长
    const durations = records.map(r => {
        const bed = new Date(r.bed_time);
        const wake = new Date(r.wake_time);
        return (wake - bed) / 3600000;
    });
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    document.getElementById('avgDuration').textContent = `${avgDuration.toFixed(1)}h`;
    
    // 计算平均入睡时间
    const bedHours = records.map(r => {
        const bed = new Date(r.bed_time);
        return bed.getHours() + bed.getMinutes() / 60;
    });
    const avgBedHour = bedHours.reduce((a, b) => a + b, 0) / bedHours.length;
    document.getElementById('avgBedTime').textContent = `${String(Math.floor(avgBedHour)).padStart(2, '0')}:${String(Math.round((avgBedHour % 1) * 60)).padStart(2, '0')}`;
    
    // 记录天数
    document.getElementById('recordCount').textContent = records.length;
}

// 更新建议显示
function updateSuggestions(suggestions) {
    const list = document.getElementById('suggestionList');
    if (suggestions && suggestions.length > 0) {
        list.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
    }
}

// 加载分析数据
async function loadAnalysis() {
    try {
        const res = await fetch(`${API_BASE}/api/analyze`);
        const data = await res.json();
        if (data.success && data.analysis) {
            updateStatsFromAnalysis(data.analysis);
        }
    } catch (err) {
        console.log('加载分析失败', err);
    }
}

// 从分析更新统计
function updateStatsFromAnalysis(analysis) {
    document.getElementById('avgDuration').textContent = `${analysis.avg_duration}h`;
    document.getElementById('avgBedTime').textContent = analysis.avg_bed_time;
    document.getElementById('recordCount').textContent = analysis.record_count;
}

// 显示记录弹窗
function showRecordModal() {
    document.getElementById('recordModal').classList.add('active');
}

// 关闭弹窗
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// 提交记录
async function submitRecord() {
    const bedTime = document.getElementById('bedTime').value;
    const wakeTime = document.getElementById('wakeTime').value;
    const note = document.getElementById('note').value;
    
    if (!bedTime || !wakeTime) {
        showToast('请选择入睡和起床时间');
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/api/records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bed_time: bedTime,
                wake_time: wakeTime,
                self_rating: currentRating,
                note: note
            })
        });
        
        const data = await res.json();
        if (data.success) {
            showToast('记录成功！');
            closeModal('recordModal');
            
            // 重置表单
            currentRating = 3;
            updateStars();
            document.getElementById('note').value = '';
            
            // 重新加载数据
            await loadRecords();
            await loadAnalysis();
        } else {
            showToast('保存失败，请重试');
        }
    } catch (err) {
        showToast('网络错误，请重试');
    }
}

// 显示冥想弹窗
async function showMeditation() {
    try {
        const res = await fetch(`${API_BASE}/api/meditation`);
        const data = await res.json();
        if (data.success) {
            meditationData = data.meditations;
            renderMeditationList();
            document.getElementById('meditationModal').classList.add('active');
        }
    } catch (err) {
        console.log('加载冥想列表失败', err);
    }
}

// 渲染冥想列表
function renderMeditationList() {
    const list = document.getElementById('meditationList');
    const icons = ['🧘', '🌬️', '🙏', '🌧️', '🌊'];
    
    list.innerHTML = meditationData.map((m, i) => `
        <div class="meditation-item" onclick="playMeditation(${m.id})">
            <span class="meditation-icon">${icons[i] || '🎵'}</span>
            <div class="meditation-info">
                <div class="meditation-title">${m.title}</div>
                <div class="meditation-meta">${m.type} · ${m.duration}</div>
            </div>
            <div class="meditation-play">▶</div>
        </div>
    `).join('');
}

// 播放冥想
function playMeditation(id) {
    const meditation = meditationData.find(m => m.id === id);
    if (meditation) {
        showToast(`正在播放: ${meditation.title}`);
    }
}

// 显示分析弹窗
async function showAnalysis() {
    try {
        const res = await fetch(`${API_BASE}/api/analyze`);
        const data = await res.json();
        if (data.success && data.analysis) {
            renderAnalysis(data.analysis);
            document.getElementById('analysisModal').classList.add('active');
        } else {
            showToast('暂无足够数据进行分析');
        }
    } catch (err) {
        showToast('加载分析失败');
    }
}

// 渲染分析内容
function renderAnalysis(analysis) {
    const content = document.getElementById('analysisContent');
    content.innerHTML = `
        <div class="analysis-score">${analysis.avg_score}</div>
        <div class="analysis-label">本周平均分</div>
        <div class="analysis-stats">
            <div class="analysis-stat">
                <div class="analysis-stat-value">${analysis.avg_duration}h</div>
                <div class="analysis-stat-label">平均睡眠时长</div>
            </div>
            <div class="analysis-stat">
                <div class="analysis-stat-value">${analysis.avg_bed_time}</div>
                <div class="analysis-stat-label">平均入睡时间</div>
            </div>
            <div class="analysis-stat">
                <div class="analysis-stat-value">${analysis.record_count}</div>
                <div class="analysis-stat-label">记录天数</div>
            </div>
            <div class="analysis-stat">
                <div class="analysis-stat-value">${analysis.trend.split(' ')[0]}</div>
                <div class="analysis-stat-label">睡眠趋势</div>
            </div>
        </div>
        <div class="analysis-trend">${analysis.suggestions.join(' | ')}</div>
    `;
}

// 显示历史记录
async function showHistory() {
    if (records.length === 0) {
        showToast('暂无历史记录');
        return;
    }
    
    renderHistoryList();
    document.getElementById('historyModal').classList.add('active');
}

// 渲染历史记录
function renderHistoryList() {
    const list = document.getElementById('historyList');
    
    list.innerHTML = records.slice().reverse().slice(0, 20).map(r => {
        const bed = new Date(r.bed_time);
        const wake = new Date(r.wake_time);
        const duration = ((wake - bed) / 3600000).toFixed(1);
        const scoreClass = r.score >= 70 ? 'good' : r.score < 60 ? 'poor' : '';
        
        return `
            <div class="history-item">
                <div class="history-score ${scoreClass}">${r.score}</div>
                <div class="history-info">
                    <div class="history-date">${bed.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })}</div>
                    <div class="history-detail">${bed.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} → ${wake.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} · ${duration}小时</div>
                </div>
                <button class="history-delete" onclick="deleteRecord('${r.id}')">删</button>
            </div>
        `;
    }).join('');
}

// 删除记录
async function deleteRecord(id) {
    if (!confirm('确定删除这条记录？')) return;
    
    try {
        const res = await fetch(`${API_BASE}/api/records/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast('删除成功');
            await loadRecords();
            renderHistoryList();
        }
    } catch (err) {
        showToast('删除失败');
    }
}

// 显示报告弹窗
async function showReport() {
    await loadReport('weekly');
    document.getElementById('reportModal').classList.add('active');
}

// 切换报告标签
async function switchReportTab(period) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    await loadReport(period);
}

// 加载报告
async function loadReport(period) {
    const days = period === 'weekly' ? 7 : 30;
    
    try {
        const res = await fetch(`${API_BASE}/api/report?days=${days}`);
        const data = await res.json();
        if (data.success && data.report) {
            renderReport(data.report);
        } else {
            document.getElementById('reportContent').innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:40px;">暂无足够数据生成报告</p>';
        }
    } catch (err) {
        showToast('加载报告失败');
    }
}

// 渲染报告
function renderReport(report) {
    const content = document.getElementById('reportContent');
    content.innerHTML = `
        <div class="report-summary">
            <div class="report-avg-score">${report.avg_score}</div>
            <div class="report-avg-label">${report.period}平均分</div>
        </div>
        <div class="report-distribution">
            <div class="dist-item">
                <div class="dist-value" style="color:var(--success)">${report.score_distribution.excellent}</div>
                <div class="dist-label">优秀</div>
            </div>
            <div class="dist-item">
                <div class="dist-value" style="color:var(--primary-light)">${report.score_distribution.good}</div>
                <div class="dist-label">良好</div>
            </div>
            <div class="dist-item">
                <div class="dist-value" style="color:var(--warning)">${report.score_distribution.fair}</div>
                <div class="dist-label">一般</div>
            </div>
            <div class="dist-item">
                <div class="dist-value" style="color:var(--danger)">${report.score_distribution.poor}</div>
                <div class="dist-label">较差</div>
            </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
            <div style="background:var(--card-bg-light);padding:16px;border-radius:12px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:var(--primary-light)">${report.total_sleep_hours}h</div>
                <div style="font-size:12px;color:var(--text-secondary)">总睡眠时长</div>
            </div>
            <div style="background:var(--card-bg-light);padding:16px;border-radius:12px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:var(--primary-light)">${report.avg_duration}h</div>
                <div style="font-size:12px;color:var(--text-secondary)">平均时长</div>
            </div>
        </div>
        <div class="report-recommendations">
            <h4>📋 改善建议</h4>
            <ul style="list-style:none;">
                ${report.recommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>
        </div>
    `;
}

// 显示VIP弹窗
function showVipModal() {
    document.getElementById('vipModal').classList.add('active');
}

// 购买VIP
function purchaseVip() {
    showToast('支付功能开发中...');
    closeModal('vipModal');
}

// 切换标签页
function switchTab(tab) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // 根据tab显示不同内容
    switch(tab) {
        case 'meditation':
            showMeditation();
            break;
        case 'report':
            showReport();
            break;
        case 'history':
            showHistory();
            break;
    }
}

// 显示Toast提示
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// 点击弹窗背景关闭
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});
