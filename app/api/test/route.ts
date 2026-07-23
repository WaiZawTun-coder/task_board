import { pool } from "@/lib/db.lib";

export async function GET() {
  try {
    const result = await pool.query("SELECT NOW()");

    return Response.json({
      success: true,
      time: result.rows[0],
    });
  } catch (err: unknown) {
    console.error("Error in GET /api/test:", err);
    return Response.json(
      {
        success: false,
        err,
      },
      { status: 500 },
    );
  }
}
