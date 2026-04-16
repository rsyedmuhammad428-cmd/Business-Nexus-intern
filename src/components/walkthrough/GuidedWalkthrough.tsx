import React, { useState, useEffect } from 'react';
import { Joyride, Step, CallBackProps, STATUS, ACTIONS } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';

// Only show the walkthrough on desktop/laptop screens (≥1024px)
const isDesktop = () => typeof window !== 'undefined' && window.innerWidth >= 1024;

export const GuidedWalkthrough: React.FC = () => {
  const { user } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the walkthrough
    const hasSeenWalkthrough = localStorage.getItem(`nexus_walkthrough_seen_${user?.id}`);
    if (user && !hasSeenWalkthrough) {
      if (isDesktop()) {
        // Only show pop-in on desktop / laptop
        setRun(true);
      }
      // On mobile/tablet: silently skip (no pop-in shown)
    }
  }, [user]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data;
    if (
      ([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status) || 
      action === ACTIONS.CLOSE
    ) {
      setRun(false);
      if (user?.id) {
        localStorage.setItem(`nexus_walkthrough_seen_${user.id}`, 'true');
      }
    }
  };

  const commonSteps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Welcome to Business Nexus! 🚀</h3>
          <p>Let's take a quick tour to help you get started with the investor & entrepreneur collaboration platform.</p>
        </div>
      ),
    },
    {
      target: '[href*="dashboard"]',
      content: 'Your Dashboard provides a quick overview of your activities, meetings, and connections.',
    },
    {
       target: '[href*="meetings"]',
       content: 'Schedule and manage your investment pitches or collaboration meetings here.',
    },
    {
       target: '[href*="documents"]',
       content: 'Access the Document Chamber to upload pitch decks, NDAs, and sign legal documents securely.',
    },
    {
       target: '[href*="payments"]',
       content: 'Manage your wallet, deposit funds, and handle investment transfers seamlessly.',
    },
    {
      target: '.avatar-menu', // Assuming I'll add this class to the profile section in Navbar
      content: 'You can manage your profile settings or logout from here.',
    }
  ];

  const investorSteps: Step[] = [
    ...commonSteps,
    {
      target: '[href*="entrepreneurs"]',
      content: 'Browse promising startups and innovative entrepreneurs looking for funding.',
    }
  ];

  const entrepreneurSteps: Step[] = [
    ...commonSteps,
    {
      target: '[href*="investors"]',
      content: 'Find the right investors who align with your startup goals and industry.',
    }
  ];

  const steps = (user?.role === 'investor' ? investorSteps : entrepreneurSteps).map(step => ({
    ...step,
    disableBeacon: true,
  }));

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideBackButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      disableBeacon={true}
      disableOverlayClose={true}
      styles={{
        options: {
          primaryColor: '#3b82f6', // primary-600
          zIndex: 10000,
        },
        beacon: {
          display: 'none',
        },
      }}
    />
  );
};
