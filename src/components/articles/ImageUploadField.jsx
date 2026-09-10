import React, { useState, useRef } from 'react';
import { processImageFile } from '../../utils/imageUtils';

export function ImageUploadField({ label, hint, value, onChange, secondary = false, id = 'img-input' }) {
  const [mode, setMode] = useState(value && !value.startsWith('data:') ? 'url' : 'file');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    setError('');
    try {
      const optimized = await processImageFile(file);
      onChange(optimized);
    } catch (err) {
      setError(err.message || 'Erro ao processar imagem.');
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    onChange('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="image-upload-container">
      <div className="image-upload-header">
        <label className="image-upload-label" htmlFor={mode === 'url' ? `${id}-url` : id}>
          {label}
          {secondary && <span className="optional-badge">Opcional</span>}
        </label>
        <div className="image-upload-mode-toggle">
          <button
            type="button"
            className={`mode-btn ${mode === 'file' ? 'active' : ''}`}
            onClick={() => setMode('file')}
          >
            Upload do aparelho
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'url' ? 'active' : ''}`}
            onClick={() => setMode('url')}
          >
            Link URL
          </button>
        </div>
      </div>

      {mode === 'file' ? (
        <div className="file-upload-dropzone">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            id={id}
            className="file-input-hidden"
          />
          {!value ? (
            <label htmlFor={id} className="dropzone-trigger">
              <span className="dropzone-icon">📷</span>
              <strong>{processing ? 'Processando e otimizando imagem...' : 'Clique para selecionar foto do seu dispositivo'}</strong>
              <span className="dropzone-hint">Formatos JPG, PNG ou WebP (compressão automática de alta qualidade)</span>
            </label>
          ) : (
            <div className="image-preview-card">
              <img src={value} alt="Prévia da foto" className="image-preview-thumb" />
              <div className="image-preview-info">
                <span className="image-preview-tag">✓ Foto carregada com sucesso</span>
                <div className="image-preview-actions">
                  <label htmlFor={id} className="button button-secondary button-sm">
                    {processing ? 'Processando...' : 'Trocar foto'}
                  </label>
                  <button type="button" className="button button-danger-ghost button-sm" onClick={handleClear}>
                    Remover foto
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="url-input-block">
          <input
            id={`${id}-url`}
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            className="url-input-field"
          />
          {value && (
            <div className="image-preview-card">
              <img
                src={value}
                alt="Prévia via URL"
                className="image-preview-thumb"
                onError={() => setError('Não foi possível carregar a imagem deste endereço URL.')}
              />
              <div className="image-preview-info">
                <span className="image-preview-tag">Prévia via URL</span>
                <button type="button" className="button button-danger-ghost button-sm" onClick={handleClear}>
                  Limpar URL
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="image-upload-error">{error}</p>}
      {hint && !error && <span className="field-hint">{hint}</span>}
    </div>
  );
}
