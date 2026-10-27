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

app.post('/register', async (req, res) =>{
    try{
    const {nome, email, senha} = req.body
    const salt = await bcrypt.genSalt(10)
    const hashedSenha = await bcrypt.hash(senha, salt)
    const register = await pool.query("INSERT INTO usuario (nome, email, senha) VALUES ($1, $2, $3) RETURNING *", [nome, email, hashedSenha])
    return res.status(201).json(register.rows[0])
    } catch(err){
        return res.status(400).json({erro: "Erro ao criar usuário."})
    }
})
app.post('/login', async (req, res) =>{
    try{
        const {email, senha} = req.body;
        const login = await pool.query("SELECT * FROM usuario WHERE email = $1", [email])

        if (login.rows.lenght === 0){
            return res.status(404).json({erro: "Credenciais inválidas."})
        }

        const user = login.rows[0]

        if (user.email !==email){
            return res.status(404).json({erro: "Credenciais inválidas"})
        }

        const isSenhaValid = await bcrypt.compare(senha, user.senha)
        if (!isSenhaValid){
            return res.status(404).json({erro: "Credenciais inválidas."})
        }

        return res.status(200).json({
            mensagem: "login realizado",
            usuario: {
                "nome": user.nome
            }
        })
    } catch(err){
        return res.status(400).json({erro: "Erro ao faer login."})
    }
})



app.listen(PORT, ()=>{
    console.log(`Servidor rodando na porta: ${PORT}`)
})