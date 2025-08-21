// export interface IWatchedLecture {
//     lectureId: string // FK → Lecture.id
//     watchedAt: Date
// }

import { Document, Types } from 'mongoose'

export interface IWatchedLecture {
    lecture: Types.ObjectId // FK → Lecture.id
    isLocked: boolean
    watchedAt: Date
}

export interface ICompletedModules {
    module: Types.ObjectId // FK → Module.id
    lectures: IWatchedLecture[]
    isCompleted: boolean
    completedAt?: Date
}

export interface IMyClass {
    id: string
    user: Types.ObjectId // FK → User.id
    course: Types.ObjectId // FK → Course.id
    modules: ICompletedModules[]
    overallProgress: number // %
    isCompleted: boolean
    prevLecture: Types.ObjectId
    currentLecture: Types.ObjectId
    completedAt?: Date
    createdAt?: Date // from { timestamps: true }
    updatedAt?: Date // from { timestamps: true }
}
