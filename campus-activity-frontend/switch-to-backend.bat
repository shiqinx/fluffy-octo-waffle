@echo off
REM 后端联调环境切换脚本 (Windows版本)
REM 使用方法: switch-to-backend.bat

echo 🚀 开始切换到后端联调模式...

REM 1. 备份当前配置
echo 📦 备份当前开发环境配置...
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"
copy src\.env.development src\.env.development.backup.%timestamp%

REM 2. 修改环境变量
echo 🔧 修改环境配置...
(
echo # .env.development - 后端联调模式
echo VITE_USE_MOCK=false
echo VITE_API_BASE_URL=http://localhost:8080/api
echo VITE_AMAP_KEY=30b170859f00b71edbd631aab944129a
) > src\.env.development

REM 3. 创建scripts目录
if not exist scripts mkdir scripts

REM 4. 创建快速切换脚本
echo 📜 创建快速切换脚本...
(
echo @echo off
echo set MODE=%1
echo if "%MODE%"=="" set MODE=mock
echo.
echo if "%MODE%"=="mock" (
echo     echo 🔄 切换到Mock模式...
echo     (
echo         echo # .env.development
echo         echo VITE_USE_MOCK=true
echo         echo VITE_API_BASE_URL=http://localhost:8080/api
echo         echo VITE_AMAP_KEY=30b170859f00b71edbd631aab944129a
echo     ) ^> src\.env.development
echo     echo ✅ 已切换到Mock模式
echo ^) else if "%MODE%"=="backend" (
echo     echo 🔄 切换到后端模式...
echo     (
echo         echo # .env.development - 后端联调模式
echo         echo VITE_USE_MOCK=false
echo         echo VITE_API_BASE_URL=http://localhost:8080/api
echo         echo VITE_AMAP_KEY=30b170859f00b71edbd631aab944129a
echo     ) ^> src\.env.development
echo     echo ✅ 已切换到后端模式
echo ^) else (
echo     echo ❌ 未知模式: %MODE%
echo     echo 使用方法: %%0 [mock^|backend]
echo     exit /b 1
echo ^)
echo.
echo echo 🔄 请重启开发服务器: npm run dev
) > scripts\switch-env.bat

REM 5. 显示后续步骤
echo.
echo ✅ 环境切换完成！
echo.
echo 📋 后续步骤：
echo 1. 确保后端服务在 http://localhost:8080 运行
echo 2. 重启前端开发服务器: npm run dev
echo 3. 访问 http://localhost:3000/test-backend-connection.html 测试连接
echo 4. 查看 backend-integration-guide.md 获取详细指南
echo.
echo 🔧 快速切换命令：
echo   scripts\switch-env.bat mock     # 切换到Mock模式
echo   scripts\switch-env.bat backend  # 切换到后端模式
echo.
echo 🧪 测试页面：
echo   http://localhost:3000/test-backend-connection.html
echo   http://localhost:3000/test-teams-api.html
echo.
pause