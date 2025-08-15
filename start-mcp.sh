#!/bin/bash
# Bytenote MCP Server 启动脚本

# 设置环境变量
# 请设置您的GLM API密钥
export GLM_API_KEY="da89ad7a117942c295a3679c743b6fa9.1ijMFhaqiSbSynYU"
export GLM_BASE_URL="https://open.bigmodel.cn/api/paas/v4/chat/completions"

# 检查API密钥是否已设置
if [ -z "$GLM_API_KEY" ]; then
    echo "错误: 请设置GLM_API_KEY环境变量"
    echo "使用方法: export GLM_API_KEY=\"your_api_key_here\""
    exit 1
fi

# 使用完整路径启动服务器
exec /opt/homebrew/bin/node /Users/yuanyuan/Desktop/MyProject/glm-v-mcp/dist/index.js