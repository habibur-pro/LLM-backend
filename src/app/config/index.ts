import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env') })
const config = {
    env: 'development',
    port: process.env.PORT,
    db_uri: process.env.DB_URI,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET as string,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET as string,
    mailer_name: process.env.MAILER_NAME as string,
    mailer_pass: process.env.MAILER_PASS as string,
    access_token_expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    cloudinary_cloud: process.env.CLOUDINARY_CLOUD,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,

    // payment
    ssl_store_id: process.env.SSL_STORE_ID,
    ssl_store_pass: process.env.SSL_STORE_PASS,
    is_payment_live: process.env.IS_PAYMENT_LIVE,
    frontend_url: process.env.FRONTEND_URL,
}

export default config
