const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema(
	{
		caption: {
			type: String,
			required: [true, 'Please Provide a Caption'],
		},

		image: {
			type: String,
			// required: true,
		},

		createdBy: {
			type: mongoose.Types.ObjectId,
			ref: 'Users',
			required: [true, 'Please provide user'],
		},

		favorites: {
			type: [],
		},

		// /////
		username: {
			type: String,
			ref: 'Users',
		},
		photo: {
			type: String,
			ref: 'Users',
		},
		name: {
			type: String,
			ref: 'Users',
		},
	},
	{ timestamps: true }
)

module.exports = mongoose.model('Post', PostSchema)
