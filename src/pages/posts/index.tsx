import { GetStaticProps } from 'next';
import Head from 'next/head'
import { getPrismicCLient } from '../../services/prismic';
import styles from './styles.module.scss';
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'
import Link from 'next/link'

type Post = {
    slug: string;
    title: string;
    excerpt: string;
    createdAt: string
}

interface PostsProps {
    posts: Post[];
}

export default function Posts({ posts }){
    return (
        <>
            <Head>
                <title>
                    Posts | ig.news
                </title>
            </Head>

            <main className={styles.container}>
                    {posts.map(post => (
                        <div className={styles.posts}>
                            <Link  href={`/posts/${post.slug}`}>
                                <a key={ post.slug }>
                                    <time>{ post.updatedAt }</time>                        
                                    <strong>{ post.title }</strong>
                                    <p>{ post.excerpt }</p>
                                </a>
                            </Link>
                        </div>
                    ))}
            </main>
        </>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    const prismic = getPrismicCLient()

    const response = await prismic.query([
        Prismic.predicates.at('document.type', 'post')
    ], {
        fetch: ['post.title', 'post.content'],
        pageSize: 100,
    })

    const posts = response.results.map(post => {
        return {
            slug: post.uid,
            title: RichText.asText(post.data.title),
            excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
            updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })
        }
    })

    return {
        props: { posts } 
    }
}