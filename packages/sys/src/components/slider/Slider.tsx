import * as RadixSlider from '@radix-ui/react-slider';
import { forwardRef } from 'react';
import { withClassName } from '../../hocs/withClassName';
import cls from './Slider.module.css';

export const SliderRoot = withClassName(RadixSlider.Root, cls.root);
export const SliderThumb = withClassName(RadixSlider.Thumb, cls.thumb);
export const SliderTrack = withClassName(RadixSlider.Track, cls.track);
export const SliderRange = withClassName(RadixSlider.Range, cls.range);

const SliderCore = forwardRef<HTMLDivElement, RadixSlider.SliderProps>(function SliderCore({ children, ...props }, ref) {
	return (
		<SliderRoot ref={ref} {...props}>
			<SliderTrack>
				<SliderRange />
			</SliderTrack>
			<SliderThumb />
		</SliderRoot>
	);
});

export const Slider = Object.assign(SliderCore, {
	Thumb: SliderThumb,
	Track: SliderTrack,
	Range: SliderRange,
	Root: SliderRoot,
});
