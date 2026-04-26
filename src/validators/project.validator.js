import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    projectCode: z.string().min(1),
    client: z.string(),
    address: z.object({
      street: z.string().optional(),
      number: z.string().optional(),
      postal: z.string().optional(),
      city: z.string().optional(),
      province: z.string().optional()
    }).optional(),
    email: z.string().email().optional(),
    notes: z.string().optional()
  })
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    name: z.string().optional(),
    projectCode: z.string().optional(),
    client: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      number: z.string().optional(),
      postal: z.string().optional(),
      city: z.string().optional(),
      province: z.string().optional()
    }).optional(),
    email: z.string().email().optional(),
    notes: z.string().optional(),
    active: z.boolean().optional()
  })
});

export const getProjectsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    client: z.string().optional(),
    name: z.string().optional(),
    active: z.string().optional(),
    sort: z.string().optional()
  })
});