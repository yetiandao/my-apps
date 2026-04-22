/**
 * 「陪陪诊」陪诊师预约平台 - 前端逻辑
 */

// API基础路径（静态文件模式下使用本地数据）
const API_BASE = '';

// 模拟数据
const MOCK_STATS = {
    total_escorts: 8,
    available_escorts: 7,
    total_orders: 5,
    completed_orders: 3,
    total_revenue: 224.5,
    avg_rating: 4.8
};

// 陪诊师模拟数据
const MOCK_ESCORTS = [
    {
        id: "ESC001",
        name: "李婷婷",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
        gender: "女",
        age: 35,
        experience_years: 5,
        service_count: 856,
        rating: 4.9,
        review_count: 342,
        intro: "三甲医院5年陪诊经验，持有医疗陪诊顾问证书，擅长老年患者陪诊，曾帮助超过800位老人顺利完成就医。耐心细致，善于沟通，是您可信赖的临时家人。",
        skills: ["老年陪诊", "慢病管理", "心理疏导"],
        certificates: [
            {name: "医疗陪诊顾问证书", issuer: "人力资源和社会保障部", year: 2022},
            {name: "急救技能证书", issuer: "红十字会", year: 2023}
        ],
        hospitals: ["北京大学第一医院", "北京协和医院", "中国人民解放军总医院"],
        price_half_day: 220,
        price_full_day: 400,
        is_available: true,
        is_verified: true,
        tags: ["金牌陪诊师", "人气TOP", "5年经验"],
        reviews: [
            {user_name: "王先生", rating: 5, content: "李姐非常专业，提前帮我们规划好了就诊路线，全程不用我们操心，妈妈说比闺女还贴心！", date: "2024-12-15", service_type: "半天陪诊"},
            {user_name: "张阿姨", rating: 5, content: "腿脚不方便，李姐全程推着轮椅，还帮我跟医生沟通病情，非常耐心。", date: "2024-12-10", service_type: "全天陪诊"}
        ]
    },
    {
        id: "ESC002",
        name: "王建国",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
        gender: "男",
        age: 42,
        experience_years: 8,
        service_count: 1203,
        rating: 4.8,
        review_count: 486,
        intro: "曾在医院导诊台工作8年，熟悉北京各大三甲医院就诊流程。擅长异地就医规划和复杂病例陪诊。",
        skills: ["异地就医", "复杂病例", "手术陪同"],
        certificates: [
            {name: "健康管理师证书", issuer: "国家卫健委", year: 2021}
        ],
        hospitals: ["北京天坛医院", "北京肿瘤医院", "中日友好医院"],
        price_half_day: 240,
        price_full_day: 420,
        is_available: true,
        is_verified: true,
        tags: ["资深陪诊师", "医院背景", "8年经验"],
        reviews: [
            {user_name: "刘女士", rating: 5, content: "王师傅对医院流程非常熟悉，帮我们节省了很多时间。", date: "2024-12-18", service_type: "全天陪诊"}
        ]
    },
    {
        id: "ESC003",
        name: "张晓燕",
        avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&h=200&fit=crop",
        gender: "女",
        age: 29,
        experience_years: 3,
        service_count: 428,
        rating: 4.9,
        review_count: 198,
        intro: "护理专业毕业，曾在儿科工作3年。特别擅长孕产妇和儿童陪诊，服务细致温柔。",
        skills: ["孕产陪诊", "儿科陪诊", "健康咨询"],
        certificates: [
            {name: "护士执业资格证", issuer: "国家卫健委", year: 2020}
        ],
        hospitals: ["北京妇产医院", "北京儿童医院", "北京大学第三医院"],
        price_half_day: 200,
        price_full_day: 380,
        is_available: true,
        is_verified: true,
        tags: ["专业护士", "孕产专家", "温柔细致"],
        reviews: []
    },
    {
        id: "ESC004",
        name: "赵明华",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
        gender: "男",
        age: 38,
        experience_years: 6,
        service_count: 756,
        rating: 4.7,
        review_count: 289,
        intro: "退役军人，做事雷厉风行。6年陪诊经验，擅长急诊陪诊和应急处理。",
        skills: ["急诊陪诊", "应急处理", "VIP服务"],
        certificates: [
            {name: "AHA急救证书", issuer: "美国心脏协会", year: 2023}
        ],
        hospitals: ["北京朝阳医院", "北京安贞医院", "北京阜外医院"],
        price_half_day: 260,
        price_full_day: 450,
        is_available: true,
        is_verified: true,
        tags: ["退役军人", "急救认证", "应急专家"],
        reviews: []
    },
    {
        id: "ESC005",
        name: "孙丽华",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop",
        gender: "女",
        age: 50,
        experience_years: 10,
        service_count: 1589,
        rating: 4.9,
        review_count: 623,
        intro: "行业元老级陪诊师，培训过上百名新陪诊师。擅长各类人群陪诊。",
        skills: ["认知症陪诊", "综合陪诊", "培训指导"],
        certificates: [
            {name: "高级陪诊师证书", issuer: "中国陪诊行业协会", year: 2019}
        ],
        hospitals: ["北京协和医院", "北京医院", "北京宣武医院"],
        price_half_day: 280,
        price_full_day: 480,
        is_available: false,
        is_verified: true,
        tags: ["10年资深", "行业导师", "认知症专家"],
        reviews: []
    },
    {
        id: "ESC006",
        name: "刘洋",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
        gender: "男",
        age: 31,
        experience_years: 4,
        service_count: 512,
        rating: 4.8,
        review_count: 234,
        intro: "医学院毕业生，医学知识扎实。擅长用通俗语言向患者解释病情。",
        skills: ["医患沟通", "病情解释", "检查陪同"],
        certificates: [
            {name: "健康管理师证书", issuer: "国家卫健委", year: 2021}
        ],
        hospitals: ["北京大学第一医院", "北京大学人民医院"],
        price_half_day: 230,
        price_full_day: 410,
        is_available: true,
        is_verified: true,
        tags: ["医学背景", "沟通专家", "年轻活力"],
        reviews: []
    },
    {
        id: "ESC007",
        name: "马桂芳",
        avatar: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=200&h=200&fit=crop",
        gender: "女",
        age: 50,
        experience_years: 7,
        service_count: 982,
        rating: 4.6,
        review_count: 412,
        intro: "退休护士长，护理经验30年。转行陪诊师后，用专业护理知识服务患者。",
        skills: ["术后康复", "慢病管理", "用药指导"],
        certificates: [
            {name: "护士长资格证书", issuer: "北京市卫健委", year: 2015}
        ],
        hospitals: ["北京协和医院", "北京大学第三医院"],
        price_half_day: 250,
        price_full_day: 440,
        is_available: true,
        is_verified: true,
        tags: ["退休护士长", "30年经验", "术后康复"],
        reviews: []
    },
    {
        id: "ESC008",
        name: "陈伟",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop",
        gender: "男",
        age: 33,
        experience_years: 5,
        service_count: 687,
        rating: 4.8,
        review_count: 278,
        intro: "阳光开朗的90后陪诊师，打破人们对陪诊师的传统印象。",
        skills: ["青年陪诊", "胃肠镜陪同", "手术签字"],
        certificates: [
            {name: "急救技能证书", issuer: "北京市急救中心", year: 2023}
        ],
        hospitals: ["北京友谊医院", "北京朝阳医院"],
        price_half_day: 200,
        price_full_day: 360,
        is_available: true,
        is_verified: true,
        tags: ["90后陪诊师", "年轻活力", "高性价比"],
        reviews: []
    }
];

// 订单模拟数据
const MOCK_ORDERS = [
    {
        id: "ORD202412200001",
        escort_id: "ESC001",
        escort_name: "李婷婷",
        user_name: "王先生",
        patient_name: "王建国",
        patient_age: 72,
        patient_gender: "男",
        hospital: "北京大学第一医院",
        department: "心内科",
        service_type: "full_day",
        service_type_name: "全天陪诊",
        appointment_date: "2024-12-25",
        appointment_time: "08:00",
        total_amount: 400,
        platform_fee: 60,
        escort_income: 340,
        status: "pending",
        status_name: "待服务",
        create_time: "2024-12-20 10:30:00",
        remark: "老人腿脚不便，需要轮椅"
    },
    {
        id: "ORD202412190002",
        escort_id: "ESC003",
        escort_name: "张晓燕",
        user_name: "李女士",
        patient_name: "李女士（本人）",
        patient_age: 28,
        patient_gender: "女",
        hospital: "北京妇产医院",
        department: "产科",
        service_type: "half_day",
        service_type_name: "半天陪诊",
        appointment_date: "2024-12-22",
        appointment_time: "08:30",
        total_amount: 200,
        platform_fee: 30,
        escort_income: 170,
        status: "confirmed",
        status_name: "已确认",
        create_time: "2024-12-19 14:20:00",
        remark: "孕8个月产检"
    },
    {
        id: "ORD202412180003",
        escort_id: "ESC002",
        escort_name: "王建国",
        user_name: "刘先生",
        patient_name: "刘先生（本人）",
        patient_age: 35,
        patient_gender: "男",
        hospital: "北京天坛医院",
        department: "神经外科",
        service_type: "full_day",
        service_type_name: "全天陪诊",
        appointment_date: "2024-12-20",
        appointment_time: "07:00",
        total_amount: 420,
        platform_fee: 63,
        escort_income: 357,
        status: "completed",
        status_name: "已完成",
        create_time: "2024-12-18 09:15:00",
        completed_time: "2024-12-20 18:30:00"
    },
    {
        id: "ORD202412150004",
        escort_id: "ESC006",
        escort_name: "刘洋",
        user_name: "王先生",
        patient_name: "王建国",
        patient_age: 72,
        patient_gender: "男",
        hospital: "北京协和医院",
        department: "消化内科",
        service_type: "half_day",
        service_type_name: "半天陪诊",
        appointment_date: "2024-12-18",
        appointment_time: "09:00",
        total_amount: 230,
        platform_fee: 34.5,
        escort_income: 195.5,
        status: "completed",
        status_name: "已完成",
        create_time: "2024-12-15 16:45:00",
        completed_time: "2024-12-18 13:00:00",
        rating: 5,
        review: "刘医生帮我整理了检查报告，讲解得很清楚，非常专业！"
    },
    {
        id: "ORD202412120005",
        escort_id: "ESC004",
        escort_name: "赵明华",
        user_name: "陈先生",
        patient_name: "陈老爷子",
        patient_age: 85,
        patient_gender: "男",
        hospital: "北京朝阳医院",
        department: "急诊科",
        service_type: "full_day",
        service_type_name: "全天陪诊",
        appointment_date: "2024-12-12",
        appointment_time: "06:00",
        total_amount: 450,
        platform_fee: 67.5,
        escort_income: 382.5,
        status: "completed",
        status_name: "已完成",
        create_time: "2024-12-11 22:30:00",
        completed_time: "2024-12-12 20:00:00"
    }
];

// 全局状态
let currentPage = 'home';
let currentEscort = null;
let currentOrder = null;
let escortsData = [];
let ordersData = [];
let bookingStep = 1;
let bookingData = {
    escort_id: '',
    service_type: 'half_day',
    hospital: '',
    department: '',
    appointment_date: '',
    appointment_time: '',
    patient_name: '',
    patient_age: '',
    patient_gender: '男',
    user_name: '',
    user_phone: '',
    remark: ''
};

// ==================== 页面导航 ====================

function navigateTo(page, params = {}) {
    currentPage = page;
    const mainContent = document.getElementById('main-content');
    
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // 渲染页面
    switch (page) {
        case 'home':
            renderHomePage(mainContent);
            break;
        case 'list':
            renderListPage(mainContent);
            break;
        case 'detail':
            renderDetailPage(mainContent, params.escortId);
            break;
        case 'orders':
            renderOrdersPage(mainContent);
            break;
        case 'safety':
            renderSafetyPage(mainContent);
            break;
        default:
            renderHomePage(mainContent);
    }
}

// ==================== 首页 ====================

async function renderHomePage(container) {
    // 获取统计数据（使用模拟数据）
    let stats = MOCK_STATS;
    
    // 获取陪诊师数据（使用模拟数据）
    escortsData = MOCK_ESCORTS.slice(0, 4); // 只显示前4个
    
    container.innerHTML = `
        <!-- 统计数据 -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">👨‍⚕️</div>
                <div class="stat-value">${stats.total_escorts}</div>
                <div class="stat-label">注册陪诊师</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-value">${stats.available_escorts}</div>
                <div class="stat-label">可立即预约</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📋</div>
                <div class="stat-value">${stats.completed_orders}</div>
                <div class="stat-label">已完成订单</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-value">${stats.avg_rating}</div>
                <div class="stat-label">平均评分</div>
            </div>
        </div>
        
        <!-- 服务入口 -->
        <div class="service-entry">
            <h2>🏥 让就医不再孤单</h2>
            <p>专业陪诊师全程陪伴，让您和家人安心就医</p>
            <div class="service-buttons">
                <button class="btn-service" onclick="navigateTo('list')">
                    <span>🔍</span> 立即预约陪诊师
                </button>
                <button class="btn-service" onclick="navigateTo('orders')" style="background: rgba(255,255,255,0.2); color: white;">
                    <span>📋</span> 查看我的订单
                </button>
            </div>
        </div>
        
        <!-- 热门陪诊师 -->
        <div class="page-header">
            <h2 class="page-title">🌟 热门陪诊师</h2>
            <p class="page-subtitle">经过严格认证的专业陪诊师，为您提供贴心服务</p>
        </div>
        
        <div class="escort-grid">
            ${escortsData.map(escort => renderEscortCard(escort)).join('')}
        </div>
        
        <div class="text-center mt-16">
            <button class="btn-book" onclick="navigateTo('list')" style="padding: 12px 32px;">
                查看全部陪诊师 →
            </button>
        </div>
    `;
}

// ==================== 陪诊师列表页 ====================

async function renderListPage(container) {
    // 获取筛选参数
    const urlParams = new URLSearchParams(window.location.search);
    const availableOnly = urlParams.get('available') === 'true';
    const sortBy = urlParams.get('sort') || 'rating';
    
    // 获取陪诊师数据（使用模拟数据）
    let sortedEscorts = [...MOCK_ESCORTS];
    if (availableOnly) {
        sortedEscorts = sortedEscorts.filter(e => e.is_available);
    }
    if (sortBy === 'price_low') {
        sortedEscorts.sort((a, b) => a.price_half_day - b.price_half_day);
    } else if (sortBy === 'price_high') {
        sortedEscorts.sort((a, b) => b.price_half_day - a.price_half_day);
    } else if (sortBy === 'service_count') {
        sortedEscorts.sort((a, b) => b.service_count - a.service_count);
    } else {
        sortedEscorts.sort((a, b) => b.rating - a.rating);
    }
    escortsData = sortedEscorts;
    
    container.innerHTML = `
        <div class="page-header">
            <h2 class="page-title">👨‍⚕️ 陪诊师列表</h2>
            <p class="page-subtitle">选择您信任的陪诊师，开启温暖就医之旅</p>
        </div>
        
        <!-- 筛选栏 -->
        <div class="filter-bar">
            <div class="filter-left">
                <span class="filter-label">筛选：</span>
                <label class="checkbox-custom">
                    <input type="checkbox" id="filter-available" ${availableOnly ? 'checked' : ''} onchange="handleFilterChange()">
                    <span>仅看可预约</span>
                </label>
            </div>
            <div class="filter-right">
                <span class="filter-label">排序：</span>
                <select class="select-custom" id="filter-sort" onchange="handleSortChange()">
                    <option value="rating" ${sortBy === 'rating' ? 'selected' : ''}>综合排序</option>
                    <option value="price_low" ${sortBy === 'price_low' ? 'selected' : ''}>价格从低到高</option>
                    <option value="price_high" ${sortBy === 'price_high' ? 'selected' : ''}>价格从高到低</option>
                    <option value="service_count" ${sortBy === 'service_count' ? 'selected' : ''}>服务最多</option>
                </select>
            </div>
        </div>
        
        <!-- 陪诊师列表 -->
        <div class="escort-grid">
            ${escortsData.length > 0 ? 
                escortsData.map(escort => renderEscortCard(escort)).join('') :
                '<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">暂无陪诊师</div></div>'
            }
        </div>
    `;
}

function handleFilterChange() {
    const available = document.getElementById('filter-available').checked;
    const sort = document.getElementById('filter-sort').value;
    window.location.href = `${window.location.pathname}?page=list&available=${available}&sort=${sort}`;
    navigateTo('list');
}

function handleSortChange() {
    const available = document.getElementById('filter-available').checked;
    const sort = document.getElementById('filter-sort').value;
    window.location.href = `${window.location.pathname}?page=list&available=${available}&sort=${sort}`;
    navigateTo('list');
}

// ==================== 陪诊师详情页 ====================

async function renderDetailPage(container, escortId) {
    // 获取陪诊师详情（使用模拟数据）
    currentEscort = MOCK_ESCORTS.find(e => e.id === escortId);
    
    if (!currentEscort) {
        container.innerHTML = '<div class="loading">加载中...</div>';
        return;
    }
    
    const escort = currentEscort;
    
    container.innerHTML = `
        <div style="margin-bottom: 20px;">
            <button class="btn-action btn-action-secondary" onclick="navigateTo('list')" style="border-radius: var(--radius-full);">
                ← 返回列表
            </button>
        </div>
        
        <div class="escort-detail">
            <!-- 侧边栏 -->
            <div class="escort-profile">
                <div class="profile-card">
                    <div class="profile-header">
                        <img src="${escort.avatar}" alt="${escort.name}" class="profile-avatar">
                        <div class="profile-name">${escort.name}</div>
                        <div class="profile-meta">${escort.gender} | ${escort.age}岁 | 从业${escort.experience_years}年</div>
                    </div>
                    <div class="profile-body">
                        <div class="profile-rating">
                            <span class="rating-stars">${'★'.repeat(Math.floor(escort.rating))}</span>
                            <span class="profile-rating-value">${escort.rating}</span>
                            <span class="profile-rating-count">(${escort.review_count}条评价)</span>
                        </div>
                        
                        <div class="profile-stats">
                            <div class="profile-stat">
                                <div class="profile-stat-value">${escort.service_count}</div>
                                <div class="profile-stat-label">服务次数</div>
                            </div>
                            <div class="profile-stat">
                                <div class="profile-stat-value">${escort.experience_years}年</div>
                                <div class="profile-stat-label">从业经验</div>
                            </div>
                            <div class="profile-stat">
                                <div class="profile-stat-value">${escort.hospitals.length}</div>
                                <div class="profile-stat-label">服务医院</div>
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <div class="profile-section-title">📝 个人简介</div>
                            <div class="profile-intro">${escort.intro}</div>
                        </div>
                        
                        <div class="profile-section">
                            <div class="profile-section-title">🎯 擅长领域</div>
                            <div class="escort-skills">
                                ${escort.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <div class="profile-section-title">📜 资质证书</div>
                            <div class="profile-certificates">
                                ${escort.certificates.map(c => `
                                    <div class="certificate-item">
                                        <span class="certificate-icon">🏅</span>
                                        <div class="certificate-info">
                                            <div class="certificate-name">${c.name}</div>
                                            <div class="certificate-issuer">${c.issuer} · ${c.year}年</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="profile-price">
                            <div class="price-item">
                                <div class="price-value">¥${escort.price_half_day}</div>
                                <div class="price-label">半天(4小时)</div>
                            </div>
                            <div class="price-item">
                                <div class="price-value">¥${escort.price_full_day}</div>
                                <div class="price-label">全天(8小时)</div>
                            </div>
                        </div>
                        
                        <div class="profile-action">
                            <button class="btn-booking" style="width: 100%;" onclick="openBookingModal('${escort.id}')" ${!escort.is_available ? 'disabled' : ''}>
                                ${escort.is_available ? '立即预约' : '暂不可预约'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 内容区域 -->
            <div class="escort-content">
                <!-- 服务内容 -->
                <div class="content-section">
                    <div class="section-title">📋 服务内容</div>
                    <div class="service-list">
                        <div class="service-item">
                            <span class="service-icon">📋</span>
                            <span class="service-name">挂号协助</span>
                        </div>
                        <div class="service-item">
                            <span class="service-icon">🧭</span>
                            <span class="service-name">就医引导</span>
                        </div>
                        <div class="service-item">
                            <span class="service-icon">⏳</span>
                            <span class="service-name">排队代办</span>
                        </div>
                        <div class="service-item">
                            <span class="service-icon">📄</span>
                            <span class="service-name">取报告</span>
                        </div>
                        <div class="service-item">
                            <span class="service-icon">💊</span>
                            <span class="service-name">取药协助</span>
                        </div>
                        <div class="service-item">
                            <span class="service-icon">💬</span>
                            <span class="service-name">医嘱沟通</span>
                        </div>
                        <div class="service-item">
                            <span class="service-icon">♿</span>
                            <span class="service-name">轮椅协助</span>
                        </div>
                        <div class="service-item">
                            <span class="service-icon">❤️</span>
                            <span class="service-name">心理支持</span>
                        </div>
                    </div>
                </div>
                
                <!-- 服务医院 -->
                <div class="content-section">
                    <div class="section-title">🏥 服务医院</div>
                    <div class="escort-skills">
                        ${escort.hospitals.map(h => `<span class="skill-tag" style="padding: 8px 16px;">${h}</span>`).join('')}
                    </div>
                </div>
                
                <!-- 服务评价 -->
                <div class="content-section">
                    <div class="section-title">⭐ 用户评价</div>
                    <div class="review-list">
                        ${escort.reviews && escort.reviews.length > 0 ? 
                            escort.reviews.map(r => `
                                <div class="review-item">
                                    <div class="review-header">
                                        <span class="review-user">${r.user_name}</span>
                                        <span class="review-rating">${'★'.repeat(r.rating)}</span>
                                    </div>
                                    <div class="review-meta">${r.date} · ${r.service_type}</div>
                                    <div class="review-content">${r.content}</div>
                                </div>
                            `).join('') :
                            '<div class="empty-state"><div class="empty-title">暂无评价</div></div>'
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ==================== 订单页 ====================

async function renderOrdersPage(container) {
    // 获取订单数据（使用模拟数据）
    ordersData = MOCK_ORDERS;
    
    const pendingOrders = ordersData.filter(o => ['pending', 'confirmed'].includes(o.status));
    const completedOrders = ordersData.filter(o => o.status === 'completed');
    
    container.innerHTML = `
        <div class="page-header">
            <h2 class="page-title">📋 我的订单</h2>
            <p class="page-subtitle">查看和管理您的陪诊订单</p>
        </div>
        
        <div class="orders-tabs">
            <div class="tab-item active" data-tab="active" onclick="switchOrderTab('active')">
                进行中 (${pendingOrders.length})
            </div>
            <div class="tab-item" data-tab="completed" onclick="switchOrderTab('completed')">
                已完成 (${completedOrders.length})
            </div>
        </div>
        
        <div id="orders-list">
            ${renderOrdersList(ordersData.filter(o => ['pending', 'confirmed'].includes(o.status)))}
        </div>
    `;
}

function switchOrderTab(tab) {
    document.querySelectorAll('.tab-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tab) {
            item.classList.add('active');
        }
    });
    
    const ordersList = document.getElementById('orders-list');
    if (tab === 'active') {
        ordersList.innerHTML = renderOrdersList(ordersData.filter(o => ['pending', 'confirmed'].includes(o.status)));
    } else {
        ordersList.innerHTML = renderOrdersList(ordersData.filter(o => o.status === 'completed'));
    }
}

function renderOrdersList(orders) {
    if (orders.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <div class="empty-title">暂无订单</div>
                <div class="empty-desc">点击下方按钮预约陪诊师</div>
                <button class="btn-book mt-16" onclick="navigateTo('list')" style="padding: 12px 32px;">
                    立即预约 →
                </button>
            </div>
        `;
    }
    
    return orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">订单号：${order.id}</span>
                <span class="order-status status-${order.status}">${order.status_name}</span>
            </div>
            <div class="order-content">
                <div class="order-escort">
                    <span class="order-escort-avatar" style="display: inline-flex; width: 48px; height: 48px; background: var(--primary-light); color: white; border-radius: 50%; align-items: center; justify-content: center; font-size: 20px;">
                        👨‍⚕️
                    </span>
                    <div class="order-escort-info">
                        <div class="order-escort-name">${order.escort_name}</div>
                        <div class="order-escort-meta">${order.service_type_name}</div>
                    </div>
                </div>
                <div class="order-details">
                    <div class="order-detail-item">
                        <span class="order-detail-label">就诊医院：</span>
                        <span class="order-detail-value">${order.hospital}</span>
                    </div>
                    <div class="order-detail-item">
                        <span class="order-detail-label">就诊科室：</span>
                        <span class="order-detail-value">${order.department}</span>
                    </div>
                    <div class="order-detail-item">
                        <span class="order-detail-label">预约日期：</span>
                        <span class="order-detail-value">${order.appointment_date}</span>
                    </div>
                    <div class="order-detail-item">
                        <span class="order-detail-label">就诊患者：</span>
                        <span class="order-detail-value">${order.patient_name}（${order.patient_age}岁）</span>
                    </div>
                </div>
            </div>
            <div class="order-footer">
                <div class="order-amount">¥${order.total_amount}</div>
                <div class="order-actions">
                    ${order.status === 'completed' && !order.rating ? 
                        `<button class="btn-action btn-action-primary" onclick="openReviewModal('${order.id}')">立即评价</button>` : 
                        order.status === 'completed' && order.rating ?
                        `<span style="color: #FFB800;">★ ${order.rating} 已评价</span>` : ''
                    }
                </div>
            </div>
        </div>
    `).join('');
}

// ==================== 安全保障页 ====================

function renderSafetyPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2 class="page-title">🛡️ 服务保障</h2>
            <p class="page-subtitle">您的安全是我们最在意的事</p>
        </div>
        
        <div class="safety-section">
            <div class="safety-header">
                <div class="safety-title">专业·安全·值得信赖</div>
                <div class="safety-subtitle">「陪陪诊」致力于为每一位用户提供最可靠的陪诊服务</div>
            </div>
            
            <div class="safety-grid">
                <div class="safety-item">
                    <div class="safety-icon">🔍</div>
                    <div class="safety-name">资质严格审核</div>
                    <div class="safety-desc">所有陪诊师均通过身份证、健康证、背景调查等多重核验，确保服务人员真实可靠</div>
                </div>
                <div class="safety-item">
                    <div class="safety-icon">📜</div>
                    <div class="safety-name">专业培训认证</div>
                    <div class="safety-desc">陪诊师须完成平台培训并通过考核，掌握医学常识、急救技能和服务标准</div>
                </div>
                <div class="safety-item">
                    <div class="safety-icon">🔒</div>
                    <div class="safety-name">隐私严格保护</div>
                    <div class="safety-desc">您的个人信息和病情资料全程加密，未经授权绝不泄露</div>
                </div>
            </div>
        </div>
        
        <div class="safety-section">
            <div class="section-title" style="margin-bottom: 20px;">📋 平台服务承诺</div>
            <div class="commitment-list">
                <div class="commitment-item">
                    <span class="commitment-icon">✓</span>
                    <span class="commitment-text">价格透明，无隐形收费</span>
                </div>
                <div class="commitment-item">
                    <span class="commitment-icon">✓</span>
                    <span class="commitment-text">陪诊师准时到达，如约服务</span>
                </div>
                <div class="commitment-item">
                    <span class="commitment-icon">✓</span>
                    <span class="commitment-text">服务不满意，可申请投诉</span>
                </div>
                <div class="commitment-item">
                    <span class="commitment-icon">✓</span>
                    <span class="commitment-text">突发情况有应急处理预案</span>
                </div>
                <div class="commitment-item">
                    <span class="commitment-icon">✓</span>
                    <span class="commitment-text">全程记录服务过程可追溯</span>
                </div>
                <div class="commitment-item">
                    <span class="commitment-icon">✓</span>
                    <span class="commitment-text">客服48小时内响应投诉</span>
                </div>
            </div>
        </div>
        
        <div class="safety-section">
            <div class="section-title" style="margin-bottom: 20px;">💡 服务边界说明</div>
            <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.8;">
                <p style="margin-bottom: 12px;"><strong>陪诊师可以为您提供：</strong></p>
                <ul style="margin-left: 20px; margin-bottom: 16px;">
                    <li>协助挂号、缴费、取药等流程性事务</li>
                    <li>引导就医路线，协助与医生沟通</li>
                    <li>记录医嘱，解释检查注意事项</li>
                    <li>提供情绪支持和心理陪伴</li>
                    <li>协助行动不便的患者移动</li>
                </ul>
                <p style="margin-bottom: 12px;"><strong>陪诊师不提供：</strong></p>
                <ul style="margin-left: 20px;">
                    <li>任何形式的医疗诊疗行为</li>
                    <li>替代患者或家属签署医疗文件</li>
                    <li>私自代购药品或保健品</li>
                    <li>超出陪诊范围的服务承诺</li>
                </ul>
            </div>
        </div>
    `;
}

// ==================== 陪诊师卡片组件 ====================

function renderEscortCard(escort) {
    return `
        <div class="escort-card ${!escort.is_available ? 'unavailable' : ''}" onclick="navigateTo('detail', { escortId: '${escort.id}' })">
            <div class="escort-card-header">
                ${escort.is_verified ? '<span class="escort-verified">已认证</span>' : ''}
                <div class="escort-info">
                    <img src="${escort.avatar}" alt="${escort.name}" class="escort-avatar">
                    <div class="escort-basic">
                        <div class="escort-name">${escort.name}</div>
                        <div class="escort-rating">
                            <span class="rating-stars">${'★'.repeat(Math.floor(escort.rating))}</span>
                            <span class="rating-value">${escort.rating}</span>
                            <span class="text-muted">(${escort.review_count})</span>
                        </div>
                    </div>
                </div>
                <div class="escort-tags">
                    ${escort.tags.slice(0, 2).map(t => `<span class="tag tag-primary">${t}</span>`).join('')}
                </div>
            </div>
            <div class="escort-card-body">
                <div class="escort-stats">
                    <div class="escort-stat">
                        <div class="escort-stat-value">${escort.service_count}</div>
                        <div class="escort-stat-label">服务次数</div>
                    </div>
                    <div class="escort-stat">
                        <div class="escort-stat-value">${escort.experience_years}年</div>
                        <div class="escort-stat-label">从业年限</div>
                    </div>
                    <div class="escort-stat">
                        <div class="escort-stat-value">${escort.hospitals.length}</div>
                        <div class="escort-stat-label">服务医院</div>
                    </div>
                </div>
                <div class="escort-intro">${escort.intro}</div>
                <div class="escort-skills">
                    ${escort.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
                </div>
            </div>
            <div class="escort-card-footer">
                <div>
                    <span class="escort-price">¥${escort.price_half_day}</span>
                    <span class="escort-price-unit">起/4小时</span>
                </div>
                <button class="btn-book" onclick="event.stopPropagation(); openBookingModal('${escort.id}')" ${!escort.is_available ? 'disabled' : ''}>
                    ${escort.is_available ? '立即预约' : '暂不可约'}
                </button>
            </div>
        </div>
    `;
}

// ==================== 预约弹窗 ====================

function openBookingModal(escortId) {
    currentEscort = escortsData.find(e => e.id === escortId) || currentEscort;
    if (!currentEscort) return;
    
    bookingData = {
        escort_id: escortId,
        service_type: 'half_day',
        hospital: currentEscort.hospitals[0] || '',
        department: '',
        appointment_date: '',
        appointment_time: '',
        patient_name: '',
        patient_age: '',
        patient_gender: '男',
        user_name: '',
        user_phone: '',
        remark: ''
    };
    
    bookingStep = 1;
    
    const modal = document.getElementById('booking-modal');
    modal.classList.add('active');
    renderBookingModal();
}

function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    modal.classList.remove('active');
}

function renderBookingModal() {
    const body = document.getElementById('booking-body');
    const escort = currentEscort;
    
    let stepContent = '';
    let totalPrice = bookingData.service_type === 'full_day' ? escort.price_full_day : escort.price_half_day;
    
    switch (bookingStep) {
        case 1:
            stepContent = `
                <div class="form-group">
                    <label class="form-label">选择服务类型</label>
                    <div class="service-type-grid">
                        <div class="service-type-item ${bookingData.service_type === 'half_day' ? 'selected' : ''}" onclick="selectServiceType('half_day')">
                            <div class="service-type-name">半天陪诊</div>
                            <div class="service-type-desc">4小时全程陪诊</div>
                            <div class="service-type-price">¥${escort.price_half_day}</div>
                        </div>
                        <div class="service-type-item ${bookingData.service_type === 'full_day' ? 'selected' : ''}" onclick="selectServiceType('full_day')">
                            <div class="service-type-name">全天陪诊</div>
                            <div class="service-type-desc">8小时全程陪诊</div>
                            <div class="service-type-price">¥${escort.price_full_day}</div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">就诊医院 <span style="color: #FF4D4F;">*</span></label>
                    <select class="form-input" id="booking-hospital" onchange="bookingData.hospital = this.value">
                        <option value="">请选择医院</option>
                        ${escort.hospitals.map(h => `<option value="${h}" ${bookingData.hospital === h ? 'selected' : ''}>${h}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">就诊科室 <span style="color: #FF4D4F;">*</span></label>
                    <input type="text" class="form-input" id="booking-department" placeholder="如：心内科、神经内科" value="${bookingData.department}" oninput="bookingData.department = this.value">
                </div>
            `;
            break;
        case 2:
            stepContent = `
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">预约日期 <span style="color: #FF4D4F;">*</span></label>
                        <input type="date" class="form-input" id="booking-date" min="${new Date().toISOString().split('T')[0]}" value="${bookingData.appointment_date}" onchange="bookingData.appointment_date = this.value">
                    </div>
                    <div class="form-group">
                        <label class="form-label">预约时间 <span style="color: #FF4D4F;">*</span></label>
                        <select class="form-input" id="booking-time" onchange="bookingData.appointment_time = this.value">
                            <option value="">请选择时间</option>
                            <option value="07:00">07:00</option>
                            <option value="08:00">08:00</option>
                            <option value="09:00">09:00</option>
                            <option value="10:00">10:00</option>
                            <option value="14:00">14:00</option>
                            <option value="15:00">15:00</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">您的姓名 <span style="color: #FF4D4F;">*</span></label>
                    <input type="text" class="form-input" id="booking-user-name" placeholder="请输入您的姓名" value="${bookingData.user_name}" oninput="bookingData.user_name = this.value">
                </div>
                <div class="form-group">
                    <label class="form-label">联系电话 <span style="color: #FF4D4F;">*</span></label>
                    <input type="tel" class="form-input" id="booking-user-phone" placeholder="请输入手机号" value="${bookingData.user_phone}" oninput="bookingData.user_phone = this.value">
                </div>
            `;
            break;
        case 3:
            stepContent = `
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">患者姓名 <span style="color: #FF4D4F;">*</span></label>
                        <input type="text" class="form-input" id="booking-patient-name" placeholder="请输入患者姓名" value="${bookingData.patient_name}" oninput="bookingData.patient_name = this.value">
                    </div>
                    <div class="form-group">
                        <label class="form-label">患者年龄 <span style="color: #FF4D4F;">*</span></label>
                        <input type="number" class="form-input" id="booking-patient-age" placeholder="年龄" min="0" max="120" value="${bookingData.patient_age}" oninput="bookingData.patient_age = this.value">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">患者性别</label>
                    <select class="form-input" id="booking-patient-gender" onchange="bookingData.patient_gender = this.value">
                        <option value="男" ${bookingData.patient_gender === '男' ? 'selected' : ''}>男</option>
                        <option value="女" ${bookingData.patient_gender === '女' ? 'selected' : ''}>女</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">备注说明</label>
                    <textarea class="form-input" id="booking-remark" rows="3" placeholder="如有特殊需求请在此说明，如：行动不便需轮椅、需使用医保卡等" oninput="bookingData.remark = this.value">${bookingData.remark}</textarea>
                    <div class="form-hint">我们会尽量满足您的需求</div>
                </div>
            `;
            break;
        case 4:
            // 汇总确认
            const serviceTypeName = bookingData.service_type === 'full_day' ? '全天陪诊(8小时)' : '半天陪诊(4小时)';
            stepContent = `
                <div style="background: #F9F9F9; padding: 20px; border-radius: var(--radius-md); margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                        <img src="${escort.avatar}" alt="${escort.name}" style="width: 48px; height: 48px; border-radius: 50%;">
                        <div>
                            <div style="font-weight: 600;">${escort.name}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">${serviceTypeName}</div>
                        </div>
                    </div>
                    <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.8;">
                        <div><strong>就诊医院：</strong>${bookingData.hospital}</div>
                        <div><strong>就诊科室：</strong>${bookingData.department}</div>
                        <div><strong>预约时间：</strong>${bookingData.appointment_date} ${bookingData.appointment_time}</div>
                        <div><strong>就诊患者：</strong>${bookingData.patient_name}（${bookingData.patient_age}岁 ${bookingData.patient_gender}）</div>
                        <div><strong>联系电话：</strong>${bookingData.user_phone}</div>
                        ${bookingData.remark ? `<div><strong>备注：</strong>${bookingData.remark}</div>` : ''}
                    </div>
                </div>
                
                <div style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: var(--text-secondary);">服务费用</span>
                        <span>¥${totalPrice}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: var(--text-secondary);">平台服务费(15%)</span>
                        <span>¥${Math.round(totalPrice * 0.15)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 600; padding-top: 8px; border-top: 1px dashed var(--border-color);">
                        <span>应付金额</span>
                        <span style="color: var(--primary-color);">¥${totalPrice}</span>
                    </div>
                </div>
                
                <div style="font-size: 12px; color: var(--text-muted);">
                    <p style="margin-bottom: 4px;">📌 预约成功后，陪诊师将在服务前24小时与您联系确认</p>
                    <p>📌 如需取消或改期，请提前12小时联系我们</p>
                </div>
            `;
            break;
    }
    
    body.innerHTML = `
        <div class="booking-step">
            <div class="step-item ${bookingStep >= 1 ? 'active' : ''} ${bookingStep > 1 ? 'completed' : ''}">
                <div class="step-number">${bookingStep > 1 ? '✓' : '1'}</div>
                <div class="step-label">选择服务</div>
            </div>
            <div class="step-item ${bookingStep >= 2 ? 'active' : ''} ${bookingStep > 2 ? 'completed' : ''}">
                <div class="step-number">${bookingStep > 2 ? '✓' : '2'}</div>
                <div class="step-label">预约时间</div>
            </div>
            <div class="step-item ${bookingStep >= 3 ? 'active' : ''} ${bookingStep > 3 ? 'completed' : ''}">
                <div class="step-number">${bookingStep > 3 ? '✓' : '3'}</div>
                <div class="step-label">患者信息</div>
            </div>
            <div class="step-item ${bookingStep >= 4 ? 'active' : ''}">
                <div class="step-number">4</div>
                <div class="step-label">确认支付</div>
            </div>
        </div>
        
        ${stepContent}
    `;
    
    // 更新底部
    document.getElementById('booking-total').innerHTML = `
        <div class="booking-total">
            合计：<span class="booking-total-value">¥${totalPrice}</span>
        </div>
    `;
    
    document.getElementById('booking-btn').innerHTML = bookingStep > 1 ? '上一步' : '下一步';
    document.getElementById('booking-btn').onclick = bookingStep > 1 ? prevStep : nextStep;
    
    if (bookingStep === 4) {
        document.getElementById('booking-btn').textContent = '确认支付';
        document.getElementById('booking-btn').onclick = submitOrder;
    }
}

function selectServiceType(type) {
    bookingData.service_type = type;
    renderBookingModal();
}

function nextStep() {
    // 验证当前步骤
    if (bookingStep === 1) {
        if (!bookingData.hospital || !bookingData.department) {
            alert('请填写完整信息');
            return;
        }
    } else if (bookingStep === 2) {
        if (!bookingData.appointment_date || !bookingData.appointment_time || !bookingData.user_name || !bookingData.user_phone) {
            alert('请填写完整信息');
            return;
        }
        if (!/^1[3-9]\d{9}$/.test(bookingData.user_phone)) {
            alert('请输入正确的手机号');
            return;
        }
    } else if (bookingStep === 3) {
        if (!bookingData.patient_name || !bookingData.patient_age) {
            alert('请填写完整信息');
            return;
        }
    }
    
    bookingStep++;
    renderBookingModal();
}

function prevStep() {
    if (bookingStep > 1) {
        bookingStep--;
        renderBookingModal();
    }
}

async function submitOrder() {
    // 模拟提交订单
    const orderId = 'ORD' + new Date().getTime();
    const totalPrice = bookingData.service_type === 'full_day' ? currentEscort.price_full_day : currentEscort.price_half_day;
    
    const newOrder = {
        id: orderId,
        escort_id: bookingData.escort_id,
        escort_name: currentEscort.name,
        user_name: bookingData.user_name,
        patient_name: bookingData.patient_name,
        patient_age: bookingData.patient_age,
        patient_gender: bookingData.patient_gender,
        hospital: bookingData.hospital,
        department: bookingData.department,
        service_type: bookingData.service_type,
        service_type_name: bookingData.service_type === 'full_day' ? '全天陪诊' : '半天陪诊',
        appointment_date: bookingData.appointment_date,
        appointment_time: bookingData.appointment_time,
        total_amount: totalPrice,
        platform_fee: Math.round(totalPrice * 0.15 * 100) / 100,
        escort_income: Math.round(totalPrice * 0.85 * 100) / 100,
        status: 'pending',
        status_name: '待服务',
        create_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
        remark: bookingData.remark
    };
    
    // 添加到模拟数据
    MOCK_ORDERS.unshift(newOrder);
    
    alert('预约成功！订单号：' + orderId);
    closeBookingModal();
    navigateTo('orders');
}

// ==================== 评价弹窗 ====================

function openReviewModal(orderId) {
    currentOrder = ordersData.find(o => o.id === orderId);
    if (!currentOrder) return;
    
    const modal = document.getElementById('review-modal') || createReviewModal();
    modal.classList.add('active');
    document.getElementById('review-order-id').textContent = orderId;
}

function createReviewModal() {
    const modal = document.createElement('div');
    modal.id = 'review-modal';
    modal.className = 'booking-modal';
    modal.innerHTML = `
        <div class="booking-content" style="max-width: 400px;">
            <div class="booking-header">
                <span class="booking-title">服务评价</span>
                <button class="booking-close" onclick="closeReviewModal()">×</button>
            </div>
            <div class="booking-body">
                <div style="text-align: center; margin-bottom: 20px;">
                    <p style="color: var(--text-secondary); margin-bottom: 16px;">订单号：<span id="review-order-id"></span></p>
                    <div style="display: flex; justify-content: center; gap: 8px;" id="review-stars">
                        ${[1,2,3,4,5].map(i => `<span class="rating-stars" style="font-size: 28px; cursor: pointer;" onclick="setReviewRating(${i})">★</span>`).join('')}
                    </div>
                    <p style="color: var(--text-muted); font-size: 12px; margin-top: 8px;" id="review-rating-text">请选择评分</p>
                </div>
                <div class="form-group">
                    <label class="form-label">评价内容</label>
                    <textarea class="form-input" id="review-content" rows="4" placeholder="分享您的陪诊体验..."></textarea>
                </div>
            </div>
            <div class="booking-footer" style="justify-content: flex-end;">
                <button class="btn-booking" onclick="submitReview()">提交评价</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

let reviewRating = 0;

function setReviewRating(rating) {
    reviewRating = rating;
    const stars = document.querySelectorAll('#review-stars .rating-stars');
    stars.forEach((star, index) => {
        star.style.color = index < rating ? '#FFB800' : '#DDD';
    });
    document.getElementById('review-rating-text').textContent = ['很差', '较差', '一般', '满意', '非常满意'][rating - 1];
}

function closeReviewModal() {
    document.getElementById('review-modal').classList.remove('active');
    reviewRating = 0;
}

async function submitReview() {
    if (reviewRating === 0) {
        alert('请选择评分');
        return;
    }
    
    const review = document.getElementById('review-content').value;
    
    // 模拟提交评价
    const orderIndex = MOCK_ORDERS.findIndex(o => o.id === currentOrder.id);
    if (orderIndex !== -1) {
        MOCK_ORDERS[orderIndex].rating = reviewRating;
        MOCK_ORDERS[orderIndex].review = review;
        MOCK_ORDERS[orderIndex].review_time = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }
    
    alert('评价提交成功！');
    closeReviewModal();
    navigateTo('orders');
}

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', function() {
    // 解析URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 'home';
    
    // 初始化页面
    navigateTo(page);
    
    // 绑定导航事件
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const targetPage = this.dataset.page;
            if (targetPage) {
                navigateTo(targetPage);
            }
        });
    });
});
