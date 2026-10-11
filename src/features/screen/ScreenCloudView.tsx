import { useMemo } from 'react';
import type { PublicAnswer } from '../../../shared/types';
import { AppMark } from '../../components/AppMark';
import { Eyebrow } from '../../components/Eyebrow';
import { CountPill } from './CountPill';
import { layoutCloud } from './cloudLayout';
import { buildWordCloud } from './wordCloud';

interface ScreenCloudViewProps {
  readonly title: string;
  readonly questionText: string;
  readonly answers: readonly PublicAnswer[];
  readonly answerCount: number;
  readonly host: string;
}

/** Big screen word cloud (ScreenCloud.dc.html). Top 14 words, size by how many people said each. */
export function ScreenCloudView({ title, questionText, answers, answerCount, host }: ScreenCloudViewProps) {
  const words = useMemo(() => layoutCloud(buildWordCloud(answers.map((answer) => answer.text))), [answers]);

  return (
    <div
      className="flex size-full flex-col px-[120px] pt-[72px] pb-16"
      style={{ background: 'linear-gradient(180deg,#2E0408 0%,#0B0B0C 100%)' }}
    >
      <header className="flex items-start justify-between gap-12">
        <div className="flex max-w-[1240px] flex-col gap-[18px]">
          <Eyebrow size="screen-sm">{title}</Eyebrow>
          <h1 className="m-0 font-wordmark text-[52px] leading-[1.15] font-semibold tracking-[-0.015em] text-white">
            {questionText}
          </h1>
        </div>
        <CountPill count={answerCount} label={answerCount === 1 ? 'answer' : 'answers'} />
      </header>

      <div className="mt-6 flex min-h-0 flex-1 flex-wrap content-center items-center justify-center gap-x-14 gap-y-3 overflow-hidden px-10">
        {words.length === 0 ? (
          <p className="text-[28px] text-fg-muted">Waiting for the first answer.</p>
        ) : (
          words.map((word) => (
            <span
              key={word.word}
              className="fade-in max-w-full font-display leading-[0.95] tracking-[-0.01em] break-words uppercase"
              style={{ fontSize: word.size, color: word.color }}
            >
              {word.word}
            </span>
          ))
        )}
      </div>

      <footer className="flex items-center justify-between border-t border-white/10 pt-6">
        <AppMark size="screen" />
        <div className="flex items-center gap-7 text-[20px] leading-none font-medium text-fg-muted">
          <span>
            Join at <strong className="font-semibold tracking-[0.02em] text-white">{host}</strong>
          </span>
        </div>
      </footer>
    </div>
  );
}
