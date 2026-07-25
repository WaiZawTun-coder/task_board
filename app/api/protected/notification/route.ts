import { pool } from "@/lib/db.lib";
import { headers } from "next/headers";

export async function GET() {
  try {
    const userId = (await headers()).get("x-user-id");

    if (!userId) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const query =
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC";
    const result = await pool.query(query, [userId]);

    return Response.json(
      {
        success: true,
        data: result.rows,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error("Notification get: ", err);
    return Response.json(
      {
        success: false,
        error: "Unable to fetch notifications",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { notificationId } = body;
    const userId = (await headers()).get("x-user-id");

    if (!userId) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    if (!notificationId) {
      return Response.json(
        {
          success: false,
          error: "Missing notification_id query parameter",
        },
        { status: 400 },
      );
    }

    const query =
      "UPDATE notifications SET is_read = true WHERE user_id = $1 AND notification_id = $2";
    const result = await pool.query(query, [userId, notificationId]);
    if (result.rowCount === 0) {
      return Response.json(
        { success: false, error: "Notification not found" },
        { status: 404 },
      );
    }

    return Response.json(
      {
        success: true,
        message: "Notification updated successfully",
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error("Notification put: ", err);
    return Response.json(
      {
        success: false,
        error: "Unable to update notification",
      },
      { status: 500 },
    );
  }
}
