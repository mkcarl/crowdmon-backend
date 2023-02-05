const {redisLoad} = require("./services/redis");
const express = require("express");
const {getRandomImage} = require("./image");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const {setCrop, getAllImagesOf, getCropsOf, getAllAvailableVideos, getAllCrops} = require("./services/firebase");

const app = express();
const port = 8000;
const jsonParser = bodyParser.json({limit: '1mb'});

const path = require("path");


app.use(morgan('combined'))
app.use(cors())

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: path.join(__dirname, 'public')});
})

app.get('/randomImage', async (req, res) => {
    await redisLoad()
    try{
        const img = await getRandomImage(req.query.videoId)
        res.status(200).send(img)
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})

app.post("/crop", jsonParser, async (req, res) => {
    await redisLoad()
    const {videoId, imageId, x, y, width, height, annotationClass, contributorId, timestamp, base64Image} = req.body

    try{

        if (!videoId || !imageId || !annotationClass || !contributorId || !timestamp) {
            res.send("Missing parameters")
            return
        }

        await setCrop({
            videoId: videoId,
            imageId: imageId,
            x: x ? x : null,
            y: y ? y : null,
            width : width ? width : null,
            height : height ? height : null,
            annotationClass,
            contributorId,
            timestamp,
            base64Image : base64Image ? base64Image : null
        })
        res.status(200).send("OK")
    } catch (e){
        res.status(400).send(e.message)
    }

})

app.get("/videoCropStatus", async (req, res) => {
    await redisLoad()
    const videoId = req.query.videoId
    try{
        const numOfImages = (await getAllImagesOf(videoId)).length
        const numOfCrops = (await getCropsOf(videoId)).length

        res.status(200).send({
            total:numOfImages,
            cropped:numOfCrops
        })
    } catch (e) {
        res.status(400).send(e.message)
    }

})

app.get("/videoTitles", async (req, res) => {
    await redisLoad()
    try{
        const titles = await getAllAvailableVideos();
        res.status(200).send(titles)
    } catch (e) {
        res.status(400).send(e.message)
    }

})

app.get("/crops", async (req, res) => {
    const crops = await getAllCrops()
    try {
        res.status(200).send(crops)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

app.listen(port, async () => {
    await redisLoad()
    console.log(`API listening at port ${port}`)
})

module.exports = app;
