import { pool } from "@/lib/db.lib";
import { headers } from "next/headers";

const NOTIFICATION_TYPES = new Set(["success", "error", "info"]);

async function getUserId() {
  return (await headers()).get("x-user-id");
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "unread" | "read" | null (=all)
    const type = searchParams.get("type");

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit")) || 10),
    );
    const offset = (page - 1) * limit;

    const whereConditions: string[] = ["user_id = $1"];
    const values: unknown[] = [userId];
    let paramIndex = 2;

    if (status === "unread") {
      whereConditions.push("is_read = false");
    } else if (status === "read") {
      whereConditions.push("is_read = true");
    }

    if (type && NOTIFICATION_TYPES.has(type)) {
      whereConditions.push(`type = $${paramIndex++}`);
      values.push(type);
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    const countQuery = `SELECT COUNT(*)::int AS count FROM notifications ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total: number = countResult.rows[0]?.count ?? 0;

    const dataQuery = `
      SELECT * FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    const result = await pool.query(dataQuery, [...values, limit, offset]);

    // always the true unread count for the user, independent of the
    // status/type filters above, so the badge stays accurate
    const unreadResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = false",
      [userId],
    );
    const unreadCount: number = unreadResult.rows[0]?.count ?? 0;

    return Response.json({
      success: true,
      data: result.rows,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err: unknown) {
    console.error("Notification get: ", err);
    return Response.json(
      { success: false, error: "Unable to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await pool.query(
        "UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false",
        [userId],
      );
      return Response.json({
        success: true,
        message: "All notifications marked as read",
      });
    }

    if (!notificationId) {
      return Response.json(
        { success: false, error: "Missing notification_id" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      "UPDATE notifications SET is_read = true WHERE user_id = $1 AND notification_id = $2",
      [userId, notificationId],
    );
    if (result.rowCount === 0) {
      return Response.json(
        { success: false, error: "Notification not found" },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      message: "Notification updated successfully",
    });
  } catch (err: unknown) {
    console.error("Notification put: ", err);
    return Response.json(
      { success: false, error: "Unable to update notification" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { notificationId, clearRead } = body;

    if (clearRead) {
      const result = await pool.query(
        "DELETE FROM notifications WHERE user_id = $1 AND is_read = true",
        [userId],
      );
      return Response.json({
        success: true,
        message: `${result.rowCount ?? 0} notification(s) removed`,
      });
    }

    if (!notificationId) {
      return Response.json(
        { success: false, error: "Notification id is required" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      "DELETE FROM notifications WHERE user_id = $1 AND notification_id = $2",
      [userId, notificationId],
    );
    if (result.rowCount === 0) {
      return Response.json(
        { success: false, error: "Notification not found" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, message: "Notification removed" });
  } catch (err: unknown) {
    console.error("Notification delete: ", err);
    return Response.json(
      { success: false, error: "Unable to delete notification" },
      { status: 500 },
    );
  }
}
