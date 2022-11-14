const express = require('express')
const {
	getAllPosts,
	createPost,
	getUserPost,
	deletePost,
	editPost,
	uploadImage,
	getUserSinglePost,
	getOtherUserPost,
	getOtherUserSinglePost,
	addFavorites,
} = require('../controllers/postController')
const authentication = require('../middleware/authentication')

const router = express.Router(addFavorites)

router.route('/').get(getAllPosts).post(authentication, createPost)

router.route('/uploadImage').post(uploadImage)

router.route('/favorites').post(authentication, addFavorites)

router.route('/otheruser/:id/createdBy/:createdByID').get(getOtherUserSinglePost)

router.route('/otheruser/:id').get(getOtherUserPost)

router.route('/post/:id').get(authentication, getUserSinglePost)

router.route('/:id').delete(deletePost).patch(authentication, editPost).get(authentication, getUserPost)

module.exports = router
