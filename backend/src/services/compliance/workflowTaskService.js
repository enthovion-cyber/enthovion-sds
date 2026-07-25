const { randomUUID } = require("crypto");
const { supabaseAdmin } = require("../../config/database");

const tasks = new Map();
const TABLE = "workflow_tasks";
const DEFAULT_MAX_ATTEMPTS = 3;

const isTableMissingError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("relation") && message.includes("does not exist")
  ) || error?.code === "42P01";
};

const tryInsertDbTask = async (task) => {
  const { error } = await supabaseAdmin.from(TABLE).insert(task);
  if (error) throw error;
};

const tryUpdateDbTask = async (id, patch) => {
  const { error } = await supabaseAdmin
    .from(TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
};

const tryGetDbTask = async (id) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

const tryListDbTasks = async (userId, limit) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
};

const tryListAllDbTasks = async (limit) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
};

const createTask = async ({
  type,
  user_id,
  sds_id = null,
  input = {},
  max_attempts = DEFAULT_MAX_ATTEMPTS,
}) => {
  const id = randomUUID();
  const task = {
    id,
    type,
    user_id,
    sds_id,
    status: "queued",
    progress: 0,
    attempts: 0,
    max_attempts,
    next_retry_at: null,
    dead_lettered_at: null,
    input,
    output: null,
    error: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  tasks.set(id, task);
  try {
    await tryInsertDbTask(task);
  } catch (error) {
    if (!isTableMissingError(error)) throw error;
  }
  return task;
};

const updateTask = async (id, patch) => {
  const existing = (await getTaskById(id)) || tasks.get(id);
  if (!existing) return null;
  const next = {
    ...existing,
    ...patch,
    updated_at: new Date().toISOString(),
  };
  tasks.set(id, next);
  try {
    await tryUpdateDbTask(id, patch);
  } catch (error) {
    if (!isTableMissingError(error)) throw error;
  }
  return next;
};

const incrementTaskAttempt = async (id) => {
  const existing = await getTaskById(id);
  if (!existing) return null;
  return updateTask(id, { attempts: (existing.attempts || 0) + 1 });
};

const getTaskById = async (id) => {
  try {
    return await tryGetDbTask(id);
  } catch (error) {
    if (!isTableMissingError(error)) {
      if (error?.code !== "PGRST116") throw error;
    }
  }
  return tasks.get(id) || null;
};

const listTasksByUser = async (userId, { limit = 50 } = {}) => {
  try {
    const dbRows = await tryListDbTasks(userId, limit);
    if (dbRows.length) return dbRows;
  } catch (error) {
    if (!isTableMissingError(error)) throw error;
  }
  return Array.from(tasks.values())
    .filter((t) => t.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
};

const listAllTasks = async ({ limit = 50 } = {}) => {
  try {
    const rows = await tryListAllDbTasks(limit);
    if (rows.length) return rows;
  } catch (error) {
    if (!isTableMissingError(error)) throw error;
  }
  return Array.from(tasks.values())
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
};

module.exports = {
  createTask,
  updateTask,
  incrementTaskAttempt,
  getTaskById,
  listTasksByUser,
  listAllTasks,
};
