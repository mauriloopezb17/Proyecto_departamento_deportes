import React from 'react';

interface PreviewProps {
  data: any;
}

const PreviewNoticia = ({ data }: PreviewProps) => {
  if (!data || !data.blocks || data.blocks.length === 0) {
    return <p className="preview-empty">Escriba algo en el editor para ver la vista previa...</p>;
  }

  return (
    <div className="preview-real-content">
      {data.blocks.map((block: any, index: number) => {
        switch (block.type) {
          case 'header':
            const Tag = `h${block.data.level}` as any;
        
            return <Tag key={index} className="preview-header" dangerouslySetInnerHTML={{ __html: block.data.text }} />;

           case 'checklist':
            return (
                <div key={index} className="preview-checklist">
                {block.data.items.map((item: any, i: number) => (
                    <div key={i} className="preview-checklist-item">
                    <div className="preview-checklist-icon">
                        <i className={item.checked ? "fas fa-check-square" : "far fa-square"} 
                        style={{ color: item.checked ? '#002b5c' : '#ccc' }}></i>
                    </div>
                    <span 
                        className="preview-text" 
                        style={{ 
                        textDecoration: item.checked ? 'line-through' : 'none',
                        color: item.checked ? '#888' : '#333',
                        marginBottom: 0 
                        }}
                        dangerouslySetInnerHTML={{ __html: item.text }} 
                    />
                    </div>
                ))}
                </div>
            );

          case 'paragraph':
        
            return <p key={index} className="preview-text" dangerouslySetInnerHTML={{ __html: block.data.text }} />;

          case 'list':
            const LTag = block.data.style === 'ordered' ? 'ol' : 'ul';

            return (
              <LTag key={index} className="preview-list">
                {block.data.items.map((item: any, i: number) => {
                  const content = typeof item === 'object' ? (item.content || item.text) : item;
                  return (
                    <li key={i}>
                      <span dangerouslySetInnerHTML={{ __html: content }} />
                      {item.items && item.items.length > 0 && (
                        <PreviewNoticia data={{ blocks: [{ type: 'list', data: { style: block.data.style, items: item.items } }] }} />
                      )}
                    </li>
                  );
                })}
              </LTag>
            );

          case 'image':
            return (
              <figure key={index} className="preview-figure">
                <img src={block.data.file.url} alt="Noticia" />
                {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
              </figure>
            );

          case 'table':
            return (
              <div key={index} className="preview-table-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '15px 0' }}>
                  <tbody>
                    {block.data.content.map((row: string[], i: number) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} style={{ padding: '8px', border: '1px solid #ddd' }} dangerouslySetInnerHTML={{ __html: cell }} />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'quote':
            return (
              <blockquote key={index} className="preview-quote">
                <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                {block.data.caption && <cite>— {block.data.caption}</cite>}
              </blockquote>
            );

          case 'delimiter':
            return <hr key={index} style={{ margin: '20px 0', border: '0', borderTop: '2px solid #eee' }} />;

           
          default:
            return null;
        }
      })}
    </div>
  );
};

export default PreviewNoticia;