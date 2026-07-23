import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt.lib";

export function proxy(request: NextRequest) {
  try {
    const token = request.cookies.get("refreshToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: No token provided",
        },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);

    if (typeof decoded === "string" || !decoded || !decoded.user_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Invalid token",
        },
        { status: 401 },
      );
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.user_id.toString());
    requestHeaders.set("x-user-username", decoded.username || "");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err: unknown) {
    console.error("Proxy error: ", { err });
    return NextResponse.json(
      {
        success: false,
        error: "Unknown error occurred while processing the request",
      },
      { status: 500 },
    );
  }
}

export const config = {
  matcher: ["/api/protected/:path*"],
};
