import { API_BASE } from "../utils/api";

const BASE = `${API_BASE}/api/noticias`;

export interface Categoria {
  id_categoria_noticia: number;
  nombre: string;
}

export interface SaveDraftDTO {
  titulo: string;
  contenido: object;
  id_categoria_noticia: number;
}

export interface PublishDTO {
  titulo: string;
  contenido: object;
  id_categoria_noticia: number;
  resumen: string;
  imagenUrl: string | null;
}

export interface CreateNoticiaResponse {
  message:    string;
  id_noticia: number;
  contenido?: any; // JSON de EditorJS con URLs de OCI
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("ucb_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function handleRes<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error ?? `Error HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getCategorias(): Promise<Categoria[]> {
  const res = await fetch(`${BASE}/categorias`);
  return handleRes<Categoria[]>(res);
}

/**
 * Sube imagen del EDITOR a carpeta temp del servidor.
 * No va a OCI todavía — se sube al guardar o publicar.
 */
export async function uploadImagen(file: File): Promise<string> {
  const token = localStorage.getItem("ucb_token");
  const formData = new FormData();
  formData.append("imagen", file);

  const res = await fetch(`${API_BASE}/api/upload/temp`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await handleRes<{ url: string }>(res);
  return `${API_BASE}${data.url}`;
}

/**
 * Sube imagen de PORTADA directamente a OCI.
 * Se llama desde el PublishModal.
 */
export async function uploadImagenPortada(file: File): Promise<string> {
  const token = localStorage.getItem("ucb_token");
  const formData = new FormData();
  formData.append("imagen", file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await handleRes<{ url: string }>(res);
  return data.url;
}

/** POST /api/noticias — crea borrador */
export async function createDraft(dto: SaveDraftDTO): Promise<CreateNoticiaResponse> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      titulo:               dto.titulo,
      contenido:            dto.contenido,
      id_categoria_noticia: dto.id_categoria_noticia,
      publicado:            false,
    }),
  });
  return handleRes<CreateNoticiaResponse>(res);
}

/** PUT /api/noticias/:id — actualiza borrador */
export async function updateDraft(
  id: number,
  dto: SaveDraftDTO,
): Promise<{ message: string; contenido: any }> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      titulo:               dto.titulo,
      contenido:            dto.contenido,
      id_categoria_noticia: dto.id_categoria_noticia,
    }),
  });
  return handleRes<{ message: string; contenido: any }>(res);
}

/**
 * Guarda el borrador. Devuelve { id, contenido } donde:
 * - id       = id_noticia en la BD
 * - contenido = JSON de EditorJS con URLs de OCI (temps ya subidos)
 */
export async function saveNoticia(
  dto: SaveDraftDTO,
  id?: number | null,
): Promise<{ id: number; contenido: any }> {
  if (id) {
    // response.contenido = JSON EditorJS con URLs OCI (viene directo del service)
    const response = await updateDraft(id, dto);
    return { id, contenido: response.contenido };
  }
  const response = await createDraft(dto);
  // response.contenido = JSON EditorJS con URLs OCI
  return { id: response.id_noticia, contenido: response.contenido };
}

/** PUT /api/noticias/:id — publica la noticia */
export async function publishNoticia(id: number, dto: PublishDTO): Promise<void> {
  const imagenes = dto.imagenUrl
    ? [{ url_storage: dto.imagenUrl, es_portada: true }]
    : [];

  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      titulo:               dto.titulo,
      contenido:            dto.contenido,
      id_categoria_noticia: dto.id_categoria_noticia,
      resumen:              dto.resumen,
      publicado:            true,
      imagenes,
    }),
  });
  await handleRes<unknown>(res);
}

/** GET /api/noticias — obtiene todas las noticias */
export async function getNoticias(publicado?: boolean): Promise<any[]> {
  const url = publicado !== undefined ? `${BASE}?publicado=${publicado}` : BASE;
  const res = await fetch(url);
  return handleRes<any[]>(res);
}

/** GET /api/noticias/:id — obtiene una noticia específica */
export async function getNoticia(id: number): Promise<any> {
  const res = await fetch(`${BASE}/${id}`);
  return handleRes<any>(res);
}

/** DELETE /api/noticias/:id — elimina una noticia */
export async function deleteNoticia(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await handleRes<unknown>(res);
}

/** GET /api/noticias/usuario/:id_usuario — obtiene noticias de un usuario */
export async function getNoticiasByUsuario(id_usuario: number): Promise<any[]> {
  const res = await fetch(`${BASE}/usuario/${id_usuario}`, {
    headers: authHeaders(),
  });
  return handleRes<any[]>(res);
}