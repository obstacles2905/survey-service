import express, { Request, Response } from "express";
import StatusCodes from 'http-status-codes';
import {body, header, param} from 'express-validator';
import {AuthTokenModel, UserModel} from "../models/models";
import {validateObjectId, validateRequest, validateToken} from "../utils/validators";
import * as jwt from 'jsonwebtoken';
import {TUser} from "../contracts/contracts";

export const usersRouter = express.Router();

usersRouter.get('/',
    header('Authorization').custom(v => validateToken(v)),
    validateRequest,
    async(request: Request, response: Response) => {
    const users = await UserModel.find({});
    return response.json(users);
});

usersRouter.get(
    '/:id',
    header('Authorization').custom(v => validateToken(v)),
    param('id').custom((v: any) => validateObjectId(v)),
    validateRequest,
    async (request: Request, response: Response) => {
         const {id} = request.params;

         const user = await UserModel.findById(id);
         if (!user) {
             return response.status(StatusCodes.BAD_REQUEST)
                 .send(`User with id ${id} doesn't exist`);
         }

         return response.json(user);
});

usersRouter.post('/',
    body('name', `name should be a valid string`).isString(),
    validateRequest,
    async (request: Request, response: Response) => {
        const {name} = request.body;

        await UserModel.insertMany({name});

        const user: TUser | null = await UserModel.findOne({name});

        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (600 * 60),
            user: user!._id,
        }, process.env.SECRET!);

        await AuthTokenModel.insertMany({userId: user!._id, token});
        return response.json(user)
});