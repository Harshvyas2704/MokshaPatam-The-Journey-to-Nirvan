/**
 * SpiritualEventLayer — connects the event trigger hook to the modal.
 *
 * Drop this once near the top of the game screen. It renders nothing until a
 * meaningful event (snake / ladder / concept / moksha) is ready, then presents
 * the modal. Self-contained so the screen stays declarative.
 */
import React from 'react';
import { useSpiritualEvent } from '../hooks/useSpiritualEvent';
import { SpiritualEventModal } from './SpiritualEventModal';

const SpiritualEventLayerComponent: React.FC = () => {
  const { event, dismiss } = useSpiritualEvent();
  return <SpiritualEventModal event={event} onDismiss={dismiss} />;
};

export const SpiritualEventLayer = React.memo(SpiritualEventLayerComponent);
SpiritualEventLayer.displayName = 'SpiritualEventLayer';
