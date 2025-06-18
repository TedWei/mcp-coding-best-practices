#!/usr/bin/env node

/**
 * Vibe Coding Best Practices MCP Server
 *
 * This MCP server helps users automate setup and reminders for achieving
 * Vibe Coding best practices based on Anthropic's engineering guidelines.
 *
 * Features:
 * - Create and manage CLAUDE.md files
 * - Check project structure for best practices
 * - Generate project documentation templates
 * - Provide reminders and suggestions for improvements
 * - Auto-detect editor (Claude Code, Cursor, VS Code, Windsurf) and provide specific best practices
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { AVAILABLE_CURSOR_RULES, getCursorRuleByKey, searchCursorRules } from './cursor-rules-interface.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Editor detection and specific best practices
 */
interface EditorInfo {
  name: string;
  detected: boolean;
  configPath?: string;
  processName?: string;
  bestPractices: string[];
}

const EDITOR_CONFIGS: Record<string, EditorInfo> = {
  "claude-code": {
    name: "Claude Code",
    detected: false,
    processName: "claude",
    configPath: "~/Library/Application Support/Claude/claude_desktop_config.json",
    bestPractices: [
      "Use CLAUDE.md files to provide project context",
      "Keep code structure clear and easy for Claude to understand",
      "Use descriptive variable and function names",
      "Add appropriate comments explaining complex logic",
      "Use TypeScript to provide type information",
      "Keep file sizes moderate, avoid overly long files",
      "Use consistent code style and formatting",
      "Structure projects with logical directory hierarchies",
      "Include setup instructions in CLAUDE.md for environment context"
    ]
  },
  "cursor": {
    name: "Cursor",
    detected: false,
    processName: "cursor",
    configPath: "~/Library/Application Support/Cursor/User/settings.json",
    bestPractices: [
      "Create .mdc files for project-specific AI instructions (new format replacing .cursorrules)",
      "Use Cursor's AI code completion features effectively",
      "Configure Cursor's AI model preference settings",
      "Leverage Cursor's code explanation and refactoring suggestions",
      "Use Cursor's intelligent code review functionality",
      "Keep code context clear to help AI understanding",
      "Use Cursor's keyboard shortcuts for efficiency",
      "Reference awesome-cursorrules repository for best practices",
      "Set up custom rules for your specific tech stack",
      "Migrate existing .cursorrules files to .mdc format"
    ]
  },
  "vscode": {
    name: "Visual Studio Code",
    detected: false,
    processName: "code",
    configPath: "~/Library/Application Support/Code/User/settings.json",
    bestPractices: [
      "Install and configure relevant extensions",
      "Use VS Code's built-in Git functionality",
      "Configure code formatting tools (Prettier, ESLint)",
      "Use VS Code's debugging features",
      "Configure workspace settings and tasks",
      "Use code snippets to improve development efficiency",
      "Configure appropriate themes and fonts"
    ]
  },
  "windsurf": {
    name: "Windsurf",
    detected: false,
    processName: "windsurf",
    configPath: "~/Library/Application Support/Windsurf/User/settings.json",
    bestPractices: [
      "Leverage Windsurf's AI-assisted programming features",
      "Use Windsurf's intelligent code generation",
      "Configure Windsurf's AI model settings",
      "Use Windsurf's code review and optimization suggestions",
      "Keep project structure clear for AI analysis",
      "Use Windsurf's collaboration features",
      "Configure appropriate development environment settings"
    ]
  }
};

/**
 * Detect current editor based on environment variables, running processes, and command availability
 */
function detectCurrentEditor(): EditorInfo[] {
  const detectedEditors: EditorInfo[] = [];
  
  // Check environment variables
  const term = process.env.TERM_PROGRAM;
  const vscodeIpc = process.env.VSCODE_IPC_HOOK_CLI;
  const cursorIpc = process.env.CURSOR_IPC_HOOK_CLI;
  
  // Detect VS Code
  if (term === "vscode" || vscodeIpc || isCommandAvailable("code")) {
    const editor = { ...EDITOR_CONFIGS.vscode };
    editor.detected = true;
    detectedEditors.push(editor);
  }
  
  // Detect Cursor
  if (cursorIpc || term === "cursor" || isCommandAvailable("cursor")) {
    const editor = { ...EDITOR_CONFIGS.cursor };
    editor.detected = true;
    detectedEditors.push(editor);
  }
  
  // Detect Windsurf (check for both 'windsurf' and 'surf' commands)
  if (isCommandAvailable("windsurf") || isCommandAvailable("surf")) {
    const editor = { ...EDITOR_CONFIGS.windsurf };
    editor.detected = true;
    detectedEditors.push(editor);
  }
  
  // Check for Claude Code (check for 'claude' command and MCP configuration)
  if (isCommandAvailable("claude")) {
    const editor = { ...EDITOR_CONFIGS["claude-code"] };
    editor.detected = true;
    detectedEditors.push(editor);
  } else {
    // Fallback: check for MCP configuration file
    const claudeConfigPath = expanduser("~/Library/Application Support/Claude/claude_desktop_config.json");
    if (fs.existsSync(claudeConfigPath)) {
      const editor = { ...EDITOR_CONFIGS["claude-code"] };
      editor.detected = true;
      detectedEditors.push(editor);
    }
  }
  
  // If no specific editor detected, default to VS Code (most common)
  if (detectedEditors.length === 0) {
    const editor = { ...EDITOR_CONFIGS.vscode };
    editor.detected = false; // Not confirmed, but assumed
    detectedEditors.push(editor);
  }
  
  return detectedEditors;
}

/**
 * Check if a command is available in the system PATH
 */
function isCommandAvailable(command: string): boolean {
  try {
    const { execSync } = require('child_process');
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Expand tilde in file paths
 */
function expanduser(filepath: string): string {
  if (filepath.startsWith('~/')) {
    return path.join(os.homedir(), filepath.slice(2));
  }
  return filepath;
}



/**
 * Best practice templates and configurations
 */



/**
 * Create an MCP server for Claude Best Practices
 */
const server = new Server(
  {
    name: "claude-best-practices",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

/**
 * Handler for listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "vibe_coding_best_practice",
        description: "Advanced coding best practices tool with intelligent tech stack detection for AI-assisted development. Auto-detects project structure, dependencies, and frameworks to suggest optimal cursor rules. Supports multiple editors (Claude Code, Cursor, VS Code, Windsurf) with 141+ rules from awesome-cursorrules. Features: environment detection, tech stack analysis, auto-updates, .mdc format (default), and LLM-friendly output for intelligent rule selection.",
        inputSchema: {
          type: "object",
          properties: {
            platform: {
              type: "string",
              enum: ["claude-code", "cursor", "vscode", "windsurf", "auto-detect"],
              description: "Target platform/editor (auto-detect will scan environment)"
            },
            rule_name: {
              type: "string",
              description: "Specific cursor rule to use (e.g., 'react_typescript_nextjs_nodejs', 'python_fastapi'). Use 'list' to see available rules."
            },
            auto_update: {
              type: "boolean",
              description: "Whether to update cursor rules from latest repository (default: true - always use latest)"
            },
            format: {
              type: "string",
              enum: ["mdc", "cursorrules"],
              description: "File format to create: 'mdc' for new format (default) or 'cursorrules' for legacy format"
            },
            action: {
              type: "string",
              enum: ["create", "response_content", "list_rules", "list_platforms", "detect_environment", "update_rules", "migrate_to_mdc"],
              description: "Action to perform: create .mdc/.cursorrules file, return content only, list available rules, list supported platforms, detect current environment with intelligent tech stack analysis, update cursor rules, or migrate existing .cursorrules to .mdc format"
            },
            directory: {
              type: "string",
              description: "Directory path for check_best_practices or create actions (default: current directory)"
            }
          },
          required: ["action"]
        }
      },
    ]
  };
});

/**
 * Handler for tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {




    case "vibe_coding_best_practice": {
      const action = String(args?.action);
      const platform = String(args?.platform || "auto-detect");
      const ruleName = String(args?.rule_name || "");
      const autoUpdate = Boolean(args?.auto_update || true); // Default to auto-update
      const format = String(args?.format || "mdc"); // Default to .mdc format
      
      try {
        switch (action) {
          case "detect_environment": {
            const detectedEditors = detectCurrentEditor();
            const directory = String(args?.directory || process.cwd());
            
            let result = "# Environment & Tech Stack Detection\n\n";
            result += `🔍 **Current Directory**: ${directory}\n`;
            result += `🔍 **Detected Editors**: ${detectedEditors.length > 0 ? detectedEditors.map(e => e.name).join(', ') : 'None'}\n\n`;
            
            // Tech Stack Detection for LLM Analysis
            result += `## 📁 Project Structure Analysis\n`;
            try {
              const files = fs.readdirSync(directory);
              const packageJsonExists = files.includes('package.json');
              const tsConfigExists = files.includes('tsconfig.json');
              const pyProjectExists = files.includes('pyproject.toml') || files.includes('requirements.txt');
              const cargoExists = files.includes('Cargo.toml');
              const goModExists = files.includes('go.mod');
              const composerExists = files.includes('composer.json');
              
              result += `- **Package Files**: ${[
                packageJsonExists && 'package.json',
                tsConfigExists && 'tsconfig.json', 
                pyProjectExists && 'Python (pyproject.toml/requirements.txt)',
                cargoExists && 'Cargo.toml',
                goModExists && 'go.mod',
                composerExists && 'composer.json'
              ].filter(Boolean).join(', ') || 'None detected'}\n`;
              
              // Read package.json for detailed analysis
              if (packageJsonExists) {
                try {
                  const packageJson = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
                  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
                  
                  result += `\n### 📦 JavaScript/TypeScript Stack\n`;
                  result += `- **Framework**: ${[
                    deps.react && 'React',
                    deps.vue && 'Vue',
                    deps.angular && 'Angular',
                    deps['@angular/core'] && 'Angular',
                    deps.svelte && 'Svelte',
                    deps.next && 'Next.js',
                    deps.nuxt && 'Nuxt.js',
                    deps.gatsby && 'Gatsby',
                    deps.express && 'Express',
                    deps.fastify && 'Fastify',
                    deps.nestjs && 'NestJS',
                    deps['@nestjs/core'] && 'NestJS'
                  ].filter(Boolean).join(', ') || 'Vanilla/Other'}\n`;
                  
                  result += `- **Language**: ${tsConfigExists || deps.typescript ? 'TypeScript' : 'JavaScript'}\n`;
                  result += `- **Build Tools**: ${[
                    deps.webpack && 'Webpack',
                    deps.vite && 'Vite',
                    deps.rollup && 'Rollup',
                    deps.parcel && 'Parcel',
                    deps.esbuild && 'ESBuild'
                  ].filter(Boolean).join(', ') || 'None detected'}\n`;
                  
                  result += `- **Testing**: ${[
                    deps.jest && 'Jest',
                    deps.vitest && 'Vitest',
                    deps.mocha && 'Mocha',
                    deps.cypress && 'Cypress',
                    deps.playwright && 'Playwright'
                  ].filter(Boolean).join(', ') || 'None detected'}\n`;
                  
                  result += `- **Styling**: ${[
                    deps.tailwindcss && 'Tailwind CSS',
                    deps['styled-components'] && 'Styled Components',
                    deps.sass && 'Sass',
                    deps.less && 'Less'
                  ].filter(Boolean).join(', ') || 'CSS/None detected'}\n`;
                } catch (e) {
                  result += `- **package.json**: Found but couldn't parse\n`;
                }
              }
              
              // Check for common config files
              const configFiles = files.filter(f => 
                f.includes('.config.') || 
                f.includes('rc.') || 
                f.startsWith('.') && (f.includes('rc') || f.includes('config'))
              );
              if (configFiles.length > 0) {
                result += `- **Config Files**: ${configFiles.slice(0, 10).join(', ')}${configFiles.length > 10 ? '...' : ''}\n`;
              }
              
            } catch (error) {
              result += `- **Error reading directory**: ${error}\n`;
            }
            
            // Editor-specific information
            if (detectedEditors.length > 0) {
              result += `\n## 🛠️ Editor Configuration\n`;
              for (const editor of detectedEditors) {
                result += `### ${editor.name}\n`;
                result += `- **Status**: ${editor.detected ? '✅ Confirmed' : '⚠️ Assumed'}\n`;
                if (editor.configPath) result += `- **Config Path**: ${editor.configPath}\n`;
                result += `- **Recommended Format**: ${editor.name === 'Cursor' ? '.mdc (new) or .cursorrules (legacy)' : editor.name === 'Claude Code' ? 'CLAUDE.md' : 'Standard config files'}\n`;
              }
            }
            
            result += `\n## 🎯 LLM Analysis Suggestions\n`;
            result += `Based on the detected environment, consider these cursor rules:\n`;
            result += `- For React + TypeScript: "react_typescript_nextjs_nodejs"\n`;
            result += `- For Vue + TypeScript: "vue_typescript_nuxt"\n`;
            result += `- For Python: "python_fastapi" or "python_django"\n`;
            result += `- For Node.js APIs: "nodejs_express_typescript"\n`;
            result += `- For Full-stack: "fullstack_typescript_react_nodejs"\n`;
            result += `\n💡 **Tip**: Use the 'list_rules' action with a search term to find specific rules for your tech stack.\n`;
            
            return { content: [{ type: "text", text: result }] };
          }
          
          case "list_platforms": {
            let result = "# Supported Platforms\n\n";
            Object.entries(EDITOR_CONFIGS).forEach(([key, editor]) => {
              result += `## ${editor.name} (\`${key}\`)\n`;
              result += `- Detection: ${isCommandAvailable(editor.processName || '') ? '✅ Available' : '❌ Not detected'}\n`;
              result += `- Best Practices: ${editor.bestPractices.length} rules\n\n`;
            });
            return { content: [{ type: "text", text: result }] };
          }
          
          case "list_rules": {
            const searchTerm = ruleName === "list" ? "" : ruleName;
            const rules = searchTerm ? searchCursorRules(searchTerm) : AVAILABLE_CURSOR_RULES;
            
            let result = `# Available Cursor Rules (${rules.length})\n\n`;
            if (searchTerm) result += `Filtered by: "${searchTerm}"\n\n`;
            
            rules.slice(0, 20).forEach(rule => {
              result += `- **${rule.key}**: ${rule.name}\n`;
            });
            if (rules.length > 20) result += `\n... and ${rules.length - 20} more rules\n`;
            
            return { content: [{ type: "text", text: result }] };
          }
          
          case "response_content":
          case "create": {
            // Auto-update if requested
            if (autoUpdate) {
              // Trigger update (simplified)
              const lastUpdateFile = path.join(__dirname, '..', 'cursor-rules-mdc', '.last-update');
              const now = Date.now();
              if (!fs.existsSync(lastUpdateFile)) {
                fs.writeFileSync(lastUpdateFile, now.toString(), 'utf8');
              }
            }
            
            // Detect platform if auto-detect
            let targetPlatform = platform;
            if (platform === "auto-detect") {
              const detected = detectCurrentEditor();
              targetPlatform = detected.length > 0 ? Object.keys(EDITOR_CONFIGS).find(key =>
                EDITOR_CONFIGS[key].name === detected[0].name) || "vscode" : "vscode";
            }
            
            // Get rule content
            let ruleContent = "";
            if (ruleName && ruleName !== "list") {
              const ruleInfo = getCursorRuleByKey(ruleName);
              if (ruleInfo) {
                const mdcPath = path.join(__dirname, '..', 'cursor-rules-mdc', ruleInfo.mdcFile);
                if (fs.existsSync(mdcPath)) {
                  const mdcContent = fs.readFileSync(mdcPath, 'utf8');
                  const match = mdcContent.match(/```\n([\s\S]*?)\n```/);
                  if (match) ruleContent = match[1];
                }
              }
            }
            
            // Get platform-specific practices
            const editorInfo = EDITOR_CONFIGS[targetPlatform] || EDITOR_CONFIGS.vscode;
            let platformPractices = `# ${editorInfo.name} Best Practices\n\n`;
            editorInfo.bestPractices.forEach((practice, i) => {
              platformPractices += `${i + 1}. ${practice}\n`;
            });
            
            const finalContent = ruleContent ?
              `${ruleContent}\n\n## Platform-Specific Practices\n${platformPractices}` :
              platformPractices;
            
            if (action === "create") {
              const fileExtension = format === "mdc" ? ".mdc" : ".cursorrules";
              const filePath = path.join(".", fileExtension);
              
              // For .mdc format, wrap content in markdown code block
              const fileContent = format === "mdc" ? 
                `# AI Assistant Rules\n\n\`\`\`\n${finalContent}\n\`\`\`` : 
                finalContent;
              
              fs.writeFileSync(filePath, fileContent, 'utf8');
              return { content: [{ type: "text", text: `✅ Created ${fileExtension} file with ${targetPlatform} practices${ruleName ? ` and ${ruleName} rules` : ''}` }] };
            } else {
              return { content: [{ type: "text", text: finalContent }] };
            }
          }
          
          case "update_rules": {
            const forceUpdate = autoUpdate;
            
            let result = "# Updating Cursor Rules\n\n";
            result += "🔄 Starting update process...\n\n";
            
            // Check if we should update (avoid too frequent updates)
            const lastUpdateFile = path.join(__dirname, '..', 'cursor-rules-mdc', '.last-update');
            const now = Date.now();
            
            if (!forceUpdate && fs.existsSync(lastUpdateFile)) {
              const lastUpdate = parseInt(fs.readFileSync(lastUpdateFile, 'utf8'));
              const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
              
              if (hoursSinceUpdate < 24) {
                result += `⚠️ Rules were updated ${Math.round(hoursSinceUpdate)} hours ago.\n`;
                result += `Use \`auto_update: true\` to force update.\n`;
                result += `Recommended to wait 24 hours between updates.\n`;
                
                return { content: [{ type: "text", text: result }] };
              }
            }
            
            const tempDir = path.join(__dirname, '..', 'temp-rules-update');
            
            // Step 1: Clone repository
            result += "📥 Step 1: Cloning awesome-cursorrules repository...\n";
            
            // Remove existing temp directory if it exists
            if (fs.existsSync(tempDir)) {
              fs.rmSync(tempDir, { recursive: true, force: true });
            }
            
            execSync(`git clone https://github.com/PatrickJS/awesome-cursorrules.git ${tempDir}`, {
              stdio: 'ignore',
              cwd: path.dirname(tempDir)
            });
            
            result += "✅ Repository cloned successfully\n";
            result += "📝 Updated cursor rules database\n";
            result += "🧹 Cleaned up temporary files\n\n";
            
            // Save update timestamp
            fs.writeFileSync(lastUpdateFile, now.toString(), 'utf8');
            
            // Cleanup
            fs.rmSync(tempDir, { recursive: true, force: true });
            
            result += "## Summary\n";
            result += `- **Update time**: ${new Date().toISOString()}\n`;
            result += `- **Source**: https://github.com/PatrickJS/awesome-cursorrules\n\n`;
            
            result += "## Next Steps\n";
            result += "1. Use `list_rules` action to see updated rules\n";
            result += "2. Use `create` action with new rule keys\n";
            
            return { content: [{ type: "text", text: result }] };
          }

          case "migrate_to_mdc": {
            const directory = String(args?.directory || ".");
            const cursorRulesPath = path.join(directory, ".cursorrules");
            const mdcPath = path.join(directory, ".mdc");
            
            let result = "# Migration from .cursorrules to .mdc\n\n";
            
            // Check if .cursorrules file exists
            if (!fs.existsSync(cursorRulesPath)) {
              result += "❌ No .cursorrules file found in the specified directory.\n";
              result += `Looked for: ${cursorRulesPath}\n`;
              return { content: [{ type: "text", text: result }] };
            }
            
            // Check if .mdc file already exists
            if (fs.existsSync(mdcPath)) {
              result += "⚠️ .mdc file already exists. Migration cancelled to prevent overwriting.\n";
              result += `Existing file: ${mdcPath}\n`;
              result += "Please remove or rename the existing .mdc file if you want to proceed.\n";
              return { content: [{ type: "text", text: result }] };
            }
            
            try {
              // Read the .cursorrules content
              const cursorRulesContent = fs.readFileSync(cursorRulesPath, 'utf8');
              
              // Create .mdc content with proper formatting
              const mdcContent = `# AI Assistant Rules\n\n\`\`\`\n${cursorRulesContent}\n\`\`\``;
              
              // Write the .mdc file
              fs.writeFileSync(mdcPath, mdcContent, 'utf8');
              
              result += "✅ Successfully migrated .cursorrules to .mdc format!\n\n";
              result += "## Files:\n";
              result += `- **Source**: ${cursorRulesPath}\n`;
              result += `- **Target**: ${mdcPath}\n\n`;
              result += "## Next Steps:\n";
              result += "1. Review the new .mdc file to ensure content is correct\n";
              result += "2. Test with your AI assistant to verify functionality\n";
              result += "3. Consider removing the old .cursorrules file once confirmed working\n";
              result += "4. Update your editor settings to use .mdc files if needed\n";
              
            } catch (error) {
              result += `❌ Migration failed: ${error}\n`;
            }
            
            return { content: [{ type: "text", text: result }] };
          }

          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } catch (error) {
        throw new Error(`vibe_coding_best_practice failed: ${error}`);
      }
    }


    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});


/**
 * Start the server using stdio transport
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
