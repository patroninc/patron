import { JSX } from 'react';

import MainLayout from '@/layouts/main';
import PostForm from '@/components/post-form';

/**
 * New post creation page component.
 * Provides a comprehensive form for creating new posts with all available options.
 *
 * @returns {JSX.Element} The new post page
 */
const NewPost = (): JSX.Element => {
  return (
    <MainLayout>
      <div className="p-[50px] px-[100px]">
        <h1 className="mb-[50px] text-5xl">Create New Post</h1>
        <PostForm />
      </div>
    </MainLayout>
  );
};

export default NewPost;
