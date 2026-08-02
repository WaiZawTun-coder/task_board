import { pool } from "@/lib/db.lib";
import { headers } from "next/headers";

export async function GET() {
  try {
    const userId = (await headers()).get("x-user-id");

    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const result = await pool.query(
      `
        WITH user_tasks AS MATERIALIZED (
          SELECT * FROM tasks WHERE user_id = $1
        ),
        today_tasks AS (
          SELECT *
          FROM user_tasks
          WHERE due::date = CURRENT_DATE
        ),
        overdue_tasks AS (
          SELECT *
          FROM user_tasks
          WHERE due::date < CURRENT_DATE AND status NOT IN ('completed', 'cancel')
        )
        SELECT
          COALESCE(
            (SELECT json_agg(t ORDER BY t.status ASC, t.due ASC, t.task_id DESC) FROM today_tasks t),
            '[]'::json
          ) AS today,
          COALESCE(
            (SELECT json_agg(t ORDER BY t.due ASC, t.task_id DESC) FROM overdue_tasks t),
            '[]'::json
          ) AS overdue,
          json_build_object(
            'today_total', (SELECT COUNT(*)::int FROM today_tasks),
            'today_completed', (SELECT COUNT(*)::int FROM today_tasks WHERE status = 'completed'),
            'overdue_total', (SELECT COUNT(*)::int FROM overdue_tasks)
          ) AS stats
      `,
      [userId],
    );

    const row = result.rows[0];

    return Response.json({
      success: true,
      data: {
        today: row?.today ?? [],
        overdue: row?.overdue ?? [],
        stats: row?.stats ?? {
          today_total: 0,
          today_completed: 0,
          overdue_total: 0,
        },
      },
    });
  } catch (err: unknown) {
    console.error("Today get: ", err);
    return Response.json(
      { success: false, error: "Unable to fetch today's tasks" },
      { status: 500 },
    );
  }
}
