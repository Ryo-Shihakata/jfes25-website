// マップ機能JavaScript - assets/js/map.js

let floorsData = null;

// DOM読み込み完了時の初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
});

/**
 * マップ機能初期化
 */
async function initializeMap() {
    // データ読み込み
    await loadFloorsData();
    
    // フロア切り替えイベント設定
    setupFloorTabs();
    
    // キーボードナビゲーション設定
    setupKeyboardNavigation();
    
    // 初期表示
    showFloor('outside');
}

/**
 * フロアデータ読み込み
 */
async function loadFloorsData() {
    floorsData = await loadData('../assets/data/floors.json');
    if (!floorsData) {
        // フォールバックデータ
        floorsData = getDefaultFloorsData();
    }
}

/**
 * フロアタブイベント設定
 */
function setupFloorTabs() {
    const tabs = document.querySelectorAll('.floor-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const floorId = this.getAttribute('data-floor');
            showFloor(floorId);
        });
    });
}

/**
 * フロア表示切り替え
 */
function showFloor(floorId) {
    // すべてのフロアコンテンツを非表示
    const contents = document.querySelectorAll('.floor-content');
    contents.forEach(content => content.classList.remove('active'));
    
    // すべてのタブからactiveクラスを削除
    const tabs = document.querySelectorAll('.floor-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // 選択されたフロアを表示
    const targetContent = document.getElementById(floorId);
    if (targetContent) {
        targetContent.classList.add('active');
        targetContent.classList.add('fade-in');
    }
    
    // 選択されたタブにactiveクラスを追加
    const targetTab = document.querySelector(`[data-floor="${floorId}"]`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // フロア情報を動的に読み込み
    loadFloorInfo(floorId);
    
    // マップ画像を読み込み
    loadFloorMap(floorId);
}

/**
 * フロア情報読み込み
 */
function loadFloorInfo(floorId) {
    const infoContainer = document.getElementById(`${floorId}-info`);
    if (!infoContainer || !floorsData) return;
    
    const floorData = floorsData.floors[floorId];
    if (!floorData) {
        showError(infoContainer, 'フロア情報が見つかりません');
        return;
    }
    
    // 情報セクションを生成
    let infoHTML = '';
    
    if (floorData.exhibitions && floorData.exhibitions.length > 0) {
        infoHTML += `
            <div class="info-section">
                <h3 class="info-title">展示企画</h3>
                <ul class="info-list">
                    ${floorData.exhibitions.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (floorData.food && floorData.food.length > 0) {
        infoHTML += `
            <div class="info-section">
                <h3 class="info-title">フード企画</h3>
                <ul class="info-list">
                    ${floorData.food.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (floorData.facilities && floorData.facilities.length > 0) {
        infoHTML += `
            <div class="info-section">
                <h3 class="info-title">設備・施設</h3>
                <ul class="info-list">
                    ${floorData.facilities.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (floorData.notes && floorData.notes.length > 0) {
        infoHTML += `
            <div class="info-section">
                <h3 class="info-title">注意事項</h3>
                <ul class="info-list">
                    ${floorData.notes.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    infoContainer.innerHTML = infoHTML;
}

/**
 * フロアマップ画像読み込み
 */
function loadFloorMap(floorId) {
    const mapContainer = document.getElementById(`${floorId}-map`);
    if (!mapContainer || !floorsData) return;
    
    const floorData = floorsData.floors[floorId];
    if (!floorData) return;
    
    if (floorData.image) {
        // 画像が存在する場合
        const img = new Image();
        img.onload = function() {
            mapContainer.innerHTML = `<img src="../assets/images/maps/${floorData.image}" alt="${floorData.title}マップ" class="map-image">`;
        };
        img.onerror = function() {
            // 画像読み込みエラー時はプレースホルダーを表示
            showMapPlaceholder(mapContainer, floorData.title);
        };
        img.src = `../assets/images/maps/${floorData.image}`;
    } else {
        // 画像が未設定の場合
        showMapPlaceholder(mapContainer, floorData.title);
    }
}

/**
 * マップのプレースホルダー表示
 */
function showMapPlaceholder(container, floorTitle) {
    container.innerHTML = `
        <div class="map-placeholder">
            <strong>${floorTitle}マップ</strong><br>
            ※ 画像準備中<br>
            教室・廊下の配置図
        </div>
    `;
}

/**
 * キーボードナビゲーション設定
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        const activeTab = document.querySelector('.floor-tab.active');
        const tabs = Array.from(document.querySelectorAll('.floor-tab'));
        const currentIndex = tabs.indexOf(activeTab);
        
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            e.preventDefault();
            tabs[currentIndex - 1].click();
        } else if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
            e.preventDefault();
            tabs[currentIndex + 1].click();
        }
    });
}

/**
 * デフォルトフロアデータ（JSON読み込み失敗時のフォールバック）
 */
function getDefaultFloorsData() {
    return {
        floors: {
            outside: {
                title: "外部エリア",
                image: null,
                exhibitions: [],
                facilities: [
                    "体育館（ステージ企画）",
                    "グラウンド（屋外企画）",
                    "正門（受付・案内）",
                    "駐輪場"
                ],
                notes: [
                    "正門からの入場をお願いします",
                    "駐車場は関係者のみ利用可能",
                    "屋外企画は天候により変更の可能性"
                ]
            },
            "2f": {
                title: "2階フロア",
                image: null,
                exhibitions: [
                    "2-1: 科学実験展示",
                    "2-2: 歴史資料館",
                    "2-3: アート展示",
                    "2-4: 文学作品展示"
                ],
                facilities: [
                    "多目的トイレ",
                    "給水器",
                    "休憩スペース",
                    "階段・エレベーター"
                ],
                notes: []
            },
            "3f": {
                title: "3階フロア",
                image: null,
                exhibitions: [
                    "3-1: テクノロジー体験",
                    "3-2: 数学パズル",
                    "3-3: 語学体験コーナー",
                    "3-4: 音楽体験ルーム"
                ],
                food: [
                    "3-5: カフェコーナー",
                    "3-6: 軽食販売",
                    "廊下: ドリンク販売"
                ],
                facilities: [],
                notes: []
            },
            "4f": {
                title: "4階フロア",
                image: null,
                exhibitions: [
                    "4-1: 研究発表展示",
                    "4-2: 模擬国連",
                    "4-3: プログラミング体験",
                    "4-4: 環境問題研究"
                ],
                facilities: [
                    "講堂: 講演会",
                    "視聴覚室: 映像作品上映",
                    "図書室: 読書体験"
                ],
                notes: []
            },
            "5f": {
                title: "5階フロア",
                image: null,
                exhibitions: [
                    "5-1: 部活動展示",
                    "5-2: 写真部作品展",
                    "5-3: 美術部作品展",
                    "5-4: 書道部作品展"
                ],
                facilities: [
                    "屋上庭園（開放時間限定）",
                    "ラウンジスペース",
                    "自動販売機コーナー"
                ],
                notes: []
            }
        }
    };
}