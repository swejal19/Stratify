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
import { calculateGoalScore, getCurrentQuarter } from '../../utils/achievementUtils';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
const STATUS_COLORS = {
    notStarted: '#ef4444',
    onTrack: '#f59e0b',
    completed: '#10b981'
};
const UOM_LABELS = {
    numeric_min: 'Higher is Better',
    numeric_max: 'Lower is Better',
    timeline: 'Date-based',
    zero: 'Zero = Success'
};

const getScoreColorClass = (score) => {
    if (score >= 80) return 'bg-success';
    if (score >= 50) return 'bg-warning';
    return 'bg-error';
};

const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
};

const round = (value) => Number.isFinite(value) ? Math.round(value) : 0;

export const AdminAnalytics = () => {
    const { data: cycle, isLoading: cycleLoading } = useActiveCycle();
    const { data: reportData, isLoading: dataLoading } = useReportData(cycle?.id);
    const isLoading = cycleLoading || dataLoading;
    const currentQuarterInfo = getCurrentQuarter(cycle);
    const currentQuarter = currentQuarterInfo.quarter;

    const {
        employees,
        quarterTrendData,
        thrustAreaData,
        uomData,
        statusData,
        leaderboardData,
        avgTeamScore,
        totalOnTrack,
        totalCompleted,
        checkinRate,
        radarData
    } = useMemo(() => {
    if (!reportData || !cycle) {
        return {
            employees: [],
            quarterTrendData: [],
            thrustAreaData: [],
            uomData: [],
            statusData: [],
            leaderboardData: [],
            avgTeamScore: 0,
            totalOnTrack: 0,
            totalCompleted: 0,
            checkinRate: 0,
            radarData: []
        };
    }

    const profiles = reportData.profiles || [];
    const sheets = reportData.sheets || [];
    const goals = reportData.goals || [];
    const achievements = reportData.achievements || [];

    const employees = profiles.filter((profile) => profile.role === 'employee');
    const sheetByEmployee = Object.fromEntries(sheets.map((sheet) => [sheet.employee_id, sheet]));
    const goalById = Object.fromEntries(goals.map((goal) => [goal.id, goal]));
    const achievementByGoal = achievements.reduce((acc, achievement) => {
        const goalList = acc[achievement.goal_id] || [];
        goalList.push(achievement);
        acc[achievement.goal_id] = goalList;
        return acc;
    }, {});

    const employeeStats = employees.map((employee) => {
        const sheet = sheetByEmployee[employee.id];
        const employeeGoals = sheet ? goals.filter((goal) => goal.sheet_id === sheet.id) : [];

        const quarterScores = [1, 2, 3, 4].map((quarter) => {
            const score = employeeGoals.reduce((total, goal) => {
                const achievement = (achievementByGoal[goal.id] || []).find((item) => Number(item.quarter) === quarter);
                if (!achievement) return total;
                const rawScore = calculateGoalScore(
                    goal.uom,
                    goal.target,
                    goal.target_date,
                    achievement.actual,
                    achievement.actual_date,
                    achievement.actual === 0
                );
                return total + (Number(goal.weightage || 0) / 100) * Math.min(rawScore, 100);
            }, 0);
            return round(score);
        });

        const currentAchievements = employeeGoals.flatMap((goal) =>
            (achievementByGoal[goal.id] || []).filter((item) => Number(item.quarter) === currentQuarter)
        );
        const currentWeightedScore = quarterScores[currentQuarter - 1] || 0;
        const goalsUpdated = currentAchievements.length;

        const statusCounts = currentAchievements.reduce(
            (counts, achievement) => {
                const status = achievement.status;
                if (status === 'completed') counts.completed += 1;
                else if (status === 'on_track') counts.onTrack += 1;
                else counts.notStarted += 1;
                return counts;
            },
            { notStarted: 0, onTrack: 0, completed: 0 }
        );

        return {
            ...employee,
            sheet,
            quarterScores,
            currentWeightedScore,
            goalsUpdated,
            statusCounts
        };
    });

    const employeeKeys = employeeStats.map((employee, index) => ({
        key: `emp_${employee.id}`,
        name: employee.full_name,
        color: COLORS[index % COLORS.length]
    }));

    const quarterTrendData = [1, 2, 3, 4].map((quarter) => {
        const item = {
            quarter: `Q${quarter}`,
            totalScore: 0,
            employeeCount: employees.length
        };
        employeeStats.forEach((employee) => {
            const score = employee.quarterScores[quarter - 1] || 0;
            item[`emp_${employee.id}`] = score;
            item.totalScore += score;
        });
        return item;
    });

    const thrustAreaMap = {};
    goals.forEach((goal) => {
        const area = goal.thrust_area || 'Unspecified';
        thrustAreaMap[area] = (thrustAreaMap[area] || 0) + 1;
    });
    const thrustAreaData = Object.entries(thrustAreaMap).map(([area, count], index) => ({
        name: area,
        value: count,
        fill: COLORS[index % COLORS.length]
    }));

    const uomMap = {};
    goals.forEach((goal) => {
        const label = UOM_LABELS[goal.uom] || goal.uom;
        uomMap[label] = (uomMap[label] || 0) + 1;
    });
    const uomData = Object.entries(uomMap).map(([name, value], index) => ({
        name,
        value,
        fill: COLORS[index % COLORS.length]
    }));

    const statusData = employeeStats.map((employee) => ({
        employee: employee.full_name,
        notStarted: employee.statusCounts.notStarted,
        onTrack: employee.statusCounts.onTrack,
        completed: employee.statusCounts.completed
    }));

    const leaderboardData = [...employeeStats]
        .sort((a, b) => b.currentWeightedScore - a.currentWeightedScore)
        .map((employee, index) => ({
            rank: index + 1,
            medal: getMedal(index + 1),
            name: employee.full_name,
            department: employee.department || 'N/A',
            goalsUpdated: employee.goalsUpdated,
            score: employee.currentWeightedScore
        }));

    const avgTeamScore = employees.length > 0
        ? employeeStats.reduce((sum, employee) => sum + employee.currentWeightedScore, 0) / employees.length
        : 0;

    const totalOnTrack = achievements.filter((achievement) => achievement.status === 'on_track').length;
    const totalCompleted = achievements.filter((achievement) => achievement.status === 'completed').length;
    const employeesWithComments = new Set(
        achievements
            .filter(
                (achievement) => Number(achievement.quarter) === currentQuarter && achievement.manager_comment !== null
            )
            .flatMap((achievement) => {
                const goal = goalById[achievement.goal_id];
                const sheet = sheets.find((item) => item.id === goal?.sheet_id);
                return sheet ? [sheet.employee_id] : [];
            })
            .filter(Boolean)
    );
    const checkinRate = employees.length > 0
        ? (employeesWithComments.size / employees.length) * 100
        : 0;

    const radarData = quarterTrendData.map((item) => ({
        metric: item.quarter,
        score: item.employeeCount > 0 ? round(item.totalScore / item.employeeCount) : 0
    }));

    return {
        employees: employeeStats,
        quarterTrendData,
        thrustAreaData,
        uomData,
        statusData,
        leaderboardData,
        avgTeamScore,
        totalOnTrack,
        totalCompleted,
        checkinRate,
        radarData,
        employeeKeys
    };
}, [reportData, cycle, currentQuarter]);

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
            <div className="bg-surface-container p-10 rounded-3xl border border-white/10 text-center">
                <h2 className="text-2xl font-bold text-on-surface">No Active Cycle</h2>
                <p className="text-on-surface-variant mt-3">Analytics requires an active cycle to display current performance.</p>
            </div>
        </div>
    );
}

const employeeKeys = (reportData?.profiles || [])
    .filter((profile) => profile.role === 'employee')
    .map((employee, index) => ({
        key: `emp_${employee.id}`,
        name: employee.full_name,
        color: COLORS[index % COLORS.length]
    }));

return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-fade-in relative">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
                <h1 className="text-3xl font-display-md font-bold text-on-surface">Analytics</h1>
                <p className="text-on-surface-variant mt-1">Goal performance insights across your organization.</p>
            </div>
            <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Active Cycle: {cycle.name}
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="bg-surface-container p-6 rounded-3xl border border-white/5 shadow-sm overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm uppercase tracking-widest text-on-surface-variant">Avg Team Score</div>
                    <div className="text-sm font-semibold text-on-surface">Q{currentQuarter}</div>
                </div>
                <div className="text-4xl font-bold text-on-surface mb-2">{round(avgTeamScore)}%</div>
                <p className="text-on-surface-variant text-sm">Weighted score across all employees.</p>
            </div>

            <div className="bg-surface-container p-6 rounded-3xl border border-white/5 shadow-sm overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm uppercase tracking-widest text-on-surface-variant">Goals On Track</div>
                    <span className="text-sm font-semibold text-tertiary">Real-time</span>
                </div>
                <div className="text-4xl font-bold text-on-surface mb-2">{totalOnTrack}</div>
                <p className="text-on-surface-variant text-sm">Achievements tagged as on track.</p>
            </div>

            <div className="bg-surface-container p-6 rounded-3xl border border-white/5 shadow-sm overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm uppercase tracking-widest text-on-surface-variant">Goals Completed</div>
                    <span className="text-sm font-semibold text-success">Finished</span>
                </div>
                <div className="text-4xl font-bold text-on-surface mb-2">{totalCompleted}</div>
                <p className="text-on-surface-variant text-sm">Achievements with completed status.</p>
            </div>

            <div className="bg-surface-container p-6 rounded-3xl border border-white/5 shadow-sm overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm uppercase tracking-widest text-on-surface-variant">Check-in Rate</div>
                    <span className="text-sm font-semibold text-warning">Manager</span>
                </div>
                <div className="text-4xl font-bold text-on-surface mb-2">{round(checkinRate)}%</div>
                <p className="text-on-surface-variant text-sm">Employees with manager comments this quarter.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
            <div className="lg:col-span-2 bg-surface-container p-6 rounded-3xl border border-white/5 shadow-sm animate-fade-in">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-on-surface">Quarter-on-Quarter Performance</h2>
                        <p className="text-on-surface-variant text-sm">Employee score trend by quarter.</p>
                    </div>
                    <div className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">Scores capped at 100%</div>
                </div>
                <div className="w-full min-w-0 overflow-hidden">
                    <div className="h-[420px] w-full min-h-[420px]">

                        <ResponsiveContainer width="100%" height={420} minWidth={300} style={{ minWidth: 300, minHeight: 420 }}>
                            <BarChart
                                data={quarterTrendData}
                                margin={{ top: 20, right: 14, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />

                                <XAxis
                                    dataKey="quarter"
                                    tick={{ fill: '#cbd5e1', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fill: '#cbd5e1', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                                    contentStyle={{
                                        background: '#111827',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: '#f8fafc'
                                    }}
                                />

                                <Legend wrapperStyle={{ color: '#cbd5e1' }} />

                                {employeeKeys.map((employee) => (
                                    <Bar
                                        key={employee.key}
                                        dataKey={employee.key}
                                        name={employee.name}
                                        fill={employee.color}
                                        radius={[8, 8, 0, 0]}
                                        minPointSize={6}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>

                    </div>
                </div>
            </div>

            <div className="bg-surface-container p-6 rounded-3xl border border-white/5 shadow-sm animate-fade-in">
                <h2 className="text-xl font-semibold text-on-surface mb-3">Quarterly Score Radar</h2>
                <p className="text-on-surface-variant text-sm mb-6">Average team performance across quarters.</p>
                <div className="w-full min-w-0 overflow-hidden">
                    <div className="h-[320px] w-full min-h-[320px]">
                    <ResponsiveContainer width="100%" height={320} minWidth={300} style={{ minWidth: 300, minHeight: 320 }}>
                        <RadarChart data={radarData} outerRadius="80%">
                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
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
            <div className="bg-surface-container p-6 rounded-3xl border border-white/5 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-on-surface">Goals by Thrust Area</h2>
                        <p className="text-on-surface-variant text-sm">Distribution of goals grouped by thrust area.</p>
                    </div>
                </div>
                <div className="w-full min-w-0 overflow-hidden" style={{ minWidth: 300, minHeight: 360 }}>
                    <div className="h-[360px] w-full min-h-[360px]">
                    <ResponsiveContainer width="100%" height={360} minWidth={300} minHeight={360}>
                        <PieChart>
                            <Pie
                                data={thrustAreaData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={70}
                                outerRadius={120}
                                paddingAngle={4}
                                labelLine={false}
                                label={({ percent, name }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {thrustAreaData.map((entry, index) => (
                                    <Cell key={entry.name} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ color: '#cbd5e1' }} />
                            <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-surface-container p-6 rounded-3xl border border-white/5 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-on-surface">UoM Type Distribution</h2>
                        <p className="text-on-surface-variant text-sm">How goals are measured across the organization.</p>
                    </div>
                </div>
                <div className="w-full min-w-0 overflow-hidden" style={{ minWidth: 300, minHeight: 360 }}>
                    <div className="h-[360px] w-full min-h-[360px]">
                    <ResponsiveContainer width="100%" height={360} minWidth={300} minHeight={360}>
                        <PieChart>
                            <Pie
                                data={uomData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                outerRadius={110}
                                paddingAngle={4}
                                label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
                            >
                                {uomData.map((entry, index) => (
                                    <Cell key={entry.name} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: '#cbd5e1', paddingLeft: 24 }} />
                            <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-surface-container p-6 rounded-3xl border border-white/5 shadow-sm animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-on-surface">Achievement Status by Employee</h2>
                    <p className="text-on-surface-variant text-sm">Current quarter achievement status counts per employee.</p>
                </div>
            </div>
            <div className="w-full min-w-0 overflow-hidden" style={{ minWidth: 300, minHeight: 420 }}>
                <div className="h-[420px] w-full min-h-[420px]">
                <ResponsiveContainer width="100%" height={420} minWidth={300} minHeight={420} style={{ minWidth: 300, minHeight: 420 }}>
                    <BarChart data={statusData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                        <XAxis dataKey="employee" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={80} />
                        <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc' }} />
                        <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                        <Bar dataKey="notStarted" stackId="status" name="Not Started" fill={STATUS_COLORS.notStarted} />
                        <Bar dataKey="onTrack" stackId="status" name="On Track" fill={STATUS_COLORS.onTrack} />
                        <Bar dataKey="completed" stackId="status" name="Completed" fill={STATUS_COLORS.completed} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            </div>
        </div>

        <div className="bg-surface-container p-6 rounded-3xl border border-white/5 shadow-sm animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-on-surface">Employee Score Leaderboard — Q{currentQuarter}</h2>
                    <p className="text-on-surface-variant text-sm">Ranked weighted score performance for the current quarter.</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                    <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.24em] text-on-surface-variant">
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
                                <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">No leaderboard data available.</td>
                            </tr>
                        ) : (
                            leaderboardData.map((row) => (
                                <tr key={row.name} className="bg-surface-container-lowest border-b border-white/5 rounded-3xl mb-3">
                                    <td className="px-4 py-4 align-top font-bold text-on-surface">{row.medal}</td>
                                    <td className="px-4 py-4 align-top">
                                        <div className="font-semibold text-on-surface">{row.name}</div>
                                    </td>
                                    <td className="px-4 py-4 align-top text-on-surface-variant">{row.department}</td>
                                    <td className="px-4 py-4 align-top">{row.goalsUpdated}</td>
                                    <td className="px-4 py-4 align-top font-bold text-on-surface">{round(row.score)}%</td>
                                    <td className="px-4 py-4 align-top">
                                        <div className="h-3 rounded-full bg-surface-variant overflow-hidden">
                                            {(() => {
                                                const numericScore = Number(row.score) || 0;
                                                const normalizedScore = Math.max(0, Math.min(numericScore, 100));

                                                const width = normalizedScore > 0 ? `${normalizedScore}%` : '8px';
                                                const color = normalizedScore >= 80 ? '#10b981' : normalizedScore >= 50 ? '#f59e0b' : '#ef4444';

                                                return (
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width,
                                                            minWidth: normalizedScore === 0 ? '8px' : undefined,
                                                            backgroundColor: color,
                                                            transition: 'width 0.3s ease'
                                                        }}
                                                        role="progressbar"
                                                        aria-valuenow={normalizedScore}
                                                        aria-valuemin={0}
                                                        aria-valuemax={100}
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
