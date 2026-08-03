import { pool } from "@/lib/db.lib";
import { validateEmail } from "@/lib/validate";
import { verifyToken } from "@/lib/jwt.lib";
import { cookies, headers } from "next/headers";

// get user info from access token
export async function GET() {
  try {
    // get access token from headers authorization
    const authHeader = (await headers()).get("Authorization") || "";

    const token = authHeader.replace("Bearer ", "");

    if (!token || token === "null") {
      return Response.json(
        {
          success: false,
          error: "No access token provided",
        },
        { status: 401 },
      );
    }

    const userInfo = verifyToken(token);

    if (!userInfo) {
      return Response.json(
        {
          success: false,
          error: "Invalid token",
        },
        { status: 401 },
      );
    }

    return Response.json({
      success: true,
      data: userInfo,
    });
  } catch (err: unknown) {
    console.error("User get: ", { err });
    return Response.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unable to fetch user info",
      },
      { status: 500 },
    );
  }
}

// update the logged in user's profile (username / email)
export async function PUT(request: Request) {
  try {
    const userId = (await headers()).get("x-user-id");

    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { username, email } = await request.json();

    if (typeof username !== "string" || !username.trim()) {
      return Response.json(
        { success: false, error: "Username cannot be empty" },
        { status: 400 },
      );
    }

    if (typeof email !== "string" || !validateEmail(email)) {
      return Response.json(
        { success: false, error: "Invalid email format" },
        { status: 400 },
      );
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();

    // ensure username / email aren't already used by a different account
    const conflict = await pool.query(
      "SELECT user_id FROM users WHERE (username = $1 OR email = $2) AND user_id <> $3",
      [normalizedUsername, normalizedEmail, userId],
    );

    if (conflict.rows.length > 0) {
      return Response.json(
        { success: false, error: "Username or email is already in use" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      "UPDATE users SET username = $1, email = $2 WHERE user_id = $3 RETURNING user_id, username, email",
      [normalizedUsername, normalizedEmail, userId],
    );

    if (result.rowCount === 0) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, data: result.rows[0] });
  } catch (err: unknown) {
    console.error("User put: ", err);
    return Response.json(
      { success: false, error: "Unable to update profile" },
      { status: 500 },
    );
  }
}

// permanently delete the logged in user's account and their data
export async function DELETE() {
  const client = await pool.connect();

  try {
    const userId = (await headers()).get("x-user-id");

    if (!userId) {
      client.release();
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await client.query("BEGIN");

    // clean up dependent rows explicitly in case the schema doesn't
    // cascade deletes on the foreign keys
    await client.query("DELETE FROM notifications WHERE user_id = $1", [
      userId,
    ]);
    await client.query("DELETE FROM tasks WHERE user_id = $1", [userId]);
    await client.query("DELETE FROM projects WHERE user_id = $1", [userId]);
    await client.query("DELETE FROM refresh_tokens WHERE user_id = $1", [
      userId,
    ]);

    const result = await client.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING user_id",
      [userId],
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    await client.query("COMMIT");

    (await cookies()).delete("refreshToken");

    return Response.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err: unknown) {
    await client.query("ROLLBACK");
    console.error("User delete: ", err);
    return Response.json(
      { success: false, error: "Unable to delete account" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
