export type TSurvey = {
    _id: string,
    name: string,
    description: string,
    questions?: TQuestion[]
}

export type TQuestion = {
    _id: string,
    question: string,
    answers: string[]
}

export type TUser = {
    _id: string,
    name: string
}

export type TApply = {
    _id: string,
    userId: string,
    surveyId: string,
    answers?: TAnswer[]
}

export type TAnswer = {
    questionId: string,
    answer: any
}

export type CreateApplyDTO = {
    userId: string,
    surveyId: string,
    answers: TAnswer[]
}