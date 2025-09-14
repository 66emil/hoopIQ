import React from 'react';
import { BookOpen, Video, Trophy, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';

interface LandingProps {
  onStartLearning: () => void;
}

export const Landing = ({ onStartLearning }: LandingProps) => {
  const { t } = useLocalization();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            {t('landing.hero.title1')}
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white">
            {t('landing.hero.title2')}
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
            {t('landing.hero.subtitle')}
          </p>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-orange-400">
              {t('landing.features.title')}
            </h3>
            <p className="text-lg text-gray-300">
              {t('landing.features.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-orange-500 transition-all duration-300 hover:transform hover:scale-105">
            <div className="bg-orange-500/20 p-3 rounded-lg w-fit mb-4">
              <BookOpen className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{t('landing.feature.theory.title')}</h3>
            <p className="text-gray-300">
              {t('landing.feature.theory.description')}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-orange-500 transition-all duration-300 hover:transform hover:scale-105">
            <div className="bg-orange-500/20 p-3 rounded-lg w-fit mb-4">
              <Video className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{t('landing.feature.quiz.title')}</h3>
            <p className="text-gray-300">
              {t('landing.feature.quiz.description')}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-orange-500 transition-all duration-300 hover:transform hover:scale-105">
            <div className="bg-orange-500/20 p-3 rounded-lg w-fit mb-4">
              <Trophy className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{t('landing.feature.progress.title')}</h3>
            <p className="text-gray-300">
              {t('landing.feature.progress.description')}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-orange-500 transition-all duration-300 hover:transform hover:scale-105">
            <div className="bg-orange-500/20 p-3 rounded-lg w-fit mb-4">
              <Users className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{t('landing.feature.levels.title')}</h3>
            <p className="text-gray-300">
              {t('landing.feature.levels.description')}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-orange-500 transition-all duration-300 hover:transform hover:scale-105">
            <div className="bg-orange-500/20 p-3 rounded-lg w-fit mb-4">
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{t('landing.feature.why.title')}</h3>
            <p className="text-gray-300">
              {t('landing.feature.why.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-12 text-white">{t('landing.benefits.title')}</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
              <h4 className="text-xl font-semibold mb-3 text-orange-400">{t('landing.benefits.improve.title')}</h4>
              <p className="text-gray-300">{t('landing.benefits.improve.description')}</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
              <h4 className="text-xl font-semibold mb-3 text-orange-400">{t('landing.benefits.thinking.title')}</h4>
              <p className="text-gray-300">{t('landing.benefits.thinking.description')}</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
              <h4 className="text-xl font-semibold mb-3 text-orange-400">{t('landing.benefits.schemes.title')}</h4>
              <p className="text-gray-300">{t('landing.benefits.schemes.description')}</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
              <h4 className="text-xl font-semibold mb-3 text-orange-400">{t('landing.benefits.iq.title')}</h4>
              <p className="text-gray-300">{t('landing.benefits.iq.description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onStartLearning}
            className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xl px-12 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-orange-500/25"
          >
            <span className="flex items-center justify-center space-x-3">
              <span>{t('landing.cta.button')}</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </button>
          <p className="text-gray-400 mt-4 text-sm">
            {t('landing.cta.subtitle')}
          </p>
        </div>
      </div>
    </div>
  );
};
