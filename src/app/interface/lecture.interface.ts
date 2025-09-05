import { LectureContentType } from '../enum'

export interface ILecture {
    id: string
    moduleId: string
    lectureNumber: number
    title: string
    content: string
    notes: Array<string>
    contentType: LectureContentType
    createdAt: Date
    updatedAt: Date
}
