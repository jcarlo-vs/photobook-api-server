const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const User = require('../models/UserModel')

const registerUser = async (req, res) => {
	const { email, password, name } = req.body

	const isEmailAlreadyExist = await User.findOne({ email })

	if (isEmailAlreadyExist) {
		throw new CustomError.BadRequestError('Email Already exists')
	}

	if (name.length < 3) {
		throw new CustomError.BadRequestError('Name must be atleast 3 characters')
	}
	if (name.length > 50) {
		throw new CustomError.BadRequestError('Full Name must be below than 50 characters')
	}

	if (password.length < 6) {
		throw new CustomError.BadRequestError('Password must be atleast 6 characters')
	}
	const user = await User.create(req.body)

	res.status(StatusCodes.CREATED).json({ msg: 'Registered Successfully', user })
}

const loginUser = async (req, res) => {
	const { email, password } = req.body

	if (!email || !password) {
		throw new CustomError.BadRequestError('Please provide email and password')
	}

	const user = await User.findOne({ email })
	if (!user) {
		throw new CustomError.UnauthenticatedError('Invalid Email')
	}

	const isPasswordCorrect = await user.comparePassword(password)
	if (!isPasswordCorrect) {
		throw new CustomError.UnauthenticatedError(`Email and Password doesn't match`)
	}

	const token = user.createJWT()
	res.status(StatusCodes.OK).json({
		user: { name: user.name, id: user._id, username: user.username, photo: user.photo, email: user.email },
		token,
	})
}

const logoutUser = async (req, res) => {
	res.send('logout user')
}
module.exports = { registerUser, loginUser, logoutUser }
