import { LectureContentType } from '../enum'

export interface ILecture {
    id: string
    moduleId: string
    title: string
    content: string
    contentType: LectureContentType
    createdAt: Date
    updatedAt: Date
}
