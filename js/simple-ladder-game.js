// Simple Ladder Game - 4.png 스타일로 완전 새로 구현
class SimpleLadderGame {
    constructor(container) {
        this.container = container;
        this.slotCount = 0;
        this.topSlots = [];
        this.bottomSlots = [];
        this.connections = [];
        this.ladderStructure = null;
        this.revealedConnections = new Set();
        
        // 색상 팔레트
        this.colors = [
            '#ff4757', '#3742fa', '#2ed573', '#ffa502', '#ff6348',
            '#70a1ff', '#5352ed', '#ff4081', '#26de81', '#fd79a8',
            '#6c5ce7', '#a29bfe', '#74b9ff', '#0984e3', '#00b894',
            '#00cec9', '#e17055', '#fdcb6e', '#e84393', '#636e72'
        ];
        
        this.init();
    }
    
    init() {
        this.createGameStructure();
        console.log('SimpleLadderGame initialized');
    }
    
    createGameStructure() {
        this.container.innerHTML = `
            <div class="simple-ladder-container">
                <!-- 게임 헤더 -->
                <div class="game-header">
                    <h3>🎯 사다리타기</h3>
                    <div class="game-controls">
                        <button class="btn btn-sm btn-primary reveal-all-btn" disabled>
                            👁️ 모든 결과 보기
                        </button>
                        <button class="btn btn-sm btn-secondary reset-btn" disabled>
                            🔄 새로 만들기
                        </button>
                    </div>
                </div>
                
                <!-- 메인 게임 영역 -->
                <div class="ladder-game-area">
                    <!-- 참가자 영역 (왼쪽) -->
                    <div class="participants-area">
                        <div class="area-label">참가자</div>
                        <div class="participants-list"></div>
                    </div>
                    
                    <!-- 사다리 영역 (가운데) -->
                    <div class="ladder-area">
                        <canvas class="ladder-canvas"></canvas>
                    </div>
                    
                    <!-- 결과 영역 (오른쪽) -->
                    <div class="results-area">
                        <div class="area-label">결과</div>
                        <div class="results-list"></div>
                    </div>
                </div>
                
                <!-- 결과 테이블 -->
                <div class="results-table-section" style="display: none;">
                    <div class="table-header">
                        <h4>📋 연결 결과</h4>
                        <span class="results-count">(0개 완료)</span>
                    </div>
                    <div class="results-table-wrapper">
                        <table class="results-table">
                            <thead>
                                <tr>
                                    <th>참가자</th>
                                    <th>→</th>
                                    <th>결과</th>
                                </tr>
                            </thead>
                            <tbody class="results-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        // 요소 참조 저장
        this.participantsList = this.container.querySelector('.participants-list');
        this.resultsList = this.container.querySelector('.results-list');
        this.canvas = this.container.querySelector('.ladder-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resultsTableSection = this.container.querySelector('.results-table-section');
        this.resultsTbody = this.container.querySelector('.results-tbody');
        this.resultsCount = this.container.querySelector('.results-count');
        this.revealAllBtn = this.container.querySelector('.reveal-all-btn');
        this.resetBtn = this.container.querySelector('.reset-btn');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 모든 결과 보기
        this.revealAllBtn.addEventListener('click', () => {
            this.revealAllConnections();
        });
        
        // 새로 만들기
        this.resetBtn.addEventListener('click', () => {
            this.resetGame();
        });
    }
    
    setupGame(slotCount, topSlots, bottomSlots, connections) {
        this.slotCount = slotCount;
        this.topSlots = [...topSlots];
        this.bottomSlots = [...bottomSlots];
        this.connections = [...connections];
        this.revealedConnections.clear();
        
        // 사다리 구조 생성
        this.generateLadderStructure();
        
        // UI 업데이트
        this.renderParticipants();
        this.renderResults();
        this.setupCanvas();
        this.drawLadder();
        
        // 버튼 활성화
        this.revealAllBtn.disabled = false;
        this.resetBtn.disabled = false;
        
        console.log('Game setup complete:', {
            slotCount: this.slotCount,
            topSlots: this.topSlots,
            bottomSlots: this.bottomSlots,
            connections: this.connections
        });
    }
    
    generateLadderStructure() {
        // 사다리 구조 생성 (수직 바 위치들)
        const levels = Math.max(8, this.slotCount * 2); // 충분한 수직선
        this.ladderStructure = {
            levels: levels,
            horizontalBars: []
        };
        
        // 각 레벨에서 랜덤하게 수직 바 생성
        for (let level = 0; level < levels; level++) {
            const bars = [];
            let i = 0;
            while (i < this.slotCount - 1) {
                // 30% 확률로 수직 바 생성, 연속된 바는 생성하지 않음
                if (Math.random() < 0.3) {
                    bars.push(i);
                    i += 2; // 다음 바는 건너뛰어야 함
                } else {
                    i++;
                }
            }
            this.ladderStructure.horizontalBars[level] = bars;
        }
    }
    
    renderParticipants() {
        this.participantsList.innerHTML = '';
        
        for (let i = 0; i < this.slotCount; i++) {
            const participantDiv = document.createElement('div');
            participantDiv.className = 'participant-item';
            participantDiv.dataset.index = i;
            participantDiv.innerHTML = `
                <div class="participant-box">
                    <span class="participant-text">${this.topSlots[i]}</span>
                    <div class="connection-indicator"></div>
                </div>
            `;
            
            // 클릭 이벤트
            participantDiv.addEventListener('click', () => {
                this.revealConnection(i);
            });
            
            this.participantsList.appendChild(participantDiv);
        }
    }
    
    renderResults() {
        this.resultsList.innerHTML = '';
        
        for (let i = 0; i < this.slotCount; i++) {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result-item';
            resultDiv.dataset.index = i;
            resultDiv.innerHTML = `
                <div class="result-box">
                    <div class="connection-indicator"></div>
                    <span class="result-text">${this.bottomSlots[i]}</span>
                </div>
            `;
            
            this.resultsList.appendChild(resultDiv);
        }
    }
    
    setupCanvas() {
        // 캔버스 크기 설정
        const containerRect = this.container.querySelector('.ladder-area').getBoundingClientRect();
        const canvasWidth = Math.max(400, containerRect.width - 20);
        const canvasHeight = Math.max(400, this.slotCount * 60);
        
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';
        
        console.log('Canvas size:', canvasWidth, 'x', canvasHeight);
    }
    
    drawLadder() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 사다리 설정 (가로 방향)
        const leftX = 20;
        const rightX = canvas.width - 20;
        const ladderWidth = rightX - leftX;
        const slotHeight = canvas.height / this.slotCount;
        const levelWidth = ladderWidth / this.ladderStructure.levels;

        // 수평선 그리기 (참가자별 라인)
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const slotYs = [];
        for (let i = 0; i < this.slotCount; i++) {
            const y = slotHeight * (i + 0.5);
            slotYs.push(y);
            ctx.moveTo(leftX, y);
            ctx.lineTo(rightX, y);
        }
        ctx.stroke();
        
        // 수직 바 그리기 (연결선)
        ctx.strokeStyle = '#bbbbbb';
        ctx.lineWidth = 3;
        
        for (let level = 0; level < this.ladderStructure.levels; level++) {
            const x = leftX + level * levelWidth;
            const bars = this.ladderStructure.horizontalBars[level];
            
            for (const barIndex of bars) {
                if (barIndex + 1 < slotYs.length) {
                    const y1 = slotYs[barIndex];
                    const y2 = slotYs[barIndex + 1];
                    
                    ctx.beginPath();
                    ctx.moveTo(x, y1);
                    ctx.lineTo(x, y2);
                    ctx.stroke();
                }
            }
        }
        
        console.log('Horizontal ladder drawn');
    }
    
    revealConnection(topIndex) {
        if (this.revealedConnections.has(topIndex)) {
            return; // 이미 공개됨
        }
        
        const bottomIndex = this.connections[topIndex];
        const color = this.colors[topIndex % this.colors.length];
        
        // 연결 저장
        this.revealedConnections.add(topIndex);
        
        // 경로 그리기
        this.drawConnectionPath(topIndex, bottomIndex, color);
        
        // UI 업데이트
        this.highlightParticipant(topIndex, color);
        this.highlightResult(bottomIndex, color);
        this.updateResultsTable();
        
        console.log(`Connection revealed: ${this.topSlots[topIndex]} → ${this.bottomSlots[bottomIndex]}`);
    }
    
    drawConnectionPath(topIndex, bottomIndex, color) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // 사다리 설정 (가로 방향)
        const leftX = 20;
        const rightX = canvas.width - 20;
        const ladderWidth = rightX - leftX;
        const slotHeight = canvas.height / this.slotCount;
        const levelWidth = ladderWidth / this.ladderStructure.levels;

        // 경로 추적
        let currentPosition = topIndex; // 현재 y-방향 인덱스
        let currentY = slotHeight * (currentPosition + 0.5);

        ctx.strokeStyle = color;
        ctx.lineWidth = 5; // 더 굵게
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.lineCap = 'round'; // 선 끝을 둥글게
        ctx.lineJoin = 'round'; // 선 연결부를 둥글게
        ctx.beginPath();
        ctx.moveTo(leftX, currentY);

        // 각 레벨(x축 단계)을 따라 오른쪽으로 이동하며 경로 추적
        for (let level = 0; level < this.ladderStructure.levels; level++) {
            const x = leftX + level * levelWidth;
            const nextX = leftX + (level + 1) * levelWidth;
            const bars = this.ladderStructure.horizontalBars[level];

            // 현재 위치에서 수직 이동(위/아래) 가능한지 확인
            let moved = false;
            
            // 아래로 이동
            if (bars.includes(currentPosition)) {
                currentPosition++;
                currentY = slotHeight * (currentPosition + 0.5);
                ctx.lineTo(x, currentY); // 수직 이동
                moved = true;
            }
            // 위로 이동
            else if (currentPosition > 0 && bars.includes(currentPosition - 1)) {
                currentPosition--;
                currentY = slotHeight * (currentPosition + 0.5);
                ctx.lineTo(x, currentY); // 수직 이동
                moved = true;
            }

            // 수평으로 다음 레벨로 이동
            ctx.lineTo(nextX, currentY);
        }

        // 최종 목적지
        ctx.lineTo(rightX, currentY);
        ctx.stroke();

        // 그림자 및 스타일 초기화
        ctx.shadowBlur = 0;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
    }
    
    highlightParticipant(index, color) {
        const participant = this.participantsList.querySelector(`[data-index="${index}"]`);
        if (participant) {
            participant.classList.add('revealed');
            participant.style.setProperty('--connection-color', color);
            
            const indicator = participant.querySelector('.connection-indicator');
            if (indicator) {
                indicator.style.backgroundColor = color;
            }
        }
    }
    
    highlightResult(index, color) {
        const result = this.resultsList.querySelector(`[data-index="${index}"]`);
        if (result) {
            result.classList.add('revealed');
            result.style.setProperty('--connection-color', color);
            
            const indicator = result.querySelector('.connection-indicator');
            if (indicator) {
                indicator.style.backgroundColor = color;
            }
        }
    }
    
    updateResultsTable() {
        const revealedCount = this.revealedConnections.size;
        
        if (revealedCount > 0) {
            this.resultsTableSection.style.display = 'block';
        }
        
        // 테이블 업데이트
        this.resultsTbody.innerHTML = '';
        
        this.revealedConnections.forEach(topIndex => {
            const bottomIndex = this.connections[topIndex];
            const color = this.colors[topIndex % this.colors.length];
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <span class="result-indicator" style="background-color: ${color}"></span>
                    ${this.topSlots[topIndex]}
                </td>
                <td>→</td>
                <td>
                    <span class="result-indicator" style="background-color: ${color}"></span>
                    ${this.bottomSlots[bottomIndex]}
                </td>
            `;
            this.resultsTbody.appendChild(row);
        });
        
        // 카운트 업데이트
        this.resultsCount.textContent = `(${revealedCount}개 완료)`;
        
        // 모든 결과 공개되면 버튼 상태 변경
        if (revealedCount === this.slotCount) {
            this.revealAllBtn.textContent = '✅ 모든 결과 완료';
            this.revealAllBtn.disabled = true;
        }
    }
    
    revealAllConnections() {
        for (let i = 0; i < this.slotCount; i++) {
            if (!this.revealedConnections.has(i)) {
                setTimeout(() => {
                    this.revealConnection(i);
                }, i * 200); // 200ms 간격으로 순차 공개
            }
        }
    }
    
    resetGame() {
        // 기존 게임 데이터로 새로운 구조 생성
        this.revealedConnections.clear();
        this.generateLadderStructure();
        
        // UI 초기화
        this.renderParticipants();
        this.renderResults();
        this.drawLadder();
        this.resultsTableSection.style.display = 'none';
        this.resultsTbody.innerHTML = '';
        this.resultsCount.textContent = '(0개 완료)';
        
        // 버튼 상태 초기화
        this.revealAllBtn.textContent = '👁️ 모든 결과 보기';
        this.revealAllBtn.disabled = false;
        
        console.log('Game reset');
    }
}

// Export for use in other files
window.SimpleLadderGame = SimpleLadderGame;

// CSS for SimpleLadderGame (dynamically injected)
const simpleLadderStyles = `
.simple-ladder-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #eee;
}

.game-header h3 {
    font-size: 1.5rem;
    color: #333;
    margin: 0;
}

.game-controls {
    display: flex;
    gap: 10px;
}

.ladder-game-area {
    display: flex;
    justify-content: space-between;
    gap: 20px;
}

.participants-area, .results-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.area-label {
    font-weight: bold;
    color: #555;
    text-align: center;
    padding-bottom: 10px;
    border-bottom: 1px solid #ddd;
}

.participants-list, .results-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.participant-item, .result-item {
    cursor: pointer;
    transition: transform 0.2s ease;
}

.participant-item:hover, .result-item:hover {
    transform: scale(1.03);
}

.participant-box, .result-box {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background-color: #fff;
    border-radius: 8px;
    border: 1px solid #ddd;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
}

.participant-item.revealed .participant-box,
.result-item.revealed .result-box {
    border-left: 5px solid var(--connection-color, #ccc);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.connection-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #ccc;
    transition: background-color 0.3s ease;
}

.participant-text, .result-text {
    flex-grow: 1;
    font-size: 1rem;
    color: #333;
}

.ladder-area {
    flex: 3;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
}

.ladder-canvas {
    background-color: #fff;
    border-radius: 8px;
    border: 1px solid #eee;
}

.results-table-section {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 2px solid #eee;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.table-header h4 {
    margin: 0;
    font-size: 1.2rem;
    color: #333;
}

.results-count {
    font-size: 0.9rem;
    color: #777;
}

.results-table-wrapper {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 8px;
}

.results-table {
    width: 100%;
    border-collapse: collapse;
    text-align: center;
}

.results-table th, .results-table td {
    padding: 12px;
    border-bottom: 1px solid #eee;
}

.results-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #444;
}

.results-table tbody tr:last-child td {
    border-bottom: none;
}

.result-indicator {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 8px;
    vertical-align: middle;
}
`;

// Inject styles into the document head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = simpleLadderStyles;
document.head.appendChild(styleSheet);
