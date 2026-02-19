import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Better Auth-ready user table.
 * Keep auth-provider-specific fields as nullable to support social/email providers.
 */
export const userRoleEnum = pgEnum("user_role", ["salesman", "admin"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    passwordHash: text("password_hash"),
    role: userRoleEnum("role").default("salesman").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  }),
);

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "starter",
  "growth",
  "pro",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "unpaid",
]);

/**
 * Salesman-facing profile and public landing page details.
 * Public route: /[salesmanSlug]
 */
export const salesmanProfiles = pgTable(
  "salesman_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    salesmanSlug: varchar("salesman_slug", { length: 120 }).notNull(),
    firstName: varchar("first_name", { length: 120 }).notNull(),
    lastName: varchar("last_name", { length: 120 }).notNull(),
    profilePhotoUrl: text("profile_photo_url"),
    about: text("about"),
    dealershipName: varchar("dealership_name", { length: 180 }).notNull(),
    phone: varchar("phone", { length: 30 }).notNull(),
    whatsappNumber: varchar("whatsapp_number", { length: 30 }).notNull(),
    whatsappDefaultMessage: text("whatsapp_default_message")
      .default("Hi, I came from your ad and I want to learn more about available cars.")
      .notNull(),
    adCampaignMeta: jsonb("ad_campaign_meta")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userUniqueIdx: uniqueIndex("salesman_profiles_user_id_idx").on(table.userId),
    slugUniqueIdx: uniqueIndex("salesman_profiles_slug_idx").on(table.salesmanSlug),
  }),
);

/**
 * Stripe-backed subscription state.
 */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).notNull(),
    stripePriceId: varchar("stripe_price_id", { length: 255 }).notNull(),
    tier: subscriptionTierEnum("tier").notNull(),
    status: subscriptionStatusEnum("status").default("incomplete").notNull(),
    adBudgetMonthly: numeric("ad_budget_monthly", { precision: 10, scale: 2 })
      .default("0.00")
      .notNull(),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    stripeSubUniqueIdx: uniqueIndex("subscriptions_stripe_subscription_id_idx").on(
      table.stripeSubscriptionId,
    ),
  }),
);

/**
 * Optional but recommended lead capture from public pages.
 */
export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "closed_won",
  "closed_lost",
]);

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  salesmanProfileId: uuid("salesman_profile_id")
    .notNull()
    .references(() => salesmanProfiles.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 180 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 30 }),
  interestedModel: varchar("interested_model", { length: 160 }),
  message: text("message"),
  status: leadStatusEnum("status").default("new").notNull(),
  source: varchar("source", { length: 120 }).default("landing_page").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(salesmanProfiles, {
    fields: [users.id],
    references: [salesmanProfiles.userId],
  }),
  subscriptions: many(subscriptions),
}));

export const salesmanProfilesRelations = relations(salesmanProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [salesmanProfiles.userId],
    references: [users.id],
  }),
  leads: many(leads),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  salesmanProfile: one(salesmanProfiles, {
    fields: [leads.salesmanProfileId],
    references: [salesmanProfiles.id],
  }),
}));

// ---------- Zod Schemas ----------

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email().max(255),
});
export const selectUserSchema = createSelectSchema(users);

export const insertSalesmanProfileSchema = createInsertSchema(salesmanProfiles, {
  salesmanSlug: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
  firstName: z.string().min(1).max(120),
  lastName: z.string().min(1).max(120),
  dealershipName: z.string().min(2).max(180),
  phone: z.string().min(8).max(30),
  whatsappNumber: z.string().min(8).max(30),
  about: z.string().max(1200).optional(),
});
export const selectSalesmanProfileSchema = createSelectSchema(salesmanProfiles);

export const insertSubscriptionSchema = createInsertSchema(subscriptions, {
  stripeCustomerId: z.string().min(3).max(255),
  stripeSubscriptionId: z.string().min(3).max(255),
  stripePriceId: z.string().min(3).max(255),
});
export const selectSubscriptionSchema = createSelectSchema(subscriptions);

export const insertLeadSchema = createInsertSchema(leads, {
  fullName: z.string().min(2).max(180),
  email: z.string().email().max(255).optional(),
  phone: z.string().min(8).max(30).optional(),
  interestedModel: z.string().max(160).optional(),
  message: z.string().max(2000).optional(),
}).superRefine((data, ctx) => {
  if (!data.email && !data.phone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Either email or phone is required so the salesman can follow up.",
      path: ["email"],
    });
  }
});
export const selectLeadSchema = createSelectSchema(leads);

// ---------- Inferred Types ----------

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type SalesmanProfile = typeof salesmanProfiles.$inferSelect;
export type NewSalesmanProfile = typeof salesmanProfiles.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
