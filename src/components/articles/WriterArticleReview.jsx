import React from 'react';
import { formatReviewDate } from '../../utils/articleUtils';

export const reviewStatusDetails = {
  pendente_revisao: { label: 'Em revisão', description: 'Seu artigo está na fila para análise da equipe editorial.' },
  pendente_pagamento: { label: 'Aguardando pagamento', description: 'Finalize o pagamento da submissão para que o artigo entre na fila de revisão.' },
  pagamento_erro: { label: 'Erro no pagamento', description: 'Não foi possível gerar a cobrança. Envie o artigo novamente ou tente mais tarde.' },
  aprovado: { label: 'Aprovado', description: 'Seu artigo foi aprovado pela equipe editorial.' },
  rejeitado: { label: 'Rejeitado', description: 'Seu artigo precisa de ajustes antes de ser reenviado.' }
};

export function WriterArticleReview({ article, onEdit }) {
  const details = reviewStatusDetails[article.status] || { label: article.status, description: 'Status atualizado pela equipe editorial.' };

  return (
    <article className="review-item">
      <div className="review-item-content">
        <div className="review-item-heading">
          <span className="tag">{article.category}</span>
          <span className={`review-status status-${article.status}`}>{details.label}</span>
        </div>
        <h4>{article.title}</h4>
        <p>{article.excerpt}</p>
        <div className="review-timeline">
          <span>Enviado em {formatReviewDate(article.created_at)}</span>
          {article.reviewed_at && <span>Revisado em {formatReviewDate(article.reviewed_at)}</span>}
          {article.updated_at && article.updated_at !== article.created_at && (
            <span>Modificado em {formatReviewDate(article.updated_at)}</span>
          )}
        </div>
        <p className="review-description">{details.description}</p>
        {article.status === 'rejeitado' && article.review_note && (
          <div className="review-note">
            <strong>Orientação da equipe:</strong>
            <p>{article.review_note}</p>
          </div>
        )}
        <div className="review-item-footer">
          <div className="review-item-images-preview">
            {article.cover_image && (
              <img src={article.cover_image} alt="Capa" className="review-mini-thumb" title="Foto de capa" />
            )}
            {article.secondary_image && (
              <img src={article.secondary_image} alt="Secundária" className="review-mini-thumb" title="Segunda foto" />
            )}
          </div>
          <button
            type="button"
            className="button button-secondary button-sm writer-edit-btn"
            onClick={() => onEdit?.(article)}
          >
            ✏️ Editar artigo & fotos
          </button>
        </div>
      </div>
    </article>
  );
}
