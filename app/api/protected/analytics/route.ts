import { pool } from "@/lib/db.lib";
import { headers } from "next/headers";

const EMPTY_STATUS_COUNTS = {
  pending: 0,
  on_going: 0,
  cancel: 0,
  completed: 0,
};

const EMPTY_PRIORITY_COUNTS = {
  low: 0,
  medium: 0,
  high: 0,
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
          SELECT * FROM tasks WHERE user_id = $1
        ),
        status_counts AS (
          SELECT status, COUNT(*)::int AS count
          FROM user_tasks
          GROUP BY status
        ),
        priority_counts AS (
          SELECT priority, COUNT(*)::int AS count
          FROM user_tasks
          GROUP BY priority
        ),
        project_counts AS (
          SELECT
            p.project_id,
            p.title,
            p.color_hex,
            COUNT(t.task_id)::int AS total,
            COUNT(t.task_id) FILTER (WHERE t.status = 'completed')::int AS completed
          FROM projects p
          LEFT JOIN user_tasks t ON t.project_id = p.project_id
          WHERE p.user_id = $1
          GROUP BY p.project_id, p.title, p.color_hex
          ORDER BY total DESC
        ),
        creation_trend AS (
          SELECT
            d::date AS day,
            COUNT(t.task_id)::int AS count
          FROM generate_series(
            CURRENT_DATE - INTERVAL '13 days',
            CURRENT_DATE,
            INTERVAL '1 day'
          ) AS d
          LEFT JOIN user_tasks t ON t.created_at::date = d::date
          GROUP BY d
        )
        SELECT
          json_build_object(
            'total', (SELECT COUNT(*)::int FROM user_tasks),
            'completed', (SELECT COUNT(*)::int FROM user_tasks WHERE status = 'completed'),
            'overdue', (
              SELECT COUNT(*)::int FROM user_tasks
              WHERE due::date < CURRENT_DATE AND status NOT IN ('completed', 'cancel')
            )
          ) AS overview,
          COALESCE(
            (SELECT json_object_agg(status, count) FROM status_counts),
            '{}'::json
          ) AS status_breakdown,
          COALESCE(
            (SELECT json_object_agg(priority, count) FROM priority_counts),
            '{}'::json
          ) AS priority_breakdown,
          COALESCE(
            (SELECT json_agg(project_counts) FROM project_counts),
            '[]'::json
          ) AS project_breakdown,
          COALESCE(
            (SELECT json_agg(json_build_object('date', day, 'count', count) ORDER BY day) FROM creation_trend),
            '[]'::json
          ) AS creation_trend
      `,
      [userId],
    );

    const row = result.rows[0];
    const overview = row?.overview ?? { total: 0, completed: 0, overdue: 0 };

    return Response.json({
      success: true,
      data: {
        overview: {
          total: overview.total,
          completed: overview.completed,
          overdue: overview.overdue,
          completionRate:
            overview.total > 0
              ? Math.round((overview.completed / overview.total) * 100)
              : 0,
        },
        statusBreakdown: {
          ...EMPTY_STATUS_COUNTS,
          ...(row?.status_breakdown ?? {}),
        },
        priorityBreakdown: {
          ...EMPTY_PRIORITY_COUNTS,
          ...(row?.priority_breakdown ?? {}),
        },
        projectBreakdown: row?.project_breakdown ?? [],
        creationTrend: row?.creation_trend ?? [],
      },
    });
  } catch (err: unknown) {
    console.error("Analytics get: ", err);
    return Response.json(
      { success: false, error: "Unable to fetch analytics" },
      { status: 500 },
    );
  }
}
