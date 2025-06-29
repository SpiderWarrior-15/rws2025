import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Zap, Target, Sparkles, Crown } from 'lucide-react';
import { AnimatedButton } from '../components/AnimatedButton';
import { GlassCard } from '../components/GlassCard';
import { AIBuddyIntro } from '../components/AIBuddyIntro';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAIBuddy } from '../hooks/useAIBuddy';
import { HomepageContent, UserAccount } from '../types';
import { initialHomepageContent } from '../utils/initialData';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [content] = useLocalStorage<HomepageContent>('rws-homepage-content', initialHomepageContent);
  const [accounts] = useLocalStorage<UserAccount[]>('rws-accounts', []);
  const { showIntro, markIntroAsSeen, hideIntro } = useAIBuddy();

  // Calculate actual stats
  const totalWarriors = accounts.filter(account => account.status === 'approved').length;

  // Icon mapping for dynamic icons
  const iconMap: Record<string, React.ComponentType<any>> = {
    Users,
    Zap,
    Target
  };

  // Handle stat clicks
  const handleStatClick = (statId: string) => {
    switch (statId) {
      case '1': // Elite Warriors
        // Could navigate to a warriors page or show a modal with warrior list
        console.log(`Total Warriors: ${totalWarriors}`);
        break;
      case '3': // Legendary Projects
        navigate('/events');
        break;
      default:
        break;
    }
  };

  const handleStartAIChat = () => {
    markIntroAsSeen();
    // The AI Buddy component will automatically open when the intro is closed
  };

  return (
    <div className="min-h-screen">
      {/* AI Buddy Intro Modal */}
      {showIntro && (
        <AIBuddyIntro
          onClose={hideIntro}
          onStartChat={handleStartAIChat}
        />
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-yellow-900 dark:from-gray-900 dark:via-gray-800 dark:to-yellow-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23FFD700%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="mb-8 inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-md border border-yellow-500/30">
            <Crown className="w-6 h-6 text-yellow-400 mr-3 animate-pulse" />
            <span className="text-lg font-medium text-yellow-300">{content.welcomeBadgeText}</span>
          </div>

          {/* Logo Integration */}
          <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40 animate-bounce">
              <img 
                src="/image.png" 
                alt="Royal Warriors Squad" 
                className="w-full h-full object-contain filter drop-shadow-2xl"
              />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              {content.heroTitle}
            </span>
            {content.heroSubtitle && (
              <>
                <br />
                <span className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                  {content.heroSubtitle}
                </span>
              </>
            )}
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            <span className="text-yellow-400 font-semibold">{content.tagline}</span>
            {content.heroDescription && (
              <>
                {' '}in an elite brotherhood where 
                <br className="hidden md:block" />
                {content.heroDescription.split('in an elite brotherhood where')[1] || 'creativity meets technology and legends are born'}
              </>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <AnimatedButton
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={() => navigate('/warriors-picks')}
              className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-black font-bold shadow-2xl"
            >
              {content.primaryButtonText}
            </AnimatedButton>
            
            <AnimatedButton
              variant="secondary"
              size="lg"
              onClick={() => navigate('/events')}
              className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
            >
              {content.secondaryButtonText}
            </AnimatedButton>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {content.features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || Users;
              return (
                <GlassCard key={feature.id} className="p-8 text-center border-yellow-500/20">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-600 to-yellow-500 rounded-2xl mb-6 animate-bounce shadow-2xl"
                       style={{ animationDelay: `${index * 0.2}s` }}>
                    <IconComponent className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-yellow-300 mb-4">{feature.title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">{feature.description}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-yellow-400/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-yellow-400/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-yellow-500/5 dark:to-yellow-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
              {content.aboutTitle}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
              {content.aboutDescription.split('elite brotherhood').map((part, index) => (
                <span key={index}>
                  {part}
                  {index === 0 && <span className="text-yellow-600 font-semibold">elite brotherhood</span>}
                  {index === 1 && part.includes('conquering the digital realm') && (
                    <>
                      {part.split('conquering the digital realm')[0]}
                      <span className="text-yellow-600 font-semibold">conquering the digital realm</span>
                      {part.split('conquering the digital realm')[1]}
                    </>
                  )}
                </span>
              ))}
            </p>
          </div>

          <GlassCard className="p-8 md:p-12 max-w-6xl mx-auto border-yellow-500/20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{content.missionTitle}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-lg">
                  {content.missionDescription.split('royal collaboration').map((part, index) => (
                    <span key={index}>
                      {part}
                      {index === 0 && <span className="text-yellow-600 font-semibold">royal collaboration</span>}
                      {index === 1 && part.includes('truly legendary') && (
                        <>
                          {part.split('truly legendary')[0]}
                          <span className="text-yellow-600 font-semibold">truly legendary</span>
                          {part.split('truly legendary')[1]}
                        </>
                      )}
                    </span>
                  ))}
                </p>
                <AnimatedButton
                  variant="primary"
                  onClick={() => navigate('/contact')}
                  className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-black font-bold"
                >
                  Join Our Kingdom
                </AnimatedButton>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {content.stats.map((stat, index) => {
                  // Update the display value for Elite Warriors to show actual count
                  const displayValue = stat.id === '1' ? totalWarriors.toString() : stat.value;
                  const isClickable = stat.id === '1' || stat.id === '3'; // Elite Warriors or Legendary Projects
                  
                  return (
                    <div 
                      key={stat.id} 
                      className={`text-center p-6 bg-gradient-to-br ${stat.color} rounded-xl border border-yellow-500/20 transition-all duration-300 ${
                        isClickable ? 'cursor-pointer hover:scale-105 hover:border-yellow-500/40 hover:shadow-lg group' : ''
                      }`}
                      onClick={() => isClickable ? handleStatClick(stat.id) : undefined}
                      title={
                        stat.id === '1' ? 'Click to view warrior details' : 
                        stat.id === '3' ? 'Click to view events' : undefined
                      }
                    >
                      <div className="text-4xl font-bold text-yellow-600 mb-2">{displayValue}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                      {isClickable && (
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowRight className="w-4 h-4 mx-auto text-yellow-500" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};