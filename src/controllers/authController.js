const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');


const registerUser = async (req, res, next) => {
    try {

        const {
            username,
            email,
            password,
            displayName
        } = req.body;


        const existingUser = await User.findOne({
            $or: [
                { username },
                { email }
            ]
        });


        if (existingUser) {
            return next(
                new AppError(
                    'Username or email already exists',
                    400
                )
            );
        }


        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            displayName
        });


        await newUser.save();


        const userObject = newUser.toObject();

        delete userObject.password;


        res.status(201).json({
            message: 'User registered successfully',
            user: userObject
        });

    } catch (error) {
        next(error);
    }
};


const loginUser = async (req, res, next) => {
    try {

        const {
            email,
            password
        } = req.body;


        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });


        if (!user) {
            return next(
                new AppError(
                    'Invalid email or password',
                    400
                )
            );
        }


        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );


        if (!isPasswordValid) {
            return next(
                new AppError(
                    'Invalid email or password',
                    400
                )
            );
        }


        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        );


        const userObject = user.toObject();

        delete userObject.password;


        res.status(200).json({
            message: 'Login successful',
            token,
            user: userObject
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    registerUser,
    loginUser
};