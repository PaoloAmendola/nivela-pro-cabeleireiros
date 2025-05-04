
'use client'; // Mark as Client Component because it uses useState and passes event handlers

import React, { useState } from 'react';
import { guideSteps, type StepData } from '@/lib/guideData'; // Use StepData
import GuideStep from './GuideStep';
// Removed unused Button, ArrowLeft, ArrowRight imports

const InteractiveGuide = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleNextStep = () => {
    if (currentStepIndex < guideSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const currentStep: StepData = guideSteps[currentStepIndex]; // Ensure type is StepData
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === guideSteps.length - 1;

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4 text-primary dark:text-white">Guia Interativo - Etapa {currentStep.id}/{guideSteps.length}</h2>
      
      {/* Pass all required props to GuideStep */}
      <GuideStep 
        step={currentStep} 
        onNext={handleNextStep} 
        onPrev={handlePrevStep} 
        isFirstStep={isFirstStep} 
        isLastStep={isLastStep} 
      />

      {/* Navigation Buttons are now inside GuideStep component */}
    </div>
  );
};

export default InteractiveGuide;

