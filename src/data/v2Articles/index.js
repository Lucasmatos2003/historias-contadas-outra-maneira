import { article1 } from './article1_internet.js';
import { article2 } from './article2_capital_rio.js';
import { article3 } from './article3_pangeia.js';
import { article4 } from './article4_ano_3026.js';
import { article5 } from './article5_dinossauros.js';
import { article6 } from './article6_tempo_fantasma.js';
import { article7 } from './article7_lua_vermelha.js';
import { article8 } from './article8_asteca_aco.js';
import { article9 } from './article9_coroa_sombria.js';
import { article10 } from './article10_rede_vermelha.js';
import { article11 } from './article11_roma_maquina.js';
import { article12 } from './article12_sol_aco_incas.js';
import { article13 } from './article13_republica_estilhacada.js';
import { article14 } from './article14_astecas_obsidiana.js';
import { article15 } from './article15_alexandria.js';
import { article16 } from './article16_luso_brasileiro.js';

export const allV2Articles = [
  article1,
  article2,
  article3,
  article4,
  article5,
  article6,
  article7,
  article8,
  article9,
  article10,
  article11,
  article12,
  article13,
  article14,
  article15,
  article16
];

export const v2ArticlesById = {};
export const v2ArticlesBySlug = {};

for (const art of allV2Articles) {
  v2ArticlesById[art.id] = art;
  v2ArticlesBySlug[art.slugBase] = art;
}

export function getV2Article(id, slugBase) {
  if (id && v2ArticlesById[id]) return v2ArticlesById[id];
  if (slugBase && v2ArticlesBySlug[slugBase]) return v2ArticlesBySlug[slugBase];
  return null;
}
