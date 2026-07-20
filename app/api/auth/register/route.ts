import { pool } from "@/lib/db.lib";
import { hashPassword } from "@/lib/hash.lib";
import { validateEmail } from "@/lib/validate";

export async function POST(request: Request) {
  try {
    // Extract user data from request body
    const body = await request.json();
    const { username, email, password } = body;

    // Validate required fields
    const errors = [];

    // Check for missing fields
    if (!username) errors.push("username");
    if (!email) errors.push("email");
    if (!password) errors.push("password");
    if (errors.length > 0)
      return Response.json(
        {
          success: false,
          error: `Missing fields: ${errors.join(", ")}`,
        },
        { status: 400 },
      );

    // Validate email format
    if (!validateEmail(email)) {
      return Response.json({
        success: false,
        error: "Invalid email format",
      });
    }

    // validate the username is avaliable
    const existingUserQuery = "SELECT user_id FROM users WHERE username = $1";
    const existingUserResult = await pool.query(existingUserQuery, [username]);
    if (existingUserResult.rows.length > 0) {
      return Response.json(
        {
          success: false,
          error: "Username already exists",
        },
        { status: 400 },
      );
    }

    // validate the email is avaliable
    const existingEmailQuery = "SELECT user_id FROM users WHERE email = $1";
    const existingEmailResult = await pool.query(existingEmailQuery, [email]);
    if (existingEmailResult.rows.length > 0) {
      return Response.json(
        {
          success: false,
          error: "Email already exists",
        },
        { status: 400 },
      );
    }

    // hash the password before storing it in the database
    const hashedPassword = await hashPassword(password);

    // Insert new user into the database
    const query =
      "INSERT INTO users (username, email, password) VALUES ($1,$2, $3) RETURNING user_id, username, email";
    const result = await pool.query(query, [username, email, hashedPassword]);

    // Return the newly created user information
    return Response.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    // Handle unexpected errors
    return Response.json(
      {
        success: false,
        err,
      },
      { status: 500 },
    );
  }
}
