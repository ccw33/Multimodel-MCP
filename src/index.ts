import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import sharp from "sharp";

const mcpServer = new McpServer({
  name: "gusheng-toolbox",
  version: "0.1.0",
});

interface ImageResult {
  ok: boolean;
  image?: {
    source: string;
    mime: string;
    dataUrl: string;
    width?: number;
    height?: number;
  };
  error?: string;
}

interface VisionResult {
  ok: boolean;
  result?: string | object;
  error?: string;
  metadata?: {
    mode: string;
    returnJson: boolean;
    timestamp: number;
  };
}

// 注册图片读取工具
mcpServer.registerTool("read_image", {
  description: "读取本地/URL图片并返回 dataURL 与尺寸信息",
  inputSchema: {
    path: z.string().describe("图片路径或URL"),
    maxSide: z.number().optional().describe("最大边长，用于缩放"),
  },
}, async ({ path: imagePath, maxSide }) => {
  try {
    const result = await readImage(imagePath, maxSide);
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          ok: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }, null, 2)
      }],
      isError: true
    };
  }
});

// 注册视觉查询工具
mcpServer.registerTool("vision_query", {
  description: "调用 GLM-4.5V 对图片进行 OCR/问答/检测",
  inputSchema: {
    path: z.string().describe("图片路径或URL"),
    prompt: z.string().describe("查询提示词"),
    mode: z.enum(["describe", "ocr", "qa", "detect"]).default("describe").describe("查询模式"),
    returnJson: z.boolean().default(false).describe("是否返回JSON格式结果"),
  },
}, async ({ path: imagePath, prompt, mode, returnJson }) => {
  try {
    const result = await visionQuery(imagePath, prompt, mode, returnJson);
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          ok: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }, null, 2)
      }],
      isError: true
    };
  }
});

// 图片压缩函数
async function compressImage(buffer: Buffer, maxSide: number = 1024, quality: number = 80): Promise<Buffer> {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    let width = metadata.width || 1024;
    let height = metadata.height || 1024;
    
    // 计算缩放比例
    if (width > maxSide || height > maxSide) {
      const ratio = Math.min(maxSide / width, maxSide / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    
    return await image
      .resize(width, height, { fit: 'inside' })
      .jpeg({ quality, progressive: true })
      .toBuffer();
  } catch (error) {
    console.error("Image compression failed:", error);
    return buffer; // 失败时返回原始buffer
  }
}

async function readImage(imagePath: string, maxSide?: number): Promise<ImageResult> {
  try {
    console.error(`[DEBUG] readImage called with path: ${imagePath.substring(0, 50)}...`);
    console.error(`[DEBUG] Path starts with data:? ${imagePath.startsWith("data:")}`);
    
    let buffer: Buffer;

    if (imagePath.startsWith("data:")) {
      // Data URL 格式
      console.error(`[DEBUG] Processing data URL in readImage`);
      const commaIndex = imagePath.indexOf(',');
      if (commaIndex === -1) {
        throw new Error("Invalid data URL format: no comma found");
      }
      const base64Data = imagePath.substring(commaIndex + 1);
      if (!base64Data) {
        throw new Error("Invalid data URL format: no base64 data");
      }
      console.error(`[DEBUG] Base64 data length: ${base64Data.length}`);
      buffer = Buffer.from(base64Data, 'base64');
    } else if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      // HTTP/HTTPS URL图片
      console.error(`[DEBUG] Fetching HTTP/HTTPS image`);
      const response = await fetch(imagePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      buffer = Buffer.from(await response.arrayBuffer());
    } else {
      // 本地文件
      console.error(`[DEBUG] Reading local file: ${imagePath}`);
      const resolvedPath = path.resolve(imagePath);
      buffer = await fs.readFile(resolvedPath);
    }

    console.error(`[DEBUG] Original buffer size: ${buffer.length}`);
    // 压缩图片
    const compressedBuffer = await compressImage(buffer, maxSide || 1024);
    console.error(`[DEBUG] Compressed buffer size: ${compressedBuffer.length}`);
    
    const mime = "image/jpeg"; // 压缩后统一为 JPEG 格式
    const dataUrl = `data:${mime};base64,${compressedBuffer.toString("base64")}`;

    return {
      ok: true,
      image: {
        source: imagePath,
        mime,
        dataUrl,
        width: (await sharp(compressedBuffer).metadata()).width,
        height: (await sharp(compressedBuffer).metadata()).height
      }
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

async function visionQuery(imagePath: string, prompt: string, mode: string, returnJson: boolean): Promise<VisionResult> {
  try {
    let imageBase64: string;

    let buffer: Buffer;
    
    if (imagePath.startsWith("data:")) {
      // Data URL 格式
      const base64Data = imagePath.split(',')[1];
      if (!base64Data) {
        throw new Error("Invalid data URL format");
      }
      buffer = Buffer.from(base64Data, 'base64');
    } else if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      // HTTP/HTTPS URL图片
      const response = await fetch(imagePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      buffer = Buffer.from(await response.arrayBuffer());
    } else {
      // 本地文件
      const resolvedPath = path.resolve(imagePath);
      buffer = await fs.readFile(resolvedPath);
    }
    
    // 压缩图片以减少token使用量
    const compressedBuffer = await compressImage(buffer, 800, 75); // 更小尺寸和质量
    imageBase64 = compressedBuffer.toString("base64");

    const payload = buildGlmPayload({
      prompt,
      imageBase64,
      mode,
      returnJson
    });

    const glmBaseUrl = process.env.GLM_BASE_URL || "https://open.bigmodel.cn/api/paas/v4/chat/completions";
    const glmApiKey = process.env.GLM_API_KEY;

    if (!glmApiKey) {
      throw new Error("GLM_API_KEY environment variable is required");
    }

    const response = await fetch(glmBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${glmApiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`GLM API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const result = normalizeGlmResult(data, { mode, returnJson });

    return {
      ok: true,
      result,
      metadata: {
        mode,
        returnJson,
        timestamp: Date.now()
      }
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

function guessExt(imagePath: string): string {
  const ext = imagePath.split(".").pop()?.toLowerCase() || "png";
  return ext === "jpg" ? "jpeg" : ext;
}

function truncatePrompt(prompt: string, maxLength: number = 500): string {
  if (prompt.length <= maxLength) return prompt;
  return prompt.substring(0, maxLength) + "...";
}

function buildGlmPayload(opts: {
  prompt: string;
  imageBase64: string;
  mode: string;
  returnJson: boolean;
}) {
  const { prompt, imageBase64, mode, returnJson } = opts;
  
  // 截断过长的 prompt
  const truncatedPrompt = truncatePrompt(prompt, 300);
  
  let systemPrompt = "";
  switch (mode) {
    case "ocr":
      systemPrompt = "识别图片中的文字。";
      break;
    case "qa":
      systemPrompt = "根据图片回答问题。";
      break;
    case "detect":
      systemPrompt = "识别图片中的物体。";
      break;
    default:
      systemPrompt = "描述图片内容。";
  }

  if (returnJson) {
    systemPrompt += "用JSON格式回答。";
  }

  return {
    model: "glm-4v-plus",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: truncatedPrompt
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ]
      }
    ],
    temperature: 0.1,
    max_tokens: 1000
  };
}

function normalizeGlmResult(data: any, opts: { mode: string; returnJson: boolean }) {
  if (data.error) {
    throw new Error(data.error.message || "GLM API error");
  }

  const content = data.choices?.[0]?.message?.content || "";
  
  if (opts.returnJson) {
    try {
      return JSON.parse(content);
    } catch {
      return { text: content, parsed: false };
    }
  }

  return content;
}

async function main() {
  // 显示 MCP 服务器配置信息
  console.error("=".repeat(60));
  console.error("🚀 Bytenote MCP Server");
  console.error("=".repeat(60));
  console.error(`📦 Server Name: glv`);
  console.error(`🔖 Version: 0.1.0`);
  console.error(`📡 Transport: StdioServerTransport`);
  console.error(`🔧 Available Tools:`);
  console.error(`   • read_image - 读取本地/URL图片并返回 dataURL 与尺寸信息`);
  console.error(`   • vision_query - 调用 GLM-4.5V 对图片进行 OCR/问答/检测`);
  console.error(`🌐 GLM API Endpoint: ${process.env.GLM_BASE_URL || "https://open.bigmodel.cn/api/paas/v4/chat/completions"}`);
  console.error(`🔑 API Key Status: ${process.env.GLM_API_KEY ? "✅ Configured" : "❌ Missing"}`);
  
  if (!process.env.GLM_API_KEY) {
    console.error(`⚠️  Warning: GLM_API_KEY not found in environment variables`);
    console.error(`   Please set your API key in .env file`);
  }
  
  console.error("=".repeat(60));
  console.error("🔄 Starting MCP server...");
  
  await mcpServer.connect(new StdioServerTransport());
  
  console.error("✅ MCP server connected and ready!");
  console.error("=".repeat(60));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}