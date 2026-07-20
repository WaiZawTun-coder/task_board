import jwt, { JwtPayload } from "jsonwebtoken";
import { pool } from "./db.lib";
import { comparePassword, hashPassword } from "./hash.lib";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const DEFAULT_EXPIRE_TIME = "3h";

// sign new token
export const signToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: DEFAULT_EXPIRE_TIME });
};

// verify token
export const verifyToken = (token: string): jwt.JwtPayload | string => {
  return jwt.verify(token, JWT_SECRET);
};

// sign new refresh token
export const signRefreshToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

// veriffy refresh token
export const verifyRefreshToken = (token: string): jwt.JwtPayload | string => {
  return jwt.verify(token, JWT_SECRET);
};

// Invalidate refresh token (for logout or token rotation)
export const invalidateRefreshToken = async (token: string): Promise<void> => {
  try {
    // get the hashed token from database
    const storedToken = await getHashedToken(token);

    // mark the token as revoked in the database
    const revokeRefreshToken =
      "UPDATE refresh_tokens SET revoked = true WHERE token = $1";

    await pool.query(revokeRefreshToken, [storedToken]);
  } catch (err: unknown) {
    throw err;
  }
};

// Invalidate all refresh tokens for a user
export const invalidateAllRefreshTokens = async (
  userId: number,
): Promise<void> => {
  const revokeAllRefreshTokensQuery =
    "UPDATE refresh_tokens SET revoked = true WHERE user_id = $1";

  await pool.query(revokeAllRefreshTokensQuery, [userId]);
};

// get all valid refresh tokens
export const getAllRefreshTokens = async (
  userId: number,
): Promise<{ token: string }[]> => {
  const getRefreshTokensQuery =
    "SELECT token FROM refresh_tokens WHERE user_id = $1 AND revoked = false AND expires_at > NOW()";
  const result = await pool.query(getRefreshTokensQuery, [userId]);

  if (result.rowCount === 0) {
    throw new Error(`No valid refresh token for user: ${userId}`);
  }

  return result.rows;
};

// save hashed refresh token in database
export const storeRefreshToken = async (
  userId: number,
  token: string,
  expiresAt: Date,
): Promise<void> => {
  // Hash the refresh token
  const hashRefreshToken = await hashPassword(token);

  // revoke all previous keys
  const revokeAllKeysQuery =
    "UPDATE refresh_tokens SET revoked = true WHERE user_id = $1 AND revoked = false";

  await pool.query(revokeAllKeysQuery, [userId]);

  // store in database
  const storeRefreshTokenQuery =
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)";

  await pool.query(storeRefreshTokenQuery, [
    userId,
    hashRefreshToken,
    expiresAt,
  ]);
};

// reterive the hashed value of the provided token from database
export const getHashedToken = async (token: string): Promise<string> => {
  // Verify the token to get the user_id
  const payload = verifyToken(token) as JwtPayload;

  // Ensure payload is an object and contains user_id
  if (typeof payload === "string") {
    throw new Error("Invalid token payload");
  }

  if (!payload.user_id) {
    throw new Error("Invalid token payload: missing user_id");
  }

  // Retrieve all valid refresh tokens for the user
  const tokens = await getAllRefreshTokens(payload.user_id);

  // Compare the provided token with the stored hashed tokens
  for (const row of tokens) {
    const storedToken = row;
    try {
      const isMatch = await comparePassword(token, storedToken.token);

      if (isMatch) {
        // return the stored hashed token
        return storedToken.token;
      }
    } catch {
      throw new Error("Error comparing tokens");
    }
  }

  // If no matching token is found, throw an error
  throw new Error("No matching refresh token found");
};
