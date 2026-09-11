@echo off
rem 苍穹外卖管理端一键启动（双击运行）
chcp 936 >nul
cd /d "%~dp0"
if not exist node_modules (
  echo [首次运行] 正在安装依赖，需要几分钟，请耐心等待...
  call npm install
)
set NODE_OPTIONS=--openssl-legacy-provider
echo 正在启动管理端开发服务器，端口 8888，浏览器访问 http://localhost:8888
echo 启动完成后请不要关闭本窗口，按 Ctrl+C 或直接关窗口即可停止。
call npm run serve
pause
