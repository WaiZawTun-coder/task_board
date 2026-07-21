import { pool } from "@/lib/db.lib";

export async function GET(request: Request) {
  try {
    // get data from request url
    const { searchParams } = new URL(request.url);
    const task_id = searchParams.get("task_id");

    // valid task_id
    if (!task_id) {
      return Response.json(
        {
          success: false,
          error: "Missing task id query parameter",
        },
        { status: 400 },
      );
    }

    // get task data from database
    const query = "SELECT * FROM tasks WHERE task_id = $1";
    const result = await pool.query(query, [task_id]);

    // return task data
    return Response.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    return Response.json(
      {
        success: false,
        err,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    // Extract data from request body
    const body = await request.json();
    const { title, description, due, user_id, project_id } = body;

    if (!user_id) {
      return Response.json({
        success: false,
        error: "user_id is required",
      });
    }

    if (!title || title.trim() === "") {
      return Response.json(
        {
          success: false,
          error: "Title cannot be empty.",
        },
        { status: 400 },
      );
    }

    // Initialize query building arrays
    const baseQuery = "INSERT INTO tasks";
    const columns: string[] = [];
    const valuesIndex: string[] = [];
    const queryValues = [];
    let paramIndex = 1;

    // add user_id
    columns.push("user_id");
    valuesIndex.push(`$${paramIndex++}`);
    queryValues.push(user_id);

    // add title
    columns.push("title");
    valuesIndex.push(`$${paramIndex++}`);
    queryValues.push(title);

    // add description if contain
    if (description) {
      columns.push(`description`);
      valuesIndex.push(`$${paramIndex++}`);
      queryValues.push(description);
    }

    // add due date if contain
    if (due) {
      columns.push(`due`);
      valuesIndex.push(`$${paramIndex++}`);
      queryValues.push(due);
    }

    // add project id if contain
    if (project_id) {
      columns.push(`project_id`);
      valuesIndex.push(`$${paramIndex++}`);
      queryValues.push(project_id);
    }

    const saveQuery = `${baseQuery} (${columns.join(", ")}) VALUES (${valuesIndex.join(", ")}) RETURNING task_id`;

    const result = await pool.query(saveQuery, queryValues);

    return Response.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    return Response.json(
      {
        success: false,
        err,
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Extract data from reuqest body
    const body = await request.json();
    const { task_id, title, description, due, status, priority, user_id } =
      body;

    const errors = [];

    if (!task_id || task_id <= 0) errors[errors.length] = "task_id";

    if (!title || title.trim() === "") errors[errors.length] = "title";

    if (!user_id || user_id <= 0) errors[errors.length] = "user_id";

    if (errors.length > 0) {
      const errorMessage = `${errors.join(", ")} ${errors.length === 1 ? "is" : "are"} required`;
      return Response.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 400 },
      );
    }

    // Initialize arrays to hold query parts and values
    const queryParts: string[] = [];
    const queryValues = [];
    let paramIndex = 1;

    // Conditionally push fields if they are provided in the request
    if (user_id !== undefined) {
      queryParts.push(`user_id = $${paramIndex++}`);
      queryValues.push(title);
    }
    if (title !== undefined) {
      queryParts.push(`title = $${paramIndex++}`);
      queryValues.push(title);
    }
    if (description !== undefined) {
      queryParts.push(`description = $${paramIndex++}`);
      queryValues.push(description);
    }
    if (due !== undefined) {
      queryParts.push(`due = $${paramIndex++}`);
      queryValues.push(due);
    }
    if (status !== undefined) {
      queryParts.push(`status = $${paramIndex++}`);
      queryValues.push(status);
    }
    if (priority !== undefined) {
      queryParts.push(`priority = $${paramIndex++}`);
      queryValues.push(priority);
    }

    // Guard clause if someone sends a request with nothing to update
    if (queryParts.length === 0) {
      return Response.json(
        { success: false, error: "No fields provided to update" },
        { status: 400 },
      );
    }

    // Add the task_id as the final parameter for the WHERE clause
    queryValues.push(task_id);
    const idParamIndex = paramIndex;

    // Combine everything into the final SQL string
    const updateQuery = `UPDATE tasks SET ${queryParts.join(", ")} WHERE task_id = $${idParamIndex}`;
    await pool.query(updateQuery, queryValues);

    return Response.json(
      {
        success: true,
        message: "Task updated successful",
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    return Response.json(
      {
        success: false,
        err,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const { user_id, task_id } = body;

    // validate user_id
    if (!user_id) {
      return Response.json(
        {
          success: false,
          error: "user_id is required",
        },
        { status: 400 },
      );
    }

    // validate task_id
    if (!task_id) {
      return Response.json(
        {
          success: false,
          error: "task_id is required",
        },
        { status: 400 },
      );
    }

    const deleteQuery =
      "DELETE FROM tasks WHERE user_id = $1 AND task_id = $2 RETURNING title";
    const resultData = await pool.query(deleteQuery, [user_id, task_id]);

    return Response.json(
      {
        success: true,
        message: resultData.rows[0].title + " has been removed.",
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    return Response.json(
      {
        success: false,
        err,
      },
      { status: 500 },
    );
  }
}
