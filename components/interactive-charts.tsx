// components/interactive-charts.tsx
import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from 'next-themes';

interface BaseChartProps {
  title: string;
  xLabel?: string;
  yLabel?: string;
  xUnit?: string | null;
  yUnit?: string | null;
  x_ticks?: (number | string)[];
  x_tick_labels?: string[];
  x_scale?: string;
  y_ticks?: (number | string)[];
  y_tick_labels?: string[];
  y_scale?: string;
}

type BarChartElement = {
  label: string;
  group: string;
  value: number;
};

type PointData = {
  label: string;
  points: [number | string, number | string][];
};

interface ChartProps extends BaseChartProps {
  type: 'bar' | 'line';
  elements: BarChartElement[] | PointData[];
}

const InteractiveChart: React.FC<ChartProps> = ({
  type,
  title,
  xLabel = '',
  yLabel = '',
  xUnit = '',
  yUnit = '',
  elements,
  x_ticks,
  x_tick_labels,
  x_scale = 'value',
  y_ticks,
  y_tick_labels,
  y_scale = 'value',
}) => {
  const { theme } = useTheme();

  const getChartOptions = () => {
    if (!elements || elements.length === 0) {
      return {};
    }

    const textColor = theme === 'dark' ? '#e5e5e5' : '#171717';
    const axisLineColor = theme === 'dark' ? '#404040' : '#e5e5e5';

    if (type === 'line') {
      const lineElements = elements as PointData[];

      const xAxisType = x_scale === 'datetime' ? 'time' : x_scale;

      const series = lineElements.map(el => ({
        name: el.label,
        type: 'line',
        data: el.points.map(point => {
          const xValue =
            xAxisType === 'time'
              ? new Date(point[0] as string).getTime()
              : point[0];
          return [xValue, point[1]];
        }),
        smooth: true,
      }));

      return {
        title: {
          text: title || '',
          textStyle: { color: textColor },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          },
        },
        legend: {
          data: lineElements.map(el => el.label),
          textStyle: { color: textColor },
        },
        xAxis: {
          type: xAxisType,
          name: xLabel,
          nameTextStyle: { color: textColor },
          axisLabel: {
            color: textColor,
            formatter: (value: number) => {
              if (xAxisType === 'time') {
                return echarts.format.formatTime('yyyy-MM', value);
              }
              return xUnit ? `${value} ${xUnit}` : `${value}`;
            },
          },
          axisLine: { lineStyle: { color: axisLineColor } },
        },
        yAxis: {
          type: y_scale,
          name: yLabel,
          nameTextStyle: { color: textColor },
          axisLabel: {
            color: textColor,
            formatter: (value: number) =>
              yUnit ? `${value} ${yUnit}` : `${value}`,
          },
          axisLine: { lineStyle: { color: axisLineColor } },
          ...(y_ticks && {
            min: Math.min(...(y_ticks as number[])),
            max: Math.max(...(y_ticks as number[])),
          }),
        },
        series,
      };
    } else if (type === 'bar') {
      const barElements = elements as BarChartElement[];

      const groups = Array.from(new Set(barElements.map(el => el.group))).filter(Boolean);
      const labels = Array.from(new Set(barElements.map(el => el.label))).filter(Boolean);

      const series = groups.map(group => ({
        name: group,
        type: 'bar',
        data: labels.map(label => {
          const el = barElements.find(e => e.group === group && e.label === label);
          return el ? el.value : 0;
        }),
      }));

      return {
        title: {
          text: title || '',
          textStyle: { color: textColor },
        },
        tooltip: { trigger: 'axis' },
        legend: {
          data: groups,
          textStyle: { color: textColor },
        },
        xAxis: {
          type: 'category',
          data: labels,
          name: xLabel,
          nameTextStyle: { color: textColor },
          axisLabel: { color: textColor },
          axisLine: { lineStyle: { color: axisLineColor } },
        },
        yAxis: {
          type: 'value',
          name: yLabel,
          nameTextStyle: { color: textColor },
          axisLabel: {
            color: textColor,
            formatter: (value: number) =>
              yUnit ? `${value} ${yUnit}` : value.toString(),
          },
          axisLine: { lineStyle: { color: axisLineColor } },
          ...(y_ticks && {
            min: Math.min(...(y_ticks as number[])),
            max: Math.max(...(y_ticks as number[])),
          }),
        },
        series,
      };
    }

    return {};
  };

  const options = getChartOptions();

  if (!options || Object.keys(options).length === 0) {
    return (
      <Card className="w-full bg-white dark:bg-neutral-800">
        <CardHeader>
          <CardTitle className="text-neutral-800 dark:text-neutral-200">
            {title || 'Chart'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-neutral-600 dark:text-neutral-400">
            No data available to display the chart.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white dark:bg-neutral-800">
      <CardHeader>
        <CardTitle className="text-neutral-800 dark:text-neutral-200">
          {title || 'Chart'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts
          option={options}
          style={{ height: '400px', width: '100%' }}
        />
      </CardContent>
    </Card>
  );
};

export default InteractiveChart;