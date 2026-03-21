import bcrypt from 'bcryptjs';

export const encrypt = async (clearPassword) => 
{
  const hash = await bcryptjs.hash(clearPassword, 10);
  return hash;
};

export const compare = async (clearPassword, hashedPassword) => 
{
  return bcrypt.compare(clearPassword, hashedPassword);
};