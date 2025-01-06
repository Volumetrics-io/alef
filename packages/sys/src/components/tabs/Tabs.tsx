import * as RadixTabs from '@radix-ui/react-tabs';
import { withClassName } from '../../hocs/withClassName.js';
import cls from './Tabs.module.css';

export const TabsRoot = withClassName(RadixTabs.Root, cls.root);
export const TabsTrigger = withClassName(RadixTabs.Trigger, cls.trigger);
export const TabsList = withClassName(RadixTabs.List, cls.list);
export const TabsContent = withClassName(RadixTabs.Content, cls.content);

export const Tabs = Object.assign(TabsRoot, {
	Trigger: TabsTrigger,
	List: TabsList,
	Content: TabsContent,
});
