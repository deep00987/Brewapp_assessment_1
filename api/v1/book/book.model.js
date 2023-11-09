const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: () => uuidv4(),
        },
        title: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        summary: {
            type: String,
        },
        uploaded_by: {
            type: String,
            ref: 'User', // Reference the 'User' model
            required: true,
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    }
);


bookSchema.pre('save', function(next) {
    if (!this._id) {
      // Generate a UU ID if _id is not already set
      this._id = uuidv4()
    }
    next();
  });

const Book = mongoose.model('Book', bookSchema);

module.exports = { Book };
