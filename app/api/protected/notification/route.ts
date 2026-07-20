import { pool } from "@/lib/db.lib";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return Response.json(
        {
          success: false,
          error: "Missing user_id query parameter",
        },
        { status: 400 },
      );
    }

    const query = "SELECT * FROM notifications WHERE user_id = $1";
    const result = await pool.query(query, [userId]);

    return Response.json(
      {
        success: true,
        data: result.rows,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    return Response.json(
      {
        success: false,
        err,
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, notificationId } = body;

    if (!userId) {
      return Response.json(
        {
          success: false,
          error: "Missing user_id query parameter",
        },
        { status: 400 },
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
    await pool.query(query, [userId, notificationId]);

    return Response.json(
      {
        success: true,
        message: "Notification updated successfully",
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    return Response.json(
      {
        success: false,
        err,
      },
      { status: 500 },
    );
  }
}
