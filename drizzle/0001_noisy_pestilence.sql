CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`value` decimal(10,2),
	`meta` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `app_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`welcomeMessage` text,
	`currency` varchar(8) DEFAULT 'KZT',
	`language` varchar(8) DEFAULT 'ru',
	`adminTelegramId` bigint,
	`notifyOnOrder` boolean DEFAULT true,
	`extraSettings` json,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `app_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `app_settings_botId_unique` UNIQUE(`botId`)
);
--> statement-breakpoint
CREATE TABLE `bot_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`telegramId` bigint NOT NULL,
	`username` varchar(64),
	`displayName` varchar(128),
	`contact` varchar(64),
	`countryCode` varchar(4),
	`totalSpent` decimal(10,2) DEFAULT '0',
	`ordersCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bot_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`botToken` varchar(128) NOT NULL,
	`botName` varchar(128) NOT NULL,
	`botUsername` varchar(64),
	`status` enum('active','paused','deleted') NOT NULL DEFAULT 'active',
	`moduleShop` boolean NOT NULL DEFAULT false,
	`moduleCourses` boolean NOT NULL DEFAULT false,
	`moduleBroadcasts` boolean NOT NULL DEFAULT false,
	`moduleInstagram` boolean NOT NULL DEFAULT false,
	`moduleAiAssistant` boolean NOT NULL DEFAULT false,
	`moduleReferral` boolean NOT NULL DEFAULT false,
	`moduleCoupons` boolean NOT NULL DEFAULT false,
	`moduleMultiCurrency` boolean NOT NULL DEFAULT false,
	`moduleCrmIntegration` boolean NOT NULL DEFAULT false,
	`webhookUrl` text,
	`webhookSetAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bots_id` PRIMARY KEY(`id`),
	CONSTRAINT `bots_botToken_unique` UNIQUE(`botToken`)
);
--> statement-breakpoint
CREATE TABLE `broadcast_recipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`broadcastId` int NOT NULL,
	`botId` int NOT NULL,
	`telegramId` bigint NOT NULL,
	`recipientStatus` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`errorMessage` text,
	CONSTRAINT `broadcast_recipients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `broadcasts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`message` text NOT NULL,
	`imageUrl` text,
	`broadcastStatus` enum('draft','scheduled','sending','sent','failed') NOT NULL DEFAULT 'draft',
	`scheduledAt` timestamp,
	`sentAt` timestamp,
	`totalRecipients` int DEFAULT 0,
	`sentCount` int DEFAULT 0,
	`failedCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `broadcasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`emoji` varchar(8),
	`sortOrder` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ig_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`igAccountId` varchar(64) NOT NULL,
	`igUsername` varchar(64) NOT NULL,
	`accessToken` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`connectedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ig_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ig_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`igAccountId` int NOT NULL,
	`postId` varchar(64),
	`keyword` varchar(128) NOT NULL,
	`dmMessage` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`triggeredCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ig_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`orderId` int NOT NULL,
	`productId` int,
	`productName` varchar(256) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`botUserId` int,
	`telegramId` bigint,
	`orderStatus` enum('pending','paid','shipped','completed','cancelled') NOT NULL DEFAULT 'pending',
	`totalAmount` decimal(10,2) NOT NULL,
	`currency` varchar(8) DEFAULT 'KZT',
	`paymentMethod` varchar(64),
	`paymentId` varchar(128),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`name` varchar(64) NOT NULL,
	`pmType` enum('kaspi','card','crypto','cash','other') NOT NULL DEFAULT 'other',
	`details` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platform_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notifType` enum('new_bot','subscription_purchased','payment_failed','system') NOT NULL,
	`title` varchar(256) NOT NULL,
	`body` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`meta` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platform_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`categoryId` int,
	`name` varchar(256) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`currency` varchar(8) DEFAULT 'KZT',
	`imageUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`stock` int,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`ownerId` int NOT NULL,
	`plan` enum('free','basic','pro','enterprise') NOT NULL DEFAULT 'free',
	`subStatus` enum('active','cancelled','expired','pending') NOT NULL DEFAULT 'pending',
	`billingCycle` enum('monthly','annual') NOT NULL DEFAULT 'annual',
	`priceKzt` decimal(10,2),
	`currency` varchar(8) DEFAULT 'KZT',
	`prodamusPaymentId` varchar(128),
	`prodamusOrderId` varchar(128),
	`startsAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
