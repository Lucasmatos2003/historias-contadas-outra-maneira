-- Migração para suporte a segunda foto no artigo (opcional)
-- Execute no SQL Editor do Supabase se desejar salvar a segunda foto em uma coluna dedicada:

ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS secondary_image TEXT NOT NULL DEFAULT '';
