# Bytenote MCP Server

GLM-4.5V 视觉能力的 MCP 服务器，提供图像读取和视觉查询功能。

## 功能

- **read_image**: 读取本地/URL图片并返回 dataURL 与尺寸信息
- **vision_query**: 调用 GLM-4.5V 对图片进行 OCR/问答/检测

## 安装

```bash
npm install
```

## 配置

复制环境变量文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 GLM API Key：
```
GLM_API_KEY=your_api_key_here
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
```

## 构建

```bash
npm run build
```

## 运行

```bash
npm start
```

## 开发模式

```bash
npm run dev
```

## 工具说明

### read_image
读取图片并返回 base64 编码的 dataURL。

参数：
- `path` (必需): 图片路径或URL
- `maxSide` (可选): 最大边长，用于缩放

### vision_query
使用 GLM-4.5V 分析图片。

参数：
- `path` (必需): 图片路径或URL
- `prompt` (必需): 查询提示词
- `mode` (可选): 查询模式 ("describe", "ocr", "qa", "detect")
- `returnJson` (可选): 是否返回JSON格式结果