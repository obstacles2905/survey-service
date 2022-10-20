import supertest = require("supertest");
import StatusCodes from 'http-status-codes';

import {app} from "../server";
import mongoose from "mongoose";
import {UserModel} from "../src/models/models";
import {faker} from '@faker-js/faker';

const server = app.listen();
const request = supertest.agent(server);

describe('Users endpoint', () => {
    beforeAll(() => {
       process.env.NODE_ENV = 'test';
    });

    afterAll(() => {
        mongoose.disconnect();
        server.close();
    });

    describe('/POST users', () => {
       it('Should correctly add user', async() => {
           const {body, status} = await request
               .post('/users')
               .send({name: faker.internet.userName()});

           expect(status).toEqual(StatusCodes.OK);
           expect(body).toHaveProperty("_id");

           const userExists = await UserModel.findById(body._id);

           expect(userExists).not.toBeNull();
           expect(userExists!._id.toString()).toEqual(body._id);
       })
    });

    describe('/GET users', () => {
        it('Should correctly return all users', async() => {
            const {body, status} = await request
                .get('/users')
                .set('Authorization', 'token');

            expect(status).toEqual(StatusCodes.OK);
            expect(body.length).toBeGreaterThan(0);
        });

        it('Should return Unathorized if auth token is not provided', async() => {
            const {status} = await request.get('/users');
            expect(status).toEqual(StatusCodes.UNAUTHORIZED);
        })
    });

    describe('/GET users/:id', () => {
        it('Should correctly return user', async() => {
            const {body: user} = await request
                .post('/users')
                .send({name: faker.internet.userName()});

            const {body, status} = await request
                .get(`/users/${user._id}`)
                .set('Authorization', 'token');

            expect(status).toEqual(StatusCodes.OK);
            expect(body._id).toEqual(user._id);
        });

        it('Should return Unathorized if auth token is not provided', async() => {
            const {status} = await request.get('/users/someId');
            expect(status).toEqual(StatusCodes.UNAUTHORIZED);
        })
    })

});