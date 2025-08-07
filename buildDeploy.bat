@echo off
setlocal enabledelayedexpansion

:: Step 1: 建立 build 並輸出 dist/
echo === Building Project ===
npm run build

:: Step 2: 新增 worktree 到 dist-deploy 資料夾，指向 build 分支
echo === Adding worktree ===
git worktree add dist-deploy build

:: Step 3: 進入 worktree 資料夾
cd dist-deploy

:: Step 4: 清空目前的內容
echo === Cleaning dist-deploy folder ===
del /f /q * 2>nul
for /d %%i in (*) do rd /s /q "%%i"

:: Step 5: 複製 dist 的內容進來
echo === Copying dist files ===
xcopy /e /i /y ..\dist\* .\ >nul

:: Step 6: 建立 .gitignore
echo node_modules/ > .gitignore

:: Step 7: 提交並推送
echo === Committing and pushing ===
git add .
git commit -m "deploy %date% %time%"
git push origin build --force

:: Step 8: 返回原本目錄並移除 worktree
cd ..
git worktree remove dist-deploy --force

echo === Done ===
endlocal
pause
