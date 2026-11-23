import React from 'react';

const BIDI_TOKEN_REGEX =
  /([A-Za-z0-9]+(?:[\s\-_/]+[A-Za-z0-9]+)*)/g;

/**
 * Wraps embedded Latin/alphanumeric identifiers (e.g. SUBJECT 012, PROJECT RECALL, CH-04, E, ESC)
 * inside <bdi dir="ltr"> so mixed Arabic/English sentences preserve exact word order.
 */
export const BidiText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(BIDI_TOKEN_REGEX);
  return (
    <>
      {parts.map((part, idx) => {
        if (!part) return null;
        if (/^[A-Za-z0-9]/.test(part)) {
          return (
            <bdi key={idx} dir="ltr">
              {part}
            </bdi>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </>
  );
};
