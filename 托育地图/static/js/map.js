/**
 * 托育地图 APP - 地图模块
 * 模拟地图展示功能
 */

class MapSimulator {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.markers = [];
        this.callbacks = {
            onMarkerClick: options.onMarkerClick || (() => {})
        };
        this.center = options.center || { lat: 31.2304, lng: 121.4737 };
        this.range = options.range || 3; // km
        
        if (this.container) {
            this.render();
        }
    }
    
    render() {
        // 创建地图背景
        this.container.innerHTML = `
            <div class="map-placeholder">
                <div class="map-grid"></div>
                <div class="map-center-marker">
                    <div class="current-location">
                        <div class="pulse"></div>
                        <div class="dot"></div>
                    </div>
                    <div class="location-label">当前位置</div>
                </div>
                <div class="map-legend">
                    <span>🏠 托育机构</span>
                </div>
            </div>
        `;
        
        this.addStyles();
    }
    
    addStyles() {
        if (document.getElementById('map-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'map-styles';
        style.textContent = `
            .map-placeholder {
                position: relative;
                width: 100%;
                height: 100%;
            }
            
            .map-grid {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: 
                    linear-gradient(rgba(74, 144, 164, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(74, 144, 164, 0.1) 1px, transparent 1px);
                background-size: 40px 40px;
            }
            
            .map-center-marker {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .current-location {
                position: relative;
                width: 20px;
                height: 20px;
            }
            
            .current-location .dot {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 14px;
                height: 14px;
                background: #4A90A4;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            
            .current-location .pulse {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                background: rgba(74, 144, 164, 0.3);
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% {
                    transform: translate(-50%, -50%) scale(0.5);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(1.5);
                    opacity: 0;
                }
            }
            
            .location-label {
                margin-top: 8px;
                padding: 4px 12px;
                background: white;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                color: #4A90A4;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .map-legend {
                position: absolute;
                bottom: 16px;
                left: 16px;
                padding: 8px 12px;
                background: white;
                border-radius: 8px;
                font-size: 12px;
                color: #666;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .institution-marker {
                position: absolute;
                cursor: pointer;
                transition: transform 0.2s ease;
            }
            
            .institution-marker:hover {
                transform: scale(1.15);
                z-index: 10;
            }
            
            .marker-pin {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .marker-icon {
                width: 36px;
                height: 44px;
                background: #FF8C42;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(255, 140, 66, 0.4);
            }
            
            .marker-icon::after {
                content: '🏠';
                font-size: 16px;
                transform: rotate(45deg);
            }
            
            .marker-price {
                position: absolute;
                top: -8px;
                right: -8px;
                padding: 2px 6px;
                background: #FF6B6B;
                color: white;
                font-size: 10px;
                font-weight: 600;
                border-radius: 8px;
                white-space: nowrap;
            }
            
            .marker-label {
                margin-top: 4px;
                padding: 4px 10px;
                background: white;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 500;
                color: #333;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                white-space: nowrap;
                text-align: center;
            }
            
            .marker-distance {
                font-size: 10px;
                color: #999;
                font-weight: 400;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 计算标记位置（基于与中心点的距离和角度）
    calculateMarkerPosition(distance, index, total) {
        // 将距离转换为像素偏移（假设地图可视范围约2km）
        const maxDistance = 3; // km
        const maxOffset = 35; // 百分比
        const offsetPercent = Math.min(distance / maxDistance, 1) * maxOffset;
        
        // 使用角度使标记分布更均匀
        const angle = (index / total) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
        
        // 计算相对于中心的偏移
        const offsetX = Math.cos(angle) * offsetPercent;
        const offsetY = Math.sin(angle) * offsetPercent;
        
        return {
            left: `${50 + offsetX}%`,
            top: `${50 + offsetY}%`
        };
    }
    
    // 添加机构标记
    addInstitutionMarkers(institutions) {
        const placeholder = this.container.querySelector('.map-placeholder');
        if (!placeholder) return;
        
        // 清除现有标记
        this.markers.forEach(m => m.remove());
        this.markers = [];
        
        institutions.forEach((inst, index) => {
            const position = this.calculateMarkerPosition(inst.distance, index, institutions.length);
            
            const marker = document.createElement('div');
            marker.className = 'institution-marker';
            marker.style.left = position.left;
            marker.style.top = position.top;
            marker.style.transform = 'translate(-50%, -100%)';
            
            marker.innerHTML = `
                <div class="marker-pin">
                    <div class="marker-icon"></div>
                    ${inst.distance <= 1 ? `<div class="marker-price">¥${Math.round(inst.monthly_fee / 1000)}k</div>` : ''}
                </div>
                <div class="marker-label">
                    ${inst.name.substring(0, 6)}
                    <span class="marker-distance">${inst.distance}km</span>
                </div>
            `;
            
            marker.addEventListener('click', () => {
                this.callbacks.onMarkerClick(inst);
            });
            
            placeholder.appendChild(marker);
            this.markers.push(marker);
        });
    }
    
    // 设置标记点击回调
    onMarkerClick(callback) {
        this.callbacks.onMarkerClick = callback;
    }
}

// 导出
window.MapSimulator = MapSimulator;
