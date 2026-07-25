const { randomUUID } = require("crypto");
const { supabaseAdmin } = require("../../config/database");

const TABLE = "notifications";
const fallbackStore = new Map();

const isTableMissingError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("relation") && message.includes("does not exist")
  ) || error?.code === "42P01";
};

const createNotification = async ({
  user_id,
  type = "info",
  title,
  message,
  metadata = {},
}) => {
  const row = {
    id: randomUUID(),
    user_id,
    type,
    title,
    message,
    metadata,
    read_at: null,
    created_at: new Date().toISOString(),
  };
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    if (!isTableMissingError(error)) throw error;
    const userItems = fallbackStore.get(user_id) || [];
    userItems.unshift(row);
    fallbackStore.set(user_id, userItems);
    return row;
  }
};

const listNotifications = async (userId, { limit = 30 } = {}) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (error) {
    if (!isTableMissingError(error)) throw error;
    return (fallbackStore.get(userId) || []).slice(0, limit);
  }
};

const markNotificationRead = async ({ userId, notificationId }) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    if (!isTableMissingError(error)) throw error;
    const list = fallbackStore.get(userId) || [];
    const idx = list.findIndex((n) => n.id === notificationId);
    if (idx >= 0) list[idx] = { ...list[idx], read_at: new Date().toISOString() };
    fallbackStore.set(userId, list);
    return list[idx] || null;
  }
};

const getUnreadCount = async (userId) => {
  try {
    const { count, error } = await supabaseAdmin
      .from(TABLE)
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null);
    if (error) throw error;
    return count || 0;
  } catch (error) {
    if (!isTableMissingError(error)) throw error;
    return (fallbackStore.get(userId) || []).filter((n) => !n.read_at).length;
  }
};

module.exports = {
  createNotification,
  listNotifications,
  markNotificationRead,
  getUnreadCount,
};
