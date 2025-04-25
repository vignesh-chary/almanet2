import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (file) => {
  try {
    if (!file) {
      console.log('No file provided to uploadToCloudinary');
      return null;
    }

    console.log('Uploading file to Cloudinary:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Handle buffer upload
    if (file.buffer) {
      // Create a readable stream from the buffer
      const stream = Readable.from(file.buffer);

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'events',
            resource_type: 'auto',
            filename_override: file.originalname
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('Cloudinary upload success:', {
                publicId: result.public_id,
                url: result.secure_url
              });
              resolve(result.secure_url);
            }
          }
        );

        // Handle stream errors
        stream.on('error', (error) => {
          console.error('Stream error:', error);
          reject(error);
        });

        // Pipe the readable stream to the upload stream
        stream.pipe(uploadStream);
      });
    }

    // Handle base64 string
    if (typeof file === 'string' && file.startsWith('data:')) {
      console.log('Uploading base64 string to Cloudinary');
      const result = await cloudinary.uploader.upload(file, {
        folder: 'events',
        resource_type: 'auto'
      });
      console.log('Cloudinary upload success:', {
        publicId: result.public_id,
        url: result.secure_url
      });
      return result.secure_url;
    }

    // Handle file path
    if (typeof file === 'string' && (file.startsWith('http://') || file.startsWith('https://'))) {
      return file;
    }

    console.log('Unsupported file format:', file);
    return null;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}; 