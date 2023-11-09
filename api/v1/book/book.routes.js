const express = require('express');
const { body } = require('express-validator')
const { validateRequest } = require('../../../middlewares/req-validation')

const { BadRequestError } = require('../../../error-types/bad-req-err')
const { currentUser } = require('../../../middlewares/curr-user')
const { requireUserAuth } = require('../../../middlewares/require-auth')
const { DatabaseConnectionError } = require('../../../error-types/db-connection-err');
const { NotAuthoriozedError } = require('../../../error-types/not-authorized-err');
const { paginated_results } = require("../../../middlewares/paginated_results")

const { User } = require('../auth/user.model');
const { Book } = require('./book.model');

const bookRouter = express.Router()

bookRouter.post('/',
    currentUser,
    requireUserAuth,
    [
        body('title').exists().withMessage('Book title must be included.'),
        body('author').exists().withMessage('Book author must be included'),
        body('summary').exists().withMessage('Book summary must be included'),
    ],
    validateRequest,
    async (req, res) => {
        const {title, author, summary} = req.body
        const current_user = req.currentUser?.id

        //check if book exists
        const bookExists = await Book.findOne({title, author})

        if (bookExists) {
            throw new BadRequestError("book", "book already exists with similar title and author", "RESOURCE_ALREADY_EXISTS")
        }

        try {
            const newBook = new Book({title: title, author: author, summary: summary, uploaded_by: current_user})
            var savedBook = await newBook.save()
            
        } catch (error) {
            console.log(error)
            throw new DatabaseConnectionError()
        }

        return res.status(200).json({
            "status": true,
            "content": {
                "data": {
                    "id": savedBook?.id,
                    "title": savedBook?.title,
                    "author": savedBook?.author,
                    "summary": savedBook?.summary,
                    "uploaded_by": savedBook?.uploaded_by,
                    "created_at": savedBook?.created_at,
                    "updated_at": savedBook?.updated_at
                }
            }
        })
    }
)

bookRouter.get('/',
    paginated_results(Book),
    async (req, res) => {
        return res.status(200).json(res.paginated_results)
    }
)

bookRouter.get('/:id',
    async (req, res) => {
        const id = req.params.id

        if (!id) {
            throw new BadRequestError("id", "Invalid book id", "INVALID_INPUT")
        }

        try {
            const bookExists = await Book.findById(id)
            
            if (!bookExists) {
                throw new BadRequestError("id", "No record exists with given id", "INVALID_INPUT")
            }
            
            return res.status(200).json({
                "status": true,
                "content": {
                    "data": {
                        "id": bookExists?.id,
                        "title": bookExists?.title,
                        "author": bookExists?.author,
                        "summary": bookExists?.summary,
                        "uploaded_by": bookExists?.uploaded_by,
                        "created_at": bookExists?.created_at,
                        "updated_at": bookExists?.updated_at
                    }
                }
            })

        } catch (error) {
            
            console.log(error)

            if (error instanceof BadRequestError) {
                throw new BadRequestError("id",error.msg, "INVALID_INPUT")
            }

            throw new DatabaseConnectionError()
        }

    }
)

bookRouter.put('/:id',
    currentUser,
    requireUserAuth,
    // [
    //     body('title').exists().withMessage('Book title must be included.'),
    //     body('author').exists().withMessage('Book author must be included'),
    //     body('summary').exists().withMessage('Book summary must be included'),
    // ],
    // validateRequest,
    async (req, res) => {
        const id = req.currentUser.id
        const book_id = req.params.id
        const acceptedFields = [ "title", "author", 'summary' ]
        if (!book_id) {
            throw new BadRequestError("id", "Invalid book id.", "INVALID_INPUT")
        }

        const bookUploadedByUser = await Book.findOne({
            _id:book_id,
            // uploaded_by: id,
        })

        console.log(bookUploadedByUser, id, book_id)

        if (!bookUploadedByUser) {
            throw new BadRequestError("id", "Book doesnt exist", "INVALID_INPUT")
        }

        if (bookUploadedByUser["uploaded_by"] != id) {
            throw new NotAuthoriozedError("You are not authorized to perform this action.", "NOT_ALLOWED_ACCESS")
        }

        try {

            const bookExists = bookUploadedByUser;

            // check if the request body is empty i.e no data to be uploaded is supplied
            const reqEmpty = Object.values(req?.body).every(x => x === null || x === '' || x === undefined);

            if (reqEmpty) {
                throw new BadRequestError("unknown", "No info received", "INVALID_INPUT")
            }

            for await (const key of Object.keys(req.body)) {

                if (acceptedFields.includes(key)) {
                    bookExists[key] = req.body[key];
                } else {
                    throw new BadRequestError("key", "Invalid key parameter", "INVALID_INPUT")
                }
            }

            bookExists.save()

            return res.status(200).json({
                "status": true,
                "content": {
                    "data": {
                        "id": bookExists?.id,
                        "title": bookExists?.title,
                        "author": bookExists?.author,
                        "summary": bookExists?.summary,
                        "uploaded_by": bookExists?.uploaded_by,
                        "created_at": bookExists?.created_at,
                        "updated_at": bookExists?.updated_at
                    }
                }
            })

        } catch (error) {
            if (error instanceof BadRequestError) {
                throw new BadRequestError(error.msg)
            }
            if (error instanceof NotAuthoriozedError) {
                throw new NotAuthoriozedError("You are not authorized to perform this action.", "NOT_ALLOWED_ACCESS")
            }
            console.error(error);
            throw new DatabaseConnectionError()
        }
    }
)

bookRouter.delete('/:id',
    currentUser,
    requireUserAuth,
    async (req, res) => {
        
        const book_id = req.params?.id
        const current_user = req.currentUser.id
        const bookExists = await Book.findById(book_id)

        if (!bookExists) {
            throw new BadRequestError("book_id", "Book not found", "RESOURCE_NOT_FOUND")
        }

        if (bookExists["uploaded_by"] != current_user) {
            throw new NotAuthoriozedError("You are not authorized to perform this action.", "NOT_ALLOWED_ACCESS")
        }
        
        const deletedBook = await Book.findOneAndRemove({
            _id: book_id
        })
        
        if (!deletedBook) {
            throw new BadRequestError("unknown", "somthing went wrong", "RESOURCE_NOT_FOUND")
        }

        return res.status(200).json({
            "status": true,
        })
    }
)

module.exports = {bookRouter}