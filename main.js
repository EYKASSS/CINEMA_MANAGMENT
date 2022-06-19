const MongoClient = require("mongodb").MongoClient;
const User = require("./user");
const Customer = require("./customers");
const seat = require("./faci_info");
const Booking = require("./booking_request");

MongoClient.connect(
	"mongodb+srv://m001-student:m001-student@sandbox.igzzp.mongodb.net/cms?retryWrites=true&w=majority",
	{ useNewUrlParser: true },
).catch(err => {
	console.error(err.stack)
	process.exit(1)
}).then(async client => {
	console.log('Connected to MongoDB');
	User.injectDB(client);
	Customer.injectDB(client);
	seat.injectDB(client);
	Booking.injectDB(client);
})

const express = require('express')
const app = express()
const port =  process.env.PORT || 3000

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Cinema MS ',
			version: '1.1.0',
		},
		securityDefinitions: {
            bearerAuth: {
                type: 'apiKey',
                name: 'Authorization',
                scheme: 'bearer',
                in: 'header',
			},
		}
	},
	apis: ['./main.js'],
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
	res.send('Welcome To Cinema MS ')
})

/**
 * @swagger
 * components:
 *   schemas:
 *     user:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *     customers:
 *         name:
 *           type: string

 *         hp:
 *           type: string
 *     seat:
 *        properties:
 *          seat_no:
 *           type: string
 *          name:
 *           type: string
 *          location:
 *           type: string
 *          operatin_hours:
 *           type: string
 *          max_number_customer:
 *           type: int
 *          manager_id:
 *           type: string   
 *     booking_request:
 *        properties:
 *          seat_no:
 *           type: string
 *          customer_id:
 *           type: string
 *          time_slot:
 *           type: string
 *  
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /login:
 *   post:
 *     tags : ["Client"]
 *     description: User Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               password: 
 *                 type: string
 *     responses:
 *       200:
 *         description: Login Successful!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user'
 *       401:
 *         description: Invalid username or password
 */

app.post('/login', async (req, res) => {
	console.log(req.body);

	const user = await User.login(req.body.username, req.body.password);
	if (user != null) {
		console.log("Login Successful!");
		res.status(200).json({
			_id: user[0]._id,
			username: user[0].username,
			token: generateAccessToken({
				_id: user[0]._id,
				username: user[0].username,
				role: user[0].role
			}),
			role: user[0].role
		})
	} else {
		console.log("Login failed")
		res.status(401).send("Invalid username or password");
		return
	}
})


/**
 * @swagger
 * /seat/{name}:
 *   get:
 *     tags : ["Client"]
 *     description: Search seat
 *     parameters:
 *       - in: path
 *         name: name 
 *         schema: 
 *           type: string
 *         required: true
 *         description: seat name
 *     responses:
 *       200:
 *         description: seat found!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/seat'
 *       404:
 *         description: No seat found
 */

app.get('/seat/:name', async (req, res) => {
	console.log(req.params);
	const seat = await seat.getFacilities(req.params.name);
	if (seat != null) {
		console.log("seat found!");
		res.status(200).json(seat);
	} else {
		console.log("Get'Cinema failed")
		res.status(404).send("No Cinema found");
	}
})

/**
 * @swagger
 * /queryBooking/{id}:
 *   get:
 *     tags : ["Client"] 
 *     description: Search Booking
 *     parameters:
 *       - in: path
 *         name: id 
 *         schema: 
 *           type: string
 *         required: true
 *         description: seat no
 *     responses:
 *       200:
 *         description: Booking found!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/booking_request'
 *       404:
 *         description: Booking not found
 */

 app.get('/queryBooking/:id', async (req, res) => {
	console.log(req.params);
	const booking = await Booking.queryBooking(req.params.id);
	if (booking != null) {
		console.log("Booking found!");
		res.status(200).json(booking);
	} else {
		console.log("Booking not found")
		res.status(404).send("Booking not found");
	}
})


// Middleware Express for JWT
app.use(verifyToken);


/**
 * @swagger
 * /register:
 *   post:
 *     tags : ["Admin"] 
 *     security: 
 *       - bearerAuth: []
 *     description: User Register
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             properties:
 *               username: 
 *                 type: string
 *               password: 
 *                 type: string
 *               role: 
 *                 type: string
 *                 enum: [admin, user]
 *                 required: true
 *     responses:
 *       200:
 *         description: Register successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user'
 *       409:
 *         description: Register failed
 *       403:
 *         description: Forbidden
 */

 app.post('/register', async (req, res) => {
	console.log(req.body);
	if(req.user.role == "admin") {
		const user = await User.register(req.body.username, req.body.password, req.body.role);
		if (user != null) {
			console.log("Register successful");
			res.status(200).send("User registered");
		} else {
			console.log("Register failed")
			res.status(409).json("Username already exists");
		}
	} else {
		res.status(403).send('Forbidden')
	}
})

/**
 * @swagger
 * /updateSeat:
 *   patch:
 *     tags : ["seat Manager"]
 *     security: 
 *       - bearerAuth: []
 *     description: Update seat Info
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               seat_no: 
 *                 type: string
 *               name: 
 *                 type: string
 *               location: 
 *                 type: string
 *               operating_hours: 
 *                 type: string
 *               max_number_customer: 
 *                 type: string
 *               manager_id: 
 *                 type: string
 * 
 *     responses:
 *       200:
 *         description: Update seat Successful!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/seat'
 *       404:
 *         description: seat not found
 *       401:
 *         description: Unauthorized
 */

app.patch('/updateFacility', async (req, res) => {
	console.log(req.body);
	if(req.user.role = "user"){
		const seat = await seat.updateSeat(req.body.seat_no, req.body.name, req.body.location, req.body.operating_hours, req.body.max_number_customer, req.body.manager_id);
		if (seat != null) {
			console.log("Update seat Successful!");
			res.status(200).json(seat);
		} else {
			console.log("Update seat failed")
			res.status(404).send("seat not found");
		}
	} else {
		res.status(401).send("Unauthorized");
	}
})

/**
 * @swagger
 * /createCustomer:
 *   post:
 *     tags : ["seat Manager"]
 *     security: 
 *       - bearerAuth: []
 *     description: Create Customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               name: 
 *                 type: string
 *               ic_no: 
 *                 type: string
 *               hp: 
 *                 type: string
 * 
 *     responses:
 *       200:
 *         description: Customer created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/customers'
 *       409:
 *         description: Customer already exists
 *       401:
 *         description: Unauthorized
 */

app.post('/createCustomer', async (req, res) => {
	console.log(req.body);
	if(req.user.role == 'user') {
		const customers = await Customer.create_customer(req.body.name, req.body.ic_no, req.body.hp);
		if (customers != false) {
			console.log("Customer created");
			res.status(200).send("Customer created");
		} else {
			console.log("Customer creation failed")
			res.status(409).json("Customer already exists");
		}
	} else {
		res.status(401).send("Unauthorized");
	}
})

/**
 * @swagger
 * /BookingandReservation:
 *   post:
 *     tags : ["seat Manager"]
 *     security: 
 *       - bearerAuth: []
 *     description: Booking and Reservation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               seat_no: 
 *                 type: string
 *               customer_id: 
 *                 type: string
 *               time_slot: 
 *                 type: string
 * 
 *     responses:
 *       200:
 *         description: Booking and Reservation Successful!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/booking_request'
 *       424:
 *         description: Booking and Reservation Failed!
 *       401:
 *         description: Unauthorized
 *       
 */

app.post('/BookingandReservation', async (req, res) => {
	console.log(req.body);
	if(req.user.role == 'user') {
		const booking = await Booking.BookingandReservation(req.body.seat_no, req.body.customer_id, req.body.time_slot);
		if (booking != false) {
			console.log("Booking and Reservation Successful!");
			res.status(200).json(booking);
		} else {
			console.log("Booking and Reservation failed")
			res.status(424).send("Booking and Reservation failed");
		} 
	} else {
		res.status(401).send("Unauthorized");
	}
})

/**
 * @swagger
 * /createSeat:
 *   post:
 *     tags : ["Admin"]
 *     security: 
 *       - bearerAuth: []
 *     description: Create seat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               seat_no: 
 *                 type: string
 *               name: 
 *                 type: string
 *               location: 
 *                 type: string
 *               operating_hours: 
 *                 type: string
 *               max_number_customer: 
 *                 type: string
 *               manager_id: 
 *                 type: string
 * 
 *     responses:
 *       200:
 *         description: seat created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/seat'
 *       409:
 *         description: seat already exists
 *       403:
 *         description: Forbidden
 */

 app.post('/createSeat', async (req, res) => {
	console.log(req.body);
	if(req.user.role == "admin") {
		const seat = await seat.createSeat(req.body);
		if (seat != null) {
			console.log("seat created");
			res.status(200).json(seat);
		} else {
			console.log("seat creation failed")
			res.status(404).send("seat already exists");
		}
	} else {
		res.status(403).send('Forbidden')
	}
})

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     tags : ["Client"] 
 *     security: 
 *       - bearerAuth: []
 *     description: Get customers by id
 *     parameters:
 *       - in: path
 *         name: id 
 *         schema: 
 *           type: string
 *         required: true
 *         description: Customer id
 *     responses:
 *       200:
 *         description: Customer found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/customers'
 *       404:
 *         description: Query not found
 *       401:
 *         description: Unauthorized
 */

app.get('/customers/:id', async (req, res) => {
	console.log(req.user);
	console.log(req.params);

	if(req.user.role == 'user') {
		let customers = await Customer.getCustomer(req.params.id);

		if (customers)
			res.status(200).json(customers)
		else
			res.status(404).send("Invalid Customer Id");
	} else {
		res.status(401).send('Unauthorized')
	}
})

/**
 * @swagger
 * /deleteSeat/{id}:
 *   delete:
 *     tags : ["Admin"] 
 *     security: 
 *       - bearerAuth: []
 *     description: Delete seat
 *     parameters:
 *       - in: path
 *         name: id 
 *         schema: 
 *           type: string
 *         required: true
 *         description: seat id
 *     responses:
 *       200:
 *         description: seat deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/seat'
 *       404:
 *         description: seat not found
 *       403:
 *         description: Forbidden
 */

 app.delete('/deleteSeat/:id', async (req, res) => {

	if(req.user.role == 'admin') {
		const seat = await seat.deleteSeat(req.params.id);
		if (seat != false) {
			console.log("Delete seat Successful!");
			res.status(200).send("seat deleted");
		} else {
			console.log("Delete seat failed")
			res.status(404).send("seat not found");
		}
	} else {
		res.status(403).send('Forbidden')
	}
 })	



app.listen(port, () => {
	console.log(`VMS REST API listening on port ${port}`)
})


const jwt = require('jsonwebtoken');
function generateAccessToken(payload) {
	return jwt.sign(payload, "Assignment-S2G9", { expiresIn: '1h' });
}

function verifyToken(req, res, next) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (token == null) return res.sendStatus(401)

	jwt.verify(token, "Assignment-S2G9", (err, user) => {
		console.log(err)

		if (err) return res.sendStatus(403)

		req.user = user

		next()
	})
}