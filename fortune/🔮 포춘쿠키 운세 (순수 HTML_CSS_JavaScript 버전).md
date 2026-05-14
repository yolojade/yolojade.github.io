# 🔮 포춘쿠키 운세 (순수 HTML/CSS/JavaScript 버전)

React 없이 순수 HTML, CSS, JavaScript만으로 만든 포춘쿠키 운세 웹 애플리케이션입니다. 가볍고 빠르며 의존성이 없습니다.

---

## ✨ 주요 특징

- **순수 Vanilla JavaScript**: 프레임워크 없음, 매우 가볍고 빠름
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 최적화
- **아름다운 애니메이션**: CSS 애니메이션과 JavaScript로 부드러운 효과
- **5개 카테고리**: 종합운, 애정운, 금전운, 건강운, 학업·직장운
- **파티클 효과**: 클릭 시 터지는 반짝이는 별들
- **배경 별 효과**: 신비로운 밤하늘 분위기
- **접근성**: 모션 감소 설정 지원

---

## 📁 파일 구조

```
fortune-cookie-vanilla/
├── index.html      # HTML 마크업
├── style.css       # 스타일시트
├── script.js       # JavaScript 로직
└── README.md       # 이 파일
```

---

## 🚀 사용 방법

### 방법 1: 로컬에서 직접 열기

```bash
# 프로젝트 폴더로 이동
cd fortune-cookie-vanilla

# index.html을 브라우저로 열기
# Windows: start index.html
# Mac: open index.html
# Linux: xdg-open index.html
```

### 방법 2: 간단한 HTTP 서버 실행

```bash
# Python 3 사용
python3 -m http.server 8000

# 또는 Node.js의 http-server 사용
npx http-server

# 브라우저에서 http://localhost:8000 방문
```

### 방법 3: GitHub Pages에 배포

1. GitHub 저장소 생성
2. 이 폴더의 모든 파일을 저장소에 업로드
3. Settings → Pages에서 배포 설정
4. `https://username.github.io/fortune-cookie-vanilla` 에서 접속

---

## 💻 기능 설명

### 카테고리 선택
```
상단의 5개 카테고리 버튼 중 하나를 클릭하여 선택
- ★ 종합운
- ♥ 애정운
- $ 금전운
- ♣ 건강운
- ◆ 학업·직장운
```

### 포춘쿠키 클릭
```
중앙의 황금색 포춘쿠키를 클릭
→ 쿠키가 흔들리는 애니메이션
→ 별이 터지는 파티클 효과
→ 운세 문구 표시
```

### 운세 확인
```
카드에 표시된 운세 문구 확인
→ 다시 쿠키를 클릭하면 새로운 운세 뽑기
```

---

## 🎨 커스터마이징

### 운세 문구 추가/수정

`script.js`의 `FORTUNES` 객체 수정:

```javascript
const FORTUNES = {
    '종합운': [
        '기존 운세...',
        '새로운 운세 추가...',
    ],
    // ...
};
```

### 색상 변경

`script.js`의 `CATEGORY_COLORS` 수정:

```javascript
const CATEGORY_COLORS = {
    '종합운': '#FFD700',  // 금색
    '애정운': '#FF69B4',  // 핫핑크
    // ...
};
```

또는 `style.css`의 색상값 수정:

```css
.title {
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffa500 100%);
}
```

### 애니메이션 속도 조정

`style.css`의 `animation-duration` 값 수정:

```css
@keyframes shake {
    /* 0.5s를 다른 값으로 변경 */
}

.particle-star {
    animation: particleFloat 1s ease-out forwards;
    /* 1s를 다른 값으로 변경 */
}
```

### 배경 별 개수 조정

`script.js`의 `createStars()` 함수 수정:

```javascript
const starCount = window.innerWidth < 768 ? 50 : 100;
// 50과 100을 원하는 개수로 변경
```

---

## 📊 파일 크기

| 파일 | 크기 |
|------|------|
| index.html | ~2 KB |
| style.css | ~8 KB |
| script.js | ~6 KB |
| **전체** | **~16 KB** |

React 버전 (약 200 KB)과 비교하면 **12배 이상 가볍습니다!**

---

## 🌐 배포 옵션

### GitHub Pages (무료)
```bash
# 저장소 생성 후
git add .
git commit -m "Add: Fortune Cookie Vanilla"
git push origin main

# Settings → Pages에서 배포
```

### Netlify (무료)
```
1. https://netlify.com 방문
2. "Drop files here to deploy" 영역에 폴더 드래그
3. 자동 배포 완료
```

### Vercel (무료)
```
1. https://vercel.com 방문
2. "Import Project" → 폴더 선택
3. 배포 완료
```

### 기존 웹호스팅
```
FTP로 모든 파일 업로드
```

---

## 🔧 개발 팁

### 콘솔 디버깅
```javascript
// script.js에 추가
console.log('현재 카테고리:', currentCategory);
console.log('애니메이션 중:', isAnimating);
```

### 브라우저 개발자 도구
```
F12 또는 우클릭 → 검사
- Elements: HTML 구조 확인
- Console: 에러 확인
- Network: 로딩 성능 확인
```

### 성능 최적화
```
1. CSS 애니메이션 사용 (JavaScript보다 빠름)
2. 불필요한 DOM 조작 최소화
3. 이벤트 위임 사용
4. 이미지 최적화
```

---

## 🆘 문제 해결

### 애니메이션이 작동하지 않음
```
해결: 브라우저 개발자 도구 → Console에서 에러 확인
```

### 운세가 표시되지 않음
```
해결: script.js의 FORTUNES 객체 확인
```

### 모바일에서 반응이 느림
```
해결: 브라우저 캐시 삭제 또는 시크릿 모드 사용
```

### 별이 보이지 않음
```
해결: 배경색 확인 (밝은 배경이면 별이 안 보임)
```

---

## 📱 브라우저 호환성

| 브라우저 | 지원 |
|---------|------|
| Chrome | ✅ 최신 버전 |
| Firefox | ✅ 최신 버전 |
| Safari | ✅ 최신 버전 |
| Edge | ✅ 최신 버전 |
| IE | ❌ 미지원 |

---

## 📚 추가 학습 자료

- [MDN: Vanilla JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [HTML5 API](https://developer.mozilla.org/en-US/docs/Web/API)

---

## 🎯 향후 개선 사항

- [ ] 운세 저장 기능 (localStorage)
- [ ] 운세 공유 기능 (SNS)
- [ ] 다국어 지원
- [ ] 테마 커스터마이징
- [ ] PWA 지원 (오프라인 사용)
- [ ] 소리 효과 추가

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

---

## 🎉 완료!

이제 순수 HTML/CSS/JavaScript로 만든 포춘쿠키 운세 앱을 즐길 수 있습니다!

**특징:**
- ⚡ 매우 빠른 로딩 속도
- 📦 의존성 없음
- 🎨 아름다운 디자인
- 📱 완벽한 반응형
- 🌐 어디서나 배포 가능

**친구들과 공유하세요! 🍪✨**
