import { type JSX, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { cloudStorage } from '@tma.js/sdk-react';

import { useTheme } from '../context/ThemeContext';
import { useTelegram } from '../hooks/useTelegram';
import { useMainButton } from '../hooks/useMainButton';
import { useBackButton } from '../hooks/useBackButton';
import { onboarding } from '../api/onboarding';

import { LoadingScreen } from '../components/loading/LoadingScreen';
import { OnboardingProgress } from '../components/onboarding/OnboardingProgress';
import { Step1Gender } from '../components/onboarding/steps/Step1Gender';
import { Step2Age } from '../components/onboarding/steps/Step2Age';
import { Step3Height } from '../components/onboarding/steps/Step3Height';
import { Step4Weight } from '../components/onboarding/steps/Step4Weight';
import { Step5Goal } from '../components/onboarding/steps/Step5Goal';
import { Step6TargetWeight } from '../components/onboarding/steps/Step6TargetWeight';
import { Step7Activity } from '../components/onboarding/steps/Step7Activity';
import { Step8Restrictions } from '../components/onboarding/steps/Step8Restrictions';
import { Step9Water } from '../components/onboarding/steps/Step9Water';
import { Step10Medical } from '../components/onboarding/steps/Step10Medical';

import type {
  OnboardingData,
  HeightUnit,
  WeightUnit,
} from '../interfaces/Onboarding';

const CS_HEIGHT_UNIT = 'units_height';
const CS_WEIGHT_UNIT = 'units_weight';

// ─── helpers ────────────────────────────────────────────────────────────────

function getActiveSteps(data: Partial<OnboardingData>): number[] {
  const steps = [1, 2, 3, 4, 5];
  if (data.goal && data.goal !== 'maintain') steps.push(6);
  return [...steps, 7, 8, 9, 10];
}

function isStepValid(step: number, data: Partial<OnboardingData>): boolean {
  switch (step) {
    case 1:
      return !!data.gender;
    case 2:
      return typeof data.age === 'number' && data.age >= 13 && data.age <= 90;
    case 3:
      return typeof data.height === 'number';
    case 4:
      return typeof data.weight === 'number';
    case 5:
      return !!data.goal;
    case 6:
      return typeof data.target_weight === 'number' && data.target_weight > 0;
    case 7:
      return data.activity_level !== undefined;
    case 8:
      return true;
    case 9: {
      if (!data.water_track) return false;
      if (data.water_track === 'manual')
        return typeof data.water_goal === 'number' && data.water_goal > 0;
      return true;
    }
    case 10:
      return true;
    default:
      return false;
  }
}

function stepPayload(
  step: number,
  d: Partial<OnboardingData>,
): Partial<OnboardingData> {
  switch (step) {
    case 1:
      return { gender: d.gender };
    case 2:
      return { age: d.age };
    case 3:
      return { height: d.height };
    case 4:
      return { weight: d.weight };
    case 5:
      return { goal: d.goal };
    case 6: {
      const tw = d.target_weight;
      if (tw == null) return {};
      const inKg =
        d.weight_unit === 'lbs' ? Math.round((tw / 2.205) * 10) / 10 : tw;
      return { target_weight: inKg };
    }
    case 7:
      return { activity_level: d.activity_level };
    case 8:
      return {
        dietary_restrictions: d.dietary_restrictions,
        allergy_note: d.allergy_note,
      };
    case 9:
      return { water_track: d.water_track, water_goal: d.water_goal };
    case 10:
      return { medical_conditions: d.medical_conditions };
    default:
      return {};
  }
}

// ─── component ──────────────────────────────────────────────────────────────

const INITIAL_DATA: Partial<OnboardingData> = {
  height_unit: 'cm',
  weight_unit: 'kg',
  dietary_restrictions: [],
  medical_conditions: [],
};

export const OnboardingPage = () => {
  const { safeTop, safeBottom } = useTelegram();
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [data, setData] = useState<Partial<OnboardingData>>(INITIAL_DATA);
  const [step, setStep] = useState(1);
  const [stepHistory, setStepHistory] = useState<number[]>([]); // ← история шагов для BackButton
  const [valid, setValid] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dataRef = useRef(data);
  const stepRef = useRef(step);
  const validRef = useRef(valid);
  const historyRef = useRef(stepHistory);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  useEffect(() => {
    validRef.current = valid;
  }, [valid]);
  useEffect(() => {
    historyRef.current = stepHistory;
  }, [stepHistory]);

  // ── загрузка прогресса + единиц из CloudStorage ───────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const [progressRes, heightUnit, weightUnit] = await Promise.all([
          onboarding.getProgress(),
          cloudStorage.getItem(CS_HEIGHT_UNIT).catch(() => null),
          cloudStorage.getItem(CS_WEIGHT_UNIT).catch(() => null),
        ]);
        const { step: savedStep, data: savedData } = progressRes.data;
        const merged: Partial<OnboardingData> = {
          ...INITIAL_DATA,
          height_unit: (heightUnit as HeightUnit) || INITIAL_DATA.height_unit,
          weight_unit: (weightUnit as WeightUnit) || INITIAL_DATA.weight_unit,
          ...savedData,
        };
        setData(merged);
        const active = getActiveSteps(merged);
        const resume = active.includes(savedStep) ? savedStep : active[0];
        setStep(resume);
        setValid(isStepValid(resume, merged));
      } catch {
        setStep(1);
        setValid(false);
      } finally {
        setInitializing(false);
      }
    }
    init();
  }, []);

  // ── назад (BackButton) ────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    const history = historyRef.current;
    if (history.length === 0) return;

    const prev = history[history.length - 1];
    setStepHistory((h) => h.slice(0, -1));
    setStep(prev);
    stepRef.current = prev;
    const prevValid = isStepValid(prev, dataRef.current);
    setValid(prevValid);
    validRef.current = prevValid;
    setError(null);
  }, []);

  useBackButton(handleBack, stepHistory.length > 0);

  // ── изменения от степ-компонентов ─────────────────────────────────────────
  const handleChange = useCallback(
    (patch: Partial<OnboardingData>, patchValid: boolean) => {
      setData((prev) => {
        const next = { ...prev, ...patch };
        dataRef.current = next;
        return next;
      });
      setValid(patchValid);
      validRef.current = patchValid;
    },
    [],
  );

  // ── вперёд / завершение ───────────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    if (!validRef.current || saving) return;

    const currentData = dataRef.current;
    const currentStep = stepRef.current;

    setError(null);
    setSaving(true);

    try {
      await onboarding.saveStep(
        currentStep,
        stepPayload(currentStep, currentData),
      );

      // Сохраняем единицы в CloudStorage
      if (currentStep === 3 && currentData.height_unit) {
        cloudStorage
          .setItem(CS_HEIGHT_UNIT, currentData.height_unit)
          .catch(() => {});
      }
      if (currentStep === 4 && currentData.weight_unit) {
        cloudStorage
          .setItem(CS_WEIGHT_UNIT, currentData.weight_unit)
          .catch(() => {});
      }

      const active = getActiveSteps(currentData);
      const idx = active.indexOf(currentStep);
      const isLast = idx === active.length - 1;

      if (isLast) {
        await onboarding.complete();
        queryClient.invalidateQueries({ queryKey: ['user'] });
        navigate('/', { replace: true });
      } else {
        // Пушим текущий шаг в историю перед переходом вперёд
        setStepHistory((h) => [...h, currentStep]);
        const nextStep = active[idx + 1];
        setStep(nextStep);
        stepRef.current = nextStep;
        setValid(isStepValid(nextStep, currentData));
        validRef.current = isStepValid(nextStep, currentData);
      }
    } catch {
      setError('Не удалось сохранить. Проверь соединение и попробуй ещё раз.');
    } finally {
      setSaving(false);
    }
  }, [saving, navigate, queryClient]);

  // ── derived ───────────────────────────────────────────────────────────────
  const activeSteps = getActiveSteps(data);
  const stepIndex = activeSteps.indexOf(step);
  const isLastStep = stepIndex === activeSteps.length - 1;

  useMainButton({
    text: isLastStep ? 'Завершить' : 'Далее',
    iconCustomEmojiId: isLastStep
      ? '5193212401188615252'
      : '5193191330079062069',
    isEnabled: valid && !saving,
    isLoading: saving,
    onClick: handleNext,
  });

  if (initializing) return <LoadingScreen />;

  const props = { data, onChange: handleChange };
  const stepMap: Record<number, JSX.Element> = {
    1: <Step1Gender {...props} />,
    2: <Step2Age {...props} />,
    3: <Step3Height {...props} />,
    4: <Step4Weight {...props} />,
    5: <Step5Goal {...props} />,
    6: <Step6TargetWeight {...props} />,
    7: <Step7Activity {...props} />,
    8: <Step8Restrictions {...props} />,
    9: <Step9Water {...props} />,
    10: <Step10Medical {...props} />,
  };

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        paddingTop: safeTop,
        paddingBottom: safeBottom,
        backgroundColor: theme.bg_color,
      }}
    >
      <OnboardingProgress current={stepIndex} total={activeSteps.length} />
      <div className="flex-1 overflow-y-auto">{stepMap[step] ?? null}</div>
      {error && (
        <div
          className="mx-4 mb-3 rounded-xl p-3 text-center text-sm"
          style={{ backgroundColor: '#ff3b3020', color: '#ff3b30' }}
        >
          {error}
        </div>
      )}
    </div>
  );
};
