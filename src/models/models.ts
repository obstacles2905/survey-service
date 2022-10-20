import * as mongoose from 'mongoose';
import {Schema} from "mongoose";

export const QuestionSchema = new mongoose.Schema({
    question: String,
    answers: [String]
});

export const SurveySchema = new mongoose.Schema({
    name: String,
    description: String,
    questions: [QuestionSchema]
});

export const UserSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    name: String
});

export const ApplySchema = new mongoose.Schema({
   userId: mongoose.Types.ObjectId,
   surveyId: mongoose.Types.ObjectId,
   answers: [{
       questionId: mongoose.Types.ObjectId,
       answer: Schema.Types.Mixed
   }]
});

export const AuthTokenSchema = new mongoose.Schema({
    userId: mongoose.Types.ObjectId,
    token: String
});

export const AuthTokenModel = mongoose.model('authTokens', AuthTokenSchema);
export const ApplyModel = mongoose.model('applies', ApplySchema);
export const SurveyModel = mongoose.model('surveys', SurveySchema);
export const UserModel = mongoose.model('users', UserSchema);
