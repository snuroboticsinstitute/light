# 작업 규칙 (light)

- 정식 홈페이지를 새로 만들기 전에 임시로 공개하는 최소 버전입니다. 주소: https://snuroboticsinstitute.github.io/light/
- `dist/`가 웹 루트이고 `main`에 push하면 GitHub Pages로 자동 배포됩니다.
- 내용은 본 사이트 저장소(`snuroboticsinstitute/snuroboticsinstitute.github.io`)의 `dist/`에서 만듭니다. `dist/`를 직접 고치지 말고, 본 사이트를 고친 뒤 `python3 scripts/build.py ../snuroboticsinstitute.github.io/dist dist`로 다시 만듭니다.
- 대메뉴: 소개(인사말·비전·연혁·오시는 길) · 사람들 · 국가연구소 · 소식. 포함할 페이지는 `scripts/build.py`의 `PAGES`에 있습니다. 목록에 없는 페이지로 가는 링크는 글자만 남기고 링크를 없앱니다.
- 사이트가 `/light/` 아래에서 열리므로 빌드 스크립트가 모든 절대 경로 앞에 `/light`를 붙입니다.
- 별도 지시가 없으면 국문과 영문을 함께 변경하고, 배포 완료를 확인한 뒤 "✅ 반영 완료"와 함께 `?v=<커밋 해시>` 링크를 알려 줍니다.
