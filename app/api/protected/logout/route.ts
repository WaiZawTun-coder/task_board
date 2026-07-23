import { pool } from "@/lib/db.lib";
import { cookies, headers } from "next/headers";

export async function POST() {
  try {
    const userId = (await headers()).get("x-user-id");

    // validate required fields
    if (!userId) {
      return Response.json(
        {
          success: false,
          error: "Missing userId field",
        },
        { status: 400 },
      );
    }

    // check if user exists
    const query = "SELECT user_id FROM users WHERE user_id = $1";
    const result = await pool.query(query, [userId]);

    // user does not exist
    if (result.rowCount === 0) {
      return Response.json(
        {
          success: false,
          error: "User does not exist",
        },
        { status: 404 },
      );
    }

    // get refresh token from cookies
    const refreshToken = (await cookies()).get("refreshToken");

    // revoke refresh token from db
    const revokeQuery =
      "UPDATE refresh_tokens SET revoked = true WHERE user_id = $1 AND token = $2";
    await pool.query(revokeQuery, [userId, refreshToken?.value]);

    // clear refresh token from cookies
    (await cookies()).delete("refreshToken");

    return Response.json(
      {
        success: true,
        message: "Logged out successful",
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.log("User logout", { err });
    return Response.json(
      {
        success: false,
        err,
      },
      { status: 500 },
    );
  }
}
