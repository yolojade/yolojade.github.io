GitHub Pages 업로드 방법

1. 압축을 풀어 파일 4개(index.html, style.css, script.js, quiz.txt)를 확인합니다.
2. GitHub에 새 저장소를 만듭니다.
3. 파일들을 저장소 루트에 업로드합니다.
4. Settings > Pages 로 이동합니다.
5. Branch를 main, 폴더를 /(root) 로 선택하고 저장합니다.
6. 잠시 후 생성된 GitHub Pages 주소로 접속합니다.

quiz.txt 작성 규칙
- 첫 줄: 문제 번호
- 그 다음 줄들: 문제 내용
- === : 문제/정답 구분자
- === 아래: 정답
- 빈 줄: 다음 문제 구분

예시
1
print("Hi")
===
Hi

2
for i in [1,2]:
    print(i)
===
1
2
