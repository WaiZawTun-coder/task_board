import { pool } from "@/lib/db.lib";
import { signRefreshToken, signToken, storeRefreshToken } from "@/lib/jwt.lib";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { username, password, rememberMe = false } = await request.json();

    // Validate required fields
    const errors = [];

    if (!username || username.trim() == "") errors.push("username");

    if (!password || password.trim() == "") errors.push("password");

    if (errors.length > 0)
      return Response.json(
        {
          success: false,
          error: `Missing fields: ${errors.join(", ")}`,
        },
        { status: 400 },
      );

    // check if user exists
    const query =
      "SELECT user_id, username, email, password FROM users WHERE username = $1 OR email = $1";
    const result = await pool.query(query, [username]);

    // if user does not exist or password does not match, return error
    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Invalid username or password",
        },
        { status: 401 },
      );
    }

    const user = result.rows[0];

    const storedPassword = user.password;

    if (!(await bcrypt.compare(password, storedPassword))) {
      return Response.json(
        {
          success: false,
          error: "Invalid username or password",
        },
        { status: 401 },
      );
    }

    const token = signToken({
      user_id: user.user_id,
      email: user.email,
      username: user.username,
    });

    const refreshToken = signRefreshToken({
      user_id: user.user_id,
    });

    await storeRefreshToken(
      user.user_id,
      refreshToken,
      new Date(Date.now() + (rememberMe ? 1 : 7) * 24 * 60 * 60 * 1000),
    );

    (await cookies()).set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return Response.json({
      success: true,
      data: {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        token,
      },
    });
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
