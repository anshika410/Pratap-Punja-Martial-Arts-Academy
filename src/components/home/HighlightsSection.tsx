import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { FiUsers, FiAward, FiClock, FiGlobe, FiBookOpen } from 'react-icons/fi';
import { GiMedal } from 'react-icons/gi';
import { useData } from '../../context/DataContext';

const iconMap: Record<string, React.ComponentType<{ size: number }>> = {
  users: FiUsers,
  award: FiAward,
  clock: FiClock,
  medal: GiMedal,
  globe: FiGlobe,
  book: FiBookOpen,
};

export default function HighlightsSection() {
  const { homeContent } = useData();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  const highlights = Array.isArray(homeContent?.highlights) ? homeContent.highlights : [];

  return (
    <section className="py-20 gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Our Achievements
          </h2>
          <div className="flex justify-center gap-1">
            <span className="w-8 h-1 bg-saffron rounded-full" />
            <span className="w-16 h-1 bg-white rounded-full" />
            <span className="w-8 h-1 bg-india-green rounded-full" />
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {highlights.map((stat, index) => {
            const iconKey = typeof stat?.icon === 'string' ? stat.icon : 'award';
            const IconComponent = iconMap[iconKey] ?? FiAward;
            const value = typeof stat?.value === 'number' ? stat.value : 0;
            const label = typeof stat?.label === 'string' ? stat.label : '';

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="text-saffron mb-3 flex justify-center group-hover:scale-110 transition-transform">
                  <IconComponent size={32} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {inView ? (
                    <CountUp end={value} duration={2.5} suffix="+" />
                  ) : (
                    '0+'
                  )}
                </div>
                <div className="text-white/70 text-sm font-medium">{label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
