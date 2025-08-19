import { Types } from 'mongoose'

export interface IWatchedLecture {
    lecture: Types.ObjectId
    watchedAt: Date
}

export interface IModuleProgress {
    module: Types.ObjectId
    lecturesWatched: IWatchedLecture[]
    isCompleted: boolean
    isLocked: boolean
    completedAt: Date
}

export interface IWatchHistory extends Document {
    id: string
    userId: string
    user: Types.ObjectId
    courseId: string
    course: Types.ObjectId
    modulesProgress: IModuleProgress[]
    totalProgress: number
    isCompleted: boolean
    completedAt: Date
    createdAt: Date
    updatedAt: Date
}

export interface WatchHistoryCreatePayload {
    courseId: string
    userId: string
}
