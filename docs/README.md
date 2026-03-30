# PT 회원 출석관리 v4

## 추가된 기능
- `schedule.html` 추가
- 월별 달력 화면
- 날짜 클릭 시 해당 날짜 출석 기록 표시
- 출석 시간(`HH:mm`) 표시
- 출석 인원 / 첫 출석 / 마지막 출석 요약 표시
- 예약 수업 탭 자리만 먼저 추가

## 파일
- `index.html` : 출석체크 메인
- `schedule.html` : 달력형 스케줄 페이지
- `script.js` : 메인 페이지 로직
- `schedule.js` : 스케줄 페이지 로직
- `styles.css` : 공통 스타일
- `apps-script/Code.gs` : Apps Script 백엔드

## 적용 방법
1. 웹사이트 파일 전체 교체
2. Apps Script `Code.gs` 전체 교체
3. 웹앱 재배포
4. `script.js`, `schedule.js` 상단 `APPS_SCRIPT_URL`에 웹앱 URL 입력
5. GitHub 업로드

## 참고
- 기존 Attendance 시트 데이터를 그대로 사용 가능
- 스케줄 페이지는 `type=checkin` 기록만 달력에 표시
- 예약 수업 기능은 아직 실제 저장/조회 연결 전


## 글씨가 잘 안 보일 때 바로 바꿀 부분
- 일반 설명 글씨: `.desc`, `.meta`, `.list-sub`, `.header p`
- 버튼 색: `button`, `button.secondary`, `button.action-add`, `button.action-checkin`, `button.action-plus`
- 달력 뱃지 색: `.badge.attendance`
- 시간 표시 박스: `.list-time`
- 선택된 날짜 색: `.calendar-day.selected`
