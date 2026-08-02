import { pool } from "@/lib/db.lib";
import { headers } from "next/headers";

const taskStatuses = new Set(["pending", "on_going", "cancel", "completed"]);
const taskPriorities = new Set(["low", "medium", "high"]);

async function getUserId() {
  return (await headers()).get("x-user-id");
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    const taskId = new URL(request.url).searchParams.get("task_id");

    if (!userId)
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    if (!taskId)
      return Response.json(
        { success: false, error: "Task id is required" },
        { status: 400 },
      );

    const result = await pool.query(
      "SELECT * FROM tasks WHERE task_id = $1 AND user_id = $2",
      [taskId, userId],
    );
    if (result.rowCount === 0)
      return Response.json(
        { success: false, error: "Task not found" },
        { status: 404 },
      );

    return Response.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Task get:", error);
    return Response.json(
      { success: false, error: "Unable to fetch task" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const {
      title,
      description,
      due,
      project_id: projectId,
    } = await request.json();

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

    if (projectId) {
      const project = await pool.query(
        "SELECT 1 FROM projects WHERE project_id = $1 AND user_id = $2",
        [projectId, userId],
      );
      if (project.rowCount === 0)
        return Response.json(
          { success: false, error: "Project not found" },
          { status: 404 },
        );
    }

    const result = await pool.query(
      "INSERT INTO tasks (user_id, title, description, due, project_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        userId,
        title.trim(),
        description || null,
        due || null,
        projectId || null,
      ],
    );
    return Response.json(
      { success: true, data: result.rows[0] },
      { status: 201 },
    );
  } catch (error) {
    console.error("Task post:", error);
    return Response.json(
      { success: false, error: "Unable to create task" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const {
      task_id: taskId,
      title,
      description,
      due,
      status,
      priority,
    } = await request.json();

    if (!userId)
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    if (!Number.isInteger(taskId) || taskId <= 0)
      return Response.json(
        { success: false, error: "Task id is required" },
        { status: 400 },
      );
    if (title !== undefined && (typeof title !== "string" || !title.trim()))
      return Response.json(
        { success: false, error: "Title cannot be empty" },
        { status: 400 },
      );
    if (status !== undefined && !taskStatuses.has(status))
      return Response.json(
        { success: false, error: "Invalid task status" },
        { status: 400 },
      );
    if (priority !== undefined && !taskPriorities.has(priority))
      return Response.json(
        { success: false, error: "Invalid task priority" },
        { status: 400 },
      );

    const fields: string[] = [];
    const values: unknown[] = [];
    const add = (column: string, value: unknown) => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };
    if (title !== undefined) add("title", title.trim());
    if (description !== undefined) add("description", description);
    if (due !== undefined) add("due", due);
    if (status !== undefined) add("status", status);
    if (priority !== undefined) add("priority", priority);
    if (!fields.length)
      return Response.json(
        { success: false, error: "No fields provided to update" },
        { status: 400 },
      );

    values.push(taskId, userId);
    const result = await pool.query(
      `UPDATE tasks SET ${fields.join(", ")} WHERE task_id = $${values.length - 1} AND user_id = $${values.length} RETURNING *`,
      values,
    );
    if (result.rowCount === 0)
      return Response.json(
        { success: false, error: "Task not found" },
        { status: 404 },
      );

    return Response.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Task put:", error);
    return Response.json(
      { success: false, error: "Unable to update task" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const { task_id: taskId } = await request.json();

    if (!userId)
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    if (!Number.isInteger(taskId) || taskId <= 0)
      return Response.json(
        { success: false, error: "Task id is required" },
        { status: 400 },
      );

    const result = await pool.query(
      "DELETE FROM tasks WHERE task_id = $1 AND user_id = $2 RETURNING title",
      [taskId, userId],
    );
    if (result.rowCount === 0)
      return Response.json(
        { success: false, error: "Task not found" },
        { status: 404 },
      );

    return Response.json({
      success: true,
      message: `${result.rows[0].title} has been removed.`,
    });
  } catch (error) {
    console.error("Task delete:", error);
    return Response.json(
      { success: false, error: "Unable to delete task" },
      { status: 500 },
    );
  }
}
