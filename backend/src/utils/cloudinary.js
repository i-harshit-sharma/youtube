import { v2 as cloudinary } from 'cloudinary';

    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    const uploadToCloudinary = async (localFilePath)=>{
        try {
            if(!localFilePath) return null
            //Upload
            const response = cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto"
            })
            // File uploaded successfully
            return response
        } catch (error) {
            fs.unlinkSync(localFilePath);
            return null
        }
    }

export {uploadToCloudinary}