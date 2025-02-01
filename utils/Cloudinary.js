import { v2 as Cloudinary } from "cloudinary";
import fs from "fs/promises";
import os from "os";
import path from "path";

Cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function CloudinaryUpload(file, folder,filename) {
  try {
    if (!file) throw new Error("No file provided");

    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, file.originalname);  

    const buffer = Buffer.from(await file.buffer);
    await fs.writeFile(tempFilePath, buffer);

    const mimeType = file.mimetype;
    
    const resourceType = file.mimetype.startsWith('image/') ? 'image' : 
    file.mimetype.startsWith('video/') ? 'video' : 'raw';

    // Upload the file to Cloudinary
    const response = await Cloudinary.uploader.upload(tempFilePath, {
      resource_type: resourceType,
      flags: "attachment", 
      folder: folder,
      public_id: filename,  
      access_mode: "public",  
    });


    await fs.unlink(tempFilePath);

    return response;
  } catch (error) {
    console.error("Error during Cloudinary upload:", error);
    throw error;
  }
}

async function CloudinaryDelete(publicId) {
  try {

    console.log("Deleting file from Cloudinary:", publicId);
    if (!publicId) throw new Error("No public_id provided");

    // Delete the resource from Cloudinary
    const response = await Cloudinary.uploader.destroy(publicId);

    if (response.result === "ok") {
      console.log("File deleted successfully from Cloudinary.");
    } else {
      console.warn("Cloudinary deletion result:", response.result);
    }

    return response;
  } catch (error) {
    console.error("Error during Cloudinary deletion:", error);
    throw error;
  }
}

const deleteProfilePicture = async (profilePicUrl) => {
  const defaultPicUrl = "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1734246128~exp=1734249728~hmac=929022529bceefc2aa41c6ff3620b5a3efa37489cab55d29e1a5d8846a937ac3&w=740"
  if (profilePicUrl && profilePicUrl !== defaultPicUrl) {
      try {
          const publicId = profilePicUrl.split('/').slice(-2).join('/').split('.')[0]; // Extract publicId
          await Cloudinary.uploader.destroy(publicId); // Delete image in Cloudinary
          console.log("Profile picture deleted successfully.");
      } catch (error) {
          console.error("Error deleting profile picture:", error.message);
          throw new Error("Failed to delete profile picture from Cloudinary.");
      }
  } else {
      console.log("No custom profile picture to delete.");
  }
};

export { CloudinaryUpload  , deleteProfilePicture , CloudinaryDelete };