export const removeHtmlTags = (content: string) => content.replaceAll(/<(.|\n)*?>/g, '').replaceAll('\r\n', '')
