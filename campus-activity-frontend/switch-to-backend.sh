#!/bin/bash

# 后端联调环境切换脚本
# 使用方法: ./switch-to-backend.sh

echo "🚀 开始切换到后端联调模式..."

# 1. 备份当前配置
echo "📦 备份当前开发环境配置..."
cp src/.env.development src/.env.development.backup.$(date +%Y%m%d_%H%M%S)

# 2. 修改环境变量
echo "🔧 修改环境配置..."
cat > src/.env.development << EOF
# .env.development - 后端联调模式
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8080/api
VITE_AMAP_KEY=30b170859f00b71edbd631aab944129a
EOF

# 3. 创建后端连接测试
echo "🧪 创建后端连接测试..."
cat > public/test-backend-connection.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>后端连接测试</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-item { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
        .pending { background-color: #fff3cd; border-color: #ffeaa7; }
        button { padding: 8px 16px; margin: 5px; cursor: pointer; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🔌 后端连接测试</h1>
    
    <div class="test-item">
        <h3>环境检查</h3>
        <p>当前模式: <span id="current-mode">检查中...</span></p>
        <p>API地址: <span id="api-url">检查中...</span></p>
    </div>

    <div class="test-item">
        <h3>连接测试</h3>
        <button onclick="testConnection()">测试后端连接</button>
        <button onclick="testAuth()">测试认证接口</button>
        <button onclick="testTeams()">测试团队接口</button>
        <div id="connection-result"></div>
    </div>

    <div class="test-item">
        <h3>详细日志</h3>
        <pre id="log"></pre>
    </div>

    <script>
        const API_BASE = 'http://localhost:8080/api';
        
        function log(message) {
            const logEl = document.getElementById('log');
            const timestamp = new Date().toLocaleTimeString();
            logEl.textContent += `[${timestamp}] ${message}\n`;
            logEl.scrollTop = logEl.scrollHeight;
        }

        function updateEnvironment() {
            const useMock = import.meta.env?.VITE_USE_MOCK === 'true' || false;
            document.getElementById('current-mode').textContent = useMock ? 'Mock模式' : '后端模式';
            document.getElementById('api-url').textContent = useMock ? '/' : API_BASE;
        }

        async function testConnection() {
            const resultEl = document.getElementById('connection-result');
            resultEl.innerHTML = '<div class="pending">测试中...</div>';
            
            try {
                log(`🔍 测试后端连接: ${API_BASE}`);
                
                const response = await fetch(`${API_BASE}/health`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    resultEl.innerHTML = '<div class="success">✅ 后端连接成功</div>';
                    log(`✅ 连接成功: ${JSON.stringify(data)}`);
                } else {
                    resultEl.innerHTML = `<div class="error">❌ 后端响应错误: ${response.status}</div>`;
                    log(`❌ 响应错误: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                resultEl.innerHTML = '<div class="error">❌ 无法连接到后端</div>';
                log(`❌ 连接失败: ${error.message}`);
                log('💡 请确保后端服务在 http://localhost:8080 运行');
            }
        }

        async function testAuth() {
            log('🔍 测试认证接口...');
            try {
                const response = await fetch(`${API_BASE}/auth/userinfo`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-token'
                    }
                });
                
                log(`认证接口响应: ${response.status} ${response.statusText}`);
                if (response.ok) {
                    const data = await response.json();
                    log(`认证数据: ${JSON.stringify(data, null, 2)}`);
                }
            } catch (error) {
                log(`认证接口错误: ${error.message}`);
            }
        }

        async function testTeams() {
            log('🔍 测试团队接口...');
            try {
                const response = await fetch(`${API_BASE}/team/my-teams`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-token'
                    }
                });
                
                log(`团队接口响应: ${response.status} ${response.statusText}`);
                if (response.ok) {
                    const data = await response.json();
                    log(`团队数据: ${JSON.stringify(data, null, 2)}`);
                }
            } catch (error) {
                log(`团队接口错误: ${error.message}`);
            }
        }

        // 初始化
        updateEnvironment();
        log('🚀 后端连接测试页面已加载');
        log('💡 请确保后端服务在 http://localhost:8080 运行');
    </script>
</body>
</html>
EOF

# 4. 创建快速切换脚本
echo "📜 创建快速切换脚本..."
cat > scripts/switch-env.sh << 'EOF'
#!/bin/bash

# 环境切换脚本
# 使用方法: ./switch-env.sh [mock|backend]

MODE=${1:-mock}

case $MODE in
    "mock")
        echo "🔄 切换到Mock模式..."
        cat > src/.env.development << MOKEOF
# .env.development
VITE_USE_MOCK=true
VITE_API_BASE_URL=http://localhost:8080/api
VITE_AMAP_KEY=30b170859f00b71edbd631aab944129a
MOKEOF
        echo "✅ 已切换到Mock模式"
        ;;
    "backend")
        echo "🔄 切换到后端模式..."
        cat > src/.env.development << BACKENDEOF
# .env.development - 后端联调模式
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8080/api
VITE_AMAP_KEY=30b170859f00b71edbd631aab944129a
BACKENDEOF
        echo "✅ 已切换到后端模式"
        ;;
    *)
        echo "❌ 未知模式: $MODE"
        echo "使用方法: ./switch-env.sh [mock|backend]"
        exit 1
        ;;
esac

echo "🔄 请重启开发服务器: npm run dev"
EOF

chmod +x scripts/switch-env.sh

# 5. 显示后续步骤
echo ""
echo "✅ 环境切换完成！"
echo ""
echo "📋 后续步骤："
echo "1. 确保后端服务在 http://localhost:8080 运行"
echo "2. 重启前端开发服务器: npm run dev"
echo "3. 访问 http://localhost:3000/test-backend-connection.html 测试连接"
echo "4. 查看 backend-integration-guide.md 获取详细指南"
echo ""
echo "🔧 快速切换命令："
echo "  ./scripts/switch-env.sh mock     # 切换到Mock模式"
echo "  ./scripts/switch-env.sh backend  # 切换到后端模式"
echo ""
echo "🧪 测试页面："
echo "  http://localhost:3000/test-backend-connection.html"
echo "  http://localhost:3000/test-teams-api.html"
echo ""