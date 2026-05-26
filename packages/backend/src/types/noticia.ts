export interface NoticiaImage {
  url_storage: string;
  es_portada: boolean;
}
//noticia.ts
export interface NoticiaData {
  id_usuario_autor: number;
  id_categoria_noticia: number;
  titulo: string;
  contenido: any;
  resumen?: string;
  publicado: boolean;
  imagenes?: NoticiaImage[];
}

export interface NoticiaResponse extends NoticiaData {
  id_noticia: number;
  categoria_nombre: string;
  autor_nombre: string;
  autor_apellido: string;
  fecha_creacion: Date;
  fecha_publicacion: Date | null;
  imagen_portada?: string | null;
}
