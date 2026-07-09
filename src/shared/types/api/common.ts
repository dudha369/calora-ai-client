/**
 * Общие DTO, переиспользуемые в нескольких API-модулях.
 */

/** Ответ на DELETE-запросы (удаление записи воды/еды и т.п.) */
export interface DeleteResponse {
  deleted: true;
}
