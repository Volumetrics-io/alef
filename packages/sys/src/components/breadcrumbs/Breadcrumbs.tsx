import { withClassName } from '../../hocs/withClassName';
import { withProps } from '../../hocs/withProps';
import { Box } from '../box/Box';
import { Button } from '../button/Button';
import { Text } from '../text/Text';
import cls from './Breadcrumbs.module.css';

export const BreadcrumbsRoot = withClassName(
	withProps(Box, {
		gapped: true,
		align: 'end',
	}),
	cls.root
);

export const BreadcrumbsTrigger = withClassName(withProps(Button, { color: 'ghost' }), cls.item);

export const BreadcrumbsLabel = withClassName(Text, cls.item, cls.label);

export const Breadcrumbs = Object.assign(BreadcrumbsRoot, {
	Trigger: BreadcrumbsTrigger,
	Label: BreadcrumbsLabel,
});
