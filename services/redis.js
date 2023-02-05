const {createClient} = require("redis");
const dayjs = require("dayjs");

require('dotenv').config()
const client = createClient({
    url: process.env.REDIS_URL
})

async function redisLoad(){
    await client.connect();

    console.log("Connected to Redis");
}

async function helloworld(){
    const val = await client.get('test')
    console.log(val)
}

async function get(key){
    const val = await client.get(key)
    return val
}

async function set(key, value){
    await client.set(key, value);
}

async function hset(key, field, value){
    await client.hSet(key, field, JSON.stringify(value));
    await client.expireAt(key, dayjs().unix() + 60 * 60 * 24, )
}

async function hget(key, field){
    const val = await client.hGet(key, field);

    return val
}

module.exports = {
    redisLoad,
    helloworld,
    get, set, hset, hget
}
