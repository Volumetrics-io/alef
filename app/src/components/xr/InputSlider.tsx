import { Container } from '@react-three/uikit';
import { Slider, Input } from '@react-three/uikit-default';
import { useSignal } from '@preact/signals-react';

export function InputSlider({ value, min, max, step, onChange = () => {} }: { value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
	const sliderValue = useSignal(value);
	const decimalPlaces = step.toString().split('.')[1]?.length || 0;
	const inputValue = useSignal(sliderValue.value.toFixed(decimalPlaces));

	const handleSliderChange = (newValue: number) => {
		sliderValue.value = newValue;
		inputValue.value = newValue.toFixed(decimalPlaces);
		onChange(newValue);
	};

	const handleInputChange = (newValue: string) => {
		const parsedValue = Number(newValue);

		if (!isNaN(parsedValue)) {
			const clampedValue = Math.min(Math.max(parsedValue, min), max);
			sliderValue.value = clampedValue;
			onChange(clampedValue);
		}

		inputValue.value = newValue;
	};

	return (
		<Container width="100%" flexDirection="row" gap={20} alignItems="center" justifyContent="flex-end">
			<Slider width={150} value={sliderValue} min={min} max={max} step={step} onValueChange={handleSliderChange} />
			<Input width={80} value={inputValue} onValueChange={handleInputChange} />
			{/* TODO: onFocusChange doesn't fire for some reason, so we can't use it to reset the input value when the input loses focus */}
			{/* <Input width={80} value={inputValue} onValueChange={handleInputChange}
				onFocusChange={(focus) => {
					if (!focus) {
						setInputValue(sliderValue.toFixed(decimalPlaces))
					}
				}} /> */}
		</Container>
	);
}
