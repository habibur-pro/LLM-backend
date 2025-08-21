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

const nextLecture = async (classId: string) => {
    // 1. Fetch the user's class and course structure in one query.
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

    if (myClass.isCompleted) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'This course is already completed.'
        )
    }

    const course = myClass.course
    if (!course) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Course not found for this class.'
        )
    }

    // Determine the current lecture ID from the myClass document.
    const currentLectureId = myClass.currentLecture
        ? myClass.currentLecture.toString()
        : null

    if (!currentLectureId) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Current lecture not specified in class data.'
        )
    }

    // Find the current module and lecture in the populated course structure.
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

    if (currentModuleIndex === -1) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            'Current lecture not found in the course.'
        )
    }

    const currentModule = course.modules[currentModuleIndex]
    const currentLecture =
        course.modules[currentModuleIndex].lectures[currentLectureIndex]

    // 2. Prepare the database update with a single operation for atomicity.
    const updateOps: any = { $set: {} }

    // Check if the current lecture has already been watched to prevent duplicate entries.
    const isAlreadyWatched = myClass.modules.some(
        (mp) =>
            mp.module.toString() === currentModule._id.toString() &&
            mp.lectures.some(
                (lec) =>
                    lec.lecture.toString() === currentLecture._id.toString()
            )
    )

    if (!isAlreadyWatched) {
        // Find the index of the module progress in the user's modules array.
        const moduleProgressIndex = myClass.modules.findIndex(
            (mp) => mp.module.toString() === currentModule._id.toString()
        )

        if (moduleProgressIndex !== -1) {
            // The module progress entry already exists, so atomically push the new lecture.
            updateOps.$push = {
                [`modules.${moduleProgressIndex}.lectures`]: {
                    lecture: currentLecture._id,
                    watchedAt: new Date(),
                },
            }
        } else {
            // The module progress entry does not exist, so atomically push a new one.
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
    }

    // Check if the current module is now completed.
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
    }

    // 3. Find the next lecture.
    let nextLecture = null
    if (currentLectureIndex + 1 < currentModule.lectures.length) {
        nextLecture = currentModule.lectures[currentLectureIndex + 1]
    } else if (currentModuleIndex + 1 < course.modules.length) {
        const nextModule = course.modules[currentModuleIndex + 1]
        nextLecture = nextModule.lectures[0]
    }

    // 4. Calculate overall progress.
    let totalLectures = 0
    course.modules.forEach((module) => {
        totalLectures += module.lectures.length
    })

    const completedLecturesCount =
        myClass.modules.reduce((sum, mp) => sum + mp.lectures.length, 0) +
        (isAlreadyWatched ? 0 : 1)

    const overallProgress =
        totalLectures > 0 ? (completedLecturesCount / totalLectures) * 100 : 0

    updateOps.$set.overallProgress = overallProgress

    // 5. Final update based on whether a next lecture exists.
    if (nextLecture) {
        updateOps.$set.currentLecture = nextLecture._id
    } else {
        updateOps.$set.isCompleted = true
        updateOps.$set.completedAt = new Date()
        updateOps.$set.overallProgress = 100
        updateOps.$unset = { currentLecture: '' }
    }

    // Execute the single atomic update query.
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
    const myClassModules = myClass.modules

    if (!course) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Course not found for this class.'
        )
    }

    let totalLectures = 0
    let unlockedLecturesCount = 0

    // Find the current lecture's module ID
    let currentModuleId = null

    const processedModules = course.modules.map((courseModule) => {
        const moduleProgress = myClassModules.find(
            (item) => item.module.toString() === courseModule._id.toString()
        )

        const isModuleCompleted = !!moduleProgress?.isCompleted

        // Process lectures within this module.
        const processedLectures = courseModule.lectures.map((lecture) => {
            totalLectures++ // Increment total lecture count

            const lectureWatched = moduleProgress?.lectures.find(
                (watchedLec) =>
                    watchedLec.lecture.toString() === lecture._id.toString()
            )

            // Check if the lecture is completed or is the current lecture being watched.
            const isLectureCompleted = !!lectureWatched
            const isCurrentLecture =
                lecture._id.toString() === myClass.currentLecture?.toString()

            // A lecture is unlocked if it's completed or if it's the current one.
            const isLectureUnlocked = isLectureCompleted || isCurrentLecture

            if (isLectureUnlocked) {
                unlockedLecturesCount++
            }

            // Set the current module ID if this is the current lecture
            if (isCurrentLecture) {
                currentModuleId = courseModule._id
            }

            return {
                ...lecture,
                isCompleted: isLectureCompleted,
                isLocked: !isLectureUnlocked, // isLocked is the inverse of isLectureUnlocked
            }
        })

        return {
            ...courseModule,
            isCompleted: isModuleCompleted,
            lectures: processedLectures,
        }
    })

    const overallProgressPercentage =
        totalLectures > 0 ? (unlockedLecturesCount / totalLectures) * 100 : 0
    const currentLectureData = await Lecture.findById(myClass.currentLecture)
    return {
        currentLecture: currentLectureData,
        currentModuleId: currentModuleId, // The new field with the current module ID
        course: {
            ...course,
            modules: processedModules,
        },
        overallProgress: overallProgressPercentage,
        unlockedLecturesCount: unlockedLecturesCount,
    }
}
const MyClassService = {
    getMyClasses,
    nextLecture,
    previousLecture,
    getSingleClassWithProgress,
}
export default MyClassService
