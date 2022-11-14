const User = require('../models/UserModel')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const authentication = require('../middleware/authentication')
const Post = require('../models/PostModel')

const cloudinary = require('cloudinary').v2
const path = require('path')
const fs = require('fs')

const updateUser = async (req, res) => {
	const { username, email, name } = req.body

	if (!email || !username || !name) {
		throw new CustomError.BadRequestError('Please provide all values')
	}

	const user = await User.findOne({ _id: req.user.userId })

	user.email = email
	user.username = username
	user.name = name
	await user.save()

	const posts = await Post.updateMany(
		{ createdBy: req.user.userId },
		{ username: username, name: name, email: email },
		{
			new: true,
			runValidators: true,
		}
	)

	const token = user.createJWT()

	console.log(user, 'USER')

	res.status(StatusCodes.CREATED).json({
		user: { name: user.name, id: user._id, username: user.username, photo: user.photo, email: user.email },
		token,
	})
}

const updatePhoto = async (req, res) => {
	if (!req.files) {
		throw new CustomError.BadRequestError('No File Uploaded')
	}
	const productImage = req.files.image
	if (!productImage.mimetype.startsWith('image')) {
		throw new CustomError.BadRequestError('Please Upload Image Only')
	}
	const maxSize = 1024 * 1024 * 3
	if (productImage.size > maxSize) {
		throw new CustomError.BadRequestError('Please upload image smaller than 3MB')
	}

	const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
		use_filename: true,
		folder: 'photobook-uploads',
	})
	fs.unlinkSync(req.files.image.tempFilePath)

	const photoImage = result.secure_url

	const user = await User.findOne({ _id: req.user.userId })
	user.photo = photoImage
	await user.save()

	const posts = await Post.updateMany(
		{ createdBy: req.user.userId },
		{ photo: photoImage },
		{
			new: true,
			runValidators: true,
		}
	)
	console.log(posts)

	const token = user.createJWT()

	res.status(StatusCodes.CREATED).json({
		user: { name: user.name, id: user._id, username: user.username, photo: user.photo, email: user.email },
		token,
	})
}

const changePassword = async (req, res) => {
	const { oldPassword, newPassword } = req.body

	if (!oldPassword || !newPassword) {
		throw new CustomError.BadRequestError('Please provide both values')
	}

	const user = await User.findOne({ _id: req.user.userId })

	const isPasswordCorrect = await user.comparePassword(oldPassword)
	if (!isPasswordCorrect) {
		throw new CustomError.UnauthenticatedError(`Password doesn't match`)
	}

	user.password = newPassword
	await user.save()
	console.log(user)
	res.status(StatusCodes.OK).json({ msg: 'Success! Password Changed!' })
}

module.exports = { updatePhoto, updateUser, changePassword }
