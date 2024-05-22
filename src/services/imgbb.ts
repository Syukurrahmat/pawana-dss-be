import axios from "axios";
import sharp from "sharp";

export const uploadPhotos = (base64images: string[]) => {
    return new Promise<string[]>((resolve, reject) => {
        Promise.all((base64images).filter(e => e).map(image => (
            sharp(Buffer.from(image.split(';base64,').pop(), 'base64'))
                .jpeg()
                .toBuffer()
                .then(buffer => {
                    const formData = new FormData()
                    formData.append("image", buffer.toString("base64"));

                    return axios({
                        method: "post",
                        url: 'https://api.imgbb.com/1/upload?key=de9ea72024d16215e33cd888f9086f96',
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