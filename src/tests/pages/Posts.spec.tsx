import { render, screen } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import Posts, { getStaticProps } from '../../pages/posts';
import { getPrismicClient } from '../../services/prismic';

const posts = [
    {
        slug: 'fake_post-slug',
        title: 'My fake post',
        excerpt:'Fake Post Excerpt',
        updatedAt: 'March, 10'
    }
];

jest.mock('../../services/prismic');

describe('Posts page', () => {
    it('renders correctly', () => {
        render(<Posts posts={posts} />)

        expect(screen.getByText("My fake post")).toBeInTheDocument();
    });

    it('loads initial data',async () => {
        const getPrismicClientMocked = mocked(getPrismicClient);

        getPrismicClientMocked.mockReturnValueOnce({
            query: jest.fn().mockResolvedValueOnce({
                results: [
                    {
                        uid: 'my-uid-post',
                        data: {
                            title: [
                                { type: 'heading', text: 'My new post'}
                            ],
                            content: [
                                { type: 'paragraph', text: 'Post excerpt'}
                            ]
                        },
                        last_publication_date: '04-01-2021'
                    }
                ]
            })
        }as any)

        const response = await getStaticProps({})

        expect(response).toEqual(
            expect.objectContaining({  
                props: {
                    posts:[ 
                        {
                            slug: 'my-uid-post',
                            title: 'My new post',
                            excerpt: 'Post excerpt',
                            updatedAt: '01 de abril de 2021'
                        }
                    ]
                }                
            })
        )
    })
});