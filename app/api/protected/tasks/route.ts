import { pool } from "@/lib/db.lib";
import { headers } from "next/headers";

const taskStatuses = new Set(["pending", "on_going", "cancel"]);
const taskPriorities = new Set(["low", "medium", "high"]);

const SORT_COLUMNS: Record<string, string> = {
  due_asc: "due ASC NULLS LAST",
  due_desc: "due DESC NULLS LAST",
  priority_desc:
    "CASE priority WHEN 'high' THEN 3 WHEN 'medium' THEN 2 WHEN 'low' THEN 1 ELSE 0 END DESC",
  title_asc: "title ASC",
  created_desc: "created_at DESC",
};

export async function GET(request: Request) {
  try {
    const user_id = (await headers()).get("x-user-id");

    if (!user_id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);

    const project_id = searchParams.get("project_id");
    const status = searchParams.get("status");
    const prioritiesParam = searchParams.get("priorities"); // comma-separated
    const search = searchParams.get("search")?.trim();
    const sortParam = searchParams.get("sort") || "created_desc";

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 10),
    );
    const offset = (page - 1) * limit;

    const whereConditions: string[] = [];
    const queryValues: unknown[] = [];
    let paramIndex = 1;

    whereConditions.push(`user_id = $${paramIndex++}`);
    queryValues.push(user_id);

    if (project_id) {
      whereConditions.push(`project_id = $${paramIndex++}`);
      queryValues.push(project_id);
    }

    if (status && taskStatuses.has(status)) {
      whereConditions.push(`status = $${paramIndex++}`);
      queryValues.push(status);
    }

    if (prioritiesParam) {
      const priorities = prioritiesParam
        .split(",")
        .map((p) => p.trim())
        .filter((p) => taskPriorities.has(p));

      if (priorities.length > 0) {
        whereConditions.push(`priority = ANY($${paramIndex++})`);
        queryValues.push(priorities);
      }
    }

    if (search) {
      whereConditions.push(
        `(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`,
      );
      queryValues.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length
      ? `WHERE ${whereConditions.join(" AND ")}`
      : "";

    const orderClause = SORT_COLUMNS[sortParam] ?? SORT_COLUMNS.created_desc;

    // total count (same WHERE, no limit/offset params yet)
    const countQuery = `SELECT COUNT(*)::int AS count FROM tasks ${whereClause}`;
    const countResult = await pool.query(countQuery, queryValues);
    const total: number = countResult.rows[0]?.count ?? 0;

    const dataQuery = `
      SELECT * FROM tasks
      ${whereClause}
      ORDER BY ${orderClause}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    const dataValues = [...queryValues, limit, offset];

    const result = await pool.query(dataQuery, dataValues);

    return Response.json(
      {
        success: true,
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error("Tasks get: ", err);
    return Response.json(
      { success: false, error: "Unable to fetch tasks" },
      { status: 500 },
    );
  }
}
