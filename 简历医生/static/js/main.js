/**
 * 简历医生 - 主交互逻辑
 * AI智能简历优化诊断
 */

// 全局状态
const state = {
    resumeContent: '',
    diagnosisResult: null,
    optimizeResult: null,
    templates: [],
    currentTab: 'text',
    uploadedFile: null
};

// API基础URL
const API_BASE = '';

// ========================================
// 初始化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initFileUpload();
    initTemplateFilter();
    loadTemplates();
});

// ========================================
// 标签页切换
// ========================================
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tab) {
    state.currentTab = tab;
    
    // 更新按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // 更新内容显示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tab}-mode`);
    });
}

// ========================================
// 文件上传
// ========================================
function initFileUpload() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    
    // 点击上传
    dropZone.addEventListener('click', () => fileInput.click());
    
    // 文件选择
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });
    
    // 拖拽上传
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
}

function handleFile(file) {
    // 检查文件类型
    const allowedTypes = ['application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'image/png', 'image/jpeg', 'text/plain'];
    
    if (!allowedTypes.includes(file.type)) {
        showToast('不支持的文件格式，请上传PDF、Word、图片或文本文件');
        return;
    }
    
    // 检查文件大小（限制10MB）
    if (file.size > 10 * 1024 * 1024) {
        showToast('文件大小不能超过10MB');
        return;
    }
    
    state.uploadedFile = file;
    
    // 显示文件预览
    const preview = document.getElementById('file-preview');
    const fileName = preview.querySelector('.file-name');
    preview.classList.remove('hidden');
    fileName.textContent = `📄 ${file.name}`;
    
    // 读取文件内容
    const reader = new FileReader();
    
    if (file.type === 'text/plain') {
        reader.onload = (e) => {
            state.resumeContent = e.target.result;
        };
        reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
        // 图片文件，提示需要OCR识别（模拟）
        reader.onload = (e) => {
            state.resumeContent = `[图片文件: ${file.name}]\n\n注意：图片简历将进行智能文字识别分析`;
            showToast('图片文件已上传，将进行智能识别分析');
        };
        reader.readAsDataURL(file);
    } else {
        // Word/PDF文件，提示需要转换（模拟）
        state.resumeContent = `[文档文件: ${file.name}]\n\n文档内容正在解析中...`;
        showToast('文档文件已上传，正在解析内容');
    }
}

function removeFile() {
    state.uploadedFile = null;
    state.resumeContent = '';
    document.getElementById('file-preview').classList.add('hidden');
    document.getElementById('file-input').value = '';
}

// ========================================
// 简历诊断
// ========================================
async function analyzeResume() {
    // 获取简历内容
    if (state.currentTab === 'text') {
        state.resumeContent = document.getElementById('resume-text').value.trim();
    }
    
    if (!state.resumeContent) {
        showToast('请先输入或上传简历内容');
        return;
    }
    
    if (state.resumeContent.length < 20) {
        showToast('简历内容过少，请输入更完整的内容');
        return;
    }
    
    // 显示加载状态
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/api/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: state.resumeContent,
                type: state.currentTab
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            state.diagnosisResult = result.data;
            displayDiagnosisResult(result.data);
            scrollToSection('diagnosis-result');
        } else {
            showToast(result.message || '诊断失败，请重试');
        }
    } catch (error) {
        console.error('诊断请求失败:', error);
        // 模拟数据（用于演示）
        const mockResult = generateMockDiagnosis();
        state.diagnosisResult = mockResult;
        displayDiagnosisResult(mockResult);
        scrollToSection('diagnosis-result');
    } finally {
        showLoading(false);
    }
}

function displayDiagnosisResult(data) {
    const section = document.getElementById('diagnosis-result');
    section.classList.remove('hidden');
    
    // 动画显示总分
    animateScore(data.overall_score);
    
    // 显示等级
    document.getElementById('score-level').textContent = data.level;
    document.getElementById('hr-time').textContent = data.hr_read_time;
    
    // 显示分项评分
    const categories = data.categories;
    displayScoreBar('format', categories.format);
    displayScoreBar('content', categories.content);
    displayScoreBar('highlight', categories.highlight);
    displayScoreBar('ats', categories.ats);
    
    // 显示建议
    displaySuggestions(data.suggestions);
}

function animateScore(targetScore) {
    const scoreEl = document.getElementById('total-score');
    const progressEl = document.getElementById('score-progress');
    const circle = document.getElementById('score-circle');
    
    let current = 0;
    const duration = 1500;
    const start = performance.now();
    
    // 圆环周长
    const circumference = 2 * Math.PI * 54;
    
    function update(timestamp) {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // 缓动函数
        const easeOut = 1 - Math.pow(1 - progress, 3);
        current = Math.round(targetScore * easeOut);
        
        scoreEl.textContent = current;
        
        // 更新圆环
        const offset = circumference - (current / 100) * circumference;
        progressEl.style.strokeDashoffset = offset;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function displayScoreBar(category, data) {
    const scoreEl = document.getElementById(`${category}-score`);
    const barEl = document.getElementById(`${category}-bar`);
    const issuesEl = document.getElementById(`${category}-issues`);
    
    scoreEl.textContent = data.score;
    barEl.style.width = `${data.score}%`;
    issuesEl.textContent = data.issues.join('；');
}

function displaySuggestions(suggestions) {
    const container = document.getElementById('suggestions-list');
    container.innerHTML = '';
    
    suggestions.forEach(item => {
        const el = document.createElement('div');
        el.className = `suggestion-item ${item.priority}`;
        el.innerHTML = `
            <div class="suggestion-icon">${getSuggestionIcon(item.priority)}</div>
            <div class="suggestion-content">
                <h4>${item.title}</h4>
                <p>${item.content}</p>
            </div>
        `;
        container.appendChild(el);
    });
}

function getSuggestionIcon(priority) {
    switch(priority) {
        case 'high': return '🔴';
        case 'medium': return '🟡';
        case 'low': return '🟢';
        default: return '💡';
    }
}

function generateMockDiagnosis() {
    return {
        overall_score: 68,
        level: "一般",
        level_desc: "简历存在较多问题，建议优化",
        hr_read_time: 6,
        categories: {
            format: {
                name: "格式规范",
                score: 72,
                issues: ["内容过少，建议补充详细信息"]
            },
            content: {
                name: "内容质量",
                score: 65,
                issues: ["工作描述缺乏行动词，建议使用强动词开头", "缺少数据化成果展示"]
            },
            highlight: {
                name: "亮点突出",
                score: 58,
                issues: ["缺少年限经验描述", "缺少领导力相关描述"]
            },
            ats: {
                name: "ATS适配",
                score: 85,
                issues: ["ATS兼容性良好"]
            }
        },
        suggestions: [
            {
                priority: "high",
                title: "内容强化",
                content: "使用STAR法则描述工作经历，每条经历包含：背景(S)、任务(T)、行动(A)、结果(R)"
            },
            {
                priority: "medium",
                title: "亮点提炼",
                content: "在简历开头添加3-5个核心优势标签，用数据展示你的独特价值"
            },
            {
                priority: "medium",
                title: "ATS优化",
                content: "确保关键词与目标岗位JD匹配，使用标准术语，避免复杂排版"
            },
            {
                priority: "low",
                title: "细节检查",
                content: "提交前仔细检查错别字、标点符号、数字准确性"
            }
        ]
    };
}

// ========================================
// 简历优化
// ========================================
async function optimizeResume() {
    if (!state.resumeContent) {
        showToast('请先进行简历诊断或输入简历内容');
        return;
    }
    
    const position = document.getElementById('target-position').value.trim();
    const industry = document.getElementById('target-industry').value;
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/api/optimize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: state.resumeContent,
                position: position,
                industry: industry
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            state.optimizeResult = result.data;
            displayOptimizeResult(result.data);
        } else {
            showToast(result.message || '优化失败，请重试');
        }
    } catch (error) {
        console.error('优化请求失败:', error);
        // 使用模拟数据
        const mockResult = generateMockOptimizeResult();
        state.optimizeResult = mockResult;
        displayOptimizeResult(mockResult);
    } finally {
        showLoading(false);
    }
}

function displayOptimizeResult(data) {
    const section = document.getElementById('optimize-result');
    section.classList.remove('hidden');
    
    // 显示对比
    document.getElementById('before-score').textContent = data.before_after_score.before;
    document.getElementById('after-content').textContent = data.optimized;
    
    // 显示优化前内容（截取前500字符）
    const originalPreview = state.resumeContent.substring(0, 500);
    document.getElementById('before-content').textContent = 
        state.resumeContent.length > 500 ? originalPreview + '...' : state.resumeContent;
    
    // 显示亮点
    const highlightsList = document.getElementById('optimize-highlights-list');
    highlightsList.innerHTML = '';
    data.highlights.forEach(highlight => {
        const li = document.createElement('li');
        li.textContent = highlight;
        highlightsList.appendChild(li);
    });
    
    scrollToSection('optimize-result');
}

function generateMockOptimizeResult() {
    return {
        original: state.resumeContent,
        optimized: `【优化版简历】

姓名：张三
电话：138-xxxx-xxxx
邮箱：zhangsan@email.com

求职意向：产品经理

教育背景：
xx大学 | 计算机专业 | 本科 | 2016-2020
• GPA 3.8/4.0，连续3年获得校级奖学金
• 担任学生会科技部部长，组织超过500人参与的技术活动

工作经历：
xxx公司 | 产品经理 | 2020.06-至今
• 全面负责产品规划与设计，主导产品迭代升级
• 通过用户调研和数据分析，优化核心功能流程
• 带领5人团队独立完成10+重点项目交付
• 推动产品日活提升40%，用户满意度提升25%

xxx公司 | 产品专员 | 2018.07-2020.05
• 深度参与产品需求分析与功能设计
• 协调研发、设计团队高效协作，确保项目按时上线
• 独立负责3个核心模块的设计与优化

项目经验：
xx电商平台 | 产品负责人 | 2019-2020
• 从0到1搭建电商小程序，累计用户突破50万
• 优化商品详情页转化率，提升35%的下单转化

技能特长：
• 产品：需求分析、原型设计、数据分析、用户研究
• 工具：Axure、XMind、SQL、Python基础
• 语言：英语CET-6

自我评价：
具备扎实的互联网产品思维和数据分析能力，擅长从用户需求出发驱动产品优化。有丰富的跨部门协作经验，能够有效推动项目落地，实现业务目标。`,
        highlights: [
            "内容更加充实完整",
            "添加了量化数据指标（提升XX%）",
            "使用强动词增强表达（全面负责、主导）",
            "突出核心成就与贡献",
            "关键词优化，提升ATS通过率"
        ],
        before_after_score: {
            before: 65,
            after: 88
        }
    };
}

function copyOptimized() {
    if (!state.optimizeResult) {
        showToast('请先进行简历优化');
        return;
    }
    
    const text = state.optimizeResult.optimized;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('简历内容已复制到剪贴板');
    }).catch(() => {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('简历内容已复制到剪贴板');
    });
}

function downloadOptimized() {
    if (!state.optimizeResult) {
        showToast('请先进行简历优化');
        return;
    }
    
    const text = state.optimizeResult.optimized;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '优化后简历.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('简历已下载');
}

// ========================================
// 模板管理
// ========================================
async function loadTemplates() {
    try {
        const response = await fetch(`${API_BASE}/api/templates`);
        const result = await response.json();
        
        if (result.success) {
            state.templates = result.data;
            renderTemplates(result.data);
        }
    } catch (error) {
        console.error('加载模板失败:', error);
        // 使用默认模板
        state.templates = getDefaultTemplates();
        renderTemplates(state.templates);
    }
}

function getDefaultTemplates() {
    return [
        {id: 1, name: "简约专业", style: "modern", color: "#2563eb"},
        {id: 2, name: "经典商务", style: "classic", color: "#1e40af"},
        {id: 3, name: "创意设计", style: "creative", color: "#7c3aed"},
        {id: 4, name: "技术专家", style: "tech", color: "#059669"},
        {id: 5, name: "金融精英", style: "finance", color: "#b45309"},
        {id: 6, name: "学术规范", style: "academic", color: "#374151"},
        {id: 7, name: "互联网风格", style: "internet", color: "#dc2626"},
        {id: 8, name: "清新淡雅", style: "fresh", color: "#0891b2"},
        {id: 9, name: "高端定制", style: "premium", color: "#1f2937"},
        {id: 10, name: "应届生版", style: "freshgraduate", color: "#4f46e5"}
    ];
}

function renderTemplates(templates) {
    const grid = document.getElementById('templates-grid');
    grid.innerHTML = '';
    
    templates.forEach(template => {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.dataset.style = template.style;
        card.innerHTML = `
            <div class="template-preview" style="background: linear-gradient(135deg, ${template.color}20, ${template.color}40)">
                <span style="color: ${template.color}">📄</span>
                <div class="template-overlay">
                    <button class="btn btn-primary">应用此模板</button>
                </div>
            </div>
            <div class="template-info">
                <h4>${template.name}</h4>
                <span>点击预览</span>
            </div>
        `;
        card.addEventListener('click', () => applyTemplate(template));
        grid.appendChild(card);
    });
}

function initTemplateFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            filterTemplates(filter);
        });
    });
}

function filterTemplates(filter) {
    const cards = document.querySelectorAll('.template-card');
    
    cards.forEach(card => {
        if (filter === 'all' || card.dataset.style === filter) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

function applyTemplate(template) {
    showToast(`已选择「${template.name}」模板`);
    // 滚动到优化结果区域
    scrollToSection('optimize-result');
}

function chooseTemplate() {
    scrollToSection('templates');
}

// ========================================
// 导航与滚动
// ========================================
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
        const offset = 80;
        const top = section.offsetTop - offset;
        window.scrollTo({
            top: top,
            behavior: 'smooth'
        });
    }
}

// 平滑滚动到锚点
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ========================================
// 认证弹窗
// ========================================
function showLogin() {
    document.getElementById('login-modal').classList.remove('hidden');
}

function showRegister() {
    document.getElementById('register-modal').classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function switchModal(fromId, toId) {
    document.getElementById(fromId).classList.add('hidden');
    document.getElementById(toId).classList.remove('hidden');
}

function handleLogin(e) {
    e.preventDefault();
    showToast('登录成功');
    closeModal('login-modal');
    return false;
}

function handleRegister(e) {
    e.preventDefault();
    showToast('注册成功');
    closeModal('register-modal');
    return false;
}

// 点击遮罩关闭弹窗
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});

// ========================================
// 导出报告
// ========================================
function downloadReport() {
    if (!state.diagnosisResult) {
        showToast('请先进行简历诊断');
        return;
    }
    
    const data = state.diagnosisResult;
    const report = `
简历诊断报告
========================================
生成时间：${new Date().toLocaleString()}

综合评分：${data.overall_score} 分
评价等级：${data.level}

----------------------------------------
分项评分
----------------------------------------
1. 格式规范：${data.categories.format.score}分
   ${data.categories.format.issues.join('；')}

2. 内容质量：${data.categories.content.score}分
   ${data.categories.content.issues.join('；')}

3. 亮点突出：${data.categories.highlight.score}分
   ${data.categories.highlight.issues.join('；')}

4. ATS适配：${data.categories.ats.score}分
   ${data.categories.ats.issues.join('；')}

----------------------------------------
优化建议
----------------------------------------
${data.suggestions.map((s, i) => `${i + 1}. [${s.priority.toUpperCase()}] ${s.title}\n   ${s.content}`).join('\n\n')}

========================================
报告由「简历医生」AI智能生成
`;
    
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `简历诊断报告_${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('诊断报告已下载');
}

// ========================================
// 页面跳转
// ========================================
function goToOptimize() {
    scrollToSection('optimize');
}

// ========================================
// Toast提示
// ========================================
function showToast(message) {
    const toast = document.getElementById('toast');
    const messageEl = document.getElementById('toast-message');
    
    messageEl.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ========================================
// Loading状态
// ========================================
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

// ========================================
// 快捷键
// ========================================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter 快速诊断
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (state.currentTab === 'text') {
            analyzeResume();
        }
    }
    
    // Escape 关闭弹窗
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
            modal.classList.add('hidden');
        });
    }
});
