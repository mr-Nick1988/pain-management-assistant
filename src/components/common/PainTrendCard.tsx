import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { PainTrendAnalysisDTO } from '../../types/common/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Badge } from '../ui/Badge';
import { MetricCard } from '../ui/MetricCard';
import { Grid, EmptyState } from '../ui/Grid';

type Props = {
    trend?: PainTrendAnalysisDTO;
    isLoading: boolean;
    error?: unknown;
};

export function PainTrendCard({ trend, isLoading, error }: Props) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Pain Trend Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <LoadingSpinner message="Loading pain trend data..." />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Pain Trend Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <ErrorMessage message="Failed to load pain trend data. Please try again later." />
                </CardContent>
            </Card>
        );
    }

    if (!trend || trend.painTrend === 'NO_DATA') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Pain Trend Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState message="No VAS data available. Pain trend analysis will appear once VAS records are created." />
                </CardContent>
            </Card>
        );
    }

    // Определяем бейдж тренда
    const getTrendBadge = () => {
        switch (trend.painTrend) {
            case 'INCREASING':
                return { variant: 'error' as const, label: '↗ Increasing', icon: '↗' };
            case 'DECREASING':
                return { variant: 'success' as const, label: '↘ Decreasing', icon: '↘' };
            case 'STABLE':
                return { variant: 'info' as const, label: '→ Stable', icon: '→' };
            default:
                return { variant: 'default' as const, label: 'Unknown', icon: '?' };
        }
    };

    const trendBadge = getTrendBadge();

    // Подготовка данных для графика
    const chartData = trend.vasHistory.map((vas, index) => ({
        index: index + 1,
        vas: vas,
    }));

    // Определяем цвет для Change метрики
    const getChangeColor = () => {
        if (trend.vasChange > 0) return 'red';
        if (trend.vasChange < 0) return 'green';
        return 'blue';
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Pain Trend Analysis</CardTitle>
                    <Badge variant={trendBadge.variant}>
                        {trendBadge.label}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                {/* Статистика */}
                <Grid columns={3} gap={4} className="mb-6">
                    <MetricCard
                        title="Current VAS"
                        value={trend.currentVas}
                        color="blue"
                    />
                    <MetricCard
                        title="Previous VAS"
                        value={trend.previousVas}
                        color="purple"
                    />
                    <MetricCard
                        title="Change"
                        value={trend.vasChange >= 0 ? `+${trend.vasChange}` : trend.vasChange}
                        color={getChangeColor()}
                    />
                    <MetricCard
                        title="Average"
                        value={trend.averageVas.toFixed(1)}
                        color="indigo"
                    />
                    <MetricCard
                        title="Maximum"
                        value={trend.maxVas}
                        color="orange"
                    />
                    <MetricCard
                        title="Minimum"
                        value={trend.minVas}
                        color="blue"
                    />
                </Grid>

                {/* Дополнительная информация */}
                <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                    <div>
                        <span className="font-semibold">Total Records:</span> {trend.vasRecordCount}
                    </div>
                    {trend.daysBetweenVasRecords > 0 && (
                        <div>
                            <span className="font-semibold">Days Between Last Records:</span>{' '}
                            {trend.daysBetweenVasRecords}
                        </div>
                    )}
                </div>

                {/* График */}
                <Card variant="outline">
                    <CardContent className="p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">VAS History</h4>
                        <div style={{ height: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="index"
                                        label={{ value: 'Record #', position: 'insideBottom', offset: -5 }}
                                        stroke="#6b7280"
                                    />
                                    <YAxis
                                        domain={[0, 10]}
                                        label={{ value: 'VAS Score', angle: -90, position: 'insideLeft' }}
                                        stroke="#6b7280"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                        }}
                                        labelFormatter={(value) => `Record #${value}`}
                                        formatter={(value: number) => [value, 'VAS Score']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="vas"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ fill: '#3b82f6', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}
