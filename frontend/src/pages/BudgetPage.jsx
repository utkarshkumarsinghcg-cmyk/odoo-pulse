import { useState } from 'react';
import { useTrips } from '../context/TripContext';
import { mockBudgetOverview } from '../services/mockData';

function DonutChart({ categories, totalSpent }) {
  const total = categories.reduce((s, c) => s + Math.abs(c.amount), 0);
  let cumulative = 0;
  const r = 60, cx = 75, cy = 75, stroke = 22;
  const circumference = 2 * Math.PI * r;
  const segments = categories.map((cat) => {
    const pct = Math.abs(cat.amount) / total;
    const dasharray = pct * circumference;
    const offset = circumference - cumulative * circumference;
    cumulative += pct;
    return { ...cat, dasharray, offset };
  });

  return (
    <svg width={150} height={150} viewBox="0 0 150 150">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#FAF7F2" strokeWidth={stroke} />
      {segments.map((seg, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={seg.color}
          strokeWidth={stroke}
          strokeDasharray={`${seg.dasharray} ${circumference - seg.dasharray}`}
          strokeDashoffset={seg.offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
      <text x={cx} y={cy - 8} textAnchor="middle" className="text-[10px] font-semibold fill-[#8A715F]">
        Total Spent
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="text-[18px] font-black fill-[#2A180C]">
        ${totalSpent.toLocaleString()}
      </text>
    </svg>
  );
}

export default function BudgetPage() {
  const { trips } = useTrips();

  // Dynamic budget calculations
  const totalAllocated = trips.reduce((sum, t) => sum + (t.budget || 0), 0);
  const totalSpent = trips.reduce((sum, t) => sum + (t.spent || 0), 0);
  
  const totalDays = trips.reduce((sum, t) => {
    if (!t.startDate || !t.endDate) return sum;
    const diff = Math.abs(new Date(t.endDate) - new Date(t.startDate));
    return sum + Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }, 0);
  const avgCostPerDay = totalDays > 0 ? Math.round(totalSpent / totalDays) : 0;

  const categoryMap = {
    stay: { name: 'Accommodation & Stays', amount: 0, budget: 5000, color: '#4A2E18', icon: 'hotel' },
    transport: { name: 'Transport & Flights', amount: 0, budget: 4000, color: '#C88A4B', icon: 'flight' },
    activity: { name: 'Activities & Guided Tours', amount: 0, budget: 2500, color: '#8D582A', icon: 'temple_hindu' },
    food: { name: 'Food & Dining', amount: 0, budget: 1500, color: '#A06D3B', icon: 'restaurant' },
    shopping: { name: 'Shopping & Souvenirs', amount: 0, budget: 700, color: '#D4A373', icon: 'shopping_bag' }
  };

  trips.forEach(trip => {
    (trip.days || []).forEach(day => {
      (day.activities || []).forEach(act => {
        const type = (act.category || act.type || '').toLowerCase();
        let key = 'activity';
        if (type.includes('stay') || type.includes('hotel') || type.includes('accommodation')) key = 'stay';
        else if (type.includes('trans') || type.includes('flight') || type.includes('drive')) key = 'transport';
        else if (type.includes('food') || type.includes('dine') || type.includes('restaurant') || type.includes('meal')) key = 'food';
        else if (type.includes('shop')) key = 'shopping';
        
        if (categoryMap[key]) {
          categoryMap[key].amount += Number(act.cost) || 0;
        }
      });
    });
  });

  const budget = {
    totalAllocated,
    totalSpent,
    avgCostPerDay,
    categories: Object.values(categoryMap)
  };

  const remaining = budget.totalAllocated - budget.totalSpent;
  const pct = budget.totalAllocated > 0 ? Math.round((budget.totalSpent / budget.totalAllocated) * 100) : 0;

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-12 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#2A180C] tracking-tight">Trip Budget & Cost Breakdown</h1>
        <p className="text-sm text-[#6B5646] mt-1">
          Monitor your travel expenses across accommodation, transport, meals, and pilgrimage tours.
        </p>
      </div>

      {/* Overbudget Alert Notice (Feature 9 requirement) */}
      {pct > 80 && (
        <div className="mb-6 p-4 rounded-2xl bg-[#FFF5F2] border border-[#F4C2B8] text-[#93000A] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-600 text-xl">warning</span>
            <div>
              <p className="text-xs font-bold">Budget Alert Notice</p>
              <p className="text-xs text-[#7A1F1D]">You have used {pct}% of your allocated travel budget. Consider reviewing shopping & dining costs.</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-red-100 rounded-lg">Action Needed</span>
        </div>
      )}

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Allocated Budget', value: `$${budget.totalAllocated.toLocaleString()}`, icon: 'account_balance_wallet', color: '#4A2E18' },
          { label: 'Total Amount Spent', value: `$${budget.totalSpent.toLocaleString()}`, icon: 'payments', color: '#C88A4B' },
          { label: 'Remaining Balance', value: `$${remaining.toLocaleString()}`, icon: 'savings', color: '#2E6F40' },
          { label: 'Average Cost Per Day', value: `$${budget.avgCostPerDay}`, icon: 'calendar_month', color: '#8D582A' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-3xl p-5 shadow-warm-md border border-[#EADBCE] flex flex-col justify-between">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: `${color}15` }}>
              <span className="material-symbols-outlined text-xl" style={{ color }}>{icon}</span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#2A180C]">{value}</p>
              <p className="text-xs font-semibold text-[#8A715F] mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Donut Chart & Category Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-warm-md border border-[#EADBCE] flex flex-col justify-between">
          <h2 className="text-lg font-bold text-[#2A180C] mb-4">Spending by Category</h2>
          <div className="flex flex-col sm:flex-row items-center gap-6 my-auto">
            <div className="shrink-0">
              <DonutChart categories={budget.categories} totalSpent={budget.totalSpent} />
            </div>
            <div className="flex-1 space-y-2.5 w-full">
              {budget.categories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-[#5A4536] font-medium truncate max-w-[130px]">{cat.name}</span>
                  </div>
                  <span className="font-bold text-[#2A180C]">${cat.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bars by Category (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-warm-md border border-[#EADBCE]">
          <h2 className="text-lg font-bold text-[#2A180C] mb-4">Category Budget Limits</h2>
          <div className="space-y-4">
            {budget.categories.map((cat) => {
              const p = Math.round((cat.amount / cat.budget) * 100);
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[#2A180C]">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm" style={{ color: cat.color }}>{cat.icon}</span>
                      {cat.name}
                    </span>
                    <span className="text-[#8A715F]">
                      ${cat.amount.toLocaleString()} / ${cat.budget.toLocaleString()} ({p}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#FAF7F2] h-2.5 rounded-full overflow-hidden border border-[#EADBCE]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(p, 100)}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Per-trip breakdown table */}
      <div className="bg-white rounded-3xl p-6 shadow-warm-md border border-[#EADBCE]">
        <h2 className="text-lg font-bold text-[#2A180C] mb-4">Budget & Cost Breakdown by Trip</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EADBCE] text-[#8A715F] uppercase font-bold text-[10px] tracking-wider">
                <th className="pb-3 px-3">Trip / Yatra</th>
                <th className="pb-3 px-3">Travel Dates</th>
                <th className="pb-3 px-3">Total Budget</th>
                <th className="pb-3 px-3">Spent</th>
                <th className="pb-3 px-3">Remaining</th>
                <th className="pb-3 px-3">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE]/50">
              {trips.map((trip) => {
                const spent = trip.spent || (trip.days || []).reduce((s, d) => s + (d.activities || []).reduce((a, act) => a + (act.cost || 0), 0), 0);
                const rem = (trip.budget || 0) - spent;
                const p = trip.budget ? Math.round((spent / trip.budget) * 100) : 0;
                return (
                  <tr key={trip.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 px-3 font-bold text-[#2A180C]">{trip.name}</td>
                    <td className="py-3.5 px-3 text-[#6B5646]">{trip.startDate} – {trip.endDate}</td>
                    <td className="py-3.5 px-3 font-bold text-[#2A180C]">${trip.budget?.toLocaleString()}</td>
                    <td className="py-3.5 px-3 font-bold text-[#C88A4B]">${spent.toLocaleString()}</td>
                    <td className={`py-3.5 px-3 font-bold ${rem >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      ${rem.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-[#FAF7F2] h-2 rounded-full border border-[#EADBCE]">
                          <div
                            className="bg-[#4A2E18] h-full rounded-full"
                            style={{ width: `${Math.min(p, 100)}%` }}
                          />
                        </div>
                        <span className="font-bold text-[#4A2E18]">{p}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
