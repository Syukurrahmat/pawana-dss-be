import { Injectable } from '@nestjs/common';
import axios from 'axios';
import sharp from 'sharp';

@Injectable()
export class ImgbbService {
    async uploadPhotos(base64images: string[]) {
        return await new Promise<string[]>((resolve, reject) => {
            Promise.all(
                base64images
                    .filter((e) => e)
                    .map((image) =>
                        sharp(Buffer.from(image.split(';base64,').pop() as string, 'base64'))
                            .jpeg()
                            .toBuffer()
                            .then((buffer) => {
                                const formData = new FormData();
                                formData.append('image', buffer.toString('base64'));

                                return axios({
                                    method: 'post',
                                    url:
                                        'https://api.imgbb.com/1/upload?key=' +
                                        process.env.IMGBB_APIKEY,
                                    data: formData,
                                    headers: { 'content-type': 'multipart/form-data' },
                                })
                                    .then((response) => response.data.data.url)
                                    .catch(reject);
                            })
                            .catch(reject)
                    )
            )
                .then(resolve)
                .catch(reject);
        });
    }
}
