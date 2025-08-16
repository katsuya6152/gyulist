import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const cardVariants = cva(
	"bg-card text-card-foreground flex flex-col gap-3 rounded-xl border shadow-sm transition-all duration-200",
	{
		variants: {
			variant: {
				default: "py-3",
				interactive: "py-6 hover-lift cursor-pointer hover:border-primary/20",
				gradient: "py-6 bg-gradient-card hover-lift",
				elevated: "py-6 shadow-md hover:shadow-xl hover-lift"
			},
			animation: {
				none: "",
				fade: "animate-fade-in",
				fadeUp: "animate-fade-in-up",
				scale: "animate-scale-in",
				bounce: "animate-bounce-in"
			}
		},
		defaultVariants: {
			variant: "default",
			animation: "none"
		}
	}
);

function Card({
	className,
	variant,
	animation,
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
	return (
		<div
			data-slot="card"
			className={cn(cardVariants({ variant, animation }), className)}
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				"@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
				className
			)}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-title"
			className={cn(
				"leading-none font-semibold transition-colors duration-200",
				className
			)}
			{...props}
		/>
	);
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-description"
			className={cn(
				"text-muted-foreground text-sm transition-colors duration-200",
				className
			)}
			{...props}
		/>
	);
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-action"
			className={cn(
				"col-start-2 row-span-2 row-start-1 self-start justify-self-end transition-all duration-200",
				className
			)}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-content"
			className={cn("px-6 transition-all duration-200", className)}
			{...props}
		/>
	);
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-footer"
			className={cn(
				"flex items-center px-6 [.border-t]:pt-6 transition-all duration-200",
				className
			)}
			{...props}
		/>
	);
}

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardAction,
	CardDescription,
	CardContent,
	cardVariants
};
