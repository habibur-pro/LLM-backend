"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextLecture = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../helpers/ApiError"));
const myClass_model_1 = __importDefault(require("../model/myClass.model"));
const user_model_1 = __importDefault(require("../model/user.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const course_model_1 = __importDefault(require("../model/course.model"));
const getMyClasses = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = req.user;
    if (!userData) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'user not found');
    }
    const user = yield user_model_1.default.findOne({ id: userData.id });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'user not found');
    }
    return yield myClass_model_1.default.find({ user: user._id }).populate('course');
});
const nextLecture = (progressId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // 1. Load course progress
        const courseProgress = yield myClass_model_1.default.findOne({
            id: progressId,
        }).session(session);
        if (!courseProgress) {
            throw new Error('Progress not found');
        }
        // 2. Load course with populated modules + lectures
        const course = yield course_model_1.default.findById(courseProgress.course)
            .populate({
            path: 'modules',
            populate: { path: 'lectures' },
        })
            .session(session);
        if (!course) {
            throw new Error('Course not found');
        }
        // 3. Find current module and lecture index
        let currentModule;
        let lectureIndex = -1;
        for (const module of course.modules) {
            lectureIndex = module.lectures.findIndex((lec) => lec._id.toString() ===
                courseProgress.currentLecture.toString());
            if (lectureIndex !== -1) {
                currentModule = module;
                break;
            }
        }
        if (!currentModule)
            throw new Error('Current lecture not found in course');
        // 4. Mark lecture as watched
        const moduleProgress = courseProgress.completedModules.find((m) => m.module.toString() === currentModule._id.toString());
        if (moduleProgress) {
            if (!moduleProgress.lecturesWatched.some((w) => w.lecture.toString() ===
                courseProgress.currentLecture.toString())) {
                moduleProgress.lecturesWatched.push({
                    lecture: courseProgress.currentLecture,
                    watchedAt: new Date(),
                });
            }
        }
        else {
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
            });
        }
        // 5. Decide next lecture
        let nextLecture = null;
        if (lectureIndex + 1 < currentModule.lectures.length) {
            // same module → next lecture
            nextLecture = currentModule.lectures[lectureIndex + 1];
        }
        else {
            // module finished → move to next module
            const moduleIndex = course.modules.findIndex((m) => m._id.toString() === currentModule._id.toString());
            // mark module complete
            const moduleProg = courseProgress.completedModules.find((m) => m.module.toString() === currentModule._id.toString());
            if (moduleProg) {
                moduleProg.isCompleted = true;
                moduleProg.completedAt = new Date();
            }
            if (moduleIndex + 1 < course.modules.length) {
                nextLecture = course.modules[moduleIndex + 1].lectures[0];
            }
            else {
                // entire course complete
                courseProgress.isCompleted = true;
                courseProgress.completedAt = new Date();
            }
        }
        // 6. Update progress state
        if (nextLecture) {
            courseProgress.prevLecture = courseProgress.currentLecture;
            courseProgress.currentLecture = nextLecture._id;
        }
        // 7. Update overall progress (%)
        const totalLectures = course.modules.reduce((sum, m) => sum + m.lectures.length, 0);
        const watchedLectures = courseProgress.completedModules.reduce((sum, m) => sum + m.lecturesWatched.length, 0);
        courseProgress.overallProgress = Math.round((watchedLectures / totalLectures) * 100);
        yield courseProgress.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return courseProgress;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.nextLecture = nextLecture;
const previousLecture = (progressId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // 1. Load progress
        const courseProgress = yield myClass_model_1.default.findOne({
            id: progressId,
        }).session(session);
        if (!courseProgress)
            throw new Error('Progress not found');
        // 2. Load course with modules + lectures populated
        const course = yield course_model_1.default.findById(courseProgress.course)
            .populate({
            path: 'modules',
            populate: { path: 'lectures' },
        })
            .session(session);
        if (!course)
            throw new Error('Course not found');
        // 3. Find current module and lecture
        let currentModule;
        let lectureIndex = -1;
        for (const module of course.modules) {
            lectureIndex = module.lectures.findIndex((lec) => lec._id.toString() ===
                courseProgress.currentLecture.toString());
            if (lectureIndex !== -1) {
                currentModule = module;
                break;
            }
        }
        if (!currentModule)
            throw new Error('Current lecture not found in course');
        // 4. Decide previous lecture
        let previousLecture = null;
        if (lectureIndex > 0) {
            // case: previous lecture in the same module
            previousLecture = currentModule.lectures[lectureIndex - 1];
        }
        else {
            // case: if it's the first lecture of the module → go to last lecture of previous module
            const moduleIndex = course.modules.findIndex((m) => m._id.toString() === currentModule._id.toString());
            if (moduleIndex > 0) {
                const prevModule = course.modules[moduleIndex - 1];
                previousLecture =
                    prevModule.lectures[prevModule.lectures.length - 1];
            }
        }
        if (!previousLecture) {
            throw new Error('No previous lecture available');
        }
        // 5. Update progress
        courseProgress.prevLecture = courseProgress.currentLecture;
        courseProgress.currentLecture = previousLecture._id;
        yield courseProgress.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return courseProgress;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
// Function to get a single myClass with progress and lecture lock/unlock
const getSingleClassWithProgress = (classId) => __awaiter(void 0, void 0, void 0, function* () {
    const myClass = yield myClass_model_1.default.findOne({ id: classId })
        .populate({
        path: 'course',
        populate: {
            path: 'modules',
            populate: {
                path: 'lectures', // fully populate each lecture
            },
        },
    })
        .lean();
    if (!myClass)
        throw new Error('Class not found');
    const course = myClass.course;
    //@ts-ignore
    if (!(course === null || course === void 0 ? void 0 : course.modules)) {
        return Object.assign(Object.assign({}, myClass), { progress: 0, currentLecture: null, nextLecture: null });
    }
    const completedLectures = new Set((myClass.completedModules || []).flatMap((m) => m.lecturesWatched.map((w) => w.lecture.toString())));
    let totalLectures = 0;
    let completedLecturesCount = 0;
    let unlockedLectureFound = false;
    let currentLecture = null;
    let nextLecture = null;
    let foundCurrent = false;
    //@ts-ignore
    const modulesWithStatus = course.modules.map((module) => {
        let moduleCompletedLectures = 0;
        const lecturesWithStatus = module.lectures.map((lecture) => {
            totalLectures++;
            const isCompleted = completedLectures.has(lecture._id.toString());
            if (isCompleted) {
                completedLecturesCount++;
                moduleCompletedLectures++;
            }
            const isUnlocked = isCompleted || (!unlockedLectureFound && !isCompleted);
            if (!isCompleted && !unlockedLectureFound) {
                unlockedLectureFound = true;
            }
            // Set current and next lecture
            if (!foundCurrent && !isCompleted) {
                currentLecture = lecture; // full populated lecture
                foundCurrent = true;
            }
            else if (foundCurrent && !nextLecture) {
                nextLecture = lecture; // full populated lecture
            }
            return Object.assign(Object.assign({}, lecture), { isCompleted,
                isUnlocked });
        });
        return Object.assign(Object.assign({}, module), { lectures: lecturesWithStatus, isCompleted: moduleCompletedLectures === module.lectures.length });
    });
    const progress = totalLectures > 0
        ? Math.round((completedLecturesCount / totalLectures) * 100)
        : 0;
    return Object.assign(Object.assign({}, myClass), { course: Object.assign(Object.assign({}, course), { modules: modulesWithStatus }), progress,
        currentLecture,
        nextLecture });
});
const MyClassService = {
    getMyClasses,
    nextLecture: exports.nextLecture,
    previousLecture,
    getSingleClassWithProgress,
};
exports.default = MyClassService;
