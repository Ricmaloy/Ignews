import { render, screen } from '@testing-library/react';
import { getSession } from 'next-auth/client';
import { mocked } from 'ts-jest/utils';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { getPrismicClient } from '../../services/prismic';

const post = {
    slug: 'fake_post-slug',
    title: 'My fake post',
    content:'<p>Fake Post Excerpt</p>',
    updatedAt: 'March, 10'
}
;

jest.mock('next-auth/client');
jest.mock('../../services/prismic');

describe('Post page', () => {
    it('renders correctly', () => {
        render(<Post post={post} />)

        expect(screen.getByText("My fake post")).toBeInTheDocument();
        expect(screen.getByText("Fake Post Excerpt")).toBeInTheDocument();
    });

    it('redirects user if mo subscription is found', async () => {
        const getSessionMocked = mocked(getSession);

        getSessionMocked.mockResolvedValueOnce(null);

        const response = await getServerSideProps({ 
            params: {
                slug: 'my-new-post'
            }
         } as any)

        expect(response).toEqual(
            expect.objectContaining({  
                redirect: expect.objectContaining(
                    {
                        destination: '/',
                    }     
                )    
            })
        )
    });

    it('laods initial data', async () => {
        const getSessionMocked = mocked(getSession);

        const getPrismicClientMocked = mocked(getPrismicClient);

        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
               data: {
                title: [
                    { type: 'heading', text: 'My new post'}
                ],
                content: [
                    { type: 'paragraph', text: 'Post content'}
                ],
               },
               last_publication_date: '04-01-2021',
            })
        }as any);

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: 'fake-active-subscription'
        } as any);

        const response = await getServerSideProps({ 
            params: {
                slug: 'my-new-post'
            }
         } as any)

        expect(response).toEqual(
            expect.objectContaining({  
                props: {
                    post: {
                        slug: 'my-new-post',
                        title: 'My new post',
                        content: '<p>Post content</p>',
                        updatedAt: '01 de abril de 2021'
                    }
                } 
            })
        )
    })
});