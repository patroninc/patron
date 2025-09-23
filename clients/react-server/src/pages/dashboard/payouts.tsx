import { JSX } from 'react';
import MainLayout from '@/layouts/main';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PxBorder from '@/components/px-border';

/**
 * Payouts dashboard page component.
 * Displays earnings and payout information for creators.
 *
 * @returns {JSX.Element} The payouts dashboard page
 */
const Payouts = (): JSX.Element => {
  return (
    <MainLayout>
      <div className="p-[50px] px-[100px]">
        <h1 className="mb-[50px] text-5xl">Payouts</h1>

        <Tabs defaultValue="balance" className="w-full">
          <TabsList>
            <TabsTrigger value="balance">Balance</TabsTrigger>
            <TabsTrigger value="payout-methods">Payout methods</TabsTrigger>
          </TabsList>

          <TabsContent className="flex items-center gap-5" value="balance">
            <div className="relative flex w-max min-w-[300px] flex-col gap-2.5 bg-white p-5">
              <PxBorder width={3} radius="lg" />

              <p className="text-base">Available Balance</p>
              <p className="text-4xl font-bold">$1500.00</p>
            </div>
            <div className="relative flex w-max min-w-[300px] flex-col gap-2.5 bg-white p-5">
              <PxBorder width={3} radius="lg" />

              <p className="text-base">Pending</p>
              <p className="text-4xl font-bold">$1500.00</p>
            </div>
          </TabsContent>

          <TabsContent value="payout-methods">
            <div className="mb-5 flex items-center justify-between"></div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Payouts;
