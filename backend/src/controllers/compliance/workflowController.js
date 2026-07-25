const sdsModel = require("../../models/sdsModel");
const {
  enqueueAutoFixTask,
  approveAutoFixTask,
  rejectAutoFixTask,
  requeueAutoFixTask,
  getTaskById,
  listTasksByUser,
  listAllTasks,
} = require("../../services/compliance/autoFixWorkflowService");
const {
  success,
  notFound,
  badRequest,
  forbidden,
} = require("../../utils/responseHelper");

const startAutoFixWorkflowController = async (req, res) => {
  const sdsId = req.params.id;
  if (!sdsId) return badRequest(res, "SDS id is required");

  const sds = await sdsModel.findById(sdsId);
  if (!sds) return notFound(res, "SDS not found");

  const task = await enqueueAutoFixTask({
    userId: req.user.userId,
    sdsId,
  });
  return success(res, task, "Auto-fix workflow started");
};

const getWorkflowTaskController = async (req, res) => {
  const task = await getTaskById(req.params.taskId);
  if (!task) return notFound(res, "Task not found");
  const canViewAll = ["ehs_manager", "admin"].includes(req.user.role);
  if (!canViewAll && task.user_id !== req.user.userId) {
    return forbidden(res, "Not allowed to view this task");
  }
  return success(res, task);
};

const listWorkflowTasksController = async (req, res) => {
  const limit = parseInt(req.query.limit || "30", 10);
  const scopeAll = req.query.scope === "all";
  const canViewAll = ["ehs_manager", "admin"].includes(req.user.role);
  const tasks = scopeAll && canViewAll
    ? await listAllTasks({ limit })
    : await listTasksByUser(req.user.userId, { limit });
  return success(res, tasks);
};

const approveWorkflowTaskController = async (req, res) => {
  const task = await getTaskById(req.params.taskId);
  if (!task) return notFound(res, "Task not found");
  if (!["ehs_manager", "admin"].includes(req.user.role)) {
    return forbidden(res, "Only EHS Manager or Admin can approve workflow tasks");
  }
  if (task.user_id === req.user.userId) {
    return badRequest(res, "Maker-checker policy: creator cannot self-approve");
  }
  const approved = await approveAutoFixTask({
    taskId: req.params.taskId,
    approvedBy: req.user.userId,
  });
  return success(res, approved, "Workflow task approved and applied");
};

const rejectWorkflowTaskController = async (req, res) => {
  const task = await getTaskById(req.params.taskId);
  if (!task) return notFound(res, "Task not found");
  if (!["ehs_manager", "admin"].includes(req.user.role)) {
    return forbidden(res, "Only EHS Manager or Admin can reject workflow tasks");
  }
  const rejected = await rejectAutoFixTask({
    taskId: req.params.taskId,
    rejectedBy: req.user.userId,
    reason: req.body?.reason,
  });
  return success(res, rejected, "Workflow task rejected");
};

const requeueWorkflowTaskController = async (req, res) => {
  const task = await getTaskById(req.params.taskId);
  if (!task) return notFound(res, "Task not found");
  if (!["ehs_manager", "admin"].includes(req.user.role)) {
    return forbidden(res, "Only EHS Manager or Admin can requeue workflow tasks");
  }
  const requeued = await requeueAutoFixTask({
    taskId: req.params.taskId,
    requestedBy: req.user.userId,
  });
  return success(res, requeued, "Workflow task requeued");
};

module.exports = {
  startAutoFixWorkflowController,
  getWorkflowTaskController,
  listWorkflowTasksController,
  approveWorkflowTaskController,
  rejectWorkflowTaskController,
  requeueWorkflowTaskController,
};
