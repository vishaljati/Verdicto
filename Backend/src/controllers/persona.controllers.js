import { Persona} from "../models/persona.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

//List all personas: default + user custom
const listPersonas = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const personas = await Persona.find({
      $or: [
        { user: null }, // global default personas
        { user: userId }, // user's custom personas
      ],
    }).sort({ isDefault: -1 });
    if (!personas) {
      throw new ApiError(500, "Error while fetching personas");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { personas }, "All personas fetched Successfully")
      );
  } catch (err) {
    console.error("Error fetching personas:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to load personas" });
  }
});

//Get a single persona (must be global OR belong to the user)
const getPersona = AsyncHandler(async (req, res) => {
  try {
    const { personaId } = req.params;
    const userId = req.user._id;

    const persona = await Persona.findOne({
      _id: personaId,
      $or: [{ user: null }, { user: userId }],
    });

    if (!persona) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Personas not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(404, { persona }, "Personas fetched Successfully"));
  } catch (err) {
    console.error("Error fetching persona:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch persona" });
  }
});

// Create a custom persona (user-owned)
const createPersona = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, description, systemPrompt } = req.body;

    if (!name || !systemPrompt) {
      throw new ApiError(400, "Name and system promt required");
    }

    const persona = await Persona.create({
      user: userId,
      name,
      description,
      systemPrompt,
      isDefault: false,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, { persona }, "Persona created successfully"));
  } catch (err) {
    console.error("Error creating persona:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create persona" });
  }
});

//Update custom persona (user must own it)
const updatePersona = AsyncHandler(async (req, res) => {
  try {
    const { personaId } = req.params;
    const userId = req.user._id;
    const { name, description, systemPrompt } = req.body;

    let persona = await Persona.findById(personaId);

    if (!persona) {
      throw new ApiError(404, "Persona does not found");
    }

    if (persona.user && persona.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json(new ApiResponse(403, {}, "Not allowed to update this persona"));
    }

    // Apply updates
    if (name) persona.name = name;
    if (description) persona.description = description;
    if (systemPrompt) persona.systemPrompt = systemPrompt;

    await persona.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, { persona }, "Persona Updated Successfully"));
  } catch (err) {
    console.error("Error updating persona:", err);
    return null;
  }
});

//Delete custom persona (cannot delete global defaults)
const deletePersona = AsyncHandler(async (req, res) => {
  try {
    const { personaId } = req.params;
    const userId = req.user._id;

    const persona = await Persona.findById(personaId);

    if (!persona) {
      throw new ApiError(404, "Persona does not found");
    }

    if (persona.user === null) {
      return res
        .status(403)
        .json(new ApiResponse(403, {}, "Default personas cannot be deleted"));
    }

    if (persona.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json(new ApiResponse(403, {}, "Not allowed to delete this persona"));
    }

    await Persona.findByIdAndDelete(personaId);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Persona deleted successfully"));
  } catch (err) {
    console.error("Error deleting persona:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete persona" });
  }
});

export {
  listPersonas,
  getPersona,
  createPersona,
  updatePersona,
  deletePersona,
};
