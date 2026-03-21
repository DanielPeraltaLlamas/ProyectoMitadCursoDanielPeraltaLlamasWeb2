import bcryptjs from 'bcryptjs';

export const encrypt = async (clearPassword) => 
{
  const hash = await bcryptjs.hash(clearPassword.trim(), 10);
  return hash;
};

export const compare = async (clearPassword, hashedPassword) => 
{
  return bcryptjs.compare(clearPassword.trim(), hashedPassword);
};