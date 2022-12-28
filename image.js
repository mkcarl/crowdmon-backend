const {getCropsOf, getAllImagesOf} = require("./services/firebase");
const _ = require("lodash");

async function getRandomImage(videoId){
    const cropped_images = await getCropsOf(videoId)
    const all_images = await getAllImagesOf(videoId)

    const filtered_images = all_images.filter(img => {
        return ! cropped_images.includes(img.name)
    })
    return _.sample(filtered_images)
}

module.exports = {
    getRandomImage
}
