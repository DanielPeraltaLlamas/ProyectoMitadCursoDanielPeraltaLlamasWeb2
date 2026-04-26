import { z } from "zod";

export const createClientSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nombre requerido"),
    cif: z.string().min(1, "CIF requerido"),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      number: z.string().optional(),
      postal: z.string().optional(),
      city: z.string().optional(),
      province: z.string().optional()
    }).optional()
  })
});

export const updateClientSchema = z.object({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    name: z.string().optional(),
    cif: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      number: z.string().optional(),
      postal: z.string().optional(),
      city: z.string().optional(),
      province: z.string().optional()
    }).optional()
  })
});

export const getClientsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    name: z.string().optional(),
    sort: z.string().optional()
  })
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string()
  })
});