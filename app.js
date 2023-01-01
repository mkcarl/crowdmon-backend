const {redisLoad} = require("./services/redis");
const express = require("express");
const {getRandomImage} = require("./image");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const {setCrop, getAllImagesOf} = require("./services/firebase");

const app = express();
const port = 8000;
const jsonParser = bodyParser.json();

app.use(morgan('combined'))
app.use(cors())

app.get('/randomImage', async (req, res) => {
    try{
        const img = await getRandomImage(req.query.videoId)
        res.send(img)
    }
    catch (e) {
        res.send(e.message)
    }
})

app.get("/test", async (req, res) => {
    const allvids = await getAllImagesOf(req.query.videoId)

    res.send(allvids)
})

app.post("/crop", jsonParser, async (req, res) => {
    const {videoId, imageId, x, y, width, height, annotationClass, contributorId, timestamp} = req.body

    try{

        if (!videoId || !imageId || !x || !y || !width || !height || !annotationClass || !contributorId || !timestamp) {
            res.send("Missing parameters")
            return
        }

        await setCrop({
            videoId: videoId,
            imageId: imageId,
            x,
            y,
            width,
            height,
            annotationClass,
            contributorId,
            timestamp
        })
        res.send("OK")
    } catch (e){
        res.send(e.message)
    }

})


app.listen(port, async () => {
    await redisLoad()
    console.log(`API listening at port ${port}`)
})

