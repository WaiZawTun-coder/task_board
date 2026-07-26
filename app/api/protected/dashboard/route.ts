import { pool } from "@/lib/db.lib";
import { headers } from "next/headers";

const EMPTY_COLUMNS = {
  pending: [],
  on_going: [],
  cancel: [],
};

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
          SELECT *
          FROM tasks
          WHERE user_id = $1
        ),
        ranked_tasks AS (
          SELECT
            *,
            ROW_NUMBER() OVER (
              PARTITION BY status
              ORDER BY created_at DESC, task_id DESC
            ) AS status_rank
          FROM user_tasks
        ),
        board_columns AS (
          SELECT
            status,
            json_agg(
              to_jsonb(ranked_tasks) - 'status_rank'
              ORDER BY created_at DESC, task_id DESC
            ) AS tasks
          FROM ranked_tasks
          WHERE status_rank <= 5
          GROUP BY status
        ),
        status_counts AS (
          SELECT status, COUNT(*)::int AS count
          FROM user_tasks
          GROUP BY status
        ),
        project_counts AS (
          SELECT project_id, COUNT(*)::int AS count
          FROM user_tasks
          WHERE project_id IS NOT NULL
          GROUP BY project_id
        ),
        upcoming_tasks AS (
          SELECT *
          FROM user_tasks
          WHERE due >= CURRENT_DATE AND status <> 'cancel'
          ORDER BY due ASC, task_id DESC
          LIMIT 4
        ),
        recent_tasks AS (
          SELECT *
          FROM user_tasks
          ORDER BY created_at DESC, task_id DESC
          LIMIT 4
        )
        SELECT
          COALESCE(
            (SELECT json_object_agg(status, tasks) FROM board_columns),
            '{}'::json
          ) AS columns,
          COALESCE(
            (SELECT json_object_agg(status, count) FROM status_counts),
            '{}'::json
          ) AS counts,
          json_build_object(
            'total', (SELECT COUNT(*)::int FROM user_tasks),
            'overdue', (
              SELECT COUNT(*)::int
              FROM user_tasks
              WHERE due < CURRENT_DATE AND status <> 'cancel'
            )
          ) AS stats,
          COALESCE(
            (SELECT json_agg(upcoming_tasks ORDER BY due ASC, task_id DESC) FROM upcoming_tasks),
            '[]'::json
          ) AS upcoming,
          COALESCE(
            (SELECT json_agg(recent_tasks ORDER BY created_at DESC, task_id DESC) FROM recent_tasks),
            '[]'::json
          ) AS recent,
          COALESCE(
            (SELECT json_object_agg(project_id::text, count) FROM project_counts),
            '{}'::json
          ) AS project_counts
      `,
      [userId],
    );

    const dashboard = result.rows[0];

    return Response.json({
      success: true,
      data: {
        columns: { ...EMPTY_COLUMNS, ...(dashboard?.columns ?? {}) },
        counts: {
          pending: 0,
          on_going: 0,
          cancel: 0,
          ...(dashboard?.counts ?? {}),
        },
        stats: dashboard?.stats ?? { total: 0, overdue: 0 },
        upcoming: dashboard?.upcoming ?? [],
        recent: dashboard?.recent ?? [],
        projectCounts: dashboard?.project_counts ?? {},
      },
    });
  } catch (error) {
    console.error("Dashboard get:", error);
    return Response.json(
      { success: false, error: "Unable to fetch dashboard" },
      { status: 500 },
    );
  }
}
