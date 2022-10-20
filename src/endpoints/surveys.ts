import express, {NextFunction, Request, Response} from "express";
import {body, header, param} from 'express-validator';
import {SurveyModel} from "../models/models";
import StatusCodes from 'http-status-codes';
import {TSurvey} from "../contracts/contracts";
import {validateObjectId, validateQuestions, validateRequest, validateToken} from "../utils/validators";

export const surveysRouter = express.Router();

surveysRouter.get('/',
    header('Authorization').custom(v => validateToken(v)),
    validateRequest,
    async(request: Request, response: Response) => {
        const surveys = await SurveyModel.find({});
        return response.json(surveys);
});

surveysRouter.get('/:id',
    header('Authorization').custom(v => validateToken(v)),
    param('id').custom((v: any) => validateObjectId(v)),
    validateRequest,
    async (request: Request, response: Response) => {
        const {id} = request.params;
        const survey = await SurveyModel.findById(id);
        return response.json(survey);
});

surveysRouter.post('/',
    header('Authorization').custom(v => validateToken(v)),
    body('name', `name should be a valid string`).isString(),
    body('description',`description should be a valid string`).isString(),
    validateRequest,
    async (request: Request, response: Response) => {
        const {name, description} = request.body;

        const surveyExists = await SurveyModel.findOne({name});
        if (surveyExists) {
            return response.status(StatusCodes.BAD_REQUEST)
                .send(`Survey with name ${name} already exists. Please use PUT method if you want to update an existing survey`);
        }

        const result = await SurveyModel
            .insertMany({name, description, questions: []})
            .catch(err => response.json(err));
        return response.json(result)
});

surveysRouter.put('/',
    header('Authorization').custom(v => validateToken(v)),
    body('id').custom((v: any) => validateObjectId(v)),
    body('name', 'name should be a valid string').optional().isString(),
    body('description', 'description should be a valid string').optional().isString(),
    body('questions').custom((v: any) => validateQuestions(v)),
    validateRequest,
    async (request: Request, response: Response) => {
        const {id, name, description, questions} = request.body;

        const surveyExists = await SurveyModel.findById(id);
        if (!surveyExists) {
            return response.status(StatusCodes.BAD_REQUEST).send(`Survey with name ${name} doesn't exist`);
        }

        const result = await SurveyModel.updateOne({_id: id}, {
            name,
            description,
            questions
        }).catch(err => response.json(err));
        return response.json(result);
    }
);

surveysRouter.post(
    '/questions',
    header('Authorization').custom(v => validateToken(v)),
    body('id').custom((v: any) => validateObjectId(v)),
    body('questions').custom((v: any) => validateQuestions(v)),
    validateRequest,
    async(request: Request, response: Response, next: NextFunction) => {
        const {id, questions} = request.body;

        const surveyExists: TSurvey | null = await SurveyModel.findById(id);
        if (!surveyExists) {
            return response.status(StatusCodes.BAD_REQUEST).send(`Survey with id ${id} doesn't exist`);
        }

        await SurveyModel.updateOne(
            {_id: id},
            {questions: surveyExists.questions!.concat(...questions)}
        ).catch(err => response.json(err));
        return response.json(surveyExists);
});