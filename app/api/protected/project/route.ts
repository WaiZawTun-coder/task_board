import { pool } from "@/lib/db.lib";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = (await headers()).get("x-user-id");
    const project_id = searchParams.get("task_id");

    if (!project_id) {
      return Response.json(
        {
          success: false,
          error: "Project id is required",
        },
        { status: 400 },
      );
    }

    const query =
      "SELECT * FROM projects WHERE project_id = $1 AND user_id = $2";
    const result = await pool.query(query, [project_id, user_id]);

    return Response.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    return Response.json({ success: false, err }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const user_id = (await headers()).get("x-user-id");

    const { title, description, color_hex } = body;

    if (!user_id) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    if (!title || title.trim() === "") {
      return Response.json(
        {
          success: false,
          error: "Title cannot be empty",
        },
        { status: 400 },
      );
    }

    // create slug
    const slug = title.replace(" ", "_");

    const baseQuery = "INSERT INTO projects";
    const columns: string[] = [];
    const valueIndexs: string[] = [];
    const queryValues = [];
    let paramIndex = 1;

    if (user_id) {
      columns.push("user_id");
      valueIndexs.push(`$${paramIndex++}`);
      queryValues.push(user_id);
    }

    if (title) {
      columns.push("title");
      valueIndexs.push(`$${paramIndex++}`);
      queryValues.push(title);
    }

    if (slug) {
      columns.push("slug");
      valueIndexs.push(`$${paramIndex++}`);
      queryValues.push(slug);
    }

    if (description) {
      columns.push("description");
      valueIndexs.push(`$${paramIndex++}`);
      queryValues.push(description);
    }

    if (color_hex) {
      columns.push("color_hex");
      valueIndexs.push(`$${paramIndex++}`);
      queryValues.push(color_hex);
    }

    const saveQuery = `${baseQuery} (${columns.join(", ")}) VALUES (${valueIndexs.join(", ")}) RETURNING project_id`;

    const result = await pool.query(saveQuery, queryValues);

    return Response.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    return Response.json({ success: false, err }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const { project_id, title, slug, description, status, color_hex } = body;

    if (!project_id) {
      return Response.json(
        {
          success: false,
          error: "Project id is required",
        },
        { status: 400 },
      );
    }

    if (title && title.trim() === "") {
      return Response.json(
        {
          success: false,
          error: "Title cannot be empty",
        },
        { status: 400 },
      );
    }

    if (
      status &&
      (status !== "active" || status !== "archived" || status !== "completed")
    ) {
      return Response.json(
        {
          success: false,
          error: "Invalid status state",
        },
        { status: 400 },
      );
    }

    const user_id = (await headers()).get("x-user-id");

    const baseQuery = "UPDATE projects SET";
    const queryParts: string[] = [];
    const queryValues = [];
    let paramIndex = 1;

    if (user_id) {
      queryParts.push(`user_id = $${paramIndex++}`);
      queryValues.push(user_id);
    }

    if (title) {
      queryParts.push(`title = $${paramIndex++}`);
      queryValues.push(title);
    }

    if (title && title.trim() !== "" && slug && slug.trim() !== "") {
      const generatedSlug = title.replace(" ", "_");
      queryParts.push(`slug = $${paramIndex++}`);
      queryValues.push(generatedSlug);
    } else if (slug) {
      queryParts.push(`slug = $${paramIndex++}`);
      queryValues.push(slug);
    }

    if (description && description.trim() != "") {
      queryParts.push(`description = $${paramIndex++}`);
      queryValues.push(description);
    }

    if (status) {
      queryParts.push(`status = $${paramIndex++}`);
      queryValues.push(status);
    }

    if (color_hex) {
      queryParts.push(`color_hex = $${paramIndex++}`);
      queryValues.push(color_hex);
    }

    if (queryParts.length === 0) {
      return Response.json(
        { success: false, error: "No fields provided to update" },
        { status: 400 },
      );
    }

    queryParts.push(project_id);
    const idParamIndex = paramIndex;

    const updateQuery = `${baseQuery} ${queryParts.join(", ")} WHERE project_id = $${idParamIndex}`;
    await pool.query(updateQuery, queryValues);

    return Response.json(
      {
        success: true,
        message: "Project updated successful",
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    return Response.json({ success: false, err }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const { project_id } = body;

    if (!project_id || project_id <= 0) {
      return Response.json(
        {
          success: false,
          error: "Project id is required",
        },
        { status: 400 },
      );
    }

    const user_id = (await headers()).get("x-user-id");

    if (!user_id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const deleteQuery =
      "DELETE FROM projects WHERE user_id = $1 AND project_id = $2 RETURNING title";

    const resultData = await pool.query(deleteQuery, [user_id, project_id]);

    return Response.json(
      {
        success: true,
        message: resultData.rows[0].title + " has been removed.",
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    return Response.json({ success: false, err }, { status: 500 });
  }
}
