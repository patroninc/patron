import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { JSX, useState } from 'react';
import MainLayout from '@/layouts/main';
import { Tabs, TabsTrigger, TabsContent, TabsList } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import PxBorder from '@/components/px-border';
import UnderContruction from '@/components/under-contruction';

/**
 * Generate 30 days of sample chart data for membership tiers
 *
 * @returns Array of chart data objects
 */
const generateChartData = (): Array<{
  date: string;
  supporter: number;
  supporterPlus: number;
  fan: number;
}> => {
  const data = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split('T')[0],
      supporter: Math.floor(Math.random() * 200) + 50,
      supporterPlus: Math.floor(Math.random() * 150) + 30,
      fan: Math.floor(Math.random() * 100) + 10,
    });
  }

  return data;
};

const fullChartData = generateChartData();

const chartConfig = {
  supporter: {
    label: 'Supporter',
    color: 'var(--chart-1)',
  },
  supporterPlus: {
    label: 'Supporter+',
    color: 'var(--chart-2)',
  },
  fan: {
    label: 'Fan',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

/**
 * Insights dashboard page component.
 * Displays analytics and performance metrics for creators.
 *
 * @returns {JSX.Element} The insights dashboard page
 */
const Insights = (): JSX.Element => {
  // Use all 30 days of data
  const chartData = fullChartData;

  // State for tier visibility
  const [visibleTiers, setVisibleTiers] = useState({
    supporter: true,
    supporterPlus: true,
    fan: true,
  });

  // Filter chart config based on visible tiers
  const filteredChartConfig = {
    ...(visibleTiers.supporter && { supporter: chartConfig.supporter }),
    ...(visibleTiers.supporterPlus && { supporterPlus: chartConfig.supporterPlus }),
    ...(visibleTiers.fan && { fan: chartConfig.fan }),
  } satisfies ChartConfig;

  /**
   * Handle tier checkbox toggle with validation
   *
   * @param tier - The tier to toggle
   */
  const handleTierToggle = (tier: keyof typeof visibleTiers): void => {
    // Check if this would be the last tier being unchecked
    const currentCheckedCount = Object.values(visibleTiers).filter(Boolean).length;
    const wouldBeLastTier = currentCheckedCount === 1 && visibleTiers[tier];

    // Prevent unchecking the last tier
    if (wouldBeLastTier) {
      return;
    }

    setVisibleTiers((prev) => ({
      ...prev,
      [tier]: !prev[tier],
    }));
  };

  return (
    <MainLayout>
      <UnderContruction />
      {/* <div className="p-[50px] px-[100px]">
        <h1 className="mb-[50px] text-5xl">Insights</h1>

        <Tabs defaultValue="memberships" className="w-full">
          <TabsList>
            <TabsTrigger value="memberships">Memberships</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent className="bg-white p-5" value="memberships">
            <PxBorder width={3} radius="lg" />

            <div className="bg-secondary-background text-foreground">
              <div className="mb-10">
                <h2 className="text-2xl font-bold">Membership Analytics</h2>
                <p>Track your membership performance over the last 30 days.</p>

                <div className="mt-5 flex gap-5">
                  <label className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      className="data-[state=checked]:bg-[var(--chart-1)] data-[state=checked]:text-black"
                      checked={visibleTiers.supporter}
                      onCheckedChange={() => handleTierToggle('supporter')}
                    />
                    <span className="text-sm font-medium">Supporter</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      className="data-[state=checked]:bg-[var(--chart-2)] data-[state=checked]:text-black"
                      checked={visibleTiers.supporterPlus}
                      onCheckedChange={() => handleTierToggle('supporterPlus')}
                    />
                    <span className="text-sm font-medium">Supporter+</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      className="data-[state=checked]:bg-[var(--chart-3)] data-[state=checked]:text-black"
                      checked={visibleTiers.fan}
                      onCheckedChange={() => handleTierToggle('fan')}
                    />
                    <span className="text-sm font-medium">Fan</span>
                  </label>
                </div>
              </div>
              <ChartContainer className="h-[400px] w-full" config={filteredChartConfig}>
                <BarChart accessibilityLayer data={chartData} margin={{ bottom: 40 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    interval={2}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      });
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => value}
                  />
                  {visibleTiers.supporter && (
                    <Bar
                      dataKey="supporter"
                      stackId="a"
                      fill="var(--color-supporter)"
                      radius={[0, 0, 0, 0]}
                      stroke="#000"
                      strokeWidth={2}
                    />
                  )}
                  {visibleTiers.supporterPlus && (
                    <Bar
                      dataKey="supporterPlus"
                      stackId="a"
                      fill="var(--color-supporterPlus)"
                      radius={[0, 0, 0, 0]}
                      stroke="#000"
                      strokeWidth={2}
                    />
                  )}
                  {visibleTiers.fan && (
                    <Bar
                      dataKey="fan"
                      stackId="a"
                      fill="var(--color-fan)"
                      radius={[0, 0, 0, 0]}
                      stroke="#000"
                      strokeWidth={2}
                    />
                  )}
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          });
                        }}
                      />
                    }
                    cursor={false}
                    defaultIndex={1}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <div className="mb-5 flex items-center justify-between"></div>
          </TabsContent>
        </Tabs>
      </div> */}
    </MainLayout>
  );
};

export default Insights;
