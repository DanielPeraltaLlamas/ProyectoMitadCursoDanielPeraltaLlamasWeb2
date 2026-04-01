import User from "../models/User.js";
import Company from "../models/Company.js";
import { encrypt,compare } from "../utils/handlePassword.js";
import {generateToken,generateRefreshToken,verifyToken} from '../utils/jwt.js'
import notificationService from '../services/notification.service.js';
import { AppError } from "../utils/AppError.js";


export const registerUser = async (req, res) => 
{
    const { email, password} = req.body;
    console.log(req.body)
    const existingUser = await User.findOne({ email });
    if (existingUser) { return res.status(400).json({ message: 'email ya registrado' });}
    const hashedPassword = await encrypt(password);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      email,
      password: hashedPassword,
      role:'admin',
      status : 'pending',
      verificationCode,
      verificationAttempts : 3
    });

    

    const accessToken = generateToken(newUser._id);
    const refreshToken = generateRefreshToken();

    newUser.refreshToken = refreshToken;
    await newUser.save();

    notificationService.emit('user:registered', newUser);

    return res.status(201).json({
      user: {
        email: newUser.email,
        status: newUser.status,
        role: newUser.role
      },
      accessToken,
      refreshToken,
      verificationCode
    })


}

export const validateEmail = async (req, res,next) => 
{
    const user = req.user;
    const { code } = req.body;
    
    if(user.verificationCode != code)
    {
        user.verificationAttempts-=1
        await user.save()

        if(user.verificationAttempts<=0)
        {
            return next(new AppError(429, 'no te quedan intentos'));
        }
        return next(new AppError(400, 'codigo incorrecto'));
    }

    user.status = 'verified';
    user.verificationCode = null;
    user.verificationAttempts = null;
    await user.save();

    notificationService.emit('user:verified', user);

    return res.status(200).json({ message: 'usuario verificado' });
    


}

export const loginUser = async (req, res,next) => 
{
    const { email, password } = req.body;
    const user = await User.findOne({ email, deleted: false });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    const contraseniasCoinciden = await compare(password, user.password);
    if (!contraseniasCoinciden) return next(new AppError(401, 'credenciales mal'));

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      user: {
        email: user.email,
        role: user.role,
        status: user.status
      },
      accessToken,
      refreshToken
    });


}

export const updatePersonalData = async (req, res) => 
{
    const { name, lastName, nif, isFreelance, cif, address } = req.body;
    const user = req.user;

    user.name = name;
    user.lastName = lastName;
    user.nif = nif;

    await user.save();

    return res.status(200).json({ message: 'datos personales actualizados', user });

}

export const updateCompanyData = async (req, res) => 
{
    const { isFreelance, name, cif, address } = req.body;
    const user = req.user;

    let company;

    if (isFreelance) 
    {
      company = await Company.create({
        owner: user._id,
        name,
        cif: user.nif,
        address,
        isFreelance: true
      });
      user.company = company._id;
      user.role = 'admin';
    } 
    else 
    {
      company = await Company.findOne({ cif });
      if (!company) 
      {
        company = await Company.create({
          owner: user._id,
          name,
          cif,
          address,
          isFreelance: false
        });
        user.role = 'admin';
      } else {
        user.company = company._id;
        user.role = 'guest';
      }
    }

    user.company = company._id;
    await user.save();

    return res.status(200).json({ message: 'compañía datos actualizados', company, user });




}

export const uploadLogo = async (req, res,next) => 
{
  const user = req.user;
  if (!user.company) 
  {
    return next(new AppError(400, 'El usuario no tiene compañía'));
  }

  if (!req.file) 
  {
    return next(new AppError(400, 'No se ha subido ningún archivo'));
  }

  const company = await Company.findById(user.company);

  if (!company) 
  {
    return next(new AppError(404, 'Compañía no encontrada'));
  }

  const url = `http://localhost:3000/uploads/${req.file.filename}`;

  company.logo = url;
  await company.save();

  return res.status(200).json({
    message: 'Logo subido correctamente',
    logo: url
  });

}

export const getUser = async (req, res) => 
{
    const user = await User.findById(req.user._id).populate('company');
    return res.status(200).json({ user });

}

export const refreshToken = async (req, res,next) => 
{
    const { refreshToken } = req.body;
    const user = await User.findOne({ refreshToken });
    if (!user) 
    {
      return next(new AppError(401, 'Refresh token inválido o usuario no encontrado'));
    }
    const accessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken();
    user.refreshToken = newRefreshToken;
    await user.save();
    return res.status(200).json({ accessToken, refreshToken: newRefreshToken });

}

export const logoutUser = async (req, res) => 
{
    const user = req.user;
    user.refreshToken = null;
    await user.save();
    return res.status(200).json({ message: 'Log out' });
    
}

export const deleteUser = async (req, res) => 
{
    const { soft } = req.query;
    const user = req.user;

    if (soft === 'true') 
    {
      user.deleted = true;
      await user.save();
    } 
    else 
    {
      await User.findByIdAndDelete(user._id);
    }

    notificationService.emit('user:deleted', user);

    return res.status(200).json({ message: 'Usuario eliminado' });

}

export const changePassword = async (req, res,next) => 
{
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    const contraseniasCoinciden = await compare(currentPassword, user.password);
    if (!contraseniasCoinciden) return next(new AppError(401, 'credenciales mal'));

    user.password = await encrypt(newPassword);
    await user.save();

    return res.status(200).json({ message: 'contraseña actualizada' });
}

export const inviteUser = async (req, res,next) => 
{
    const { email, name, lastName } = req.body;
    const inviter = req.user;

     if (inviter.role !== 'admin') return next(new AppError(403, 'necesitas permisos admin'));

    const existeUser = await User.findOne({ email });
    if (existeUser) return next(new AppError(409, 'email ya existe'));

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    //contrasenia aletorio temporal
    const password = await encrypt(Math.random().toString(36).slice(-8));

    const newUser = await User.create({
      email,
      password,
      name,
      lastName,
      role: 'guest',
      company: inviter.company,
      status: 'pending',
      verificationCode,
      verificationAttempts: 3
    });

    notificationService.emit('user:invited', newUser);

    return res.status(201).json({ message: 'usuario invitado', user: newUser });

}