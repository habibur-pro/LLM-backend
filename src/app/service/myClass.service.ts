/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from 'express'
import httpStatus from 'http-status'
import ApiError from '../helpers/ApiError'
import MyClass from '../model/myClass.model'
import CourseProgressService from './courseProgress.service'
import User from '../model/user.model'
import mongoose, { Types } from 'mongoose'
import Course from '../model/course.model'

export interface ILecture extends Document {
    _id: Types.ObjectId
    title: string
    // add more lecture fields if needed
}

export interface IModule extends Document {
    _id: Types.ObjectId
    title: string
    lectures: ILecture[]
}

export interface ICourse extends Document {
    _id: Types.ObjectId
    title: string
    modules: IModule[]
}

const getMyClasses = async (req: Request) => {
    const userData = req.user
    if (!userData) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'user not found')
    }
    const user = await User.findOne({ id: userData.id })
    if (!user) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'user not found')
    }
    return await MyClass.find({ user: user._id }).populate('course')
}

export const nextLecture = async (progressId: string) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        // 1. Load course progress
        const courseProgress = await MyClass.findOne({
            id: progressId,
        }).session(session)
        if (!courseProgress) {
            throw new Error('Progress not found')
        }

        // 2. Load course with populated modules + lectures
        const course = await Course.findById(courseProgress.course)
            .populate<{ modules: IModule[] }>({
                path: 'modules',
                populate: { path: 'lectures' },
            })
            .session(session)

        if (!course) {
            throw new Error('Course not found')
        }

        // 3. Find current module and lecture index
        let currentModule: IModule | undefined
        let lectureIndex = -1

        for (const module of course.modules) {
            lectureIndex = module.lectures.findIndex(
                (lec: ILecture) =>
                    lec._id.toString() ===
                    courseProgress.currentLecture.toString()
            )
            if (lectureIndex !== -1) {
                currentModule = module
                break
            }
        }

        if (!currentModule)
            throw new Error('Current lecture not found in course')

        // 4. Mark lecture as watched
        const moduleProgress = courseProgress.completedModules.find(
            (m) => m.module.toString() === currentModule!._id.toString()
        )

        if (moduleProgress) {
            if (
                !moduleProgress.lecturesWatched.some(
                    (w) =>
                        w.lecture.toString() ===
                        courseProgress.currentLecture.toString()
                )
            ) {
                moduleProgress.lecturesWatched.push({
                    lecture: courseProgress.currentLecture,
                    watchedAt: new Date(),
                })
            }
        } else {
            courseProgress.completedModules.push({
                module: currentModule._id,
                lecturesWatched: [
                    {
                        lecture: courseProgress.currentLecture,
                        watchedAt: new Date(),
                    },
                ],
                isCompleted: false, // required by ICompletedModules
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                completedAt: null, // optional but good to initialize
            })
        }

        // 5. Decide next lecture
        let nextLecture: ILecture | null = null

        if (lectureIndex + 1 < currentModule.lectures.length) {
            // same module → next lecture
            nextLecture = currentModule.lectures[lectureIndex + 1]
        } else {
            // module finished → move to next module
            const moduleIndex = course.modules.findIndex(
                (m) => m._id.toString() === currentModule!._id.toString()
            )

            // mark module complete
            const moduleProg = courseProgress.completedModules.find(
                (m) => m.module.toString() === currentModule!._id.toString()
            )
            if (moduleProg) {
                moduleProg.isCompleted = true
                moduleProg.completedAt = new Date()
            }

            if (moduleIndex + 1 < course.modules.length) {
                nextLecture = course.modules[moduleIndex + 1].lectures[0]
            } else {
                // entire course complete
                courseProgress.isCompleted = true
                courseProgress.completedAt = new Date()
            }
        }

        // 6. Update progress state
        if (nextLecture) {
            courseProgress.prevLecture = courseProgress.currentLecture
            courseProgress.currentLecture = nextLecture._id
        }

        // 7. Update overall progress (%)
        const totalLectures = course.modules.reduce(
            (sum, m) => sum + m.lectures.length,
            0
        )
        const watchedLectures = courseProgress.completedModules.reduce(
            (sum, m) => sum + m.lecturesWatched.length,
            0
        )
        courseProgress.overallProgress = Math.round(
            (watchedLectures / totalLectures) * 100
        )

        await courseProgress.save({ session })
        await session.commitTransaction()
        session.endSession()

        return courseProgress
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
}

const previousLecture = async (progressId: string) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        // 1. Load progress
        const courseProgress = await MyClass.findOne({
            id: progressId,
        }).session(session)
        if (!courseProgress) throw new Error('Progress not found')

        // 2. Load course with modules + lectures populated
        const course = await Course.findById(courseProgress.course)
            .populate<{ modules: IModule[] }>({
                path: 'modules',
                populate: { path: 'lectures' },
            })
            .session(session)

        if (!course) throw new Error('Course not found')

        // 3. Find current module and lecture
        let currentModule: IModule | undefined
        let lectureIndex = -1

        for (const module of course.modules) {
            lectureIndex = module.lectures.findIndex(
                (lec: ILecture) =>
                    lec._id.toString() ===
                    courseProgress.currentLecture.toString()
            )
            if (lectureIndex !== -1) {
                currentModule = module
                break
            }
        }

        if (!currentModule)
            throw new Error('Current lecture not found in course')

        // 4. Decide previous lecture
        let previousLecture: ILecture | null = null

        if (lectureIndex > 0) {
            // case: previous lecture in the same module
            previousLecture = currentModule.lectures[lectureIndex - 1]
        } else {
            // case: if it's the first lecture of the module → go to last lecture of previous module
            const moduleIndex = course.modules.findIndex(
                (m) => m._id.toString() === currentModule!._id.toString()
            )

            if (moduleIndex > 0) {
                const prevModule = course.modules[moduleIndex - 1]
                previousLecture =
                    prevModule.lectures[prevModule.lectures.length - 1]
            }
        }

        if (!previousLecture) {
            throw new Error('No previous lecture available')
        }

        // 5. Update progress
        courseProgress.prevLecture = courseProgress.currentLecture
        courseProgress.currentLecture = previousLecture._id

        await courseProgress.save({ session })
        await session.commitTransaction()
        session.endSession()

        return courseProgress
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
}

// Function to get a single myClass with progress and lecture lock/unlock
const getSingleClassWithProgress = async (classId: string) => {
    const myClass = await MyClass.findOne({ id: classId })
        .populate({
            path: 'course',
            populate: {
                path: 'modules',
                populate: {
                    path: 'lectures', // fully populate each lecture
                },
            },
        })
        .lean()

    if (!myClass) throw new Error('Class not found')

    const course = myClass.course
    //@ts-ignore
    if (!course?.modules) {
        return {
            ...myClass,
            progress: 0,
            currentLecture: null,
            nextLecture: null,
        }
    }

    const completedLectures = new Set(
        (myClass.completedModules || []).flatMap((m: any) =>
            m.lecturesWatched.map((w: any) => w.lecture.toString())
        )
    )

    let totalLectures = 0
    let completedLecturesCount = 0
    let unlockedLectureFound = false

    let currentLecture: any = null
    let nextLecture: any = null
    let foundCurrent = false
    //@ts-ignore
    const modulesWithStatus = course.modules.map((module: any) => {
        let moduleCompletedLectures = 0

        const lecturesWithStatus = module.lectures.map((lecture: any) => {
            totalLectures++

            const isCompleted = completedLectures.has(lecture._id.toString())
            if (isCompleted) {
                completedLecturesCount++
                moduleCompletedLectures++
            }

            const isUnlocked =
                isCompleted || (!unlockedLectureFound && !isCompleted)
            if (!isCompleted && !unlockedLectureFound) {
                unlockedLectureFound = true
            }

            // Set current and next lecture
            if (!foundCurrent && !isCompleted) {
                currentLecture = lecture // full populated lecture
                foundCurrent = true
            } else if (foundCurrent && !nextLecture) {
                nextLecture = lecture // full populated lecture
            }

            return {
                ...lecture,
                isCompleted,
                isUnlocked,
            }
        })

        return {
            ...module,
            lectures: lecturesWithStatus,
            isCompleted: moduleCompletedLectures === module.lectures.length,
        }
    })

    const progress =
        totalLectures > 0
            ? Math.round((completedLecturesCount / totalLectures) * 100)
            : 0

    return {
        ...myClass,
        course: {
            ...course,
            modules: modulesWithStatus,
        },
        progress,
        currentLecture,
        nextLecture,
    }
}
const MyClassService = {
    getMyClasses,
    nextLecture,
    previousLecture,
    getSingleClassWithProgress,
}
export default MyClassService
