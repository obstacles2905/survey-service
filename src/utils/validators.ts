import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import StatusCodes from 'http-status-codes';
import mongoose from "mongoose";
import * as jwt from 'jsonwebtoken';
import {UserModel} from "../models/models";

export async function validateToken(value: any) {
    if (!value) {
        throw new Error('Unathorized, please pass a valid Authorization token');
    }

    if (process.env.NODE_ENV === 'test') {
        return true;
    }

    const result: any = jwt.verify(value, process.env.SECRET!);
    if (!result.user) {
        return false;
    }
    return !!UserModel.findById(result.user);
}

export function validateRequest(request: Request, response: Response, next: NextFunction) {
    const errors = validationResult(request);

    if (errors.mapped().authorization &&
        errors.mapped().authorization.param === 'authorization') {
        return response.status(StatusCodes.UNAUTHORIZED).json({ errors: errors.array() });
    }
    if (!errors.isEmpty()) {
        return response.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    next();
}

export function validateQuestions(value: any) {
    if (!Array.isArray(value)) {
        throw new Error('Questions should be a valid array of objects {question: string, answers: string[]}[]');
    }
    value.forEach(v => {
        if (!v.question || !v.answers) {
            throw new Error('Incorrect structure, should be [{}]')
        }
        if (!Array.isArray(v.answers)) {
            throw new Error('answers property should be an array');
        }
        if (v.answers.length < 2) {
            throw new Error('answers should at least have two options');
        }
    });

    return true;
}

export function validateAnswers(value: any) {
    if (!Array.isArray(value)) {
        throw new Error('Incorrect structure, should be [{"questionId": "foo", "answer": "bar"}]');
    }
    value.forEach(v => {
        if (!v.questionId || !v.answer) {
            throw new Error('Incorrect structure, should be [{"questionId": string, "answer": "bar"}]');
        }
    });

    return true;
}

export function validateObjectId(value: any) {
    if (!mongoose.isValidObjectId(value)) {
        throw new Error('value is not a valid ObjectId');
    }

    return true;
}