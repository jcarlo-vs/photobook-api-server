require('dotenv').config()
require('express-async-errors')

const cors = require('cors')
const express = require('express')
const app = express()
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')
const connectDB = require('./db/connectDB')
const authRouter = require('./routes/authRouter')
const postRouter = require('./routes/postRouter')
const errorHandlerMiddleware = require('./middleware/error-handler')
const notFoundMiddleware = require('./middleware/not-found')
const fileUpload = require('express-fileupload')
const morgan = require('morgan')
const userRouter = require('./routes/userRouter')

app.set('trust proxy', 1)
app.use(
	rateLimiter({
		windowMs: 10 * 60 * 1000,
		max: 100,
	})
)

const cloudinary = require('cloudinary').v2
cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_API_KEY,
	api_secret: process.env.CLOUD_API_SECRET,
})

app.use(cors())
app.use(morgan('tiny'))
app.use(express.json())
app.use(xss())
app.use(fileUpload({ useTempFiles: true }))
app.get('/', (req, res) => {
	res.send('APP API')
})
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/posts', postRouter)
app.use('/api/v1/profile', userRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const PORT = process.env.PORT || 3000
const start = async () => {
	try {
		await connectDB(process.env.MONGO_URL)
		app.listen(PORT, console.log(`Server is listening to PORT ${PORT}`))
	} catch (error) {
		console.log(error)
	}
}

start()
