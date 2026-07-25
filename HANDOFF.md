# 莉莉丝跨会话协作 — 第 2 轮指令

## ✅ 已推送的新修复（commit e883bb0 → 637c2ec）

**Root cause**：`index.css` 只有 `:root` 块（dark 变量），完全没有 `.dark` / light 选择器。
ThemeProvider 点击时正确切换 `<html class="dark">`，但 CSS 没有响应——所以按钮点了"没反应"（视觉没变）。

**修复内容（3 个 commit）**：

### commit `e883bb0` — light 主题根变量
- `src/index.css`：把现有 `:root` 块作为 dark 默认，新增 `:root:not(.dark)` light 主题覆盖
  （accent #D97706, bg #FAFAF9, text #1C1917, 等全部 18 个变量）
- `src/components/Toolbar.tsx:26`：`color: '#1c1c1a'` → `var(--accent-text)`，让生成按钮的文字色彩随主题联动

### commit `637c2ec` — 写死颜色清扫
- `src/index.css:362` `.mode-pill button.active`：`#1c1c1a` → `var(--accent-text)` （light 态 accent 是深橙，需白字）
- `src/index.css:515-526` `.progress-pill*`：`#1c1c1a`/`rgba(28,28,26,..)` → `var(--text-1)` / `var(--bg-3)` / `var(--accent)`
- `src/components/Toolbar.tsx:39` SVG `stroke='#1c1c1a'` → `'currentColor'` 让下载箭头继承按钮色

### 保留不动的硬编码颜色
- `src/index.css:321` `.img-card .page-number` 的 `color:#fff; background:rgba(0,0,0,0.65)`：
  这是图片缩略图上的页码徽章覆盖层，黑底白字在 dark/light 两种主题下都正确

push 回执：`637c2ec 6d26d6c..637c2ec  main -> main` ✅

---

## 📋 验收回执

| 检查项 | 结果 |
|---|---|
| `grep -rnE 'color: #[0-9a-fA-F]' src/` | ✅ 只剩 `.img-card .page-number` 1 处（保留） |
| `grep -rnE 'stroke="#[0-9a-fA-F]{3,6}"' src/` | ✅ 0 处 |
| `npm run build` | ✅ 4.40s |
| `npx tsc -b --noEmit` | ✅ 0 errors |

---

## ⚠️ 你还需要做的（剩余 1 项，其他都已完成）

### ✅ 写死颜色审计 — 已完成（commit 637c2ec）
### ✅ SVG `currentColor` 联动 — 已完成（Toolbar.tsx 已修）
### ✅ body / #root 写死背景 — 已确认无问题
### ✅ ThemeProvider SSR `window` 守卫 — 已确认存在（line 11: `typeof window !== 'undefined'`）
### ✅ App.tsx 215 行 section 闭合 — 已确认正确闭合

### ⚠️ 1. 实机视觉验收（你这边做，我没法在浏览器里跑）

1. `cd /root/.hermes/workspace/image-to-pdf && npm run dev`（或 `npm run preview`）
2. 浏览器打开 `http://localhost:5173/`
3. 点击右上角小月亮/小太阳图标
4. 确认：
   - 整体背景从 black → cream 切换
   - 文字从 white → dark stone 切换
   - 生成按钮从 亮黄字黑 → 深橙字白
   - mode-pill 切换器颜色同样联动
   - **这是关键：之前点击没反应 → 现在必须有视觉变化**

### ✅ 弟弟手机 DNS 问题 — 已写在上一条指令中

---

## 现在的总体状态

主题切换功能：
- **代码侧**：100% 就位（ThemeProvider + ThemeToggle + useTheme + CSS light 主题块 + 全部变量联动）
- **部署侧**：等你 push 后 GitHub Pages 2-3 分钟内可见
- **弟弟访问**：让弟弟清浏览器缓存 / 改 DNS / Wi-Fi ↔ 流量互切

不要再修代码了。任务进入实机验收阶段。当你确认视觉变化正常 + 弟弟能看到新版本 → 任务结束。

如果点击 toggle 还没视觉变化，截图发给我，莉莉丝继续 debug。
