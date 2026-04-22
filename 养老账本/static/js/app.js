/**
 * 养老账本 - JavaScript交互逻辑
 */

// 全局变量
let comparisonChart = null;
let trendChart = null;

// ============ 页面初始化 ============
document.addEventListener('DOMContentLoaded', function() {
    // 生成延迟退休表
    generateRetirementTable();
    
    // 加载养老社区数据
    loadCommunityData();
    
    // 加载长护险指南
    loadLongTermCareInfo();
    
    // 表单提交
    document.getElementById('pensionForm').addEventListener('submit', handleCalculate);
});

// ============ 表单处理 ============
async function handleCalculate(e) {
    e.preventDefault();
    
    const data = {
        birth_year: parseInt(document.getElementById('birthYear').value),
        birth_month: parseInt(document.getElementById('birthMonth').value),
        gender: document.getElementById('gender').value,
        current_age: parseInt(document.getElementById('currentAge').value),
        total_years: parseInt(document.getElementById('totalYears').value),
        personal账户年限: parseInt(document.getElementById('personalYears').value),
        monthly_salary: parseFloat(document.getElementById('monthlySalary').value),
        local_avg_salary: parseFloat(document.getElementById('localAvgSalary').value),
        current_savings: parseFloat(document.getElementById('currentSavings').value)
    };
    
    try {
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayResults(result.data);
        } else {
            alert('计算失败，请重试');
        }
    } catch (error) {
        console.error('计算请求失败:', error);
        alert('网络错误，请重试');
    }
}

function resetForm() {
    document.getElementById('pensionForm').reset();
    document.getElementById('resultSection').style.display = 'none';
    
    if (comparisonChart) {
        comparisonChart.destroy();
        comparisonChart = null;
    }
    if (trendChart) {
        trendChart.destroy();
        trendChart = null;
    }
}

// ============ 结果展示 ============
function displayResults(data) {
    const section = document.getElementById('resultSection');
    section.style.display = 'block';
    
    // 滚动到结果区
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // 更新养老金数据
    const pension = data.养老金详情;
    document.getElementById('totalPension').textContent = pension.预估月养老金.toLocaleString();
    document.getElementById('basePension').textContent = pension.基础养老金.toLocaleString() + ' 元';
    document.getElementById('personalPension').textContent = pension.个人账户养老金.toLocaleString() + ' 元';
    document.getElementById('transitionPension').textContent = pension.过渡性养老金.toLocaleString() + ' 元';
    
    // 更新退休信息
    const retirement = data.退休信息;
    document.getElementById('retirementAge').textContent = retirement.退休年龄.toFixed(1);
    document.getElementById('retirementDate').textContent = retirement.退休日期;
    
    // 更新储蓄规划
    const planning = data.储蓄规划;
    document.getElementById('timeToRetire').textContent = planning.距离退休;
    document.getElementById('targetSavings').textContent = planning.目标储备.toLocaleString();
    document.getElementById('currentAssets').textContent = planning.当前储备.toLocaleString();
    document.getElementById('monthlySave').textContent = planning.每月需储蓄.toLocaleString();
    
    // 渲染配置建议
    renderAllocation(planning.配置建议);
    
    // 渲染图表
    renderComparisonChart(data.对比数据);
    renderTrendChart(data.趋势预测);
}

// ============ 储蓄配置渲染 ============
function renderAllocation(suggestions) {
    const container = document.getElementById('allocationList');
    container.innerHTML = suggestions.map(item => `
        <div class="allocation-card">
            <div class="allocation-type">${item.类型}</div>
            <div class="allocation-amount">${item.建议金额.toLocaleString()}元/月</div>
            <div class="allocation-reason">${item.理由}</div>
        </div>
    `).join('');
}

// ============ 对比图 ============
function renderComparisonChart(data) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['机关退休', '企业退休', '农村基础', '您的预估'],
            datasets: [{
                label: '月养老金 (元)',
                data: [data.机关退休, data.企业退休, data.农村基础, data.您的预估],
                backgroundColor: [
                    'rgba(37, 99, 235, 0.5)',
                    'rgba(16, 185, 129, 0.5)',
                    'rgba(245, 158, 11, 0.5)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgb(37, 99, 235)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.raw.toLocaleString() + ' 元/月';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '金额 (元)'
                    }
                }
            }
        }
    });
}

// ============ 趋势图 ============
function renderTrendChart(data) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    if (trendChart) {
        trendChart.destroy();
    }
    
    const labels = data.map(d => d.年份 + '年');
    const values = data.map(d => d.养老金);
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '预估月养老金',
                data: values,
                borderColor: 'rgb(37, 99, 235)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return context.raw.toLocaleString() + ' 元/月';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: '养老金 (元)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '年份'
                    },
                    ticks: {
                        maxTicksLimit: 10
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// ============ 延迟退休表 ============
function generateRetirementTable() {
    const tbody = document.getElementById('retirementTableBody');
    const rows = [];
    
    for (let year = 1960; year <= 2005; year += 5) {
        const maleAge = calculateRetirementAge(year, '男');
        const femaleCadreAge = calculateRetirementAge(year, '女干部');
        const femaleWorkerAge = calculateRetirementAge(year, '女工人');
        
        rows.push(`
            <tr>
                <td>${year}年</td>
                <td>${maleAge.toFixed(1)}岁</td>
                <td>${femaleCadreAge.toFixed(1)}岁</td>
                <td>${femaleWorkerAge.toFixed(1)}岁</td>
            </tr>
        `);
    }
    
    tbody.innerHTML = rows.join('');
}

function calculateRetirementAge(birthYear, gender) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    
    let baseAge;
    if (gender === '男') baseAge = 60;
    else if (gender === '女干部') baseAge = 55;
    else baseAge = 50;
    
    // 渐进延迟
    const delayYears = Math.max(0, currentYear - 2025);
    const newAge = baseAge + Math.min(delayYears, 5);
    
    return Math.min(newAge, gender === '男' ? 65 : (gender === '女干部' ? 60 : 55));
}

// ============ 养老社区 ============
async function loadCommunityData() {
    const container = document.getElementById('communityList');
    
    try {
        const response = await fetch('/api/communities');
        const result = await response.json();
        
        if (result.success) {
            container.innerHTML = result.data.map(item => `
                <div class="community-card">
                    <div class="community-name">${item.名称}</div>
                    <span class="community-type">${item.类型}</span>
                    <div class="community-address">📍 ${item.地址}</div>
                    <div class="community-price">💰 ${item.月费}</div>
                    <div class="community-feature">✨ ${item.特色}</div>
                </div>
            `).join('');
        }
    } catch (error) {
        container.innerHTML = '<p>加载失败，请刷新重试</p>';
    }
}

// ============ 长护险指南 ============
async function loadLongTermCareInfo() {
    const container = document.getElementById('longtermContent');
    
    try {
        const response = await fetch('/api/long_term_care');
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            container.innerHTML = `
                <div class="longterm-intro">
                    <p>${data.简介}</p>
                </div>
                <div class="longterm-grid">
                    <div class="longterm-section">
                        <h4>📍 试点城市</h4>
                        <ul>
                            ${data.试点城市.map(city => `<li>${city}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="longterm-section">
                        <h4>📋 申请条件</h4>
                        <ul>
                            ${data.申请条件.map(cond => `<li>${cond}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="longterm-section">
                        <h4>💰 待遇标准</h4>
                        <ul>
                            <li>居家护理：${data.待遇标准.居家护理}</li>
                            <li>机构护理：${data.待遇标准.机构护理}</li>
                            <li>支付方式：${data.待遇标准.支付方式}</li>
                        </ul>
                    </div>
                    <div class="longterm-section">
                        <h4>📝 办理流程</h4>
                        <ul>
                            ${data.办理流程.map((step, i) => `<li>${i + 1}. ${step}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="info-box" style="margin-top: 24px;">
                    <p>💡 <strong>费用说明：</strong>${data.费用}</p>
                </div>
            `;
        }
    } catch (error) {
        container.innerHTML = '<p>加载失败，请刷新重试</p>';
    }
}

// ============ 订阅弹窗 ============
function subscribe() {
    document.getElementById('subscribeModal').classList.add('show');
}

function closeModal() {
    document.getElementById('subscribeModal').classList.remove('show');
}

// 点击弹窗外部关闭
document.addEventListener('click', function(e) {
    const modal = document.getElementById('subscribeModal');
    if (e.target === modal) {
        closeModal();
    }
});

// ============ 平滑滚动 ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// 更新导航高亮
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === '#' + current) {
            item.classList.add('active');
        }
    });
});
