const cloudinary = require("../config/cloudinary");

const deletePhotoFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (err) {
    throw new Error("Cloudinary deletion failed: " + err.message);
  }
};

module.exports = deletePhotoFromCloudinary;
