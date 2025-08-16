import { Document, Model, Schema, model } from 'mongoose'
import { TSkill } from '../interface/skill.inteface'
import idGenerator from '../helpers/idGenerator'

const SkillSchema = new Schema<TSkill>(
    {
        id: {
            type: String,
            required: [true, 'id is required'],
        },
        name: {
            type: String,
            unique: true,
            required: [true, 'name is required'],
        },
        progress: {
            type: Number,
            required: [true, 'progress is required'],
        },
        priority: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
)
SkillSchema.pre<TSkill>('validate', async function (next) {
    if (!this.id) {
        this.id = await idGenerator(
            this.constructor as Model<Document & TSkill>
        )
    }
    next()
})
const Skill = model<TSkill>('skill', SkillSchema)
export default Skill
