// ── src/components/Editor/PublishModal.tsx ───────────────────────────────────

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, ImagePlus, Trash2, FileText, Upload, Loader2 } from 'lucide-react';
import '../Editor/CSS/PublishModal.css';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface PublishPayload {
  titulo: string;
  resumen: string;
  imagenUrl: string | null;
}

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Puede ser async: el modal mostrará un spinner mientras espera. */
  onConfirm: (payload: PublishPayload) => void | Promise<void>;
  newsData: any;
}

// ── Constantes ────────────────────────────────────────────────────────────────

const MAX_WORDS = 100;

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

// ── Componente ────────────────────────────────────────────────────────────────

const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  newsData,
}) => {
  const [titulo, setTitulo]             = useState('');
  const [resumen, setResumen]           = useState('');
  const [imagenBase64, setImagenBase64] = useState<string | null>(null);
  const [imagenNombre, setImagenNombre] = useState<string | null>(null);
  const [dragOver, setDragOver]         = useState(false);
  const [error, setError]               = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Reset al abrir + pre-rellena título desde el primer header del editor */
  useEffect(() => {
    if (isOpen) {
      const extractedTitle =
        newsData?.blocks?.find((b: any) => b.type === 'header')?.data?.text ?? '';
      setTitulo(extractedTitle);
      setResumen('');
      setImagenBase64(null);
      setImagenNombre(null);
      setError('');
      setIsPublishing(false);
    }
  }, [isOpen, newsData]);

  /* Cerrar con Escape (solo si no está publicando) */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPublishing) onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose, isPublishing]);

  const wordCount = countWords(resumen);
  const overLimit = wordCount > MAX_WORDS;

  /* ── Manejo de imagen ─────────────────────────────────────────────────── */

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagenBase64(e.target?.result as string);
      setImagenNombre(file.name);
      setError('');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadImage(file);
  };

  /* ── Confirmar ────────────────────────────────────────────────────────── */

  const handleConfirm = async () => {
    if (titulo.trim() === '')  { setError('El título no puede estar vacío.'); return; }
    if (titulo.length > 255)   { setError('El título supera los 255 caracteres.'); return; }
    if (resumen.trim() === '') { setError('El resumen no puede estar vacío.'); return; }
    if (overLimit)             { setError(`El resumen supera el límite de ${MAX_WORDS} palabras.`); return; }

    const payload: PublishPayload = {
      titulo,
      resumen,
      imagenUrl: imagenBase64,
    };

    setIsPublishing(true);
    setError('');

    try {
      await onConfirm(payload);
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Ocurrió un error al publicar. Intenta nuevamente.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pm-overlay" onClick={!isPublishing ? onClose : undefined}>
      <div
        className="pm-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Publicar noticia"
      >
        {/* ── Header ── */}
        <div className="pm-header">
          <div className="pm-header-left">
            <FileText size={18} className="pm-header-icon" />
            <span className="pm-title">Publicar noticia</span>
          </div>
          <button
            className="pm-close"
            onClick={onClose}
            aria-label="Cerrar"
            disabled={isPublishing}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="pm-body">

          {/* 1 ── Imagen de portada */}
          <label className="pm-label">
            Imagen de portada
            <span className="pm-label-hint">Opcional · JPG, PNG, WEBP</span>
          </label>

          {imagenBase64 ? (
            <div className="pm-img-preview">
              <img src={imagenBase64} alt="preview" />
              <div className="pm-img-overlay">
                <span className="pm-img-name">{imagenNombre}</span>
                <button
                  className="pm-img-remove"
                  onClick={() => { setImagenBase64(null); setImagenNombre(null); }}
                  aria-label="Eliminar imagen"
                  disabled={isPublishing}
                >
                  <Trash2 size={15} />
                  Quitar imagen
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`pm-dropzone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !isPublishing && fileInputRef.current?.click()}
            >
              <ImagePlus size={28} className="pm-dz-icon" />
              <p className="pm-dz-text">
                Arrastra una imagen aquí<br />
                <span>o haz clic para seleccionar</span>
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* 2 ── Título */}
          <label className="pm-label" style={{ marginTop: '1.25rem' }}>
            Título
            <span className="pm-label-hint">Máx. 255 caracteres</span>
          </label>
          <div className={`pm-input-wrap ${titulo.length > 255 ? 'over' : ''}`}>
            <input
              className="pm-input"
              type="text"
              placeholder="Título de la noticia…"
              value={titulo}
              maxLength={260}
              disabled={isPublishing}
              onChange={(e) => { setTitulo(e.target.value); if (error) setError(''); }}
            />
            <div
              className={`pm-charcount ${
                titulo.length > 255 ? 'over' : titulo.length > 200 ? 'warn' : ''
              }`}
            >
              {titulo.length} / 255
            </div>
          </div>

          {/* 3 ── Resumen */}
          <label className="pm-label" style={{ marginTop: '1.25rem' }}>
            Resumen
            <span className="pm-label-hint">Aparecerá en la miniatura</span>
          </label>
          <div className={`pm-textarea-wrap ${overLimit ? 'over' : ''}`}>
            <textarea
              className="pm-textarea"
              placeholder="Escribe un resumen breve de la noticia…"
              value={resumen}
              disabled={isPublishing}
              onChange={(e) => { setResumen(e.target.value); if (error) setError(''); }}
              rows={4}
            />
            <div
              className={`pm-wordcount ${
                overLimit ? 'over' : wordCount >= 80 ? 'warn' : ''
              }`}
            >
              {wordCount} / {MAX_WORDS} palabras
            </div>
          </div>

          {error && <p className="pm-error">{error}</p>}
        </div>

        {/* ── Footer ── */}
        <div className="pm-footer">
          <button
            className="pm-btn pm-btn-cancel"
            onClick={onClose}
            disabled={isPublishing}
          >
            Cancelar
          </button>
          <button
            className="pm-btn pm-btn-publish"
            onClick={handleConfirm}
            disabled={overLimit || titulo.length > 255 || isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 size={15} className="spin" />
                Publicando…
              </>
            ) : (
              <>
                <Upload size={15} />
                Publicar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;