"""Reynard tool-calling system.

This module provides a comprehensive tool-calling framework that allows the assistant
to execute various operations including git commands, file operations, dataset management,
and system utilities.

Key Components:
- BaseTool: Abstract base class for all tools
- ToolRegistry: Central registry for tool discovery and management
- ToolExecutor: Handles tool execution with proper error handling and logging
- Tool decorators and utilities for easy tool creation

Example:
    ```python
    from app.tools import ToolRegistry, tool

    @tool(
        name="list_files",
        description="List files in a directory",
        parameters={
            "path": {"type": "string", "description": "Directory path"},
            "limit": {"type": "integer", "description": "Max files to return", "default": 100}
        }
    )
    async def list_files_tool(path: str, limit: int = 100) -> dict:
        # Tool implementation
        return {"files": [], "count": 0}

    # Register and execute
    registry = ToolRegistry()
    result = await registry.execute_tool("list_files", {"path": "/home/user"})
    ```

"""

from .base import (
    BaseTool,
    ParameterType,
    ToolExecutionContext,
    ToolParameter,
    ToolResult,
)
from .decorators import admin_tool, read_only_tool, requires_permission, tool
from .exceptions import (
    ToolError,
    ToolExecutionError,
    ToolNotFoundError,
    ToolPermissionError,
    ToolValidationError,
    ToolTimeoutError,
    ToolResourceError,
)
from .executor import ToolExecutor, get_tool_executor, initialize_tool_executor

# Import MCP client for git operations
from .mcp_client import (
    MCPGitClient,
    git_add_tool,
    git_branches_tool,
    git_commit_tool,
    git_history_tool,
    git_status_tool,
)
from .registry import ToolRegistry, get_tool_registry, register_tool

# Import NLWeb tools (conditionally available)
NLWEB_TOOLS_AVAILABLE = False
try:  # noqa: SIM105 – intentional conditional import
    from .nlweb_tools import (
        nlweb_ask_tool,
        nlweb_list_sites_tool,
        nlweb_mcp_tool,
        nlweb_suggest_tool,
    )

    NLWEB_TOOLS_AVAILABLE = True
except Exception:  # If NLWeb integration isn't present, keep going without it
    NLWEB_TOOLS_AVAILABLE = False

# Import datetime tools
from .datetime_tools import (
    FormatTimeTool,
    GetCurrentTimeTool,
    format_time_tool,
    get_current_time_tool,
)

# Build exports
__all__: list[str] = [
    # Feature flags
    "NLWEB_TOOLS_AVAILABLE",
    # Base/core types
    "BaseTool",
    "ToolExecutionContext",
    "ToolParameter",
    "ToolResult",
    "ParameterType",
    # Executor
    "ToolExecutor",
    "get_tool_executor",
    "initialize_tool_executor",
    # Registry
    "ToolRegistry",
    "get_tool_registry",
    "register_tool",
    # Exceptions
    "ToolError",
    "ToolExecutionError",
    "ToolNotFoundError",
    "ToolPermissionError",
    "ToolValidationError",
    "ToolTimeoutError",
    "ToolResourceError",
    # Decorators
    "tool",
    "admin_tool",
    "read_only_tool",
    "requires_permission",
    # Datetime tools
    "GetCurrentTimeTool",
    "FormatTimeTool",
    "get_current_time_tool",
    "format_time_tool",
    # MCP Git client
    "MCPGitClient",
    "git_add_tool",
    "git_branches_tool",
    "git_commit_tool",
    "git_history_tool",
    "git_status_tool",
]

# Conditionally extend __all__ with NLWeb tools
if NLWEB_TOOLS_AVAILABLE:
    __all__.extend([
        "nlweb_ask_tool",
        "nlweb_list_sites_tool",
        "nlweb_mcp_tool",
        "nlweb_suggest_tool",
    ])
