import User from "../models/User.js";
import Company from "../models/Company.js";
import { AppError } from "../utils/AppError.js";
import Client from "../models/Client.js";
import Project from "../models/Project.js";


export const createProject = async(req,res) =>
{
    const { name, projectCode, client, address, email, notes } = req.body;

    const clientExists = await Client.findOne
    ({
        _id: client,
        company: req.user.company
    });

    if (!clientExists) 
    {
        throw AppError.notFound("Cliente no válido");
    }

    const existing = await Project.findOne
    ({
        projectCode,
        company: req.user.company
    });

    if (existing) {
    throw AppError.conflict("Ya existe un proyecto con este código");
  }

  const project = await Project.create
  ({
        name,
        projectCode,
        client,
        address,
        email,
        notes,
        user: req.user.id,
        company: req.user.company,
        active: true
  });

  res.status(201).json(project);
}

export const getProjects = async (req, res) => 
{
  const 
  {
    page = 1,
    limit = 10,
    client,
    name,
    active,
    sort = "-createdAt"
  } = req.query;

  const query = 
  {
    company: req.user.company,
    deleted: false
  };

  if (client) query.client = client;

  if (name) 
  {
    query.name = { $regex: name, $options: "i" };
  }

  if (active !== undefined) 
  {
    query.active = active === "true";
  }

  const skip = (page - 1) * limit;

  const totalItems = await Project.countDocuments(query);

  const projects = await Project.find(query)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  res.json
  ({
    data: projects,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: Number(page)
  });
};

import Project from "../models/Project.js";
import { AppError } from "../utils/AppError.js";

export const deleteProject = async (req, res) => {
  const { id } = req.params;
  const { soft = "true" } = req.query;

  const project = await Project.findOne({
    _id: id,
    company: req.user.company
  });

  if (!project) {
    throw AppError.notFound("Proyecto no encontrado");
  }

  if (soft === "true") {
    await project.softDelete(req.user.id);
    return res.json({ message: "Proyecto archivado" });
  }

  await Project.findByIdAndDelete(id);

  res.json({ message: "Proyecto eliminado permanentemente" });
};


export const getProjectById = async (req, res) => 
{
  const project = await Project.findOne
  ({
    _id: req.params.id,
    company: req.user.company
  });

  if (!project) 
  {
    throw AppError.notFound("Proyecto no encontrado");
  }

  res.json(project);
};

export const updateProject = async (req, res) => 
{
  const project = await Project.findOne
  ({
    _id: req.params.id,
    company: req.user.company
  });

  if (!project) 
  {
    throw AppError.notFound("Proyecto no encontrado");
  }

  Object.assign(project, req.body);

  await project.save();

  res.json(project);
};

export const getArchivedProjects = async (req, res) => 
{
  const projects = await Project.findDeleted
  ({
    company: req.user.company
  });

  res.json({ data: projects });
};

export const restoreProject = async (req, res) => 
{
  const project = await Project.findOne
  ({
    _id: req.params.id,
    company: req.user.company
  });

  if (!project) 
  {
    throw AppError.notFound("Proyecto no encontrado");
  }

  await project.restore();

  res.json({ message: "Proyecto restaurado", project });
};

