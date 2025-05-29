const deletePhotoFromCloudinary = require("../utils/deletePhotoFromCloudinary");

exports.deleteServicePhoto = async (req, res) => {
  try {
    const { providerId, public_id } = req.body;

    await deletePhotoFromCloudinary(public_id);

    const updated = await ServiceProvider.findByIdAndUpdate(
      providerId,
      { $pull: { photos: { public_id } } },
      { new: true }
    );

    res.json({ success: true, provider: updated });
  } catch (err) {
    console.error("Error deleting photo:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
