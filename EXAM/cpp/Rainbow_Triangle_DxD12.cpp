#pragma comment(linker, "/subsystem:windows")

#include <windows.h>
#include <d3d12.h>
#include <dxgi1_4.h>
#include <d3dcompiler.h>
#include <DirectXMath.h>

#pragma comment(lib, "d3d12.lib")
#pragma comment(lib, "dxgi.lib")
#pragma comment(lib, "d3dcompiler.lib")

using namespace DirectX;

HWND hwnd;
ID3D12Device* device;
IDXGISwapChain3* swapChain;
ID3D12CommandQueue* commandQueue;
ID3D12DescriptorHeap* rtvHeap;
ID3D12Resource* renderTargets[2];
ID3D12CommandAllocator* commandAllocator;
ID3D12GraphicsCommandList* commandList;
ID3D12PipelineState* pipelineState;
ID3D12RootSignature* rootSignature;
ID3D12Resource* vertexBuffer;
D3D12_VERTEX_BUFFER_VIEW vertexBufferView;
ID3D12Fence* fence;
HANDLE fenceEvent;
UINT64 fenceValue = 0;
UINT frameIndex;
UINT rtvDescriptorSize;

struct Vertex {
    XMFLOAT3 position;
    XMFLOAT4 color;
};

const char* shaderCode = R"(
    cbuffer Transform : register(b0) { row_major float4x4 MVP; };
    struct VSInput { float3 pos : POSITION; float4 col : COLOR; };
    struct PSInput { float4 pos : SV_POSITION; float4 col : COLOR; };
    
    PSInput VSMain(VSInput input) {
        PSInput output;
        output.pos = mul(float4(input.pos, 1.0f), MVP);
        output.col = input.col;
        return output;
    }
    
    float4 PSMain(PSInput input) : SV_TARGET {
        return input.col;
    }
)";

void WaitForPreviousFrame() {
    const UINT64 currentFenceValue = fenceValue;
    commandQueue->Signal(fence, currentFenceValue);
    fenceValue++;
    if (fence->GetCompletedValue() < currentFenceValue) {
        fence->SetEventOnCompletion(currentFenceValue, fenceEvent);
        WaitForSingleObject(fenceEvent, INFINITE);
    }
    frameIndex = swapChain->GetCurrentBackBufferIndex();
}

LRESULT CALLBACK WindowProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam) {
    if (message == WM_DESTROY) { PostQuitMessage(0); return 0; }
    return DefWindowProc(hWnd, message, wParam, lParam);
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE, LPSTR, int) {
    WNDCLASS wc = { 0 };
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = hInstance;
    wc.lpszClassName = L"DX12Class";
    RegisterClass(&wc);
    hwnd = CreateWindow(L"DX12Class", L"DxD12 Rainbow Triangle", WS_OVERLAPPEDWINDOW | WS_VISIBLE, 100, 100, 800, 600, 0, 0, hInstance, 0);

    IDXGIFactory4* factory;
    CreateDXGIFactory1(IID_PPV_ARGS(&factory));
    D3D12CreateDevice(nullptr, D3D_FEATURE_LEVEL_11_0, IID_PPV_ARGS(&device));

    D3D12_COMMAND_QUEUE_DESC queueDesc = {};
    queueDesc.Type = D3D12_COMMAND_LIST_TYPE_DIRECT;
    device->CreateCommandQueue(&queueDesc, IID_PPV_ARGS(&commandQueue));

    DXGI_SWAP_CHAIN_DESC1 swapChainDesc = {};
    swapChainDesc.BufferCount = 2;
    swapChainDesc.Width = 800; swapChainDesc.Height = 600;
    swapChainDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
    swapChainDesc.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;
    swapChainDesc.SwapEffect = DXGI_SWAP_EFFECT_FLIP_DISCARD;
    swapChainDesc.SampleDesc.Count = 1;

    IDXGISwapChain1* tempSwapChain;
    factory->CreateSwapChainForHwnd(commandQueue, hwnd, &swapChainDesc, nullptr, nullptr, &tempSwapChain);
    swapChain = (IDXGISwapChain3*)tempSwapChain;
    frameIndex = swapChain->GetCurrentBackBufferIndex();

    D3D12_DESCRIPTOR_HEAP_DESC rtvHeapDesc = {};
    rtvHeapDesc.NumDescriptors = 2; rtvHeapDesc.Type = D3D12_DESCRIPTOR_HEAP_TYPE_RTV;
    device->CreateDescriptorHeap(&rtvHeapDesc, IID_PPV_ARGS(&rtvHeap));
    rtvDescriptorSize = device->GetDescriptorHandleIncrementSize(D3D12_DESCRIPTOR_HEAP_TYPE_RTV);

    D3D12_CPU_DESCRIPTOR_HANDLE rtvHandle = rtvHeap->GetCPUDescriptorHandleForHeapStart();
    for (UINT n = 0; n < 2; n++) {
        swapChain->GetBuffer(n, IID_PPV_ARGS(&renderTargets[n]));
        device->CreateRenderTargetView(renderTargets[n], nullptr, rtvHandle);
        rtvHandle.ptr += rtvDescriptorSize;
    }

    device->CreateCommandAllocator(D3D12_COMMAND_LIST_TYPE_DIRECT, IID_PPV_ARGS(&commandAllocator));

    D3D12_ROOT_PARAMETER rootParameters[1];
    rootParameters[0].ParameterType = D3D12_ROOT_PARAMETER_TYPE_32BIT_CONSTANTS;
    rootParameters[0].Constants.ShaderRegister = 0;
    rootParameters[0].Constants.RegisterSpace = 0;
    rootParameters[0].Constants.Num32BitValues = 16;
    rootParameters[0].ShaderVisibility = D3D12_SHADER_VISIBILITY_VERTEX;

    D3D12_ROOT_SIGNATURE_DESC rootSigDesc = { 1, rootParameters, 0, nullptr, D3D12_ROOT_SIGNATURE_FLAG_ALLOW_INPUT_ASSEMBLER_INPUT_LAYOUT };
    ID3DBlob* signature; ID3DBlob* error;
    D3D12SerializeRootSignature(&rootSigDesc, D3D_ROOT_SIGNATURE_VERSION_1, &signature, &error);
    device->CreateRootSignature(0, signature->GetBufferPointer(), signature->GetBufferSize(), IID_PPV_ARGS(&rootSignature));

    ID3DBlob* vertexShader; ID3DBlob* pixelShader;
    D3DCompile(shaderCode, strlen(shaderCode), nullptr, nullptr, nullptr, "VSMain", "vs_5_0", 0, 0, &vertexShader, nullptr);
    D3DCompile(shaderCode, strlen(shaderCode), nullptr, nullptr, nullptr, "PSMain", "ps_5_0", 0, 0, &pixelShader, nullptr);

    D3D12_INPUT_ELEMENT_DESC inputElementDescs[] = {
        { "POSITION", 0, DXGI_FORMAT_R32G32B32_FLOAT, 0, 0, D3D12_INPUT_CLASSIFICATION_PER_VERTEX_DATA, 0 },
        { "COLOR", 0, DXGI_FORMAT_R32G32B32A32_FLOAT, 0, 12, D3D12_INPUT_CLASSIFICATION_PER_VERTEX_DATA, 0 }
    };

    D3D12_GRAPHICS_PIPELINE_STATE_DESC psoDesc = {};
    psoDesc.InputLayout = { inputElementDescs, 2 };
    psoDesc.pRootSignature = rootSignature;
    psoDesc.VS = { vertexShader->GetBufferPointer(), vertexShader->GetBufferSize() };
    psoDesc.PS = { pixelShader->GetBufferPointer(), pixelShader->GetBufferSize() };
    psoDesc.RasterizerState.FillMode = D3D12_FILL_MODE_SOLID;
    psoDesc.RasterizerState.CullMode = D3D12_CULL_MODE_NONE;
    psoDesc.BlendState.RenderTarget[0].RenderTargetWriteMask = D3D12_COLOR_WRITE_ENABLE_ALL;
    psoDesc.SampleMask = UINT_MAX;
    psoDesc.PrimitiveTopologyType = D3D12_PRIMITIVE_TOPOLOGY_TYPE_TRIANGLE;
    psoDesc.NumRenderTargets = 1;
    psoDesc.RTVFormats[0] = DXGI_FORMAT_R8G8B8A8_UNORM;
    psoDesc.SampleDesc.Count = 1;
    device->CreateGraphicsPipelineState(&psoDesc, IID_PPV_ARGS(&pipelineState));

    device->CreateCommandList(0, D3D12_COMMAND_LIST_TYPE_DIRECT, commandAllocator, pipelineState, IID_PPV_ARGS(&commandList));

    Vertex triangleVertices[] = {
        { { 0.0f, 0.666f, 0.0f }, { 1.0f, 0.0f, 0.0f, 1.0f } },
        { { 0.5f, -0.333f, 0.0f }, { 0.0f, 1.0f, 0.0f, 1.0f } },
        { { -0.5f, -0.333f, 0.0f }, { 0.0f, 0.0f, 1.0f, 1.0f } }
    };
    const UINT vertexBufferSize = sizeof(triangleVertices);

    D3D12_HEAP_PROPERTIES heapProps = { D3D12_HEAP_TYPE_UPLOAD, D3D12_CPU_PAGE_PROPERTY_UNKNOWN, D3D12_MEMORY_POOL_UNKNOWN, 1, 1 };
    D3D12_RESOURCE_DESC bufferDesc = { D3D12_RESOURCE_DIMENSION_BUFFER, 0, vertexBufferSize, 1, 1, 1, DXGI_FORMAT_UNKNOWN, 1, 0, D3D12_TEXTURE_LAYOUT_ROW_MAJOR, D3D12_RESOURCE_FLAG_NONE };
    device->CreateCommittedResource(&heapProps, D3D12_HEAP_FLAG_NONE, &bufferDesc, D3D12_RESOURCE_STATE_GENERIC_READ, nullptr, IID_PPV_ARGS(&vertexBuffer));

    UINT8* pVertexDataBegin;
    D3D12_RANGE readRange = { 0, 0 };
    vertexBuffer->Map(0, &readRange, reinterpret_cast<void**>(&pVertexDataBegin));
    memcpy(pVertexDataBegin, triangleVertices, sizeof(triangleVertices));
    vertexBuffer->Unmap(0, nullptr);

    vertexBufferView.BufferLocation = vertexBuffer->GetGPUVirtualAddress();
    vertexBufferView.StrideInBytes = sizeof(Vertex);
    vertexBufferView.SizeInBytes = vertexBufferSize;

    commandList->Close();
    ID3D12CommandList* ppCommandLists[] = { commandList };
    commandQueue->ExecuteCommandLists(_countof(ppCommandLists), ppCommandLists);

    device->CreateFence(0, D3D12_FENCE_FLAG_NONE, IID_PPV_ARGS(&fence));
    fenceValue = 1; fenceEvent = CreateEvent(nullptr, FALSE, FALSE, nullptr);
    WaitForPreviousFrame();

    float angle = 0.0f;
    MSG msg = {};
    while (msg.message != WM_QUIT) {
        if (PeekMessage(&msg, nullptr, 0, 0, PM_REMOVE)) {
            TranslateMessage(&msg); DispatchMessage(&msg);
        }
        else {
            commandAllocator->Reset();
            commandList->Reset(commandAllocator, pipelineState);
            commandList->SetGraphicsRootSignature(rootSignature);

            D3D12_VIEWPORT viewport = { 0.0f, 0.0f, 800.0f, 600.0f, 0.0f, 1.0f };
            D3D12_RECT scissorRect = { 0, 0, 800, 600 };
            commandList->RSSetViewports(1, &viewport);
            commandList->RSSetScissorRects(1, &scissorRect);

            D3D12_RESOURCE_BARRIER barrier = { D3D12_RESOURCE_BARRIER_TYPE_TRANSITION, D3D12_RESOURCE_BARRIER_FLAG_NONE };
            barrier.Transition = { renderTargets[frameIndex], D3D12_RESOURCE_BARRIER_ALL_SUBRESOURCES, D3D12_RESOURCE_STATE_PRESENT, D3D12_RESOURCE_STATE_RENDER_TARGET };
            commandList->ResourceBarrier(1, &barrier);

            D3D12_CPU_DESCRIPTOR_HANDLE rtvHandleCurrent = rtvHeap->GetCPUDescriptorHandleForHeapStart();
            rtvHandleCurrent.ptr += frameIndex * rtvDescriptorSize;
            commandList->OMSetRenderTargets(1, &rtvHandleCurrent, FALSE, nullptr);

            const float clearColor[] = { 0.1f, 0.1f, 0.1f, 1.0f };
            commandList->ClearRenderTargetView(rtvHandleCurrent, clearColor, 0, nullptr);

            angle -= 0.001f;
            XMMATRIX rotationMatrix = XMMatrixRotationZ(angle);
            commandList->SetGraphicsRoot32BitConstants(0, 16, &rotationMatrix, 0);

            commandList->IASetPrimitiveTopology(D3D_PRIMITIVE_TOPOLOGY_TRIANGLELIST);
            commandList->IASetVertexBuffers(0, 1, &vertexBufferView);
            commandList->DrawInstanced(3, 1, 0, 0);

            barrier.Transition = { renderTargets[frameIndex], D3D12_RESOURCE_BARRIER_ALL_SUBRESOURCES, D3D12_RESOURCE_STATE_RENDER_TARGET, D3D12_RESOURCE_STATE_PRESENT };
            commandList->ResourceBarrier(1, &barrier);
            commandList->Close();

            ID3D12CommandList* ppCommandListsRender[] = { commandList };
            commandQueue->ExecuteCommandLists(_countof(ppCommandListsRender), ppCommandListsRender);
            swapChain->Present(1, 0);
            WaitForPreviousFrame();
        }
    }
    return 0;
}