// export interface IWatchedLecture {
//     lectureId: string // FK → Lecture.id
//     watchedAt: Date
// }

import { Types } from 'mongoose'

// export interface IModuleProgress {
//     moduleId: string // FK → Module.id
//     lecturesWatched: IWatchedLecture[]
//     isCompleted: boolean
//     completedAt?: Date
// }

// export interface IUserCourseProgress {
//     userId: string // FK → User.id
//     courseId: string // FK → Course.id
//     modules: IModuleProgress[]
//     overallProgress: number // %
//     isCompleted: boolean
//     completedAt?: Date
//     createdAt?: Date // from { timestamps: true }
//     updatedAt?: Date // from { timestamps: true }
// }

export interface IWatchedLecture {
    lecture: Types.ObjectId // FK → Lecture.id
    watchedAt: Date
}

export interface ICompletedModules {
    module: Types.ObjectId // FK → Module.id
    lecturesWatched: IWatchedLecture[]
    isCompleted: boolean
    completedAt?: Date
}

export interface IMyClass {
    id: string
    user: Types.ObjectId // FK → User.id
    course: Types.ObjectId // FK → Course.id
    completedModules: ICompletedModules[]
    overallProgress: number // %
    isCompleted: boolean
    prevLecture: Types.ObjectId
    currentLecture: Types.ObjectId
    completedAt?: Date
    createdAt?: Date // from { timestamps: true }
    updatedAt?: Date // from { timestamps: true }
}
