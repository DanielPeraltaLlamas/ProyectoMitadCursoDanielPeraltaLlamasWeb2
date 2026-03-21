import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
{
  street: { type: String, trim: true },
  number: { type: String, trim: true },
  postal: { type: String, trim: true },
  city: { type: String, trim: true },
  province: { type: String, trim: true }
}, { _id: false });

const userSchema = new mongoose.Schema(
{
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true },
  name: { type: String, trim: true },
  lastName: { type: String, trim: true },
  nif: { type: String, trim: true },
  role: { type: String, enum: ['admin', 'guest'], default: 'admin' },
  status: { type: String, enum: ['pending', 'verified'], default: 'pending', index: true },
  verificationCode: { type: String },
  verificationAttempts: { type: Number, default: 3 },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
  address: { type: addressSchema },
  deleted: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('fullName').get(function() 
{
  return `${this.name} ${this.lastName}`;
});


// metodo para hashear la contraseña antes de guardarlas, se comprueba si se ha cambiado la contraseña 
userSchema.pre('save', async function(next) 
{
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) 
{
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User',userSchema)

export default User