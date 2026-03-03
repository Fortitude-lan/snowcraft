"use client";

import { useEffect, useMemo, useState } from "react";
import { getStatsOverview, getReviewSummaryApi, getReviewBarDataApi } from "@/api/auth";
import { Label, Pie, PieChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
type Stats = {
  user_count: number;
  product_count: number;
  order_count: number;
};

interface MonthlySales {
  month: number
  sales: number
}
interface ReviewSummary {
  positive: number;
  neutral: number;
  negative: number;
  total: number,
}
export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    user_count: 0,
    product_count: 0,
    order_count: 0,
  });
  const [summary, setSummary] = useState<ReviewSummary>({
    positive: 1,
    neutral: 1,
    negative: 1,
    total: 1,
  });
  const [barData, setBarData] = useState<MonthlySales[]>([])

  const fetchStats = async () => {
    try {
      const res = await getStatsOverview();
      const data = res.data || {};
      setStats({
        user_count: data.user_count || 0,
        product_count: data.product_count || 0,
        order_count: data.order_count, // temporary mock data
      });
    } catch (e) {
      console.error("Failed to load stats", e);
    }
  };

  const fetchBarData = async () => {
    try {
      const res = await getReviewBarDataApi()
      if (res.code === 200 && res.data) {
        // res.data 是对象，需要转成数组 [{ month: 1, sales: n }, ...]
        const dataArray = Object.entries(res.data).map(([month, sales]) => ({
          month: Number(month), // 转成数字 1-12
          sales: Number(sales),
        }))

        setBarData(dataArray)
      }
    } catch (err) {
      console.error("Failed to fetch monthly sales", err)
    }
  }

  const fetchPieData = async () => {
    try {
      const res = await getReviewSummaryApi()
      if (res.code === 200) {
        setSummary(res.data)
      }
    } catch (err) {
      console.error("Failed to fetch review summary");

    }
  }
  useEffect(() => {


    fetchStats();
    fetchBarData();
    fetchPieData();
  }, []);
  const currentYear = new Date().getFullYear() 

  const COLORS = ["#22c55e", "#facc15", "#ef4444"] // green / yellow / red

  const pieConfig = {
    visitors: {
      label: "Visitors",
    },

  } satisfies ChartConfig

  const pieConfigData = [
    { browser: "Positive", visitors: summary.positive, fill: COLORS[0] },
    { browser: "Neutral", visitors: summary.neutral, fill: COLORS[1] },
    { browser: "Negative", visitors: summary.negative, fill: COLORS[2] },
  ]
  const barConfigdata = barData.map((item) => {
    const monthName = new Date(Date.UTC(0, item.month - 1)).toLocaleString("en-US", {
      month: "short", // "Jan", "Feb", ...
    })
    return {
      month: monthName,
      sales: item.sales,
    }
  })

  const barConfig = {
    sales: {
      label: "Sales",
      color: "#3b82f6",
    },
  } satisfies ChartConfig
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Users</div>
          <div className="mt-2 text-2xl font-bold">{stats.user_count}</div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Products</div>
          <div className="mt-2 text-2xl font-bold">{stats.product_count}</div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Orders</div>
          <div className="mt-2 text-2xl font-bold">{stats.order_count}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-4 text-lg font-semibold">Reviews Overview</div>
          <ChartContainer
            config={pieConfig}
            className="mx-auto aspect-square max-h-[250px] w-full"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={pieConfigData}
                dataKey="visitors"
                nameKey="browser"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {summary.total}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Visitors
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="mt-4 flex justify-around text-sm text-muted-foreground">
            <span>Positive {summary.positive}%</span>
            <span>Neutral {summary.neutral}%</span>
            <span>Negative {summary.negative}%</span>
          </div>
        </div>

        <div className="flex flex-col rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-4 text-lg font-semibold"> {currentYear} Monthly Orders</div>
          <div className="flex-1 flex items-end justify-between gap-2">
            <ChartContainer config={barConfig}
              className="mx-auto aspect-square max-h-[250px] w-full"

            >
              <BarChart accessibilityLayer data={barConfigdata}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={8} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
