import { pool } from "@/lib/db.lib";
import { hashPassword } from "@/lib/hash.lib";
import { validateEmail } from "@/lib/validate";

export async function GET(request: Request) {
  try {
    // Extract userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    // Validate userId
    if (!userId) {
      return Response.json(
        {
          success: false,
          error: "Missing user_id query parameter",
        },
        { status: 400 },
      );
    }

    // Query the database for user information
    const query =
      "SELECT user_id, username, email FROM users WHERE user_id = $1";
    const result = await pool.query(query, [userId]);

    // Check if user exists
    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    // Return user information
    return Response.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    // Handle unexpected errors
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
    // Extract user data from request body
    const body = await request.json();
    const { user_id, username, email, password } = body;

    // validate userId
    if (!user_id) {
      return Response.json(
        {
          success: false,
          error: "Missing user_id in request body",
        },
        { status: 400 },
      );
    }

    // validate email format if email is provided
    if (email && !validateEmail(email)) {
      return Response.json(
        {
          success: false,
          error: "Invalid email format",
        },
        { status: 400 },
      );
    }

    // check if username exists if username is provided
    if (username && username.trim() !== "") {
      const existingUserQuery =
        "SELECT user_id FROM users WHERE username = $1 AND user_id != $2";
      const existingUserResult = await pool.query(existingUserQuery, [
        username,
        user_id,
      ]);
      if (existingUserResult.rows.length > 0) {
        return Response.json(
          {
            success: false,
            error: "Username already exists",
          },
          { status: 400 },
        );
      }
    }

    // check if email exists if email is provided
    if (email && email.trim() !== "") {
      const existingEmailQuery =
        "SELECT user_id FROM users WHERE email = $1 AND user_id != $2";
      const existingEmailResult = await pool.query(existingEmailQuery, [
        email,
        user_id,
      ]);
      if (existingEmailResult.rows.length > 0) {
        return Response.json(
          {
            success: false,
            error: "Email already exists",
          },
          { status: 400 },
        );
      }
    }

    // Build dynamic update query
    const fields = [];
    const values = [];
    let index = 1;

    if (username) {
      fields.push(`username = $${index++}`);
      values.push(username);
    }

    if (email) {
      fields.push(`email = $${index++}`);
      values.push(email);
    }

    if (password) {
      fields.push(`password = $${index++}`);
      const hashedPassword = await hashPassword(password);
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return Response.json(
        {
          success: false,
          error: "No fields to update",
        },
        { status: 400 },
      );
    }
    values.push(user_id);

    // Update user information in the database
    const query = `UPDATE users SET ${fields.join(", ")} WHERE user_id = $${index} RETURNING user_id, username, email`;
    const result = await pool.query(query, values);

    // Check if user was updated
    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    // Return the updated user information
    return Response.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    // Handle unexpected errors
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
    // Extract userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    // Validate userId
    if (!userId) {
      return Response.json(
        {
          success: false,
          error: "Missing user_id query parameter",
        },
        { status: 400 },
      );
    }

    // Delete user from the database
    const query = "DELETE FROM users WHERE user_id = $1 RETURNING user_id";
    const result = await pool.query(query, [userId]);

    // Check if user was deleted
    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 400 },
      );
    }

    // Return success response
    return Response.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    // Handle unexpected errors
    return Response.json(
      {
        success: false,
        err,
      },
      { status: 500 },
    );
  }
}
