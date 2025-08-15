#!/bin/bash
# Bytenote MCP Server 启动脚本

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 从.env文件加载环境变量
if [ -f "$SCRIPT_DIR/.env" ]; then
    # 使用source加载.env文件，但过滤掉注释和空行
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | grep -v '^$' | xargs)
else
    echo "错误: 找不到.env文件"
    exit 1
fi

# 检查必要的环境变量是否已设置
if [ -z "$GLM_API_KEY" ]; then
    echo "错误: 请在.env文件中设置GLM_API_KEY"
    exit 1
fi

if [ -z "$GLM_BASE_URL" ]; then
    echo "错误: 请在.env文件中设置GLM_BASE_URL"
    exit 1
fi

# 设置Node.js路径，如果.env中没有设置则使用默认路径
if [ -z "$node_path" ]; then
    # 尝试找到node的路径
    NODE_PATH=$(which node)
    if [ -z "$NODE_PATH" ]; then
        # 如果找不到，尝试常见路径
        if [ -f "/opt/homebrew/bin/node" ]; then
            NODE_PATH="/opt/homebrew/bin/node"
        elif [ -f "/usr/local/bin/node" ]; then
            NODE_PATH="/usr/local/bin/node"
        else
            echo "错误: 找不到Node.js，请在.env文件中设置node_path"
            exit 1
        fi
    fi
else
    NODE_PATH="$node_path"
fi

# 设置index.js路径，基于脚本位置
INDEX_PATH="$SCRIPT_DIR/dist/index.js"

# 检查index.js文件是否存在
if [ ! -f "$INDEX_PATH" ]; then
    echo "错误: 找不到$INDEX_PATH文件"
    echo "请确保项目已经构建完成"
    exit 1
fi

echo "启动GLM-V-MCP服务器..."
echo "Node.js路径: $NODE_PATH"
echo "Index.js路径: $INDEX_PATH"
echo "GLM_BASE_URL: $GLM_BASE_URL"

# 启动服务器
exec "$NODE_PATH" "$INDEX_PATH"