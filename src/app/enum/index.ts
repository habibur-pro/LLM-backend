export enum UserRole {
    Student = 'student',
    Admin = 'admin',
    instructor = 'instructor',
}

export enum LectureContentType {
    Video = 'video',
    Pdf = 'pdf',
    Text = 'text',
}

export enum OrderStatus {
    COMPLETE = 'complete',
    PENDING = 'pending',
    PROCESSING = 'processing',
    CANCELED = 'canceled',
}

export enum PaymentStatus {
    COMPLETE = 'complete',
    PENDING = 'pending',
    CANCELED = 'canceled',
    FAILED = 'failed',
}

export enum CourseStatus {
    UPCOMING = 'upcoming',
    DRAFTED = 'drafted',
    PUBLISHED = 'published',
    UNPUBLISHED = 'unPublished',
}
