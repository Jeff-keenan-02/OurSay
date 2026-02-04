const express = require("express");
const router = express.Router();
const controller = require("../controllers/petition.controller");

// Categories
router.get("/categories", controller.getCategories);

// Lists
router.get("/category/:id", controller.getByCategory);

// Single petition
router.get("/:id", controller.getPetition);

// Sign
router.post("/:id/sign", controller.signPetition);

module.exports = router;