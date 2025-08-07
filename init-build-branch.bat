:: Step 1: 切換到 main 分支（確保你現在在 main）
git switch main

:: Step 2: 建立一個新的孤兒分支 build（沒有任何歷史）
git switch --orphan build

:: Step 3: 移除所有檔案（在索引與工作目錄）
git rm -rf . >nul 2>&1

:: Step 4: 建立一個 .gitignore（可選）
echo node_modules/ > .gitignore

:: Step 5: 加入並提交
git add .
git commit -m "Initial build branch"

:: Step 6: 推送到遠端（會建立 origin/build 分支）
git push origin build

:: Step 7: 回到 main 分支
git switch main
