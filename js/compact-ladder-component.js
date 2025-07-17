// Compact Ladder Component - 참가자-사다리-결과 통합 컴포넌트
class CompactLadderComponent {
    constructor(container) {
        this.container = container;
        this.slotCount = 0;
        this.topSlots = [];
        this.bottomSlots = [];
        this.connections = [];
        this.revealedConnections = new Map(); // topIndex -> {bottomIndex, color}
        this.colors = [
            '#ff4757', '#2f3542', '#ff6b00', '#5f27cd', '#00d2d3',
            '#ff9ff3', '#54a0ff', '#341f97', '#ff3838', '#1dd1a1',
            '#feca57', '#48dbfb', '#ff6b6b', '#ee5a24', '#0abde3',
            '#c44569', '#40739e', '#487eb0', '#8c7ae6', '#00a8ff'
        ];
        
        this.init();
    }

    init() {
        this.createCompactLayout();
        console.log('CompactLadderComponent initialized');
    }

    createCompactLayout() {
        // 기존 내용 제거
        this.container.innerHTML = '';
        
        // 새로운 통합 레이아웃 생성
        const compactContainer = document.createElement('div');
        compactContainer.className = 'compact-ladder-container';
        compactContainer.innerHTML = `
            <!-- 통합 헤더 -->
            <div class="compact-header">
                <h3 class="compact-title">
                    <span class="title-icon">🎯</span>
                    사다리타기 결과
                </h3>
                <div class="compact-actions">
                    <button class="btn btn-sm btn-secondary reset-btn">
                        <span class="btn-icon">🔄</span>
                        다시하기
                    </button>
                </div>
            </div>

            <!-- 참가자-사다리-결과 통합 영역 -->
            <div class="ladder-unified-area">
                <!-- 참가자와 결과가 가로로 배치되고 사다리로 연결 -->
                <div class="horizontal-ladder-container">
                    <!-- 참가자 목록 (세로 배치) -->
                    <div class="participants-column">
                        <div class="participants-list"></div>
                    </div>

                    <!-- 사다리 영역 (가로) -->
                    <div class="ladder-column">
                        <div class="ladder-canvas-wrapper">
                            <canvas class="compact-ladder-canvas"></canvas>
                        </div>
                    </div>

                    <!-- 결과 목록 (세로 배치) -->
                    <div class="results-column">
                        <div class="results-list"></div>
                    </div>
                </div>
            </div>

            <!-- 인라인 결과 테이블 -->
            <div class="inline-results-section">
                <div class="results-table-header">
                    <h4 class="results-title">
                        <span class="results-icon">📋</span>
                        연결 결과
                        <span class="results-count">(0개 완료)</span>
                    </h4>
                    <div class="results-actions">
                        <button class="btn btn-sm btn-primary reveal-all-btn">
                            <span class="btn-icon">👁️</span>
                            모든 결과 보기
                        </button>
                        <button class="btn btn-sm btn-info copy-results-btn" style="display: none;">
                            <span class="btn-icon">📋</span>
                            결과 복사
                        </button>
                    </div>
                </div>
                <div class="inline-results-table">
                    <div class="results-table-wrapper">
                        <table class="compact-results-table">
                            <thead>
                                <tr>
                                    <th class="participant-header">참가자</th>
                                    <th class="connection-header">연결</th>
                                    <th class="result-header">결과</th>
                                </tr>
                            </thead>
                            <tbody class="results-tbody">
                                <!-- 결과 행들이 여기에 동적으로 추가됩니다 -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.container.appendChild(compactContainer);
        
        // 요소 참조 저장
        this.participantsList = compactContainer.querySelector('.participants-list');
        this.resultsList = compactContainer.querySelector('.results-list');
        this.canvas = compactContainer.querySelector('.compact-ladder-canvas');
        this.resultsTable = compactContainer.querySelector('.results-tbody');
        this.resultsCount = compactContainer.querySelector('.results-count');
        this.revealAllBtn = compactContainer.querySelector('.reveal-all-btn');
        this.copyResultsBtn = compactContainer.querySelector('.copy-results-btn');
        this.resetBtn = compactContainer.querySelector('.reset-btn');

        // 이벤트 리스너 설정
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 모든 결과 보기 버튼
        if (this.revealAllBtn) {
            this.revealAllBtn.addEventListener('click', () => {
                this.revealAllConnections();
            });
        }

        // 결과 복사 버튼
        if (this.copyResultsBtn) {
            this.copyResultsBtn.addEventListener('click', () => {
                this.copyResults();
            });
        }

        // 다시하기 버튼
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => {
                this.resetResults();
            });
        }
    }

    setupGame(slotCount, topSlots, bottomSlots, connections) {
        this.slotCount = slotCount;
        this.topSlots = [...topSlots];
        this.bottomSlots = [...bottomSlots];
        this.connections = [...connections];
        this.revealedConnections.clear();

        // 통합 레이아웃 업데이트
        this.updateParticipantsColumn();
        this.updateResultsColumn();
        this.updateResultsTable();
        this.setupCanvasSize();
        
        console.log('Compact ladder game setup complete', {
            slotCount: this.slotCount,
            topSlots: this.topSlots,
            bottomSlots: this.bottomSlots,
            connections: this.connections
        });
    }

    updateParticipantsColumn() {
        if (!this.participantsList) return;

        this.participantsList.innerHTML = '';

        for (let i = 0; i < this.slotCount; i++) {
            const participantItem = document.createElement('div');
            participantItem.className = 'participant-item';
            participantItem.dataset.index = i;
            
            participantItem.innerHTML = `
                <div class="participant-content">
                    <span class="participant-indicator" data-color-index="${i}"></span>
                    <span class="participant-name">${this.topSlots[i] || `참가자 ${i + 1}`}</span>
                    <span class="participant-status">대기 중</span>
                </div>
            `;

            // 클릭 이벤트 추가
            participantItem.addEventListener('click', () => {
                this.revealConnection(i);
            });

            this.participantsList.appendChild(participantItem);
        }
    }

    updateResultsColumn() {
        if (!this.resultsList) return;

        this.resultsList.innerHTML = '';

        for (let i = 0; i < this.slotCount; i++) {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.dataset.index = i;
            
            resultItem.innerHTML = `
                <div class="result-content">
                    <span class="result-indicator"></span>
                    <span class="result-name">${this.bottomSlots[i] || `결과 ${i + 1}`}</span>
                    <span class="result-status">대기 중</span>
                </div>
            `;

            this.resultsList.appendChild(resultItem);
        }
    }

    setupCanvasSize() {
        if (!this.canvas) return;

        // 콤팩트한 캔버스 크기 설정
        const containerWidth = this.canvas.parentElement.clientWidth || 300;
        const optimalHeight = Math.min(400, Math.max(200, this.slotCount * 30));

        this.canvas.width = containerWidth;
        this.canvas.height = optimalHeight;
        this.canvas.style.width = `${containerWidth}px`;
        this.canvas.style.height = `${optimalHeight}px`;

        // 캔버스 컨텍스트 초기화 및 사다리 그리기
        this.ctx = this.canvas.getContext('2d');
        this.drawLadder();

        console.log('Canvas size set:', { width: containerWidth, height: optimalHeight });
    }

    drawLadder() {
        if (!this.ctx || !this.connections || this.connections.length === 0) return;

        const canvas = this.canvas;
        const ctx = this.ctx;
        
        // 캔버스 클리어
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 가로형 사다리 그리기 설정
        const slotHeight = canvas.height / this.slotCount;
        const ladderWidth = canvas.width - 40; // 좌우 여백
        const leftX = 20;
        const rightX = leftX + ladderWidth;
        const verticalLevels = Math.max(3, Math.floor(ladderWidth / 60)); // 가로 레벨 수
        const levelWidth = ladderWidth / verticalLevels;

        // 가로선 그리기 (참가자와 결과를 연결하는 선)
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.slotCount; i++) {
            const y = (i + 0.5) * slotHeight;
            ctx.moveTo(leftX, y);
            ctx.lineTo(rightX, y);
        }
        ctx.stroke();

        // 세로 연결선 그리기 (사다리 효과)
        ctx.strokeStyle = '#bbb';
        ctx.lineWidth = 2;
        
        for (let level = 0; level < verticalLevels; level++) {
            const x = leftX + (level + 0.5) * levelWidth;
            
            // 각 레벨에서 랜덤하게 일부 구간에 세로선 추가
            for (let i = 0; i < this.slotCount - 1; i++) {
                if (Math.random() > 0.6) { // 40% 확률로 세로선 생성
                    const y1 = (i + 0.5) * slotHeight;
                    const y2 = (i + 1.5) * slotHeight;
                    
                    ctx.beginPath();
                    ctx.moveTo(x, y1);
                    ctx.lineTo(x, y2);
                    ctx.stroke();
                }
            }
        }
        
        console.log('Horizontal ladder drawn on canvas');
    }

    drawConnectionPath(topIndex, bottomIndex, color) {
        if (!this.ctx) return;

        const canvas = this.canvas;
        const ctx = this.ctx;
        const slotHeight = canvas.height / this.slotCount;
        const ladderWidth = canvas.width - 40;
        const leftX = 20;
        const rightX = leftX + ladderWidth;

        // 연결 경로 하이라이트
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        
        ctx.beginPath();
        
        // 시작점과 끝점 (가로형)
        const startY = (topIndex + 0.5) * slotHeight;
        const endY = (bottomIndex + 0.5) * slotHeight;
        
        // 가로 연결선 그리기
        ctx.moveTo(leftX, startY);
        
        // 중간 경로 포인트들 (지그재그 효과)
        const levels = 3;
        for (let i = 1; i <= levels; i++) {
            const x = leftX + (ladderWidth / (levels + 1)) * i;
            const progress = i / (levels + 1);
            const y = startY + (endY - startY) * progress + (Math.random() - 0.5) * 20;
            ctx.lineTo(x, y);
        }
        
        // 끝점
        ctx.lineTo(rightX, endY);
        ctx.stroke();
        
        // 그림자 효과 제거
        ctx.shadowBlur = 0;
        
        console.log(`Horizontal connection path drawn: ${topIndex} → ${bottomIndex} with color ${color}`);
    }

    revealConnection(topIndex) {
        if (this.revealedConnections.has(topIndex)) {
            // 이미 공개된 연결이면 하이라이트만 업데이트
            this.highlightConnection(topIndex);
            return;
        }

        const bottomIndex = this.connections[topIndex];
        const color = this.colors[topIndex % this.colors.length];

        // 연결 정보 저장
        this.revealedConnections.set(topIndex, { bottomIndex, color });

        // 시각적 업데이트
        this.highlightConnection(topIndex);
        this.updateResultsTable();
        
        // 애니메이션 효과
        this.animateConnectionReveal(topIndex, bottomIndex, color);

        console.log(`Connection revealed: ${this.topSlots[topIndex]} → ${this.bottomSlots[bottomIndex]}`);
    }

    highlightConnection(topIndex) {
        const connectionData = this.revealedConnections.get(topIndex);
        if (!connectionData) return;

        const { bottomIndex, color } = connectionData;

        // 참가자 하이라이트
        const participantItem = this.participantsList.querySelector(`[data-index="${topIndex}"]`);
        if (participantItem) {
            participantItem.classList.add('highlighted');
            participantItem.style.setProperty('--connection-color', color);
            
            const indicator = participantItem.querySelector('.participant-indicator');
            const status = participantItem.querySelector('.participant-status');
            if (indicator) indicator.style.backgroundColor = color;
            if (status) status.textContent = '연결됨';
        }

        // 결과 하이라이트
        const resultItem = this.resultsList.querySelector(`[data-index="${bottomIndex}"]`);
        if (resultItem) {
            resultItem.classList.add('highlighted');
            resultItem.style.setProperty('--connection-color', color);
            
            const indicator = resultItem.querySelector('.result-indicator');
            const status = resultItem.querySelector('.result-status');
            if (indicator) indicator.style.backgroundColor = color;
            if (status) status.textContent = '선택됨';
        }
    }

    animateConnectionReveal(topIndex, bottomIndex, color) {
        // 사다리에 색상 경로 그리기
        this.drawConnectionPath(topIndex, bottomIndex, color);
        
        // 참가자와 결과 아이템에 펄스 애니메이션
        const participantItem = this.participantsList.querySelector(`[data-index="${topIndex}"]`);
        const resultItem = this.resultsList.querySelector(`[data-index="${bottomIndex}"]`);

        // 펄스 애니메이션
        [participantItem, resultItem].forEach(item => {
            if (item) {
                item.style.animation = 'connectionPulse 0.6s ease-out';
                setTimeout(() => {
                    item.style.animation = '';
                }, 600);
            }
        });
    }

    updateResultsTable() {
        if (!this.resultsTable || !this.resultsCount) return;

        // 기존 테이블 내용 제거
        this.resultsTable.innerHTML = '';

        // 공개된 연결들을 테이블에 추가
        const revealedCount = this.revealedConnections.size;
        
        this.revealedConnections.forEach((connectionData, topIndex) => {
            const { bottomIndex, color } = connectionData;
            const row = this.createResultRow(topIndex, bottomIndex, color);
            this.resultsTable.appendChild(row);
        });

        // 결과 개수 업데이트
        this.resultsCount.textContent = `(${revealedCount}개 완료)`;

        // 복사 버튼 표시/숨김
        if (this.copyResultsBtn) {
            this.copyResultsBtn.style.display = revealedCount > 0 ? 'inline-flex' : 'none';
        }

        // 모든 결과가 공개되면 버튼 상태 변경
        if (revealedCount === this.slotCount && this.revealAllBtn) {
            this.revealAllBtn.innerHTML = '<span class="btn-icon">✅</span> 모든 결과 완료';
            this.revealAllBtn.disabled = true;
            this.revealAllBtn.classList.add('completed');
        }
    }

    createResultRow(topIndex, bottomIndex, color) {
        const row = document.createElement('tr');
        row.className = 'result-row';
        row.style.setProperty('--row-color', color);

        row.innerHTML = `
            <td class="participant-cell">
                <div class="cell-content">
                    <span class="connection-indicator" style="background-color: ${color}"></span>
                    <span class="cell-text">${this.topSlots[topIndex]}</span>
                </div>
            </td>
            <td class="connection-cell">
                <div class="connection-arrow" style="color: ${color}">→</div>
            </td>
            <td class="result-cell">
                <div class="cell-content">
                    <span class="connection-indicator" style="background-color: ${color}"></span>
                    <span class="cell-text">${this.bottomSlots[bottomIndex]}</span>
                </div>
            </td>
        `;

        // 애니메이션 효과
        row.style.opacity = '0';
        row.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, 50);

        return row;
    }

    revealAllConnections() {
        // 모든 연결을 순차적으로 공개
        for (let i = 0; i < this.slotCount; i++) {
            setTimeout(() => {
                this.revealConnection(i);
            }, i * 100); // 100ms 간격으로 순차 공개
        }
    }

    copyResults() {
        if (this.revealedConnections.size === 0) {
            this.showMessage('복사할 결과가 없습니다.', 'warning');
            return;
        }

        const resultTexts = [];
        this.revealedConnections.forEach((connectionData, topIndex) => {
            const { bottomIndex } = connectionData;
            resultTexts.push(`${this.topSlots[topIndex]} → ${this.bottomSlots[bottomIndex]}`);
        });

        const fullText = `사다리타기 결과:\n\n${resultTexts.join('\n')}`;

        // 클립보드에 복사
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(fullText).then(() => {
                this.showMessage('결과가 클립보드에 복사되었습니다!', 'success');
            }).catch(() => {
                this.fallbackCopyToClipboard(fullText);
            });
        } else {
            this.fallbackCopyToClipboard(fullText);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showMessage('결과가 클립보드에 복사되었습니다!', 'success');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            this.showMessage('복사 실패. 수동으로 복사해주세요.', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    resetResults() {
        // 모든 하이라이트와 결과 초기화
        this.revealedConnections.clear();
        
        // 참가자 목록 초기화
        this.participantsList.querySelectorAll('.participant-item').forEach(item => {
            item.classList.remove('highlighted');
            item.style.removeProperty('--connection-color');
            const indicator = item.querySelector('.participant-indicator');
            const status = item.querySelector('.participant-status');
            if (indicator) indicator.style.backgroundColor = '';
            if (status) status.textContent = '대기 중';
        });

        // 결과 목록 초기화
        this.resultsList.querySelectorAll('.result-item').forEach(item => {
            item.classList.remove('highlighted');
            item.style.removeProperty('--connection-color');
            const indicator = item.querySelector('.result-indicator');
            const status = item.querySelector('.result-status');
            if (indicator) indicator.style.backgroundColor = '';
            if (status) status.textContent = '대기 중';
        });

        // 테이블 초기화
        this.updateResultsTable();

        // 버튼 상태 초기화
        if (this.revealAllBtn) {
            this.revealAllBtn.innerHTML = '<span class="btn-icon">👁️</span> 모든 결과 보기';
            this.revealAllBtn.disabled = false;
            this.revealAllBtn.classList.remove('completed');
        }

        console.log('Results reset');
    }

    showMessage(message, type = 'info') {
        // 간단한 메시지 표시
        const messageDiv = document.createElement('div');
        messageDiv.className = `compact-message compact-message-${type}`;
        messageDiv.textContent = message;
        
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 500;
            z-index: 1000;
            animation: messageSlideIn 0.3s ease-out;
            ${type === 'success' ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : ''}
            ${type === 'warning' ? 'background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;' : ''}
            ${type === 'error' ? 'background: #f8d7da; color: #721c24; border: 1px solid #f1b0b7;' : ''}
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'messageSlideOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }

    // 외부에서 캔버스에 접근할 수 있도록
    getCanvas() {
        return this.canvas;
    }

    // 연결 정보 가져오기
    getConnections() {
        return this.connections;
    }

    // 공개된 연결 정보 가져오기
    getRevealedConnections() {
        return this.revealedConnections;
    }
}

// Export for use in other files
window.CompactLadderComponent = CompactLadderComponent;