create table if not exists usuario(
id serial PRIMARY KEY,
nome varchar(255) not null,
email varchar(255) not null unique,
senha varchar(255) not null
);

create table if not exists barbeiro(
id serial PRIMARY KEY,
nome varchar(255) not null,
cpf varchar(255) not null unique,
telefone varchar(255) not null unique
);

create table if not exists cliente(
id serial primary key,
nome varchar(255) not null,
cpf varchar(255) not null unique,
telefone varchar(255) not null unique
);

create table if not exists servico(
id SERIAL PRIMARY KEY,
nome VARCHAR(255),
preco INT
);

insert into servico (nome, preco) VALUES
('corte', 50),
('barba', 40),
('relaxamento', 100),
('pintura', 75);

create table if not exists agendamento(
id serial PRIMARY KEY,
id_servico INT,
data_agendamento date not null,
id_barbeiro INT,
id_cliente INT,

foreign key (id_servico) references servico(id),
foreign key (id_barbeiro) references barbeiro(id),
foreign key (id_barbeiro) references cliente(id)
);