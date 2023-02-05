// Initialize Firebase
const admin = require("firebase-admin");
const {getFirestore} = require("firebase-admin/firestore");
const {getStorage} = require("firebase-admin/storage");
const MyRedis = require("./redis");
const dayjs = require("dayjs");

admin.initializeApp({
    storageBucket: "paimon-dataset.appspot.com", credential: admin.credential.cert(
        {
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY,
            projectId: process.env.FIREBASE_PROJECT_ID
        }
    )
});
const db = getFirestore();
const bucket = getStorage().bucket();

async function getCropsOf(videoId) {
    const ref = await db.collection('crops')
        .where('video_id', '==', videoId)
        .get()
    const cropped = ref.docs.map(doc => {
        return doc.data().image_id
    })

    return cropped
}

async function getAllCrops(){
    const ref = await db.collection('crops').get()
    return ref.docs.map(doc => doc.data())
}

async function getAllImagesOf(videoId) {
    const valFromRedis = await MyRedis.hget(`videos:${videoId}`, videoId)
    const val = JSON.parse(valFromRedis)
    if (valFromRedis && val.length > 0) {
        return val
    } else {
        const ref = await db.collection('videos')
            .where("name", '==', videoId)
            .get()
        const images = ref.docs[0].data().frames

        await MyRedis.hset(`videos:${videoId}`, videoId, images)
        return images

    }



}

async function getAllAvailableVideos() {
    const ref = await db.collection('available_video').get()
    return ref.docs.map(doc => doc.data().video_id)
}

async function setCrop(details) {
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

    await db.collection('crops').add({
        video_id: videoId,
        image_id: imageId,
        annotation_class: annotationClass,
        annotation_startX: x,
        annotation_startY: y,
        annotation_width: width,
        annotation_height: height,
        contributor_id: contributorId,
        timestamp: timestamp,
        base64Image: base64Image
    })


}

module.exports = {
    getCropsOf, getAllImagesOf, getAllAvailableVideos, setCrop, getAllCrops
}
