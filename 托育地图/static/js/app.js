/**
 * 托育地图 APP - 主逻辑
 */

// 生成星级评分HTML
function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let html = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            html += '<span class="star active">★</span>';
        } else if (i === fullStars && hasHalf) {
            html += '<span class="star active">★</span>';
        } else {
            html += '<span class="star">★</span>';
        }
    }
    
    return html;
}

// 生成服务标签HTML
function renderServiceTags(services) {
    return services.map(s => {
        let tagClass = '';
        if (s.includes('双语') || s.includes('蒙氏')) {
            tagClass = 'primary';
        } else if (s.includes('认证') || s.includes('资质')) {
            tagClass = 'accent';
        }
        return `<span class="tag ${tagClass}">${s}</span>`;
    }).join('');
}

// 渲染机构卡片
function renderInstitutionCard(inst) {
    return `
        <div class="card institution-card animate-in" onclick="goToDetail('${inst.id}')">
            <div class="cover">
                <img src="${inst.images[0]}" alt="${inst.name}" loading="lazy">
            </div>
            <div class="info">
                <div>
                    <div class="name">${inst.name}</div>
                    <div class="meta">
                        <span class="rating">${renderStars(inst.rating)}</span>
                        <span>${inst.rating}</span>
                        <span>·</span>
                        <span>师生比 ${inst.teacher_ratio}</span>
                    </div>
                    <div class="services">${renderServiceTags(inst.services.slice(0, 3))}</div>
                </div>
                <div class="flex justify-between items-center">
                    <div class="price">¥${inst.monthly_fee}<span>/月</span></div>
                    <div class="text-secondary" style="font-size:12px">距您 ${inst.distance}km</div>
                </div>
            </div>
        </div>
    `;
}

// 跳转到详情页
function goToDetail(id) {
    window.location.href = `/detail/${id}`;
}

// 跳转到对比页
function goToCompare() {
    window.location.href = '/compare';
}

// 跳转到预约页
function goToReserve(id) {
    window.location.href = `/reserve/${id}`;
}

// 跳转到入园指南
function goToGuide() {
    window.location.href = '/guide';
}

// 首页逻辑
async function initHomePage() {
    const listContainer = document.getElementById('institution-list');
    const mapContainer = document.getElementById('map-container');
    
    if (!listContainer) return;
    
    // 初始化地图
    let map;
    if (mapContainer) {
        map = new MapSimulator('map-container', {
            center: { lat: 31.2304, lng: 121.4737 }
        });
    }
    
    // 当前排序
    let currentSort = 'distance';
    
    // 加载机构数据
    async function loadInstitutions(sortBy = 'distance') {
        currentSort = sortBy;
        
        // 显示加载状态
        listContainer.innerHTML = Array(3).fill(0).map(() => 
            '<div class="skeleton skeleton-card"></div>'
        ).join('');
        
        try {
            const institutions = await API.getNearbyInstitutions({ sort: sortBy });
            
            // 更新列表
            listContainer.innerHTML = institutions.map(renderInstitutionCard).join('');
            
            // 更新地图标记
            if (map) {
                map.addInstitutionMarkers(institutions);
            }
            
            // 更新计数
            const countEl = document.getElementById('institution-count');
            if (countEl) {
                countEl.textContent = institutions.length;
            }
            
        } catch (error) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <div class="icon">😢</div>
                    <p>加载失败，请稍后重试</p>
                </div>
            `;
        }
    }
    
    // 初始化加载
    loadInstitutions();
    
    // 绑定筛选事件
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            // 更新选中状态
            document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            
            // 加载数据
            const sortType = tag.dataset.sort || 'distance';
            loadInstitutions(sortType);
        });
    });
    
    // 地图标记点击
    if (map) {
        map.onMarkerClick((inst) => {
            goToDetail(inst.id);
        });
    }
}

// 详情页逻辑
async function initDetailPage(institutionId) {
    const detailContainer = document.getElementById('detail-content');
    if (!detailContainer) return;
    
    try {
        // 并行获取机构和评价
        const [institution, reviews] = await Promise.all([
            API.getInstitution(institutionId),
            API.getInstitutionReviews(institutionId)
        ]);
        
        if (!institution) {
            detailContainer.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🔍</div>
                    <p>未找到该机构</p>
                </div>
            `;
            return;
        }
        
        // 渲染详情
        detailContainer.innerHTML = `
            <div class="detail-header">
                <div class="detail-image">
                    <img src="${institution.images[0]}" alt="${institution.name}">
                </div>
                <div class="detail-back" onclick="history.back()">←</div>
            </div>
            
            <div class="detail-content">
                <h1 class="detail-title">${institution.name}</h1>
                <div class="flex items-center gap-sm">
                    <div class="stars">${renderStars(institution.rating)}</div>
                    <span>${institution.rating}</span>
                    <span class="text-secondary">(${reviews.length}条评价)</span>
                </div>
                
                <div class="detail-actions">
                    <button class="btn btn-secondary flex-1" onclick="goToCompare()">
                        📊 对比
                    </button>
                    <button class="btn btn-secondary flex-1" onclick="goToReserve('${institution.id}')">
                        📅 预约参观
                    </button>
                </div>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">月费</div>
                        <div class="value primary">¥${institution.monthly_fee}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">师生比</div>
                        <div class="value">${institution.teacher_ratio}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">距离</div>
                        <div class="value">${institution.distance}km</div>
                    </div>
                    <div class="info-item">
                        <div class="label">成立年份</div>
                        <div class="value">${institution.established}年</div>
                    </div>
                </div>
                
                <h3 class="section-title">基本信息</h3>
                <div class="card" style="padding: var(--spacing-md);">
                    <div class="flex items-center gap-sm mb-lg">
                        <span style="color: var(--text-secondary);">📍</span>
                        <span>${institution.address}</span>
                    </div>
                    <div class="flex items-center gap-sm mb-lg">
                        <span style="color: var(--text-secondary);">📞</span>
                        <a href="tel:${institution.phone}" style="color: var(--primary);">${institution.phone}</a>
                    </div>
                    <div class="flex items-center gap-sm">
                        <span style="color: var(--text-secondary);">🕐</span>
                        <span>${institution.hours}</span>
                    </div>
                </div>
                
                <h3 class="section-title">机构简介</h3>
                <p class="text-secondary">${institution.intro}</p>
                
                <h3 class="section-title">特色服务</h3>
                <div class="services-grid">${renderServiceTags(institution.services)}</div>
                
                <h3 class="section-title">餐食标准</h3>
                <div class="card" style="padding: var(--spacing-md);">
                    <span>${institution.meal_standard}</span>
                </div>
                
                <h3 class="section-title">家长评价</h3>
                <div class="reviews-list">
                    ${reviews.length > 0 ? reviews.map(r => `
                        <div class="review-item">
                            <div class="review-header">
                                <span class="review-user">${r.user}</span>
                                <div class="flex items-center gap-sm">
                                    <span class="stars">${renderStars(r.rating)}</span>
                                    <span class="review-date">${r.date}</span>
                                </div>
                            </div>
                            <p class="review-content">${r.content}</p>
                        </div>
                    `).join('') : '<p class="text-secondary">暂无评价</p>'}
                </div>
            </div>
            
            <div class="detail-bottom">
                <button class="btn btn-secondary flex-1" onclick="goToCompare()">
                    📊 对比
                </button>
                <button class="btn btn-primary flex-2" onclick="goToReserve('${institution.id}')">
                    立即预约参观
                </button>
            </div>
        `;
        
    } catch (error) {
        console.error('加载详情失败:', error);
        detailContainer.innerHTML = `
            <div class="empty-state">
                <div class="icon">😢</div>
                <p>加载失败，请稍后重试</p>
            </div>
        `;
    }
}

// 对比页逻辑
async function initComparePage() {
    const compareContainer = document.getElementById('compare-content');
    if (!compareContainer) return;
    
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedIds = urlParams.get('ids') ? urlParams.get('ids').split(',') : [];
    
    // 加载所有机构用于选择
    async function loadCompare() {
        try {
            const institutions = await API.getNearbyInstitutions();
            
            // 渲染选择区域
            let selectedIds = [...preselectedIds];
            
            compareContainer.innerHTML = `
                <div class="page-header">
                    <div class="back-btn" onclick="history.back()">←</div>
                    <h1>机构对比</h1>
                    <div style="width: 32px;"></div>
                </div>
                
                <div class="page-container">
                    <p class="text-secondary mb-lg" style="font-size: 13px;">选择2-3家机构进行对比</p>
                    
                    <div class="compare-select" id="compare-selector">
                        ${institutions.map(inst => `
                            <div class="compare-option ${selectedIds.includes(inst.id) ? 'selected' : ''}" 
                                 data-id="${inst.id}" onclick="toggleCompare(this, '${inst.id}')">
                                <div class="thumb">
                                    <img src="${inst.images[0]}" alt="${inst.name}">
                                </div>
                                <div style="font-weight: 500; font-size: 13px;">${inst.name}</div>
                                <div style="font-size: 12px; color: var(--primary);">¥${inst.monthly_fee}/月</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div id="compare-table-container">
                        ${selectedIds.length >= 2 ? renderCompareTable(institutions.filter(i => selectedIds.includes(i.id))) : `
                            <div class="empty-state" style="padding: 60px 0;">
                                <div class="icon">📊</div>
                                <p>请选择至少2家机构进行对比</p>
                            </div>
                        `}
                    </div>
                </div>
            `;
            
            // 如果有预选机构，立即渲染对比表
            if (selectedIds.length >= 2) {
                window.compareSelected = selectedIds;
            }
            
        } catch (error) {
            console.error('加载对比数据失败:', error);
        }
    }
    
    loadCompare();
}

// 切换对比选择
window.toggleCompare = function(el, id) {
    if (!window.compareSelected) window.compareSelected = [];
    
    const index = window.compareSelected.indexOf(id);
    if (index > -1) {
        window.compareSelected.splice(index, 1);
        el.classList.remove('selected');
    } else {
        if (window.compareSelected.length >= 3) {
            alert('最多只能选择3家机构进行对比');
            return;
        }
        window.compareSelected.push(id);
        el.classList.add('selected');
    }
    
    // 重新渲染对比表
    const container = document.getElementById('compare-table-container');
    if (!container) return;
    
    if (window.compareSelected.length >= 2) {
        API.getNearbyInstitutions().then(institutions => {
            container.innerHTML = renderCompareTable(institutions.filter(i => window.compareSelected.includes(i.id)));
        });
    } else {
        container.innerHTML = `
            <div class="empty-state" style="padding: 60px 0;">
                <div class="icon">📊</div>
                <p>请选择至少2家机构进行对比</p>
            </div>
        `;
    }
};

// 渲染对比表格
function renderCompareTable(institutions) {
    if (!institutions || institutions.length < 2) return '';
    
    return `
        <div class="compare-table">
            <div class="compare-row">
                <div class="compare-label">机构</div>
                ${institutions.map(inst => `
                    <div class="compare-cell">
                        <div class="institution-thumb">
                            <img src="${inst.images[0]}" alt="${inst.name}">
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="compare-row">
                <div class="compare-label">名称</div>
                ${institutions.map(inst => `
                    <div class="compare-cell" style="font-weight: 500;">${inst.name}</div>
                `).join('')}
            </div>
            <div class="compare-row">
                <div class="compare-label">月费</div>
                ${institutions.map(inst => `
                    <div class="compare-cell" style="color: var(--primary); font-weight: 600;">¥${inst.monthly_fee}</div>
                `).join('')}
            </div>
            <div class="compare-row">
                <div class="compare-label">评分</div>
                ${institutions.map(inst => `
                    <div class="compare-cell">
                        <div class="stars">${renderStars(inst.rating)}</div>
                        <span style="margin-left: 4px;">${inst.rating}</span>
                    </div>
                `).join('')}
            </div>
            <div class="compare-row">
                <div class="compare-label">师生比</div>
                ${institutions.map(inst => `
                    <div class="compare-cell">${inst.teacher_ratio}</div>
                `).join('')}
            </div>
            <div class="compare-row">
                <div class="compare-label">距离</div>
                ${institutions.map(inst => `
                    <div class="compare-cell">${inst.distance}km</div>
                `).join('')}
            </div>
            <div class="compare-row">
                <div class="compare-label">成立年份</div>
                ${institutions.map(inst => `
                    <div class="compare-cell">${inst.established}年</div>
                `).join('')}
            </div>
            <div class="compare-row">
                <div class="compare-label">服务</div>
                ${institutions.map(inst => `
                    <div class="compare-cell" style="flex-direction: column; gap: 4px;">
                        ${renderServiceTags(inst.services.slice(0, 2))}
                    </div>
                `).join('')}
            </div>
            <div class="compare-row">
                <div class="compare-label">餐食</div>
                ${institutions.map(inst => `
                    <div class="compare-cell" style="font-size: 12px;">${inst.meal_standard}</div>
                `).join('')}
            </div>
            <div class="compare-row">
                <div class="compare-label">操作</div>
                ${institutions.map(inst => `
                    <div class="compare-cell">
                        <button class="btn btn-primary" style="height: 36px; font-size: 13px;" 
                                onclick="goToReserve('${inst.id}')">预约</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// 预约页逻辑
async function initReservePage(institutionId) {
    const reserveContainer = document.getElementById('reserve-content');
    if (!reserveContainer) return;
    
    try {
        const [institution, timeSlots] = await Promise.all([
            API.getInstitution(institutionId),
            API.getTimeSlots()
        ]);
        
        if (!institution) {
            reserveContainer.innerHTML = '<div class="empty-state"><p>未找到该机构</p></div>';
            return;
        }
        
        let selectedDate = timeSlots[0]?.date || '';
        let selectedTime = '';
        
        reserveContainer.innerHTML = `
            <div class="page-header">
                <div class="back-btn" onclick="history.back()">←</div>
                <h1>预约参观</h1>
                <div style="width: 32px;"></div>
            </div>
            
            <div class="page-container">
                <div class="card" style="padding: var(--spacing-md); margin-bottom: var(--spacing-lg);">
                    <div class="flex items-center gap-md">
                        <img src="${institution.images[0]}" 
                             style="width: 60px; height: 60px; border-radius: var(--radius-sm); object-fit: cover;">
                        <div>
                            <div style="font-weight: 500;">${institution.name}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${institution.address}</div>
                        </div>
                    </div>
                </div>
                
                <form id="reserve-form">
                    <h3 class="section-title" style="margin-top: 0; padding-top: 0; border: none;">选择日期</h3>
                    <div class="date-selector" id="date-selector">
                        ${timeSlots.map((slot, i) => `
                            <div class="date-item ${i === 0 ? 'active' : ''}" data-date="${slot.date}">
                                <div class="day">${slot.label.split(' ')[1]}</div>
                                <div class="date">${slot.label.split(' ')[0]}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <h3 class="section-title">选择时间</h3>
                    <div class="time-grid" id="time-grid">
                        ${(timeSlots[0]?.times || []).map((t, i) => `
                            <div class="time-item ${i === 0 ? 'active' : ''}" data-time="${t.value}">
                                ${t.label}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="form-group" style="margin-top: var(--spacing-xl);">
                        <h3 class="section-title" style="margin-top: 0; padding-top: 0; border: none;">宝宝信息</h3>
                        
                        <div class="form-group">
                            <label class="form-label">宝宝姓名 <span class="required">*</span></label>
                            <input type="text" class="form-input" name="baby_name" placeholder="请输入宝宝姓名" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">宝宝月龄 <span class="required">*</span></label>
                            <div class="select-wrapper">
                                <select name="baby_age" required>
                                    <option value="">请选择月龄</option>
                                    <option value="6-12月">6-12月龄</option>
                                    <option value="12-24月">12-24月龄</option>
                                    <option value="24-36月">24-36月龄</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">家长手机 <span class="required">*</span></label>
                            <input type="tel" class="form-input" name="parent_phone" 
                                   placeholder="请输入手机号码" maxlength="11" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">备注（选填）</label>
                            <textarea class="form-input form-textarea" name="remark" 
                                      placeholder="如有特殊需求请在此说明"></textarea>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block" id="submit-btn">
                        确认预约
                    </button>
                </form>
            </div>
            
            <!-- 成功弹窗 -->
            <div class="modal-overlay" id="success-modal">
                <div class="modal">
                    <div class="modal-icon">✓</div>
                    <h3>预约成功！</h3>
                    <p id="success-msg">我们已收到您的预约信息，稍后会有工作人员与您联系确认。</p>
                    <button class="btn btn-primary" onclick="closeModal()">知道了</button>
                </div>
            </div>
        `;
        
        // 绑定日期选择事件
        document.querySelectorAll('.date-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.date-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                selectedDate = item.dataset.date;
                
                // 更新时间段
                const slot = timeSlots.find(s => s.date === selectedDate);
                if (slot) {
                    document.getElementById('time-grid').innerHTML = slot.times.map((t, i) => `
                        <div class="time-item ${i === 0 ? 'active' : ''}" data-time="${t.value}">
                            ${t.label}
                        </div>
                    `).join('');
                    
                    // 重新绑定时间选择事件
                    document.querySelectorAll('.time-item').forEach(t => {
                        t.addEventListener('click', () => {
                            document.querySelectorAll('.time-item').forEach(i => i.classList.remove('active'));
                            t.classList.add('active');
                            selectedTime = t.dataset.time;
                        });
                    });
                    
                    selectedTime = slot.times[0]?.value || '';
                }
            });
        });
        
        // 绑定时间选择事件
        document.querySelectorAll('.time-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.time-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                selectedTime = item.dataset.time;
            });
        });
        
        // 表单提交
        document.getElementById('reserve-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const submitBtn = document.getElementById('submit-btn');
            
            // 验证
            const babyName = formData.get('baby_name').trim();
            const babyAge = formData.get('baby_age');
            const parentPhone = formData.get('parent_phone').trim();
            
            if (!babyName) {
                alert('请输入宝宝姓名');
                return;
            }
            if (!babyAge) {
                alert('请选择宝宝月龄');
                return;
            }
            if (!/^1\d{10}$/.test(parentPhone)) {
                alert('请输入正确的手机号');
                return;
            }
            if (!selectedDate || !selectedTime) {
                alert('请选择预约时间和日期');
                return;
            }
            
            // 显示加载状态
            submitBtn.disabled = true;
            submitBtn.textContent = '提交中...';
            
            try {
                const result = await API.createReservation({
                    institution_id: institutionId,
                    date: selectedDate,
                    time_slot: selectedTime,
                    baby_name: babyName,
                    baby_age: babyAge,
                    parent_phone: parentPhone,
                    remark: formData.get('remark').trim()
                });
                
                // 显示成功弹窗
                document.getElementById('success-msg').textContent = 
                    `预约时间：${selectedDate} ${selectedTime}\n我们稍后会有工作人员与您联系确认。`;
                document.getElementById('success-modal').classList.add('show');
                
            } catch (error) {
                alert('预约失败，请稍后重试');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '确认预约';
            }
        });
        
    } catch (error) {
        console.error('加载预约页失败:', error);
    }
}

// 关闭弹窗
window.closeModal = function() {
    document.getElementById('success-modal')?.classList.remove('show');
    // 跳回首页
    setTimeout(() => {
        window.location.href = '/';
    }, 300);
};

// 入园指南页逻辑
async function initGuidePage() {
    const guideContainer = document.getElementById('guide-content');
    if (!guideContainer) return;
    
    try {
        const guide = await API.getGuide();
        
        guideContainer.innerHTML = `
            <div class="page-header">
                <div class="back-btn" onclick="history.back()">←</div>
                <h1>入园指南</h1>
                <div style="width: 32px;"></div>
            </div>
            
            <div class="page-container">
                <!-- 入园流程 -->
                <div class="guide-section">
                    <h2>📋 入园流程</h2>
                    <div class="process-flow">
                        ${guide.process.map((step, i) => `
                            <div class="process-step">
                                <div class="step-indicator">
                                    <div class="step-number">${step.step}</div>
                                    ${i < guide.process.length - 1 ? '<div class="step-line"></div>' : ''}
                                </div>
                                <div class="step-content">
                                    <h4>${step.title}</h4>
                                    <p>${step.desc}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- 准备材料 -->
                <div class="guide-section">
                    <h2>📦 准备材料</h2>
                    <div class="material-list">
                        ${guide.materials.map((m, i) => `
                            <div class="material-item">
                                <div class="material-icon">📄</div>
                                <div class="material-info">
                                    <h4>${m.name}</h4>
                                    <p>${m.desc}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- 常见问题 -->
                <div class="guide-section">
                    <h2>❓ 常见问题</h2>
                    <div class="faq-list">
                        ${guide.faq.map(f => `
                            <div class="faq-item">
                                <div class="question">${f.q}</div>
                                <div class="answer">${f.a}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- 政策补贴 -->
                <div class="guide-section">
                    <h2>💰 政策补贴</h2>
                    <div class="policy-card">
                        <h3>${guide.subsidy.title}</h3>
                        <p>${guide.subsidy.content}</p>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('加载入园指南失败:', error);
        guideContainer.innerHTML = `
            <div class="empty-state">
                <div class="icon">😢</div>
                <p>加载失败，请稍后重试</p>
            </div>
        `;
    }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 根据页面初始化对应模块
    const path = window.location.pathname;
    
    if (path === '/' || path === '') {
        initHomePage();
    } else if (path.startsWith('/detail/')) {
        const id = path.split('/').pop();
        initDetailPage(id);
    } else if (path === '/compare') {
        initComparePage();
    } else if (path.startsWith('/reserve/')) {
        const id = path.split('/').pop();
        initReservePage(id);
    } else if (path === '/guide') {
        initGuidePage();
    }
});
