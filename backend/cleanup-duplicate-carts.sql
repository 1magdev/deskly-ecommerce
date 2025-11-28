-- Script para limpar carrinhos duplicados antes de aplicar a constraint única
-- Execute este script antes de reiniciar a aplicação

-- 1. Visualizar carrinhos duplicados (apenas para verificação)
SELECT user_id, COUNT(*) as total_carrinhos
FROM cart_dto
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 2. Deletar carrinhos duplicados, mantendo apenas o mais recente de cada usuário
DELETE FROM cart_dto
WHERE id NOT IN (
    SELECT MAX(id)
    FROM cart_dto
    GROUP BY user_id
);

-- 3. Verificar se ainda existem duplicatas (deve retornar 0 linhas)
SELECT user_id, COUNT(*) as total_carrinhos
FROM cart_dto
GROUP BY user_id
HAVING COUNT(*) > 1;
