import { pool } from "@/lib/db.lib";
import { comparePassword, hashPassword } from "@/lib/hash.lib";
import { invalidateAllRefreshTokens } from "@/lib/jwt.lib";
import { headers } from "next/headers";

export async function PUT(request: Request) {
  try {
    const userId = (await headers()).get("x-user-id");

    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (typeof currentPassword !== "string" || !currentPassword) {
      return Response.json(
        { success: false, error: "Current password is required" },
        { status: 400 },
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return Response.json(
        { success: false, error: "New password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      "SELECT password FROM users WHERE user_id = $1",
      [userId],
    );

    if (result.rowCount === 0) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const isMatch = await comparePassword(
      currentPassword,
      result.rows[0].password,
    );

    if (!isMatch) {
      return Response.json(
        { success: false, error: "Current password is incorrect" },
        { status: 401 },
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await pool.query("UPDATE users SET password = $1 WHERE user_id = $2", [
      hashedPassword,
      userId,
    ]);

    // invalidate every refresh token (including this session's) so a
    // password change actually signs the user out everywhere
    await invalidateAllRefreshTokens(Number(userId));

    return Response.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err: unknown) {
    console.error("Password put: ", err);
    return Response.json(
      { success: false, error: "Unable to update password" },
      { status: 500 },
    );
  }
}
