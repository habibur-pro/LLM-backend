import crypto from 'crypto'
import { Model, Document } from 'mongoose'

const idGenerator = async <T extends Document>(
    Model: Model<T>
): Promise<string> => {
    const generateId = () => {
        return crypto
            .randomBytes(4)
            .toString('hex')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .slice(0, 8)
    }

    let id = generateId()
    while (await Model.exists({ id })) {
        id = generateId()
    }
    return id
}

export default idGenerator
