const express = require("express");
const {getRandomImage} = require("./image");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const {setCrop, getAllImagesOf, getCropsOf, getAllAvailableVideos, getAllCrops} = require("./services/firebase");

const app = express();
const port = 80;
const jsonParser = bodyParser.json({limit: '1mb'});

const https = require("https");
const fs = require("fs");
const secureServer = https.createServer({
    key: fs.readFileSync("security/server.key"),
    cert: fs.readFileSync("security/server.cert")
}, app)


app.use(morgan('combined'))
app.use(cors())

app.get('/randomImage', async (req, res) => {
    try{
        const img = await getRandomImage(req.query.videoId)
        res.status(200).send(img)
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})

app.post("/crop", jsonParser, async (req, res) => {
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
    try{
        const titles = await getAllAvailableVideos();
        res.status(200).send(titles)
    } catch (e) {
        res.status(400).send(e.message)
    }

})

app.get("/crops", async (req, res) => {
    try {
        const crops = await getAllCrops()
        res.status(200).send(crops)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

app.listen(port, async () => {
    console.log(`API listening at port ${port}`)
})

module.exports = app;
