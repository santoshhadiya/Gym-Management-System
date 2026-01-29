const Equipment = require("../models/Equipment");

// Get all equipment
exports.getAllEquipment = async (req, res) => {
  console.log("hello 0000000000")
  try {
    const equipment = await Equipment.find().sort({ createdAt: -1 });
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch equipment", error: err.message });
  }
};

// Create new equipment
exports.createEquipment = async (req, res) => {
  try {
    const newItem = new Equipment(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: "Failed to add equipment", error: err.message });
  }
};

// Update equipment
exports.updateEquipment = async (req, res) => {
  try {
    const updatedItem = await Equipment.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!updatedItem) return res.status(404).json({ message: "Equipment not found" });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: "Failed to update equipment", error: err.message });
  }
};

// Delete equipment
exports.deleteEquipment = async (req, res) => {
  try {
    const deletedItem = await Equipment.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: "Equipment not found" });
    res.json({ message: "Equipment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete equipment", error: err.message });
  }
};