import { verifyToken } from "@/lib/jwt.lib";
import { headers } from "next/headers";

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
    return Response.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unable to fetch user info",
      },
      { status: 500 },
    );
  }
}
