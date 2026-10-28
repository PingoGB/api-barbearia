import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import pool from './db.js'
import bcrypt from 'bcrypt'

const app = express()
const PORT = 3000
const SALT = await bcrypt.genSalt(10)
app.use (express.json())
app.use(cookieParser())
app.use (cors())
app.use (express.static('public'))
const JWT_SECRET = '6845gfhdify348fh'

function autenticarToken (req, res, next){
    const token = req.cookies.token
    if(!token){
        return res.status(401).json({error: "Acesso nigado."})
    }
    try{
        const usuarioJWT = jwt.verify(token, JWT_SECRET)
        req.usuarioJWT = usuarioJWT;
        next()
    } catch(err){
        return res.status(403).json("Erro ao formatar token.")
    }
}

app.post('/register', async (req, res) =>{
    try{
    const {nome, email, senha} = req.body
    const hashedSenha = await bcrypt.hash(senha, SALT)
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

app.post('/barbeiro', async (req, res) =>{
    const {nome, cpf, telefone} = req.body;
    try{
        const hashedCpf = await bcrypt.hash(cpf, SALT)
        const hashedTelefone = await bcrypt.hash(telefone, SALT)
        const register = await pool.query("INSERT INTO barbeiro (nome, cpf, telefone) VALUES ($1, $2, $3) RETURNING *", [nome, hashedCpf, hashedTelefone])
        return res.status(201).json(register.rows[0])
    } catch(err){
        return res.status(400).json({erro: "Erro ao cadastrar barbeiro."})
    }
})

app.get('/barbeiro', async (req, res) =>{
    try{
        const get = await pool.query("SELECT * FROM barbeiro")
        return res.status(200).json(get.rows)
    } catch(err){
        return res.status(400).json("Erro ao listar barbeiros")
    }
})

app.put('/barbeiro/:id', async (req, res) =>{
    const {id} = req.params;
    const {nome, telefone} = req.body;
    try{
        const telefoneHash = await bcrypt.hash(telefone, SALT)
        const put = await pool.query("UPDATE barbeiro SET nome = $1, telefone = $2 WHERE id = $3 RETURNING *", [nome, telefoneHash, id])
        return res.status(200).json(put.rows[0])
    }catch(err){
        return res.status(400).json("Erro ao atualizar barbeiro")
    }
})

app.delete('/barbeiro/:id', async (req, res) =>{
    const {id} = req.params;
    try{
        const deletar = await pool.query("DELETE FROM barbeiro WHERE id = $1 RETURNING *", [id])
        return res.status(200).json("Barbeiro deletado com sucesso.")
    } catch(err){
        return res.status(400).json("Erro ao deletar barbeiro")
    }
})


app.get('/cliente', async (req, res) =>{
    try{
        const get = await pool.query("SELECT * FROM cliente")
        return res.status(200).json(get.rows)
    } catch(err){
        return res.status(400).json("Erro ao consultar clientes.")
    }
})

app.post('/cliente', async (req, res) =>{
    const {nome, cpf, telefone} = req.body
    try{
        const cpfHash = await bcrypt.hash(cpf, SALT)
        const telefoneHash = await bcrypt.hash(telefone, SALT)
        const postCliente = await pool.query("INSERT INTO cliente (nome, cpf, telefone) VALUES ($1, $2, $3) RETURNING *", [nome, cpfHash, telefoneHash])
        return res.status(201).json(postCliente.rows[0])
    } catch(err){
        return res.status(400).json("Erro ao cadastrar cliente.")
    }
})

app.put('/cliente/:id', async (req, res) =>{
    const {nome, telefone} = req.body;
    const {id} = req.params;
    try{
        
    } catch(err){
        return res.status(400).json("Erro ao atualizar cliente.")
    }
})

app.listen(PORT, ()=>{
    console.log(`Servidor rodando na porta: ${PORT}`)
})