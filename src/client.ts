/**
 * WebRobot Node.js SDK — https://api.webrobot.eu (138 paths, OpenAPI 3.0).
 * Uses Node.js 18+ built-in fetch. No external dependencies.
 */

import { WebRobotClientOptions, WebRobotError } from "./types.js";

export class WebRobotClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly jwt?: string;

  constructor(options: WebRobotClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "https://api.webrobot.eu").replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.jwt = options.jwt;
  }

  // ── internal helpers ────────────────────────────────────────────────────────

  private headers(): Record<string, string> {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (this.apiKey) h["X-API-Key"] = this.apiKey;
    else if (this.jwt) h["Authorization"] = `Bearer ${this.jwt}`;
    return h;
  }

  private buildUrl(path: string, params?: Record<string, unknown>): string {
    let url = this.baseUrl + path;
    if (params) {
      const qs = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&");
      if (qs) url += "?" + qs;
    }
    return url;
  }

  private static enc(s: string): string {
    return encodeURIComponent(s);
  }

  private async request<T = unknown>(
    method: string,
    path: string,
    options: { params?: Record<string, unknown>; body?: unknown } = {},
  ): Promise<T> {
    const url = this.buildUrl(path, options.params);
    const init: RequestInit = {
      method,
      headers: this.headers(),
    };
    if (options.body !== undefined) {
      init.body = JSON.stringify(options.body);
    }
    const resp = await fetch(url, init);
    const text = await resp.text();
    const data = text ? (JSON.parse(text) as T) : (undefined as T);
    if (!resp.ok) throw new WebRobotError(resp.status, data);
    return data;
  }

  private get<T = unknown>(path: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>("GET", path, { params });
  }

  private post<T = unknown>(path: string, body?: unknown, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>("POST", path, { body, params });
  }

  private put<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PUT", path, { body });
  }

  private delete<T = unknown>(path: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>("DELETE", path, { params });
  }

  // ── Health ──────────────────────────────────────────────────────────────────

  health(): Promise<unknown> {
    return this.get("/health");
  }

  // ── Projects ────────────────────────────────────────────────────────────────

  projectsList(): Promise<unknown[]> {
    return this.get("/webrobot/api/projects");
  }

  projectCreate(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/projects", body);
  }

  projectGet(projectId: string): Promise<unknown> {
    return this.get(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}`);
  }

  projectUpdate(projectId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.put(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}`, body);
  }

  projectDelete(projectId: string): Promise<unknown> {
    return this.delete(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}`);
  }

  projectGetByName(projectName: string): Promise<unknown> {
    return this.get(`/webrobot/api/projects/${WebRobotClient.enc(projectName)}`);
  }

  projectGetMetrics(projectId: string, params?: { startTime?: string; endTime?: string }): Promise<unknown> {
    return this.get(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/metrics`, params);
  }

  projectGetSchedule(projectId: string): Promise<unknown> {
    return this.get(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/schedule`);
  }

  projectSetSchedule(projectId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.put(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/schedule`, body);
  }

  // ── Jobs ────────────────────────────────────────────────────────────────────

  jobsList(projectId: string): Promise<unknown[]> {
    return this.get(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs`);
  }

  jobCreate(projectId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.post(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs`, body);
  }

  jobGet(projectId: string, jobId: string): Promise<unknown> {
    return this.get(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}`);
  }

  jobUpdate(projectId: string, jobId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.put(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}`, body);
  }

  jobDelete(projectId: string, jobId: string): Promise<unknown> {
    return this.delete(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}`);
  }

  jobExecute(projectId: string, jobId: string, body: Record<string, unknown> = {}): Promise<unknown> {
    return this.post(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}/execute`, body);
  }

  jobStop(projectId: string, jobId: string): Promise<unknown> {
    return this.post(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}/stop`);
  }

  jobGetLogs(projectId: string, jobId: string, params?: {
    taskId?: string; podType?: string; executorIndex?: number; podName?: string; tail?: number;
  }): Promise<unknown> {
    return this.get(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}/logs`, params);
  }

  jobGetMetrics(projectId: string, jobId: string, params?: { startTime?: string; endTime?: string }): Promise<unknown> {
    return this.get(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}/metrics`, params);
  }

  jobCompletionWebhook(projectId: string, jobId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.post(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}/completion`, body);
  }

  // ── Tasks ───────────────────────────────────────────────────────────────────

  tasksList(projectId: string, jobId: string): Promise<unknown[]> {
    return this.get(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}/tasks`);
  }

  taskCreate(projectId: string, jobId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.post(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}/tasks`, body);
  }

  taskGet(projectId: string, jobId: string, taskId: string): Promise<unknown> {
    return this.get(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}/tasks/${WebRobotClient.enc(taskId)}`);
  }

  taskUpdate(projectId: string, jobId: string, taskId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.put(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}/tasks/${WebRobotClient.enc(taskId)}`, body);
  }

  taskDelete(projectId: string, jobId: string, taskId: string): Promise<unknown> {
    return this.delete(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}/tasks/${WebRobotClient.enc(taskId)}`);
  }

  taskStart(projectId: string, jobId: string, taskId: string): Promise<unknown> {
    return this.post(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}/tasks/${WebRobotClient.enc(taskId)}/start`);
  }

  taskStop(projectId: string, jobId: string, taskId: string): Promise<unknown> {
    return this.post(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}/tasks/${WebRobotClient.enc(taskId)}/stop`);
  }

  taskGetStatus(projectId: string, jobId: string, taskId: string): Promise<unknown> {
    return this.get(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}/tasks/${WebRobotClient.enc(taskId)}/status`);
  }

  taskGetMetrics(projectId: string, jobId: string, taskId: string): Promise<unknown> {
    return this.get(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}/tasks/${WebRobotClient.enc(taskId)}/metrics`);
  }

  // ── Executions ──────────────────────────────────────────────────────────────

  executionGetStatus(projectId: string, jobId: string, executionId: string): Promise<unknown> {
    return this.get(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}/executions/${WebRobotClient.enc(executionId)}/status`);
  }

  executionGetLogs(projectId: string, jobId: string, executionId: string, params?: {
    podType?: string; executorIndex?: number; podName?: string; tail?: number;
  }): Promise<unknown> {
    return this.get(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}/executions/${WebRobotClient.enc(executionId)}/logs`, params);
  }

  executionCancel(projectId: string, jobId: string, executionId: string): Promise<unknown> {
    return this.delete(`/webrobot/api/projects/id/${WebRobotClient.enc(projectId)}/jobs/${WebRobotClient.enc(jobId)}/executions/${WebRobotClient.enc(executionId)}`);
  }

  // ── Categories ──────────────────────────────────────────────────────────────

  categoriesList(): Promise<unknown[]> {
    return this.get("/webrobot/api/categories");
  }

  categoryCreate(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/categories", body);
  }

  categoryGet(categoryId: string): Promise<unknown> {
    return this.get(`/webrobot/api/categories/id/${WebRobotClient.enc(categoryId)}`);
  }

  categoryUpdate(categoryId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.put(`/webrobot/api/categories/id/${WebRobotClient.enc(categoryId)}`, body);
  }

  categoryDelete(categoryId: string): Promise<unknown> {
    return this.delete(`/webrobot/api/categories/id/${WebRobotClient.enc(categoryId)}`);
  }

  categoryGetByName(categoryName: string): Promise<unknown> {
    return this.get(`/webrobot/api/categories/${WebRobotClient.enc(categoryName)}`);
  }

  // ── Agents ──────────────────────────────────────────────────────────────────

  agentsList(categoryId: string): Promise<unknown[]> {
    return this.get(`/webrobot/api/agents/${WebRobotClient.enc(categoryId)}`);
  }

  agentCreate(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/agents", body);
  }

  agentGet(categoryId: string, agentId: string): Promise<unknown> {
    return this.get(`/webrobot/api/agents/${WebRobotClient.enc(categoryId)}/${WebRobotClient.enc(agentId)}`);
  }

  agentUpdate(categoryId: string, agentId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.put(`/webrobot/api/agents/${WebRobotClient.enc(categoryId)}/${WebRobotClient.enc(agentId)}`, body);
  }

  agentDelete(agentId: string): Promise<unknown> {
    return this.delete(`/webrobot/api/agents/${WebRobotClient.enc(agentId)}`);
  }

  agentGetByName(categoryId: string, agentName: string): Promise<unknown> {
    return this.get(`/webrobot/api/agents/${WebRobotClient.enc(categoryId)}/name/${WebRobotClient.enc(agentName)}`);
  }

  agentCopy(agentId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.post(`/webrobot/api/agents/${WebRobotClient.enc(agentId)}/copy`, body);
  }

  // ── Datasets (v2) ───────────────────────────────────────────────────────────

  datasetsList(params?: { type?: string; indexed?: boolean; format?: string }): Promise<unknown[]> {
    return this.get("/webrobot/api/datasets", params as Record<string, unknown>);
  }

  datasetCreate(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/datasets", body);
  }

  datasetGet(datasetId: string): Promise<unknown> {
    return this.get(`/webrobot/api/datasets/${WebRobotClient.enc(datasetId)}`);
  }

  datasetUpdate(datasetId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.put(`/webrobot/api/datasets/${WebRobotClient.enc(datasetId)}`, body);
  }

  datasetDelete(datasetId: string): Promise<unknown> {
    return this.delete(`/webrobot/api/datasets/${WebRobotClient.enc(datasetId)}`);
  }

  datasetGetFields(datasetId: string): Promise<unknown> {
    return this.get(`/webrobot/api/datasets/${WebRobotClient.enc(datasetId)}/fields`);
  }

  datasetIndex(datasetId: string): Promise<unknown> {
    return this.post(`/webrobot/api/datasets/${WebRobotClient.enc(datasetId)}/index`);
  }

  datasetQuery(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/datasets/query", body);
  }

  datasetQueryByTask(taskId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.post(`/webrobot/api/datasets/query/task/${WebRobotClient.enc(taskId)}`, body);
  }

  datasetGetInfoByTask(taskId: string): Promise<unknown> {
    return this.get(`/webrobot/api/datasets/query/task/${WebRobotClient.enc(taskId)}/info`);
  }

  datasetGetTaskByOutput(datasetId: string): Promise<unknown> {
    return this.get(`/webrobot/api/datasets/query/by-dataset/${WebRobotClient.enc(datasetId)}/task`);
  }

  datasetListTables(params?: { catalog?: string; schema?: string }): Promise<unknown> {
    return this.get("/webrobot/api/datasets/query/tables", params as Record<string, unknown>);
  }

  datasetGetColumns(params?: { catalog?: string; schema?: string; table?: string }): Promise<unknown> {
    return this.get("/webrobot/api/datasets/query/columns", params as Record<string, unknown>);
  }

  datasetUploadFile(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/datasets/upload", body);
  }

  // ── Datasets Legacy ─────────────────────────────────────────────────────────

  datasetsLegacyList(status?: string): Promise<unknown[]> {
    return this.get("/webrobot/api/datasets-legacy/datasets", status ? { status } : undefined);
  }

  datasetLegacyGetStatus(datasetId: string): Promise<unknown> {
    return this.get(`/webrobot/api/datasets-legacy/datasets/${WebRobotClient.enc(datasetId)}/status`);
  }

  datasetLegacyGetVersions(datasetId: string): Promise<unknown[]> {
    return this.get(`/webrobot/api/datasets-legacy/${WebRobotClient.enc(datasetId)}/versions`);
  }

  datasetLegacyGetVersion(versionsetId: string): Promise<unknown> {
    return this.get(`/webrobot/api/datasets-legacy/version/id/${WebRobotClient.enc(versionsetId)}`);
  }

  datasetLegacyDeleteVersion(versionsetId: string): Promise<unknown> {
    return this.delete(`/webrobot/api/datasets-legacy/version/id/${WebRobotClient.enc(versionsetId)}`);
  }

  datasetLegacyUpload(projectId: string, botId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.post(`/webrobot/api/datasets-legacy/${WebRobotClient.enc(projectId)}/${WebRobotClient.enc(botId)}`, body);
  }

  datasetLegacyGet(projectId: string, botId: string, datasetId: string): Promise<unknown> {
    return this.get(`/webrobot/api/datasets-legacy/${WebRobotClient.enc(projectId)}/${WebRobotClient.enc(botId)}/${WebRobotClient.enc(datasetId)}`);
  }

  datasetLegacyDelete(projectId: string, botId: string, datasetId: string): Promise<unknown> {
    return this.delete(`/webrobot/api/datasets-legacy/${WebRobotClient.enc(projectId)}/${WebRobotClient.enc(botId)}/${WebRobotClient.enc(datasetId)}`);
  }

  datasetLegacyGetInputUrl(projectId: string, botId: string, datasetId: string): Promise<unknown> {
    return this.get(`/webrobot/api/datasets-legacy/${WebRobotClient.enc(projectId)}/${WebRobotClient.enc(botId)}/${WebRobotClient.enc(datasetId)}/input/url`);
  }

  // ── Cloud Credentials ────────────────────────────────────────────────────────

  cloudCredentialsList(params?: { provider?: string; page?: number; pageSize?: number }): Promise<unknown[]> {
    return this.get("/webrobot/api/cloud-credentials", params as Record<string, unknown>);
  }

  cloudCredentialCreate(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/cloud-credentials", body);
  }

  cloudCredentialGet(credentialId: string): Promise<unknown> {
    return this.get(`/webrobot/api/cloud-credentials/id/${WebRobotClient.enc(credentialId)}`);
  }

  cloudCredentialUpdate(credentialId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.put(`/webrobot/api/cloud-credentials/id/${WebRobotClient.enc(credentialId)}`, body);
  }

  cloudCredentialDelete(credentialId: string): Promise<unknown> {
    return this.delete(`/webrobot/api/cloud-credentials/id/${WebRobotClient.enc(credentialId)}`);
  }

  cloudCredentialsByProvider(provider: string): Promise<unknown[]> {
    return this.get(`/webrobot/api/cloud-credentials/provider/${WebRobotClient.enc(provider)}`);
  }

  cloudCredentialTest(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/cloud-credentials/test", body);
  }

  cloudCredentialDecryptField(credentialId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.post(`/webrobot/api/cloud-credentials/id/${WebRobotClient.enc(credentialId)}/decrypt-field`, body);
  }

  // ── Auth ────────────────────────────────────────────────────────────────────

  authMe(): Promise<unknown> {
    return this.get("/webrobot/api/auth/me");
  }

  apiKeysList(params?: { organization?: string; organization_code?: string }): Promise<unknown[]> {
    return this.get("/webrobot/api/auth/api-keys", params as Record<string, unknown>);
  }

  apiKeyCreate(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/auth/api-keys", body);
  }

  apiKeyDelete(keyId: string): Promise<unknown> {
    return this.delete(`/webrobot/api/auth/api-keys/${WebRobotClient.enc(keyId)}`);
  }

  organizationCreate(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/auth/organizations", body);
  }

  organizationGet(orgId: string): Promise<unknown> {
    return this.get(`/webrobot/api/auth/organizations/${WebRobotClient.enc(orgId)}`);
  }

  organizationUpdate(orgId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.put(`/webrobot/api/auth/organizations/${WebRobotClient.enc(orgId)}`, body);
  }

  organizationGetUsers(orgId: string): Promise<unknown[]> {
    return this.get(`/webrobot/api/auth/organizations/${WebRobotClient.enc(orgId)}/users`);
  }

  organizationAssignUser(orgId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.post(`/webrobot/api/auth/organizations/${WebRobotClient.enc(orgId)}/assign-user`, body);
  }

  organizationBillingRefresh(): Promise<unknown> {
    return this.post("/webrobot/api/auth/organizations/billing/refresh", {});
  }

  userInvitesList(): Promise<unknown[]> {
    return this.get("/webrobot/api/auth/user-invites");
  }

  userInviteDelete(inviteId: string): Promise<unknown> {
    return this.delete(`/webrobot/api/auth/user-invites/${WebRobotClient.enc(inviteId)}`);
  }

  partnersGetByType(partnerType: string): Promise<unknown[]> {
    return this.get(`/webrobot/api/auth/partners/${WebRobotClient.enc(partnerType)}`);
  }

  // ── Billing ─────────────────────────────────────────────────────────────────

  billingPlansList(params?: { organizationId?: string; standard?: boolean }): Promise<unknown[]> {
    return this.get("/webrobot/api/billing/plans", params as Record<string, unknown>);
  }

  billingPlanCreate(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/billing/plans", body);
  }

  billingPlanUpdate(planId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.put(`/webrobot/api/billing/plans/${WebRobotClient.enc(planId)}`, body);
  }

  billingPlanDelete(planId: string): Promise<unknown> {
    return this.delete(`/webrobot/api/billing/plans/${WebRobotClient.enc(planId)}`);
  }

  billingCustomPlanCreate(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/billing/custom-plan", body);
  }

  // ── Admin ───────────────────────────────────────────────────────────────────

  adminEtlVersionsList(params?: { buildType?: string; activeOnly?: boolean }): Promise<unknown[]> {
    return this.get("/webrobot/api/admin/etl-library-versions", params as Record<string, unknown>);
  }

  adminEtlVersionCreate(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/admin/etl-library-versions", body);
  }

  adminEtlVersionGet(versionId: string): Promise<unknown> {
    return this.get(`/webrobot/api/admin/etl-library-versions/id/${WebRobotClient.enc(versionId)}`);
  }

  adminEtlVersionUpdate(versionId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.put(`/webrobot/api/admin/etl-library-versions/id/${WebRobotClient.enc(versionId)}`, body);
  }

  adminEtlVersionDelete(versionId: string): Promise<unknown> {
    return this.delete(`/webrobot/api/admin/etl-library-versions/id/${WebRobotClient.enc(versionId)}`);
  }

  adminPluginInstallationsList(params?: { organizationId?: string; enabledOnly?: boolean }): Promise<unknown[]> {
    return this.get("/webrobot/api/admin/plugin-installations", params as Record<string, unknown>);
  }

  adminPluginInstallationCreate(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/admin/plugin-installations", body);
  }

  adminPluginInstallationGet(installationId: string): Promise<unknown> {
    return this.get(`/webrobot/api/admin/plugin-installations/${WebRobotClient.enc(installationId)}`);
  }

  adminPluginInstallationUpdate(installationId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.put(`/webrobot/api/admin/plugin-installations/${WebRobotClient.enc(installationId)}`, body);
  }

  adminPluginInstallationDelete(installationId: string): Promise<unknown> {
    return this.delete(`/webrobot/api/admin/plugin-installations/${WebRobotClient.enc(installationId)}`);
  }

  adminPluginInstallationEnable(installationId: string): Promise<unknown> {
    return this.post(`/webrobot/api/admin/plugin-installations/${WebRobotClient.enc(installationId)}/enable`);
  }

  adminPluginInstallationDisable(installationId: string): Promise<unknown> {
    return this.post(`/webrobot/api/admin/plugin-installations/${WebRobotClient.enc(installationId)}/disable`);
  }

  adminPluginInstallationReload(): Promise<unknown> {
    return this.post("/webrobot/api/admin/plugin-installations/reload");
  }

  adminPluginsList(buildType?: string): Promise<unknown[]> {
    return this.get("/webrobot/api/admin/plugins", buildType ? { buildType } : undefined);
  }

  adminPluginEnable(pluginId: string, buildType?: string): Promise<unknown> {
    return this.post(`/webrobot/api/admin/plugins/${WebRobotClient.enc(pluginId)}/enable`, undefined, buildType ? { buildType } : undefined);
  }

  adminPluginDisable(pluginId: string, buildType?: string): Promise<unknown> {
    return this.post(`/webrobot/api/admin/plugins/${WebRobotClient.enc(pluginId)}/disable`, undefined, buildType ? { buildType } : undefined);
  }

  adminSystemLogs(params?: {
    service?: string; level?: string; tail?: number; startTime?: string; endTime?: string;
  }): Promise<unknown> {
    return this.get("/webrobot/api/projects/admin/system-logs", params as Record<string, unknown>);
  }

  adminMarkZombies(timeoutHours?: number): Promise<unknown> {
    return this.post("/webrobot/api/projects/admin/tasks/mark-zombies", undefined,
      timeoutHours !== undefined ? { timeoutHours } : undefined);
  }

  // ── AI Providers ─────────────────────────────────────────────────────────────

  aiProvidersList(): Promise<unknown[]> {
    return this.get("/webrobot/api/ai-providers/providers");
  }

  aiProviderModels(provider: string): Promise<unknown[]> {
    return this.get(`/webrobot/api/ai-providers/providers/${WebRobotClient.enc(provider)}/models`);
  }

  aiTrainingStart(provider: string, body: Record<string, unknown>): Promise<unknown> {
    return this.post(`/webrobot/api/ai-providers/providers/${WebRobotClient.enc(provider)}/training`, body);
  }

  aiTrainingGetStatus(provider: string, jobId: string): Promise<unknown> {
    return this.get(`/webrobot/api/ai-providers/providers/${WebRobotClient.enc(provider)}/training/${WebRobotClient.enc(jobId)}/status`);
  }

  aiTrainingGetLogs(provider: string, jobId: string): Promise<unknown> {
    return this.get(`/webrobot/api/ai-providers/providers/${WebRobotClient.enc(provider)}/training/${WebRobotClient.enc(jobId)}/logs`);
  }

  aiTrainingCancel(provider: string, jobId: string): Promise<unknown> {
    return this.delete(`/webrobot/api/ai-providers/providers/${WebRobotClient.enc(provider)}/training/${WebRobotClient.enc(jobId)}`);
  }

  aiCostEstimate(provider: string, body: Record<string, unknown>): Promise<unknown> {
    return this.post(`/webrobot/api/ai-providers/providers/${WebRobotClient.enc(provider)}/cost-estimate`, body);
  }

  aiDatasetUpload(provider: string, body: Record<string, unknown>): Promise<unknown> {
    return this.post(`/webrobot/api/ai-providers/providers/${WebRobotClient.enc(provider)}/datasets`, body);
  }

  aiHuggingfacePublish(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/ai-providers/providers/huggingface/models/publish", body);
  }

  // ── Python Extensions ────────────────────────────────────────────────────────

  pythonExtInfo(): Promise<unknown> {
    return this.get("/webrobot/api/python-extensions/info");
  }

  pythonExtSupportedTypes(): Promise<unknown[]> {
    return this.get("/webrobot/api/python-extensions/supported-types");
  }

  pythonExtListByAgent(agentId: string): Promise<unknown[]> {
    return this.get(`/webrobot/api/python-extensions/agents/${WebRobotClient.enc(agentId)}/python-extensions`);
  }

  pythonExtUpdateAgentExtensions(agentId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.post(`/webrobot/api/python-extensions/agents/${WebRobotClient.enc(agentId)}/python-extensions`, body);
  }

  pythonExtGetAgentExtensions(agentId: string): Promise<unknown> {
    return this.get(`/webrobot/api/python-extensions/agents/${WebRobotClient.enc(agentId)}/extensions`);
  }

  pythonExtRegister(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/python-extensions/python-extensions/register", body);
  }

  pythonExtUpdate(extensionId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.put(`/webrobot/api/python-extensions/python-extensions/${WebRobotClient.enc(extensionId)}`, body);
  }

  pythonExtDelete(extensionId: string): Promise<unknown> {
    return this.delete(`/webrobot/api/python-extensions/python-extensions/${WebRobotClient.enc(extensionId)}`);
  }

  pythonExtValidate(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/python-extensions/validate", body);
  }

  pythonExtProcessYaml(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/python-extensions/process-yaml", body);
  }

  pythonExtGeneratePyspark(extensionId: string): Promise<unknown> {
    return this.post(`/webrobot/api/python-extensions/python-extensions/${WebRobotClient.enc(extensionId)}/generate-pyspark`);
  }

  // ── Cloud (Scheduler / Spark / Training) ─────────────────────────────────────

  cronjobsList(namespace?: string): Promise<unknown[]> {
    return this.get("/webrobot/cloud/scheduler/cronjobs", namespace ? { namespace } : undefined);
  }

  cronjobCreate(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/cloud/scheduler/cronjobs", body);
  }

  cronjobGet(name: string, namespace?: string): Promise<unknown> {
    return this.get(`/webrobot/cloud/scheduler/cronjobs/${WebRobotClient.enc(name)}`, namespace ? { namespace } : undefined);
  }

  cronjobDelete(name: string, namespace?: string): Promise<unknown> {
    return this.delete(`/webrobot/cloud/scheduler/cronjobs/${WebRobotClient.enc(name)}`, namespace ? { namespace } : undefined);
  }

  sparkInfo(): Promise<unknown> {
    return this.get("/webrobot/cloud/spark/info");
  }

  sparkHealth(): Promise<unknown> {
    return this.get("/webrobot/cloud/spark/health");
  }

  sparkCapabilities(): Promise<unknown> {
    return this.get("/webrobot/cloud/spark/capabilities");
  }

  trainingCloudInfo(): Promise<unknown> {
    return this.get("/webrobot/cloud/training/info");
  }

  trainingCloudHealth(): Promise<unknown> {
    return this.get("/webrobot/cloud/training/health");
  }

  // ── Import / Export ──────────────────────────────────────────────────────────

  packageExportAll(): Promise<unknown> {
    return this.get("/webrobot/api/package/export/all");
  }

  packageExportProject(projectId: string): Promise<unknown> {
    return this.get(`/webrobot/api/package/export/id/${WebRobotClient.enc(projectId)}`);
  }

  packageExportOrganization(organizationId: string, body?: Record<string, unknown>): Promise<unknown> {
    if (body) return this.post(`/webrobot/api/package/export/organization/${WebRobotClient.enc(organizationId)}`, body);
    return this.get(`/webrobot/api/package/export/organization/${WebRobotClient.enc(organizationId)}`);
  }

  packageImportAll(body?: Record<string, unknown>): Promise<unknown> {
    if (body) return this.post("/webrobot/api/package/import/all", body);
    return this.get("/webrobot/api/package/import/all");
  }

  packageImportProject(projectId: string, body?: Record<string, unknown>, filename?: string): Promise<unknown> {
    if (body) return this.post(`/webrobot/api/package/import/id/${WebRobotClient.enc(projectId)}`, body, filename ? { filename } : undefined);
    return this.get(`/webrobot/api/package/import/id/${WebRobotClient.enc(projectId)}`);
  }

  packageImportOrganization(organizationId: string, body?: Record<string, unknown>, filename?: string): Promise<unknown> {
    if (body) return this.post(`/webrobot/api/package/import/organization/${WebRobotClient.enc(organizationId)}`, body, filename ? { filename } : undefined);
    return this.get(`/webrobot/api/package/import/organization/${WebRobotClient.enc(organizationId)}`);
  }

  packageGetUploadUrl(): Promise<unknown> {
    return this.get("/webrobot/api/package/upload");
  }

  packageGetDownloadUrl(): Promise<unknown> {
    return this.get("/webrobot/api/package/download");
  }

  // ── ETL entitlements ─────────────────────────────────────────────────────────

  etlGetEntitlements(organizationId?: string): Promise<unknown> {
    return this.get("/webrobot/api/etl/entitlements", organizationId ? { organizationId } : undefined);
  }

  // ── Streaming ────────────────────────────────────────────────────────────────

  streamingRescheduleEvents(body: Record<string, unknown>): Promise<unknown> {
    return this.post("/webrobot/api/streaming/reschedule-events", body);
  }

  // ── Strapi tables ────────────────────────────────────────────────────────────

  strapiList(table: string, params?: { page?: number; pageSize?: number }): Promise<unknown[]> {
    return this.get(`/api/strapi-tables/${WebRobotClient.enc(table)}`, params as Record<string, unknown>);
  }

  strapiInsert(table: string, body: Record<string, unknown>): Promise<unknown> {
    return this.post(`/api/strapi-tables/${WebRobotClient.enc(table)}`, body);
  }

  strapiGet(table: string, recordId: string): Promise<unknown> {
    return this.get(`/api/strapi-tables/${WebRobotClient.enc(table)}/${WebRobotClient.enc(recordId)}`);
  }

  strapiUpdate(table: string, recordId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.put(`/api/strapi-tables/${WebRobotClient.enc(table)}/${WebRobotClient.enc(recordId)}`, body);
  }

  strapiDelete(table: string, recordId: string): Promise<unknown> {
    return this.delete(`/api/strapi-tables/${WebRobotClient.enc(table)}/${WebRobotClient.enc(recordId)}`);
  }

  // ── Manifest (pipeline YAML declarative) ─────────────────────────────────────

  /** POST /webrobot/api/manifest/apply — apply a multi-document YAML manifest. */
  manifestApply(yamlContent: string): Promise<unknown> {
    return this.post("/webrobot/api/manifest/apply", { yaml: yamlContent });
  }

  /** POST /webrobot/api/manifest/validate — validate without applying. */
  manifestValidate(yamlContent: string): Promise<unknown> {
    return this.post("/webrobot/api/manifest/validate", { yaml: yamlContent });
  }

  /** GET /webrobot/api/manifest/export — export resource as manifest YAML. */
  manifestExport(kind: string, nameOrId: string): Promise<unknown> {
    return this.get("/webrobot/api/manifest/export", { kind, id: nameOrId });
  }

  /** GET /webrobot/api/manifest/stages — list available pipeline stages. */
  manifestStagesList(params?: { category?: string; type?: string; search?: string }): Promise<unknown> {
    return this.get("/webrobot/api/manifest/stages", params as Record<string, unknown>);
  }

  /** GET /webrobot/api/manifest/stages/{name} — stage detail. */
  manifestStagesGet(name: string): Promise<unknown> {
    return this.get(`/webrobot/api/manifest/stages/${WebRobotClient.enc(name)}`);
  }
}
