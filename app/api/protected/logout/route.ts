import { invalidateRefreshToken } from "@/lib/jwt.lib";
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

    // get refresh token from cookies
    const refreshToken = (await cookies()).get("refreshToken");

    if (refreshToken?.value) await invalidateRefreshToken(refreshToken.value);

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
    console.error("User logout", err);
    return Response.json(
      {
        success: false,
        error: "Unable to log out",
      },
      { status: 500 },
    );
  }
}
