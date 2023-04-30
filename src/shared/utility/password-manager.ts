import bcrypt from 'bcrypt';

export const generateHashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashPassword: string) => {
  return await bcrypt.compare(password, hashPassword);
}
