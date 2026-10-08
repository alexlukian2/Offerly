// Спільна домовленість: id повідомлення про помилку = id поля + "-error".
// Поле посилається на нього через aria-describedby, FormField — рендерить з цим id.
export function getErrorId(fieldId: string) {
  return `${fieldId}-error`
}
