const admin = require('firebase-admin')
const {getFirestore} = require("firebase-admin/firestore");
const {getStorage} = require("firebase-admin/storage");
const dayjs = require("dayjs");
const _ = require("lodash")

// Initialize Firebase
admin.initializeApp({
    storageBucket: "paimon-dataset.appspot.com",
    credential: admin.credential.cert("credentials.json")
});
const db = getFirestore();
const bucket = getStorage().bucket();

async function getRandomImage(videoId){
    const cropped_images = await getCropsOf(videoId)
    const all_images = await getAllImagesOf(videoId)

    const filtered_images = all_images.filter(img => {
        return ! cropped_images.includes(img.name)
    })
    return _.sample(filtered_images)
}



async function main() {

    console.log(await getRandomImage((await getAllAvailableVideos())[1]))
}

async function getCropsOf(videoId){
    const ref = await db.collection('crops')
        .where('video_id', '==', '${videoId}').get()
    const cropped = ref.docs.map(doc => {
        return doc.data().video_id
    })

    return cropped
}

async function getAllImagesOf(videoId){
    const files = await bucket.getFiles(`uncropped/${videoId}`)
    const allImages = []
    return files[0].map(async file => {
        return {
            name : file.name.split('/').pop(),
            url : (await file.getSignedUrl({
                action: 'read',
                expires: dayjs().add(1, 'day').toDate()
            }))[0]
        }
    })

}

async function getAllAvailableVideos() {
    const ref = await db.collection('available_video').get()
    return ref.docs;
}

main().then()
