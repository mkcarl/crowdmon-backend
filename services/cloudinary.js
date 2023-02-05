const MyRedis = require("./redis");
const cloudinary = require('cloudinary').v2
require("dotenv").config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function getAllImageOf(videoId) {
    try {
        const valFromRedis = await MyRedis.hget('videos', videoId)
        const val = JSON.parse(valFromRedis)
        const allImages = []

        if (valFromRedis && val.length > 0) {
            return val
        } else {
            const images = await cloudinary.api.resources(
                {prefix: `${videoId}`, type: 'upload'}
            );

            for (const image of images.resources) {
                allImages.push({
                    name: image.public_id,
                    url: image.url
                })
            }

        }

        await MyRedis.hset('videos', videoId, allImages)
        return allImages
    } catch (e) {
        console.log(e)
    }
}

module.exports = {
    getAllImageOf
}
