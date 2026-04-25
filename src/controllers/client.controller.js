import User from "../models/User.js";
import Company from "../models/Company.js";
import { AppError } from "../utils/AppError.js";
import Client from "../models/Client.js";
import { deleteModel } from "mongoose";


export const createUser = async(req,res) =>
{
    const { name, cif, email, phone, address } = req.body;
    const existing = await Client.findOne
    ({
        cif,
        company: req.user.company
    });

    if(existing)
    {
        throw AppError.conflict("Cliente con este CIF ya existe")
    }

    const client = await Client.create
    ({
        name,
        cif,
        email,
        phone,
        address,
        user: req.user.id,
        company: req.user.company
    });

    res.status(201).json(client);
}

export const updateClient = async(req,res)=>
{
    const {id} = req.params

    const client = await Client.findOne
    ({
        _id :id,
        company : req.user.company
    })

    if (!client) 
    {
        throw AppError.notFound("Cliente no encontrado");
    }

    const { name, cif, email, phone, address } = req.body;

    if (name !== undefined) client.name = name;
    if (cif !== undefined) client.cif = cif;
    if (email !== undefined) client.email = email;
    if (phone !== undefined) client.phone = phone;
    if (address !== undefined) client.address = address;

    await client.save();

    res.json(client);
}

export const getAllClients = async(req,res)=>
{
    const
    {
        page=1,
        limit=10,
        name,
        sort = "createdAt"
    } = req.query

    const query =
    {
        company : req.user.company,
        deleted : false
    }

    if(name)
    {
        query.name = {$regex:name,$options : "i"}
    }

    const skip = (page - 1) * limit;

    const totalItems = await Client.countDocuments(query);
  
    const clients = await Client.find(query)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

    res.json({
        data: clients,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: Number(page)
    });
}

export const getClientId = async(req,res)=>
{
    const {id} = req.params

    const client = await Client.findOne
    ({
        _id :id,
        company : req.user.company
    })

    if(!client)
    {
        throw AppError.notFound("No existe un client con ese ID")
    }

    res.json(client)
}

export const deleteUser = async(req,res) =>
{
    const {deleteMethod} = req.query
    const {id} = req.params

    const client = await Client.findOne
    ({
        _id :id,
        company : req.user.company
    })

    if(!client)
    {
        throw AppError.notFound("No existe un client con ese ID")
    }

    if(deleteMethod=="soft")
    {
        await client.softDelete(req.user.id);

        return res.json
        ({
            message: "Cliente archivado correctamente",
            client
        });
    }
    else if(deleteMethod=="hard")
    {
        await Client.hardDelete(id);

        return res.json
        ({
            message: "Cliente eliminado permanentemente"
        });
    }
    else
    {
        throw AppError.badRequest("La query esta mal")
    }
}

export const getArchivedClients = async (req, res) => 
{
  const clients = await Client.findDeleted
  ({
        company: req.user.company
  });

  res.json
  ({
        data: clients
  });
};


export const restoreClient = async (req, res) => 
{
  const { id } = req.params;

  const client = await Client.findOne
  ({
        _id: id,
        company: req.user.company
  });

  if (!client) 
  {
        throw AppError.notFound("Cliente no encontrado");
  }

  await client.restore();

  res.json
  ({
        message: "Cliente restaurado correctamente",
        client
  });
};