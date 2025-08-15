# GLM-4.5V MCP 服务器使用指南

## 概述

本 MCP 服务器提供了 GLM-4.5V 多模态模型的文件处理能力，支持多种文件格式的智能解析和内容提取。

## 快速开始

### 1. 环境配置

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 GLM API Key
```

### 2. 构建和启动

```bash
# 构建项目
npm run build

# 启动服务器
npm start
```

### 3. 创建测试文件

```bash
# 运行测试脚本创建示例文件
node scripts/test-file-processing.js
```

## 工具详解

### process_file - 文件处理工具

这是新增的核心功能，能够处理多种格式的文件并提取内容。

**支持的文件格式：**
- 📄 文档：PDF、DOCX、DOC、XLS、XLSX、PPT、PPTX、CSV、TXT
- 🖼️ 图片：PNG、JPG、JPEG

**文件大小限制：**
- 图片文件：≤ 5MB
- 其他文件：≤ 50MB

**调用示例：**

```json
{
  "tool": "process_file",
  "arguments": {
    "filePath": "./test-files/test-data.csv",
    "extractPrompt": "请分析这个CSV文件的数据结构和内容"
  }
}
```

**返回结果：**

```json
{
  "ok": true,
  "fileId": "file-abc123",
  "content": "文件内容解析结果...",
  "fileType": "CSV数据文件",
  "filename": "test-data.csv",
  "metadata": {
    "uploadTime": 1703123456789,
    "fileSize": 1024,
    "processingTime": 2500
  }
}
```

## 使用场景

### 1. 文档内容提取

```json
{
  "tool": "process_file",
  "arguments": {
    "filePath": "./documents/report.pdf",
    "extractPrompt": "请提取文档的主要内容、关键数据和结论"
  }
}
```

### 2. 表格数据分析

```json
{
  "tool": "process_file",
  "arguments": {
    "filePath": "./data/sales.xlsx",
    "extractPrompt": "请分析销售数据的趋势和异常值"
  }
}
```

### 3. 演示文稿总结

```json
{
  "tool": "process_file",
  "arguments": {
    "filePath": "./presentations/quarterly-review.pptx",
    "extractPrompt": "请总结演示文稿的主要观点和结论"
  }
}
```

### 4. 图片内容识别

```json
{
  "tool": "process_file",
  "arguments": {
    "filePath": "./images/chart.png",
    "extractPrompt": "请识别图片中的图表数据和趋势"
  }
}
```

## 错误处理

常见错误及解决方案：

1. **文件大小超限**
   ```
   错误：文件大小超过限制。图片文件最大5MB，其他文件最大50MB
   解决：压缩文件或分割大文件
   ```

2. **不支持的文件格式**
   ```
   错误：不支持的文件格式
   解决：转换为支持的格式（PDF、DOCX、XLS等）
   ```

3. **API Key 未配置**
   ```
   错误：GLM_API_KEY environment variable is required
   解决：在 .env 文件中配置正确的 API Key
   ```

4. **文件不存在**
   ```
   错误：文件路径不存在
   解决：检查文件路径是否正确
   ```

## 性能优化建议

1. **文件大小**：尽量使用较小的文件以提高处理速度
2. **提示词**：使用具体明确的 extractPrompt 以获得更好的结果
3. **批量处理**：对于多个文件，建议逐个处理而非并发

## 技术架构

```
用户 → MCP 客户端 → MCP 服务器 → GLM 文件 API
                      ↓
                 文件上传 + 内容提取
                      ↓
                   结构化结果返回
```

## 开发和调试

### 启用调试模式

服务器会在 stderr 输出详细的调试信息，包括：
- 文件上传进度
- API 调用状态
- 处理时间统计

### 日志示例

```
[DEBUG] processFile called with path: ./test-files/test-data.csv
[DEBUG] File size: 1024 bytes, filename: test-data.csv
[DEBUG] Uploading file...
[DEBUG] File uploaded with ID: file-abc123
[DEBUG] Getting file content...
[DEBUG] Content extracted, length: 2048
```

## 更多信息

- 项目仓库：[GitHub](https://github.com/your-repo)
- GLM API 文档：[智谱AI开放平台](https://bigmodel.cn/)
- MCP 协议：[Model Context Protocol](https://modelcontextprotocol.io/)
