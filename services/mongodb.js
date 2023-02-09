const {MongoClient} = require('mongodb');
require('dotenv').config()

const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function mongoLoad(){
    await client.connect();
    console.log("Connected to MongoDB");
}

async function getAllCrops(){
    try {


        const db = client.db('crowdmon');
        const collection = db.collection('crops');
        const crops = await collection.find().toArray();
        const cropsIntoCorrectFormat = crops.map(crop => {
            return {
                video_id: crop.videoId,
                image_id: crop.imageId,
                annotation_class: crop.annotationClass,
                annotation_startX: crop.annotationStartX,
                annotation_startY: crop.annotationStartY,
                annotation_width: crop.annotationWidth,
                annotation_height: crop.annotationHeight,
                contributor_id: crop.contributorId,
                timestamp: crop.timestamp,
                base64Image: crop.base64Image
            }

        })
        return cropsIntoCorrectFormat
    }
    catch (e) {
        console.log(e)

    }
}

async function setCrop(details){
    const {
        videoId,
        imageId,
        x,
        y,
        width,
        height,
        annotationClass,
        contributorId,
        timestamp,
        base64Image
    } = details

    try {
    const db = client.db('crowdmon');
    const collection = db.collection('crops');

        await collection.insertOne({
            videoId: videoId,
            imageId: imageId,
            annotationClass: annotationClass,
            annotationStartX: x,
            annotationStartY: y,
            annotationWidth: width,
            annotationHeight: height,
            contributorId: contributorId,
            timestamp: timestamp,
            base64Image: base64Image
        })

    } catch (e) {
        console.log(e)
    }
}

async function getCropsOf(videoId){
    const db = client.db('crowdmon');
    const collection = db.collection('crops');
    const crops = collection.find({'videoId': videoId}).toArray()
    return crops
}

module.exports = {
    mongoLoad,
    getAllCrops,
    setCrop,
    getCropsOf
}
