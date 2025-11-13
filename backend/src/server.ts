import express, { Application } from 'express'

const app: Application = express()
const PORT: number = Number(process.env.PORT) || 3000

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})