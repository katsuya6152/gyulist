import type { ComponentProps } from "react";

type MDXComponents = {
	h1?: React.ComponentType<ComponentProps<"h1">>;
	h2?: React.ComponentType<ComponentProps<"h2">>;
	h3?: React.ComponentType<ComponentProps<"h3">>;
	h4?: React.ComponentType<ComponentProps<"h4">>;
	p?: React.ComponentType<ComponentProps<"p">>;
	a?: React.ComponentType<ComponentProps<"a">>;
	blockquote?: React.ComponentType<ComponentProps<"blockquote">>;
	code?: React.ComponentType<ComponentProps<"code">>;
	pre?: React.ComponentType<ComponentProps<"pre">>;
	ul?: React.ComponentType<ComponentProps<"ul">>;
	ol?: React.ComponentType<ComponentProps<"ol">>;
	li?: React.ComponentType<ComponentProps<"li">>;
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		h1: ({ children, ...props }) => (
			<h1
				className="text-4xl font-bold tracking-tight text-foreground mb-6"
				{...props}
			>
				{children}
			</h1>
		),
		h2: ({ children, ...props }) => (
			<h2
				className="text-3xl font-semibold tracking-tight text-foreground mb-4 mt-8"
				{...props}
			>
				{children}
			</h2>
		),
		h3: ({ children, ...props }) => (
			<h3
				className="text-2xl font-semibold tracking-tight text-foreground mb-3 mt-6"
				{...props}
			>
				{children}
			</h3>
		),
		h4: ({ children, ...props }) => (
			<h4
				className="text-xl font-semibold text-foreground mb-2 mt-4"
				{...props}
			>
				{children}
			</h4>
		),
		p: ({ children, ...props }) => (
			<p className="text-base leading-7 text-foreground mb-4" {...props}>
				{children}
			</p>
		),
		a: ({ children, ...props }) => (
			<a
				className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
				{...props}
			>
				{children}
			</a>
		),
		blockquote: ({ children, ...props }) => (
			<blockquote
				className="border-l-4 border-primary/20 pl-4 italic text-muted-foreground bg-muted/30 py-2 my-6"
				{...props}
			>
				{children}
			</blockquote>
		),
		code: ({ children, ...props }) => (
			<code
				className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono"
				{...props}
			>
				{children}
			</code>
		),
		pre: ({ children, ...props }) => (
			<pre
				className="bg-muted p-4 rounded-lg overflow-x-auto text-sm mb-4"
				{...props}
			>
				{children}
			</pre>
		),
		ul: ({ children, ...props }) => (
			<ul className="list-disc list-inside mb-4 pl-6" {...props}>
				{children}
			</ul>
		),
		ol: ({ children, ...props }) => (
			<ol className="list-decimal list-inside mb-4 pl-6" {...props}>
				{children}
			</ol>
		),
		li: ({ children, ...props }) => (
			<li className="mb-1" {...props}>
				{children}
			</li>
		),
		...components
	};
}
