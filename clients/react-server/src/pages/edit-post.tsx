import { JSX, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';

import MainLayout from '@/layouts/main';
import PostForm from '@/components/post-form';
import { patronClient } from '@/lib/utils';
import { PostResponse } from 'patronts/models';

/**
 * Edit post page component.
 * Loads existing post data and provides a form for editing.
 *
 * @returns {JSX.Element} The edit post page
 */
const EditPost = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const postId = searchParams.get('id');

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        setError('No post ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const postData = await patronClient.posts.get({ postId });
        setPost(postData);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('Failed to load post data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-[50px] px-[100px]">
          <div className="text-center">Loading post...</div>
        </div>
      </MainLayout>
    );
  }

  if (error || !post) {
    return (
      <MainLayout>
        <div className="p-[50px] px-[100px]">
          <div className="text-center">
            <h2 className="mb-4 text-2xl">{error || 'Post not found'}</h2>
            <button onClick={() => navigate('/dashboard/content')}>Go to Content Dashboard</button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-[50px] px-[100px]">
        <h1 className="mb-[50px] text-5xl">Edit Post</h1>
        <PostForm existingPost={post} isEditMode={true} />
      </div>
    </MainLayout>
  );
};

export default EditPost;
