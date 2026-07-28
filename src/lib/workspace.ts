export const WORKSPACE_STORAGE_KEY = 'engcalc.workspace.v1';
export const WORKSPACE_SCHEMA_VERSION = 1 as const;

export type ReviewStatus = 'draft' | 'ready-for-review' | 'reviewed';

export interface CalculationInput {
  id: string;
  label: string;
  value: string;
  reopenValue?: string;
  unit?: string;
}

export interface CalculationOutput {
  label: string;
  value: string;
  unit?: string;
}

export interface CalculationStep {
  label: string;
  value: string;
}

export interface CalculationEvidence {
  inputs?: CalculationInput[];
  outputs?: CalculationOutput[];
  steps?: CalculationStep[];
  warning?: string;
  mode?: string;
  calculatorVersion?: string;
}

export interface CalculatorCapture extends CalculationEvidence {
  summary: string;
}

export interface WorkspaceEntry extends CalculationEvidence {
  id: string;
  calculatorSlug: string;
  calculatorTitle: string;
  result: string;
  formula: string;
  note: string;
  reviewStatus?: ReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface WorkspaceWorkflowItem {
  id: string;
  calculatorSlug: string;
  title: string;
  purpose: string;
  optional?: boolean;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  description: string;
  status?: ReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  workflow?: WorkspaceWorkflowItem[];
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

export interface CalculationSnapshot extends CalculationEvidence {
  calculatorSlug: string;
  calculatorTitle: string;
  result: string;
  formula: string;
}

export type AddCalculationResult =
  | { ok: true; document: WorkspaceDocument }
  | {
      ok: false;
      document: WorkspaceDocument;
      reason: 'project-not-found' | 'project-capacity-reached';
    };

export interface WorkspaceMergeResult {
  document: WorkspaceDocument;
  importedCount: number;
  skippedCount: number;
}

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  audience: string;
  workflow: Omit<WorkspaceWorkflowItem, 'id'>[];
}

export const workspaceTemplates: WorkspaceTemplate[] = [
  {
    id: 'sensor-adc-front-end',
    name: 'Sensor + ADC front end',
    description: 'Document scaling, filtering, and digitisation for a sensor input from source to ADC code.',
    audience: 'Embedded and instrumentation design',
    workflow: [
      { calculatorSlug: 'voltage-divider-calculator', title: 'Scale the sensor signal', purpose: 'Choose a loaded, tolerance-aware divider or document why one is not needed.' },
      { calculatorSlug: 'rc-low-pass-filter-designer', title: 'Set the analogue bandwidth', purpose: 'Record the anti-alias or noise-filter corner and attenuation.' },
      { calculatorSlug: 'adc-resolution-calculator', title: 'Check ADC resolution', purpose: 'Convert the reference and bit depth into LSB size and ideal code.' },
      { calculatorSlug: 'op-amp-gain-checker', title: 'Check the amplifier stage', purpose: 'Verify gain, bandwidth, slew rate, and output range.', optional: true },
    ],
  },
  {
    id: 'battery-power-budget',
    name: 'Battery power budget',
    description: 'Build a traceable energy and loss budget from the load back to the battery.',
    audience: 'Portable and off-grid electronics',
    workflow: [
      { calculatorSlug: 'power-calculator', title: 'Establish load power', purpose: 'Capture the nominal and worst-case load assumptions.' },
      { calculatorSlug: 'battery-runtime-calculator', title: 'Estimate usable runtime', purpose: 'Apply depth-of-discharge and conversion-efficiency margins.' },
      { calculatorSlug: 'dc-wire-voltage-drop-designer', title: 'Size the supply cable', purpose: 'Check round-trip voltage drop at operating temperature.' },
      { calculatorSlug: 'pcb-trace-voltage-drop-calculator', title: 'Check board copper loss', purpose: 'Record resistance, drop, and dissipation through the PCB path.', optional: true },
    ],
  },
  {
    id: 'regulator-thermal-review',
    name: 'Regulator + thermal review',
    description: 'Capture rail requirements, conversion loss, and the resulting thermal margin.',
    audience: 'Power electronics design review',
    workflow: [
      { calculatorSlug: 'power-calculator', title: 'Define rail demand', purpose: 'Document voltage, current, and output power.' },
      { calculatorSlug: 'regulator-thermal-designer', title: 'Estimate regulator temperature', purpose: 'Check loss, junction temperature, and required thermal resistance.' },
      { calculatorSlug: 'pcb-trace-voltage-drop-calculator', title: 'Check delivery loss', purpose: 'Estimate copper drop between the regulator and the load.' },
      { calculatorSlug: 'led-resistor-designer', title: 'Check indicator load', purpose: 'Include status LED current and resistor dissipation.', optional: true },
    ],
  },
  {
    id: 'three-phase-load-review',
    name: 'Three-phase load review',
    description: 'Record a balanced-load power estimate and the electrical assumptions behind it.',
    audience: 'Industrial equipment estimation',
    workflow: [
      { calculatorSlug: 'three-phase-power-calculator', title: 'Calculate line power', purpose: 'Record kW, kVA, kVAr, power factor, and efficiency.' },
      { calculatorSlug: 'energy-calculator', title: 'Estimate energy use', purpose: 'Convert the operating duty into an energy estimate.' },
      { calculatorSlug: 'frequency-calculator', title: 'Record operating frequency', purpose: 'Capture frequency-related operating assumptions.', optional: true },
    ],
  },
];

const MAX_PROJECTS = 100;
const MAX_ENTRIES_PER_PROJECT = 1_000;
const MAX_EVIDENCE_ITEMS = 100;
const CALCULATOR_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const INPUT_ID_RE = /^[a-zA-Z][a-zA-Z0-9_-]{0,99}$/;

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function isoNow() {
  return new Date().toISOString();
}

function workflowForTemplate(template: WorkspaceTemplate): WorkspaceWorkflowItem[] {
  return template.workflow.map((item) => ({ ...item, id: createId('workflow') }));
}

export function createWorkspaceProject(name = 'My first design', template?: WorkspaceTemplate): WorkspaceProject {
  const timestamp = isoNow();
  return {
    id: createId('project'),
    name: template?.name || name,
    description: template?.description || 'Collect related calculations, assumptions, and design decisions here.',
    status: 'draft',
    workflow: template ? workflowForTemplate(template) : undefined,
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

function isOptionalShortString(value: unknown, maxLength: number) {
  return value === undefined || isShortString(value, maxLength);
}

function isIsoDate(value: unknown): value is string {
  return isShortString(value, 64) && Number.isFinite(Date.parse(value));
}

function isOptionalIsoDate(value: unknown) {
  return value === undefined || isIsoDate(value);
}

function isReviewStatus(value: unknown): value is ReviewStatus {
  return value === 'draft' || value === 'ready-for-review' || value === 'reviewed';
}

function isOptionalReviewStatus(value: unknown) {
  return value === undefined || isReviewStatus(value);
}

function isCalculationInput(value: unknown): value is CalculationInput {
  if (!isRecord(value)) return false;
  return isShortString(value.id, 100) && INPUT_ID_RE.test(value.id) && isShortString(value.label, 160) && isShortString(value.value, 500) && isOptionalShortString(value.reopenValue, 500) && isOptionalShortString(value.unit, 40);
}

function isCalculationOutput(value: unknown): value is CalculationOutput {
  if (!isRecord(value)) return false;
  return isShortString(value.label, 160) && isShortString(value.value, 1_000) && isOptionalShortString(value.unit, 40);
}

function isCalculationStep(value: unknown): value is CalculationStep {
  if (!isRecord(value)) return false;
  return isShortString(value.label, 160) && isShortString(value.value, 2_000);
}

function isOptionalEvidenceArray<T>(value: unknown, guard: (item: unknown) => item is T) {
  return value === undefined || (Array.isArray(value) && value.length <= MAX_EVIDENCE_ITEMS && value.every(guard));
}

function isWorkspaceEntry(value: unknown): value is WorkspaceEntry {
  if (!isRecord(value)) return false;
  return (
    isShortString(value.id, 100) &&
    isShortString(value.calculatorSlug, 120) &&
    CALCULATOR_SLUG_RE.test(value.calculatorSlug) &&
    isShortString(value.calculatorTitle, 160) &&
    isShortString(value.result, 4_000) &&
    isShortString(value.formula, 1_000) &&
    isShortString(value.note, 4_000) &&
    isOptionalEvidenceArray(value.inputs, isCalculationInput) &&
    isOptionalEvidenceArray(value.outputs, isCalculationOutput) &&
    isOptionalEvidenceArray(value.steps, isCalculationStep) &&
    isOptionalShortString(value.warning, 4_000) &&
    isOptionalShortString(value.mode, 100) &&
    isOptionalShortString(value.calculatorVersion, 100) &&
    isOptionalReviewStatus(value.reviewStatus) &&
    isOptionalShortString(value.reviewedBy, 160) &&
    isOptionalIsoDate(value.reviewedAt) &&
    isIsoDate(value.createdAt)
  );
}

function isWorkflowItem(value: unknown): value is WorkspaceWorkflowItem {
  if (!isRecord(value)) return false;
  return (
    isShortString(value.id, 100) &&
    isShortString(value.calculatorSlug, 120) &&
    CALCULATOR_SLUG_RE.test(value.calculatorSlug) &&
    isShortString(value.title, 160) &&
    isShortString(value.purpose, 1_000) &&
    (value.optional === undefined || typeof value.optional === 'boolean')
  );
}

function isWorkspaceProject(value: unknown): value is WorkspaceProject {
  if (!isRecord(value) || !Array.isArray(value.entries)) return false;
  return (
    isShortString(value.id, 100) &&
    isShortString(value.name, 120) &&
    isShortString(value.description, 1_000) &&
    isOptionalReviewStatus(value.status) &&
    isOptionalShortString(value.reviewedBy, 160) &&
    isOptionalIsoDate(value.reviewedAt) &&
    (value.workflow === undefined || (Array.isArray(value.workflow) && value.workflow.length <= 30 && value.workflow.every(isWorkflowItem))) &&
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
  const createAndPersist = () => {
    const fresh = createWorkspaceDocument();
    try {
      window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // The caller can still use the in-memory document and writeWorkspace
      // will surface a storage failure when a change is committed.
    }
    return fresh;
  };
  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return createAndPersist();
    const parsed: unknown = JSON.parse(raw);
    return isWorkspaceDocument(parsed) ? parsed : createAndPersist();
  } catch {
    return createAndPersist();
  }
}

export function writeWorkspace(document: WorkspaceDocument) {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(document));
    window.dispatchEvent(new CustomEvent('engcalc:workspace-updated'));
    return true;
  } catch {
    return false;
  }
}

export function addProject(document: WorkspaceDocument, name?: string, template?: WorkspaceTemplate): WorkspaceDocument {
  if (document.projects.length >= MAX_PROJECTS) return document;
  const project = createWorkspaceProject(name || `Design ${document.projects.length + 1}`, template);
  return {
    ...document,
    activeProjectId: project.id,
    updatedAt: project.updatedAt,
    projects: [...document.projects, project],
  };
}

export function duplicateProject(document: WorkspaceDocument, projectId: string): WorkspaceDocument {
  if (document.projects.length >= MAX_PROJECTS) return document;
  const source = document.projects.find((project) => project.id === projectId);
  if (!source) return document;
  const timestamp = isoNow();
  const duplicate: WorkspaceProject = {
    ...source,
    id: createId('project'),
    name: `${source.name} (copy)`.slice(0, 120),
    status: 'draft',
    reviewedBy: undefined,
    reviewedAt: undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
    workflow: source.workflow?.map((item) => ({ ...item, id: createId('workflow') })),
    entries: source.entries.map((entry) => ({
      ...entry,
      id: createId('calculation'),
      reviewStatus: 'draft',
      reviewedBy: undefined,
      reviewedAt: undefined,
      createdAt: timestamp,
    })),
  };
  return {
    ...document,
    activeProjectId: duplicate.id,
    updatedAt: timestamp,
    projects: [...document.projects, duplicate],
  };
}

function clipEvidence(snapshot: CalculationSnapshot): CalculationEvidence {
  return {
    inputs: snapshot.inputs?.slice(0, MAX_EVIDENCE_ITEMS).map((input) => ({
      id: input.id.slice(0, 100),
      label: input.label.slice(0, 160),
      value: input.value.slice(0, 500),
      reopenValue: input.reopenValue?.slice(0, 500),
      unit: input.unit?.slice(0, 40),
    })),
    outputs: snapshot.outputs?.slice(0, MAX_EVIDENCE_ITEMS).map((output) => ({
      label: output.label.slice(0, 160),
      value: output.value.slice(0, 1_000),
      unit: output.unit?.slice(0, 40),
    })),
    steps: snapshot.steps?.slice(0, MAX_EVIDENCE_ITEMS).map((step) => ({
      label: step.label.slice(0, 160),
      value: step.value.slice(0, 2_000),
    })),
    warning: snapshot.warning?.slice(0, 4_000),
    mode: snapshot.mode?.slice(0, 100),
    calculatorVersion: snapshot.calculatorVersion?.slice(0, 100),
  };
}

export function tryAddCalculation(
  document: WorkspaceDocument,
  snapshot: CalculationSnapshot,
  projectId = document.activeProjectId,
): AddCalculationResult {
  const targetProject = document.projects.find((project) => project.id === projectId);
  if (!targetProject) {
    return { ok: false, document, reason: 'project-not-found' };
  }
  if (targetProject.entries.length >= MAX_ENTRIES_PER_PROJECT) {
    return { ok: false, document, reason: 'project-capacity-reached' };
  }

  const timestamp = isoNow();
  const entry: WorkspaceEntry = {
    id: createId('calculation'),
    calculatorSlug: snapshot.calculatorSlug.slice(0, 120),
    calculatorTitle: snapshot.calculatorTitle.slice(0, 160),
    result: snapshot.result.slice(0, 4_000),
    formula: snapshot.formula.slice(0, 1_000),
    note: '',
    reviewStatus: 'draft',
    ...clipEvidence(snapshot),
    createdAt: timestamp,
  };

  const projects = document.projects.map((project) => {
    if (project.id !== projectId) {
      return project;
    }
    return { ...project, updatedAt: timestamp, entries: [entry, ...project.entries] };
  });

  return {
    ok: true,
    document: { ...document, activeProjectId: projectId, updatedAt: timestamp, projects },
  };
}

export function addCalculation(
  document: WorkspaceDocument,
  snapshot: CalculationSnapshot,
  projectId = document.activeProjectId,
): WorkspaceDocument {
  return tryAddCalculation(document, snapshot, projectId).document;
}

export function mergeWorkspaceDocumentsWithResult(
  current: WorkspaceDocument,
  imported: WorkspaceDocument,
): WorkspaceMergeResult {
  const available = Math.max(0, MAX_PROJECTS - current.projects.length);
  if (available === 0) {
    return { document: current, importedCount: 0, skippedCount: imported.projects.length };
  }
  const timestamp = isoNow();
  const projects = imported.projects.slice(0, available).map((project) => ({
    ...project,
    id: createId('project'),
    name: `${project.name} (imported)`.slice(0, 120),
    // Imported review claims have no trusted provenance on this device.
    status: 'draft' as const,
    reviewedBy: undefined,
    reviewedAt: undefined,
    workflow: project.workflow?.map((item) => ({ ...item, id: createId('workflow') })),
    createdAt: timestamp,
    updatedAt: timestamp,
    entries: project.entries.map((entry) => ({
      ...entry,
      id: createId('calculation'),
      reviewStatus: 'draft' as const,
      reviewedBy: undefined,
      reviewedAt: undefined,
    })),
  }));
  if (projects.length === 0) {
    return { document: current, importedCount: 0, skippedCount: 0 };
  }
  return {
    document: {
      ...current,
      activeProjectId: projects[0].id,
      updatedAt: timestamp,
      projects: [...current.projects, ...projects],
    },
    importedCount: projects.length,
    skippedCount: Math.max(0, imported.projects.length - projects.length),
  };
}

export function mergeWorkspaceDocuments(current: WorkspaceDocument, imported: WorkspaceDocument): WorkspaceDocument {
  return mergeWorkspaceDocumentsWithResult(current, imported).document;
}

export function createReopenUrl(entry: WorkspaceEntry) {
  const params = new URLSearchParams();
  for (const input of entry.inputs || []) params.set(input.id, input.reopenValue ?? input.value);
  if (entry.mode) params.set('mode', entry.mode);
  const query = params.toString();
  return `/${entry.calculatorSlug}${query ? `?${query}` : ''}`;
}

export function isWorkflowItemComplete(project: WorkspaceProject, item: WorkspaceWorkflowItem) {
  return project.entries.some((entry) => entry.calculatorSlug === item.calculatorSlug);
}

export function escapeCsv(value: string) {
  // Quoting is not enough to prevent spreadsheet formula execution. Prefix
  // formula-like cells so a shared export remains text when opened in Excel,
  // Numbers, or Google Sheets.
  const firstVisibleCharacter = value.trimStart().charAt(0);
  const safeValue = ['=', '+', '-', '@'].includes(firstVisibleCharacter) ? `'${value}` : value;
  return `"${safeValue.replaceAll('"', '""')}"`;
}

function evidenceLine(entry: WorkspaceEntry, key: 'inputs' | 'outputs' | 'steps') {
  const items = entry[key] || [];
  return items.map((item) => {
    if ('unit' in item && typeof item.unit === 'string') {
      return `${item.label}: ${item.value} ${item.unit}`;
    }
    return `${item.label}: ${item.value}`;
  }).join('\n');
}

export function projectToCsv(project: WorkspaceProject) {
  const header = ['Created', 'Review status', 'Calculator', 'Inputs', 'Formula', 'Result', 'Outputs', 'Steps', 'Warnings', 'Notes'];
  const rows = project.entries.map((entry) => [
    entry.createdAt,
    entry.reviewStatus || 'draft',
    entry.calculatorTitle,
    evidenceLine(entry, 'inputs'),
    entry.formula,
    entry.result,
    evidenceLine(entry, 'outputs'),
    evidenceLine(entry, 'steps'),
    entry.warning || '',
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
