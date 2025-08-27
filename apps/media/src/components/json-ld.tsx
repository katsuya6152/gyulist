interface WebsiteJsonLdProps {
	url: string;
	name: string;
	description: string;
}

export function WebsiteJsonLd({ url, name, description }: WebsiteJsonLdProps) {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name,
		description,
		url,
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${url}/search?q={search_term_string}`
			},
			"query-input": "required name=search_term_string"
		},
		publisher: {
			"@type": "Organization",
			name: "Gyulist",
			url: "https://gyulist.jp",
			logo: {
				"@type": "ImageObject",
				url: `${url}/images/logo.png`
			}
		}
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}

interface ArticleJsonLdProps {
	title: string;
	description: string;
	url: string;
	publishedAt: string;
	updatedAt?: string;
	author: string;
	category: string;
	tags?: string[];
	image?: string;
}

export function ArticleJsonLd({
	title,
	description,
	url,
	publishedAt,
	updatedAt,
	author,
	category,
	tags,
	image
}: ArticleJsonLdProps) {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: title,
		description,
		url,
		datePublished: publishedAt,
		dateModified: updatedAt || publishedAt,
		author: {
			"@type": "Person",
			name: author
		},
		publisher: {
			"@type": "Organization",
			name: "Gyulist",
			url: "https://gyulist.jp",
			logo: {
				"@type": "ImageObject",
				url: `${new URL(url).origin}/images/logo.png`
			}
		},
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": url
		},
		...(image && {
			image: {
				"@type": "ImageObject",
				url: image,
				width: 1200,
				height: 630
			}
		}),
		articleSection: category,
		...(tags && { keywords: tags.join(", ") })
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}

interface BreadcrumbJsonLdProps {
	items: Array<{
		name: string;
		url?: string;
	}>;
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			...(item.url && { item: item.url })
		}))
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}
