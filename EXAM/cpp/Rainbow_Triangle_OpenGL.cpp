#pragma comment(linker, "/subsystem:windows")

#include <windows.h>
#include <gl/gl.h>

#pragma comment(lib, "opengl32.lib")

float angle = 0.0f;

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    if (uMsg == WM_CLOSE) { PostQuitMessage(0); return 0; }
    return DefWindowProc(hwnd, uMsg, wParam, lParam);
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    WNDCLASS wc = { 0 };
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = hInstance;
    wc.lpszClassName = L"OpenGL_Class";
    RegisterClass(&wc);

    HWND hwnd = CreateWindowEx(0, L"OpenGL_Class", L"OpenGL Rainbow Triangle",
        WS_OVERLAPPEDWINDOW | WS_VISIBLE, CW_USEDEFAULT, CW_USEDEFAULT, 800, 600, 0, 0, hInstance, 0);

    HDC hdc = GetDC(hwnd);
    PIXELFORMATDESCRIPTOR pfd = { sizeof(PIXELFORMATDESCRIPTOR), 1,
        PFD_DRAW_TO_WINDOW | PFD_SUPPORT_OPENGL | PFD_DOUBLEBUFFER,
        PFD_TYPE_RGBA, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 8, 0, PFD_MAIN_PLANE, 0, 0, 0, 0 };
    SetPixelFormat(hdc, ChoosePixelFormat(hdc, &pfd), &pfd);
    HGLRC hrc = wglCreateContext(hdc);
    wglMakeCurrent(hdc, hrc);

    MSG msg = { 0 };
    while (msg.message != WM_QUIT) {
        if (PeekMessage(&msg, 0, 0, 0, PM_REMOVE)) {
            TranslateMessage(&msg); DispatchMessage(&msg);
        }
        else {
            glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
            glClear(GL_COLOR_BUFFER_BIT);

            glPushMatrix();
            // Z축(0, 0, 1) 기준으로 시계 방향 회전
            glRotatef(angle, 0.0f, 0.0f, 1.0f);

            glBegin(GL_TRIANGLES);
            // 무게중심이 (0,0)이 되도록 정점 좌표 수정
            glColor3f(1.0f, 0.0f, 0.0f); glVertex2f(0.0f, 0.666f);   // 빨강 (위)
            glColor3f(0.0f, 1.0f, 0.0f); glVertex2f(-0.5f, -0.333f); // 초록 (왼쪽 아래)
            glColor3f(0.0f, 0.0f, 1.0f); glVertex2f(0.5f, -0.333f);  // 파랑 (오른쪽 아래)
            glEnd();

            glPopMatrix();
            SwapBuffers(hdc);

            // 시계 방향이므로 각도 감소
            angle -= 0.1f;
        }
    }
    wglMakeCurrent(0, 0); wglDeleteContext(hrc); ReleaseDC(hwnd, hdc);
    return 0;
}