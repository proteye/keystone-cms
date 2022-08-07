export const removeHtmlTags = (content: string) => content.replace(/<(.|\n)*?>/g, '')
