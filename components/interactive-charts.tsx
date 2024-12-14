import React from 'react';
import ReactECharts, { EChartsOption } from 'echarts-for-react';
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from 'next-themes';

interface BaseChart {
  type: string;
  title: string;
  x_label?: string;
  y_label?: string;
  x_unit?: string;
  y_unit?: string;
  x_ticks?: (number | string)[];
  x_tick_labels?: string[];
  x_scale?: string;
  y_ticks?: (number | string)[];
  y_tick_labels?: string[];
  y_scale?: string;
  elements: any[];
}

export function InteractiveChart({ chart }: { chart: BaseChart }) {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#e5e5e5' : '#171717';
  const gridColor = theme === 'dark' ? '#404040' : '#e5e5e5';

  const sharedOptions: EChartsOption = {
    grid: { top: 30, right: 8, bottom: 28, left: 28 },
    legend: {}
  };

  if (chart.type === 'line') {
    const series = chart.elements.map((e) => {
      return {
        name: e.label,
        type: 'line',
        data: e.points.map((p: [number, number]) => [p[0], p[1]])
      };
    });

    const options: EChartsOption = {
      ...sharedOptions,
      xAxis: {
        type: chart.x_scale === 'datetime' ? 'time' : 'category',
        name: chart.x_label,
        nameLocation: 'middle',
        axisLabel: {
          color: textColor,
          formatter: (value: number) => {
            if (chart.x_scale === 'datetime') {
              return new Date(value).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });
            }
            return chart.x_unit ? `${value}${chart.x_unit}` : `${value}`;
          }
        },
        axisLine: { lineStyle: { color: gridColor } }
      },
      yAxis: {
        name: chart.y_label,
        nameLocation: 'middle',
        axisLabel: {
          color: textColor,
          formatter: (value: number) => 
            chart.y_unit ? `${chart.y_unit}${value}` : value.toString()
        },
        axisLine: { lineStyle: { color: gridColor } }
      },
      series,
      tooltip: {
        trigger: 'axis'
      }
    };

    return (
      <Card className="w-full bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          <ReactECharts 
            option={options} 
            style={{ height: '400px' }}
            theme={theme === 'dark' ? 'dark' : undefined}
          />
        </CardContent>
      </Card>
    );
  }

  if (chart.type === 'bar') {
    const data = Object.groupBy(chart.elements, ({ group }) => group);

    const series = Object.entries(data).map(([group, elements]) => ({
      name: group,
      type: 'bar',
      stack: 'total',
      data: elements?.map((e) => [e.label, e.value])
    }));

    const options: EChartsOption = {
      ...sharedOptions,
      xAxis: {
        type: 'category',
        name: chart.x_label,
        nameLocation: 'middle',
        axisLabel: { color: textColor },
        axisLine: { lineStyle: { color: gridColor } }
      },
      yAxis: {
        name: chart.y_label,
        nameLocation: 'middle',
        axisLabel: { 
          color: textColor,
          formatter: (value: number) => 
            chart.y_unit ? `${chart.y_unit}${value}` : value.toString()
        },
        axisLine: { lineStyle: { color: gridColor } }
      },
      series,
      tooltip: {
        trigger: 'axis'
      }
    };

    return (
      <Card className="w-full bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          <ReactECharts 
            option={options} 
            style={{ height: '400px' }}
            theme={theme === 'dark' ? 'dark' : undefined}
          />
        </CardContent>
      </Card>
    );
  }

  return null;
}

export default InteractiveChart;