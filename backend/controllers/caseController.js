const caseModel = require("../models/caseModel.js");
const jwt = require("jsonwebtoken");
const { redis } = require("../utils/redisClient.js");

async function createCase(req, res) {
  try {
    const {
      ID_uesr,
      Phone_number,
      Vehicle_number,
      License_number,
      Vehicle_model,
      documents,
    } = req.body;

    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.user.id;

    const newCase = new caseModel({
      ID_uesr,
      Phone_number,
      Vehicle_number,
      License_number,
      Vehicle_model,
      documents: documents || [],
    });
    const savedCase = await newCase.save();

    redis.del("cases");

    res.status(201).json(savedCase);
  } catch (error) {
    console.error("Error saving case:", error);
    res.status(500).json({ message: error.message });
  }
}

async function getAllCases(req, res) {
  try {
    redis.get("cases", async (err, data) => {
      if (err) throw err;

      if (data) {
        return res.status(200).json(JSON.parse(data));
      } else {
        const cases = await caseModel.find();
        redis.setex("cases", 3600, JSON.stringify(cases));
        res.status(200).json(cases);
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getCasesByUser(req, res) {
  try {
    const cacheKey = `cases:user:${req.params.userId}`;
    redis.get(cacheKey, async (err, data) => {
      if (err) throw err;

      if (data) {
        return res.status(200).json(JSON.parse(data));
      } else {
        const cases = await caseModel.find({ ID_uesr: req.params.userId });
        redis.setex(cacheKey, 3600, JSON.stringify(cases));
        res.status(200).json(cases);
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getCaseById(req, res) {
  try {
    const cacheKey = `case:${req.params.caseId}`;
    redis.get(cacheKey, async (err, data) => {
      if (err) throw err;

      if (data) {
        return res.status(200).json(JSON.parse(data));
      } else {
        const caseData = await caseModel.findById(req.params.caseId);
        if (!caseData) {
          return res.status(404).json({ message: "Case not found" });
        }
        redis.setex(cacheKey, 3600, JSON.stringify(caseData));
        res.status(200).json(caseData);
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateCase(req, res) {
  try {
    const { id } = req.params;
    const {
      ID_uesr,
      Phone_number,
      Vehicle_number,
      License_number,
      Vehicle_model,
      documents,
    } = req.body;
    const updatedCase = await caseModel.findByIdAndUpdate(
      id,
      {
        ID_uesr,
        Phone_number,
        Vehicle_number,
        License_number,
        Vehicle_model,
        documents,
      },
      { new: true }
    );

    redis.del("cases");
    redis.del(`case:${id}`);
    redis.del(`cases:user:${updatedCase.ID_uesr}`);

    res.status(200).json(updatedCase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteCase(req, res) {
  try {
    const { id } = req.params;
    const caseData = await caseModel.findByIdAndDelete(id);

    if (caseData) {
      redis.del("cases");
      redis.del(`case:${id}`);
      redis.del(`cases:user:${caseData.ID_uesr}`);
    }

    res.status(200).json({ message: "Case deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createCase,
  getAllCases,
  getCasesByUser,
  updateCase,
  deleteCase,
  getCaseById,
};
