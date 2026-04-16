import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { time: "00:00", threats: 2, scans: 45, blocked: 2 },
  { time: "04:00", threats: 1, scans: 22, blocked: 1 },
  { time: "08:00", threats: 5, scans: 89, blocked: 4 },
  { time: "12:00", threats: 8, scans: 156, blocked: 7 },
  { time: "16:00", threats: 12, scans: 203, blocked: 11 },
  { time: "20:00", threats: 6, scans: 134, blocked: 5 },
  { time: "Now", threats: 3, scans: 67, blocked: 3 },
];

export default function ActivityChart() {
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="font-display text-sm text-foreground tracking-wider mb-4">24H ACTIVITY</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 100%, 45%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(160, 100%, 45%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 14%)" />
            <XAxis dataKey="time" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: 'hsl(220, 18%, 7%)',
                border: '1px solid hsl(220, 15%, 14%)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'hsl(210, 20%, 92%)',
              }}
            />
            <Area type="monotone" dataKey="scans" stroke="hsl(160, 100%, 45%)" fill="url(#colorScans)" strokeWidth={2} />
            <Area type="monotone" dataKey="threats" stroke="hsl(0, 85%, 55%)" fill="url(#colorThreats)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
