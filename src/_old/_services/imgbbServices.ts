import axios from "axios";
import sharp from "sharp";

export const uploadPhotos = (base64images: string[]) => {
    return new Promise<string[]>((resolve, reject) => {
        Promise.all((base64images).filter(e => e).map(image => (
            sharp(Buffer.from(image.split(';base64,').pop() as string, 'base64'))
                .jpeg()
                .toBuffer()
                .then(buffer => {
                    const formData = new FormData()
                    formData.append("image", buffer.toString("base64"));

                    return axios({
                        method: "post",
                        url: 'https://api.imgbb.com/1/upload?key=' + process.env.IMGBB_APIKEY,
                        data: formData,
                        headers: { "content-type": "multipart/form-data" }
                    })
                        .then(response => response.data.data.url)
                        .catch(reject);

                })
                .catch(reject)
        )))
            .then(resolve)
            .catch(reject)
    })
}