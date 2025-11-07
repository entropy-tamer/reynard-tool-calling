import { codemode } from "./src/codemode/codemode.js";

async function main() {
  const cm = await codemode({ projectRoot: process.cwd() });
  try {
    const result = await cm.executeCode(`
      const { readFile } = await import('node:fs/promises');
      const { countCodeLines } = await import('/home/kade/runeset/reynard/packages/dev-tools/catalyst/src/file-utils/LineCounter.ts');
      const content = await readFile('/home/kade/runeset/reynard/packages/ui/monaco/src/solid-monaco/diff-editor-hooks.ts', 'utf-8');
      const count = countCodeLines(content, { skipBlankLines: true, skipComments: true });
      console.log('codemode line count (excluding comments/blank):', count);
      return { count };
    `);
    console.log('Return:', result.returned);
  } finally {
    cm.cleanup();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});












