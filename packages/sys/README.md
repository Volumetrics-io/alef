# SYS

Our design system library.

## Developing

Run `pnpm storybook` to start the Storybook environment.

## Usage

Sys contains components that should power most of our UI. These cover a variety of needs:

- Layout
- Controls
- Icons

Nearly all components are _composable_, meaning they can be combined together to overlap different behaviors.

### Patterns

#### Composition

Many Sys components are composable, meaning they can 'become' another component passed as a child:

```tsx
<Box asChild>
	<YourCustomThing />
</Box>
```

This allows composed properties to control behavior of arbitrary components. A composed component **must** use `forwardRef` and spread 'extra' props to its root element:

```tsx
const YourCustomThing = forwardRef<HTMLDivElement, YourCustomThingProps>(function YourCustomThing({ foo, ...props }, ref) {
	return (
		<div ref={ref} {...props}>
			{foo}
		</div>
	);
});
```

### Layout

The primary layout component is `Box`. Box features a variety of props which customize its layout behavior.

Box is also composable and this is used often. See composition docs above.

For most custom 'div' like components you make, prefer using Box as the base component so that layout customization is built-in.

In addition to Box, more specific layout components are included, like:

- Hero
- Frame
- Main
- Card
- Sidebar

### Controls

Control components are stylized and have specific micro-interactions defined by Sys. For example, `Button` automatically converts icon children into spinners while loading and alters its internal padding and size based on whether its contents include an icon or not. All of this is handled automatically.

Most controls are built on top of Radix primitives and use the same prop contract.

Some important controls examples:

- Button
- Link
- Switch
- Checkbox

### Icons

Our Sys icons extend the Lucide icon set and add a few custom glyphs. You don't import individual icons, just import the `Icon` component and use `name` to select an icon (with typing!)

You can also render any custom visual as a semantic icon, which applies size and behavior to your own element. Instead of `name`, supply children to `Icon` to do this.
