import { pool } from "@/lib/db.lib";
import {
  invalidateRefreshToken,
  signRefreshToken,
  signToken,
  storeRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt.lib";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const refreshToken = (await cookies()).get("refreshToken");

    // check if refresh token is provided
    if (!refreshToken) {
      return Response.json(
        {
          success: false,
          error: "No refresh token provided",
        },
        { status: 401 },
      );
    }

    console.time("Verifying refresh token");
    const payload = verifyRefreshToken(refreshToken.value);
    console.timeEnd("Verifying refresh token");

    if (!(payload && typeof payload === "object" && "user_id" in payload)) {
      return Response.json(
        {
          success: false,
          error: "Invalid refresh token",
        },
        { status: 401 },
      );
    }

    console.time("Invalidating old refresh token");
    await invalidateRefreshToken(refreshToken.value);
    console.timeEnd("Invalidating old refresh token");

    const getUserQuery =
      "SELECT user_id, username, email FROM users WHERE user_id = $1";

    console.time("Fetching user info");
    const result = await pool.query(getUserQuery, [payload.user_id]);
    console.timeEnd("Fetching user info");

    const newAccessToken = signToken({
      user_id: payload.user_id,
      email: result.rows[0].email,
      username: result.rows[0].username,
    });

    const newRefreshToken = signRefreshToken({ user_id: payload.user_id });

    await storeRefreshToken(
      payload.user_id,
      newRefreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    (await cookies()).set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return Response.json({
      success: true,
      data: {
        token: newAccessToken,
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
