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

    // title, slug, description, status
    if (searchValue) {
      // title
      whereConditions.push(`title ILIKE $${paramIndex++}`);
      queryValues.push(searchValue);

      // slug
      const slug = searchValue.replace(" ", "_");
      whereConditions.push(`slug ILIKE $${paramIndex++}`);
      queryValues.push(slug);

      // description
      whereConditions.push(`description ILIKE $${paramIndex++} `);
      queryValues.push(searchValue);
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex++}`);
      queryValues.push(status);
    }

    if (whereConditions.length > 0) {
      baseQuery += ` WHERE ${whereConditions.join(" AND ")} AND `;
    }

    baseQuery += ` ${whereConditions.length === 0 && "WHERE"} user_id = $${paramIndex++} ORDER BY created_at DESC`;

    const result = await pool.query(baseQuery, [...queryValues, user_id]);

    return Response.json(
      {
        success: true,
        data: result.rows,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error("Projects get: ", { err });
    return Response.json(
      {
        success: false,
        err,
      },
      { status: 500 },
    );
  }
}
