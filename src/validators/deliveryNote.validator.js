import { z } from "zod";

const workerSchema = z.object({
  name: z.string().min(1),
  hours: z.number().min(0)
});

export const createDeliveryNoteSchema = z.object({
  body: z.object({
    project: z.string(),
    client: z.string(),
    format: z.enum(["material", "hours"]),
    description: z.string().optional(),
    workDate: z.coerce.date(),

    material: z.string().optional(),
    quantity: z.number().optional(),
    unit: z.string().optional(),

    hours: z.number().optional(),
    workers: z.array(workerSchema).optional()
  }).refine((data) => {
    if (data.format === "material") {
      return data.material && data.quantity;
    }
    if (data.format === "hours") {
      return data.hours || data.workers;
    }
    return true;
  }, {
    message: "Datos inválidos según el tipo de albarán"
  })
});

export const getDeliveryNotesSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    project: z.string().optional(),
    client: z.string().optional(),
    format: z.enum(["material", "hours"]).optional(),
    signed: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    sort: z.string().optional()
  })
});

export const signDeliveryNoteSchema = z.object({
  params: z.object({
    id: z.string()
  })
});