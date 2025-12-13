import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log("File is not found");
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      asset_folder: "verdicto",
    });
    console.log(response);

    if (response) {
      fs.unlinkSync(localFilePath);
      return response;
    }
    return null;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteCloudinary = async function (public_id) {
  try {
    if (public_id) {
      console.log("File id not found");
    }
    const response = cloudinary.uploader.destroy(public_id);
    return response;
  } catch (error) {
    console.log("Error:: ", error);
    return null;
  }
};

export { uploadCloudinary, deleteCloudinary };
