CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"email" varchar(255) NOT NULL UNIQUE,
	"google_id" varchar(255) NOT NULL UNIQUE,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login" timestamp DEFAULT now() NOT NULL
);
