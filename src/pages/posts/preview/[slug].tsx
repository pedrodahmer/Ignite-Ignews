import { useEffect } from "react"
import { GetStaticPaths, GetStaticProps } from "next"
import { useSession } from "next-auth/client"
import Head from "next/head"
import Link from "next/link"
import { RichText } from "prismic-dom"
import { getPrismicCLient } from "../../../services/prismic"
import { useRouter } from 'next/dist/client/router'

import styles from "../post.module.scss"

interface PostPreviewProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
}

export default function PostPreview ({ post }: PostPreviewProps) {
    const [session] = useSession()
    const router = useRouter()

    useEffect(() => {
        router.push(`/posts/${post.slug}`)
    }, [session])
    
    return (
        <>
            <Head>
                <title>{ post.title } | Ignews</title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{ post.title }</h1>
                    <time>{ post.updatedAt }</time>

                    <div 
                        className={`${styles.postContent} ${styles.previewContent}`}
                        dangerouslySetInnerHTML={{ __html: post.content }} />
                </article>

                <div className={styles.continueReading}>
                      Wanna continue reading?
                      <Link href="/">
                        <a>Subscribe now 🤗</a>
                      </Link>                  
                </div>
            </main>
        </>
    )
}

export const getStaticPaths: GetStaticPaths = async() => {
    return {
        paths: [],
        fallback: 'blocking'
        
        //true - carrega pelo cliente aquilo que ainda não foi gerado de forma estática
        //false - se o post não foi gerado de forma estática ainda eles retorna uma 404
        //blocking - conteúdo é renderizado pelo server (next) quando ainda não foi gerado
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { slug } = params

    const prismic = getPrismicCLient()

    const response = await prismic.getByUID('post', String(slug), {})

    const post = {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content.splice(0, 4)),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    return {
        props: {
            post,
        },
        revalidate: 60 * 30, //20 minutos
    }
}