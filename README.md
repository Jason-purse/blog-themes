# blog-themes

AI Blog 官方主题与插件注册表。

## 目录结构

```
registry.json          ← 唯一信任来源，所有主题/插件的目录
themes/                ← 主题包
  editorial/
    plugin.json        ← 主题清单
    index.css          ← CSS 变量（主题唯一格式）
plugins/               ← 功能插件包
  reading-progress/
    plugin.json        ← 插件清单（formats / slots / checksums）
    css/index.css      ← CSS-only 格式（scroll-driven animation）
    webcomponent/      ← WebComponent 格式（兼容所有浏览器）
      index.js
```

## 插件格式规范

每个插件目录必须包含 `plugin.json`：

```json
{
  "id": "my-plugin",
  "name": "插件名称",
  "version": "1.0.0",
  "type": "plugin",
  "formats": {
    "css":          { "entry": "css/index.css" },
    "webcomponent": { "entry": "webcomponent/index.js", "element": "custom-element-name" }
  },
  "slots": ["before-content"],
  "config": {
    "color": { "type": "string", "default": "var(--accent)" }
  },
  "checksums": {
    "css/index.css":         "sha256:...",
    "webcomponent/index.js": "sha256:..."
  }
}
```

## Slot 位置

| Slot | 位置 |
|---|---|
| `before-content` | 文章正文之前 |
| `after-content`  | 文章正文之后 |
| `sidebar`        | 侧边栏 |
| `head`           | `<head>` 内（Analytics 等） |

## 安全

- 只有 `registry.json` 中 `verified: true` 的条目才能安装
- 每个文件都有 sha256 checksum，加载时验证
- WebComponent 通过 Shadow DOM 隔离样式

## 添加新插件/主题

1. 在 `plugins/` 或 `themes/` 下创建目录
2. 写 `plugin.json` + 实现文件
3. 生成 checksums：`node -e "const c=require('crypto'),fs=require('fs'); console.log('sha256:'+c.createHash('sha256').update(fs.readFileSync('file')).digest('hex'))"`
4. 在 `registry.json` 中添加条目（`verified: true`）
5. Push → 博客 Admin 插件商店自动显示
