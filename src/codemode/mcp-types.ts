/* AUTO-GENERATED: Do not edit by hand. */

export type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

/** Comprehensive git operations tool with pagination support */
export interface GitToolInput { [k: string]: any }

/** Strategically triages backlog items for an AI project */
export interface FoxTriageBacklogInput { [k: string]: any }

/** Plans sprints with capacity analysis and dependency management */
export interface FoxPlanSprintInput { [k: string]: any }

/** Generates daily project status reports and identifies blockers */
export interface FoxDailyStatusInput { [k: string]: any }

/** Performs proactive risk assessment and mitigation analysis */
export interface FoxRiskScanInput { [k: string]: any }

/** Coordinates handoff to Success-Advisor-8 for release readiness */
export interface FoxHandoffToSa8Input { [k: string]: any }

/** Select a random component from the Reynard ecosystem for research analysis with ECS integration */
export interface SelectResearchComponentInput { [k: string]: any }

/** Get all available agent spirits from the ECS system */
export interface GetAvailableSpiritsInput { [k: string]: any }

/** Get all available agent classes from the ECS system */
export interface GetAvailableClassesInput { [k: string]: any }

/** Get classes compatible with a specific spirit */
export interface GetCompatibleClassesInput { [k: string]: any }

/** Get statistics about available components and research capabilities */
export interface GetComponentStatisticsInput { [k: string]: any }

/** Search and retrieve papers from arXiv.org with advanced filtering */
export interface SearchArxivPapersInput { [k: string]: any }

/** Download a specific arXiv paper by ID */
export interface DownloadArxivPaperInput { [k: string]: any }

/** Download and index an academic paper in Reynard's RAG system */
export interface DownloadAndIndexPaperInput { [k: string]: any }

/** Search for papers in the local Reynard paper database */
export interface SearchLocalPapersInput { [k: string]: any }

/** Ingest an academic paper into Reynard's RAG system for semantic search */
export interface IngestPaperToRagInput { [k: string]: any }

/** Search for academic papers in Reynard's RAG system using semantic search */
export interface SearchPapersInRagInput { [k: string]: any }

/** Get statistics about academic papers in Reynard's RAG system */
export interface GetRagPaperStatsInput { [k: string]: any }

/** Perform a comprehensive literature review using all available research tools */
export interface ComprehensiveLiteratureReviewInput { [k: string]: any }

/** Perform comprehensive novelty assessment for a research proposal */
export interface NoveltyAssessmentWorkflowInput { [k: string]: any }

/** Complete pipeline for discovering, downloading, and indexing research papers */
export interface ResearchPaperPipelineInput { [k: string]: any }

/** Complete academic review workflow with automated research and analysis */
export interface AcademicReviewWorkflowInput { [k: string]: any }

/** Open an image file with the imv image viewer */
export interface OpenImageInput { [k: string]: any }

/** Retrieve a user secret by name */
export interface GetSecretInput { [k: string]: any }

/** List all available secrets */
export interface ListSecretsInput { [k: string]: any }

/** Check if a secret is available and set */
export interface CheckSecretInput { [k: string]: any }

/** Get detailed information about a secret */
export interface GetSecretInfoInput { [k: string]: any }

/** Get all tool configurations and statistics */
export interface GetToolConfigsInput { [k: string]: any }

/** Get status of a specific tool or all tools */
export interface GetToolStatusInput { [k: string]: any }

/** Enable a specific tool */
export interface EnableToolInput { [k: string]: any }

/** Disable a specific tool */
export interface DisableToolInput { [k: string]: any }

/** Get metadata for a specific tool */
export interface GetToolMetadataInput { [k: string]: any }

/** List tools grouped by category */
export interface ListToolsByCategoryInput { [k: string]: any }

/** Get current date and time with timezone support */
export interface GetCurrentTimeInput { [k: string]: any }

/** Get location based on IP address */
export interface GetCurrentLocationInput { [k: string]: any }

/** Send desktop notifications using libnotify */
export interface SendDesktopNotificationInput { [k: string]: any }

/** Execute JavaScript on webpages with session support and intelligent content extraction */
export interface ExecuteJavascriptInput { [k: string]: any }

/** Intelligently extract content from websites using specialized extractors */
export interface ExtractWebsiteContentInput { [k: string]: any }

/** Get information about browser sessions */
export interface GetBrowserSessionInfoInput { [k: string]: any }

/** Test Playwright browser connection and capabilities */
export interface TestPlaywrightConnectionInput { [k: string]: any }

/** Take screenshots of webpages using Playwright browser automation */
export interface TakeWebpageScreenshotInput { [k: string]: any }

/** Scrape content from webpages using Playwright browser automation */
export interface ScrapeWebpageContentInput { [k: string]: any }

/** Discover all available VS Code tasks from tasks.json */
export interface DiscoverVscodeTasksInput { [k: string]: any }

/** Validate that a VS Code task exists and is executable */
export interface ValidateVscodeTaskInput { [k: string]: any }

/** Execute a VS Code task by name */
export interface ExecuteVscodeTaskInput { [k: string]: any }

/** Get detailed information about a specific VS Code task */
export interface GetVscodeTaskInfoInput { [k: string]: any }

/** Get versions of Python, Node.js, npm, pnpm, and TypeScript */
export interface GetVersionsInput { [k: string]: any }

/** Get Python version information */
export interface GetPythonVersionInput { [k: string]: any }

/** Get currently active file path in VS Code */
export interface GetVscodeActiveFileInput { [k: string]: any }

/** ESLint for TypeScript/JavaScript (with auto-fix) */
export interface LintFrontendInput { [k: string]: any }

/** Flake8, Pylint for Python (with auto-fix and error limiting) */
export interface LintPythonInput { [k: string]: any }

/** markdownlint validation (with auto-fix) */
export interface LintMarkdownInput { [k: string]: any }

/** Execute entire linting suite (with auto-fix) */
export interface RunAllLintingInput { [k: string]: any }

/** Prettier formatting (with check-only mode) */
export interface FormatFrontendInput { [k: string]: any }

/** Black + isort formatting (with check-only mode) */
export interface FormatPythonInput { [k: string]: any }

/** Complete security audit (Bandit, audit-ci, type checking) */
export interface ScanSecurityInput { [k: string]: any }

/** Run fast security scanning (skips slow Bandit checks) */
export interface ScanSecurityFastInput { [k: string]: any }

/** 🔥 Detect large monolithic files that violate the 140-line axiom with RAG acceleration. Perfect for finding code that needs refactoring into smaller, more maintainable modules. Use this to identify files that are too complex and should be broken down. */
export interface DetectMonolithsInput { [k: string]: any }

/** 🔍 Deep-dive analysis of a specific file's complexity metrics with intelligent caching. Perfect for understanding why a file is considered a monolith and what specific refactoring opportunities exist. */
export interface AnalyzeFileComplexityInput { [k: string]: any }

export interface McpTypesNamespace {
  git_tool(input: GitToolInput): Promise<any>;
  fox_triage_backlog(input: FoxTriageBacklogInput): Promise<any>;
  fox_plan_sprint(input: FoxPlanSprintInput): Promise<any>;
  fox_daily_status(input: FoxDailyStatusInput): Promise<any>;
  fox_risk_scan(input: FoxRiskScanInput): Promise<any>;
  fox_handoff_to_sa8(input: FoxHandoffToSa8Input): Promise<any>;
  select_research_component(input: SelectResearchComponentInput): Promise<any>;
  get_available_spirits(input: GetAvailableSpiritsInput): Promise<any>;
  get_available_classes(input: GetAvailableClassesInput): Promise<any>;
  get_compatible_classes(input: GetCompatibleClassesInput): Promise<any>;
  get_component_statistics(input: GetComponentStatisticsInput): Promise<any>;
  search_arxiv_papers(input: SearchArxivPapersInput): Promise<any>;
  download_arxiv_paper(input: DownloadArxivPaperInput): Promise<any>;
  download_and_index_paper(input: DownloadAndIndexPaperInput): Promise<any>;
  search_local_papers(input: SearchLocalPapersInput): Promise<any>;
  ingest_paper_to_rag(input: IngestPaperToRagInput): Promise<any>;
  search_papers_in_rag(input: SearchPapersInRagInput): Promise<any>;
  get_rag_paper_stats(input: GetRagPaperStatsInput): Promise<any>;
  comprehensive_literature_review(input: ComprehensiveLiteratureReviewInput): Promise<any>;
  novelty_assessment_workflow(input: NoveltyAssessmentWorkflowInput): Promise<any>;
  research_paper_pipeline(input: ResearchPaperPipelineInput): Promise<any>;
  academic_review_workflow(input: AcademicReviewWorkflowInput): Promise<any>;
  open_image(input: OpenImageInput): Promise<any>;
  get_secret(input: GetSecretInput): Promise<any>;
  list_secrets(input: ListSecretsInput): Promise<any>;
  check_secret(input: CheckSecretInput): Promise<any>;
  get_secret_info(input: GetSecretInfoInput): Promise<any>;
  get_tool_configs(input: GetToolConfigsInput): Promise<any>;
  get_tool_status(input: GetToolStatusInput): Promise<any>;
  enable_tool(input: EnableToolInput): Promise<any>;
  disable_tool(input: DisableToolInput): Promise<any>;
  get_tool_metadata(input: GetToolMetadataInput): Promise<any>;
  list_tools_by_category(input: ListToolsByCategoryInput): Promise<any>;
  get_current_time(input: GetCurrentTimeInput): Promise<any>;
  get_current_location(input: GetCurrentLocationInput): Promise<any>;
  send_desktop_notification(input: SendDesktopNotificationInput): Promise<any>;
  execute_javascript(input: ExecuteJavascriptInput): Promise<any>;
  extract_website_content(input: ExtractWebsiteContentInput): Promise<any>;
  get_browser_session_info(input: GetBrowserSessionInfoInput): Promise<any>;
  test_playwright_connection(input: TestPlaywrightConnectionInput): Promise<any>;
  take_webpage_screenshot(input: TakeWebpageScreenshotInput): Promise<any>;
  scrape_webpage_content(input: ScrapeWebpageContentInput): Promise<any>;
  discover_vscode_tasks(input: DiscoverVscodeTasksInput): Promise<any>;
  validate_vscode_task(input: ValidateVscodeTaskInput): Promise<any>;
  execute_vscode_task(input: ExecuteVscodeTaskInput): Promise<any>;
  get_vscode_task_info(input: GetVscodeTaskInfoInput): Promise<any>;
  get_versions(input: GetVersionsInput): Promise<any>;
  get_python_version(input: GetPythonVersionInput): Promise<any>;
  get_vscode_active_file(input: GetVscodeActiveFileInput): Promise<any>;
  lint_frontend(input: LintFrontendInput): Promise<any>;
  lint_python(input: LintPythonInput): Promise<any>;
  lint_markdown(input: LintMarkdownInput): Promise<any>;
  run_all_linting(input: RunAllLintingInput): Promise<any>;
  format_frontend(input: FormatFrontendInput): Promise<any>;
  format_python(input: FormatPythonInput): Promise<any>;
  scan_security(input: ScanSecurityInput): Promise<any>;
  scan_security_fast(input: ScanSecurityFastInput): Promise<any>;
  detect_monoliths(input: DetectMonolithsInput): Promise<any>;
  analyze_file_complexity(input: AnalyzeFileComplexityInput): Promise<any>;
}
