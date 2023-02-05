const {getCropsOf} = require("./services/firebase");
const MyCloudinary = require("./services/cloudinary")
const _ = require("lodash");

async function getRandomImage(videoId){
    const cropped_images = await getCropsOf(videoId)
    const all_images = await MyCloudinary.getAllImageOf(videoId)

    const filtered_images = all_images.filter(img => {
        return ! cropped_images.includes(img.name)
    })
    return _.sample(filtered_images)
}

module.exports = {
    getRandomImage
}
