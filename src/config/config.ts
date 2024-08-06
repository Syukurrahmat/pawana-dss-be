import { diskStorage } from "multer"
import { extname, join } from "path"

export const PUBLIC_DIR = '/public'
export const HERO_IMAGE_PATH = '/assets/images/hero'


export const heroImageMulterOpt = {
    storage: diskStorage({
        destination: join('.', PUBLIC_DIR, HERO_IMAGE_PATH, '/uploaded'),
        filename: (req, file, cb) => {
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
            cb(null, `${randomName}${extname(file.originalname)}`)
        }
    })
}
