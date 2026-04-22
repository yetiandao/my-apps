/**
 * 适老帮 APP - JavaScript交互逻辑
 * 核心功能：语音助手、快捷功能、页面导航、API调用
 */

// 全局状态
const state = {
    isListening: false,
    currentTab: 'home',
    voiceText: ''
};

// ============================================
// 初始化应用
// ============================================
function initApp() {
    updateTime();
    setInterval(updateTime, 1000);
    initVoiceAssistant();
    initQuickActions();
    initNavigation();
    initModals();
    loadContacts();
    speak('欢迎使用适老帮，我来帮您操作手机');
}

// ============================================
// 时间更新
// ============================================
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('currentTime').textContent = `${hours}:${minutes}`;
}

// ============================================
// 语音助手核心
// ============================================
function initVoiceAssistant() {
    const voiceBtn = document.getElementById('voiceBtn');
    const voicePanel = document.getElementById('voicePanel');
    const voiceCancel = document.getElementById('voiceCancel');
    const voiceHint = document.getElementById('voiceHint');

    // 按下开始录音
    voiceBtn.addEventListener('touchstart', handleVoiceStart);
    voiceBtn.addEventListener('mousedown', handleVoiceStart);
    
    // 松开结束录音
    voiceBtn.addEventListener('touchend', handleVoiceEnd);
    voiceBtn.addEventListener('mouseup', handleVoiceEnd);
    
    // 取消按钮
    voiceCancel.addEventListener('click', cancelVoice);
}

function handleVoiceStart(e) {
    e.preventDefault();
    if (state.isListening) return;
    
    state.isListening = true;
    state.voiceText = '';
    
    // 更新UI
    const voiceBtn = document.getElementById('voiceBtn');
    const voicePanel = document.getElementById('voicePanel');
    const voiceHint = document.getElementById('voiceHint');
    
    voiceBtn.classList.add('active');
    voicePanel.classList.add('show');
    voiceHint.textContent = '请说话...';
    
    // 模拟开始聆听
    setTimeout(() => {
        if (state.isListening) {
            simulateVoiceInput();
        }
    }, 1000);
}

function handleVoiceEnd(e) {
    e.preventDefault();
    // 结束录音逻辑在simulateVoiceInput中处理
}

function cancelVoice() {
    state.isListening = false;
    
    const voiceBtn = document.getElementById('voiceBtn');
    const voicePanel = document.getElementById('voicePanel');
    
    voiceBtn.classList.remove('active');
    voicePanel.classList.remove('show');
}

function simulateVoiceInput() {
    // 模拟收到的语音命令
    const commands = [
        '打电话给儿子',
        '帮我查一下天气',
        '打开健康码',
        '预约挂号',
        '我要打视频给女儿',
        '打开手电筒',
        '帮帮我',
        '怎么办'
    ];
    
    const randomCommand = commands[Math.floor(Math.random() * commands.length)];
    
    // 模拟处理延迟
    setTimeout(() => {
        state.isListening = false;
        state.voiceText = randomCommand;
        
        // 隐藏录音面板
        const voicePanel = document.getElementById('voicePanel');
        const voiceBtn = document.getElementById('voiceBtn');
        const voiceResult = document.getElementById('voiceResult');
        const voiceHint = document.getElementById('voiceHint');
        
        voicePanel.classList.remove('show');
        voiceBtn.classList.remove('active');
        
        // 显示识别结果
        voiceResult.innerHTML = `<strong>您说：</strong>${randomCommand}`;
        voiceHint.textContent = '按住说话，说出您的需求';
        
        // 发送到后端处理
        processVoiceCommand(randomCommand);
    }, 2000);
}

async function processVoiceCommand(text) {
    try {
        const response = await fetch('/api/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 显示处理结果
            showResultModal(result.message, 'success');
            
            // 语音播报结果
            if (result.audio) {
                speak(result.audio);
            }
            
            // 根据意图执行特定操作
            executeAction(result.action, result.details);
        } else {
            showResultModal(result.message, 'error');
            if (result.audio) {
                speak(result.audio);
            }
        }
    } catch (error) {
        console.error('API调用失败:', error);
        showResultModal('网络连接失败，请稍后再试', 'error');
    }
}

function executeAction(action, details) {
    switch (action) {
        case 'call_son':
        case 'call_daughter':
            // 模拟拨打电话
            break;
        case 'video_call':
            // 模拟视频通话
            break;
        case 'show_health_code':
            // 模拟显示健康码
            break;
        case 'open_appointment':
            showPage('contacts');
            break;
        case 'toggle_flashlight':
            // 模拟开关手电筒
            break;
        case 'call_emergency':
            handleEmergency();
            break;
    }
}

// ============================================
// 语音合成 (TTS)
// ============================================
function speak(text) {
    if ('speechSynthesis' in window) {
        // 取消之前的语音
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;  // 稍慢的语速，适合老年人
        utterance.pitch = 1.1; // 稍高的音调，听起来更温暖
        utterance.volume = 1;
        
        // 选择中文语音
        const voices = window.speechSynthesis.getVoices();
        const chineseVoice = voices.find(v => v.lang.includes('zh'));
        if (chineseVoice) {
            utterance.voice = chineseVoice;
        }
        
        window.speechSynthesis.speak(utterance);
    }
}

// ============================================
// 快捷功能
// ============================================
function initQuickActions() {
    const actionCards = document.querySelectorAll('.action-card');
    
    actionCards.forEach(card => {
        card.addEventListener('click', async () => {
            const action = card.dataset.action;
            await executeQuickAction(action);
        });
    });
}

async function executeQuickAction(action) {
    const actionMap = {
        'call-son': { name: '儿子', message: '正在给儿子打电话' },
        'video': { name: '女儿', message: '正在连接视频通话' },
        'health-code': { name: '健康码', message: '正在打开健康码' },
        'appointment': { name: '预约挂号', message: '正在打开预约挂号' },
        'weather': { name: '天气', message: '正在查询天气' },
        'flashlight': { name: '手电筒', message: '正在开关手电筒' }
    };
    
    const actionInfo = actionMap[action];
    if (!actionInfo) return;
    
    try {
        const response = await fetch(`/api/quick-action/${getActionId(action)}`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showResultModal(result.message, 'success');
            speak(result.audio || result.message);
        }
    } catch (error) {
        showResultModal(actionInfo.message, 'success');
        speak(actionInfo.message);
    }
}

function getActionId(action) {
    const map = {
        'call-son': 1,
        'video': 2,
        'health-code': 3,
        'appointment': 4,
        'weather': 5,
        'flashlight': 6
    };
    return map[action] || 1;
}

// ============================================
// 底部导航
// ============================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            switchTab(tab);
        });
    });
    
    // 紧急求助按钮
    document.getElementById('emergencyBtn')?.addEventListener('click', handleEmergency);
    
    // 诈骗检测按钮
    document.getElementById('scamCheckBtn')?.addEventListener('click', () => {
        document.getElementById('scamModal').classList.add('show');
    });
}

function switchTab(tab) {
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });
    
    // 切换页面
    switch (tab) {
        case 'home':
            showHome();
            break;
        case 'contacts':
            showPage('contacts');
            break;
        case 'health':
            showPage('health');
            break;
        case 'settings':
            showPage('settings');
            break;
    }
}

function showHome() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('show');
    });
    document.querySelector('.app-container').style.display = 'block';
}

function showPage(pageName) {
    document.querySelector('.app-container').style.display = 'none';
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('show');
    });
    document.getElementById(`${pageName}Page`)?.classList.add('show');
}

// ============================================
// 联系人管理
// ============================================
async function loadContacts() {
    try {
        const response = await fetch('/api/contacts');
        const result = await response.json();
        
        if (result.success) {
            renderContacts(result.data);
        }
    } catch (error) {
        console.error('加载联系人失败:', error);
    }
}

function renderContacts(contacts) {
    const container = document.getElementById('contactsList');
    if (!container) return;
    
    container.innerHTML = contacts.map((contact, index) => `
        <div class="contact-item">
            <div class="contact-avatar">${getAvatarEmoji(contact.relation)}</div>
            <div class="contact-info">
                <div class="contact-name">${contact.name}</div>
                <div class="contact-phone">${contact.phone}</div>
            </div>
            <button class="contact-call-btn" onclick="callContact(${index})">📞</button>
        </div>
    `).join('');
}

function getAvatarEmoji(relation) {
    const emojis = {
        '家人': '👨‍👩‍👧',
        '医疗': '👨‍⚕️',
        '朋友': '👫',
        '邻居': '🏠'
    };
    return emojis[relation] || '👤';
}

async function callContact(index) {
    try {
        const response = await fetch(`/api/contacts/call/${index}`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showResultModal(result.message, 'success');
            speak(result.audio);
        }
    } catch (error) {
        showResultModal('正在拨打电话...', 'success');
    }
}

// ============================================
// 紧急求助
// ============================================
function handleEmergency() {
    showResultModal('正在联系您的家人...', 'warning');
    speak('别着急，我马上帮您联系家人');
    
    // 模拟通知子女
    setTimeout(() => {
        showResultModal('已通知儿子和女儿，他们马上给您回电话', 'success');
        speak('已通知您的儿子和女儿，他们马上给您回电话');
    }, 2000);
}

// ============================================
// 诈骗检测
// ============================================
function closeScamModal() {
    document.getElementById('scamModal').classList.remove('show');
}

async function checkScam() {
    const input = document.getElementById('scamInput').value;
    
    if (!input.trim()) {
        speak('请输入要检测的内容');
        return;
    }
    
    try {
        const response = await fetch('/api/scam-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: input, type: 'sms' })
        });
        
        const result = await response.json();
        
        closeScamModal();
        
        if (result.risk_level === 'high') {
            showResultModal(result.message, 'error');
        } else if (result.risk_level === 'medium') {
            showResultModal(result.message, 'warning');
        } else {
            showResultModal(result.message, 'success');
        }
        
        speak(result.audio);
    } catch (error) {
        console.error('检测失败:', error);
    }
}

// ============================================
// 健康打卡
// ============================================
document.getElementById('checkinBtn')?.addEventListener('click', async function() {
    try {
        const response = await fetch('/api/health/checkin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ temperature: 36.5 })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showResultModal(result.message, 'success');
            speak(result.audio);
            
            // 更新按钮状态
            this.textContent = '✓ 已打卡';
            this.disabled = true;
            this.style.background = '#E0E0E0';
        }
    } catch (error) {
        showResultModal('今日健康打卡完成', 'success');
    }
});

// ============================================
// 弹窗管理
// ============================================
function initModals() {
    // 点击遮罩层关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    });
}

function showResultModal(message, type = 'success') {
    const modal = document.getElementById('resultModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalMessage = document.getElementById('modalMessage');
    
    // 设置图标
    const icons = {
        'success': '✓',
        'error': '✗',
        'warning': '⚠'
    };
    
    modalIcon.textContent = icons[type] || icons.success;
    modalIcon.className = `modal-icon ${type}`;
    modalMessage.textContent = message;
    
    modal.classList.add('show');
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

// ============================================
// 设置页面的切换按钮
// ============================================
document.querySelectorAll('.setting-toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
        this.classList.toggle('active');
        this.textContent = this.classList.contains('active') ? '开' : '关';
        
        // 实际保存设置
        const settingName = this.closest('.setting-item').querySelector('.setting-text').textContent;
        console.log(`${settingName}已${this.classList.contains('active') ? '开启' : '关闭'}`);
    });
});

// ============================================
// 导出函数供外部调用
// ============================================
window.showHome = showHome;
window.showPage = showPage;
window.callContact = callContact;
window.closeModal = closeModal;
window.closeScamModal = closeScamModal;
window.checkScam = checkScam;
