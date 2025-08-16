// 共通JavaScript - assets/js/common.js

// DOM読み込み完了時の処理
document.addEventListener('DOMContentLoaded', function() {
    // ナビゲーション初期化
    initializeNavigation();
    
    // スムーズスクロール
    initializeSmoothScroll();
    
    // アクティブページの設定
    setActiveNavigation();
});

/**
 * ナビゲーション初期化
 */
function initializeNavigation() {
    // モバイルメニューの処理（将来的に実装）
    const navbar = document.querySelector('.navbar');
    
    // スクロール時の背景透過度調整
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
}

/**
 * スムーズスクロール設定
 */
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * アクティブナビゲーションの設定
 */
function setActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        // パスの比較
        const linkPath = link.getAttribute('href');
        if (currentPath.includes(linkPath.replace('../', '').replace('.html', ''))) {
            link.classList.add('active');
        }
    });
}

/**
 * データ読み込み用のユーティリティ関数
 */
async function loadData(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Data loading failed:', error);
        return null;
    }
}

/**
 * 要素作成のユーティリティ関数
 */
function createElement(tag, className = '', content = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
}

/**
 * 要素表示/非表示の切り替え
 */
function toggleDisplay(element, show) {
    if (show) {
        element.style.display = 'block';
        element.classList.add('active');
    } else {
        element.style.display = 'none';
        element.classList.remove('active');
    }
}

/**
 * ローディング表示
 */
function showLoading(container) {
    container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #a0aec0;">
            <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">読み込み中...</div>
            <div style="width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        </div>
    `;
}

/**
 * エラー表示
 */
function showError(container, message = 'データの読み込みに失敗しました') {
    container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #e53e3e;">
            <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">エラー</div>
            <div>${message}</div>
        </div>
    `;
}

/**
 * 日付フォーマット
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * 検索機能のユーティリティ
 */
function searchItems(items, query, searchFields) {
    if (!query.trim()) return items;
    
    const lowercaseQuery = query.toLowerCase();
    return items.filter(item => {
        return searchFields.some(field => {
            const value = getNestedProperty(item, field);
            return value && value.toLowerCase().includes(lowercaseQuery);
        });
    });
}

/**
 * ネストされたプロパティの取得
 */
function getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * フィルター機能
 */
function filterItems(items, filters) {
    return items.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
            if (!value || value === 'all') return true;
            return getNestedProperty(item, key) === value;
        });
    });
}

/**
 * デバウンス機能
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// CSS アニメーション用のスタイルを動的に追加
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .fade-in {
        animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);