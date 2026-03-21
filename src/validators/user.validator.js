import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Email inválido')
      .transform(email => email.toLowerCase().trim()),
    password: z.string().min(8, 'La contraseña tiene que tener min 8 caracteres')
  })
});


export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Email inválido')
      .transform(email => email.toLowerCase().trim()),
    password: z.string()
  })
});


export const validateEmailSchema = z.object({
  body: z.object({
    code: z.string()
      .regex(/^\d{6}$/, 'el codigo tieme que tener 6 dígitos')
  })
});


export const onboardingSchema = z.discriminatedUnion('isFreelance', [
  //freelance
  z.object({
    isFreelance: z.literal(true),
    name: z.string().min(2, 'nombre con minimo 2 caracteres').trim(),
    lastName: z.string().min(2, 'apellido minimo 2 caracteres').trim(),
    nif: z.string()
      .regex(/^[A-Z0-9]{5,}$/i, 'NIF invalido')
      .refine(val => val.length >= 5, { message: 'nif minimo 5 caracteres' })
  }),
  //empresa
  z.object({
    isFreelance: z.literal(false),
    name: z.string().min(2, 'nombre con minimo 2 caracteres').trim(),
    lastName: z.string().min(2, 'apellido minimo 2 caracteres').trim(),
    cif: z.string()
      .regex(/^[A-Z0-9]{5,}$/i, 'CIF inválido'),
    address: z.object({
      street: z.string().min(1, 'calle obligatoria').trim(),
      number: z.string().min(1, 'numero obligatorio').trim(),
      postal: z.string().min(1, 'codigo postal obligatorio').trim(),
      city: z.string().min(1, 'ciudad obligatoria').trim(),
      province: z.string().min(1, 'provincia obligatoria').trim()
    })
  })
]);


export const passwordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(8, 'contraseña min 8 caracteres'),
    newPassword: z.string().min(8, 'contraseña min 8 caracteres')
      .refine((val, ctr) => val !== ctr.parent.currentPassword, {
        message: 'la nueva contraseña debe ser diferente'
      })
  })
});

export const inviteUserSchema = z.object({
  body: z.object({
    email: z.string()
      .email('email inválido')
      .transform(email => email.toLowerCase().trim()),
    name: z.string().min(2, 'nombre mínimo 2 caracteres').trim(),
    lastName: z.string().min(2, 'apellido mínimo 2 caracteres').trim()
  })
});