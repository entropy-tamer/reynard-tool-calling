"""MCP Client for Git Operations.

This module provides a client interface to the MCP server's git_tool,
allowing the tool-calling system to use the consolidated git operations
without reimplementing them.
"""

import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)


class MCPGitClient:
    """Client for interacting with the MCP server's git_tool."""

    def __init__(self, backend_url: str = "http://localhost:8000"):
        """Initialize the MCP Git client.

        Args:
            backend_url: URL of the FastAPI backend with MCP endpoints

        """
        self.backend_url = backend_url.rstrip("/")
        self.timeout = 30.0

    async def _call_mcp_tool(
        self,
        operation: str,
        args: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Call the MCP server's git_tool via the bridge service.

        Args:
            operation: Git operation to perform
            args: Operation-specific arguments

        Returns:
            Result from the MCP server

        Raises:
            Exception: If the MCP call fails

        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Call the backend MCP bridge service endpoint
                response = await client.post(
                    f"{self.backend_url}/api/mcp-bridge/tools/call",
                    json={
                        "tool": "git_tool",
                        "arguments": {"operation": operation, "args": args or {}},
                        "context": {"user_id": "ai-tool-calling", "user_role": "user"},
                    },
                )

                if response.status_code != 200:
                    msg = f"MCP bridge returned {response.status_code}: {response.text}"
                    raise Exception(
                        msg,
                    )

                result = response.json()
                if not result.get("success", False):
                    msg = f"MCP tool call failed: {result.get('error', 'Unknown error')}"
                    raise Exception(
                        msg,
                    )

                return result.get("result", {})

        except Exception as e:
            logger.exception(f"Failed to call MCP git_tool via bridge: {e}")
            raise

    async def status(self, **kwargs) -> dict[str, Any]:
        """Get git status."""
        return await self._call_mcp_tool("status", kwargs)

    async def branch(self, **kwargs) -> dict[str, Any]:
        """Get branch information."""
        return await self._call_mcp_tool("branch", kwargs)

    async def log(self, limit: int = 10, **kwargs) -> dict[str, Any]:
        """Get git log."""
        return await self._call_mcp_tool("log", {"limit": limit, **kwargs})

    async def diff(
        self,
        staged: bool = False,
        page: int = 1,
        page_size: int = 1000,
        **kwargs,
    ) -> dict[str, Any]:
        """Get git diff with pagination."""
        return await self._call_mcp_tool(
            "diff",
            {"staged": staged, "page": page, "page_size": page_size, **kwargs},
        )

    async def add(self, files: list[str], **kwargs) -> dict[str, Any]:
        """Add files to git."""
        return await self._call_mcp_tool("add", {"files": files, **kwargs})

    async def commit(self, message: str, **kwargs) -> dict[str, Any]:
        """Commit changes."""
        return await self._call_mcp_tool("commit", {"message": message, **kwargs})

    async def push(
        self,
        remote: str = "origin",
        branch: str | None = None,
        force: bool = False,
        **kwargs,
    ) -> dict[str, Any]:
        """Push changes."""
        args = {"remote": remote, "force": force, **kwargs}
        if branch:
            args["branch"] = branch
        return await self._call_mcp_tool("push", args)

    async def pull(
        self,
        remote: str = "origin",
        branch: str | None = None,
        **kwargs,
    ) -> dict[str, Any]:
        """Pull changes."""
        args = {"remote": remote, **kwargs}
        if branch:
            args["branch"] = branch
        return await self._call_mcp_tool("pull", args)

    async def checkout(self, branch: str, **kwargs) -> dict[str, Any]:
        """Checkout a branch."""
        return await self._call_mcp_tool("checkout", {"branch": branch, **kwargs})

    async def merge(self, branch: str, **kwargs) -> dict[str, Any]:
        """Merge a branch."""
        return await self._call_mcp_tool("merge", {"branch": branch, **kwargs})

    async def rebase(self, branch: str, **kwargs) -> dict[str, Any]:
        """Rebase onto a branch."""
        return await self._call_mcp_tool("rebase", {"branch": branch, **kwargs})

    async def reset(self, mode: str = "mixed", **kwargs) -> dict[str, Any]:
        """Reset git state."""
        return await self._call_mcp_tool("reset", {"mode": mode, **kwargs})

    async def stash(self, action: str = "push", **kwargs) -> dict[str, Any]:
        """Stash changes."""
        return await self._call_mcp_tool("stash", {"action": action, **kwargs})

    async def tag(self, name: str, **kwargs) -> dict[str, Any]:
        """Create or list tags."""
        return await self._call_mcp_tool("tag", {"name": name, **kwargs})

    async def remote(self, action: str = "list", **kwargs) -> dict[str, Any]:
        """Manage remotes."""
        return await self._call_mcp_tool("remote", {"action": action, **kwargs})

    async def fetch(self, remote: str = "origin", **kwargs) -> dict[str, Any]:
        """Fetch from remote."""
        return await self._call_mcp_tool("fetch", {"remote": remote, **kwargs})

    async def clone(
        self,
        url: str,
        directory: str | None = None,
        **kwargs,
    ) -> dict[str, Any]:
        """Clone a repository."""
        args = {"url": url, **kwargs}
        if directory:
            args["directory"] = directory
        return await self._call_mcp_tool("clone", args)


# Convenience functions for backward compatibility
async def git_status_tool(dataset_path: str) -> dict[str, Any]:
    """Get git status for a dataset path."""
    client = MCPGitClient()
    return await client.status()


async def git_commit_tool(dataset_path: str, message: str) -> dict[str, Any]:
    """Commit changes for a dataset."""
    client = MCPGitClient()
    return await client.commit(message)


async def git_add_tool(dataset_path: str, files: list[str]) -> dict[str, Any]:
    """Add files to git."""
    client = MCPGitClient()
    return await client.add(files)


async def git_branches_tool(dataset_path: str) -> dict[str, Any]:
    """Get branch information."""
    client = MCPGitClient()
    return await client.branch()


async def git_history_tool(dataset_path: str, limit: int = 10) -> dict[str, Any]:
    """Get git history."""
    client = MCPGitClient()
    return await client.log(limit=limit)


# Export the client and convenience functions
__all__ = [
    "MCPGitClient",
    "git_add_tool",
    "git_branches_tool",
    "git_commit_tool",
    "git_history_tool",
    "git_status_tool",
]
