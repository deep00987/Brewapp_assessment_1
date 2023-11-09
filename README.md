Basic assumptions
---------------
- There are two basic entities. **User** and **Book** for this use case.
- User acts on the entity Book. i.e perform CRUD.
- All Users can see listing of all books with (or without) specifying Book id.
- To add a book the user needs to be logged in.
- No POST, PUT, DELETE opeation cannot be performed without authorization and authentication (via JWT).
- Only specific user that has uploaded the requesting book can perform update and delete on the same. 

Note 
---------------
- The back-end server is hosted on render free-tier platform. Hence, initial request takes some time to process (to startup the the servers)
- The DB is hosted on mongo-db atlas.
- Server architecture --- monolithic.
- It currenty uses cookie based auth with JWT,
so, from the deployment link, it cannot directly store the jwt cookie in browser due to security issues, (ref: same site cookies )
- But, it will work fine if the front-end and the backend it deployed from the same server OR, The client is delpoyed in a different location but the client - server comm is done through HTTPS for example the REACT front is deployed on netlify which calls the apis through the HTTPS deployment link.

Back-end Deployment Link
---------------
'i[tbd]'

Backend Installation
--------------------

To install backend dependencies, run the following command at the root directory:

`npm install`


To start the backend development server only, use the following command:

`npm run server`

Backend Environment File Format
-------------------------------

`PORT=4000`<br>
`JWT_KEY=`<br>
`NODE_ENV=`<br>
`MONGO_URI=`

Please make sure to replace the placeholders (e.g., JWT_KEY, MONGO_URI) with appropriate values relevant to your setup.

## API Documentation

### Auth
<hr>

**Sign Up**
- `POST /api/v1/auth/signup`

**Sign In**
- `POST /api/v1/auth/signin`

**Sign Out**
- `POST /api/v1/auth/signout`

**Get Current User**
- `GET /api/v1/auth/me`
<br>
### Book
<hr>

**Get paginated Books (first page)**
- `GET /api/v1/book`

**Get Paginated Books (specific page)**
- `GET /api/v1/book?page=Number`

**Get Book by ID**
- `GET /api/v1/book/:id`

**Create a Book**
- `POST /api/v1/book`

**Update a Book by ID**
- `PUT /api/v1/book/:id`

**Delete a Book by ID**
- `DELETE /api/v1/book/:id`








