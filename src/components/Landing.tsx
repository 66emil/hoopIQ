import React from 'react';
import { BookOpen, Video, Trophy, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';

interface LandingProps {
  onStartLearning: () => void;
}

export const Landing = ({ onStartLearning }: LandingProps) => {
  const { t } = useLocalization();

  const features = [
    { Icon: BookOpen, titleKey: 'landing.feature.theory.title', descKey: 'landing.feature.theory.description' },
    { Icon: Video, titleKey: 'landing.feature.quiz.title', descKey: 'landing.feature.quiz.description' },
    { Icon: Trophy, titleKey: 'landing.feature.progress.title', descKey: 'landing.feature.progress.description' },
    { Icon: Users, titleKey: 'landing.feature.levels.title', descKey: 'landing.feature.levels.description' },
    { Icon: TrendingUp, titleKey: 'landing.feature.why.title', descKey: 'landing.feature.why.description' },
  ];

  const benefits = [
    { titleKey: 'landing.benefits.improve.title', descKey: 'landing.benefits.improve.description' },
    { titleKey: 'landing.benefits.thinking.title', descKey: 'landing.benefits.thinking.description' },
    { titleKey: 'landing.benefits.schemes.title', descKey: 'landing.benefits.schemes.description' },
    { titleKey: 'landing.benefits.iq.title', descKey: 'landing.benefits.iq.description' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto rise">
          <h1 className="text-display text-5xl md:text-7xl mb-4" style={{ color: 'var(--accent)' }}>
            {t('landing.hero.title1')}
          </h1>
          <h2 className="text-display text-4xl md:text-6xl mb-8">
            {t('landing.hero.title2')}
          </h2>
          <p className="text-xl md:text-2xl muted-2 mb-12 leading-relaxed max-w-2xl mx-auto">
            {t('landing.hero.subtitle')}
          </p>

          <div className="card p-8 mb-16 text-center">
            <h3 className="text-display text-2xl mb-4" style={{ color: 'var(--accent)' }}>
              {t('landing.features.title')}
            </h3>
            <p className="muted-2 text-lg">{t('landing.features.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto rise-stagger">
          {features.map(({ Icon, titleKey, descKey }) => (
            <div key={titleKey} className="card p-6">
              <span className="icon-soft lg mb-4 block">
                <Icon size={26} />
              </span>
              <h3 className="font-display text-xl mb-3">{t(titleKey)}</h3>
              <p className="muted-2">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-display text-3xl mb-12">{t('landing.benefits.title')}</h3>
          <div className="grid md:grid-cols-2 gap-6 rise-stagger">
            {benefits.map(({ titleKey, descKey }) => (
              <div key={titleKey} className="card p-6 text-left">
                <h4 className="font-display text-xl mb-3" style={{ color: 'var(--accent)' }}>{t(titleKey)}</h4>
                <p className="muted-2">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-24 text-center">
        <button onClick={onStartLearning} className="btn btn-primary btn-lg">
          {t('landing.cta.button')} <ArrowRight size={20} className="arrow" />
        </button>
        <p className="muted mt-4 text-sm">{t('landing.cta.subtitle')}</p>
      </div>
    </div>
  );
};
