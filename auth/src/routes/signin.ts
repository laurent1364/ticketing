import express, {Request, Response} from 'express';
import {body} from "express-validator";
import {User} from "../models/user";
import {BadRequestError, validateRequest} from "@lftickets/common";
import jwt from "jsonwebtoken";
import {Password} from "../services/password";

const router = express.Router();
router.post('/api/users/signin', [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must apply a password')
    ],
    validateRequest,
    async (req: Request, res: Response) => {

        const {email, password} = req.body;
        const user = await User.findOne({email})
        if (!user) {
            throw new BadRequestError('Invalid credentials');
        }

        if (!await Password.compare(user.password, password)) {
            throw new BadRequestError('Invalid credentials');
        }

        // generate jwt
        const userJwt = jwt.sign({
            id: user.id,
            email: user.email
        }, process.env.JWT_KEY!);   // ! is to say that we already check JWT_KEY existence

        // Store it on session object
        req.session = {
            jwt: userJwt
        };

        res.status(200).send(user);
    });

export {router as signInRouter};
