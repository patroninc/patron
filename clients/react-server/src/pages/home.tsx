import Layout from '../layouts/main';
import { JSX } from 'react';

/**
 * @returns {JSX.Element} The Home component
 */
export const Home = (): JSX.Element => {
  return (
    <Layout>
      <p>Home</p>
    </Layout>
  );
};

export default Home;
