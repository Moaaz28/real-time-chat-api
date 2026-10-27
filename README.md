Real-Time Chat App Backend

A real-time chat application backend built with Node.js, Express.js, MongoDB, and Socket.IO. The project provides RESTful APIs for user authentication and chat room management, alongside real-time communication features powered by Socket.IO.

Features

* User Authentication: User registration and login using JWT authentication and password hashing with bcrypt.
* Input Validation: Request validation using express-validator.
* Centralized Error Handling: Consistent error handling through custom error classes and Express middleware.
* Chat Room Management: Create and retrieve chat rooms, with support for public and private rooms.
* Room Membership: Validate user membership and access to private rooms.
* Real-Time Messaging: Send and receive messages instantly through Socket.IO.
* Direct Messaging: Send private messages to specific online users.
* Online Users Tracking: Track connected users and broadcast online status updates.
* Typing Indicators: Notify other room members when a user starts or stops typing.
* MongoDB Integration: Store users, rooms, and messages using MongoDB and Mongoose.

Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* Socket.IO
* JSON Web Tokens (JWT)
* bcrypt
* express-validator

Project Goals

This project was built to practice backend development concepts, including RESTful API design, authentication and authorization, database modeling, middleware, error handling, and real-time communication using WebSockets through Socket.IO.
