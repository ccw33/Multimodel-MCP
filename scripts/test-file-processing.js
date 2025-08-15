#!/usr/bin/env node

/**
 * 测试文件处理功能的脚本
 * 用于验证 GLM-4.5V 文件处理 MCP 工具的功能
 */

import fs from 'fs/promises';
import path from 'path';

// 创建测试文件
async function createTestFiles() {
  const testDir = './test-files';
  
  try {
    await fs.mkdir(testDir, { recursive: true });
    
    // 创建一个简单的 CSV 测试文件
    const csvContent = `姓名,年龄,城市,职业
张三,25,北京,工程师
李四,30,上海,设计师
王五,28,广州,产品经理
赵六,32,深圳,数据分析师`;
    
    await fs.writeFile(path.join(testDir, 'test-data.csv'), csvContent, 'utf8');
    
    // 创建一个简单的文本文件
    const txtContent = `这是一个测试文档。

主要内容包括：
1. 项目概述
2. 技术架构
3. 实施计划

项目概述：
本项目旨在开发一个基于 GLM-4.5V 的多模态文件处理系统，
支持多种文件格式的智能解析和内容提取。

技术架构：
- 前端：MCP 协议接口
- 后端：GLM-4.5V API
- 存储：文件上传和管理

实施计划：
第一阶段：基础功能开发
第二阶段：功能测试和优化
第三阶段：部署和上线`;
    
    await fs.writeFile(path.join(testDir, 'test-document.txt'), txtContent, 'utf8');
    
    console.log('✅ 测试文件创建成功:');
    console.log(`   📄 ${testDir}/test-data.csv`);
    console.log(`   📄 ${testDir}/test-document.txt`);
    console.log('');
    console.log('🔧 使用方法:');
    console.log('1. 确保 GLM_API_KEY 已配置');
    console.log('2. 启动 MCP 服务器: npm start');
    console.log('3. 通过 MCP 客户端调用 process_file 工具');
    console.log('');
    console.log('📝 示例调用:');
    console.log(JSON.stringify({
      tool: "process_file",
      arguments: {
        filePath: "./test-files/test-data.csv",
        extractPrompt: "请分析这个CSV文件的数据结构和内容"
      }
    }, null, 2));
    
  } catch (error) {
    console.error('❌ 创建测试文件失败:', error.message);
  }
}

// 检查环境配置
async function checkEnvironment() {
  console.log('🔍 检查环境配置...');
  
  // 检查 .env 文件
  try {
    await fs.access('.env');
    console.log('✅ .env 文件存在');
  } catch {
    console.log('⚠️  .env 文件不存在，请创建并配置 GLM_API_KEY');
  }
  
  // 检查构建文件
  try {
    await fs.access('./dist/index.js');
    console.log('✅ 构建文件存在');
  } catch {
    console.log('⚠️  构建文件不存在，请运行: npm run build');
  }
  
  console.log('');
}

async function main() {
  console.log('🚀 GLM-4.5V 文件处理功能测试');
  console.log('='.repeat(50));
  
  await checkEnvironment();
  await createTestFiles();
  
  console.log('='.repeat(50));
  console.log('✨ 准备完成！现在可以测试文件处理功能了。');
}

main().catch(console.error);
