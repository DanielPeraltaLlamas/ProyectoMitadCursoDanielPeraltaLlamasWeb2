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
      .regex(/^\d{6}$/, 'El código debe tener 6 dígitos')
  })
});


export const personalDataSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    lastName: z.string().min(2),
    nif: z.string().min(5)
  })
});


export const companyDataSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    cif: z.string().min(5),
    isFreelance: z.boolean(),
    address: z.object({
      street: z.string(),
      number: z.string(),
      postal: z.string(),
      city: z.string(),
      province: z.string()
    })
  })
});