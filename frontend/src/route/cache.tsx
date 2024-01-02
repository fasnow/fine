import { ReactElement, useContext, useRef } from 'react';
import { Freeze } from 'react-freeze';
import { UNSAFE_RouteContext as RouteContext } from 'react-router-dom';

export function KeepAliveOutlet() {
  const caches = useRef<Record<string, ReactElement>>({});

  const matchedElement = useContext(RouteContext).outlet; // v6.3之后useOutlet会多了一层嵌套
  const matchedPath = matchedElement?.props?.value?.matches?.at(-1)?.pathname as string;

  if (matchedElement && matchedPath) {
    caches.current[matchedPath] = matchedElement;
  }

  return (
    <>
      {Object.entries(caches.current).map(([path, element]) => (
        <Freeze key={path} freeze={element !== matchedElement}>
          {element}
        </Freeze>
      ))}
    </>
  );
}