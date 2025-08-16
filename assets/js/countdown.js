// カウントダウンJavaScript - assets/js/countdown.js

// カウントダウン設定
const COUNTDOWN_CONFIG = {
    targetDate: '2025-09-06T09:00:00',
    timezone: 'Asia/Tokyo'
};

// DOM読み込み完了時の初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeCountdown();
});

/**
 * カウントダウン初期化
 */
function initializeCountdown() {
    const countdownElements = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'), 
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds')
    };

    // 要素が存在するかチェック
    const hasCountdownElements = Object.values(countdownElements).every(element => element !== null);
    
    if (!hasCountdownElements) {
        console.warn('Countdown elements not found on this page');
        return;
    }

    // 初回実行
    updateCountdown(countdownElements);
    
    // 1秒ごとに更新
    const countdownInterval = setInterval(() => {
        updateCountdown(countdownElements);
    }, 1000);

    // ページ離脱時にインターバルをクリア
    window.addEventListener('beforeunload', function() {
        clearInterval(countdownInterval);
    });
}

/**
 * カウントダウン更新
 */
function updateCountdown(elements) {
    const targetDate = new Date(COUNTDOWN_CONFIG.targetDate);
    const now = new Date();
    const difference = targetDate - now;

    if (difference > 0) {
        // 残り時間を計算
        const timeRemaining = calculateTimeRemaining(difference);
        
        // DOM要素を更新
        updateCountdownDisplay(elements, timeRemaining);
        
        // 残り1分を切ったら効果音を鳴らす（オプション）
        if (difference < 60000 && difference > 59000) {
            playNotificationSound();
        }
    } else {
        // イベント開始後の処理
        handleEventStarted(elements);
    }
}

/**
 * 残り時間を計算
 */
function calculateTimeRemaining(difference) {
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
}

/**
 * カウントダウン表示を更新
 */
function updateCountdownDisplay(elements, timeRemaining) {
    elements.days.textContent = formatNumber(timeRemaining.days);
    elements.hours.textContent = formatNumber(timeRemaining.hours);
    elements.minutes.textContent = formatNumber(timeRemaining.minutes);
    elements.seconds.textContent = formatNumber(timeRemaining.seconds);

    // アニメーション効果を追加
    animateCountdownChange(elements.seconds);
}

/**
 * 数値を2桁でフォーマット
 */
function formatNumber(num) {
    return num.toString().padStart(2, '0');
}

/**
 * カウントダウンの変化にアニメーション効果を追加
 */
function animateCountdownChange(element) {
    element.style.transform = 'scale(1.1)';
    element.style.transition = 'transform 0.1s ease';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 100);
}

/**
 * イベント開始後の処理
 */
function handleEventStarted(elements) {
    elements.days.textContent = '00';
    elements.hours.textContent = '00';
    elements.minutes.textContent = '00';
    elements.seconds.textContent = '00';

    // イベント開始メッセージを表示
    const countdownContainer = elements.days.closest('.countdown-container');
    if (countdownContainer) {
        showEventStartedMessage(countdownContainer);
    }
}

/**
 * イベント開始メッセージを表示
 */
function showEventStartedMessage(container) {
    const messageElement = document.createElement('div');
    messageElement.className = 'event-started-message';
    messageElement.style.cssText = `
        background: linear-gradient(45deg, #667eea, #764ba2);
        color: white;
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
        font-weight: bold;
        font-size: 1.1rem;
        margin-top: 1rem;
        animation: fadeIn 0.5s ease-in-out;
    `;
    messageElement.textContent = '🎉 菁々祭が開催中です！';
    
    // 既存のメッセージがあれば削除
    const existingMessage = container.querySelector('.event-started-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    container.appendChild(messageElement);
}

/**
 * 通知音を再生（オプション）
 */
function playNotificationSound() {
    // Web Audio APIを使用した簡単なビープ音
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.warn('Audio notification not supported:', error);
    }
}

/**
 * カウントダウンの設定を更新（管理画面用）
 */
function updateCountdownConfig(newTargetDate) {
    COUNTDOWN_CONFIG.targetDate = newTargetDate;
    console.log('Countdown target updated to:', newTargetDate);
}

/**
 * 現在の設定を取得（デバッグ用）
 */
function getCountdownConfig() {
    return COUNTDOWN_CONFIG;
}