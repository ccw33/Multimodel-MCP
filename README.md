# GLM-4.5V MCP Server

GLM-4.5V 多模态能力的 MCP 服务器，提供图像处理、视觉查询和文件处理功能。

## 功能

- **read_image**: 读取本地/URL图片并返回 dataURL 与尺寸信息
- **vision_query**: 调用 GLM-4.5V 对图片进行 OCR/问答/检测
- **process_file**: 使用 GLM-4.5V 处理文件（上传并提取内容）

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

或使用启动脚本：
```bash
./start-mcp.sh
```

## 开发模式

```bash
npm run dev
```

## 测试功能

创建测试文件并验证功能：
```bash
node scripts/test-file-processing.js
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

### process_file
使用 GLM-4.5V 处理文件，支持多种格式的文件上传和内容提取。

**支持的文件格式：**
- 文档：PDF、DOCX、DOC、XLS、XLSX、PPT、PPTX、CSV、TXT
- 图片：PNG、JPG、JPEG

**文件大小限制：**
- 图片文件：最大 5MB
- 其他文件：最大 50MB

参数：
- `filePath` (必需): 本地文件路径
- `extractPrompt` (可选): 内容提取提示词，用于指导如何提取文件内容

返回结果：
```json
{
  "ok": true,
  "fileId": "file-xxx",
  "content": "提取的文件内容...",
  "fileType": "PDF文档",
  "filename": "document.pdf",
  "metadata": {
    "uploadTime": 1234567890,
    "fileSize": 1024000,
    "processingTime": 5000
  }
}
```

## 使用示例

### 处理 PDF 文档
```bash
# 通过 MCP 调用
{
  "tool": "process_file",
  "arguments": {
    "filePath": "./documents/report.pdf",
    "extractPrompt": "请提取文档中的主要内容和关键信息"
  }
}
```

### 处理 Excel 表格
```bash
{
  "tool": "process_file",
  "arguments": {
    "filePath": "./data/sales.xlsx",
    "extractPrompt": "请分析表格数据并总结销售趋势"
  }
}
```