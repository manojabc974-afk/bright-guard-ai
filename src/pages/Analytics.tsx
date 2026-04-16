import { motion } from "framer-motion";
import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart as RPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

const weeklyData = [
  { day: "Mon", scans: 320, threats: 12, blocked: 11 },
  { day: "Tue", scans: 450, threats: 18, blocked: 17 },
  { day: "Wed", scans: 380, threats: 8, blocked: 8 },
  { day: "Thu", scans: 520, threats: 25, blocked: 23 },
  { day: "Fri", scans: 610, threats: 31, blocked: 30 },
  { day: "Sat", scans: 280, threats: 6, blocked: 6 },
  { day: "Sun", scans: 190, threats: 4, blocked: 4 },
];

const threatTypes = [
  { name: "Phishing", value: 45, color: "hsl(0, 85%, 55%)" },
  { name: "Malware", value: 25, color: "hsl(38, 95%, 55%)" },
  { name: "Suspicious", value: 20, color: "hsl(280, 80%, 60%)" },
  { name: "Zero-Day", value: 10, color: "hsl(200, 100%, 50%)" },
];

const radarData = [
  { subject: "Phishing", A: 97 },
  { subject: "Malware", A: 89 },
  { subject: "Ransomware", A: 85 },
  { subject: "APT", A: 78 },
  { subject: "Zero-Day", A: 88 },
  { subject: "Social Eng.", A: 92 },
];

const tooltipStyle = {
  contentStyle: { background: 'hsl(220, 18%, 7%)', border: '1px solid hsl(220, 15%, 14%)', borderRadius: '8px', fontSize: '12px', color: 'hsl(210, 20%, 92%)' },
};

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold tracking-wider">ADVANCED ANALYTICS</h1>
        <p className="text-sm text-muted-foreground mt-1">Deep insights into threat patterns & system performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Detection Rate", value: "99.2%", icon: TrendingUp, change: "+0.3%" },
          { label: "Avg Response", value: "12ms", icon: Activity, change: "-2ms" },
          { label: "False Positives", value: "0.8%", icon: PieChart, change: "-0.1%" },
          { label: "Model Accuracy", value: "97.3%", icon: BarChart3, change: "+0.5%" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground font-display tracking-wider">{stat.label}</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-primary mt-1">{stat.change} this week</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <h3 className="font-display text-sm tracking-wider mb-4">WEEKLY SCAN ACTIVITY</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 14%)" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 10 }} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="scans" fill="hsl(160, 100%, 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="threats" fill="hsl(0, 85%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="font-display text-sm tracking-wider mb-4">THREAT DISTRIBUTION</h3>
          <div className="h-56 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie data={threatTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {threatTypes.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </RPieChart>
            </ResponsiveContainer>
            <div className="space-y-2 min-w-[120px]">
              {threatTypes.map((t) => (
                <div key={t.name} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                  <span className="text-xs text-muted-foreground">{t.name}</span>
                  <span className="text-xs font-display text-foreground ml-auto">{t.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="font-display text-sm tracking-wider mb-4">MODEL DETECTION CAPABILITY</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220, 15%, 14%)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 10 }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar name="Accuracy" dataKey="A" stroke="hsl(160, 100%, 45%)" fill="hsl(160, 100%, 45%)" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="font-display text-sm tracking-wider mb-4">BLOCKED THREATS TREND</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="blocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(200, 100%, 50%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(200, 100%, 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 14%)" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 10 }} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="blocked" stroke="hsl(200, 100%, 50%)" fill="url(#blocked)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
