const ServiceProvider = require("../models/ServiceProvider");
const mongoose = require("mongoose");
const { cloudinary } = require("../config/cloudinary");

exports.deleteServicePhoto = async (req, res) => {
  try {
    const { id, public_id } = req.params;

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

    // Remove photo from Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // Remove photo from provider.photos
    provider.photos = provider.photos.filter(
      (photo) => photo.public_id !== public_id
    );

    await provider.save();

    res.json({
      success: true,
      message: "Photo deleted successfully",
      photos: provider.photos,
    });
  } catch (err) {
    console.error("Delete Photo Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete photo" });
  }
};
