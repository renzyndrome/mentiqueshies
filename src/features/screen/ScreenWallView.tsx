import { useMemo } from 'react';
import type { PublicAnswer } from '../../../shared/types';
import { Eyebrow } from '../../components/Eyebrow';
import { buildWallCards } from './wallCards';
import type { WallCard } from './wallCards';

interface ScreenWallViewProps {
  readonly title: string;
  readonly questionText: string;
  readonly answers: readonly PublicAnswer[];
  readonly answerCount: number;
  readonly host: string;
}

const LONG_QUESTION = 70;

function WallCardView({ card }: { readonly card: WallCard }) {
  const { variant } = card;
  return (
    <div
      className="fade-in flex min-h-0 flex-col gap-3 overflow-hidden rounded-lg p-7"
      style={{
        background: variant.background,
        border: variant.border ? `1px solid ${variant.border}` : undefined,
        transform: `rotate(${variant.rotate}deg)`,
      }}
    >
      <div aria-hidden="true" className="h-[3px] w-[34px] shrink-0 rounded-xs" style={{ background: variant.rule }} />
      <div
        className="font-wordmark text-[24px] leading-[1.3] font-semibold break-words"
        style={{ color: variant.text }}
      >
        {card.text}
      </div>
      <div className="mt-auto text-[13px] leading-none font-semibold" style={{ color: variant.meta }}>
        {card.label}
      </div>
    </div>
  );
}

/** Big screen wall of cards (ScreenWall.dc.html). Newest first, 9 at most, no names or locations. */
export function ScreenWallView({ title, questionText, answers, answerCount, host }: ScreenWallViewProps) {
  const cards = useMemo(() => buildWallCards(answers), [answers]);
  const newest = answers[0];
  const questionSize = questionText.length > LONG_QUESTION ? 40 : 48;

  return (
    <div
      data-theme="light"
      className="flex size-full gap-[72px] px-[120px] pt-[72px] pb-16"
      style={{ background: 'linear-gradient(180deg,#FBF5E9 0%,#EFE3CB 100%)' }}
    >
      <aside className="flex w-[560px] shrink-0 flex-col">
        <Eyebrow size="screen-sm">{title}</Eyebrow>
        <h1
          className="mt-7 font-wordmark leading-[1.15] font-semibold tracking-[-0.015em] text-ink-800"
          style={{ fontSize: questionSize }}
        >
          {questionText}
        </h1>
        <p className="mt-8 text-[24px] leading-[1.55] text-fg-muted">
          Every card is one person in this room today. New ones land as they arrive.
        </p>

        <div className="mt-auto flex flex-col gap-[18px] pt-8">
          {newest ? (
            <div key={newest.id} className="fade-in rounded-xl bg-ink-800 px-9 py-8 shadow-media">
              <div className="text-xs leading-none font-bold tracking-[0.16em] text-red-300 uppercase">
                Just in {'·'} Anonymous
              </div>
              <div className="mt-3.5 font-wordmark text-[34px] leading-[1.25] font-semibold break-words text-white">
                {`"${newest.text}"`}
              </div>
            </div>
          ) : null}
          <div className="flex items-center gap-3 text-[18px] leading-none font-medium text-fg-muted">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-red-500" />
            {answerCount} {answerCount === 1 ? 'answer' : 'answers'} and counting {'·'} {host}
          </div>
        </div>
      </aside>

      {cards.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-[28px] text-fg-muted">
          Waiting for the first answer.
        </div>
      ) : (
        <div className="grid min-w-0 flex-1 grid-cols-3 grid-rows-3 gap-5">
          {cards.map((card) => (
            <WallCardView key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
