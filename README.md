# Reynard AI Tool-Calling System

*Native TypeScript implementation of AI agent tools with comprehensive development capabilities*

## Overview

The Reynard AI Tool-Calling system provides a complete native TypeScript implementation of agent tools, replacing the previous Python MCP server. This system offers agent naming, temporal awareness, location detection, development tools, and comprehensive health monitoring.

## Quick Start

### Agent Startup Sequence

Initialize your agent identity with the complete startup sequence:

```bash
cd /home/kade/runeset/reynard/packages/ai/tool-calling && pnpm startup-sequence
```

This command will:

1. **Initialize the native tools system** (replacing the old MCP server)
2. **Generate an agent name** using the new TypeScript tools
3. **Establish temporal context** with current time and timezone
4. **Get location information** based on IP address
5. **Test the tool system** to ensure everything is working

### Alternative Inline Command

For programmatic access, use the inline command:

```bash
cd /home/kade/runeset/reynard/packages/ai/tool-calling && pnpm tsx -e "
import { codemode } from './src/codemode/codemode.js';
const cm = await codemode({ projectRoot: process.cwd() });
const result = await cm.executeCode(\`
  const nameResult = await tools.agent.NamingTools.generateAgentName({
    specialist: 'fox', style: 'foundation'
  });
  console.log('🦊 Agent name:', nameResult.data.name);
  return nameResult.data;
\`);
console.log('Result:', result.returned);
cm.cleanup();
"
```

## Available Tools

### 🦊 Agent Tools

- **`generateAgentName`** - Generate agent names with animal spirit themes
- **`assignAgentName`** - Assign names to agents with persistence
- **`getAgentName`** - Retrieve current agent names
- **`listAgentNames`** - List all assigned agent names
- **`rollAgentSpirit`** - Randomly select an animal spirit (weighted distribution)
- **`getCurrentTime`** - Get current date and time
- **`getCurrentLocation`** - Get location based on IP address
- **`sendDesktopNotification`** - Send desktop notifications using libnotify

### 🛠️ Development Tools

- **`lintFrontend`** - ESLint for TypeScript/JavaScript (with auto-fix)
- **`formatFrontend`** - Prettier formatting (with check-only mode)
- **`lintPython`** - Flake8, Pylint for Python (with auto-fix)
- **`formatPython`** - Black + isort formatting (with check-only mode)
- **`lintMarkdown`** - markdownlint validation (with auto-fix)
- **`validateComprehensive`** - Run all custom validation scripts
- **`scanSecurity`** - Complete security audit (Bandit, audit-ci, type checking)
- **`runAllLinting`** - Execute entire linting suite (with auto-fix)

### 📊 System Tools

- **`getVersions`** - Get versions of Python, Node.js, npm, pnpm, and TypeScript
- **`getPythonVersion`** - Get Python version information
- **`getNodeVersion`** - Get Node.js version information
- **`getTypeScriptVersion`** - Get TypeScript version information
- **`getVscodeActiveFile`** - Get currently active file path in VS Code
- **`getVscodeWorkspaceInfo`** - Get VS Code workspace information and settings
- **`getVscodeExtensions`** - Get list of installed VS Code extensions
- **`scanSecurityFast`** - Run fast security scanning (skips slow Bandit checks)
- **`scanSecurityFull`** - Run comprehensive security scanning including Bandit

## Architecture

### Native Tools System

The system uses a modular TypeScript architecture with:

- **Tool Registry**: Central tool registration and management
- **Tool Categories**: Organized by functionality (agent, development, research, search, system, visualization)
- **Backend Integration**: Seamless FastAPI backend access
- **Codemode Integration**: Native tools available in codemode execution context
- **Type Safety**: Full TypeScript type checking for all tools

### Health Check System

The health check system provides comprehensive validation:

- **Tool Registry Validation**: Ensures all tools are properly registered
- **Dependency Checking**: Verifies required dependencies are available
- **Error Handling**: Graceful fallbacks for failed components
- **Performance Monitoring**: Tracks tool execution times and success rates

### Location Detection

The location system provides robust geolocation capabilities:

- **Primary API**: Uses ipapi.co for reliable IP geolocation
- **Timeout Protection**: 5-second timeout to prevent hanging
- **Fallback System**: Local fallback when API is unavailable
- **Comprehensive Data**: City, country, timezone, ISP, and more

## Usage Examples

### Basic Agent Initialization

```typescript
import { codemode } from './src/codemode/codemode.js';

const cm = await codemode({ projectRoot: process.cwd() });

// Generate agent name
const nameResult = await cm.executeCode(`
  const name = await tools.agent.NamingTools.generateAgentName({
    specialist: 'fox',
    style: 'foundation'
  });
  return name;
`);

console.log('Agent name:', nameResult.returned.data.name);
```

### Development Tools Integration

```typescript
// Run comprehensive linting
const lintResult = await cm.executeCode(`
  const result = await tools.development.DevelopmentTools.runAllLinting({
    fix: true
  });
  return result;
`);

// Security scanning
const securityResult = await cm.executeCode(`
  const result = await tools.development.DevelopmentTools.scanSecurityFull();
  return result;
`);
```

### Location and Time Awareness

```typescript
// Get current time and location
const contextResult = await cm.executeCode(`
  const time = await tools.agent.TimeTools.getCurrentTime();
  const location = await tools.agent.LocationTools.getCurrentLocation();
  
  return {
    time: time.data.local,
    location: \`\${location.data.city}, \${location.data.country}\`
  };
`);
```

## Configuration

### Environment Variables

- **`OPENWEATHER_API_KEY`** - Optional API key for weather information
- **`NODE_ENV`** - Environment mode (development/production)

### Tool Configuration

Tools can be configured through the codemode environment:

```typescript
const cm = await codemode({
  projectRoot: process.cwd(),
  timeoutMs: 10000 // 10 second timeout
});
```

## Troubleshooting

### Common Issues

**Health Check Failures:**

- Ensure all dependencies are installed: `pnpm install`
- Check TypeScript compilation: `pnpm build`
- Verify tool registration: `pnpm list-tools`

**Location API Issues:**

- The system includes automatic fallback to local location
- Check network connectivity for external API access
- Fallback location provides basic functionality

**Tool Execution Errors:**

- Check timeout settings for long-running operations
- Verify file permissions for development tools
- Ensure required system tools are installed (eslint, prettier, etc.)

### Debug Mode

Enable debug mode for detailed logging:

```bash
DEBUG=reynard:* pnpm startup-sequence
```

## Performance Considerations

- **Tool Caching**: Tools are cached for improved performance
- **Concurrent Execution**: Multiple tools can run simultaneously
- **Resource Management**: Automatic cleanup prevents memory leaks
- **Timeout Protection**: Prevents hanging on unresponsive tools

## Security Features

- **Input Validation**: All tool inputs are validated and sanitized
- **Error Boundaries**: Graceful failure handling throughout
- **Rate Limiting**: Built-in protection against abuse
- **Audit Trail**: All tool executions are logged with timestamps

## Contributing

### Adding New Tools

1. Create tool class in appropriate category directory
2. Implement tool methods with proper error handling
3. Register tool in the tool registry
4. Add tests and documentation
5. Update this README with new tool information

### Tool Development Guidelines

- **Error Handling**: Always return structured error responses
- **Logging**: Include meaningful log messages
- **Type Safety**: Use proper TypeScript types
- **Documentation**: Document all tool methods and parameters
- **Testing**: Include comprehensive test coverage

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review the tool documentation
3. Check the health status with `pnpm startup-sequence`
4. Report issues with detailed error messages and system information

---

*Built with the cunning precision of a fox and the systematic approach of the Reynard ecosystem* 🦊
