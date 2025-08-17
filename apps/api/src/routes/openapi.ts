import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { alertsResponseSchema } from "../contexts/alerts/domain/codecs/output";
import {
	CompleteSchema,
	LoginSchema,
	RegisterSchema,
	VerifySchema
} from "../contexts/auth/domain/codecs/input";
import {
	completeResponseSchema,
	loginResponseSchema,
	registerResponseSchema,
	verifyResponseSchema
} from "../contexts/auth/domain/codecs/output";
import { updateThemeResponseSchema } from "../contexts/auth/domain/codecs/output";
import {
	UpdateThemeSchema,
	UserIdParamSchema
} from "../contexts/auth/domain/codecs/user";
import {
	createCattleSchema,
	searchCattleSchema,
	updateCattleSchema,
	updateStatusSchema
} from "../contexts/cattle/domain/codecs/input";
import {
	cattleListResponseSchema,
	cattleResponseSchema,
	cattleStatusCountsResponseSchema,
	cattleStatusUpdateResponseSchema
} from "../contexts/cattle/domain/codecs/output";
import {
	createEventSchema,
	searchEventSchema,
	updateEventSchema
} from "../contexts/events/domain/codecs/input";
import {
	eventResponseSchema,
	eventsOfCattleResponseSchema,
	eventsSearchResponseSchema
} from "../contexts/events/domain/codecs/output";
import {
	breedingKpiDeltaSchema,
	breedingKpiSchema,
	breedingKpiTrendsSchema
} from "../contexts/kpi/domain/codecs/output";
import { preRegisterSchema } from "../contexts/registration/domain/codecs/input";
import { registrationQuerySchema } from "../contexts/registration/domain/codecs/input";
import { preRegisterSuccessSchema } from "../contexts/registration/domain/codecs/output";
import { registrationsListResponseSchema } from "../contexts/registration/domain/codecs/output";

// Create an OpenAPI-dedicated app mounted under /api-docs
// NOTE: Paths in the spec include /api/v1/... to reflect real API routes.
const app = new OpenAPIHono();
// Register Security Schemes (components)
app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
	type: "http",
	scheme: "bearer",
	bearerFormat: "JWT"
});
app.openAPIRegistry.registerComponent("securitySchemes", "basicAuth", {
	type: "http",
	scheme: "basic"
});

// Components (Security Schemes)
const bearerAuth = {
	type: "http",
	scheme: "bearer",
	bearerFormat: "JWT"
} as const;
const basicAuth = {
	type: "http",
	scheme: "basic"
} as const;

// Example payloads for handler return typing
const exampleCattle: z.infer<typeof cattleResponseSchema> = {
	cattleId: 1,
	ownerUserId: 1,
	identificationNumber: 1001,
	earTagNumber: 2001,
	name: "Sample",
	gender: null,
	birthday: null,
	growthStage: null,
	age: null,
	monthsOld: null,
	daysOld: null,
	breed: null,
	status: null,
	producerName: null,
	barn: null,
	breedingValue: null,
	notes: null,
	weight: null,
	score: null,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	events: [],
	bloodline: null,
	motherInfo: null,
	breedingStatus: null,
	breedingSummary: null
};

const exampleEvent: z.infer<typeof eventResponseSchema> = {
	eventId: 1,
	cattleId: 1,
	eventType: "CALVING",
	eventDatetime: new Date().toISOString(),
	notes: null
};

// Health
app.openapi(
	createRoute({
		method: "get",
		path: "/api/v1/health",
		tags: ["ヘルスチェック"],
		summary: "ヘルスチェック",
		description: "APIの稼働状態を返します。",
		responses: {
			200: {
				description: "Health Check",
				content: {
					"application/json": {
						schema: z
							.object({ status: z.string(), timestamp: z.string() })
							.openapi("HealthResponse")
					}
				}
			}
		}
	}),
	(c) => c.json({ status: "ok", timestamp: new Date().toISOString() })
);

// Auth
app.openapi(
	createRoute({
		method: "post",
		path: "/api/v1/auth/register",
		tags: ["認証"],
		summary: "仮登録",
		description: "メールを受け取り、仮登録フローを開始します。",
		request: {
			body: { content: { "application/json": { schema: RegisterSchema } } }
		},
		responses: {
			200: {
				description: "Register",
				content: { "application/json": { schema: registerResponseSchema } }
			}
		}
	}),
	(c) => c.json({ message: "ok", success: true as const })
);
app.openapi(
	createRoute({
		method: "post",
		path: "/api/v1/auth/verify",
		tags: ["認証"],
		summary: "トークン検証",
		description: "メールで送付されたトークンを検証し、状態を返します。",
		request: {
			body: { content: { "application/json": { schema: VerifySchema } } }
		},
		responses: {
			200: {
				description: "Verify",
				content: { "application/json": { schema: verifyResponseSchema } }
			}
		}
	}),
	(c) => c.json({ message: "verified", success: true as const })
);
app.openapi(
	createRoute({
		method: "post",
		path: "/api/v1/auth/complete",
		tags: ["認証"],
		summary: "本登録",
		description: "トークン・氏名・パスワードで本登録を完了します。",
		request: {
			body: { content: { "application/json": { schema: CompleteSchema } } }
		},
		responses: {
			200: {
				description: "Complete",
				content: { "application/json": { schema: completeResponseSchema } }
			}
		}
	}),
	(c) => c.json({ message: "completed", success: true as const })
);
app.openapi(
	createRoute({
		method: "post",
		path: "/api/v1/auth/login",
		tags: ["認証"],
		summary: "ログイン",
		description: "ユーザーを認証してJWTを返します。",
		request: {
			body: { content: { "application/json": { schema: LoginSchema } } }
		},
		responses: {
			200: {
				description: "Login",
				content: { "application/json": { schema: loginResponseSchema } }
			}
		}
	}),
	(c) => c.json({ token: "jwt.example.token" })
);

// Alerts (JWT)
app.openapi(
	createRoute({
		method: "get",
		path: "/api/v1/alerts",
		tags: ["アラート"],
		summary: "アラート一覧",
		description: "ホーム画面で使用するアラート一覧を返します。",
		security: [{ bearerAuth: [] }],
		responses: {
			200: {
				description: "List alerts",
				content: {
					"application/json": {
						schema: z
							.object({ data: alertsResponseSchema })
							.openapi("AlertsListEnvelope")
					}
				}
			}
		}
	}),
	(c) => c.json({ data: { results: [] } })
);

// Cattle (JWT)
app.openapi(
	createRoute({
		method: "get",
		path: "/api/v1/cattle",
		tags: ["牛（Cattle）"],
		summary: "牛の検索・一覧",
		description: "フィルタとカーソルで牛を検索・一覧します。",
		security: [{ bearerAuth: [] }],
		request: { query: searchCattleSchema },
		responses: {
			200: {
				description: "Search cattle",
				content: {
					"application/json": {
						schema: z
							.object({ data: cattleListResponseSchema })
							.openapi("CattleListEnvelope")
					}
				}
			}
		}
	}),
	(c) => c.json({ data: { results: [], next_cursor: null, has_next: false } })
);
app.openapi(
	createRoute({
		method: "get",
		path: "/api/v1/cattle/status-counts",
		tags: ["牛（Cattle）"],
		summary: "ステータス別件数",
		description: "ユーザーごとのステータス別頭数を返します。",
		security: [{ bearerAuth: [] }],
		responses: {
			200: {
				description: "Status counts",
				content: {
					"application/json": {
						schema: z
							.object({ data: cattleStatusCountsResponseSchema })
							.openapi("CattleStatusCountsEnvelope")
					}
				}
			}
		}
	}),
	(c) => c.json({ data: { counts: {} } })
);
app.openapi(
	createRoute({
		method: "get",
		path: "/api/v1/cattle/{id}",
		tags: ["牛（Cattle）"],
		summary: "牛の詳細取得",
		description: "関連情報を含む牛の詳細を返します。",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({ id: z.string().openapi({ example: "123" }) })
		},
		responses: {
			200: {
				description: "Cattle detail",
				content: {
					"application/json": {
						schema: z
							.object({ data: cattleResponseSchema })
							.openapi("CattleEnvelope")
					}
				}
			}
		}
	}),
	(c) => c.json({ data: { ...exampleCattle } })
);
app.openapi(
	createRoute({
		method: "post",
		path: "/api/v1/cattle",
		tags: ["牛（Cattle）"],
		summary: "牛の作成",
		description: "新しい牛を作成します。",
		security: [{ bearerAuth: [] }],
		request: {
			body: { content: { "application/json": { schema: createCattleSchema } } }
		},
		responses: {
			201: {
				description: "Create cattle",
				content: {
					"application/json": {
						schema: z
							.object({ data: cattleResponseSchema })
							.openapi("CattleCreatedEnvelope")
					}
				}
			}
		}
	}),
	(c) => c.json({ data: { ...exampleCattle } }, 201)
);
app.openapi(
	createRoute({
		method: "patch",
		path: "/api/v1/cattle/{id}",
		tags: ["牛（Cattle）"],
		summary: "牛の更新",
		description: "牛の属性および関連情報を更新します。",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({ id: z.string().openapi({ example: "123" }) }),
			body: { content: { "application/json": { schema: updateCattleSchema } } }
		},
		responses: {
			200: {
				description: "Update cattle",
				content: {
					"application/json": {
						schema: z.object({ data: cattleResponseSchema })
					}
				}
			}
		}
	}),
	(c) => c.json({ data: { ...exampleCattle } })
);
app.openapi(
	createRoute({
		method: "patch",
		path: "/api/v1/cattle/{id}/status",
		tags: ["牛（Cattle）"],
		summary: "ステータス更新",
		description: "牛のステータスを更新します。",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({ id: z.string().openapi({ example: "123" }) }),
			body: { content: { "application/json": { schema: updateStatusSchema } } }
		},
		responses: {
			200: {
				description: "Update cattle status",
				content: {
					"application/json": {
						schema: z.object({ data: cattleStatusUpdateResponseSchema })
					}
				}
			}
		}
	}),
	(c) => c.json({ data: { ...exampleCattle, status: "HEALTHY" as const } })
);
app.openapi(
	createRoute({
		method: "delete",
		path: "/api/v1/cattle/{id}",
		tags: ["牛（Cattle）"],
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({ id: z.string().openapi({ example: "123" }) })
		},
		responses: { 204: { description: "Deleted" } }
	}),
	(c) => c.body(null, 204)
);

// Events (JWT)
app.openapi(
	createRoute({
		method: "get",
		path: "/api/v1/events",
		tags: ["イベント"],
		summary: "イベント検索・一覧",
		description: "フィルタでイベントを検索・一覧します。",
		security: [{ bearerAuth: [] }],
		request: { query: searchEventSchema },
		responses: {
			200: {
				description: "Search events",
				content: {
					"application/json": {
						schema: z.object({ data: eventsSearchResponseSchema })
					}
				}
			}
		}
	}),
	(c) => c.json({ data: { results: [], hasNext: false, nextCursor: null } })
);
app.openapi(
	createRoute({
		method: "get",
		path: "/api/v1/events/cattle/{cattleId}",
		tags: ["イベント"],
		summary: "牛のイベント一覧",
		description: "特定の牛に紐づくイベント一覧を返します。",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({ cattleId: z.string().openapi({ example: "1" }) })
		},
		responses: {
			200: {
				description: "Events of a cattle",
				content: {
					"application/json": {
						schema: z.object({ data: eventsOfCattleResponseSchema })
					}
				}
			}
		}
	}),
	(c) => c.json({ data: { results: [] } })
);
app.openapi(
	createRoute({
		method: "get",
		path: "/api/v1/events/{id}",
		tags: ["イベント"],
		summary: "イベント詳細取得",
		description: "指定IDのイベントを返します。",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({ id: z.string().openapi({ example: "10" }) })
		},
		responses: {
			200: {
				description: "Event detail",
				content: {
					"application/json": {
						schema: z.object({ data: eventResponseSchema })
					}
				}
			}
		}
	}),
	(c) => c.json({ data: { ...exampleEvent } })
);
app.openapi(
	createRoute({
		method: "post",
		path: "/api/v1/events",
		tags: ["イベント"],
		summary: "イベント作成",
		description: "新しいイベントを作成します。",
		security: [{ bearerAuth: [] }],
		request: {
			body: { content: { "application/json": { schema: createEventSchema } } }
		},
		responses: {
			201: {
				description: "Create event",
				content: {
					"application/json": {
						schema: z.object({ data: eventResponseSchema })
					}
				}
			}
		}
	}),
	(c) => c.json({ data: { ...exampleEvent } }, 201)
);
app.openapi(
	createRoute({
		method: "patch",
		path: "/api/v1/events/{id}",
		tags: ["イベント"],
		summary: "イベント更新",
		description: "既存のイベントを更新します。",
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({ id: z.string().openapi({ example: "10" }) }),
			body: { content: { "application/json": { schema: updateEventSchema } } }
		},
		responses: {
			200: {
				description: "Update event",
				content: {
					"application/json": {
						schema: z.object({ data: eventResponseSchema })
					}
				}
			}
		}
	}),
	(c) => c.json({ data: { ...exampleEvent, notes: "updated" } })
);
app.openapi(
	createRoute({
		method: "delete",
		path: "/api/v1/events/{id}",
		tags: ["イベント"],
		security: [{ bearerAuth: [] }],
		request: {
			params: z.object({ id: z.string().openapi({ example: "10" }) })
		},
		responses: { 204: { description: "Deleted" } }
	}),
	(c) => c.body(null, 204)
);

// KPI (JWT)
app.openapi(
	createRoute({
		method: "get",
		path: "/api/v1/kpi/breeding",
		tags: ["KPI"],
		summary: "繁殖KPI",
		description: "繁殖に関する集計指標を返します。",
		security: [{ bearerAuth: [] }],
		request: {
			query: z.object({
				from: z.string().datetime().optional(),
				to: z.string().datetime().optional()
			})
		},
		responses: {
			200: {
				description: "Breeding KPI",
				content: {
					"application/json": { schema: z.object({ data: breedingKpiSchema }) }
				}
			}
		}
	}),
	(c) =>
		c.json({
			data: {
				metrics: {
					conceptionRate: null,
					avgDaysOpen: null,
					avgCalvingInterval: null,
					aiPerConception: null
				},
				counts: {}
			}
		})
);
app.openapi(
	createRoute({
		method: "get",
		path: "/api/v1/kpi/breeding/delta",
		tags: ["KPI"],
		summary: "繁殖KPIの差分",
		description: "前期間に対する差分を返します。",
		security: [{ bearerAuth: [] }],
		request: { query: z.object({ month: z.string().optional() }) },
		responses: {
			200: {
				description: "Breeding KPI delta",
				content: {
					"application/json": {
						schema: z.object({ data: breedingKpiDeltaSchema })
					}
				}
			}
		}
	}),
	(c) =>
		c.json({
			data: {
				month: null,
				delta: {
					conceptionRate: null,
					avgDaysOpen: null,
					avgCalvingInterval: null,
					aiPerConception: null
				}
			}
		})
);
app.openapi(
	createRoute({
		method: "get",
		path: "/api/v1/kpi/breeding/trends",
		tags: ["KPI"],
		summary: "繁殖KPIの推移",
		description: "KPIと差分の時系列を返します。",
		security: [{ bearerAuth: [] }],
		request: {
			query: z.object({
				from: z.string().optional(),
				to: z.string().optional(),
				months: z.coerce.number().optional()
			})
		},
		responses: {
			200: {
				description: "Breeding KPI trends",
				content: {
					"application/json": {
						schema: z.object({ data: breedingKpiTrendsSchema })
					}
				}
			}
		}
	}),
	(c) => c.json({ data: { series: [], deltas: [] } })
);

// Admin (BasicAuth)
app.openapi(
	createRoute({
		method: "get",
		path: "/api/v1/admin/registrations",
		tags: ["管理（Admin）"],
		summary: "登録一覧",
		description: "管理者向けに登録情報を一覧します。",
		security: [{ basicAuth: [] }],
		request: { query: registrationQuerySchema },
		responses: {
			200: {
				description: "Registration list",
				content: {
					"application/json": {
						schema: z.object({ data: registrationsListResponseSchema })
					}
				}
			}
		}
	}),
	(c) => c.json({ data: { items: [], total: 0 } })
);
app.openapi(
	createRoute({
		method: "get",
		path: "/api/v1/admin/registrations.csv",
		tags: ["管理（Admin）"],
		security: [{ basicAuth: [] }],
		responses: {
			200: {
				description: "Registration list CSV",
				content: {
					"text/csv": {
						schema: z.string().openapi({ example: "id,email,..." })
					}
				}
			}
		}
	}),
	(c) => c.text("", 200)
);

// Pre-Register (No auth)
app.openapi(
	createRoute({
		method: "post",
		path: "/api/v1/pre-register",
		tags: ["事前登録"],
		summary: "事前登録",
		description: "ボット対策付きで事前登録を受け付けます。",
		request: {
			body: { content: { "application/json": { schema: preRegisterSchema } } }
		},
		responses: {
			200: {
				description: "Pre-register",
				content: {
					"application/json": {
						schema: z.object({ data: preRegisterSuccessSchema })
					}
				}
			}
		}
	}),
	(c) => c.json({ data: { ok: true as const } })
);

// Document endpoint & Swagger UI
app.doc("/openapi.json", {
	openapi: "3.1.0",
	info: { title: "Gyulist API", version: "1.0.0" },
	servers: [{ url: "/" }]
});

app.get("/docs", swaggerUI({ url: "./openapi.json" }));

export default app;
