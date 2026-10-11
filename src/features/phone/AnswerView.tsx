import { useState } from 'react';
import type { FormEvent } from 'react';
import { MAX_ANSWER_LENGTH, answerLength, validateAnswer } from '../../../shared/answerValidation';
import { Eyebrow } from '../../components/Eyebrow';
import { PhoneTopBar } from './PhoneTopBar';

export interface AnswerViewProps {
  readonly questionText: string;
  readonly initialText: string;
  readonly sending: boolean;
  readonly error: string | null;
  readonly onSubmit: (text: string) => void;
}

/** Phone Answer (Answer.dc.html without progress bar, name toggle or suggestion chips). */
export function AnswerView({ questionText, initialText, sending, error, onSubmit }: AnswerViewProps) {
  const [text, setText] = useState(initialText);
  const valid = validateAnswer(text).ok;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateAnswer(text);
    if (result.ok && !sending) onSubmit(result.value);
  };

  return (
    <main className="phone-shell bg-white">
      <PhoneTopBar live />

      <Eyebrow className="mt-7">Tonight&apos;s question</Eyebrow>
      <h1 className="mt-[18px] font-wordmark text-[28px] leading-[1.25] font-semibold tracking-[-0.01em] text-fg-default">
        {questionText}
      </h1>
      <p className="mt-3 text-[15px] leading-[1.6] text-fg-muted">
        One word or one short sentence. Tagalog or English, both are fine.
      </p>

      <form className="mt-7 flex flex-1 flex-col" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-2">
          <textarea
            aria-label="Your answer"
            aria-describedby="answer-count"
            placeholder="Hindi Niya ako iiwan."
            maxLength={MAX_ANSWER_LENGTH}
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="field min-h-[132px] resize-none px-4 py-3.5 text-[17px] leading-[1.5]"
          />
          <div className="flex justify-end text-xs leading-none font-medium text-fg-faint">
            <span id="answer-count">
              {answerLength(text)} / {MAX_ANSWER_LENGTH}
            </span>
          </div>
        </div>

        {error ? (
          <p role="alert" className="mt-4 text-sm font-semibold text-brand-text">
            {error}
          </p>
        ) : null}

        <div className="mt-auto pt-8">
          <button type="submit" className="btn-primary" disabled={!valid || sending} aria-busy={sending}>
            Send my answer
          </button>
          <p className="mt-3.5 text-center text-xs leading-[1.4] font-medium text-fg-faint">
            Answers show on the big screen. The media team can hide one.
          </p>
        </div>
      </form>
    </main>
  );
}
