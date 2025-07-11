const ServiceProvider = require("../models/ServiceProvider");
const mongoose = require("mongoose");

exports.uploadPhotos = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid provider ID" });
    }

    const provider = await ServiceProvider.findById(id);
    if (!provider) {
      return res
        .status(404)
        .json({ success: false, message: "Provider not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const uploadedPhotos = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename.includes("/") ? file.filename : `service-providers/${file.filename}`,
    }));

    provider.photos = [...(provider.photos || []), ...uploadedPhotos];
    await provider.save();

    res.json({
      success: true,
      message: "Photos uploaded successfully",
      photos: provider.photos,
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
