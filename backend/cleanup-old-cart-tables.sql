-- Script para limpar tabelas antigas de carrinho após refatoração
-- Execute este script ANTES de reiniciar a aplicação com as novas entidades

-- 1. Deletar tabela antiga de itens do carrinho (FK primeiro)
DROP TABLE IF EXISTS cart_item_dto;

-- 2. Deletar tabela antiga de carrinho
DROP TABLE IF EXISTS cart_dto;

-- 3. Verificar se as tabelas foram deletadas (não deve retornar nada)
SHOW TABLES LIKE 'cart%';

-- NOTA: Após executar este script, reinicie a aplicação.
-- O Hibernate irá criar automaticamente as novas tabelas:
-- - cart (com constraint única em user_id)
-- - cart_item
