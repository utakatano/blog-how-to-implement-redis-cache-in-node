const express = require('express')
const redis = require('redis')
const axios = require('axios')

const app = express()
const requestUrl = 'https://jsonplaceholder.typicode.com/posts'

const client = redis.createClient({
  host: '127.0.0.1',
  port: 6379,
  password: null
})

function redisConnection() {
  client.connect()
  console.log('Connection made with Redis')
}

app.get('/', async (req, res) => {
  const key = req.url
  const cachedData = await client.get(key)
  if (cachedData) {
    console.log('!!! Cache Hit !!!')
    return res.status(200).json(JSON.parse(cachedData))
  }

  axios
    .get(requestUrl)
    .then((data) => {
      console.log('cache miss')
      client.set(key, JSON.stringify(data.data))
      console.log('Putting data in cache ...')
      return res.status(200).json(data.data)
    })
    .catch((error) => {
      return res.status(500).json(error)
    })
})

app.listen(3000, () => {
  console.log('Server started at port 3000')
  redisConnection()
})