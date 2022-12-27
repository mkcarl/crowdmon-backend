const {getCropsOf, getAllImagesOf} = require("./services/firebase");
const {redisLoad} = require("./services/redis");
const _ = require("lodash");

async function getRandomImage(videoId){
    const cropped_images = await getCropsOf(videoId)
    const all_images = await getAllImagesOf(videoId)

    const filtered_images = all_images.filter(img => {
        return ! cropped_images.includes(img.name)
    })
    return _.sample(filtered_images)
}

async function main(){
    await redisLoad();
    const img = await getRandomImage("LSB3JNc4iQ4")
    console.log(img)
}

main().then()
