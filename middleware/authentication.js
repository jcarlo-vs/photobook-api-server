const jwt = require('jsonwebtoken')

const CustomError = require('../errors')

const authentication = async (req, res, next) => {
	const authHeader = req.headers.authorization

	if (!authHeader || !authHeader.startsWith('Bearer')) {
		throw new CustomError.UnauthenticatedError('Authentication Invalid')
	}

	const token = authHeader.split(' ')[1]
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET)
		req.user = { userId: payload.userId, name: payload.name, username: payload.username, photo: payload.photo }
		next()
	} catch (error) {
		throw new CustomError.UnauthenticatedError('Authentication Invalid')
	}
}

module.exports = authentication
