import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Cpu, Zap, Layers, TrendingUp, ShieldCheck, Target, BrainCircuit, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

// --- 数据源 (Data Source) ---
const rawFundReturns = [
0.010794571,
0.00136008,
-0.01565651,
-0.009011687,
0.005980961,
-0.01246752,
0.016134185,
-0.00643213,
-0.010847282,
0.011898728,
0.001982175,
0.002461162,
-0.003415861,
-0.000284264,
-0.016019946,
0.019496638,
-0.009818599,
-0.022947184,
0.01847514,
0.018629182,
0.000298464,
0.001510568,
0.005770743,
0.00478983,
0.004407318,
-0.001207895,
-0.012165951,
0.006663809,
0.009295205,
-0.004392763,
0.015290084,
0.01010452,
0.000026323,
0.006033966,
0.004400491,
-0.006440722,
0.016632665,
-0.004172409,
0.010212889,
-0.012822918,
-0.008588239,
-0.004820468,
-0.040996288,
0.012387074,
0.018220394,
-0.005402742,
0.007253194,
0.014349296
];

const rawBenchmarkReturns = [
0.016131936,
0.004236296,
-0.010840629,
-0.008395546,
0.004281493,
-0.014276896,
0.013883436,
-0.006118635,
-0.015474473,
0.008385388,
0.003233507,
0.006368583,
-0.006916136,
-0.00192141,
-0.015754131,
0.016967793,
-0.012316818,
-0.028550167,
0.014314977,
0.019329618,
-0.003720809,
-0.002165474,
0.009406272,
0.009442216,
0.001723849,
0.003042906,
-0.015056136,
0.010535981,
0.00773905,
-0.00857163,
0.007733114,
0.006012935,
-0.00400481,
0.006138359,
0.00400273,
-0.006841693,
0.012271911,
-0.006597754,
0.006287019,
-0.013187574,
-0.014141665,
-0.008307275,
-0.039852875,
0.018576629,
0.017487647,
-0.003375157,
0.003126839,
0.013261574
];
// --- 静态数据：研发实力内容 ---
const RESEARCH_DATA = [
  {
    id: 'depth',
    title: '深度 DEPTH',
    subtitle: '深度学习 + LLM 双引擎',
    icon: BrainCircuit,
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'group-hover:border-cyan-500/50',
    description: '摒弃传统线性回归，采用 Transformer 架构挖掘非线性市场规律。前华为 AI 专家领衔，将 NLP 领域的 Attention 机制引入量化交易，在海量数据噪音中精准定位 Alpha。',
    tags: ['Transformer架构', '非线性因子挖掘', '大模型预测', '华为AI团队']
  },
  {
    id: 'width',
    title: '宽度 WIDTH',
    subtitle: '全链路极致优化',
    icon: Layers,
    color: 'from-purple-500 to-pink-500',
    borderColor: 'group-hover:border-purple-500/50',
    description: '从数据清洗、因子挖掘到组合优化，每一行代码都经过系统级调优。覆盖全市场 5000+ 标的，多周期多策略并行，捕捉每一个微小机会，不放过任何市场异动。',
    tags: ['OS内核级调优', '全市场覆盖', '数据实时清洗', '多策略并行']
  },
  {
    id: 'speed',
    title: '速度 SPEED',
    subtitle: '毫秒必争的极速体验',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    borderColor: 'group-hover:border-yellow-500/50',
    description: '自研高性能网络协议栈，旁路内核直接处理数据包。关键算子汇编级优化，配合 FPGA 硬件加速，确保在极端行情下依然快人一步，降低滑点损耗。',
    tags: ['低延迟FPGA', '算子汇编优化', '高性能网络栈', '极速交易网关']
  }
];

// --- 工具函数 ---
const calculateCumulativeData = () => {
  let fundCum = 1;
  let benchCum = 1;
  return rawFundReturns.map((fundRet, index) => {
    const benchRet = rawBenchmarkReturns[index];
    fundCum = fundCum * (1 + fundRet);
    benchCum = benchCum * (1 + benchRet);
    return {
      name: `T+${index + 1}`,
      fundRaw: (fundCum - 1) * 100,
      benchRaw: (benchCum - 1) * 100,
      excessRaw: ((fundCum - 1) - (benchCum - 1)) * 100
    };
  });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 border border-slate-700 p-4 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <p className="text-slate-500 text-xs mb-2 font-mono">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-6 mb-1">
            <span className="text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{backgroundColor: entry.color}}/>
              {entry.name === 'fundRaw' ? '长添一号' : entry.name === 'benchRaw' ? '中证2000' : '超额收益'}
            </span>
            <span className="text-sm font-bold font-mono text-white">
              {entry.value > 0 ? '+' : ''}{entry.value.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const MetricCard = ({ title, value, subValue, highlight = false, icon: Icon, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6, type: "spring" }}
    whileHover={{ y: -5, scale: 1.02 }}
    className={`relative overflow-hidden rounded-2xl p-6 border group transition-all duration-300 ${
      highlight 
        ? 'bg-gradient-to-br from-red-950/30 to-slate-900/80 border-red-500/30 hover:border-red-500/60 shadow-[0_0_30px_rgba(220,38,38,0.1)]' 
        : 'bg-slate-900/40 border-white/5 hover:border-white/20'
    }`}
  >
    {highlight && (
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/20 blur-[50px] rounded-full group-hover:bg-red-600/30 transition-all duration-500"></div>
    )}
    <div className="flex justify-between items-start mb-4 relative z-10">
      <span className="text-slate-400 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
        {title}
      </span>
      {Icon && <Icon className={`w-5 h-5 ${highlight ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-slate-600'}`} />}
    </div>
    <div className={`text-4xl md:text-5xl font-bold tracking-tighter mb-2 font-mono ${highlight ? 'text-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-emerald-400'}`}>
      {value}
    </div>
    {subValue && (
      <div className="text-sm text-slate-500 font-medium relative z-10">
        {subValue}
      </div>
    )}
  </motion.div>
);

// --- 优化后的研发实力板块：滚动浏览模式 ---
const ResearchSection = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 flex flex-col gap-12">
      {RESEARCH_DATA.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={`group relative bg-slate-900/40 border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden hover:bg-slate-900/60 transition-all duration-500 ${item.borderColor}`}
        >
           {/* 背景动态光效 */}
           <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br ${item.color} opacity-5 blur-[120px] rounded-full pointer-events-none group-hover:opacity-15 transition-opacity duration-700`} />
           
           <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
             {/* 左侧：图标与标题 */}
             <div className="lg:w-1/3 flex flex-col items-start relative">
                <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className={`relative p-5 rounded-2xl bg-black/40 border border-white/10 mb-6 group-hover:scale-110 group-hover:border-white/20 transition-all duration-500 shadow-xl`}>
                  <item.icon className="w-12 h-12 text-white" />
                  {/* 小装饰点 */}
                  <div className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-r ${item.color} animate-pulse`} />
                </div>
                
                <h3 className="text-4xl font-black text-white mb-2 tracking-tight italic">
                  {item.title}
                </h3>
                <div className={`h-1.5 w-16 bg-gradient-to-r ${item.color} rounded-full mt-2 group-hover:w-32 transition-all duration-700 ease-out`}></div>
             </div>

             {/* 右侧：详细内容 */}
             <div className="lg:w-2/3">
                <div className="flex items-center gap-3 mb-6">
                   <div className={`px-3 py-1 rounded text-[10px] font-bold tracking-widest bg-white/5 border border-white/10 text-slate-300 uppercase`}>
                      Core Technology
                   </div>
                   <div className="h-px flex-1 bg-white/5 group-hover:bg-white/10 transition-colors" />
                </div>

                <h4 className="text-2xl md:text-3xl font-bold text-slate-100 mb-6 group-hover:text-white transition-colors">
                  {item.subtitle}
                </h4>
                
                <p className="text-slate-400 text-lg leading-relaxed mb-8 border-l-2 border-white/5 pl-6 group-hover:border-white/20 transition-colors">
                  {item.description}
                </p>
                
                <div className="flex flex-wrap gap-3">
                  {item.tags.map((tag, idx) => (
                    <div 
                      key={tag} 
                      className="px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-sm text-slate-300 font-mono flex items-center gap-2 hover:bg-white/5 hover:border-white/20 transition-colors"
                    >
                       <Code2 className="w-3 h-3 text-slate-500" />
                       {tag}
                    </div>
                  ))}
                </div>
             </div>
           </div>
        </motion.div>
      ))}
    </div>
  );
};


export default function ChangtianQuantRoadshow() {
  const chartData = useMemo(() => calculateCumulativeData(), []);
  
  const lastData = chartData[chartData.length - 1];
  const fundTotalReturn = lastData.fundRaw.toFixed(2);
  const benchTotalReturn = lastData.benchRaw.toFixed(2);
  const excessReturn = lastData.excessRaw.toFixed(2);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500/30 overflow-x-hidden">
      
      {/* 全局背景噪点与扫描线 */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_2px,3px_100%] pointer-events-none" />
      </div>

      {/* 导航 */}
      <nav className="fixed w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-red-500 animate-pulse" />
            <span className="font-bold text-lg tracking-wide text-white font-mono">
              CHANGTIAN<span className="text-red-500">.</span>QUANT
            </span>
          </div>
          <button className="bg-white hover:bg-red-600 hover:text-white text-black px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            立即预约路演
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-20 px-6 overflow-hidden z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
        
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-mono mb-8 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            LIVE PERFORMANCE | 实盘业绩持续更新
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-black mb-8 tracking-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500">
              稳定<span className="text-red-600">Alpha</span>
            </span>
            <br />
            <span className="text-4xl md:text-6xl text-slate-400 font-bold mt-2 block">
              AI算法x系统极致性能的力量
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light"
          >
            长添量选一号 · AI驱动 · 显著超额收益
          </motion.p>
        </div>
      </header>

      {/* 核心数据展示 Part 1 */}
      <section className="max-w-7xl mx-auto px-6 mb-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <MetricCard 
            title="收益率曲线 (My Fund)" 
            value={`+${fundTotalReturn}%`} 
            subValue="长添量选一号"
            highlight={true}
            icon={TrendingUp}
            delay={0}
          />
          <MetricCard 
            title="超额收益 (Alpha)" 
            value={`+${excessReturn}%`} 
            subValue="显著跑赢基准"
            highlight={true}
            icon={Target}
            delay={0.1}
          />
          <MetricCard 
            title="同期基准 (Benchmark)" 
            value={`${benchTotalReturn}%`} 
            subValue="中证2000指数"
            highlight={false}
            icon={Activity}
            delay={0.2}
          />
        </div>
        
        {/* 数据标签 */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="flex flex-wrap gap-4 justify-center md:justify-start"
        >
          <div className="px-5 py-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-sm font-medium text-emerald-400 flex items-center shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <ShieldCheck className="w-4 h-4 mr-2" />
            胜率 64%
          </div>
          <div className="px-5 py-2 rounded-lg bg-yellow-950/30 border border-yellow-500/20 text-sm font-medium text-yellow-400 flex items-center shadow-[0_0_10px_rgba(234,179,8,0.1)]">
            <Zap className="w-4 h-4 mr-2" />
            ALpha最大回撤1.36%
          </div>
        </motion.div>
      </section>

      {/* 图表区域 A：累计收益对比 */}
      <section className="max-w-7xl mx-auto px-6 mb-32 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-1 h-8 bg-red-600 rounded-full inline-block"></span>
              净值曲线
            </h2>
            <p className="text-slate-400">
              红色曲线（基金）与灰色曲线（指数）的
              <span className="text-red-400 font-bold mx-1 border-b border-red-500/50">逐步形成扩大的喇叭口</span>
              策略和离线回测高度吻合，累计误差约万分之5。
            </p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="h-[450px] w-full bg-slate-900/30 border border-white/10 rounded-3xl p-4 md:p-8 backdrop-blur-sm relative overflow-hidden group"
        >
           {/* 图表背景光效 */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-red-500/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFund" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" stroke="#555" tick={{fontSize: 12, fill: '#666'}} minTickGap={30} />
              <YAxis stroke="#555" tick={{fontSize: 12, fill: '#666'}} tickFormatter={(val) => `${val}%`} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ef4444', strokeWidth: 1, strokeDasharray: '4 4' }} />
              
              <Area 
                type="monotone" 
                dataKey="benchRaw" 
                stroke="#475569" 
                strokeWidth={2} 
                strokeDasharray="4 4"
                fill="transparent" 
                name="benchRaw"
                isAnimationActive={true}
                animationDuration={2000}
              />
              
              <Area 
                type="monotone" 
                dataKey="fundRaw" 
                stroke="#dc2626" 
                strokeWidth={3} 
                fill="url(#colorFund)" 
                name="fundRaw"
                isAnimationActive={true}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </section>

      {/* 图表区域 B：超额收益曲线 */}
      <section className="max-w-7xl mx-auto px-6 mb-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <h2 className="text-3xl font-bold text-white mb-6">上行的Alpha</h2>
            <div className="w-full h-px bg-white/10 mb-6" />
            <p className="text-slate-400 leading-relaxed mb-8">
              剔除大盘贝塔波动后，是一条稳步上升的Alpha曲线。
              <br/><br/>
              <span className="text-white font-medium">大盘上涨和下跌阶段均有Alpha。</span>
              在每日的波动中积累微小的胜利，最终汇聚成可观的复利。
            </p>
            <div className="p-6 rounded-xl bg-slate-900 border border-red-500/20">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Total Excess Return</div>
              <div className="text-5xl font-bold text-white font-mono">
                +{excessReturn}<span className="text-xl text-red-500 ml-1">%</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             className="lg:col-span-2 h-[350px] bg-gradient-to-br from-slate-900/50 to-black border border-white/10 rounded-3xl p-6 shadow-2xl"
          >
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis orientation="right" stroke="#444" tick={{fontSize: 12}} tickFormatter={(val) => `${val}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="excessRaw" 
                  stroke="#ef4444" 
                  strokeWidth={4} 
                  dot={false}
                  activeDot={{ r: 8, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={2500}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>

      {/* Part 2: 滚动式研发实力展示 */}
      <section className="bg-black py-32 relative overflow-hidden border-t border-white/5">
        {/* 背景网格动画 */}
        <div className="absolute inset-0 z-0 opacity-20">
             <div className="absolute w-full h-full bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              研发实力强大
            </motion.h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              核心团队全部毕业于北大、浙大，具有多年的华为人工智能和系统工程的丰富研发经验，在量化策略算法研发和深度系统优化上具有深厚功底。
            </p>
          </div>

          <ResearchSection />

        </div>
      </section>

      {/* 底部 Footer */}
      <footer className="py-16 px-6 border-t border-white/10 bg-black text-center relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center gap-3 mb-8">
            <div className="h-px w-10 bg-slate-700"></div>
            <span className="text-slate-500 text-sm font-semibold tracking-[0.2em] uppercase">Changtian Quant</span>
            <div className="h-px w-10 bg-slate-700"></div>
          </div>
          <p className="text-slate-600 text-xs max-w-2xl mx-auto leading-loose">
            风险提示：本页面展示数据仅为历史回测或实盘记录，不代表未来收益承诺。
            <br />
            金融市场有风险，投资需谨慎。
            <br />
            © 2024 长添量化 All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

