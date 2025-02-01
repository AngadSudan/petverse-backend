import { v2 as Cloudinary } from 'cloudinary';
import fs from 'fs';
import os from 'os';
import path from 'path';
Cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function CloudinaryUpload(filepath) {
    try {
        if (!filepath || !fs.existsSync(filepath)) {
            console.error('File path is invalid or does not exist:', filepath);
            return null;
        }

        const response = await Cloudinary.uploader.upload(filepath, {
            resource_type: 'auto',
            flags: 'attachment',
        });

        console.log('File uploaded successfully:', response.secure_url);

        // Delete file after successful upload
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        return response.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);

        // Delete file if it still exists after failure
        if (filepath && fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        return null;
    }
}

async function CloudinaryDelete(publicId) {
    try {
        console.log('Deleting file from Cloudinary:', publicId);
        if (!publicId) throw new Error('No public_id provided');

        // Delete the resource from Cloudinary
        const response = await Cloudinary.uploader.destroy(publicId);

        if (response.result === 'ok') {
            console.log('File deleted successfully from Cloudinary.');
        } else {
            console.warn('Cloudinary deletion result:', response.result);
        }

        return response.secure_url;
    } catch (error) {
        console.error('Error during Cloudinary deletion:', error);
        throw error;
    }
}

const deleteProfilePicture = async (profilePicUrl) => {
    const defaultPicUrl =
        'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1734246128~exp=1734249728~hmac=929022529bceefc2aa41c6ff3620b5a3efa37489cab55d29e1a5d8846a937ac3&w=740';
    if (profilePicUrl && profilePicUrl !== defaultPicUrl) {
        try {
            const publicId = profilePicUrl
                .split('/')
                .slice(-2)
                .join('/')
                .split('.')[0]; // Extract publicId
            await Cloudinary.uploader.destroy(publicId); // Delete image in Cloudinary
            console.log('Profile picture deleted successfully.');
        } catch (error) {
            console.error('Error deleting profile picture:', error.message);
            throw new Error(
                'Failed to delete profile picture from Cloudinary.'
            );
        }
    } else {
        console.log('No custom profile picture to delete.');
    }
};

export { CloudinaryUpload, deleteProfilePicture, CloudinaryDelete };
