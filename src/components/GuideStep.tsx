
'use client'; // Add 'use client' because it receives functions as props (onNext, onPrev)

import React from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import { type StepData } from '@/lib/guideData'; 
import Image from 'next/image';

interface GuideStepProps {
  step: StepData;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const GuideStep: React.FC<GuideStepProps> = ({ step, onNext, onPrev, isFirstStep, isLastStep }) => {
  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-primary dark:text-white">Passo {step.id}: {step.title}</h3>

      {step.imageSrc && (
        <div className="mb-4 relative w-full h-48"> 
          <Image
            src={step.imageSrc}
            alt={`Ilustração para ${step.title}`}
            layout="fill" 
            objectFit="contain" 
            className="rounded-md" 
            unoptimized 
          />
        </div>
      )}

      <p className="text-sm mb-4 text-muted-foreground">{step.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {step.videoTimestamp && (
          <a href={`https://youtu.be/lDKNZIztUMw?t=${step.videoTimestamp}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <PlayCircle className="mr-2 h-4 w-4 text-red-600" /> Ver no Vídeo
            </Button>
          </a>
        )}
      </div>

      <div className="flex justify-between mt-4 border-t pt-4">
        <Button variant="outline" onClick={onPrev} disabled={isFirstStep}>
          Anterior
        </Button>
        <Button onClick={onNext} disabled={isLastStep}>
          {isLastStep ? 'Finalizar Guia' : 'Próximo Passo'}
        </Button>
      </div>
    </div>
  );
};

export default GuideStep;

