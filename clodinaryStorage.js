import {CloudinaryStorage} from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from './clodinaryConfig.js';

const storage = new CloudinaryStorage({
   cloudinary,
   params: {
    folder: 'abhishek_kumar_vishvakarma_upload_images',
    allowed_formats: ['jpg', 'png', 'webp', 'jpeg'],
    transformation: [{width: 200, height: 200, crop: 'limit'}]
   }
}); 

const upload = multer({storage: storage});
export default upload;