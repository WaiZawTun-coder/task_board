import { pool } from "@/lib/db.lib";
import { headers } from "next/headers";

const projectStatuses = new Set(["active", "archived", "completed"]);
const slugify = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, "_");
const getUserId = async () => (await headers()).get("x-user-id");

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    const projectId = new URL(request.url).searchParams.get("project_id");
    if (!userId)
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    if (!projectId)
      return Response.json(
        { success: false, error: "Project id is required" },
        { status: 400 },
      );

    const result = await pool.query(
      `
        SELECT
          p.*,
          json_build_object(
            'total', COUNT(t.task_id)::int,
            'completed', COUNT(t.task_id) FILTER (WHERE t.status = 'completed')::int,
            'on_going', COUNT(t.task_id) FILTER (WHERE t.status = 'on_going')::int,
            'pending', COUNT(t.task_id) FILTER (WHERE t.status = 'pending')::int,
            'cancel', COUNT(t.task_id) FILTER (WHERE t.status = 'cancel')::int,
            'overdue', COUNT(t.task_id) FILTER (
              WHERE t.due::date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancel')
            )::int
          ) AS stats
        FROM projects p
        LEFT JOIN tasks t ON t.project_id = p.project_id
        WHERE p.project_id = $1 AND p.user_id = $2
        GROUP BY p.project_id
      `,
      [projectId, userId],
    );
    if (result.rowCount === 0)
      return Response.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    return Response.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Project get:", error);
    return Response.json(
      { success: false, error: "Unable to fetch project" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const { title, description, color_hex: colorHex } = await request.json();
    if (!userId)
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    if (typeof title !== "string" || !title.trim())
      return Response.json(
        { success: false, error: "Title cannot be empty" },
        { status: 400 },
      );

    const normalizedTitle = title.trim();
    const result = await pool.query(
      "INSERT INTO projects (user_id, title, slug, description, color_hex) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        userId,
        normalizedTitle,
        slugify(normalizedTitle),
        description || null,
        colorHex || null,
      ],
    );
    return Response.json(
      { success: true, data: result.rows[0] },
      { status: 201 },
    );
  } catch (error) {
    console.error("Project post:", error);
    return Response.json(
      { success: false, error: "Unable to create project" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const {
      project_id: projectId,
      title,
      slug,
      description,
      status,
      color_hex: colorHex,
    } = await request.json();
    if (!userId)
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    if (!Number.isInteger(projectId) || projectId <= 0)
      return Response.json(
        { success: false, error: "Project id is required" },
        { status: 400 },
      );
    if (title !== undefined && (typeof title !== "string" || !title.trim()))
      return Response.json(
        { success: false, error: "Title cannot be empty" },
        { status: 400 },
      );
    if (status !== undefined && !projectStatuses.has(status))
      return Response.json(
        { success: false, error: "Invalid project status" },
        { status: 400 },
      );

    const fields: string[] = [];
    const values: unknown[] = [];
    const add = (column: string, value: unknown) => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };
    if (title !== undefined) add("title", title.trim());
    if (slug !== undefined) add("slug", slug);
    else if (title !== undefined) add("slug", slugify(title));
    if (description !== undefined) add("description", description);
    if (status !== undefined) add("status", status);
    if (colorHex !== undefined) add("color_hex", colorHex);
    if (!fields.length)
      return Response.json(
        { success: false, error: "No fields provided to update" },
        { status: 400 },
      );

    values.push(projectId, userId);
    const result = await pool.query(
      `UPDATE projects SET ${fields.join(", ")} WHERE project_id = $${values.length - 1} AND user_id = $${values.length} RETURNING *`,
      values,
    );
    if (result.rowCount === 0)
      return Response.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    return Response.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Project put:", error);
    return Response.json(
      { success: false, error: "Unable to update project" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const { project_id: projectId } = await request.json();
    if (!userId)
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    if (!Number.isInteger(projectId) || projectId <= 0)
      return Response.json(
        { success: false, error: "Project id is required" },
        { status: 400 },
      );

    const result = await pool.query(
      "DELETE FROM projects WHERE project_id = $1 AND user_id = $2 RETURNING title",
      [projectId, userId],
    );
    if (result.rowCount === 0)
      return Response.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    return Response.json({
      success: true,
      message: `${result.rows[0].title} has been removed.`,
    });
  } catch (error) {
    console.error("Project delete:", error);
    return Response.json(
      { success: false, error: "Unable to delete project" },
      { status: 500 },
    );
  }
}
