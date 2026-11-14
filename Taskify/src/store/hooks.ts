import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * Typed version of the `useDispatch` hook for this app.
 * It knows about the `AppDispatch` type, ensuring that dispatched
 * actions are correctly typed.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed version of the `useSelector` hook.
 * It knows the shape of the root state (`RootState`).
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

