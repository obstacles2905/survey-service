import supertest = require("supertest");
import StatusCodes from 'http-status-codes';

import { app } from "../server";
import mongoose from "mongoose";
import {SurveyModel} from "../src/models/models";
import {faker} from '@faker-js/faker';

const server = app.listen();
const request = supertest.agent(server);

describe('Surveys endpoint', () => {
    beforeAll(() => {
       process.env.NODE_ENV = 'test';
    });

    afterAll(() => {
        mongoose.disconnect();
        server.close();
    });

    describe('POST /surveys', () => {
        it('Should create a survey', async() => {
            await request.post('/surveys')
                .send({name: 'Test Survey1', description: 'Survey description'})
                .set('Authorization', 'token');

            const {body} = await request.get('/surveys')
                .set('Authorization', 'token');

            expect(body.length).toBeGreaterThan(0);
        })
    });

    describe('GET /surveys', () => {
        it('Should return surveys', async() => {
            const {status}  = await request.get('/surveys')
                .set('Authorization', 'token');
            expect(status).toEqual(StatusCodes.OK);
        });

        it('Should throw 401 if auth token is not provided', async() => {
            const {status} = await request.get('/surveys');
            expect(status).toEqual(StatusCodes.UNAUTHORIZED);
        });
    });

    describe('GET /surveys/:id', () => {
        it('Should return a specific survey', async() => {
            await request.post('/surveys')
                .send({name: 'Test Survey2', description: 'Survey description'})
                .set('Authorization', 'token');

            const {body} = await request.get('/surveys')
                .set('Authorization', 'token');

            const survey = await request.get(`/surveys/${body[0]._id}`)
                .set('Authorization', 'token');

            expect(survey.body._id).toEqual(body[0]._id);
        });
    });

    describe('PUT /surveys', () => {
        it('Should update a survey', async() => {
            const name = faker.company.name();
            await request.post('/surveys')
                .send({name, description: 'Survey description'})
                .set('Authorization', 'token');

            const surveyOriginal = await SurveyModel.findOne({
                name,
                description: 'Survey description'
            });

            const nameUpdated = faker.company.name();
            await request.put(`/surveys/`)
                .send({
                    id: surveyOriginal!._id.toString(),
                    name: nameUpdated,
                    questions: [{
                        question: '2+2=?',
                        answers: [1, 2, 3, 4]
                    }]
                })
                .set('Authorization', 'token');

            const surveyUpdated = await SurveyModel.findById(surveyOriginal!._id.toString());

            expect(surveyUpdated!.name).toEqual(nameUpdated);
            expect(surveyUpdated!.questions).not.toBeUndefined();
        });
    });

    describe('POST /surveys/questions', () => {
        it('Should correctly add question to survey', async() => {
            const name = faker.company.name();
            const description = faker.company.name();

            await request.post('/surveys')
                .send({
                    name,
                    description
                })
                .set('Authorization', 'token');

            const survey = await SurveyModel.findOne({name});

            const questions = [{
                question: "3+3=?",
                answers: [1, 2, 5, 6]
            }];
            await request.post('/surveys/questions')
                .send({
                    id: survey!._id,
                    questions
                })
                .set('Authorization', 'token');

            const surveyWithQuestions = await SurveyModel.findById(survey!._id);
            expect(surveyWithQuestions).not.toBeNull();
            expect(surveyWithQuestions!.questions).toHaveLength(1);
        })
    })
});