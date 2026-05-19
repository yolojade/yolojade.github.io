// ==================== 운세 데이터 ==================== 
const FORTUNES = {
    '종합운': [
        '오늘은 새로운 기회가 찾아올 날입니다. 용기 있게 도전하세요.',
        '행운의 바람이 당신을 감싸고 있습니다.',
        '작은 노력이 큰 결과를 만들 것입니다.',
        '당신의 노력은 반드시 보상받을 것입니다.',
        '긍정적인 마음이 좋은 일을 불러옵니다.',
        '오늘 하루는 특별한 날이 될 것입니다.',
        '당신의 꿈은 현실이 될 준비가 되어 있습니다.',
        '행복은 당신의 손 안에 있습니다.',
        '새로운 시작의 시간이 왔습니다.',
        '당신은 충분히 잘하고 있습니다.',
        '오늘의 작은 선택이 내일을 바꿉니다.',
        '당신의 가능성은 무한합니다.',
        '행운은 준비된 자에게 찾아옵니다.',
        '이 순간이 당신의 인생을 바꿀 것입니다.',
        '당신은 특별한 사람입니다.',
        '기다리던 소식이 좋은 방향으로 다가옵니다.',
        '오늘의 미소가 예상 밖의 행운을 부를 것입니다.',
        '망설이던 일에 작은 용기를 내면 길이 열립니다.',
        '주변의 도움을 기쁘게 받아들이면 더 멀리 갈 수 있습니다.',
        '당신의 차분한 선택이 하루를 빛나게 할 것입니다.',
        '오래 품어온 바람이 조금씩 모습을 드러냅니다.',
        '뜻밖의 만남이 새로운 가능성으로 이어질 수 있습니다.',
        '오늘은 마음먹은 일을 시작하기 좋은 날입니다.',
        '작은 친절이 큰 기쁨으로 돌아올 것입니다.',
        '흐름을 믿고 한 걸음 내딛으면 좋은 결과가 따릅니다.',
        '당신의 감각이 중요한 순간에 빛을 발할 것입니다.',
        '복잡했던 일이 의외로 단순하게 풀릴 수 있습니다.',
        '좋은 기운이 당신의 하루를 부드럽게 감싸고 있습니다.',
        '새로운 아이디어가 생활에 즐거운 변화를 가져옵니다.',
        '당신이 쌓아온 시간이 든든한 힘이 되어줄 것입니다.'
    ],
    '애정운': [
        '사랑은 당신 주변에 가득합니다.',
        '소중한 사람과의 인연이 깊어질 것입니다.',
        '당신의 진심이 전해질 시간이 왔습니다.',
        '사랑의 기적이 일어날 준비가 되어 있습니다.',
        '마음을 열면 좋은 인연을 만날 것입니다.',
        '당신의 사랑은 아름다울 것입니다.',
        '소중한 사람과의 관계가 더욱 돈독해질 것입니다.',
        '사랑은 당신이 생각하는 것보다 가깝습니다.',
        '당신의 따뜻한 마음이 누군가를 행복하게 할 것입니다.',
        '진정한 사랑은 이미 시작되었습니다.',
        '당신을 사랑하는 사람이 있습니다.',
        '사랑의 기회를 놓치지 마세요.',
        '당신의 매력이 빛날 시간입니다.',
        '소중한 사람과의 추억이 늘어날 것입니다.',
        '사랑으로 가득한 하루가 될 것입니다.',
        '따뜻한 말 한마디가 관계를 한층 가까이 만듭니다.',
        '마음속에만 두었던 표현을 전하기 좋은 날입니다.',
        '오해가 풀리고 다정한 분위기가 찾아올 것입니다.',
        '당신의 진심을 알아봐 주는 사람이 곁에 있습니다.',
        '새로운 인연은 익숙한 장소에서 시작될 수 있습니다.',
        '상대의 이야기를 들어주는 마음이 큰 선물이 됩니다.',
        '혼자만의 시간을 잘 보내면 사랑의 기운도 밝아집니다.',
        '가벼운 연락이 기분 좋은 대화로 이어질 것입니다.',
        '사소한 배려가 오래 기억될 하루입니다.',
        '당신의 자연스러운 모습이 가장 큰 매력입니다.',
        '기다림 끝에 마음이 놓이는 답을 듣게 될 수 있습니다.',
        '함께 웃는 시간이 관계에 좋은 온기를 더합니다.',
        '솔직함이 사랑의 방향을 더 분명하게 해줄 것입니다.',
        '익숙한 사람에게서 새로운 설렘을 발견할 수 있습니다.',
        '사랑은 서두르지 않을 때 더 아름답게 다가옵니다.'
    ],
    '금전운': [
        '재정적 행운이 당신을 찾아올 것입니다.',
        '현명한 결정이 부를 가져올 것입니다.',
        '예상치 못한 수입이 들어올 것입니다.',
        '당신의 투자는 좋은 결과를 가져올 것입니다.',
        '금전 운이 상승하고 있습니다.',
        '경제적 안정이 가까워지고 있습니다.',
        '당신의 노력이 금전으로 보상받을 것입니다.',
        '새로운 수입의 기회가 생길 것입니다.',
        '현명한 소비가 복을 부를 것입니다.',
        '금전 운이 당신의 편입니다.',
        '부의 문이 열리고 있습니다.',
        '당신의 재정 계획이 성공할 것입니다.',
        '예상 이상의 수익이 들어올 것입니다.',
        '금전적 풍요로움이 다가오고 있습니다.',
        '당신은 충분한 복을 받을 자격이 있습니다.',
        '작은 절약이 예상보다 큰 여유를 만들어줄 것입니다.',
        '미뤄둔 정리가 금전 운을 가볍게 열어줍니다.',
        '신중한 선택이 지갑을 든든하게 지켜줄 것입니다.',
        '필요한 곳에 쓰는 돈이 좋은 만족으로 돌아옵니다.',
        '새로운 정보가 수입의 실마리가 될 수 있습니다.',
        '계획적인 소비가 다음 기회를 더 크게 만듭니다.',
        '뜻밖의 선물이나 혜택을 받을 수 있는 날입니다.',
        '금전 문제는 차분히 살피면 해결책이 보입니다.',
        '당신의 가치가 더 좋은 보상으로 이어질 것입니다.',
        '작은 부수입의 가능성이 가까이에 있습니다.',
        '지금의 꾸준함이 앞으로의 안정으로 이어집니다.',
        '돈의 흐름을 기록하면 행운의 방향이 보일 것입니다.',
        '필요 없는 것을 비우면 새로운 풍요가 들어옵니다.',
        '좋은 제안은 조건을 꼼꼼히 보면 더 빛납니다.',
        '오늘의 현명함이 내일의 여유를 만들어줍니다.'
    ],
    '건강운': [
        '건강한 몸과 마음이 당신의 것입니다.',
        '활기찬 에너지가 당신을 감싸고 있습니다.',
        '신체와 정신의 균형이 이루어질 것입니다.',
        '건강한 변화가 시작될 것입니다.',
        '당신의 건강은 점점 좋아질 것입니다.',
        '활력 있는 하루가 될 것입니다.',
        '긍정적인 마음이 건강을 가져올 것입니다.',
        '당신의 몸이 원하는 것을 들어주세요.',
        '건강한 습관이 복을 부를 것입니다.',
        '활기찬 생활이 당신을 기다리고 있습니다.',
        '당신의 건강 운이 상승하고 있습니다.',
        '신체의 회복력이 좋아질 것입니다.',
        '건강한 삶의 시작이 다가오고 있습니다.',
        '당신의 웰빙이 최우선입니다.',
        '건강한 내일이 보장됩니다.',
        '가벼운 움직임이 몸과 마음의 분위기를 바꿔줍니다.',
        '충분한 휴식이 오늘의 가장 좋은 선택이 될 수 있습니다.',
        '따뜻한 물 한 잔이 몸의 리듬을 부드럽게 깨웁니다.',
        '무리하지 않는 꾸준함이 건강 운을 높여줍니다.',
        '마음을 편히 내려놓으면 몸도 함께 가벼워집니다.',
        '오늘은 당신의 컨디션을 세심하게 살피기 좋은 날입니다.',
        '작은 산책이 생각보다 큰 활력을 가져다줄 것입니다.',
        '몸이 보내는 신호를 존중하면 회복이 빨라집니다.',
        '균형 잡힌 식사가 좋은 기운을 불러옵니다.',
        '잠깐의 스트레칭이 하루의 흐름을 편안하게 만듭니다.',
        '당신에게 맞는 속도로 움직이면 충분합니다.',
        '건강한 선택 하나가 자신감을 되찾게 해줍니다.',
        '복잡한 생각을 쉬게 하면 에너지가 다시 차오릅니다.',
        '오늘의 휴식은 내일의 성과를 위한 준비입니다.',
        '몸과 마음을 돌보는 시간이 행운으로 이어질 것입니다.'
    ],
    '학업·직장운': [
        '당신의 노력이 성과로 나타날 것입니다.',
        '새로운 기회가 직장에서 찾아올 것입니다.',
        '능력을 발휘할 시간이 왔습니다.',
        '당신의 역량이 인정받을 것입니다.',
        '학업에서 좋은 성과가 나올 것입니다.',
        '직장에서의 신뢰가 높아질 것입니다.',
        '새로운 프로젝트에서 성공할 것입니다.',
        '당신의 재능이 빛날 시간입니다.',
        '승진과 발전의 기회가 다가오고 있습니다.',
        '학업 운이 상승하고 있습니다.',
        '당신의 노력은 헛되지 않을 것입니다.',
        '직장에서 좋은 평가를 받을 것입니다.',
        '새로운 기술 습득에 성공할 것입니다.',
        '당신의 미래는 밝을 것입니다.',
        '성공의 길이 열리고 있습니다.',
        '집중력이 높아져 중요한 일을 깔끔하게 마무리할 수 있습니다.',
        '새로운 배움이 곧 실력의 차이로 나타날 것입니다.',
        '동료나 친구의 조언이 문제 해결의 힌트가 됩니다.',
        '준비해 온 것이 인정받을 기회가 찾아옵니다.',
        '오늘 정리한 내용이 나중에 큰 도움이 될 것입니다.',
        '어려운 과제도 차근차근 나누면 충분히 해낼 수 있습니다.',
        '당신의 성실함이 신뢰를 더 단단하게 만듭니다.',
        '좋은 아이디어가 회의나 공부 중에 떠오를 수 있습니다.',
        '미뤄둔 일을 시작하면 의외로 빠르게 진전됩니다.',
        '작은 성취가 더 큰 자신감으로 이어질 것입니다.',
        '새로운 역할이 당신의 장점을 보여줄 기회가 됩니다.',
        '꼼꼼한 확인이 좋은 결과를 지켜줄 것입니다.',
        '배운 것을 바로 적용하면 성장 속도가 빨라집니다.',
        '당신의 책임감이 주변 사람들에게 좋은 인상을 남깁니다.',
        '목표를 다시 확인하면 해야 할 일이 선명해질 것입니다.'
    ]
};

// ==================== 카테고리별 색상 ==================== 
const CATEGORY_COLORS = {
    '종합운': '#FFD700',
    '애정운': '#FF69B4',
    '금전운': '#32CD32',
    '건강운': '#00CED1',
    '학업·직장운': '#9370DB'
};

// ==================== 전역 상태 ==================== 
let currentCategory = '종합운';
let isAnimating = false;

// ==================== 이름 입력 ====================
function getUserName() {
    const nameInput = document.getElementById('userName');
    return nameInput.value.trim();
}

function requestUserName() {
    const nameInput = document.getElementById('userName');
    const cookieHint = document.getElementById('cookieHint');

    nameInput.classList.add('input-error');
    nameInput.focus();
    cookieHint.textContent = '이름을 먼저 입력해주세요!';
    cookieHint.style.color = '#ff6b6b';
}

function setupNameInput() {
    const nameInput = document.getElementById('userName');
    const cookieHint = document.getElementById('cookieHint');

    nameInput.addEventListener('input', function() {
        this.classList.remove('input-error');
        cookieHint.textContent = '클릭하여 운세 뽑기!';
        cookieHint.style.color = '';
        resetFortuneCard();
    });

    nameInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            document.getElementById('fortuneCookie').click();
        }
    });
}

// ==================== 배경 별 생성 ==================== 
function createStars() {
    const starsContainer = document.getElementById('starsBackground');
    const starCount = window.innerWidth < 768 ? 50 : 100;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (2 + Math.random() * 2) + 's';
        starsContainer.appendChild(star);
    }
}

// ==================== 카테고리 선택 ==================== 
function setupCategoryButtons() {
    const buttons = document.querySelectorAll('.category-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // 이전 활성 버튼 제거
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // 현재 버튼 활성화
            this.classList.add('active');
            currentCategory = this.dataset.category;
            
            // 운세 카드 초기화
            resetFortuneCard();
        });
    });
}

// ==================== 포춘쿠키 클릭 이벤트 ==================== 
function setupFortuneCookie() {
    const cookie = document.getElementById('fortuneCookie');
    
    cookie.addEventListener('click', function() {
        if (isAnimating) return;
        if (!getUserName()) {
            requestUserName();
            return;
        }
        
        isAnimating = true;
        
        // 쿠키 흔들기 애니메이션
        cookie.classList.add('shaking');
        
        // 파티클 효과
        createParticles();
        
        // 운세 표시
        setTimeout(() => {
            displayFortune();
            cookie.classList.remove('shaking');
            isAnimating = false;
        }, 500);
    });
}

// ==================== 운세 표시 ==================== 
function displayFortune() {
    const fortunes = FORTUNES[currentCategory];
    const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    const userName = getUserName();
    
    const fortuneCard = document.getElementById('fortuneCard');
    const fortuneCategory = document.getElementById('fortuneCategory');
    const fortuneText = document.getElementById('fortuneText');
    
    // 카드 초기화
    fortuneCard.classList.remove('show');
    fortuneCategory.textContent = '';
    fortuneText.textContent = '';
    
    // 약간의 지연 후 표시
    setTimeout(() => {
        fortuneCategory.textContent = `${userName}님의 ${currentCategory}`;
        fortuneText.textContent = randomFortune;
        fortuneCard.classList.add('show');
        
        // 카드 색상 변경
        const color = CATEGORY_COLORS[currentCategory];
        fortuneCard.style.borderColor = `rgba(${hexToRgb(color)}, 0.5)`;
        fortuneCard.style.background = `rgba(${hexToRgb(color)}, 0.05)`;
    }, 100);
}

// ==================== 운세 카드 초기화 ==================== 
function resetFortuneCard() {
    const fortuneCard = document.getElementById('fortuneCard');
    fortuneCard.classList.remove('show');
}

// ==================== 파티클 효과 생성 ==================== 
function createParticles() {
    const container = document.getElementById('particlesContainer');
    const cookie = document.getElementById('fortuneCookie');
    const cookieRect = cookie.getBoundingClientRect();
    
    const particleCount = 12;
    const colors = ['★', '✨', '⭐'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle particle-star';
        particle.textContent = colors[Math.floor(Math.random() * colors.length)];
        
        // 위치 설정
        particle.style.left = cookieRect.left + cookieRect.width / 2 + 'px';
        particle.style.top = cookieRect.top + cookieRect.height / 2 + 'px';
        
        // 색상 설정
        const color = Object.values(CATEGORY_COLORS)[Math.floor(Math.random() * 5)];
        particle.style.color = color;
        
        // 이동 벡터 계산
        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = 100 + Math.random() * 150;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity - 50;
        
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        
        container.appendChild(particle);
        
        // 애니메이션 완료 후 제거
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// ==================== 헬퍼 함수 ==================== 
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
    }
    return '255, 215, 0';
}

// ==================== 초기화 ==================== 
document.addEventListener('DOMContentLoaded', function() {
    createStars();
    setupCategoryButtons();
    setupNameInput();
    setupFortuneCookie();
    
    // 창 크기 변경 시 별 재생성
    window.addEventListener('resize', function() {
        const starsContainer = document.getElementById('starsBackground');
        starsContainer.innerHTML = '';
        createStars();
    });
});
