import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis
} from 'recharts';
import { useActiveCycle } from '../../hooks/useGoals';
import { useReportData } from '../../hooks/useAdmin';
import { getCurrentQuarter } from '../../utils/achievementUtils';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
const STATUS_COLORS = {
    notStarted: '#ef4444',
    onTrack: '#f59e0b',
    completed: '#10b981'
};

const getScoreColorClass = (score) => {
    const s = Math.min(score, 150);
    if (s >= 100) return 'bg-success';
    if (s >= 50) return 'bg-warning';
    return 'bg-error';
};

const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
};

const round = (value) => Number.isFinite(value) ? Math.round(value) : 0;
const renderScore = (value) => Math.round(Math.min(value, 150));

export const AdminAnalytics = () => {
    const { data: cycle, isLoading: cycleLoading } = useActiveCycle();
    const { data: reportData, isLoading: dataLoading } = useReportData(cycle?.id);
    const isLoading = cycleLoading || dataLoading;
    const currentQuarterInfo = getCurrentQuarter(cycle);
    const currentQuarter = currentQuarterInfo.quarter;

    const {
        quarterTrendData = [],
        thrustAreaData = [],
        uomData = [],
        statusData = [],
        leaderboardData = [],
        avgTeamScore = 0,
        totalOnTrack = 0,
        totalCompleted = 0,
        checkinRate = 0,
        radarData = []
    } = reportData?.analytics || {};

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 p-8">
                <div className="h-24 rounded-3xl bg-surface-container animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="h-44 rounded-3xl bg-surface-container animate-pulse" />
                    ))}
                </div>
                <div className="h-[420px] rounded-3xl bg-surface-container animate-pulse"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
                    <div className="h-[360px] rounded-3xl bg-surface-container animate-pulse" />
                    <div className="h-[360px] rounded-3xl bg-surface-container animate-pulse" />
                </div>
            </div>
        );
    }

    if (!cycle) {
        return (
            <div className="max-w-7xl mx-auto p-8">
                <div className="bg-surface-container p-10 rounded-3xl border border-outline text-center">
                    <h2 className="text-2xl font-bold text-slate-700">No Active Cycle</h2>
                    <p className="text-slate-700-variant mt-3">Analytics requires an active cycle to display current performance.</p>
                </div>
            </div>
        );
    }

    const employeeKeys = (reportData?.analytics?.employees || []).map((employee, index) => ({
        key: `emp_${employee.id}`,
        name: employee.full_name,
        color: COLORS[index % COLORS.length]
    }));

    const uiThrustAreaData = thrustAreaData.map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length]
    }));

    const uiUomData = uomData.map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length]
    }));

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-fade-in relative">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-display-md font-bold text-slate-700">Analytics</h1>
                    <p className="text-slate-700-variant mt-1">Goal performance insights across your organization.</p>
                </div>
                <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Active Cycle: {cycle.name}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-surface-container p-6 rounded-3xl border border-outline shadow-sm overflow-hidden animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm uppercase tracking-widest text-slate-700-variant">Avg Team Score</div>
                        <div className="text-sm font-semibold text-slate-700">Q{currentQuarter}</div>
                    </div>
                    <div className="text-4xl font-bold text-slate-700 mb-2">{renderScore(avgTeamScore)}%</div>
                    <p className="text-slate-700-variant text-sm">Weighted score across all employees.</p>
                </div>

                <div className="bg-surface-container p-6 rounded-3xl border border-outline shadow-sm overflow-hidden animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm uppercase tracking-widest text-slate-700-variant">Goals On Track</div>
                        <span className="text-sm font-semibold text-tertiary">Real-time</span>
                    </div>
                    <div className="text-4xl font-bold text-slate-700 mb-2">{totalOnTrack}</div>
                    <p className="text-slate-700-variant text-sm">Achievements tagged as on track.</p>
                </div>

                <div className="bg-surface-container p-6 rounded-3xl border border-outline shadow-sm overflow-hidden animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm uppercase tracking-widest text-slate-700-variant">Goals Completed</div>
                        <span className="text-sm font-semibold text-success">Finished</span>
                    </div>
                    <div className="text-4xl font-bold text-slate-700 mb-2">{totalCompleted}</div>
                    <p className="text-slate-700-variant text-sm">Achievements with completed status.</p>
                </div>

                <div className="bg-surface-container p-6 rounded-3xl border border-outline shadow-sm overflow-hidden animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm uppercase tracking-widest text-slate-700-variant">Check-in Rate</div>
                        <span className="text-sm font-semibold text-warning">Manager</span>
                    </div>
                    <div className="text-4xl font-bold text-slate-700 mb-2">{round(checkinRate)}%</div>
                    <p className="text-slate-700-variant text-sm">Employees with manager comments this quarter.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
                <div className="lg:col-span-2 bg-surface-container p-6 rounded-3xl border border-outline shadow-sm animate-fade-in">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-700">Quarter-on-Quarter Performance</h2>
                            <p className="text-slate-700-variant text-sm">Employee score trend by quarter.</p>
                        </div>
                        <div className="text-xs uppercase tracking-[0.24em] text-slate-700-variant">Scores capped at 150%</div>
                    </div>
                    <div className="w-full min-w-0 overflow-hidden">
                        <div className="h-[420px] w-full min-h-[420px]">
                            <ResponsiveContainer width="100%" height={420} minWidth={300} style={{ minWidth: 300, minHeight: 420 }}>
                                <BarChart
                                    data={quarterTrendData.map(d => {
                                        const nd = { ...d };
                                        employeeKeys.forEach(e => {
                                            if (nd[e.key] !== undefined) nd[e.key] = Math.min(nd[e.key], 150);
                                        });
                                        return nd;
                                    })}
                                    margin={{ top: 20, right: 14, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid stroke="#E5E7EB" vertical={false} />
                                    <XAxis dataKey="quarter" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 150]} tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ background: '#ffffff', border: '1px solid #E5E7EB', color: '#111827' }} />
                                    <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                                    {employeeKeys.map((employee) => (
                                        <Bar key={employee.key} dataKey={employee.key} name={employee.name} fill={employee.color} radius={[8, 8, 0, 0]} minPointSize={6} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-container p-6 rounded-3xl border border-outline shadow-sm animate-fade-in">
                    <h2 className="text-xl font-semibold text-slate-700 mb-3">Quarterly Score Radar</h2>
                    <p className="text-slate-700-variant text-sm mb-6">Average team performance across quarters.</p>
                    <div className="w-full min-w-0 overflow-hidden">
                        <div className="h-[320px] w-full min-h-[320px]">
                            <ResponsiveContainer width="100%" height={320} minWidth={300} style={{ minWidth: 300, minHeight: 320 }}>
                                <RadarChart data={radarData.map(d => ({ ...d, score: Math.min(d.score, 150) }))} outerRadius="80%">
                                    <PolarGrid stroke="#E5E7EB" />
                                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                                    <Radar name="Average Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                    <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
                <div className="bg-surface-container p-6 rounded-3xl border border-outline shadow-sm animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-700">Goals by Thrust Area</h2>
                            <p className="text-slate-700-variant text-sm">Distribution of goals grouped by thrust area.</p>
                        </div>
                    </div>
                    <div className="w-full min-w-0 overflow-hidden" style={{ minWidth: 300, minHeight: 360 }}>
                        <div className="h-[360px] w-full min-h-[360px]">
                            <ResponsiveContainer width="100%" height={360} minWidth={300} minHeight={360}>
                                <PieChart>
                                    <Pie data={uiThrustAreaData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={120} paddingAngle={4} labelLine={false} label={({ percent, name }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {uiThrustAreaData.map((entry, index) => (
                                            <Cell key={entry.name} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ color: '#cbd5e1' }} />
                                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #E5E7EB', color: '#111827' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-container p-6 rounded-3xl border border-outline shadow-sm animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-700">UoM Type Distribution</h2>
                            <p className="text-slate-700-variant text-sm">How goals are measured across the organization.</p>
                        </div>
                    </div>
                    <div className="w-full min-w-0 overflow-hidden" style={{ minWidth: 300, minHeight: 360 }}>
                        <div className="h-[360px] w-full min-h-[360px]">
                            <ResponsiveContainer width="100%" height={360} minWidth={300} minHeight={360}>
                                <PieChart>
                                    <Pie data={uiUomData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={110} paddingAngle={4} label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}>
                                        {uiUomData.map((entry, index) => (
                                            <Cell key={entry.name} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: '#cbd5e1', paddingLeft: 24 }} />
                                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #E5E7EB', color: '#111827' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-surface-container p-6 rounded-3xl border border-outline shadow-sm animate-fade-in">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-700">Achievement Status by Employee</h2>
                        <p className="text-slate-700-variant text-sm">Current quarter achievement status counts per employee.</p>
                    </div>
                </div>
                <div className="w-full min-w-0 overflow-hidden" style={{ minWidth: 300, minHeight: 420 }}>
                    <div className="h-[420px] w-full min-h-[420px]">
                        <ResponsiveContainer width="100%" height={420} minWidth={300} minHeight={420} style={{ minWidth: 300, minHeight: 420 }}>
                            <BarChart data={statusData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                                <CartesianGrid stroke="#E5E7EB" vertical={false} />
                                <XAxis dataKey="employee" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={80} />
                                <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #E5E7EB', color: '#111827' }} />
                                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                                <Bar dataKey="notStarted" stackId="status" name="Not Started" fill={STATUS_COLORS.notStarted} />
                                <Bar dataKey="onTrack" stackId="status" name="On Track" fill={STATUS_COLORS.onTrack} />
                                <Bar dataKey="completed" stackId="status" name="Completed" fill={STATUS_COLORS.completed} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-surface-container p-6 rounded-3xl border border-outline shadow-sm animate-fade-in">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-700">Employee Score Leaderboard — Q{currentQuarter}</h2>
                        <p className="text-slate-700-variant text-sm">Ranked weighted score performance for the current quarter.</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-3">
                        <thead>
                            <tr className="text-left text-xs uppercase tracking-[0.24em] text-slate-700-variant">
                                <th className="px-4 py-3">Rank</th>
                                <th className="px-4 py-3">Employee</th>
                                <th className="px-4 py-3">Department</th>
                                <th className="px-4 py-3">Goals Updated</th>
                                <th className="px-4 py-3">Score</th>
                                <th className="px-4 py-3">Progress</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboardData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-700-variant">No leaderboard data available.</td>
                                </tr>
                            ) : (
                                leaderboardData.map((row) => (
                                    <tr key={row.name} className="bg-surface-container-lowest border-b border-outline rounded-3xl mb-3">
                                        <td className="px-4 py-4 align-top font-bold text-slate-700">{getMedal(row.rank)}</td>
                                        <td className="px-4 py-4 align-top">
                                            <div className="font-semibold text-slate-700">{row.name}</div>
                                        </td>
                                        <td className="px-4 py-4 align-top text-slate-700-variant">{row.department}</td>
                                        <td className="px-4 py-4 align-top">{row.goalsUpdated}</td>
                                        <td className="px-4 py-4 align-top font-bold text-slate-700">{renderScore(row.score)}%</td>
                                        <td className="px-4 py-4 align-top">
                                            <div className="h-3 rounded-full bg-surface-variant overflow-hidden">
                                                {(() => {
                                                    const numericScore = Number(row.score) || 0;
                                                    const displayedScore = Math.min(numericScore, 150);
                                                    const barWidthScore = Math.max(0, Math.min(numericScore, 100));
                                                    const width = barWidthScore > 0 ? `${barWidthScore}%` : '8px';
                                                    const color = displayedScore >= 100 ? '#10b981' : displayedScore >= 50 ? '#f59e0b' : '#ef4444';
                                                    return (
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width,
                                                                minWidth: barWidthScore === 0 ? '8px' : undefined,
                                                                backgroundColor: color,
                                                                transition: 'width 0.3s ease'
                                                            }}
                                                            role="progressbar"
                                                            aria-valuenow={displayedScore}
                                                            aria-valuemin={0}
                                                            aria-valuemax={150}
                                                        />
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
