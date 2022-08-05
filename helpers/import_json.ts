import { readFileSync } from 'fs'
import { BaseKeystoneTypeInfo, KeystoneContext } from '@keystone-6/core/types'

const IMPORT_DIR = './import_data'

type AuthorProps = {
  name: string
  email: string
}

type PostProps = {
  title: string
  status: 'draft' | 'published'
  publishDate: string
  author: string
  content: string
}

export const importMongoJson = async (context: KeystoneContext<BaseKeystoneTypeInfo>) => {
  console.log(`🌱 Importing MongoDB JSON-data`)
  const importDir = `${IMPORT_DIR}/mongo`
  const data = readFileSync(`${importDir}/category.json`, 'utf8')
  const jsonData = JSON.parse(data)
  console.log('jsonData', jsonData)
  const createAuthor = async (authorData: AuthorProps) => {
    let author = await context.query.Author.findOne({
      where: { email: authorData.email },
      query: 'id',
    })

    if (!author) {
      author = await context.query.Author.createOne({
        data: authorData,
        query: 'id',
      })
    }
  }

  const createPost = async (postData: PostProps) => {
    let authors = await context.query.Author.findMany({
      where: { name: { equals: postData.author } },
      query: 'id',
    })

    await context.query.Post.createOne({
      data: { ...postData, author: { connect: { id: authors[0].id } } },
      query: 'id',
    })
  }

  //   console.log(`👩 Adding authors...`)
  //   for (const author of authors) {
  //     await createAuthor(author)
  //   }

  //   console.log(`📝 Adding posts...`)
  //   for (const post of posts) {
  //     await createPost(post)
  //   }

  console.log(`✅ JSON-data inserted`)
  console.log(`👋 Please start the process with \`yarn dev\` or \`npm run dev\``)
  process.exit()
}

export const importMysqlJson = async (context: KeystoneContext<BaseKeystoneTypeInfo>) => {
  console.log(`🌱 Importing MysqlDB JSON-data`)
  const importDir = `${IMPORT_DIR}/mysql`
  const data = readFileSync(`${importDir}/category.json`, 'utf8')
  const jsonData = JSON.parse(data)
  console.log('jsonData', jsonData)
  console.log(`✅ JSON-data inserted`)
  console.log(`👋 Please start the process with \`yarn dev\` or \`npm run dev\``)
  process.exit()
}
