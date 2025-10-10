import { JSX } from 'react';
import MainLayout from '@/layouts/main';
import UnderContruction from '@/components/under-contruction';

/**
 * Insights dashboard page component.
 * Displays analytics and performance metrics for creators.
 *
 * @returns {JSX.Element} The insights dashboard page
 */
const Insights = (): JSX.Element => {
  return (
    <MainLayout>
      <UnderContruction />
    </MainLayout>
  );
};

export default Insights;
