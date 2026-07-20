import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// hash plain password
export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// compare password with hash
export const comparePassword = async (plain: string, hash: string) => {
  if (typeof plain !== "string" || typeof hash !== "string") {
    throw new Error("Both provided values must be string");
  }
  return await bcrypt.compare(plain, hash);
};
