export const WORKSPACE_STORAGE_KEY = 'engcalc.workspace.v1';
export const WORKSPACE_SCHEMA_VERSION = 1 as const;

export interface WorkspaceEntry {
  id: string;
  calculatorSlug: string;
  calculatorTitle: string;
  result: string;
  formula: string;
  note: string;
  createdAt: string;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  entries: WorkspaceEntry[];
}

export interface WorkspaceDocument {
  schemaVersion: typeof WORKSPACE_SCHEMA_VERSION;
  activeProjectId: string;
  updatedAt: string;
  projects: WorkspaceProject[];
}

export interface CalculationSnapshot {
  calculatorSlug: string;
  calculatorTitle: string;
  result: string;
  formula: string;
}

const MAX_PROJECTS = 100;
const MAX_ENTRIES_PER_PROJECT = 1_000;

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function isoNow() {
  return new Date().toISOString();
}

export function createWorkspaceProject(name = 'My first design'): WorkspaceProject {
  const timestamp = isoNow();
  return {
    id: createId('project'),
    name,
    description: 'Collect related calculations, assumptions, and design decisions here.',
    createdAt: timestamp,
    updatedAt: timestamp,
    entries: [],
  };
}

export function createWorkspaceDocument(): WorkspaceDocument {
  const project = createWorkspaceProject();
  return {
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    activeProjectId: project.id,
    updatedAt: project.updatedAt,
    projects: [project],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isShortString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length <= maxLength;
}

function isIsoDate(value: unknown): value is string {
  return isShortString(value, 64) && Number.isFinite(Date.parse(value));
}

function isWorkspaceEntry(value: unknown): value is WorkspaceEntry {
  if (!isRecord(value)) return false;
  return (
    isShortString(value.id, 100) &&
    isShortString(value.calculatorSlug, 120) &&
    isShortString(value.calculatorTitle, 160) &&
    isShortString(value.result, 4_000) &&
    isShortString(value.formula, 1_000) &&
    isShortString(value.note, 4_000) &&
    isIsoDate(value.createdAt)
  );
}

function isWorkspaceProject(value: unknown): value is WorkspaceProject {
  if (!isRecord(value) || !Array.isArray(value.entries)) return false;
  return (
    isShortString(value.id, 100) &&
    isShortString(value.name, 120) &&
    isShortString(value.description, 1_000) &&
    isIsoDate(value.createdAt) &&
    isIsoDate(value.updatedAt) &&
    value.entries.length <= MAX_ENTRIES_PER_PROJECT &&
    value.entries.every(isWorkspaceEntry)
  );
}

export function isWorkspaceDocument(value: unknown): value is WorkspaceDocument {
  if (!isRecord(value) || !Array.isArray(value.projects)) return false;
  if (
    value.schemaVersion !== WORKSPACE_SCHEMA_VERSION ||
    !isShortString(value.activeProjectId, 100) ||
    !isIsoDate(value.updatedAt) ||
    value.projects.length === 0 ||
    value.projects.length > MAX_PROJECTS ||
    !value.projects.every(isWorkspaceProject)
  ) {
    return false;
  }
  return value.projects.some((project) => project.id === value.activeProjectId);
}

export function readWorkspace(): WorkspaceDocument {
  if (typeof window === 'undefined') return createWorkspaceDocument();
  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return createWorkspaceDocument();
    const parsed: unknown = JSON.parse(raw);
    return isWorkspaceDocument(parsed) ? parsed : createWorkspaceDocument();
  } catch {
    return createWorkspaceDocument();
  }
}

export function writeWorkspace(document: WorkspaceDocument) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(document));
  window.dispatchEvent(new CustomEvent('engcalc:workspace-updated'));
}

export function addProject(document: WorkspaceDocument, name?: string): WorkspaceDocument {
  if (document.projects.length >= MAX_PROJECTS) return document;
  const project = createWorkspaceProject(name || `Design ${document.projects.length + 1}`);
  return {
    ...document,
    activeProjectId: project.id,
    updatedAt: project.updatedAt,
    projects: [...document.projects, project],
  };
}

export function addCalculation(
  document: WorkspaceDocument,
  snapshot: CalculationSnapshot,
  projectId = document.activeProjectId,
): WorkspaceDocument {
  const timestamp = isoNow();
  const entry: WorkspaceEntry = {
    id: createId('calculation'),
    calculatorSlug: snapshot.calculatorSlug.slice(0, 120),
    calculatorTitle: snapshot.calculatorTitle.slice(0, 160),
    result: snapshot.result.slice(0, 4_000),
    formula: snapshot.formula.slice(0, 1_000),
    note: '',
    createdAt: timestamp,
  };

  let changed = false;
  const projects = document.projects.map((project) => {
    if (project.id !== projectId || project.entries.length >= MAX_ENTRIES_PER_PROJECT) {
      return project;
    }
    changed = true;
    return { ...project, updatedAt: timestamp, entries: [entry, ...project.entries] };
  });

  return changed ? { ...document, activeProjectId: projectId, updatedAt: timestamp, projects } : document;
}

export function escapeCsv(value: string) {
  // Quoting is not enough to prevent spreadsheet formula execution. Prefix
  // formula-like cells so a shared export remains text when opened in Excel,
  // Numbers, or Google Sheets.
  const firstVisibleCharacter = value.trimStart().charAt(0);
  const safeValue = ['=', '+', '-', '@'].includes(firstVisibleCharacter) ? `'${value}` : value;
  return `"${safeValue.replaceAll('"', '""')}"`;
}

export function projectToCsv(project: WorkspaceProject) {
  const header = ['Created', 'Calculator', 'Formula', 'Result', 'Notes'];
  const rows = project.entries.map((entry) => [
    entry.createdAt,
    entry.calculatorTitle,
    entry.formula,
    entry.result,
    entry.note,
  ]);
  return [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
}

export function safeFileName(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return normalized || 'engineering-project';
}
