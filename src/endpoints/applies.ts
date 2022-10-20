import express, {Request, Response} from "express";
import {body, header} from 'express-validator';
import {ApplyModel, SurveyModel} from "../models/models";
import StatusCodes from 'http-status-codes';
import mongoose from "mongoose";
import {validateAnswers, validateObjectId, validateRequest, validateToken} from "../utils/validators";
import {CreateApplyDTO, TApply, TSurvey} from "../contracts/contracts";

export const appliesRouter = express.Router();

appliesRouter.get('/',
    header('Authorization').custom(v => validateToken(v)),
    validateRequest,
    async(request: Request, response: Response) => {
        const surveys = await ApplyModel.find({});
        return response.json(surveys);
});

appliesRouter.post('/',
    header('Authorization').custom(v => validateToken(v)),
    body('userId').custom((v: any) => validateObjectId(v)),
    body('surveyId').custom((v: any) => validateObjectId(v)),
    body('answers').custom((value: any) => validateAnswers(value)),
    validateRequest,
    async(request: Request, response: Response) => {
        const {userId, surveyId, answers}: CreateApplyDTO = request.body;

        const apply = await ApplyModel.findOne({userId, surveyId});
        if (apply) {
            return response.status(StatusCodes.BAD_REQUEST).send(`You've already started an apply, you cannot create a new one`);
        }

        const survey = await SurveyModel.findById(surveyId);
        if (!survey) {
            return response.status(StatusCodes.BAD_REQUEST).send(`Survey with id ${surveyId} doesn't exist`);
        }

        for await (const {questionId, answer} of answers) {
            const question = await SurveyModel.find({_id: surveyId}, {
                questions: {
                    "$elemMatch": {
                        "_id": new mongoose.Types.ObjectId(questionId)
                    }
                }
            }).then((q: any) => q[0].questions[0]);

            if (!question) {
                return response.status(StatusCodes.BAD_REQUEST).send(`Question with id ${questionId} doesn't exist`);
            }

            const isValidAnswer = question.answers.includes(answer);
            if (!isValidAnswer) {
                return response.status(StatusCodes.BAD_REQUEST).send(`invalid answer, please choose one of these: ${question.answers}`);
            }
        }

        await ApplyModel.insertMany({
            userId,
            surveyId,
            answers
        }).catch(err => response.json(err));

        response.json(apply);
});

appliesRouter.put('/',
    header('Authorization').custom(v => validateToken(v)),
    body('userId').custom((v: any) => validateObjectId(v)),
    body('surveyId').custom((v: any) => validateObjectId(v)),
    body('applyId').custom((v: any) => validateObjectId(v)),
    body('answers').custom((v: any) => validateAnswers(v)),
    validateRequest,
    async (request: Request, response: Response) => {
        const {surveyId, applyId, answers} = request.body;

        const apply: TApply | null = await ApplyModel.findById(applyId);
        if (!apply) {
            return response.status(StatusCodes.BAD_REQUEST).send(`Apply with id ${applyId} doesn't exist`);
        }

        const survey: TSurvey | null = await SurveyModel.findById(surveyId);
        if (!survey) {
            return response.status(StatusCodes.BAD_REQUEST).send(`Survey with id ${surveyId} doesn't exist`);
        }

        for await (const {questionId, answer} of answers) {
            const question = await SurveyModel.find({_id: surveyId}, {
                questions: {
                    "$elemMatch": {
                        "_id": new mongoose.Types.ObjectId(questionId)
                    }
                }
            })
                .then((q: any) => q[0].questions[0])
                .catch(err => response.json(err));

            if (!question) {
                response.status(StatusCodes.BAD_REQUEST).send(`Question with id ${questionId} doesn't exist`);
            }

            const isValidAnswer = question.answers.includes(answer);
            if (!isValidAnswer) {
                response.status(StatusCodes.BAD_REQUEST).send(`invalid answer, please choose one of these: ${question.answers}`);
            }
        }

        await ApplyModel.updateOne(
            {_id: applyId},
            {answers: apply.answers!.concat(...answers)}
        ).catch(err => response.json(err));

        response.json(apply);
});