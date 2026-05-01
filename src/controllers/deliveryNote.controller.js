import DeliveryNote from "../models/DeliveryNote.js";
import Project from "../models/Project.js";
import { AppError } from "../utils/AppError.js";
import PDFDocument from "pdfkit";
import Client from "../models/Client.js";
import sharp from 'sharp';
import cloudinary from '../config/cloudinary.js';

export const createDeliveryNote = async (req, res) => 
{
  const {
    project,
    client,
    format,
    description,
    workDate,
    material,
    quantity,
    unit,
    hours,
    workers
  } = req.body;

  const projectExists = await Project.findOne
  ({
    _id: project,
    company: req.user.company
  });

  if (!projectExists) 
  {
    throw AppError.notFound("Proyecto no válido");
  }

  const clientExists = await Client.findOne({
    _id: client,
    company: req.user.company
  });

  if (!clientExists) {
    throw AppError.notFound("Cliente no válido");
  }

  const deliveryNote = await DeliveryNote.create
  ({
    user: req.user.id,
    company: req.user.company,
    project,
    client,
    format,
    description,
    workDate,
    material,
    quantity,
    unit,
    hours,
    workers,
    signed: false
  });

  const io = req.app.get('io');
        if (io && req.user?.company) {
            io.to(req.user.company.toString()).emit('deliverynote:new', deliveryNote);
        }

  res.status(201).json(deliveryNote);
};

export const getDeliveryNotes = async (req, res) => 
{
  const {
    page = 1,
    limit = 10,
    project,
    client,
    format,
    signed,
    from,
    to,
    sort = "-workDate"
  } = req.query;

  const query = {
    company: req.user.company,
    deleted: false
  };

  if (project) query.project = project;
  if (client) query.client = client;
  if (format) query.format = format;
  if (signed !== undefined) query.signed = signed === "true";

  if (from || to) 
  {
    query.workDate = {};
    if (from) query.workDate.$gte = new Date(from);
    if (to) query.workDate.$lte = new Date(to);
  }

  const skip = (page - 1) * limit;

  const totalItems = await DeliveryNote.countDocuments(query);

  const notes = await DeliveryNote.find(query)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  res.json({
    data: notes,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: Number(page)
  });
};


export const getDeliveryNote = async (req, res) => 
{
  const dn = await DeliveryNote.findOne({
    _id: req.params.id,
    company: req.user.company
  })
    .populate("user", "email")
    .populate("client")
    .populate("project");

  if (!dn) {
    throw AppError.notFound("Albarán no encontrado");
  }

  res.json(dn);
};


export const getDeliveryNotePDF = async (req, res) => {
  const { id } = req.params;

  const dn = await DeliveryNote.findOne({
    _id: id,
    company: req.user.company
  })
  .populate("client")
  .populate("project")
  .populate("user");

  if (!dn) throw AppError.notFound("Albarán no encontrado");

  if (dn.company.toString() !== req.user.company.toString()) {
    throw AppError.forbidden("No tienes acceso a este albarán");
  }

  const isOwner = dn.user._id.toString() === req.user.id;
  const isGuest = req.user.role === "guest";

  if (!isOwner && !isGuest) {
    throw AppError.forbidden("No tienes permiso para descargar este PDF");
  }

  const doc = new PDFDocument();
  let buffers = [];

  doc.on("data", buffers.push.bind(buffers));
  
  const uploadFinished = new Promise((resolve, reject) => {
    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);
        await new Promise((resUpload, rejUpload) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { 
              folder: "albaranes_pdf",
              resource_type: "raw",
              public_id: `albaran_${dn._id}.pdf`
            },
            (error, result) => {
              if (error) rejUpload(error);
              else resUpload(result);
            }
          );
          uploadStream.end(pdfBuffer);
        });
        resolve(pdfBuffer);
      } catch (error) {
        reject(error);
      }
    });
  });

  doc.text(`Proyecto: ${dn.project?.name || "Sin proyecto"}`);
  doc.text(`Cliente: ${dn.client?.name || "Sin cliente"}`);
  doc.text(`Fecha: ${dn.workDate}`);
  doc.text(`Tipo: ${dn.format}`);

  if (dn.format === "material") {
    doc.text(`Material: ${dn.material}`);
    doc.text(`Cantidad: ${dn.quantity}`);
  }

  if (dn.format === "hours") {
    doc.text(`Horas: ${dn.hours}`);
    dn.workers?.forEach(w => {
      doc.text(`${w.name} - ${w.hours}h`);
    });
  }

  if (dn.signed && dn.signatureUrl) {
    doc.text("FIRMADO");
    const response = await fetch(dn.signatureUrl);
    if (!response.ok) throw new Error("No se pudo descargar la firma de Cloudinary");
    
    const arrayBuffer = await response.arrayBuffer();
    doc.image(Buffer.from(arrayBuffer), { width: 150 });
  }

  doc.end();

  const finalPdfBuffer = await uploadFinished;
  res.setHeader("Content-Type", "application/pdf");
  res.send(finalPdfBuffer);
};

export const signDeliveryNote = async (req, res) => {
  const dn = await DeliveryNote.findOne({
    _id: req.params.id,
    company: req.user.company
  });

  if (!dn) {
    throw AppError.notFound("Albarán no encontrado");
  }

  if (dn.signed) {
    throw AppError.badRequest("El albarán ya está firmado");
  }

  if (!req.file) {
    throw AppError.badRequest("No se ha enviado la firma");
  }

  const optimizedBuffer = await sharp(req.file.buffer)
    .resize(800)
    .png()
    .toBuffer();

  const cloudinaryResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: "firmas_albaranes",
        resource_type: "image" 
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(optimizedBuffer);
  });

  dn.signed = true;
  dn.signedAt = new Date();
  dn.signatureUrl = cloudinaryResult.secure_url;

  await dn.save();

  const io = req.app.get('io');
  if (io && req.user?.company) {
    io.to(req.user.company.toString()).emit('deliverynote:signed', dn);
  }

  res.json({
    message: "Albarán firmado",
    dn
  });
};


export const deleteDeliveryNote = async (req, res) => {
  const dn = await DeliveryNote.findOne({
    _id: req.params.id,
    company: req.user.company
  });

  if (!dn) {
    throw AppError.notFound("Albarán no encontrado");
  }

  if (dn.signed) {
    throw AppError.badRequest("No se puede borrar un albarán firmado");
  }

  await DeliveryNote.findByIdAndDelete(req.params.id);

  res.json({ message: "Albarán eliminado" });
};