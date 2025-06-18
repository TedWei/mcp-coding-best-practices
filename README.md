# Claude Best Practices MCP Server

A comprehensive Model Context Protocol (MCP) server that provides AI-assisted development best practices for multiple editors and frameworks. This server helps developers optimize their coding workflow with editor-specific guidance and access to 141+ curated cursor rules from the awesome-cursorrules repository.

## 🚀 Features

### 🎯 Multi-Editor Support
- **Claude Code**: CLAUDE.md files, clear project structure, TypeScript integration
- **Cursor**: .mdc files, AI code completion optimization, custom rules
- **VS Code**: Extensions, debugging, formatting tools configuration
- **Windsurf**: AI-assisted programming, intelligent code generation

### 🛠️ Core Functionality
- **Environment Auto-Detection**: Automatically detects your current editor and provides tailored recommendations
- **141+ Cursor Rules**: Access to curated rules from [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) repository
- **Dynamic Rule Management**: Create, update, and manage .mdc files
- **Best Practices Guidance**: Editor-specific best practices and optimization tips
- **Real-time Updates**: Keep cursor rules up-to-date with the latest community standards

## 🔧 Available Tools

### `vibe_coding_best_practice`
The main tool that provides comprehensive coding best practices functionality.

#### Actions

| Action | Description |
|--------|-------------|
| `detect_environment` | Auto-detect current editor and show environment info |
| `list_platforms` | Show all supported platforms and their detection status |
| `list_rules` | List available cursor rules (141+ rules available) |
| `create` | Create .mdc file with selected rules and platform practices |
| `response_content` | Return rule content without creating files |
| `update_rules` | Update cursor rules from the latest repository |

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `action` | string | **Required.** Action to perform |
| `platform` | string | Target editor: `claude-code`, `cursor`, `vscode`, `windsurf`, `auto-detect` |
| `rule_name` | string | Specific cursor rule key (e.g., `react_typescript_nextjs_nodejs`) |
| `auto_update` | boolean | Force update cursor rules from repository |
| `directory` | string | Target directory (default: current directory) |

## � Usage Examples

### 1. Detect Your Current Environment
```json
{
  "action": "detect_environment"
}
```

### 2. List All Available Cursor Rules
```json
{
  "action": "list_rules"
}
```

### 3. Search for Specific Rules
```json
{
  "action": "list_rules",
  "rule_name": "react"
}
```

### 4. Create .mdc File (Auto-detect Editor)
```json
{
  "action": "create",
  "platform": "auto-detect",
  "rule_name": "react_typescript_nextjs_nodejs"
}
```

### 5. Get Rule Content Only
```json
{
  "action": "response_content",
  "platform": "cursor",
  "rule_name": "python_fastapi"
}
```

### 6. Update Cursor Rules Database
```json
{
  "action": "update_rules",
  "auto_update": true
}
```

## 🎨 Supported Platforms & Best Practices

### Claude Code
- Use CLAUDE.md files to provide project context
- Keep code structure clear and easy for Claude to understand
- Use descriptive variable and function names
- Add appropriate comments explaining complex logic
- Use TypeScript to provide type information
- Keep file sizes moderate, avoid overly long files
- Use consistent code style and formatting
- Structure projects with logical directory hierarchies
- Include setup instructions in CLAUDE.md for environment context

### Cursor
- Create .mdc files for project-specific AI instructions
- Use Cursor's AI code completion features effectively
- Configure Cursor's AI model preference settings
- Leverage Cursor's code explanation and refactoring suggestions
- Use Cursor's intelligent code review functionality
- Keep code context clear to help AI understanding
- Use Cursor's keyboard shortcuts for efficiency
- Reference awesome-cursorrules repository for best practices
- Set up custom rules for your specific tech stack

### VS Code
- Install and configure relevant extensions
- Use VS Code's built-in Git functionality
- Configure code formatting tools (Prettier, ESLint)
- Use VS Code's debugging features
- Configure workspace settings and tasks
- Use code snippets to improve development efficiency
- Configure appropriate themes and fonts

### Windsurf
- Leverage Windsurf's AI-assisted programming features
- Use Windsurf's intelligent code generation
- Configure Windsurf's AI model settings
- Use Windsurf's code review and optimization suggestions
- Keep project structure clear for AI analysis
- Use Windsurf's collaboration features
- Configure appropriate development environment settings

## 📚 Available Cursor Rules (141+ Rules)

The server provides access to a comprehensive collection of cursor rules for various technologies:

### Popular Rules Include:
- `react_typescript_nextjs_nodejs` - React + TypeScript + Next.js + Node.js
- `python_fastapi` - Python FastAPI development
- `nextjs_tailwind_typescript` - Next.js + Tailwind + TypeScript
- `flutter_app_expert` - Flutter app development
- `vue_typescript` - Vue.js + TypeScript
- `django_best_practices` - Django Python framework
- `golang_backend` - Go backend development
- `rust_programming` - Rust development guidelines
- And 130+ more specialized rules...

## 🔄 Auto-Update System

The server includes an intelligent update system that:
- Clones the latest awesome-cursorrules repository
- Prevents excessive updates (24-hour cooldown)
- Maintains local cache for performance
- Provides update status and timestamps

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- Git (for cursor rules updates)
- MCP-compatible client (Claude Desktop, etc.)

### Build from Source
```bash
# Clone the repository
git clone <repository-url>
cd mcp-coding-best-practices

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run watch
```

### MCP Configuration
Add to your MCP client configuration:
```json
{
  "mcpServers": {
    "mcp-coding-best-practices": {
      "command": "node",
      "args": ["/path/to/mcp-coding-best-practices/build/index.js"]
    }
  }
}

with npx
{
  "mcpServers": {
    "mcp-coding-best-practices": {
      "command": "npx",
      "args": ["-y","@tedwei/mcp-coding-best-practices"]
    }
  }
}
```


## 🔍 Environment Detection

The server automatically detects your development environment by checking:
- Environment variables (`TERM_PROGRAM`, `VSCODE_IPC_HOOK_CLI`, `CURSOR_IPC_HOOK_CLI`)
- Available commands (`code`, `cursor`, `windsurf`, `claude`)
- Configuration file existence
- Process detection

## 📁 Project Structure

```
mcp-coding-best-practices/
├── src/
│   ├── index.ts                 # Main MCP server implementation
│   └── cursor-rules-interface.ts # Cursor rules type definitions
├── cursor-rules-mdc/            # 141+ cursor rule files
│   ├── README.md               # Rules documentation
│   └── *.mdc                   # Individual rule files
├── build/                      # Compiled JavaScript
├── package.json               # Project configuration
└── tsconfig.json             # TypeScript configuration
```

## 🤝 Contributing

Contributions are welcome! This project helps developers optimize their AI-assisted coding workflow.

### Areas for Contribution:
- Additional editor support
- New cursor rules
- Performance improvements
- Documentation enhancements
- Bug fixes and testing

## 📄 License

This project is open source. The cursor rules are sourced from the [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) repository.

## 🔗 Related Projects

- [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) - Community-curated cursor rules
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
- [Claude Desktop](https://claude.ai/) - AI assistant with MCP support

---

**Made for developers who want to optimize their AI-assisted coding workflow across multiple editors and frameworks.**
