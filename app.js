const {redisLoad} = require("./services/redis");
const express = require("express");
const {getRandomImage} = require("./image");
const morgan = require("morgan");

const app = express();
const port = 8000;

app.use(morgan('combined'))

app.get('/randomImage', async (req, res) => {
    try{
        const img = await getRandomImage(req.query.videoId)
        res.send(img)
    }
    catch (e) {
        res.send(e.message)
    }
})


app.listen(port, async () => {
    await redisLoad()
    console.log(`API listening at port ${port}`)
})

