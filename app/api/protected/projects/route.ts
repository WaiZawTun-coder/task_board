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

    // extract all posible query parameters
    const searchValue = searchParams.get("search");
    const status = searchParams.get("status");

    let baseQuery = "SELECT * FROM projects";
    const whereConditions: string[] = [];
    const queryValues = [];
    let paramIndex = 1;

    // Match a search term against any text field, then apply other filters.
    if (searchValue) {
      const search = `%${searchValue}%`;
      const titleParam = paramIndex++;
      queryValues.push(search);
      const slug = searchValue.replace(" ", "_");
      const slugParam = paramIndex++;
      queryValues.push(`%${slug}%`);
      const descriptionParam = paramIndex++;
      queryValues.push(search);
      whereConditions.push(
        `(title ILIKE $${titleParam} OR slug ILIKE $${slugParam} OR description ILIKE $${descriptionParam})`,
      );
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex++}`);
      queryValues.push(status);
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
    console.error("Projects get: ", err);
    return Response.json(
      {
        success: false,
        error: "Unable to fetch projects",
      },
      { status: 500 },
    );
  }
}
