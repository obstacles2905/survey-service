import supertest = require("supertest");
import StatusCodes from 'http-status-codes';

import { app } from "../server";
import mongoose from "mongoose";
import {SurveyModel} from "../src/models/models";
import {faker} from '@faker-js/faker';
import {CreateApplyDTO, TQuestion, TSurvey} from "../src/contracts/contracts";

const server = app.listen();
const request = supertest.agent(server);

describe('Applies endpoint', () => {
    beforeAll(() => {
       process.env.NODE_ENV = 'test';
    });

    afterAll(() => {
        mongoose.disconnect();
        server.close();
    });

    describe('/POST applies', () => {
        it('Should correctly create a new apply', async() => {
            const {body: user} = await request.post('/users').send({name: faker.internet.userName()});
            const {body: [survey]} = await request
                .post('/surveys')
                .send({name: faker.company.name(), description: "Survey description"})
                .set('Authorization', 'token');
            await request
                .post('/surveys/questions')
                .send({
                    id: survey._id.toString(),
                    questions: [{question: "2+2=?", answers: [1, 2, 3, 4]}]
                })
                .set('Authorization', 'token');

            const surveyWithQuestions = await SurveyModel.findById(survey._id.toString()) as TSurvey;

            const payload: CreateApplyDTO =  {
                userId: user._id.toString(),
                surveyId: survey._id.toString(),
                answers: surveyWithQuestions
                    .questions!.map((q: TQuestion) => ({
                        questionId: q._id.toString(),
                        answer: q.answers[0]
                    }))
            };

            const {status} = await request
                .post('/applies')
                .send(payload)
                .set('Authorization', 'token');

            expect(status).toBe(StatusCodes.OK);
        });

        it(`Should not create an apply if survey doesn't exist`, async() => {
            const surveyId = new mongoose.Types.ObjectId().toString();
            const {status, text} = await request
                .post('/applies')
                .send({
                    userId: new mongoose.Types.ObjectId().toString(),
                    surveyId,
                    answers: []
                })
                .set('Authorization', 'token');
            expect(status).toBe(StatusCodes.BAD_REQUEST);
            expect(text).toEqual(`Survey with id ${surveyId} doesn't exist`);
        });

        it('Should not create an apply for an incorrect question id', async() => {
            const {body: user} = await request.post('/users').send({name: faker.internet.userName()});
            const {body: [survey]} = await request
                .post('/surveys')
                .send({name: faker.company.name(), description: "Survey description"})
                .set('Authorization', 'token');
            await request
                .post('/surveys/questions')
                .send({
                    id: survey._id.toString(),
                    questions: [{question: "2+2=?", answers: [1, 2, 3, 4]}]
                })
                .set('Authorization', 'token');

            const surveyWithQuestions = await SurveyModel.findById(survey._id.toString()) as TSurvey;

            const invalidQuestionId = new mongoose.Types.ObjectId().toString();
            const payload: CreateApplyDTO =  {
                userId: user._id.toString(),
                surveyId: survey._id.toString(),
                answers: surveyWithQuestions
                    .questions!.map((q: TQuestion) => ({
                        questionId: invalidQuestionId,
                        answer: q.answers[0]
                    }))
            };

            const {status, text} = await request
                .post('/applies')
                .send(payload)
                .set('Authorization', 'token');

            expect(status).toBe(StatusCodes.BAD_REQUEST);
            expect(text).toEqual(`Question with id ${invalidQuestionId} doesn't exist`);
        });

        it(`Should not create an apply if one of the answers doesn't exist`, async() => {
            const {body: user} = await request.post('/users').send({name: faker.internet.userName()});
            const {body: [survey]} = await request
                .post('/surveys')
                .send({name: faker.company.name(), description: "Survey description"})
                .set('Authorization', 'token');

            await request
                .post('/surveys/questions')
                .send({
                    id: survey._id.toString(),
                    questions: [{question: "2+2=?", answers: [1, 2, 3, 4]}]
                })
                .set('Authorization', 'token');

            const surveyWithQuestions = await SurveyModel.findById(survey._id.toString()) as TSurvey;

            const payload: CreateApplyDTO =  {
                userId: user._id.toString(),
                surveyId: survey._id.toString(),
                answers: surveyWithQuestions
                    .questions!.map((q: TQuestion) => ({
                        questionId: q._id.toString(),
                        answer: 5
                    }))
            };

            const {status, text} = await request
                .post('/applies')
                .send(payload)
                .set('Authorization', 'token');

            expect(text).toContain(`invalid answer`);
            expect(status).toBe(StatusCodes.BAD_REQUEST);
        });
    })
});