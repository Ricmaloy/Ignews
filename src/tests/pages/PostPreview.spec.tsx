import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { getPrismicClient } from '../../services/prismic';

const post = {
    slug: 'fake-post-slug',
    title: 'My fake post',
    content:'<p>Fake Post Excerpt</p>',
    updatedAt: 'March, 10'
}
;

jest.mock('next-auth/client');
jest.mock('next/router');
jest.mock('../../services/prismic');

describe('Post preview page', () => {
    it('renders correctly', () => {
        const useSessionMocked = mocked(useSession);

        useSessionMocked.mockReturnValueOnce([null, false]);

        render(<Post post={post} />)

        expect(screen.getByText("My fake post")).toBeInTheDocument();
        expect(screen.getByText("Fake Post Excerpt")).toBeInTheDocument();
        expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
    });

    it('redirects user to full post when user is subscribed', async () => {
        const useSessionMocked = mocked(useSession);
        const useRouterMocked = mocked(useRouter);
        const pushMock = jest.fn();

        useSessionMocked.mockReturnValueOnce([ 
            { activeSubscription: 'fake-active-subscription' }, 
            false
        ] as any);

        useRouterMocked.mockReturnValueOnce({
            push: pushMock,
        } as any)

        render(<Post post={post} />);

        expect(pushMock).toHaveBeenCalledWith('/posts/fake-post-slug');
    });

    it('laods initial data', async () => {
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

        const response = await getStaticProps({
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