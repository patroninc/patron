import { JSX } from 'react';

import MainLayout from '@/layouts/main';
import UnderContruction from '@/components/under-contruction';

/**
 * Audience dashboard page component.
 * Displays audience demographics and engagement data.
 *
 * @returns {JSX.Element} The audience dashboard page
 */
const Audience = (): JSX.Element => {
  return (
    <MainLayout>
      <UnderContruction />
    </MainLayout>
  );
};

export default Audience;
