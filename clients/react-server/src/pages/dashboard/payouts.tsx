import { JSX } from 'react';
import MainLayout from '@/layouts/main';
import UnderContruction from '@/components/under-contruction';

/**
 * Payouts dashboard page component.
 * Displays earnings and payout information for creators.
 *
 * @returns {JSX.Element} The payouts dashboard page
 */
const Payouts = (): JSX.Element => {
  return (
    <MainLayout>
      <UnderContruction />
    </MainLayout>
  );
};

export default Payouts;
