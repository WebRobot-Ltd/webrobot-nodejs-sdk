/** WebRobot API — TypeScript types (OpenAPI 3.0, 30 schemas). */

export interface WebRobotClientOptions {
  baseUrl?: string;
  apiKey?: string;
  jwt?: string;
}

// ── Schema types ──────────────────────────────────────────────────────────────

export interface AgentDto {
  id?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface JobCategoryDto {
  id?: string;
  name?: string;
  description?: string;
  [key: string]: unknown;
}

export interface JobDto {
  id?: string;
  name?: string;
  description?: string;
  projectId?: string;
  enabled?: boolean;
  schedule?: string;
  executionMode?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface JobProjectDto {
  id?: string;
  name?: string;
  description?: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface TaskDto {
  id?: string;
  name?: string;
  description?: string;
  jobId?: string;
  botId?: string;
  outputDatasetId?: string;
  taskType?: string;
  executionReferenceId?: string;
  executionStatus?: string;
  executionLog?: string;
  scheduledTime?: string;
  executionMode?: string;
  enabled?: boolean;
  apiKey?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CloudCredential {
  id?: string;
  name?: string;
  description?: string;
  provider?: string;
  organizationId?: string;
  [key: string]: unknown;
}

export interface DatasetDto {
  id?: string;
  name?: string;
  description?: string;
  datasetType?: string;
  format?: string;
  storagePath?: string;
  storageType?: string;
  cloudCredentialId?: number;
  trinoSchema?: string;
  enabled?: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

export interface DatasetUploadApiDto {
  datasetId?: string;
  uploadUrl?: string;
  [key: string]: unknown;
}

export interface DatasetUploadRequest {
  name?: string;
  description?: string;
  type?: string;
  [key: string]: unknown;
}

export interface CronJobRequest {
  name?: string;
  namespace?: string;
  schedule?: string;
  image?: string;
  command?: string[];
  [key: string]: unknown;
}

export interface TrainingRequestBean {
  provider?: string;
  modelId?: string;
  datasetId?: string;
  hyperparameters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ModelPublishRequest {
  modelId?: string;
  provider?: string;
  targetRepo?: string;
  [key: string]: unknown;
}

export interface ProjectScheduleRequest {
  schedule?: string;
  timezone?: string;
  enabled?: boolean;
  [key: string]: unknown;
}

export interface EtlLibraryVersionApiDto {
  id?: string;
  version?: string;
  buildType?: string;
  buildNumber?: string;
  active?: boolean;
  [key: string]: unknown;
}

export interface PluginInstallation {
  id?: string;
  pluginId?: string;
  organizationId?: string;
  enabled?: boolean;
  [key: string]: unknown;
}

export interface ExportOptionsDto {
  includeData?: boolean;
  [key: string]: unknown;
}

export interface ImportOptionsDto {
  overwrite?: boolean;
  [key: string]: unknown;
}

export interface CopyToOrganizationsDto {
  organizationIds?: string[];
  [key: string]: unknown;
}

export interface PrestoQueryRequest {
  sql?: string;
  catalog?: string;
  schema?: string;
  [key: string]: unknown;
}

export interface JobCompletionWebhookRequest {
  executionId?: string;
  status?: string;
  [key: string]: unknown;
}

export interface RescheduleEventsRequest {
  eventIds?: string[];
  [key: string]: unknown;
}

export interface TimePeriod {
  start?: string;
  end?: string;
  [key: string]: unknown;
}

export class WebRobotError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly detail: unknown,
  ) {
    super(`HTTP ${statusCode}: ${JSON.stringify(detail)}`);
    this.name = "WebRobotError";
  }
}
