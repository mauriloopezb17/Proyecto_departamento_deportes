import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
// @ts-ignore
import ColorPlugin from 'editorjs-text-color-plugin';

import {
  Trash2, Undo2, Redo2,
  Bold, Italic, Strikethrough, Underline as UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Minus, Plus, HelpCircle
} from 'lucide-react';

// @ts-ignore
import ImageTool from '@editorjs/image';
// @ts-ignore
import Underline from '@editorjs/underline';
// @ts-ignore
import Quote from '@editorjs/quote';
// @ts-ignore
import Table from '@editorjs/table';
// @ts-ignore
import Delimiter from '@editorjs/delimiter';
// @ts-ignore

import '../Editor/CSS/EditorNoticias.css';
import ModalAyuda from './ModalAyuda';
import PreviewNoticia from './PreviewNoticia';

interface EditorProps {
  onDataChange: (data: any) => void;
  
  onPublish: () => void;
  isShowingPreview: boolean;
  newsData: any;
}

const EditorNoticias = ({
  onDataChange,
  isShowingPreview,
  newsData,
}: EditorProps) => {
  const ejInstance = useRef<EditorJS | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);

  const [previewData, setPreviewData] = useState<any>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [fontSize, setFontSize] = useState<number>(16);

  // ==========================================
  // EFECTO 1: INICIALIZACIÓN DE EDITORJS
  // ==========================================
  useEffect(() => {
    const initEditor = () => {
      if (!ejInstance.current && editorRef.current) {
        const editor = new EditorJS({
          holder: editorRef.current,
          placeholder: 'Haga clic aquí para empezar a escribir su noticia...',
          i18n: {
            messages: {
              ui: {
                blockTunes: {
                  toggler: {
                    'Click to tune': 'Haga clic para ajustar',
                    'or drag to move': 'o arrastre para mover',
                  },
                },
                
                inlineToolbar: {
                  converter: { 'Convert to': 'Convertir a' },
                },
                
                toolbar: {
                  toolbox: {
                    Add: 'Agregar',
                    Filter: 'Buscar herramienta...',
                  },
                },
              },
              blockTunes: {
                delete: {
                  'Delete': 'Eliminar',
                  'Click to delete': 'Clic para confirmar',
                },
                moveUp: {
                  'Move up': 'Mover arriba',
                },
                moveDown: {
                  'Move down': 'Mover abajo',
                },
              },
              toolNames: {
                Text: 'Texto',
                Heading: 'Título / Encabezado',
                'Unordered List': 'Lista de viñetas',
                'Ordered List': 'Lista numerada',
                Checklist: 'Lista de tareas',
                Quote: 'Cita',
                Table: 'Tabla',
                Image: 'Imagen',
                Delimiter: 'Línea divisoria',
              },
            },
          },
          tools: {
            header: { class: Header as any, inlineToolbar: true },
            list: { class: List, inlineToolbar: true },
            underline: Underline,
            quote: { class: Quote, inlineToolbar: true },
            color: {
              class: ColorPlugin,
              config: {
                config: {  
                  colorCollections: ['#013F62', '#FFF1B5', '#FF0000', '#000000'],
                  defaultColor: '#013F62',
                  type: 'text',
                },
              },
            },
             marker: {
              class: ColorPlugin,
              config: {
                defaultColor: '#FFF1B5',
                type: 'marker',
                icon: '<svg>...</svg>',
              },
            },
            table: { class: Table as any, inlineToolbar: true },
            delimiter: Delimiter,
            image: {
            class: ImageTool,
            
            config: {
              uploader: {
                uploadByFile(file: File) {
                  return new Promise((resolve, reject) => {
                    // Validación de tipo y tamaño (max 5MB)
                    if (!file.type.startsWith('image/')) {
                      reject(new Error('Solo se permiten imágenes'));
                      return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      reject(new Error('La imagen no puede superar 5MB'));
                      return;
                    }

                    const reader = new FileReader();
                    reader.onload = (e) => {
                      resolve({
                        success: 1,
                        file: { url: e.target?.result as string },
                      });
                    };
                    reader.onerror = () => reject(new Error('Error al leer el archivo'));
                    reader.readAsDataURL(file);
                  });
                },
                uploadByUrl(url: string) {
                  return Promise.resolve({ success: 1, file: { url } });
                },
              },
            },
          },
          },
          onChange: async () => {
            setTimeout(async () => {
              try {
                const data = await ejInstance.current?.save();
                if (data) {
                  setPreviewData(data);
                  onDataChange(data);
                }
              } catch (e) {
                console.error('Error saving', e);
              }
            }, 150);
          },
        });

        ejInstance.current = editor;
      }
    };

    initEditor();

    return () => {
      if (ejInstance.current && typeof ejInstance.current.destroy === 'function') {
        ejInstance.current.isReady
          .then(() => {
            ejInstance.current?.destroy();
            ejInstance.current = null;
          })
          .catch((e) => console.error('Error al destruir EditorJS:', e));
      }
    };
  }, []);

  // ==========================================
  // EFECTO 2: RESIZER
  // ==========================================
  useEffect(() => {
    const leftSide = document.querySelector('.editor-panel') as HTMLElement;
    const rightSide = document.querySelector('.inline-preview') as HTMLElement;
    const resizer = document.getElementById('dragMe');

    if (!isShowingPreview) {
      if (leftSide) {
        leftSide.style.removeProperty('flex');
        leftSide.style.removeProperty('width');
      }
      return;
    }

    if (!resizer || !leftSide || !rightSide) return;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidthRight = rightSide.getBoundingClientRect().width;
      const containerWidth = window.innerWidth;

      leftSide.style.transition = 'none';
      rightSide.style.transition = 'none';

      const onMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const newWidthPx = startWidthRight - dx;
        const newWidthPercent = (newWidthPx / containerWidth) * 100;

        if (newWidthPercent >= 15 && newWidthPercent <= 45) {
          rightSide.style.width = `${newWidthPercent}%`;
          leftSide.style.flex = `0 0 ${100 - newWidthPercent}%`;
        }
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.removeProperty('cursor');
        leftSide.style.transition = 'flex 0.4s ease';
        rightSide.style.transition = 'width 0.4s ease';
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'col-resize';
    };

    resizer.addEventListener('mousedown', onMouseDown);
    return () => resizer.removeEventListener('mousedown', onMouseDown);
  }, [isShowingPreview]);

  // Saves the last selection that was inside the editor so toolbar buttons
  // can restore it before running execCommand (clicking toolbar clears selection).
  useEffect(() => {
    const saveEditorSelection = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
        savedRange.current = sel.getRangeAt(0).cloneRange();
      }
    };
    document.addEventListener('selectionchange', saveEditorSelection);
    return () => document.removeEventListener('selectionchange', saveEditorSelection);
  }, []);

  // ==========================================
  // HELPERS DE FORMATO
  // ==========================================

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
  };

  const handleClearAll = () => {
    if (window.confirm('¿Borrar todo el contenido del editor?')) {
      ejInstance.current?.blocks.clear();
    }
  };

  const handleFontFamily = (family: string) => {
    restoreSelection();
    exec('fontName', family);
  };

  const handleFontSize = (px: number) => {
    setFontSize(px);
    restoreSelection();
    exec('fontSize', '7');
    const fontElements = document.querySelectorAll('font[size="7"]');
    fontElements.forEach((el) => {
      (el as HTMLElement).removeAttribute('size');
      (el as HTMLElement).style.fontSize = `${px}px`;
    });
  };


  // ==========================================
  //  Estructura de la seccion
  // ==========================================
  return (
    <div className="editor-layout">

      {/* ── TOOLBAR ── */}
      <div className="ribbon-toolbar">

        {/* GRUPO: Archivo */}
        <div className="ribbon-group">
          <span className="ribbon-group-label">Archivo</span>
          <div className="ribbon-buttons">
            <button className="ribbon-btn btn-delete" onClick={handleClearAll} title="Borrar todo">
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* GRUPO: Historial */}
        <div className="ribbon-group">
          <span className="ribbon-group-label">Historial</span>
          <div className="ribbon-buttons">
            <button className="ribbon-btn" title="Deshacer" onClick={() => exec('undo')}>
              <Undo2 size={15} />
            </button>
            <button className="ribbon-btn" title="Rehacer" onClick={() => exec('redo')}>
              <Redo2 size={15} />
            </button>
          </div>
        </div>

        {/* GRUPO: Fuente */}
        <div className="ribbon-group">
          <span className="ribbon-group-label">Fuente</span>
          <div className="ribbon-buttons">
            <button className="ribbon-btn bold"      title="Negrita"    onClick={() => exec('bold')}>
              <Bold size={15} />
            </button>
            <button className="ribbon-btn italic"    title="Cursiva"    onClick={() => exec('italic')}>
              <Italic size={15} />
            </button>
            <button className="ribbon-btn underline" title="Subrayado"  onClick={() => exec('underline')}>
              <UnderlineIcon size={15} />
            </button>
            <button className="ribbon-btn strike"    title="Tachado"    onClick={() => exec('strikeThrough')}>
              <Strikethrough size={15} />
            </button>
          </div>
        </div>

        {/* GRUPO: Alineación */}
        <div className="ribbon-group">
          <span className="ribbon-group-label">Alineación</span>
          <div className="ribbon-buttons">
            <button className="ribbon-btn" title="Izquierda" onClick={() => exec('justifyLeft')}>
              <AlignLeft size={15} />
            </button>
            <button className="ribbon-btn" title="Centrado"  onClick={() => exec('justifyCenter')}>
              <AlignCenter size={15} />
            </button>
            <button className="ribbon-btn" title="Derecha"   onClick={() => exec('justifyRight')}>
              <AlignRight size={15} />
            </button>
            <button className="ribbon-btn" title="Justificado" onClick={() => exec('justifyFull')}>
              <AlignJustify size={15} />
            </button>
          </div>
        </div>

        {/* GRUPO: Color de texto y resaltado */}
        <div className="ribbon-group">
          <span className="ribbon-group-label">Color/Resaltado</span>
          <div className="ribbon-buttons">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <input
                type="color"
                className="ribbon-color-input"
                title="Color de texto"
                onChange={(e) => exec('foreColor', e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <input
                type="color"
                className="ribbon-color-input"
                defaultValue="#FFF1B5"
                title="Color de resaltado"
                onChange={(e) => exec('hiliteColor', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* GRUPO: Formato y familia */}
        <div className="ribbon-group">
          <span className="ribbon-group-label">Formato y Fuente</span>
          <div className="ribbon-buttons">

            {/* Familia tipográfica */}
            <select
              className="ribbon-select"
              defaultValue="Arial"
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => handleFontFamily(e.target.value)}
              title="Familia tipográfica"
            >
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Trebuchet MS">Trebuchet</option>
            </select>
          </div>
        </div>

        {/* GRUPO: Tamaño de fuente */}
        <div className="ribbon-group">
          <span className="ribbon-group-label">Tamaño</span>
          <div className="ribbon-buttons">
            <button
              className="ribbon-btn"
              title="Disminuir tamaño"
              onClick={() => handleFontSize(Math.max(8, fontSize - 2))}
            >
              <Minus size={12} />
            </button>
            <input
              type="number"
              className="ribbon-input-number"
              value={fontSize}
              min={8}
              max={96}
              title="Tamaño en px"
              onChange={(e) => handleFontSize(Number(e.target.value))}
            />
            <button
              className="ribbon-btn"
              title="Aumentar tamaño"
              onClick={() => handleFontSize(Math.min(96, fontSize + 2))}
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* GRUPO: Ayuda */}
        <div className="ribbon-group" style={{ borderRight: 'none' }}>
          <span className="ribbon-group-label">Ayuda</span>
          <div className="ribbon-buttons">
            <button
              className="ribbon-btn"
              title="¿Cómo usar el editor?"
              onClick={() => setShowHelp(true)}
            >
              <HelpCircle size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── WORKSPACE ── */}
      <div className="workspace">
        <div className={`editor-panel ${isShowingPreview ? 'with-preview' : 'full-width'}`}>
          <div className="paper-container">
            <div className="editor-content-area">
              <div ref={editorRef} />
            </div>
            <div style={{ height: '50px' }} />
          </div>
        </div>

        {isShowingPreview && (
          <>
            <div className="resizer" id="dragMe" />
            <aside className="inline-preview">
              <div className="inline-preview-content">
                <span className="preview-badge">VISTA RÁPIDA</span>
                <PreviewNoticia data={newsData} />
              </div>
            </aside>
          </>
        )}
      </div>

      <ModalAyuda isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
};

export default EditorNoticias;


