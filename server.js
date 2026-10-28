import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import pool from './db.js'
import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'

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

        const token = jwt.sign(
            {id: user.id},
            JWT_SECRET,
            {expiresIn: "1h"},
        )
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, //pra testar localmente
            sameSite: "lax",
            maxAge: 3600000
        })

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
        const telefoneHash = await bcrypt.hash(telefone, SALT)
        const putCliente = await pool.query("UPDATE cliente SET nome = $1, telefone = $2 WHERE id = $3 RETURNING *", [nome, telefoneHash, id])
        return res.status(200).json(putCliente.rows[0])
    } catch(err){
        return res.status(400).json("Erro ao atualizar cliente.")
    }
})

app.delete('/cliente/:id', async (req, res) =>{
    const {id} = req.params;
    try{
        const deleteCliente = await pool.query("DELETE FROM cliente WHERE id = $1 RETURNING *", [id])
        return req.status(200).json("Usuário deletado com sucesso")
    } catch(err){
        return res.status(400).json("Erro ao deletar cliente")
    }
})

app.post('/agendamento', async (req, res) =>{
    const {id_servico, data_agendamento, id_barbeiro, id_cliente} = req.body
    try{
        const agendar = await pool.query("INSERT INTO agendamento (id_servico, data_agendamento, id_barbeiro, id_cliente) VALUES ($1, $2, $3, $4) RETURNING *", [id_servico, data_agendamento, id_barbeiro, id_cliente])
        return res.status(201).json(agendar.rows[0])
    } catch(err){
        return res.status(400).json("Erro ao agendar")
    }
})

app.get('/agendamento', async (req, res) =>{
    const ordenar = await pool.query(` SELECT
        agendamento.id,
        TO_CHAR(agendamento.data_agendamento, 'YYYY-MM-DD') AS data_agendamento,
        agendamento.id_servico,
        servico.nome AS servico,
        servico.preco,
        agendamento.id_cliente,
        cliente.nome AS id_cliente,
        agendamento.id_barbeiro,
        barbeiro.nome AS barbeiro
    FROM agendamento
    JOIN servico ON servico.id = agendamento.id_servico
    JOIN cliente ON cliente.id = agendamento.id_cliente
    JOIN barbeiro on barbeiro.id = agendamento.id_barbeiro
    ORDER BY agendamento.data_agendamento`)
    res.status(201).json(ordenar.rows)
})

app.put('/agendamento/:id', async (req, res) =>{
    const {id_servico, data_agendamento, id_barbeiro, id_cliente} = req.body
    const {id} = req.params;
    try{
        const putAgendamento = await pool.query("UPDATE agendamento SET id_servico = $1, data_agendamento = $2, id_barbeiro = $3, id_cliente = $4 WHERE id = $5 RETURNING *", [id_servico, data_agendamento, id_barbeiro, id_cliente, id])
        return res.status(200).json(putAgendamento.rows[0])
    } catch(err){
        return res.status(400).json("Erro ao atualizar agendamento")
    }
})

app.delete('/agendamento/:id', async (req, res) =>{
    const {id} = req.params
    try{
        const deleteAgendamento = await pool.query("DELETE FROM agendamento WHERE id = $1 RETURNING *", [id])
        return res.status(200).json("Agendamento excluído com sucesso")
    } catch(err){
        return resstatus(400).json("Erro ao excluir agendamento")
    }
})

app.listen(PORT, ()=>{
    console.log(`Servidor rodando na porta: ${PORT}`)
})