# Deskly E-commerce API Documentation

## Índice
- [Autenticação](#autenticação)
- [Catálogo](#catálogo)
- [Carrinho](#carrinho)
- [Pedidos](#pedidos)
- [Endereços](#endereços)
- [Perfil do Usuário](#perfil-do-usuário)
- [Produtos (Admin/Backoffice)](#produtos-adminbackoffice)
- [Usuários (Admin/Backoffice)](#usuários-adminbackoffice)

---

## Autenticação

Base URL: `http://localhost:8080`

### Login
**POST** `/auth/login`

**Acesso:** Público

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "usuario@example.com"
}
```

**Comportamento:** Retorna token JWT para autenticação. Armazenar token e enviar em todas as requisições subsequentes via header `Authorization: Bearer {token}`.

---

### Registrar
**POST** `/auth/register`

**Acesso:** Público

**Request:**
```json
{
  "fullname": "João Silva",
  "email": "joao@example.com",
  "cpf": "12345678900",
  "password": "senha123",
  "confirmPassword": "senha123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "joao@example.com"
}
```

**Comportamento:** Cria novo cliente (CUSTOMER) e retorna token JWT automaticamente.

---

## Catálogo

### Listar Produtos
**GET** `/catalog/products`

**Acesso:** Público

**Query Params:**
- `search` (opcional): termo de busca
- `category` (opcional): filtro por categoria
- `page` (opcional): número da página (default: 0)
- `size` (opcional): itens por página (default: 10)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Cadeira Gamer Pro",
    "quantity": 50,
    "price": 1299.90,
    "status": true,
    "description": "Cadeira ergonômica",
    "rating": 4.5,
    "productImage": "data:image/jpeg;base64,...",
    "images": [
      "data:image/jpeg;base64,...",
      "data:image/jpeg;base64,..."
    ]
  }
]
```

**Comportamento:** Retorna apenas produtos ativos. Campo `images` contém todas as imagens, ordenadas (imagem principal primeiro).

---

### Detalhes do Produto
**GET** `/catalog/products/{id}`

**Acesso:** Público

**Response:** Mesmo formato do listar produtos, retornando apenas um produto.

**Comportamento:** Retorna detalhes completos do produto incluindo todas as imagens disponíveis.

---

## Carrinho

**Autenticação:** Obrigatória (CUSTOMER)

### Adicionar ao Carrinho
**POST** `/cart/add`

**Request:**
```json
{
  "productId": 1
}
```

**Response:**
```json
{
  "id": 1,
  "userId": 10,
  "productId": 1,
  "quantity": 2
}
```

**Comportamento:** Se produto já existe no carrinho, incrementa quantidade em 1. Caso contrário, adiciona com quantidade 1.

---

### Ver Carrinho
**GET** `/cart`

**Response:**
```json
[
  {
    "id": 1,
    "userId": 10,
    "productId": 1,
    "quantity": 2
  }
]
```

**Comportamento:** Retorna todos os itens do carrinho do usuário autenticado.

---

### Diminuir Quantidade
**PUT** `/cart/decrease/{productId}`

**Comportamento:** Diminui quantidade em 1. Se quantidade for 1, remove o item do carrinho.

---

### Remover Item
**DELETE** `/cart/{productId}`

**Comportamento:** Remove item completamente do carrinho, independente da quantidade.

---

## Pedidos

**Autenticação:** Obrigatória (CUSTOMER)

### Criar Pedido
**POST** `/orders`

**Request:**
```json
{
  "shippingValue": 15.00,
  "addressId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 3,
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "totalValue": 2614.80,
  "shippingValue": 15.00,
  "address": {
    "id": 1,
    "label": "Casa",
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 45",
    "district": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234567"
  },
  "items": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Cadeira Gamer Pro",
      "quantity": 2,
      "unitPrice": 1299.90,
      "subtotal": 2599.80
    }
  ],
  "createdAt": "2025-12-03T01:30:00"
}
```

**Comportamento:**
- Calcula `totalValue` automaticamente (soma dos produtos + frete)
- Valida se endereço pertence ao cliente
- Valida se produtos existem e salva preço atual no momento do pedido
- Primeira imagem do array é marcada como principal (`main=true`)

**Próxima etapa:** Listar pedidos ou exibir detalhes do pedido criado.

---

### Listar Pedidos
**GET** `/orders`

**Response:** Array de pedidos (mesmo formato do criar), ordenados por data (mais recentes primeiro).

**Comportamento:** Retorna apenas pedidos do cliente autenticado.

---

### Detalhes do Pedido
**GET** `/orders/{id}`

**Response:** Mesmo formato do criar pedido.

**Comportamento:** Valida se pedido pertence ao cliente autenticado antes de retornar.

---

## Endereços

**Autenticação:** Obrigatória (CUSTOMER)

### Listar Endereços
**GET** `/addresses`

**Response:**
```json
[
  {
    "id": 1,
    "label": "Casa",
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 45",
    "district": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234567",
    "deliveryAddress": true
  }
]
```

**Comportamento:** Retorna apenas endereços válidos para entrega (`deliveryAddress=true`).

---

### Criar Endereço
**POST** `/addresses`

**Request:**
```json
{
  "label": "Casa",
  "street": "Rua das Flores",
  "number": "123",
  "complement": "Apto 45",
  "district": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234567",
  "deliveryAddress": true
}
```

**Response:** Mesmo formato do listar endereços.

**Comportamento:** Cria endereço vinculado ao cliente autenticado.

---

### Atualizar Endereço
**PUT** `/addresses/{id}`

**Request:** Mesmo formato do criar endereço.

**Response:** Mesmo formato do listar endereços.

**Comportamento:** Valida se endereço pertence ao cliente antes de atualizar.

---

### Deletar Endereço
**DELETE** `/addresses/{id}`

**Response:** 204 No Content

**Comportamento:** Valida se endereço pertence ao cliente antes de deletar.

---

## Perfil do Usuário

**Autenticação:** Obrigatória

### Meu Perfil
**GET** `/users/profile`

**Response:**
```json
{
  "id": 10,
  "fullname": "João Silva",
  "email": "joao@example.com",
  "cpf": "12345678900",
  "active": true
}
```

**Comportamento:** Retorna dados do usuário autenticado (via token JWT).

---

## Produtos (Admin/Backoffice)

**Autenticação:** Obrigatória (ADMIN ou BACKOFFICE)

### Criar Produto
**POST** `/products`

**Request:**
```json
{
  "name": "Cadeira Gamer Pro",
  "description": "Cadeira ergonômica para gamers profissionais",
  "category": "CHAIRS",
  "price": 1299.90,
  "rating": 4.5,
  "quantity": 50,
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "data:image/jpeg;base64,/9j/4BBRSkZJRg...",
    "data:image/jpeg;base64,/9j/4CCSSkZJRg..."
  ]
}
```

**Response:** 200 OK

**Comportamento:**
- Cria produto e estoque simultaneamente
- Salva múltiplas imagens na tabela `tbl_product_images`
- Primeira imagem do array é marcada como principal
- Produto criado com status `active=true`

**Próxima etapa:** Listar produtos para confirmar criação.

---

### Listar Produtos
**GET** `/products`

**Query Params:**
- `search` (opcional): busca por nome
- `page` (opcional): número da página (default: 0)
- `size` (opcional): itens por página (default: 10)

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Cadeira Gamer Pro",
      "description": "Cadeira ergonômica",
      "category": "CHAIRS",
      "price": 1299.90,
      "rating": 4.5,
      "active": true,
      "quantity": 50,
      "productImage": "data:image/jpeg;base64,...",
      "createdAt": "2025-12-01T10:00:00"
    }
  ],
  "totalPages": 5,
  "totalElements": 50,
  "number": 0,
  "size": 10
}
```

**Comportamento:** Retorna produtos com paginação, ordenados por data de criação (mais recentes primeiro).

---

### Obter Produto
**GET** `/products/{id}`

**Response:** Mesmo formato do item em listar produtos.

---

### Atualizar Produto
**PUT** `/products/{id}`

**Request:** Mesmo formato do criar produto.

**Response:** Mesmo formato do obter produto.

**Comportamento:** Atualiza produto e estoque. Se campo `images` for enviado, sobrescreve imagens existentes.

---

### Ativar/Desativar Produto
**PATCH** `/products/{id}/status`

**Query Params:**
- `active`: true ou false

**Response:** 200 OK

**Comportamento:** Alterna status do produto. Produtos inativos não aparecem no catálogo público.

---

### Deletar Produto
**DELETE** `/products/{id}`

**Response:** 204 No Content

**Comportamento:** Remove produto permanentemente do sistema.

---

## Usuários (Admin/Backoffice)

**Autenticação:** Obrigatória (ADMIN ou BACKOFFICE)

### Criar Usuário
**POST** `/users`

**Request:**
```json
{
  "fullname": "Maria Santos",
  "email": "maria@example.com",
  "cpf": "98765432100",
  "password": "senha123",
  "confirmPassword": "senha123",
  "role": "BACKOFFICE"
}
```

**Response:** 200 OK

**Comportamento:** Cria usuário do tipo ADMIN ou BACKOFFICE (não CUSTOMER). Usuários CUSTOMER devem usar `/auth/register`.

---

### Listar Usuários por Role
**GET** `/users/all/{role}`

**Path Params:**
- `role`: CUSTOMER, ADMIN ou BACKOFFICE

**Response:**
```json
[
  {
    "id": 1,
    "fullname": "Maria Santos",
    "email": "maria@example.com",
    "cpf": "98765432100",
    "role": "BACKOFFICE",
    "active": true
  }
]
```

**Comportamento:** Filtra usuários por role específica.

---

### Obter Usuário
**GET** `/users/{id}`

**Response:** Mesmo formato do listar usuários.

---

### Atualizar Usuário
**PUT** `/users/{id}`

**Request:**
```json
{
  "fullname": "Maria Santos Silva",
  "email": "maria.silva@example.com",
  "cpf": "98765432100"
}
```

**Response:** Mesmo formato do obter usuário.

---

### Ativar/Desativar Usuário
**PATCH** `/users/{id}/status`

**Query Params:**
- `active`: true ou false

**Response:** 200 OK

**Comportamento:** Alterna status do usuário. Usuários inativos não conseguem fazer login.

---

## Categorias de Produtos

Valores válidos para o campo `category`:
- `Monitor`
- `Teclado_Mouse`
- `Headset`
- `Webcam`
- `Cadeira`
- `Mesa`
- `Luminaria_Mesa`
- `Organizador_Mesa`
- `Organizador_Cabos`
- `Suporte_Monitor`
- `Impressora`
- `Itens_Ergonomicos`

---

## Tratamento de Erros

### Formato de Erro Padrão
```json
{
  "timestamp": "2025-12-03T01:52:28.072+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Descrição do erro",
  "path": "/endpoint"
}
```

### Códigos HTTP Comuns
- **200**: Sucesso
- **204**: Sucesso sem conteúdo (DELETE)
- **400**: Requisição inválida
- **401**: Não autenticado (token inválido ou ausente)
- **403**: Sem permissão (role inadequada)
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor

---

## Autenticação JWT

Todas as rotas protegidas requerem o header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

O token contém:
- `subject`: ID do usuário
- `email`: Email do usuário
- `role`: Role do usuário (CUSTOMER, ADMIN, BACKOFFICE)

Token expira após o tempo configurado no backend. Fazer novo login quando receber erro 401.
