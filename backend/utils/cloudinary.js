import { v2 as cloudinary } from 'cloudinary';

    cloudinary.config({ 
        cloud_name: COLUDINARY_CLOUD_NAME, 
        api_key: COLUDINARY_API_KEY, 
        api_secret: COLUDINARY_API_SECRET
    });
    const uploadToCloudinary = async (localFilePath)=>{
        try {
            if(!localFilePath) return null
            //Upload
            const response = cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto"
            })
            // File uploaded successfully
            console.log("File uploaded successfully")
            console.log(response.url);
            return response
        } catch (error) {
            fs.unlinkSync(localFilePath);
            return null
        }
    }

export {uploadToCloudinary}