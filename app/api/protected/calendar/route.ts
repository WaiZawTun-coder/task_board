import { pool } from "@/lib/db.lib";
import { headers } from "next/headers";

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  try {
    const userId = (await headers()).get("x-user-id");

    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return Response.json(
        {
          success: false,
          error: "start and end query parameters are required",
        },
        { status: 400 },
      );
    }

    if (!DATE_FORMAT.test(start) || !DATE_FORMAT.test(end)) {
      return Response.json(
        {
          success: false,
          error: "start and end must be in yyyy-MM-dd format",
        },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `SELECT * FROM tasks
       WHERE user_id = $1
         AND due::date >= $2::date
         AND due::date <= $3::date
       ORDER BY due ASC, task_id DESC`,
      [userId, start, end],
    );

    return Response.json({
      success: true,
      data: result.rows,
    });
  } catch (err: unknown) {
    console.error("Calendar get: ", err);
    return Response.json(
      { success: false, error: "Unable to fetch calendar tasks" },
      { status: 500 },
    );
  }
}
