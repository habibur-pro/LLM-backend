/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from 'express'
import httpStatus from 'http-status'
import ApiError from '../helpers/ApiError'
import MyClass from '../model/myClass.model'
import CourseProgressService from './courseProgress.service'
import User from '../model/user.model'
import mongoose, { Types } from 'mongoose'
import Course from '../model/course.model'
import { ICompletedModules, IMyClass } from '../interface/myClass.interface'
import Module from '../model/module.model'
import Lecture from '../model/lecture.model'

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

// Adjust path to IMyClass

const nextLecture = async (classId: string, providedLectureId: string) => {
    // 1. Fetch the user's class and course structure.
    const myClass = (await MyClass.findOne({ id: classId }).populate({
        path: 'course',
        populate: {
            path: 'modules',
            populate: {
                path: 'lectures',
            },
        },
    })) as (IMyClass & { course: ICourse & { modules: IModule[] } }) | null

    if (!myClass) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Class not found')
    }

    const course = myClass.course
    if (!course) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Course not found for this class.'
        )
    } // 2. Find the lecture's position using the provided ID.

    let currentModuleIndex = -1
    let currentLectureIndex = -1
    let found = false
    for (let i = 0; i < course.modules.length; i++) {
        for (let j = 0; j < course.modules[i].lectures.length; j++) {
            if (
                course.modules[i].lectures[j]._id.toString() ===
                providedLectureId
            ) {
                currentModuleIndex = i
                currentLectureIndex = j
                found = true
                break
            }
        }
        if (found) break
    }

    if (!found) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            'Provided lecture not found in the course.'
        )
    }

    // Check if the provided lecture is the last lecture of the last module.
    const isLastLectureInCourse =
        currentModuleIndex === course.modules.length - 1 &&
        currentLectureIndex ===
            course.modules[currentModuleIndex].lectures.length - 1 // Check if the course is already completed and the user is on the last lecture.

    if (isLastLectureInCourse && myClass.isCompleted) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'This course is already completed.'
        )
    }
    // Note: The previous check `if (myClass.isCompleted)` is removed
    // to allow a user to navigate "next" even if they are in a completed
    // course, as long as they are not on the very last lecture.
    // If you prefer to block all `next` actions on a completed course,
    // you can restore that line.

    const currentModule = course.modules[currentModuleIndex]
    const currentLecture = currentModule.lectures[currentLectureIndex] // 3. Prepare the database update.

    const updateOps: any = { $set: {} }

    const isAlreadyWatched = myClass.modules.some(
        (mp) =>
            mp.module.toString() === currentModule._id.toString() &&
            mp.lectures.some(
                (lec) =>
                    lec.lecture.toString() === currentLecture._id.toString()
            )
    )

    if (!isAlreadyWatched) {
        const moduleProgressIndex = myClass.modules.findIndex(
            (mp) => mp.module.toString() === currentModule._id.toString()
        )

        if (moduleProgressIndex !== -1) {
            updateOps.$push = {
                [`modules.${moduleProgressIndex}.lectures`]: {
                    lecture: currentLecture._id,
                    watchedAt: new Date(),
                },
            }
        } else {
            updateOps.$push = {
                modules: {
                    module: currentModule._id,
                    lectures: [
                        { lecture: currentLecture._id, watchedAt: new Date() },
                    ],
                    isCompleted: false,
                },
            }
        }
    } // Check if the current module is now completed.

    const moduleProgress = myClass.modules.find(
        (mp) => mp.module.toString() === currentModule._id.toString()
    )
    const lecturesInModuleCount = moduleProgress
        ? moduleProgress.lectures.length + (isAlreadyWatched ? 0 : 1)
        : 1
    if (lecturesInModuleCount === currentModule.lectures.length) {
        const moduleIndexToUpdate = myClass.modules.findIndex(
            (mp) => mp.module.toString() === currentModule._id.toString()
        )
        if (moduleIndexToUpdate !== -1) {
            updateOps.$set[`modules.${moduleIndexToUpdate}.isCompleted`] = true
            updateOps.$set[`modules.${moduleIndexToUpdate}.completedAt`] =
                new Date()
        }
    } // 4. Find the next sequential lecture.

    let nextLecture = null
    if (currentLectureIndex + 1 < currentModule.lectures.length) {
        nextLecture = currentModule.lectures[currentLectureIndex + 1]
    } else if (currentModuleIndex + 1 < course.modules.length) {
        const nextModule = course.modules[currentModuleIndex + 1]
        if (nextModule.lectures.length > 0) {
            nextLecture = nextModule.lectures[0]
        }
    } // 5. Calculate overall progress.

    const totalLectures = course.modules.reduce(
        (sum, module) => sum + module.lectures.length,
        0
    )
    const completedLecturesCount =
        myClass.modules.reduce((sum, mp) => sum + mp.lectures.length, 0) +
        (isAlreadyWatched ? 0 : 1)
    const overallProgress =
        totalLectures > 0 ? (completedLecturesCount / totalLectures) * 100 : 0
    updateOps.$set.overallProgress = overallProgress // 6. Finalize the database update.

    if (nextLecture) {
        updateOps.$set.currentLecture = nextLecture._id
    } else {
        updateOps.$set.isCompleted = true
        updateOps.$set.completedAt = new Date()
        updateOps.$set.overallProgress = 100
        updateOps.$unset = { currentLecture: '' }
    } // Execute the single atomic update query.

    const updatedMyClass = await MyClass.findOneAndUpdate(
        { id: classId },
        updateOps,
        { new: true, runValidators: true }
    )

    return updatedMyClass
}

const previousLecture = async (classId: string) => {
    // 1. Fetch the MyClass document with the full course structure.
    const myClass = (await MyClass.findOne({ id: classId }).populate({
        path: 'course',
        populate: {
            path: 'modules',
            populate: {
                path: 'lectures',
            },
        },
    })) as (IMyClass & { course: ICourse & { modules: IModule[] } }) | null

    // 2. Perform necessary validation checks.
    if (!myClass) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Class not found')
    }

    const { course } = myClass
    if (!course) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Course not found for this class.'
        )
    }

    // 3. Get the ID of the current lecture.
    const currentLectureId = myClass.currentLecture
        ? myClass.currentLecture.toString()
        : null
    if (!currentLectureId) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Current lecture not specified in class data.'
        )
    }

    // 4. Find the current lecture and module by iterating through the course structure.
    let currentModuleIndex = -1
    let currentLectureIndex = -1

    for (let i = 0; i < course.modules.length; i++) {
        currentLectureIndex = course.modules[i].lectures.findIndex(
            (lec) => lec._id.toString() === currentLectureId
        )
        if (currentLectureIndex !== -1) {
            currentModuleIndex = i
            break
        }
    }

    // 5. Check if the current lecture was found.
    if (currentModuleIndex === -1) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            'Current lecture not found in the course.'
        )
    }

    const currentModule = course.modules[currentModuleIndex]

    // 6. Find the previous lecture.
    let previousLecture = null
    if (currentLectureIndex > 0) {
        // If not the first lecture of the current module, get the previous one in the same module.
        previousLecture = currentModule.lectures[currentLectureIndex - 1]
    } else if (currentModuleIndex > 0) {
        // If it is the first lecture of the current module, get the last lecture of the previous module.
        const previousModule = course.modules[currentModuleIndex - 1]
        previousLecture =
            previousModule.lectures[previousModule.lectures.length - 1]
    } else {
        // No previous lecture exists (it's the very first lecture of the course).
        // In this case, we don't update anything and simply return the current lecture ID.
        return myClass.currentLecture
    }

    // 7. Update the MyClass document in the database with the ID of the previous lecture.
    const updatedMyClass = await MyClass.findOneAndUpdate(
        { id: classId },
        { $set: { currentLecture: previousLecture._id } },
        { new: true }
    )

    // 8. Return the ID of the new current lecture.
    return updatedMyClass?.currentLecture
}

const getSingleClassWithProgress = async (classId: string) => {
    // 1. Fetch the MyClass document and fully populate all related data.
    const myClass = (await MyClass.findOne({ id: classId })
        .populate({
            path: 'course',
            populate: {
                path: 'modules',
                populate: {
                    path: 'lectures',
                },
            },
        })
        .lean()) as
        | (IMyClass & { course: ICourse & { modules: IModule[] } })
        | null

    if (!myClass) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Class not found')
    }

    const { course } = myClass
    if (!course) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Course not found for this class.'
        )
    }

    let totalLectures = 0
    let completedLecturesCount = 0
    let currentModuleId = null

    const processedModules = course.modules.map((courseModule) => {
        const moduleProgress = myClass.modules.find(
            (item) => item.module.toString() === courseModule._id.toString()
        )
        // Track the completion status of the previous lecture in this module.
        let isPreviousLectureCompleted = true

        const processedLectures = courseModule.lectures.map((lecture) => {
            totalLectures++

            const isLectureCompleted = moduleProgress?.lectures.some(
                (watchedLec) =>
                    watchedLec.lecture.toString() === lecture._id.toString()
            )

            // Check if this is the current lecture being watched.
            const isCurrentLecture =
                myClass.currentLecture &&
                lecture._id.toString() === myClass.currentLecture.toString()

            // The lecture is unlocked if it's the current one, has been completed, or the previous one was completed.
            // This is the core logic for visual unlocking on the frontend.
            const isLectureUnlocked =
                isCurrentLecture ||
                isLectureCompleted ||
                isPreviousLectureCompleted // For the next iteration, update the flag for the next lecture.

            // This flag is ONLY set to true if the current lecture is completed.
            //@ts-ignore
            isPreviousLectureCompleted = isLectureCompleted

            // Only count completed lectures for the progress bar.
            if (isLectureCompleted) {
                completedLecturesCount++
            } // Find the current module ID.

            if (isCurrentLecture) {
                currentModuleId = courseModule._id
            }

            return {
                ...lecture,
                isCompleted: isLectureCompleted,
                isLocked: !isLectureUnlocked,
            }
        })

        return {
            ...courseModule,
            isCompleted: !!moduleProgress?.isCompleted,
            lectures: processedLectures,
        }
    })

    const overallProgressPercentage =
        totalLectures > 0 ? (completedLecturesCount / totalLectures) * 100 : 0
    const currentLectureData = await Lecture.findById(myClass.currentLecture)

    return {
        currentLecture: currentLectureData,
        currentModuleId: currentModuleId,
        course: {
            ...course,
            modules: processedModules,
        },
        overallProgress: overallProgressPercentage,
    }
}

const setCurrentLecture = async (classId: string, lectureId: string) => {
    const myClass = await MyClass.findOne({ id: classId })
    if (!myClass) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'class are not found')
    }
    const lecture = await Lecture.findOne({ id: lectureId })
    if (!lecture) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'lecture are not found')
    }
    await MyClass.findOneAndUpdate(
        { id: myClass.id },
        { currentLecture: lecture._id },
        { new: true }
    )
    return { message: 'current lecture updated' }
}

const MyClassService = {
    getMyClasses,
    nextLecture,
    previousLecture,
    getSingleClassWithProgress,
    setCurrentLecture,
}
export default MyClassService
