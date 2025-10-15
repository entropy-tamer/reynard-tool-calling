/*
 tools/list -> generate TypeScript interfaces and a typed facade that calls tools/call.
 This is a simple scaffold; a later pass can enrich schema handling and JSDoc.
*/

import { writeFileSync } from "fs";
import { resolve } from "path";
import { McpClient, McpTool } from "./mcp-client";

export async function generateTypes(projectRoot: string): Promise<void> {
  const client = new McpClient(projectRoot);
  await client.initialize();
  const tools = await client.toolsList();
  const out = resolve(projectRoot, "packages/ai/tool-calling/src/codemode/mcp-types.ts");
  const text = renderTypes(tools);
  writeFileSync(out, text, "utf8");
}

export async function buildFacade(projectRoot: string): Promise<string> {
  const client = new McpClient(projectRoot);
  await client.initialize();
  const tools = await client.toolsList();
  return renderFacade(tools);
}

function renderFacade(tools: McpTool[]): string {
  const header = `/* AUTO-GENERATED: Do not edit by hand. */
import { McpClient } from "./mcp-client";

export function createMcpFacade(client: McpClient) {
  return {
`;

  const methods = tools.map(tool => {
    return `    ${tool.name}: async (input: Record<string, unknown> = {}) => {
      return await client.toolsCall("${tool.name}", input);
    }`;
  }).join(",\n");

  const footer = `
  };
}
`;

  return header + methods + footer;
}

function renderTypes(tools: McpTool[]): string {
  const header = `/* AUTO-GENERATED: Do not edit by hand. */\n\nexport type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };\n\n`;
  const ifaceDecls: string[] = [];
  const callSigs: string[] = [];

  for (const t of tools) {
    const typeName = toTypeName(t.name) + "Input";
    ifaceDecls.push(`/** ${escapeDoc(t.description ?? "")} */\nexport interface ${typeName} { [k: string]: any }\n`);
    callSigs.push(`  ${t.name}(input: ${typeName}): Promise<any>;`);
  }

  const ns = `export interface McpTypesNamespace {\n${callSigs.join("\n")}\n}\n`;
  return header + ifaceDecls.join("\n") + "\n" + ns;
}

function toTypeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]+(.)/g, (_m, g1) => String(g1).toUpperCase())
    .replace(/^[a-z]/, c => c.toUpperCase());
}

function escapeDoc(s: string): string {
  return s.replace(/\*/g, "*");
}

