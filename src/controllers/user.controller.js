import User from "../models/User.js";
import Company from "../models/Company.js";


export const registerUser = async (req, res) => 
{
    const { email, password, name, lastName } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) { return res.status(400).json({ message: "Email ya registrado" });}

    const user = new User({
      email,
      password: password,
      name,
      lastName,
      verificationCode: Math.floor(100000 + Math.random() * 900000).toString()
    });

    await user.save();

    res.status(201).json({ message: "Usuario creado", user });


}

export const validateEmail = async (req, res) => 
{
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    if (user.verificationCode !== code) 
    {
      user.verificationAttempts -= 1;
      await user.save();
      return res.status(400).json({ message: "Código incorrecto" });
    }

    user.status = "verified";
    user.verificationCode = null;
    await user.save();

    res.json({ message: "Email verificado" });


}

export const loginUser = async (req, res) => 
{
    const { email, password } = req.body;
    const user = await User.findOne({ email, deleted: false });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    //To do: implementar comparar contraseña

    res.json({ message: "Login correcto", user });


}

export const updatePersonalData = async (req, res) => 
{
    const userId = req.body.userId;

    const data = {
    name: req.body.name,
    lastName: req.body.lastName,
    nif: req.body.nif,
    address: req.body.address
    };
    const user = await User.findByIdAndUpdate(userId, data, { new: true });
    res.json(user);

}

export const updateCompanyData = async (req, res) => 
{
    const companyId = req.body.companyId;

    const data = {
    name: req.body.name,
    cif: req.body.cif,
    address: req.body.address,
    isFreelance: req.body.isFreelance
    };
    
    const company = await Company.findByIdAndUpdate(companyId, data, { new: true });
    res.json(company);

}

export const uploadLogo = async (req, res) => 
{

}

export const getUser = async (req, res) => 
{
    const { userId } = req.params;

    const user = await User.findById(userId).populate("company");
    res.json(user);

}

export const refreshToken = async (req, res) => 
{
    res.json({ message: "No implementado" });
}

export const logoutUser = async (req, res) => 
{
    res.json({ message: "No implementado" });
}

export const deleteUser = async (req, res) => 
{
    const { userId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { deleted: true },
      { new: true }
    );

    res.json({ message: "Usuario eliminado", user });

}

export const changePassword = async (req, res) => 
{
    res.json({ message: "No implementado" });
}

export const inviteUser = async (req, res) => 
{
    res.json({ message: "No implementado" });
}