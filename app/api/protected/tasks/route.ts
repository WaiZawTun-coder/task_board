import { pool } from "@/lib/db.lib";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const user_id = (await headers()).get("x-user-id");

    if (!user_id) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);

    // Extract all possible query parameters
    const project_id = searchParams.get("project_id");
    const title = searchParams.get("title");
    const description = searchParams.get("description");
    const due = searchParams.get("due");

    let baseQuery = "SELECT * FROM tasks";
    const whereConditions: string[] = [];
    const queryValues = [];
    let paramIndex = 1;

    // 3. Conditionally append filters if they exist in the URL
    if (project_id) {
      whereConditions.push(`project_id = $${paramIndex++}`);
      queryValues.push(project_id);
    }

    if (due) {
      whereConditions.push(`due = $${paramIndex++}`);
      queryValues.push(due);
    }

    // Use ILIKE for partial, case-insensitive text searching
    if (title) {
      whereConditions.push(`title ILIKE $${paramIndex++}`);
      queryValues.push(`%${title}%`);
    }
    if (description) {
      whereConditions.push(`description ILIKE $${paramIndex++}`);
      queryValues.push(`%${description}%`);
    }

    whereConditions.push(`user_id = $${paramIndex++}`);
    baseQuery += ` WHERE ${whereConditions.join(" AND ")} ORDER BY created_at DESC`;
    const result = await pool.query(baseQuery, [...queryValues, user_id]);

    return Response.json(
      {
        success: true,
        data: result.rows,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error("Tasks get: ", err);
    return Response.json(
      {
        success: false,
        error: "Unable to fetch tasks",
      },
      { status: 500 },
    );
  }
}
