// Initialize Firebase
const admin = require("firebase-admin");
const {getFirestore} = require("firebase-admin/firestore");
const {getStorage} = require("firebase-admin/storage");
const MyRedis = require("./redis");
const dayjs = require("dayjs");

admin.initializeApp({
    storageBucket: "paimon-dataset.appspot.com", credential: admin.credential.cert("credentials.json")
});
const db = getFirestore();
const bucket = getStorage().bucket();

async function getCropsOf(videoId) {
    const ref = await db.collection('crops')
        .where('video_id', '==', '${videoId}').get()
    const cropped = ref.docs.map(doc => {
        return doc.data().video_id
    })

    return cropped
}

async function getAllImagesOf(videoId) {
    const valFromRedis = await MyRedis.hget('videos', videoId)
    const val = JSON.parse(valFromRedis)
    if (valFromRedis && val.length > 0) {
        return val
    } else {
        const files = await bucket.getFiles(`uncropped/${videoId}`)
        const allImages = []
        for (const file of files[0]) {
            allImages.push({
                name: file.name.split('/').pop(), url: (await file.getSignedUrl({
                    action: 'read', expires: dayjs().add(1, 'day').toDate()
                }))[0]
            })
        }


        await MyRedis.hset('videos', videoId, allImages)
        return allImages

    }


}

async function getAllAvailableVideos() {
    const ref = await db.collection('available_video').get()
    return ref.docs.map(doc => doc.data().video_id)
}

module.exports = {
    getCropsOf, getAllImagesOf, getAllAvailableVideos
}
