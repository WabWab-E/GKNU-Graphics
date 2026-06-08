# 🚗 3D Terrarium (테라리움)

React와 Three.js(R3F)를 활용하여 투명한 유리 형태의 테라리움 케이스 속에 아기자기한 오브젝트들을 구현한 3D 디오라마 프로젝트입니다.

## 🛠️ 기술 스택 (Tech Stack)

- **프론트엔드 :** React, Vite
- **3D 그래픽스 :** Three.js, React Three Fiber (R3F)
- **배포 :** Vercel

---
## 📂 프로젝트 구조 (Project Structure)

역할과 책임을 명확히 구분하여 UI 관리, 지형 구축, 광원 추적, 물리 연산 컴포넌트들을 모듈화했습니다.

```text
src/
├── assets/
│   └── sky.hdr               # 테라리움 하늘 배경 및 환경광(HDRI) 텍스처
├── components/
│   ├── CarModels.jsx         # 4종 차량(Sedan, Truck, SportCar, Bus)의 순수 고유 Mesh 데이터
│   ├── DashboardUI.jsx       # 현재 시간대 모니터링, 시간 모드(자동/고정) 및 배속 조절 오버레이 UI
│   ├── FieldWithRoad.jsx     # 도로와 밭을 포함한 지층
│   ├── HeadlightSystem.jsx   # 차종별 범퍼 좌표에 동적 부착되는 헤드라이트 시스템
│   ├── MovingCar.jsx         # 차량 이동 제어, 리스폰 메커니즘 등 차량 메인 컨트롤러
│   ├── OrbitalLights.jsx     # 태양/달의 삼각함수 기반 공전 궤도 연산 및 시간 흐름별 광원 페이드 인/아웃
│   ├── Terrarium.jsx         # MeshPhysicalMaterial 기반의 유리 큐브 및 HDRI 환경광 동기화
│   ├── TimeController.jsx    # 글로벌 시간 관리 및 부드러운 타겟 시간 보간, 4대 시간대(Phase) 판정
│   └── Windmill.jsx          # 애니메이션 글로벌 배속에 연동되어 회전하는 풍차
├── constants.js              # CONFIG 세팅, 글로벌 시간 레퍼런스, Clipping Planes 등 핵심 상수
├── App.jsx                   # 전체 3D 씬(Scene), 카메라 OrbitController, 월드 환경 패키징 빌드
└── main.jsx                  # 애플리케이션 엔트리 포인트
```

---

## ✨ 주요 구현 기능 (Key Features)

### 1. 🧪테라리움 유리 케이스
- `meshPhysicalMaterial`의 고급 속성(`transmission: 1`, `thickness: 0.5`, `roughness: 0.05`, `ior: 1.45`)을 적극 활용하여 유리의 질감을 살렸습니다.
- `@react-three/drei`의 `Edges` 컴포넌트를 이용해 정육면체 테두리에 은은한 화이트 와이어프레임 음영을 추가했습니다.

### 2. 🌞 태양과 달의 공전 및 낮/밤 시간대 전환 시스템
- **자동 순환 모드**에서는 태양과 달이 360도 자연스럽게 공전하며,   
**낮/밤 고정 모드** 전환 시   타겟 각도까지의 최단 거리를 계산해 부드럽게 감속 보간(Lerp)되며 고정됩니다.  

- 삼각함수 원리를 기반으로 태양과 달이 정반대 위치에서 11.5 반지름의 원형 궤도를 공전하며, 고도(`Math.sin`)에 따라  
환경광 배율 및 낮/밤, 일출/일몰(`☀️ 낮`, `🌙 밤`, `🌄 일출`, `🌅 일몰`) 상태를 정밀하게 판정하여 UI와 연동합니다.

### 3. 🏎️ 차량 이동 및 리스폰 시스템
- 각 차량은 `Math.sin`과 `Math.cos` 웨이브 조합을 통해 주행 중 차체가 위아래로 덜덜 떨리는 물리 진동 애니메이션이 적용되어 있습니다.   
이 떨림은 **차량의 현재 속도와 차종별 가중치(`bumpScale`)에 실시간 비례**하도록 정교화되어 시각적 속도감을 극대화합니다.  

- 화면 밖 경계선 탈출 시 메모리에 부담을 가하는 인스턴스 재생성 방식 대신,   
**기존 Material 객체의 색상(`carMat.color`)만 변경**하는  최적화 패턴을 채택하여 랜덤 리스폰 환경에서도 메모리 누수를 방지했습니다.

### 4. 🚜 정밀한 지형 및 정적 데이터 최적화
- 지형 생성이나 차량의 바퀴 등 **정적 좌표 데이터를 외부 컴포넌트로 분리**하여 최적화하였습니다.

---
