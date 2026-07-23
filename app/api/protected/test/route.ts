import { pool } from "@/lib/db.lib";

export async function GET() {
  try {
    const result = await pool.query("SELECT NOW()");

    return Response.json({
      success: true,
      time: result.rows[0],
      message: "This is a protected route, you have access to it!",
    });
  } catch (err: unknown) {
    console.error("Test get: ", { err });
    return Response.json(
      {
        success: false,
        err,
      },
      { status: 500 },
    );
  }
}
