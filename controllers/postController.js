const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const cloudinary = require('cloudinary').v2
const path = require('path')
const fs = require('fs')
const Post = require('../models/PostModel')

const getAllPosts = async (req, res) => {
	const page = Number(req.query.page) || 1
	const limit = Number(req.query.limit) || 10
	const skip = (page - 1) * limit

	const posts = await Post.find({}).sort('-createdAt').limit(limit).skip(skip)

	res.status(StatusCodes.OK).json({ posts })
}

const createPost = async (req, res) => {
	req.body.createdBy = req.user.userId
	req.body.photo = req.user.photo
	req.body.username = req.user.username
	req.body.name = req.user.name
	const post = await Post.create(req.body)

	res.status(StatusCodes.CREATED).json({ post })
}

const getUserPost = async (req, res) => {
	const { userId } = req.user
	const posts = await Post.find({ createdBy: userId }).sort('-createdAt')

	res.status(StatusCodes.OK).json({ posts })
}

const getOtherUserPost = async (req, res) => {
	const { id: userId } = req.params
	const posts = await Post.find({ createdBy: userId })

	res.status(StatusCodes.OK).json({ posts })
}

const getOtherUserSinglePost = async (req, res) => {
	const { id: postId, createdByID: crtId } = req.params

	const post = await Post.findOne({ _id: postId, createdBy: crtId })

	res.status(StatusCodes.OK).json({ post })
}

const getUserSinglePost = async (req, res) => {
	const { id: postId } = req.params
	const { userId } = req.user
	const post = await Post.findOne({ _id: postId, createdBy: userId })
	if (!post) {
		throw new CustomError.BadRequestError('No Item found, please reload')
	}

	res.status(StatusCodes.OK).json({ post })
}

const deletePost = async (req, res) => {
	const { id: postId } = req.params
	const post = await Post.deleteOne({ _id: postId })
	if (!post) {
		throw new CustomError.BadRequestError(`no item found`)
	}
	res.status(StatusCodes.OK).json({ msg: 'Deleted successfully', post })
}

const editPost = async (req, res) => {
	const { id: postId } = req.params
	const { userId } = req.user

	const post = await Post.findOneAndUpdate({ _id: postId, createdBy: userId }, req.body, {
		new: true,
		runValidators: true,
	})

	if (!post) {
		throw new CustomError.BadRequestError('No item found, please reload')
	}

	res.status(StatusCodes.OK).json({ post })
}

const uploadImage = async (req, res) => {
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

	return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } })
}

const addFavorites = async (req, res) => {
	const { id: postId } = req.body.postId
	const { userId } = req.user

	console.log(userId, req.body)

	const alreadyFavorited = await Post.findOne({ _id: postId, 'favorites.id': userId })
	console.log(alreadyFavorited)

	if (alreadyFavorited) {
		alreadyFavorited.favorites.pull({ id: userId })
		await alreadyFavorited.save()

		const post = alreadyFavorited

		res.status(StatusCodes.OK).json({ alreadyFavorited })
		return
	}

	const post = await Post.findOne({ _id: postId })
	post.favorites.push({ id: userId })
	await post.save()
	res.status(StatusCodes.OK).json({ post })
}

module.exports = {
	getAllPosts,
	createPost,
	getUserPost,
	getUserSinglePost,
	deletePost,
	editPost,
	uploadImage,
	getOtherUserPost,
	getOtherUserSinglePost,
	addFavorites,
}
