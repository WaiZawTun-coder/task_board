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

    // Initialize query building arrays
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

    // Combine conditions into the final query string
    if (whereConditions.length > 0) {
      baseQuery += ` WHERE ${whereConditions.join(" AND ")} AND `;
    }

    // Add sorting to keep results organized
    baseQuery += ` ${whereConditions.length === 0 && "WHERE"} user_id = $${paramIndex++} ORDER BY created_at DESC`;
    // Execute your query here using your database client
    const result = await pool.query(baseQuery, [...queryValues, user_id]);

    return Response.json(
      {
        success: true,
        data: result.rows,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error("Tasks get: ", { err });
    return Response.json(
      {
        success: false,
        error: err instanceof Error ? err.message : err,
      },
      { status: 500 },
    );
  }
}
