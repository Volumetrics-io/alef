import { Container, ContainerProperties, DefaultProperties } from '@react-three/uikit';
import { colors } from './theme';
import { borderRadius } from '@react-three/uikit-default';
import { useCallback, useEffect, useState } from 'react';
import { PositionalAudio } from '@react-three/drei';
import { PositionalAudio as PositionalAudioType } from 'three';
import { useRef } from 'react';
import { ThreeEvent } from '@react-three/fiber';

export interface SelectorProps {
	wrap?: boolean;
	size?: 'small' | 'medium';
}

const selectorSizeVariants = {
    small: {
        paddingY: 8,
        paddingX: 12,
        gap: 4,
    },
    medium: {
        paddingY: 12,
        paddingX: 16,
        gap: 8,
        
    },
}

export function Selector({ size = 'medium', children, ...props }: SelectorProps & ContainerProperties & { children: React.ReactNode }) {

	return (
		<Container 
        backgroundColor={colors.selectionSurface}
        flexShrink={0}
        borderRadius={borderRadius.md}
        borderWidth={1}
        borderColor={colors.border}
        {...props}
        
        >
            <DefaultProperties
            {...selectorSizeVariants[size]} >
                {children}
            </DefaultProperties>
		</Container>
	);
}

const selectorItemSizeVariants = {
    small: {
        fontSize: 14,
        lineHeight: 20,
    },
    medium: {
        fontSize: 16,
        lineHeight: 24,
    },
}

export function SelectorItem({ wrap = false, selected, size = 'medium', children, ...props }: ContainerProperties & { wrap?: boolean, selected: boolean, size?: 'small' | 'medium', children: React.ReactNode }) {
    const [hover, setHover] = useState(false);
    const audioRef = useRef<PositionalAudioType>(null)

    useEffect(() => {
        return () => {
          // Stop audio when component unmounts
          if (audioRef.current) {
            audioRef.current.stop();
          }
        };
      }, []);

      const onClick = useCallback((e: ThreeEvent<MouseEvent>) => {
        // Stop any currently playing audio before playing again
        if (audioRef.current) {
          if (audioRef.current.isPlaying) {
            audioRef.current.stop();
          }
          audioRef.current.play();
        }
        props.onClick?.(e);
      }, [props]);

	return (
		<Container
            backgroundColor={selected || hover ? colors.selectionHover : undefined}
            alignItems="center"
            flexDirection="row"
            width={wrap ? 'auto' : '100%'}
            justifyContent="flex-start"
            onHoverChange={(hover) => setHover(hover)}
            {...props}
            onClick={onClick}
        >
            <PositionalAudio
            url={`./audio/click.webm`}
            distance={0.5}
            autoplay={false}
            loop={false}
            ref={audioRef}
          />
            <DefaultProperties
                padding={0}
                fontFamily="ibm-plex-sans"
            {...selectorItemSizeVariants[size]}
            >
            {children}
            </DefaultProperties>
        </Container>
	);
}
