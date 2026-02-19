-- Migration: Add new tables for Knoux Nexar Pro features
-- Generated: 2025-02-18

-- License Keys table
CREATE TABLE IF NOT EXISTS `licenseKeys` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `key` VARCHAR(64) NOT NULL UNIQUE,
  `plan` ENUM('free', 'pro', 'premium') NOT NULL DEFAULT 'pro',
  `status` ENUM('active', 'used', 'expired', 'revoked') NOT NULL DEFAULT 'active',
  `maxDevices` INT NOT NULL DEFAULT 1,
  `usedDevices` INT NOT NULL DEFAULT 0,
  `expiresAt` TIMESTAMP NULL,
  `activatedAt` TIMESTAMP NULL,
  `notes` TEXT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT NOW(),
  `updatedAt` TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Feature Flags table
CREATE TABLE IF NOT EXISTS `featureFlags` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(128) NOT NULL UNIQUE,
  `enabled` INT NOT NULL DEFAULT 1,
  `description` TEXT NULL,
  `rolloutPercentage` INT NOT NULL DEFAULT 100,
  `createdAt` TIMESTAMP NOT NULL DEFAULT NOW(),
  `updatedAt` TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs table
CREATE TABLE IF NOT EXISTS `auditLogs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NULL,
  `action` VARCHAR(128) NOT NULL,
  `resource` VARCHAR(128) NULL,
  `resourceId` INT NULL,
  `details` TEXT NULL,
  `ipAddress` VARCHAR(64) NULL,
  `userAgent` TEXT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default feature flags
INSERT IGNORE INTO `featureFlags` (`name`, `enabled`, `description`, `rolloutPercentage`) VALUES
  ('screen_recording_4k', 1, 'Enable 4K screen recording', 100),
  ('ai_subtitles', 1, 'Enable AI subtitle generation', 100),
  ('live_streaming', 1, 'Enable live streaming feature', 100),
  ('multi_camera', 1, 'Enable multi-camera recording', 100),
  ('cloud_sync', 1, 'Enable cloud sync feature', 100),
  ('referral_program', 1, 'Enable referral rewards program', 100),
  ('beta_features', 0, 'Enable beta features for testers', 10),
  ('admin_dashboard', 1, 'Enable admin dashboard access', 100);
