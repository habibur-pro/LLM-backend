import app from './app'
import config from './config'
import mongoose from 'mongoose'

async function main() {
    try {
        await mongoose.connect(config.db_uri as string)
        app.listen(config.port, () =>
            console.log('application is running on', config.port)
        )
    } catch (error) {
        console.error('failed to connect', error)
    }
}

main()
