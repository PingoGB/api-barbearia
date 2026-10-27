import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import pool from './db.js'
import bcrypt from 'bcrypt'

const app = express()
const PORT = 3000

app.use (express.json())
app.use (cors())
app.use (express.static('public'))



app.listen(PORT, ()=>{
    console.log(`Servidor rodando na porta: ${PORT}`)
})