import * as RadixSlider from '@radix-ui/react-slider';
import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { withClassName } from '../../hocs/withClassName';
import cls from './Slider.module.css';
import { Box } from '../box/Box';

export const SliderRoot = withClassName(RadixSlider.Root, cls.root);
export const SliderThumb = withClassName(RadixSlider.Thumb, cls.thumb);
export const SliderTrack = withClassName(RadixSlider.Track, cls.track);
export const SliderRange = withClassName(RadixSlider.Range, cls.range);

export interface SliderProps extends RadixSlider.SliderProps {
	rangeColor?: string;
	thumbColor?: string;
}

const SliderCore = forwardRef<HTMLDivElement, SliderProps>(function SliderCore({ children, rangeColor, thumbColor, ...props }, ref) {
	const rangeRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);

	const updateRangeBorderRadius = useCallback(() => {
		if (!rangeRef.current || !trackRef.current) return;
		const rangeWidth = rangeRef.current.offsetWidth;
		const trackWidth = trackRef.current.offsetWidth;
		// Set border-radius as a function of width with padding on either side
		// Values below 25% will have 0 border-radius, values above 85% will have 1000px
		let normalizedRatio = rangeWidth / trackWidth;
		if (normalizedRatio < 0.5) normalizedRatio = 0;
		if (normalizedRatio > 0.5) normalizedRatio = 1;
		const borderRadius = normalizedRatio * 1000;
		rangeRef.current.style.setProperty('--range-border-radius', `${borderRadius}px`);
	}, []);

	useEffect(() => {
		updateRangeBorderRadius();
	}, []);

	return (
		<SliderRoot ref={ref} onPointerMoveCapture={updateRangeBorderRadius} {...props}>
			<SliderTrack ref={trackRef} className={cls.track}>
				<SliderRange ref={rangeRef} className={cls.range} style={{ backgroundColor: rangeColor }} />
			</SliderTrack>

			<SliderThumb className={cls.thumb} style={{ backgroundColor: rangeColor }}>
				<Box className={cls.thumbInner} style={{ backgroundColor: thumbColor }} />
			</SliderThumb>
		</SliderRoot>
	);
});

export const Slider = Object.assign(SliderCore, {
	Thumb: SliderThumb,
	Track: SliderTrack,
	Range: SliderRange,
	Root: SliderRoot,
});
