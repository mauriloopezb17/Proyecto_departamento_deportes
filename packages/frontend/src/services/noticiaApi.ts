
const BASE = "/api/noticias";

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
  message: string;
  id_noticia: number;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
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


export async function createDraft(dto: SaveDraftDTO): Promise<CreateNoticiaResponse> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      titulo: dto.titulo,
      contenido: dto.contenido,
      id_categoria_noticia: dto.id_categoria_noticia,
      publicado: false,
    }),
  });
  return handleRes<CreateNoticiaResponse>(res);
}


export async function updateDraft(id: number, dto: SaveDraftDTO): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      titulo: dto.titulo,
      contenido: dto.contenido,
      id_categoria_noticia: dto.id_categoria_noticia,
    }),
  });
  await handleRes<unknown>(res);
}

export async function saveNoticia(
  dto: SaveDraftDTO,
  id?: number | null,
): Promise<number> {
  if (id) {
    await updateDraft(id, dto);
    return id;
  }
  const response = await createDraft(dto);
  return response.id_noticia;
}


export async function publishNoticia(id: number, dto: PublishDTO): Promise<void> {

  const imagenes = dto.imagenUrl
    ? [{ url_storage: dto.imagenUrl, es_portada: true }]
    : [];

  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      titulo: dto.titulo,
      contenido: dto.contenido,
      id_categoria_noticia: dto.id_categoria_noticia,
      resumen: dto.resumen,
      publicado: true,
      imagenes,
    }),
  });
  await handleRes<unknown>(res);
}