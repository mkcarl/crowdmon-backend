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
        res.status(200).send(img)
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})

app.post("/crop", jsonParser, async (req, res) => {
    const {videoId, imageId, x, y, width, height, annotationClass, contributorId, timestamp} = req.body

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
            timestamp
        })
        res.status(200).send("OK")
    } catch (e){
        res.status(400).send(e.message)
    }

})


app.listen(port, async () => {
    await redisLoad()
    console.log(`API listening at port ${port}`)
})

