const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please provide a name'],
			maxlength: 50,
			minlength: 3,
		},

		username: {
			type: String,
			required: [true, 'Please provide username'],
			trim: true,
		},

		email: {
			type: String,
			validate: {
				validator: validator.isEmail,
				message: 'Please provide a valid email',
			},
			unique: true,
		},

		photo: {
			type: String,
			default:
				'https://res.cloudinary.com/deowhygy4/image/upload/v1668050641/PROFILE%20IMAGE%20STARTER/uknown_b04kjp.jpg',
		},

		password: {
			type: String,
			required: [true, 'Please provide password'],
			minlength: 6,
		},
	},
	{ timestamps: true }
)

UserSchema.pre('save', async function () {
	console.log(this.modifiedPaths())

	if (!this.isModified('password')) return

	const salt = await bcrypt.genSalt(10)
	this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.createJWT = function () {
	return jwt.sign(
		{ userId: this._id, name: this.name, photo: this.photo, username: this.username },
		process.env.JWT_SECRET,
		{
			expiresIn: process.env.JWT_LIFETIME,
		}
	)
}

UserSchema.methods.comparePassword = async function (candidatePassword) {
	const isMatch = await bcrypt.compare(candidatePassword, this.password)
	return isMatch
}

module.exports = mongoose.model('User', UserSchema)
