# 莉莉丝跨会话协作 — 第 2 轮指令

## ✅ 已推送的新修复（commit e883bb0）

**Root cause**：`index.css` 只有 `:root` 块（dark 变量），完全没有 `.dark` / light 选择器。
ThemeProvider 点击时正确切换 `<html class="dark">`，但 CSS 没有响应——所以按钮点了"没反应"（视觉没变）。

**修复内容**：
- `src/index.css`：把现有 `:root` 块作为 dark 默认，新增 `:root:not(.dark)` light 主题覆盖（accent #D97706, bg #FAFAF9, text #1C1917, 等全部 18 个变量）
- `src/components/Toolbar.tsx` line 26：`color: '#1c1c1a'` → `var(--accent-text)`，让生成按钮的文字色彩随主题联动

push 回执：`e883bb0 main -> main` ✅

---

## ⚠️ 你还需要做的（5 项）

### 1. 写死颜色审计（系统性排查）

```
grep -rnE "color: '#|background: '#|bg-\[#[0-9a-fA-F]" src/
```

把所有硬编码 Hex 颜色值替换为 CSS 变量引用：
- `color: 'var(--text-1)'` / `background: 'var(--bg-1)'` 等
- SVG 的 `stroke` 设 `currentColor` 让 inline style 覆盖

### 2. SVG 的 `currentColor` 联动

- `src/components/Uploader.tsx` line 62 的 SVG `stroke` 用了 `currentColor` ✓
- `src/components/Sections.tsx` 的 SVG 请确认也用了 `currentColor`，不要写死 stroke hex

### 3. 页面背景色在 light 态也应响应主题

检查 `body` / `#root` 有没有写死 `background: '#0C0A09'`。应该是 `background: var(--bg)` 或 `background: var(--bg-0)` 才对。

### 4. `prefers-color-scheme` 初始态 SSR 守卫

ThemeProvider 的 `getInitial()` 在第 11 行用 `window.matchMedia('(prefers-color-scheme: dark)')`——这个逻辑在 SSR/hydration 前就跑了，Server 端会抛 `window is not defined` 错误。

**需要加 `typeof window !== 'undefined'` 守卫**。

### 5. 修复未闭合 section（JSX 闭合标签不匹配）

App.tsx 第 215 行的 `<section aria-label="文件上传">` 现在被 `</div>` 闭合（对应旧结构），需要改成 `</section>`。

---

## 📋 验收 Checklist（完成后逐项跑）

```
1. grep 写死颜色 → 0 处硬编码 Hex
2. grep src/components/Sections.tsx stroke hex → 0 处
3. npm run build ✓
4. npx tsc -b --noEmit ✓
5. git add -A && git commit && git push origin main
```

修完告诉我 commit hash + build 时间。

---

## 弟弟手机 DNS 问题

国内运营商对 `github.io` 的 DNS 污染。让弟弟改 DNS：
- **安卓**: WLAN → 长按 Wi-Fi → 修改网络 → IP 静态 → DNS1 `223.5.5.5` / DNS2 `1.0.0.1`
- 或换 UC/QQ 浏览器（内置海外加速）
- 或 Wi-Fi ↔ 流量互切

GitHub Actions 部署约 2-3 分钟后可见。
