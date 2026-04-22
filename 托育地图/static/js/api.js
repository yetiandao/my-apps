/**
 * 托育地图 APP - API 调用模块
 */

const API_BASE = '';

// API 请求封装
async function request(url, options = {}) {
    try {
        const response = await fetch(API_BASE + url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (data.code !== 200) {
            throw new Error(data.message || '请求失败');
        }
        
        return data.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// 获取附近机构列表
async function getNearbyInstitutions(params = {}) {
    const query = new URLSearchParams({
        lat: params.lat || 31.2304,
        lng: params.lng || 121.4737,
        sort: params.sort || 'distance'
    });
    
    return request(`/api/nearby?${query}`);
}

// 获取机构详情
async function getInstitution(id) {
    return request(`/api/institution/${id}`);
}

// 获取机构评价
async function getInstitutionReviews(id) {
    return request(`/api/institution/${id}/reviews`);
}

// 获取机构对比信息
async function compareInstitutions(ids) {
    return request('/api/compare', {
        method: 'POST',
        body: JSON.stringify({ ids })
    });
}

// 创建预约
async function createReservation(data) {
    return request('/api/reservation', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// 获取入园指南
async function getGuide() {
    return request('/api/guide');
}

// 获取可用时间段
async function getTimeSlots() {
    return request('/api/time-slots');
}

// 导出接口
window.API = {
    getNearbyInstitutions,
    getInstitution,
    getInstitutionReviews,
    compareInstitutions,
    createReservation,
    getGuide,
    getTimeSlots
};
