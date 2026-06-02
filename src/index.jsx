import React from 'react'
import ReactDOM from 'react-dom/client'
import Scene from './main' // 💡 직관적으로 'Scene'이라는 이름으로 가져옵니다.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 💡 대문자로 시작하는 <Scene />으로 수정하여 React 컴포넌트로 정상 인식하게 합니다. */}
    <Scene />
  </React.StrictMode>,
)