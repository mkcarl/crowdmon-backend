// Initialize Firebase
const admin = require("firebase-admin");
const {getFirestore} = require("firebase-admin/firestore");
const {getStorage} = require("firebase-admin/storage");
const dayjs = require("dayjs");

admin.initializeApp({
    storageBucket: "paimon-dataset.appspot.com", credential: admin.credential.cert("credentials.json")
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
        const files = await bucket.getFiles({prefix: `uncropped/${videoId}/`})
        const allImages = []
        for (const file of files[0]) {
            allImages.push({
                name: file.name.split('/').pop(), url: (await file.getSignedUrl({
                    action: 'read', expires: dayjs().add(1, 'day').toDate()
                }))[0]
            })
        }


        return allImages



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
